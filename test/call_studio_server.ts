import http from "node:http";
import dgram from "node:dgram";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { Buffer } from "node:buffer";
import { WebSocketServer, type WebSocket } from "ws";
import {
    Zalo,
    API,
    CallType,
    CallEventType,
    LoginQRCallbackEventType,
    parseIncomingCallEvent,
    parseZRTPPacket,
    parseRtpPacket,
    buildInitCallResponse,
    buildRequestForwardPacket,
    buildAudioCodecMutePacket,
    buildRtpPacket,
    buildGroupCallVideoRtpHeaderExtension,
    ZRTPForwardSubCommand,
    ZRTPLegacyMediaType,
    type ZaloRtcSession,
    type CallEvent,
} from "../src/index.js";
import { createContext, type ContextSession } from "../src/context.js";
import { encodeAES, decodeAES } from "../src/utils.js";
import toughCookie from "tough-cookie";

const PORT = Number(process.env.CALL_STUDIO_PORT ?? 3388);
const CREDENTIALS_PATH = path.resolve(process.cwd(), "test", "credentials.json");
const HTML_PATH = path.resolve(process.cwd(), "test", "call_studio.html");
const PROOF_PATH = path.resolve(process.cwd(), "test", "live_call_proof.json");

let api: API | null = null;
let isOfflineSimulation = true;
let authErrorReason: string | null = null;
let qrLoginState: {
    status: "idle" | "generating" | "waiting_scan" | "scanned" | "authenticated" | "expired" | "declined" | "error";
    qrImage?: string;
    scannedUser?: { displayName: string; avatar: string };
    error?: string;
} = { status: "idle" };
let qrAbortFn: (() => unknown) | null = null;
let currentSession: ZaloRtcSession | null = null;
let lastIncomingCallEvent: CallEvent | null = null;
let isLastIncomingSimulated = false;
let simRelaySocket: dgram.Socket | null = null;
let simRelayPort = 0;
let cachedFriends: Array<{ userId: string; displayName: string; avatar?: string }> = [];
let cachedGroups: Array<{
    groupId: string;
    name: string;
    avatar: string;
    totalMember: number;
    memberIds: string[];
}> = [];

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

    let videoRtpHeaderLogCount = 0;
    let annexBCount = 0;
    session.on("state", (state) => {
        if (state === "allocating" || state === "ringing") {
            videoRtpHeaderLogCount = 0;
            annexBCount = 0;
        }
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
            pkt.cmd === 1 ||
            pkt.cmd === 50 ||
            pkt.cmd === 51 ||
            (pkt.cmd === 32 &&
                (pkt.flags === 5 ||
                    pkt.flags === 6 ||
                    pkt.flags === 7 ||
                    pkt.flags === 8 ||
                    pkt.flags === 9 ||
                    pkt.flags === 12 ||
                    pkt.flags === 13));
        if (isImportant || controlPktCount === 1 || controlPktCount % 10 === 0) {
            const extraDetail =
                pkt.cmd === 32 && pkt.flags === 12 && pkt.videoQualityConfigs
                    ? ` configs=${JSON.stringify(pkt.videoQualityConfigs)}`
                    : pkt.cmd === 32 && pkt.flags === 13 && pkt.videoQualityRequests
                      ? ` reqs=${JSON.stringify(pkt.videoQualityRequests)}`
                      : "";
            console.log(
                `📦 [UDP ZRTPControl #${controlPktCount}] isResp=${pkt.isResponse} cmd=${pkt.cmd} subCmd=${pkt.flags} fromUid=${pkt.fromUid} err=${pkt.errorCode ?? 0} routingToken=${pkt.routingToken ?? session.getConnectionParams().routingToken}${extraDetail}`,
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

    session.on("rtp_packet", (ev) => {
        if (ev.isVideo && !ev.isFec && videoRtpHeaderLogCount < 3) {
            videoRtpHeaderLogCount++;
            console.log(
                `🔬 [Video RTP Header #${videoRtpHeaderLogCount}] seq=${ev.parsedRtp.sequenceNumber} ssrc=${ev.parsedRtp.ssrc} senderUid=${ev.parsedRtp.senderUid} sfuExt=${JSON.stringify(ev.parsedRtp.sfuExt ?? null)} hdrHex=${ev.parsedRtp.header.toString("hex")}`,
            );
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

    session.on("video_annexb_frame", (frame) => {
        annexBCount++;
        const spsProfileHex = frame.sps && frame.sps.length >= 4 ? frame.sps.subarray(1, 4).toString("hex") : "";
        if (annexBCount <= 5 || frame.isKeyframe || annexBCount % 30 === 0) {
            console.log(
                `🎬 [H.264 Annex-B Frame #${annexBCount}] key=${frame.isKeyframe} nals=[${(frame.nalTypes ?? []).join(",")}] spsProfile=${spsProfileHex || "cached"} len=${frame.annexB.length}B`,
            );
        }
        console.log(
            `🎬 [H.264 Annex-B Frame #${annexBCount}] ssrc=${frame.ssrc} partnerId=${frame.partnerId ?? "?"} key=${frame.isKeyframe} len=${frame.annexB.length}B`,
        );
        broadcastSse({
            type: "video_annexb_meta",
            ssrc: frame.ssrc,
            partnerId: frame.partnerId,
            isKeyframe: frame.isKeyframe,
            byteLength: frame.annexB.length,
        });
        // Chuyển ngay khung hình H.264 Annex-B đã ghép mảnh (0x02 + isKeyframe + annexB) về trình duyệt để giải mã lên màn hình
        const out = Buffer.allocUnsafe(2 + frame.annexB.length);
        out[0] = 0x02;
        out[1] = frame.isKeyframe ? 1 : 0;
        frame.annexB.copy(out, 2);
        broadcastMediaBinary(out);
    });

    session.on("group_partner_sync", (partners) => {
        console.log(`👥 [Group Partner Sync] count=${partners.length}`, JSON.stringify(partners));
        broadcastSse({
            type: "group_partner_sync",
            partners,
        });
    });

    session.on("pli_request", (ev) => {
        broadcastSse({
            type: "pli_request",
            timestamp: ev.timestamp,
        });
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
            // Nếu là bắt tay Group Call (flags = 4), gửi thêm gói ZaviRoomUpdated (cmd = 50) từ SFU
            // theo chuẩn header 21 byte của zrtc::ZRTPPacket::_parsePacketInternal (0x1001589e8)
            if (parsed.flags === 4) {
                const roomUpdated = Buffer.alloc(25 + 8);
                roomUpdated.writeUInt8(0x01, 0);
                roomUpdated.writeUInt8(0x7e, 1);
                roomUpdated.writeUInt32LE(1, 2); // seqNum
                roomUpdated.writeUInt32LE(parsed.headerCallId >>> 0, 6); // headerCallId
                roomUpdated.writeUInt32LE(parsed.fromUid >>> 0, 10); // fromUid
                roomUpdated.writeUInt32LE(889977, 14); // toUid / routingToken
                roomUpdated.writeUInt16LE(50, 18); // cmd = 50 (ZaviRoomUpdated)
                roomUpdated.writeUInt8(1, 20); // flags = 1
                roomUpdated.writeInt32LE(0, 21); // errorCode = 0
                roomUpdated.writeUInt32LE((parsed.fromUid || 450859586) >>> 0, 25); // roomPartnerUids[0]
                roomUpdated.writeUInt32LE(1001, 29); // roomPartnerUids[1]
                simRelaySocket?.send(roomUpdated, rinfo.port, rinfo.address);
            }
        } else if (parsed.family === "control" && !parsed.isResponse && parsed.cmd === 51) {
            // Phản hồi InitZaviPing (cmd = 51) chuẩn header 21 byte + errorCode 4 byte + sessLen 2 byte
            const pong = Buffer.alloc(27);
            pong.writeUInt8(0x02, 0); // isResponse = true
            pong.writeUInt8(0x7e, 1);
            pong.writeUInt32LE(parsed.seqNum >>> 0, 2);
            pong.writeUInt32LE(parsed.headerCallId >>> 0, 6);
            pong.writeUInt32LE(parsed.fromUid >>> 0, 10);
            pong.writeUInt32LE(889977, 14);
            pong.writeUInt16LE(51, 18); // cmd = 51 (InitZaviPing)
            pong.writeUInt8(parsed.flags, 20);
            pong.writeInt32LE(0, 21); // errorCode = 0
            pong.writeUInt16LE(0, 25); // sessLen = 0
            simRelaySocket?.send(pong, rinfo.port, rinfo.address);
        } else if ((parsed.family === "legacy_media" || parsed.family === "zrtc_media") && !parsed.isRtcp) {
            // Loopback luồng Media RTP (Audio Opus + Video H.264) cho chế độ giả lập để hiển thị trực tiếp lên màn hình nhận
            try {
                const activeSrtp = currentSession?.getSrtpSession();
                let rawRtp = parsed.rtpPayload;
                if (activeSrtp) {
                    try {
                        rawRtp = activeSrtp.unprotectRtp(parsed.rtpPayload);
                    } catch {
                        rawRtp = parsed.rtpPayload;
                    }
                }
                const rtp = parseRtpPacket(rawRtp);
                const isGroup = Boolean(currentSession?.getMediaState().groupId);
                const firstPartnerVoip = Number(currentSession?.getGroupPartnerInfo()?.[0]?.userId ?? 1001) >>> 0;
                const rawExt =
                    rtp.extension && rtp.headerLength > 12 + rtp.csrcCount * 4
                        ? rawRtp.subarray(12 + rtp.csrcCount * 4, rtp.headerLength)
                        : undefined;
                const echoedRtp = buildRtpPacket({
                    payloadType: rtp.payloadType,
                    sequenceNumber: isGroup && parsed.isVideo && rtp.sfuExt ? 0 : rtp.sequenceNumber,
                    timestamp: rtp.timestamp,
                    ssrc: isGroup ? 1 : (rtp.ssrc ^ 0x11111111) >>> 0,
                    csrcList: isGroup ? [firstPartnerVoip] : [],
                    marker: rtp.marker,
                    headerExtension: rawExt,
                    payload: rtp.payload,
                });
                const finalEchoRtp = activeSrtp ? activeSrtp.protectRtp(echoedRtp) : echoedRtp;
                const incomingPrefix = parsed.isVideo
                    ? ZRTPLegacyMediaType.IncomingVideoRtp
                    : ZRTPLegacyMediaType.IncomingAudioRtp;
                const outPkt = Buffer.concat([Buffer.from([incomingPrefix]), finalEchoRtp]);
                simRelaySocket?.send(outPkt, rinfo.port, rinfo.address);
            } catch {
                // Ignore malformed simulated RTP
            }
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
    ctx.options.polyfill = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const u = new URL(String(input));
        const relayPort = await ensureSimRelaySocket();
        const enc =
            u.searchParams.get("params") ?? (init?.body instanceof URLSearchParams ? init.body.get("params") : null);
        const decoded = enc ? JSON.parse(decodeAES(ctx.secretKey!, enc) || "{}") : {};
        const makeResp = (data: unknown) => {
            const encrypted = encodeAES(
                ctx.secretKey!,
                JSON.stringify({ error_code: 0, error_message: "Successful.", data }),
            );
            return new Response(JSON.stringify({ error_code: 0, error_message: "Successful.", data: encrypted }), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        };
        if (u.pathname === "/api/voicecall/requestcall") {
            const cid = Number(decoded.callId || 778899);
            return makeResp({
                callId: cid,
                sessId: `${decoded.calleeId}_${cid}_401`,
                rtpIP: `127.0.0.1:${relayPort}`,
                rtcpIP: `127.0.0.1:${relayPort}`,
                servers: [{ rtpaddr: `127.0.0.1:${relayPort}`, rtcpaddr: `127.0.0.1:${relayPort}` }],
                codec: "[]",
            });
        }
        if (u.pathname === "/api/voicecall/group/requestcall") {
            const cid = Number(decoded.callId || 778899);
            return makeResp({
                params: JSON.stringify({
                    id: cid,
                    callId: cid,
                    hostCall: 450859586,
                    groupId: 912345678,
                    callSetting: {
                        session: `888999000_${cid}_501`,
                        servers: [{ rtp: `127.0.0.1:${relayPort}`, rtcp: `127.0.0.1:${relayPort}` }],
                    },
                }),
            });
        }
        if (u.pathname === "/api/voicecall/group/request") {
            const cid = Number(decoded.callId || 778899);
            const outer = decoded.data ? JSON.parse(String(decoded.data)) : {};
            const noiseArr: string[] = outer.noiseId ? JSON.parse(String(outer.noiseId)) : ["5249661060655759359"];
            const mapNoiseId: Record<string, number> = { [ctx.uid]: 450859586 };
            noiseArr.forEach((uid, idx) => {
                mapNoiseId[String(uid)] = 1001 + idx;
            });
            return makeResp({
                params: JSON.stringify({
                    callId: cid,
                    hostCall: 450859586,
                    groupId: 912345678,
                    mapNoiseId,
                }),
            });
        }
        if (u.pathname === "/api/voicecall/group/ping") {
            return makeResp({
                error: 0,
                partnerInfo: [{ userId: 450859586, callstate: 3, audiostate: 0, videostate: 0 }],
            });
        }
        return makeResp({ status: 0 });
    }) as typeof fetch;
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

async function fetchGroupsList(targetApi: API): Promise<typeof cachedGroups> {
    if (isOfflineSimulation) {
        return [
            {
                groupId: "8889990001112223334",
                name: "🧪 Nhóm Giả Lập SFU Zavi (Test Cục Bộ)",
                avatar: "",
                totalMember: 3,
                memberIds: ["5249661060655759359", "7249661060655759999"],
            },
        ];
    }
    const groupsRes = await targetApi.getAllGroups();
    const gridIds = Object.keys(groupsRes?.gridVerMap ?? {}).slice(0, 35);
    if (gridIds.length === 0) return [];
    const infoRes = await targetApi.getGroupInfo(gridIds);
    const myUid = String(targetApi.getContext().uid ?? "");
    return gridIds.map((gid) => {
        const g = infoRes?.gridInfoMap?.[gid] as Record<string, unknown> | undefined;
        const memVerList = Array.isArray(g?.memVerList) ? (g.memVerList as string[]) : [];
        const rawMemIds = Array.isArray(g?.memberIds) ? (g.memberIds as string[]) : [];
        const allIds = (memVerList.length > 0 ? memVerList : rawMemIds)
            .map((m) => String(m).split("_")[0])
            .filter((uid) => uid && uid !== myUid);
        return {
            groupId: gid,
            name: String(g?.name || `Nhóm ${gid}`),
            avatar: String(g?.avt || g?.fullAvt || ""),
            totalMember: Number(g?.totalMember || allIds.length + 1),
            memberIds: allIds,
        };
    });
}

async function activateLiveApi(liveApi: API, saveCreds?: Record<string, unknown>): Promise<void> {
    if (api) {
        try {
            api.listener.stop();
        } catch {
            // Ignore listener stop error
        }
    }
    if (saveCreds) {
        try {
            fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(saveCreds, null, 2), "utf-8");
        } catch {
            // Ignore disk write error
        }
    }
    api = liveApi;
    isOfflineSimulation = false;
    authErrorReason = null;

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
            .slice(0, 60)
            .map((f) => ({
                userId: String(f.userId),
                displayName: String(f.displayName || f.zaloName || f.userId),
                avatar: String((f as Record<string, unknown>).avatar || ""),
            }));
    } catch {
        cachedFriends = [];
    }

    try {
        cachedGroups = await fetchGroupsList(api);
    } catch {
        cachedGroups = [];
    }

    broadcastSse({
        type: "auth_status",
        isOfflineSimulation: false,
        authErrorReason: null,
        uid: api.getContext().uid,
        voiceCallService: api.zpwServiceMap.voice_call?.[0],
        friends: cachedFriends,
        groups: cachedGroups,
        hasCredentialsFile: fs.existsSync(CREDENTIALS_PATH),
    });
}

function switchToOfflineSimulation(reason?: string): void {
    if (api) {
        try {
            api.listener.stop();
        } catch {
            // Ignore listener stop error
        }
    }
    api = createOfflineSimulationApi();
    isOfflineSimulation = true;
    authErrorReason = reason ?? null;
    cachedFriends = [];
    cachedGroups = [
        {
            groupId: "8889990001112223334",
            name: "🧪 Nhóm Giả Lập SFU Zavi (Test Cục Bộ)",
            avatar: "",
            totalMember: 3,
            memberIds: ["5249661060655759359", "7249661060655759999"],
        },
    ];
    broadcastSse({
        type: "auth_status",
        isOfflineSimulation: true,
        authErrorReason,
        uid: api.getContext().uid,
        voiceCallService: api.zpwServiceMap.voice_call?.[0],
        friends: [],
        groups: cachedGroups,
        hasCredentialsFile: fs.existsSync(CREDENTIALS_PATH),
    });
}

interface DiscoveredZPlusAccount {
    accountId: string;
    displayName: string;
    status: string;
    updatedAt: number;
    credentials: {
        imei: string;
        userAgent: string;
        cookie: unknown;
        language?: string;
    };
}

function getMacHardwareUuid(): string {
    try {
        const out = execFileSync("ioreg", ["-rd1", "-c", "IOPlatformExpertDevice"], { encoding: "utf-8" });
        const m = out.match(/"IOPlatformUUID"\s*=\s*"([^"]+)"/);
        if (m?.[1]) return m[1].trim();
    } catch {
        // Fallback
    }
    return `${os.hostname()}-${os.platform()}-${os.arch()}`;
}

function decryptZPlusPayload(encryptedText: string, candidateKeys: Buffer[]): string {
    const cleanText = encryptedText.startsWith("CLD-") ? encryptedText.slice(4) : encryptedText;
    const parts = cleanText.split(":");
    const iv = Buffer.from(parts.shift()!, "hex");
    const encrypted = Buffer.from(parts.join(":"), "hex");
    for (const key of candidateKeys) {
        try {
            const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString("utf-8");
        } catch {
            // Try next key
        }
    }
    throw new Error("Unable to decrypt payload");
}

function discoverZPlusDesktopSessions(): DiscoveredZPlusAccount[] {
    const results: DiscoveredZPlusAccount[] = [];
    try {
        const profilesRoot = path.join(os.homedir(), "Library", "Application Support", "Zplus", "profiles");
        if (!fs.existsSync(profilesRoot)) return results;
        const hwId = getMacHardwareUuid().toLowerCase();
        const mid = crypto.createHash("sha256").update(hwId).digest("hex");
        const localKey = crypto
            .createHash("sha256")
            .update(mid + "zalo_manager_secure_salt_v1")
            .digest();
        const rawLocalKey = crypto
            .createHash("sha256")
            .update(hwId + "zalo_manager_secure_salt_v1")
            .digest();
        const dirs = fs.readdirSync(profilesRoot);
        for (const dir of dirs) {
            const dbPath = path.join(profilesRoot, dir, "zplus_v2.db");
            if (!fs.existsSync(dbPath)) continue;
            const candidateKeys = [
                localKey,
                rawLocalKey,
                crypto
                    .createHash("sha256")
                    .update(dir + "8a7f47e14d416da98ad647d2d297be7d47530933bb935cd70ca30001c6aea0a8")
                    .digest(),
                crypto
                    .createHash("sha256")
                    .update(dir + "zplus_cloud_sync_e2ee_salt_v1.0")
                    .digest(),
            ];
            try {
                const rawJson = execFileSync(
                    "sqlite3",
                    [
                        "-json",
                        dbPath,
                        "SELECT account_id, encrypted_credentials, status, profile_json, updated_at FROM social_sessions WHERE platform='zalo' ORDER BY updated_at DESC;",
                    ],
                    { encoding: "utf-8" },
                );
                const rows = JSON.parse(rawJson || "[]") as Array<{
                    account_id: string;
                    encrypted_credentials: string;
                    status: string;
                    profile_json?: string;
                    updated_at: number;
                }>;
                for (const row of rows) {
                    if (!row.encrypted_credentials) continue;
                    try {
                        const decryptedStr = decryptZPlusPayload(row.encrypted_credentials, candidateKeys);
                        const parsedCreds = JSON.parse(decryptedStr) as Record<string, unknown>;
                        const prof = row.profile_json ? (JSON.parse(row.profile_json) as Record<string, unknown>) : {};
                        const cookieVal = parsedCreds.cookie ?? parsedCreds.cookies;
                        if (parsedCreds.imei && cookieVal && parsedCreds.userAgent) {
                            results.push({
                                accountId: String(row.account_id),
                                displayName: String(prof.displayName || prof.name || `Zalo ${row.account_id}`),
                                status: String(row.status || "live"),
                                updatedAt: Number(row.updated_at || 0),
                                credentials: {
                                    imei: String(parsedCreds.imei),
                                    userAgent: String(parsedCreds.userAgent),
                                    cookie: cookieVal,
                                    language: String(parsedCreds.language || "vi"),
                                },
                            });
                        }
                    } catch {
                        // Ignore row with different key
                    }
                }
            } catch {
                // Ignore sqlite read error
            }
        }
    } catch {
        // Ignore discovery error
    }
    return results;
}

async function initZaloSession(): Promise<void> {
    if (fs.existsSync(CREDENTIALS_PATH)) {
        try {
            const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
            const zalo = new Zalo({ logging: false });
            const liveApi = await zalo.login(creds);
            await activateLiveApi(liveApi);
            console.log(`✅ Đã đăng nhập Zalo thật từ ${CREDENTIALS_PATH} (UID: ${liveApi.getContext().uid})`);
            return;
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.warn(
                `⚠️ Phiên trong ${CREDENTIALS_PATH} đã hết hạn (${errMsg}). Đang tự động đồng bộ phiên sống từ ZPlus Desktop...`,
            );
        }
    }

    // Tự động nạp phiên Zalo đang sống từ cơ sở dữ liệu ZPlus Desktop (nếu có trên máy)
    const desktopAccounts = discoverZPlusDesktopSessions();
    for (const acc of desktopAccounts) {
        try {
            const zalo = new Zalo({ logging: false });
            const liveApi = await zalo.login(acc.credentials as Parameters<Zalo["login"]>[0]);
            await activateLiveApi(liveApi, acc.credentials as unknown as Record<string, unknown>);
            console.log(
                `✅ Đã tự động đồng bộ phiên Zalo thật từ ZPlus Desktop: ${acc.displayName} (UID: ${liveApi.getContext().uid}) & lưu vào ${CREDENTIALS_PATH}`,
            );
            return;
        } catch (err) {
            console.warn(
                `⚠️ Phiên ZPlus Desktop ${acc.displayName} (${acc.accountId}) không khả dụng:`,
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    switchToOfflineSimulation(`Không tìm thấy phiên Zalo sống trong credentials.json hoặc ZPlus Desktop`);
    console.warn(`⚠️ Không tìm thấy phiên sống — đang dùng chế độ giả lập cục bộ cho Call Studio.`);
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
                    isOfflineSimulation,
                    authErrorReason,
                    qrLoginState,
                    hasCredentialsFile: fs.existsSync(CREDENTIALS_PATH),
                    credentialsPath: CREDENTIALS_PATH,
                    uid: api?.getContext().uid,
                    voiceCallService: api?.zpwServiceMap.voice_call?.[0],
                    friends: cachedFriends,
                    groups: cachedGroups,
                    zplusAccounts: discoverZPlusDesktopSessions().map((a) => ({
                        accountId: a.accountId,
                        displayName: a.displayName,
                        status: a.status,
                        updatedAt: a.updatedAt,
                    })),
                    lastVerifiedProof,
                    pendingIncomingCall,
                }),
            );
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/auth/sync-zplus-desktop") {
            const body = await readJsonBody(req);
            const targetAccountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
            const accounts = discoverZPlusDesktopSessions();
            const candidates = targetAccountId ? accounts.filter((a) => a.accountId === targetAccountId) : accounts;
            if (candidates.length === 0) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: false,
                        error: "Không tìm thấy tài khoản Zalo nào trong ZPlus Desktop",
                    }),
                );
                return;
            }
            let lastErr = "Không thể đăng nhập";
            for (const acc of candidates) {
                try {
                    const zalo = new Zalo({ logging: false });
                    const newApi = await zalo.login(acc.credentials as Parameters<Zalo["login"]>[0]);
                    await activateLiveApi(newApi, acc.credentials as unknown as Record<string, unknown>);
                    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(
                        JSON.stringify({
                            ok: true,
                            uid: newApi.getContext().uid,
                            displayName: acc.displayName,
                            groups: cachedGroups,
                            friends: cachedFriends,
                        }),
                    );
                    return;
                } catch (err) {
                    lastErr = err instanceof Error ? err.message : String(err);
                }
            }
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: lastErr }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/auth/qr/start") {
            if (qrAbortFn) {
                try {
                    qrAbortFn();
                } catch {
                    // Ignore abort error
                }
                qrAbortFn = null;
            }
            qrLoginState = { status: "generating" };
            broadcastSse({ type: "qr_login", state: qrLoginState });

            let capturedCreds: Record<string, unknown> | undefined;
            let qrReadyResolve = (): void => {};
            const qrReadyPromise = new Promise<void>((resolve) => {
                qrReadyResolve = resolve;
                setTimeout(resolve, 4000);
            });

            void (async () => {
                try {
                    const zalo = new Zalo({ logging: false });
                    const newApi = await zalo.loginQR({}, (event) => {
                        if (event.type === LoginQRCallbackEventType.QRCodeGenerated) {
                            qrAbortFn = () => event.actions.abort();
                            const img = event.data.image.startsWith("data:")
                                ? event.data.image
                                : `data:image/png;base64,${event.data.image}`;
                            qrLoginState = {
                                status: "waiting_scan",
                                qrImage: img,
                            };
                            broadcastSse({ type: "qr_login", state: qrLoginState });
                            qrReadyResolve();
                        } else if (event.type === LoginQRCallbackEventType.QRCodeScanned) {
                            qrLoginState = {
                                ...qrLoginState,
                                status: "scanned",
                                scannedUser: {
                                    displayName: event.data.display_name,
                                    avatar: event.data.avatar,
                                },
                            };
                            broadcastSse({ type: "qr_login", state: qrLoginState });
                        } else if (event.type === LoginQRCallbackEventType.QRCodeExpired) {
                            qrLoginState = {
                                status: "expired",
                                error: "Mã QR đã hết hạn. Vui lòng bấm Tạo lại mã QR.",
                            };
                            broadcastSse({ type: "qr_login", state: qrLoginState });
                            qrReadyResolve();
                        } else if (event.type === LoginQRCallbackEventType.QRCodeDeclined) {
                            qrLoginState = {
                                status: "declined",
                                error: "Đã từ chối đăng nhập trên điện thoại.",
                            };
                            broadcastSse({ type: "qr_login", state: qrLoginState });
                            qrReadyResolve();
                        } else if (event.type === LoginQRCallbackEventType.GotLoginInfo) {
                            capturedCreds = {
                                imei: event.data.imei,
                                cookie: event.data.cookie,
                                userAgent: event.data.userAgent,
                            };
                        }
                    });
                    qrAbortFn = null;
                    await activateLiveApi(newApi, capturedCreds);
                    qrLoginState = { status: "authenticated" };
                    broadcastSse({ type: "qr_login", state: qrLoginState });
                    broadcastSse({
                        type: "log",
                        level: "ok",
                        message: `✅ Đăng nhập QR thành công (UID: ${newApi.getContext().uid}) & đã lưu vào ${CREDENTIALS_PATH}`,
                    });
                } catch (err) {
                    qrAbortFn = null;
                    const errMsg = err instanceof Error ? err.message : String(err);
                    if (qrLoginState.status !== "expired" && qrLoginState.status !== "declined") {
                        qrLoginState = { status: "error", error: errMsg };
                        broadcastSse({ type: "qr_login", state: qrLoginState });
                    }
                    qrReadyResolve();
                }
            })();

            await qrReadyPromise;
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, state: qrLoginState }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/auth/qr/cancel") {
            if (qrAbortFn) {
                try {
                    qrAbortFn();
                } catch {
                    // Ignore abort error
                }
                qrAbortFn = null;
            }
            qrLoginState = { status: "idle" };
            broadcastSse({ type: "qr_login", state: qrLoginState });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/auth/login-credentials") {
            const body = await readJsonBody(req);
            try {
                let creds: Record<string, unknown>;
                if (body.reloadFromDisk) {
                    if (!fs.existsSync(CREDENTIALS_PATH)) {
                        throw new Error(`Không tìm thấy file ${CREDENTIALS_PATH}`);
                    }
                    creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
                } else if (typeof body.credentialsJson === "string" && body.credentialsJson.trim()) {
                    creds = JSON.parse(body.credentialsJson);
                } else if (body.credentials && typeof body.credentials === "object") {
                    creds = body.credentials as Record<string, unknown>;
                } else {
                    throw new Error("Dữ liệu credentials không hợp lệ (cần imei, cookie, userAgent)");
                }
                const zalo = new Zalo({ logging: false });
                const newApi = await zalo.login(creds as Parameters<Zalo["login"]>[0]);
                await activateLiveApi(newApi, creds);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        isOfflineSimulation: false,
                        uid: newApi.getContext().uid,
                        voiceCallService: newApi.zpwServiceMap.voice_call?.[0],
                        friends: cachedFriends,
                    }),
                );
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: errMsg }));
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/auth/logout") {
            const body = await readJsonBody(req);
            if (currentSession) {
                await currentSession.endCall("logout").catch(() => {});
                currentSession = null;
            }
            if (qrAbortFn) {
                try {
                    qrAbortFn();
                } catch {
                    // Ignore
                }
                qrAbortFn = null;
            }
            qrLoginState = { status: "idle" };
            if (body.clearCredentialsFile && fs.existsSync(CREDENTIALS_PATH)) {
                try {
                    fs.unlinkSync(CREDENTIALS_PATH);
                } catch {
                    // Ignore unlink error
                }
            }
            switchToOfflineSimulation(
                body.clearCredentialsFile
                    ? "Đã đăng xuất và xoá file phiên cục bộ (Đang ở chế độ Giả lập Offline)"
                    : "Đã chủ động đăng xuất sang chế độ Giả lập Offline",
            );
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    isOfflineSimulation: true,
                    uid: api?.getContext().uid,
                }),
            );
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/auth/export-session") {
            try {
                if (!isOfflineSimulation && api) {
                    const exported = api.exportSession();
                    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: true, source: "live", session: exported }));
                    return;
                }
                if (fs.existsSync(CREDENTIALS_PATH)) {
                    const diskCreds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
                    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ ok: true, source: "disk", session: diskCreds }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên đăng nhập để xuất" }));
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
                          callType: isVideo ? 1 : 0,
                          groupName: String(body.groupName ?? "Nhóm Kiểm Định ZRTC Video"),
                          groupNoiseId: String(body.groupId ?? "8889990001112223334"),
                          groupId: 912345678,
                          hostCall: 450859586,
                          fromId: 450859586,
                          receiverId: 450859587,
                          Dname: callerName,
                          mapNoiseId: {
                              [callerId]: 450859586,
                              [String(api?.getContext().uid ?? "687719761480069038")]: 450859587,
                              "7249661060655759999": 450859588,
                          },
                          partnerInfo: [
                              { userId: 450859586, id: callerId, name: callerName, avatar: "", callstate: 2 },
                              {
                                  userId: 450859588,
                                  id: "7249661060655759999",
                                  name: "Thành Viên Nhóm 2",
                                  avatar: "",
                                  callstate: 0,
                              },
                          ],
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
                const targetApi = isLastIncomingSimulated ? createOfflineSimulationApi() : api!;
                currentSession = targetApi.call.createRtcSession({
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
                cachedGroups = await fetchGroupsList(api!);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        groupIds: cachedGroups.map((g) => g.groupId),
                        groups: cachedGroups,
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

        if (req.method === "GET" && u.pathname === "/api/group-members") {
            const groupId = String(u.searchParams.get("groupId") || "").trim();
            if (!groupId || groupId === "8889990001112223334" || isOfflineSimulation) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        groupId: groupId || "8889990001112223334",
                        groupName: "🧪 Nhóm Giả Lập SFU Zavi (Test Cục Bộ)",
                        groupAvatar: "",
                        members: [
                            { id: "5249661060655759359", name: "Ly Van Bong (0332606964)", avatar: "" },
                            { id: "7249661060655759999", name: "Thành Viên Giả Lập #2", avatar: "" },
                        ],
                    }),
                );
                return;
            }
            try {
                const infoRes = await api!.getGroupInfo(groupId);
                const g = infoRes?.gridInfoMap?.[groupId] as Record<string, unknown> | undefined;
                const myUid = String(api!.getContext().uid ?? "");
                const memVerList = Array.isArray(g?.memVerList) ? (g.memVerList as string[]) : [];
                const filteredVerList = memVerList.filter((m) => String(m).split("_")[0] !== myUid).slice(0, 50);
                const memberIds = filteredVerList.map((m) => String(m).split("_")[0]);

                let profilesMap: Record<string, { displayName?: string; zaloName?: string; avatar?: string }> = {};
                if (filteredVerList.length > 0) {
                    try {
                        const profRes = await api!.getGroupMembersInfo(filteredVerList);
                        profilesMap = (profRes?.profiles ?? {}) as typeof profilesMap;
                    } catch {
                        // Fallback if profile lookup fails
                    }
                }
                const members = memberIds.map((uid) => {
                    const p = profilesMap[uid];
                    return {
                        id: uid,
                        name: String(p?.displayName || p?.zaloName || `Thành viên (${uid.slice(-4)})`),
                        avatar: String(p?.avatar || ""),
                    };
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        groupId,
                        groupName: String(g?.name || `Nhóm ${groupId}`),
                        groupAvatar: String(g?.avt || g?.fullAvt || ""),
                        members,
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

        if (req.method === "POST" && u.pathname === "/api/group-call/start") {
            const body = await readJsonBody(req);
            const groupId = String(body.groupId || "8889990001112223334").trim();
            const rawPartners = Array.isArray(body.partners)
                ? body.partners.map(String)
                : String(body.partners ?? "5249661060655759359")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
            const customPartnerInfo = Array.isArray(body.partnerInfo)
                ? (body.partnerInfo as Array<{ id: string; name?: string; avatar?: string }>)
                : null;
            const rawCallTypeNum = Number(body.callType);
            const callType =
                rawCallTypeNum === CallType.GroupVideo || rawCallTypeNum === CallType.Video || rawCallTypeNum === 1
                    ? CallType.GroupVideo
                    : CallType.GroupAudio;
            const simulateLocal = Boolean(body.simulateLocal) || groupId === "8889990001112223334";
            const enableSrtp = Boolean(body.enableSrtp);
            const targetApi = simulateLocal ? createOfflineSimulationApi() : api!;

            try {
                if (currentSession) {
                    await currentSession.endCall("new_group_call").catch(() => {});
                }
                currentSession = targetApi.call.createRtcSession({
                    packetMode: 1,
                    enableSrtp,
                    udpHandshakeTimeoutMs: 2500,
                });
                wireSessionEvents(currentSession);
                const resolvedPartnerInfo =
                    customPartnerInfo && customPartnerInfo.length > 0
                        ? customPartnerInfo.map((p, idx) => ({
                              id: String(p.id),
                              name: String(p.name || `Thành viên #${idx + 1} (${String(p.id).slice(-4)})`),
                              avatar: String(p.avatar || ""),
                          }))
                        : rawPartners.map((id, idx) => ({
                              id,
                              name: `Thành viên #${idx + 1} (${id.slice(-4)})`,
                              avatar: "",
                          }));
                const params = await currentSession.startGroupCall(groupId, {
                    partners: rawPartners,
                    partnerInfo: resolvedPartnerInfo,
                    groupName: String(body.groupName ?? `Nhóm ${groupId.slice(-6)}`),
                    groupAvatar: String(body.groupAvatar ?? ""),
                    callType,
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        simulateLocal,
                        params,
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

        if (req.method === "POST" && u.pathname === "/api/group-call/simulate-member-event") {
            if (!currentSession) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Chưa có phiên gọi nhóm đang hoạt động" }));
                return;
            }
            const body = await readJsonBody(req);
            const action = String(body.action ?? "answer");
            const partnerInfoList = currentSession.getGroupPartnerInfo();
            const targetPartner = partnerInfoList[0] ?? {
                id: "5249661060655759359",
                userId: 1001,
                name: "Thành viên #1",
            };
            const voipUid = Number(body.userId ?? targetPartner.userId ?? 1001);
            const callId = currentSession.getMediaState().callId;
            const localPort = currentSession.getConnectionParams().localUdpPort;
            const token = (currentSession.getConnectionParams().routingToken || callId) >>> 0;
            await ensureSimRelaySocket();

            if (action === "answer") {
                await currentSession.handleCallEvent({
                    type: CallEventType.GROUP_ANSWER,
                    act: "group_answer",
                    act_type: "voip",
                    data: {
                        id: callId,
                        fromId: voipUid,
                        status: 0,
                        videostate: 0,
                        audiostate: 0,
                    },
                });
                // Mô phỏng gói group_broadcast (callState = 3 = In-Call/Answered) mà server Zalo đẩy về ngay sau group_answer
                await currentSession.handleCallEvent({
                    type: CallEventType.GROUP_BROADCAST,
                    act: "group_broadcast",
                    act_type: "voip",
                    data: {
                        id: callId,
                        partnerInfo: [
                            {
                                userId: voipUid,
                                callState: 3,
                                videoState: 0,
                                audioState: 0,
                            },
                        ],
                    },
                });
                if (localPort > 0 && simRelaySocket) {
                    // 1. Gửi gói ZaviRoomUpdated (cmd = 50) từ SFU thông báo danh sách 32-bit VoIP UID đang trong phòng
                    const localUid32 = currentSession.getConnectionParams().fromId >>> 0;
                    const roomUpdated = Buffer.alloc(25 + 8);
                    roomUpdated.writeUInt8(0x01, 0);
                    roomUpdated.writeUInt8(0x7e, 1);
                    roomUpdated.writeUInt32LE(2, 2); // seqNum
                    roomUpdated.writeUInt32LE(currentSession.getConnectionParams().callId >>> 0, 6);
                    roomUpdated.writeUInt32LE(localUid32, 10);
                    roomUpdated.writeUInt32LE(token, 14);
                    roomUpdated.writeUInt16LE(50, 18); // ZaviRoomUpdated (cmd = 50)
                    roomUpdated.writeUInt8(1, 20); // flags = 1
                    roomUpdated.writeInt32LE(0, 21); // errorCode = 0
                    roomUpdated.writeUInt32LE(localUid32, 25);
                    roomUpdated.writeUInt32LE(voipUid >>> 0, 29);
                    simRelaySocket.send(roomUpdated, localPort, "127.0.0.1");

                    // 2. Gửi gói UDP RequestForward OnCamera (cmd = 32, subCmd = 7) từ thành viên voipUid
                    const onCamPkt = buildRequestForwardPacket({
                        seqNum: 1,
                        seqId: 1,
                        fromUid: voipUid >>> 0,
                        routingToken: token,
                        subCmd: ZRTPForwardSubCommand.OnCamera,
                        payload: Buffer.alloc(4),
                    });
                    simRelaySocket.send(onCamPkt, localPort, "127.0.0.1");

                    // 3. Bơm gói Video RTP chuẩn Zavi SFU: 1-byte header 0x0e (IncomingVideoRtp), SSRC = 1, CSRC[0] = voipUid,
                    // RTP Header seq = 0, RFC 5285 0xBEDE extension id=14 mang seq = 1
                    const h264Sample = Buffer.from(
                        "000000016742c01ed90f8888840000030004000003003c8f162e480000000168cb83cb20000000016588840033ff",
                        "hex",
                    );
                    const rawVideoRtp = buildRtpPacket({
                        payloadType: 98,
                        sequenceNumber: 0,
                        timestamp: 90000,
                        ssrc: 1,
                        csrcList: [voipUid >>> 0],
                        marker: true,
                        headerExtension: buildGroupCallVideoRtpHeaderExtension({ sequenceNumber: 1 }),
                        payload: h264Sample,
                    });
                    const activeSrtp = currentSession.getSrtpSession();
                    const finalVideoRtp = activeSrtp ? activeSrtp.protectRtp(rawVideoRtp) : rawVideoRtp;
                    const zaviVideoPkt = Buffer.concat([
                        Buffer.from([ZRTPLegacyMediaType.IncomingVideoRtp]),
                        finalVideoRtp,
                    ]);
                    simRelaySocket.send(zaviVideoPkt, localPort, "127.0.0.1");

                    // 4. Bơm gói Audio RTP chuẩn Zavi SFU: 1-byte header 0x04 (IncomingAudioRtp), SSRC = 1, CSRC[0] = voipUid
                    const rawAudioRtp = buildRtpPacket({
                        payloadType: 112,
                        sequenceNumber: 1,
                        timestamp: 320,
                        ssrc: 1,
                        csrcList: [voipUid >>> 0],
                        marker: true,
                        payload: Buffer.from([0xf8, 0xff, 0xfe]),
                    });
                    const finalAudioRtp = activeSrtp ? activeSrtp.protectRtp(rawAudioRtp) : rawAudioRtp;
                    const zaviAudioPkt = Buffer.concat([
                        Buffer.from([ZRTPLegacyMediaType.IncomingAudioRtp]),
                        finalAudioRtp,
                    ]);
                    simRelaySocket.send(zaviAudioPkt, localPort, "127.0.0.1");
                }
            } else if (action === "toggle_media") {
                const videoState = body.videoState !== undefined ? Number(body.videoState) : 0;
                const audioState = body.audioState !== undefined ? Number(body.audioState) : 0;
                await currentSession.handleCallEvent({
                    type: CallEventType.GROUP_BROADCAST,
                    act: "group_broadcast",
                    act_type: "voip",
                    data: {
                        id: callId,
                        partnerInfo: [
                            {
                                userId: voipUid,
                                callstate: 3,
                                videostate: videoState,
                                audiostate: audioState,
                            },
                        ],
                    },
                });
                if (localPort > 0 && simRelaySocket) {
                    const camPkt = buildRequestForwardPacket({
                        seqNum: 2,
                        seqId: 2,
                        fromUid: voipUid >>> 0,
                        routingToken: token,
                        subCmd: videoState === 0 ? ZRTPForwardSubCommand.OnCamera : ZRTPForwardSubCommand.OffCamera,
                        payload: Buffer.alloc(4),
                    });
                    simRelaySocket.send(camPkt, localPort, "127.0.0.1");

                    const audioCodecPkt = buildAudioCodecMutePacket({
                        seqNum: 2,
                        callId: 0,
                        fromUid: voipUid >>> 0,
                        routingToken: token,
                        muted: audioState !== 0,
                    });
                    simRelaySocket.send(audioCodecPkt, localPort, "127.0.0.1");
                }
            } else if (action === "leave") {
                await currentSession.handleCallEvent({
                    type: CallEventType.GROUP_END,
                    act: "group_end_call",
                    act_type: "voip",
                    data: {
                        id: callId,
                        fromId: voipUid,
                    },
                });
            }

            await new Promise((r) => setTimeout(r, 40));

            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    action,
                    voipUid,
                    partnerId: currentSession.resolvePartnerId(voipUid),
                    groupPartnerInfo: currentSession.getGroupPartnerInfo(),
                    state: currentSession.getState(),
                }),
            );
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/group-call/join") {
            const body = await readJsonBody(req);
            const callId = Number(body.callId || 778899);
            const hostCall = String(body.hostCall ?? body.groupId ?? "8889990001112223334").trim();
            const rawCallTypeNum = Number(body.callType);
            const callType =
                rawCallTypeNum === CallType.GroupVideo || rawCallTypeNum === CallType.Video || rawCallTypeNum === 1
                    ? CallType.GroupVideo
                    : CallType.GroupAudio;
            const simulateLocal = Boolean(body.simulateLocal) || hostCall === "8889990001112223334";
            const targetApi = simulateLocal ? createOfflineSimulationApi() : api!;
            const relayPort = await ensureSimRelaySocket();
            try {
                if (currentSession) {
                    await currentSession.endCall("join_group_call").catch(() => {});
                }
                currentSession = targetApi.call.createRtcSession({
                    packetMode: 1,
                    enableSrtp: false,
                });
                wireSessionEvents(currentSession);
                const params = await currentSession.joinActiveGroupCall(callId, {
                    hostCall,
                    groupId: hostCall,
                    callType,
                    ...(simulateLocal
                        ? {
                              rtpAddress: `127.0.0.1:${relayPort}`,
                              rtcpAddress: `127.0.0.1:${relayPort}`,
                              session: `888999000_${callId}_501`,
                          }
                        : {}),
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
