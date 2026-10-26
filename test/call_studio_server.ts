import http from "node:http";
import dgram from "node:dgram";
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import { WebSocketServer, type WebSocket } from "ws";
import {
    Zalo,
    API,
    CallType,
    CallEventType,
    parseIncomingCallEvent,
    parseZRTPPacket,
    buildInitCallResponse,
    type ZaloRtcSession,
    type CallEvent,
} from "../src/index.js";
import { createContext, type ContextSession } from "../src/context.js";
import toughCookie from "tough-cookie";

const PORT = Number(process.env.CALL_STUDIO_PORT ?? 3388);
const CREDENTIALS_PATH = path.resolve(process.cwd(), "test", "credentials.json");
const HTML_PATH = path.resolve(process.cwd(), "test", "call_studio.html");
const PROOF_PATH = path.resolve(process.cwd(), "test", "live_call_proof.json");

let api: API | null = null;
let currentSession: ZaloRtcSession | null = null;
let lastIncomingCallEvent: CallEvent | null = null;
let isLastIncomingSimulated = false;
let simRelaySocket: dgram.Socket | null = null;
let simRelayPort = 0;
let cachedFriends: Array<{ userId: string; displayName: string }> = [];

let rtpIn = 0;
let videoIn = 0;
let rtcpIn = 0;
let rtpOut = 0;
let videoOut = 0;

const sseClients = new Set<http.ServerResponse>();
const mediaWsClients = new Set<WebSocket>();

function broadcastSse(payload: Record<string, unknown>): void {
    const line = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of sseClients) {
        try {
            res.write(line);
        } catch {
            sseClients.delete(res);
        }
    }
}

function broadcastMediaBinary(buf: Buffer): void {
    for (const client of mediaWsClients) {
        if (client.readyState === 1) {
            try {
                client.send(buf, { binary: true });
            } catch {
                mediaWsClients.delete(client);
            }
        }
    }
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => {
            raw += chunk.toString("utf-8");
        });
        req.on("end", () => {
            try {
                resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
            } catch {
                resolve({});
            }
        });
    });
}

function wireSessionEvents(session: ZaloRtcSession): void {
    rtpIn = 0;
    videoIn = 0;
    rtcpIn = 0;
    rtpOut = 0;
    videoOut = 0;

    session.on("state", (state) => {
        console.log(`🔔 [ZaloRtcSession State] -> ${state}`);
        broadcastSse({ type: "state", state });
    });

    let controlPktCount = 0;
    session.on("zrtp_control", (pkt) => {
        controlPktCount++;
        const isImportant =
            pkt.cmd === 11 ||
            pkt.cmd === 12 ||
            pkt.cmd === 3 ||
            (pkt.cmd === 32 && (pkt.flags === 5 || pkt.flags === 6 || pkt.flags === 7 || pkt.flags === 8));
        if (isImportant || controlPktCount === 1 || controlPktCount % 10 === 0) {
            console.log(
                `📦 [UDP ZRTPControl #${controlPktCount}] isResp=${pkt.isResponse} cmd=${pkt.cmd} subCmd=${pkt.flags} err=${pkt.errorCode ?? 0} routingToken=${pkt.routingToken ?? session.getConnectionParams().routingToken}`,
            );
            broadcastSse({
                type: "zrtp_control",
                pkt: {
                    isResponse: pkt.isResponse,
                    cmd: pkt.cmd,
                    subCmd: pkt.flags,
                    headerCallId: pkt.headerCallId,
                    errorCode: pkt.errorCode ?? 0,
                    routingToken: pkt.routingToken,
                    callId: pkt.callId ?? pkt.headerCallId,
                },
            });
        }
    });

    session.on("ended", (reason) => {
        console.log(`📴 [ZaloRtcSession Ended] reason=${reason}`);
        broadcastSse({ type: "ended", reason });
    });

    session.on("call_event", (ev) => {
        console.log(`📲 [Session call_event] act=${ev.act} type=${ev.type}`, JSON.stringify(ev.data));
        broadcastSse({
            type: "call_event",
            act: ev.act,
            callId: ev.data.callId ?? ev.data.call_id,
            callerId: ev.data.callerId ?? ev.data.uidFrom ?? ev.data.uidN,
            raw: ev,
        });
    });

    session.on("audio_frame", (frame) => {
        rtpIn++;
        // Chuyển ngay gói Opus 16kHz về trình duyệt qua WebSocket nhị phân (0x01 + opusPayload) để phát ra Loa
        const out = Buffer.allocUnsafe(1 + frame.payload.length);
        out[0] = 0x01;
        frame.payload.copy(out, 1);
        broadcastMediaBinary(out);

        if (rtpIn === 1 || rtpIn % 20 === 0) {
            console.log(
                `🔊 [Audio Frame In #${rtpIn}] seq=${frame.sequenceNumber} pt=${frame.payloadType} len=${frame.payload.length}B`,
            );
            broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
        }
    });

    session.on("video_frame", (frame) => {
        videoIn++;
        const b0 = frame.payload.length > 0 ? frame.payload[0] : 0;
        const nalType = b0 & 0x1f;
        const fuInfo =
            nalType === 28 && frame.payload.length > 1
                ? ` FU-A(S=${(frame.payload[1] & 0x80) !== 0 ? 1 : 0},E=${(frame.payload[1] & 0x40) !== 0 ? 1 : 0},orig=${frame.payload[1] & 0x1f})`
                : "";
        if (videoIn <= 5 || frame.payloadType === 98 || frame.payloadType === 121 || videoIn % 20 === 0) {
            console.log(
                `📹 [Video H.264 RTP In #${videoIn}] seq=${frame.sequenceNumber} pt=${frame.payloadType} ts=${frame.timestamp} m=${frame.marker} nal=${nalType}${fuInfo} len=${frame.payload.length}B`,
            );
            broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
        }
    });

    let annexBCount = 0;
    session.on("video_annexb_frame", (frame) => {
        annexBCount++;
        const spsProfileHex = frame.sps && frame.sps.length >= 4 ? frame.sps.subarray(1, 4).toString("hex") : "";
        if (annexBCount <= 5 || frame.isKeyframe || annexBCount % 30 === 0) {
            console.log(
                `🎬 [H.264 Annex-B Frame #${annexBCount}] key=${frame.isKeyframe} nals=[${(frame.nalTypes ?? []).join(",")}] spsProfile=${spsProfileHex || "cached"} len=${frame.annexB.length}B`,
            );
        }
        // Chuyển ngay khung hình H.264 Annex-B đã ghép mảnh (0x02 + isKeyframe + annexB) về trình duyệt để giải mã lên màn hình
        const out = Buffer.allocUnsafe(2 + frame.annexB.length);
        out[0] = 0x02;
        out[1] = frame.isKeyframe ? 1 : 0;
        frame.annexB.copy(out, 2);
        broadcastMediaBinary(out);
    });

    session.on("media_state_change", (mediaState) => {
        console.log(`🎛️ [Media State Change]`, JSON.stringify(mediaState));
        broadcastSse({
            type: "media_state_change",
            mediaState,
        });
    });

    session.on("rtcp_packet", (ev) => {
        rtcpIn++;
        if (rtcpIn === 1 || rtcpIn % 10 === 0) {
            console.log(`📊 [RTCP In #${rtcpIn}] isVideo=${ev.isVideo} len=${ev.rtcpPacket.length}B`);
        }
        broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
    });

    session.on("error", (err) => {
        broadcastSse({
            type: "log",
            level: "err",
            message: `Lỗi phiên gọi: ${err instanceof Error ? err.message : String(err)}`,
        });
    });
}

function handleIncomingOrControlCallEvent(ev: CallEvent, isSimulated = false): void {
    const parsedInfo = parseIncomingCallEvent(ev, api?.getContext().uid);
    if (ev.act === "request" || ev.act === "group_request") {
        lastIncomingCallEvent = ev;
        isLastIncomingSimulated = isSimulated;
        console.log(
            `📲 [Incoming Call Ringing] act=${ev.act} callId=${parsedInfo.callId} caller=${parsedInfo.callerName || parsedInfo.callerId} isVideo=${parsedInfo.isVideo} isGroup=${parsedInfo.isGroupCall} rtp=${parsedInfo.rtpAddress}`,
        );
        // Tự động gửi tín hiệu ringRing (407 / 506) để máy đối phương nghe tiếng chuông chờ (nếu là cuộc gọi thật)
        if (!isSimulated && parsedInfo.callId > 0 && parsedInfo.callerId) {
            if (parsedInfo.isGroupCall) {
                void api?.call
                    .ringRingGroupCall(parsedInfo.callId, {
                        hostCall: parsedInfo.hostCall || parsedInfo.callerId,
                        callType: parsedInfo.callType,
                        partners: parsedInfo.partners,
                    })
                    .catch(() => {});
            } else {
                void api?.call.ringRingVoiceCall(parsedInfo.callerId, parsedInfo.callId).catch(() => {});
            }
        }
    } else if (ev.act === "cancel" || ev.act === "end" || ev.act === "reject") {
        if (lastIncomingCallEvent) {
            const lastParsed = parseIncomingCallEvent(lastIncomingCallEvent, api?.getContext().uid);
            if (!parsedInfo.callId || lastParsed.callId === parsedInfo.callId) {
                lastIncomingCallEvent = null;
                isLastIncomingSimulated = false;
            }
        }
    }
    broadcastSse({
        type: "call_event",
        act: ev.act,
        callId: parsedInfo.callId || ev.data.callId || ev.data.call_id,
        callerId: parsedInfo.callerId || ev.data.callerId || ev.data.uidFrom || ev.data.uidN,
        callerName: parsedInfo.callerName,
        callerAvatar: parsedInfo.callerAvatar,
        callType: parsedInfo.callType,
        isVideo: parsedInfo.isVideo,
        isGroupCall: parsedInfo.isGroupCall,
        parsedInfo,
        isSimulated,
        raw: ev,
    });
}

async function ensureSimRelaySocket(): Promise<number> {
    if (simRelaySocket && simRelayPort > 0) return simRelayPort;
    simRelaySocket = dgram.createSocket("udp4");
    simRelaySocket.on("message", (msg, rinfo) => {
        const parsed = parseZRTPPacket(msg);
        if (parsed.family === "control" && !parsed.isResponse && (parsed.cmd === 11 || parsed.cmd === 12)) {
            const resp = buildInitCallResponse({
                callId: parsed.callId ?? parsed.headerCallId,
                isCaller: parsed.cmd === 11,
                errorCode: 0,
                routingToken: 889977,
                sessId: parsed.sessId ?? "sim-session",
            });
            simRelaySocket?.send(resp, rinfo.port, rinfo.address);
        }
    });
    await new Promise<void>((resolve) => {
        simRelaySocket!.bind(0, "127.0.0.1", () => resolve());
    });
    simRelayPort = (simRelaySocket.address() as { port: number }).port;
    return simRelayPort;
}

function createOfflineSimulationApi(): API {
    const ctx = createContext(30, 689) as ContextSession;
    ctx.uid = "687719761480069038";
    ctx.imei = "sim-studio-imei-0001";
    ctx.cookie = new toughCookie.CookieJar();
    ctx.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36";
    ctx.language = "vi";
    ctx.secretKey = Buffer.from("0123456789abcdef0123456789abcdef", "utf-8").toString("base64");
    ctx.settings = {
        features: {
            sharefile: {
                big_file_domain_list: [],
                max_size_share_file_v2: 100,
                max_size_share_file_v3: 100,
                file_upload_show_icon_1GB: true,
                restricted_ext: "",
                next_file_time: 0,
                max_file: 10,
                max_size_photo: 20,
                max_size_share_file: 100,
                max_size_resize_photo: 10,
                max_size_gif: 10,
                max_size_original_photo: 20,
                chunk_size_file: 1024 * 1024,
                restricted_ext_file: [],
            },
            socket: {
                rotate_error_codes: [3000],
                retries: { internal: { max: 3, times: [1000] } },
                debug: { enable: false },
                ping_interval: 20000,
                reset_endpoint: 1,
                queue_ctrl_actionid_map: {
                    "611_0": "",
                    "610_1": "",
                    "610_0": "",
                    "603_0": "",
                    "611_1": "",
                },
                close_and_retry_codes: [1006],
                max_msg_size: 4096,
                enable_ctrl_socket: true,
                reconnect_after_fallback: true,
                enable_chat_socket: true,
                submit_wss_log: false,
                disable_lp: false,
                offline_monitor: { enable: true },
            },
        },
        keepalive: { alway_keepalive: 1, keepalive_duration: 60, time_deactive: 300 },
    };
    ctx.options.logging = false;
    return new API(
        ctx,
        {
            voice_call: ["https://voicecall.zalo.me"],
            chat: ["https://tt-chat1-wpa.chat.zalo.me"],
            group: ["https://tt-group-wpa.chat.zalo.me"],
            profile: ["https://profile.zalo.me"],
        } as unknown as API["zpwServiceMap"],
        ["wss://ws1.chat.zalo.me"],
    );
}

async function initZaloSession(): Promise<void> {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        api = createOfflineSimulationApi();
        console.warn(`⚠️ Không tìm thấy ${CREDENTIALS_PATH} — dùng phiên giả lập cục bộ.`);
        return;
    }

    try {
        const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
        const zalo = new Zalo({ logging: false });
        api = await zalo.login(creds);

        api.listener.on("cipher_key", () => {
            // Mở khoá và kéo hàng đợi sự kiện điều khiển VoIP (cmd 604 / 603) ngay khi WebSocket xác thực
            api?.listener.requestOfflineVoipControls();
        });

        api.listener.on("call_event", (ev) => {
            handleIncomingOrControlCallEvent(ev, false);
        });

        api.listener.start({ retryOnClose: true });

        try {
            const all = await api.getAllFriends();
            cachedFriends = all
                .filter((f) => f.userId && f.userId !== "7613400763746053261")
                .slice(0, 50)
                .map((f) => ({
                    userId: String(f.userId),
                    displayName: String(f.displayName || f.zaloName || f.userId),
                }));
        } catch {
            // Ignore friend list fetch failure
        }
    } catch (err) {
        api = createOfflineSimulationApi();
        console.warn(
            `⚠️ Phiên trong ${CREDENTIALS_PATH} đã hết hạn hoặc không khả dụng (${err instanceof Error ? err.message : String(err)}). Đã kích hoạt chế độ giả lập/kiểm định cục bộ cho Call Studio.`,
        );
    }
}

async function startServer(): Promise<void> {
    await initZaloSession();

    const server = http.createServer(async (req, res) => {
        const u = new URL(req.url ?? "/", `http://localhost:${PORT}`);

        if (req.method === "GET" && u.pathname === "/") {
            const html = fs.readFileSync(HTML_PATH, "utf-8");
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(html);
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/events") {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });
            res.write(
                `data: ${JSON.stringify({ type: "log", level: "ok", message: "Đã kết nối kênh giám sát thời gian thực (SSE)" })}\n\n`,
            );
            sseClients.add(res);
            req.on("close", () => sseClients.delete(res));
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/status") {
            const lastVerifiedProof = fs.existsSync(PROOF_PATH)
                ? JSON.parse(fs.readFileSync(PROOF_PATH, "utf-8"))
                : null;
            const pendingIncomingCall = lastIncomingCallEvent
                ? {
                      parsedInfo: parseIncomingCallEvent(lastIncomingCallEvent, api?.getContext().uid),
                      isSimulated: isLastIncomingSimulated,
                      raw: lastIncomingCallEvent,
                  }
                : null;
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    uid: api?.getContext().uid,
                    voiceCallService: api?.zpwServiceMap.voice_call?.[0],
                    friends: cachedFriends,
                    lastVerifiedProof,
                    pendingIncomingCall,
                }),
            );
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/find-user") {
            const phone = u.searchParams.get("phone") ?? "";
            try {
                const user = await api!.findUser(phone);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, user }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/start") {
            const body = await readJsonBody(req);
            const calleeId = String(body.calleeId ?? "5249661060655759359");
            const callType = (Number(body.callType) as CallType) || CallType.Audio;
            const packetMode = (Number(body.packetMode) === 2 ? 2 : 1) as 1 | 2;
            const enableSrtp = Boolean(body.enableSrtp);
            const signalingOnly = Boolean(body.signalingOnly);
            const offCameraAtStart = Boolean(body.offCameraAtStart);
            const allowVideoUpgrade = body.allowVideoUpgrade !== undefined ? Boolean(body.allowVideoUpgrade) : true;

            try {
                if (currentSession) {
                    await currentSession.endCall("new_call").catch(() => {});
                }

                currentSession = api!.call.createRtcSession({
                    packetMode,
                    enableSrtp,
                    signalingOnly,
                    udpHandshakeTimeoutMs: 2500,
                });
                wireSessionEvents(currentSession);

                const params = await currentSession.startOutgoingCall(calleeId, {
                    callType,
                    signalingOnly,
                    offCameraAtStart,
                    allowVideoUpgrade,
                });

                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, params, mediaState: currentSession.getMediaState() }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/handoff-mobile") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            const body = await readJsonBody(req);
            const routingToken = body.routingToken !== undefined ? Number(body.routingToken) : undefined;
            const handoff = currentSession.handoffUdpToExternal(routingToken);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, handoff, params: currentSession.getConnectionParams() }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/reconnect-udp") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            try {
                const params = await currentSession.reconnectUdp();
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, params, mediaState: currentSession.getMediaState() }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/send-audio") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            const silentOpusFrame = Buffer.from([0xf8, 0xff, 0xfe]);
            for (let i = 0; i < 25; i++) {
                await currentSession.sendAudioFrame(silentOpusFrame);
                rtpOut++;
            }
            const params = currentSession.getConnectionParams();
            broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    sentFrames: 25,
                    rtpAddress: params.rtpAddress,
                }),
            );
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/send-video") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            // Khung H.264 Baseline Profile Level 3.0 (SPS + PPS + IDR) hợp lệ
            const h264AnnexBSample = Buffer.from(
                "000000016742c01ed90f8888840000030004000003003c8f162e480000000168cb83cb20000000016588840033ff",
                "hex",
            );
            for (let i = 0; i < 15; i++) {
                await currentSession.sendH264AnnexBFrame(h264AnnexBSample);
                videoOut++;
            }
            const params = currentSession.getConnectionParams();
            broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    sentFrames: 25,
                    rtpAddress: params.rtpAddress,
                }),
            );
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/simulate-incoming") {
            const body = await readJsonBody(req);
            const rawCallType = Number(body.callType) || CallType.Audio;
            const isGroup = rawCallType === CallType.GroupAudio || rawCallType === CallType.GroupVideo;
            const isVideo = rawCallType === CallType.Video || rawCallType === CallType.GroupVideo;
            const callerId = String(body.callerId ?? "5249661060655759359");
            const callerName = String(body.callerName ?? "Ly Van Bong (0332606964)");
            const relayPort = await ensureSimRelaySocket();
            const simCallId = Math.floor(2000000 + (Date.now() % 900000));
            const simSessId = `${simCallId}-127001-${relayPort}`;

            const simulatedEvent: CallEvent = isGroup
                ? {
                      type: CallEventType.GROUP_REQUEST,
                      act: "group_request",
                      act_type: "voip",
                      data: {
                          id: simCallId,
                          callType: rawCallType,
                          hostCall: String(body.groupId ?? "391827364519283746"),
                          fromId: 1219984015,
                          receiverId: 1772711229,
                          partners: [callerId, String(api?.getContext().uid ?? "")],
                          servers: JSON.stringify([
                              {
                                  rtcp: `127.0.0.1:${relayPort}`,
                                  rtp: `127.0.0.1:${relayPort}`,
                              },
                          ]),
                          ts: String(Date.now()),
                      },
                  }
                : {
                      type: CallEventType.REQUEST,
                      act: "request",
                      act_type: "voip",
                      data: {
                          callType: isVideo ? CallType.Video : CallType.Audio,
                          uidFrom: 1219984015,
                          uidTo: 1772711229,
                          uidN: callerId,
                          Dname: callerName,
                          avatar: "",
                          ts: String(Date.now()),
                          params: JSON.stringify({
                              id: simCallId,
                              rtpIP: `127.0.0.1:${relayPort}`,
                              rtcpIP: `127.0.0.1:${relayPort}`,
                              callSetting: {
                                  offCam: isVideo ? 0 : 1,
                                  video: 1,
                                  audio: 1,
                                  session: simSessId,
                              },
                              codec: [{ dynamicFtype: 112, bitrate: 18000 }],
                          }),
                      },
                  };

            handleIncomingOrControlCallEvent(simulatedEvent, true);
            const parsedInfo = parseIncomingCallEvent(simulatedEvent, api?.getContext().uid);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    isSimulated: true,
                    parsedInfo,
                    event: simulatedEvent,
                }),
            );
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/accept") {
            if (!lastIncomingCallEvent) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Không có sự kiện cuộc gọi đến đang chờ" }));
                return;
            }
            const body = await readJsonBody(req);
            const signalingOnly = Boolean(body.signalingOnly);
            const withVideo = body.withVideo !== undefined ? Boolean(body.withVideo) : undefined;
            const parsedInfo = parseIncomingCallEvent(lastIncomingCallEvent, api?.getContext().uid);
            try {
                if (currentSession) {
                    await currentSession.endCall("accept_incoming").catch(() => {});
                }
                currentSession = api!.call.createRtcSession({
                    packetMode: 1,
                    enableSrtp: false,
                    signalingOnly,
                });
                wireSessionEvents(currentSession);
                const offCameraAtStart = withVideo === false ? true : withVideo === true ? false : !parsedInfo.isVideo;
                const params = parsedInfo.isGroupCall
                    ? await currentSession.acceptIncomingGroupCall(lastIncomingCallEvent, {
                          signalingOnly,
                          skipRingRing: true,
                          skipAnswerSignal: isLastIncomingSimulated,
                      })
                    : await currentSession.acceptIncomingCall(lastIncomingCallEvent, {
                          signalingOnly,
                          allowVideoUpgrade: true,
                          offCameraAtStart,
                          skipRingRing: true,
                          skipAnswerSignal: isLastIncomingSimulated,
                      });
                if (withVideo === true && !parsedInfo.isVideo && !parsedInfo.isGroupCall) {
                    await currentSession.upgradeAudioToVideoCall(1).catch(() => {});
                }
                const acceptedFromSimulated = isLastIncomingSimulated;
                lastIncomingCallEvent = null;
                isLastIncomingSimulated = false;
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        isSimulated: acceptedFromSimulated,
                        params: currentSession.getConnectionParams(),
                        handoff: params.mobileDirectHandoff,
                        mediaState: currentSession.getMediaState(),
                    }),
                );
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/reject") {
            if (!lastIncomingCallEvent) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Không có sự kiện cuộc gọi đến đang chờ" }));
                return;
            }
            try {
                const parsedInfo = parseIncomingCallEvent(lastIncomingCallEvent, api?.getContext().uid);
                const rejectSession = api!.call.createRtcSession({ autoAttachListener: false });
                if (!isLastIncomingSimulated) {
                    await rejectSession.rejectIncomingCall(lastIncomingCallEvent);
                } else {
                    await rejectSession.rejectIncomingCall(lastIncomingCallEvent).catch(() => {});
                }
                lastIncomingCallEvent = null;
                isLastIncomingSimulated = false;
                broadcastSse({
                    type: "call_event",
                    act: "reject",
                    callId: parsedInfo.callId,
                    callerId: parsedInfo.callerId,
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        callerId: parsedInfo.callerId,
                        callId: parsedInfo.callId,
                    }),
                );
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/end") {
            if (currentSession) {
                console.log(
                    `📴 [HTTP /api/call/end] Đang ngắt cuộc gọi callId=${currentSession.getMediaState().callId}...`,
                );
                await currentSession.endCall("local_end").catch(() => {});
                currentSession = null;
            }
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/camera") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            const body = await readJsonBody(req);
            const enabled = Boolean(body.enabled);
            await currentSession.setCameraEnabled(enabled);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, mediaState: currentSession.getMediaState() }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/mic") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            const body = await readJsonBody(req);
            const muted = Boolean(body.muted);
            await currentSession.setMicMuted(muted);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, mediaState: currentSession.getMediaState() }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/hold") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            const body = await readJsonBody(req);
            const isHold = Boolean(body.isHold);
            await currentSession.setHoldState(isHold);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, mediaState: currentSession.getMediaState() }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/call/upgrade-video") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi đang hoạt động" }));
                return;
            }
            const body = await readJsonBody(req);
            const status = (Number(body.status) === 2 ? 2 : 1) as 1 | 2;
            await currentSession.upgradeAudioToVideoCall(status);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    mediaState: currentSession.getMediaState(),
                    params: currentSession.getConnectionParams(),
                }),
            );
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/groups") {
            try {
                const groupsRes = await api!.getAllGroups();
                const gridIds = Object.keys(groupsRes?.gridVerMap ?? {});
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, groupIds: gridIds }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/group-call/start") {
            const body = await readJsonBody(req);
            const groupId = String(body.groupId ?? "").trim();
            const rawPartners = Array.isArray(body.partners)
                ? body.partners.map(String)
                : String(body.partners ?? "5249661060655759359")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
            const callType = Number(body.callType) === CallType.GroupVideo ? CallType.GroupVideo : CallType.GroupAudio;

            try {
                if (currentSession) {
                    await currentSession.endCall("new_group_call").catch(() => {});
                }
                currentSession = api!.call.createRtcSession({
                    packetMode: 1,
                    enableSrtp: false,
                    udpHandshakeTimeoutMs: 2500,
                });
                wireSessionEvents(currentSession);
                const params = await currentSession.startGroupCall(groupId, {
                    partners: rawPartners,
                    callType,
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, params }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/group-call/join") {
            const body = await readJsonBody(req);
            const callId = Number(body.callId ?? 0);
            const hostCall = String(body.hostCall ?? body.groupId ?? "").trim();
            const callType = Number(body.callType) === CallType.GroupVideo ? CallType.GroupVideo : CallType.GroupAudio;
            try {
                if (currentSession) {
                    await currentSession.endCall("join_group_call").catch(() => {});
                }
                currentSession = api!.call.createRtcSession({
                    packetMode: 1,
                    enableSrtp: false,
                });
                wireSessionEvents(currentSession);
                const params = await currentSession.joinActiveGroupCall(callId, {
                    hostCall,
                    groupId: hostCall,
                    callType,
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, params }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                );
            }
            return;
        }

        res.writeHead(404);
        res.end("Not Found");
    });

    const wss = new WebSocketServer({ server, path: "/ws-media" });
    wss.on("connection", (ws) => {
        mediaWsClients.add(ws);
        ws.on("close", () => mediaWsClients.delete(ws));
        ws.on("message", async (raw) => {
            if (!currentSession) return;
            const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw as ArrayBuffer);
            if (buf.length < 1) return;
            const kind = buf[0];
            try {
                if (kind === 0x01 && buf.length > 1) {
                    // Gói âm thanh Opus 20ms @ 16kHz từ Microphone trình duyệt
                    await currentSession.sendAudioFrame(buf.subarray(1));
                    rtpOut++;
                    if (rtpOut === 1 || rtpOut % 25 === 0) {
                        broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
                    }
                } else if (kind === 0x02 && buf.length > 1) {
                    // Khung hình H.264 Annex-B từ Camera trình duyệt
                    await currentSession.sendH264AnnexBFrame(buf.subarray(1));
                    videoOut++;
                    if (videoOut <= 3 || videoOut % 30 === 0) {
                        console.log(`📤 [Video H.264 Out #${videoOut}] len=${buf.length - 1}B`);
                    }
                    if (videoOut === 1 || videoOut % 10 === 0) {
                        broadcastSse({ type: "rtp_stats", rtpIn, videoIn, rtcpIn, rtpOut, videoOut });
                    }
                } else if (kind === 0x03) {
                    // Yêu cầu gửi RTCP PLI để lấy IDR Keyframe từ điện thoại đối phương
                    await currentSession.sendRtcpPli();
                } else if (kind === 0x04 && buf.length > 1) {
                    // Đồng bộ trạng thái Bật/Tắt Camera (cả UDP cmd=32 subCmd=7/8 và HTTP /api/voicecall/conf)
                    await currentSession.setCameraEnabled(buf[1] === 1);
                } else if (kind === 0x05 && buf.length > 1) {
                    // Đồng bộ trạng thái Bật/Tắt Mic (cả UDP cmd=32 subCmd=5/6 và HTTP /api/voicecall/conf)
                    await currentSession.setMicMuted(buf[1] === 1);
                }
            } catch {
                // Ignore transient send error
            }
        });
    });

    server.listen(PORT, () => {
        console.log(`\n========================================================================`);
        console.log(`🚀 ZCA-JS CALL STUDIO ĐÃ CHẠY TẠI: http://localhost:${PORT}`);
        console.log(`👤 Tài khoản đang đăng nhập: ${api?.getContext().uid}`);
        console.log(`🎯 Đối tượng test mặc định: Ly Van Bong (0332606964 — UID: 5249661060655759359)`);
        console.log(`========================================================================\n`);
    });
}

startServer().catch((err) => {
    console.error("❌ Không thể khởi động Call Studio:", err);
    process.exit(1);
});
