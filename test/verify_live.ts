import dgram from "node:dgram";
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
    Zalo,
    type API,
    LoginQRCallbackEventType,
    ThreadType,
    SyncEventType,
    CallEventType,
    CallType,
    buildInitCallRequest,
    buildPingRequest,
    parseZRTPPacket,
    uidToUint32,
    generateRSAKeyPair,
    decryptWithPrivateKey,
    deriveZdbAesKey,
    decryptZdbBuffer,
    parseZdbHeader,
} from "../dist/index.js";

/**
 * ============================================================================
 * KỊCH BẢN KIỂM ĐỊNH TOÀN DIỆN TRÊN DỮ LIỆU THẬT (100% REAL ZALO SERVER & PHONE)
 * ============================================================================
 * Kịch bản này thực hiện tuần tự 6 bước trên tài khoản Zalo thật của bạn:
 *   Bước 1: Đăng nhập (tự động mở mã QR ./test/qr.png nếu phiên cũ hết hạn)
 *   Bước 2: Kiểm định api.preloadConversations() (command 10053) lấy tin nhắn thật
 *   Bước 3: Kiểm định api.getNoisedIds() (command 12390) & api.decryptGids() (12054)
 *   Bước 4: Kết nối WebSocket thật, kiểm định requestOldMessages (cmd 510 & 511)
 *   Bước 5: Kiểm định đồng bộ từ điện thoại thật:
 *           - requestSyncFromPhone (command 12000) -> bắn thông báo về điện thoại
 *           - Lắng nghe sync_event (USER_CONFIRM -> SYNCMSG_INFO)
 *           - getSyncData tải file .db.crypt thật + Giải mã ZDB4.0 thật
 *           - Hoặc cancelPullMobile (command 12700) nếu hết thời gian chờ
 *   Bước 6: Kiểm định Voice Call Signaling (command 11300 / 11301 / 11305)
 * ============================================================================
 */

const CREDENTIALS_PATH = path.resolve("./test/credentials.json");
const QR_PATH = path.resolve("./test/qr.png");
const SYNC_SAVE_DIR = path.resolve("./test/sync_data");

function printSection(step: number, title: string) {
    console.log(`\n======================================================================`);
    console.log(`🔹 BƯỚC ${step}: ${title}`);
    console.log(`======================================================================`);
}

async function main() {
    const args = process.argv.slice(2);
    const forceQR = args.includes("--qr");
    const onlyCall = args.includes("--only-call");
    const skipSync = args.includes("--skip-sync");
    const videoOnly = args.includes("--video-only");
    const callIdx = args.indexOf("--call");
    const targetCallUid = callIdx !== -1 ? args[callIdx + 1] : undefined;

    printSection(1, "ĐĂNG NHẬP TÀI KHOẢN ZALO THẬT");
    const zalo = new Zalo({
        selfListen: true,
        logging: false,
    });

    let api: API | undefined;
    let loggedInViaQR = false;

    if (fs.existsSync(CREDENTIALS_PATH) && !forceQR) {
        try {
            console.log("🔄 Đang thử đăng nhập bằng phiên đã lưu trong ./test/credentials.json...");
            const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
            api = await zalo.login(creds);
            console.log("✅ Đăng nhập bằng credentials.json thành công!");
        } catch {
            console.log("⚠️ Phiên trong ./test/credentials.json đã hết hạn. Chuyển sang quét mã QR...");
        }
    }

    if (!api) {
        loggedInViaQR = true;
        api = await zalo.loginQR({ qrPath: QR_PATH }, async (event) => {
            if (event.type === LoginQRCallbackEventType.QRCodeGenerated) {
                await event.actions.saveToFile(QR_PATH);
                console.log(`\n📸 ĐÃ TẠO MÃ QR MỚI TẠI: ${QR_PATH}`);
                console.log("👉 Đang tự động mở ảnh QR trên màn hình Mac của bạn...");
                console.log("👉 Vui lòng mở Zalo trên điện thoại và QUÉT MÃ QR để đăng nhập!");
                exec(`open "${QR_PATH}"`);
            } else if (event.type === LoginQRCallbackEventType.QRCodeScanned) {
                console.log(
                    `📱 Đã quét mã QR! Người dùng: ${event.data.display_name}. Vui lòng bấm 'Đăng nhập' trên điện thoại!`,
                );
            } else if (event.type === LoginQRCallbackEventType.QRCodeExpired) {
                console.log("🔄 Mã QR đã hết hạn (100s), đang tự động tạo lại mã QR mới...");
                event.actions.retry();
            } else if (event.type === LoginQRCallbackEventType.QRCodeDeclined) {
                console.log("⚠️ Bạn đã từ chối đăng nhập trên điện thoại, đang tạo lại mã QR...");
                event.actions.retry();
            } else if (event.type === LoginQRCallbackEventType.GotLoginInfo) {
                fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(event.data, null, 2));
                console.log(`💾 Đã lưu phiên đăng nhập mới vào: ${CREDENTIALS_PATH}`);
            }
        });
    }

    const ownId = api.getOwnId();
    console.log(`✅ ĐĂNG NHẬP THÀNH CÔNG! UID thật của bạn: ${ownId}`);
    if (loggedInViaQR && fs.existsSync(QR_PATH)) {
        try {
            fs.unlinkSync(QR_PATH);
        } catch {
            // ignore
        }
    }

    if (!onlyCall) {
        // -------------------------------------------------------------------------
        // BƯỚC 2: KIỂM ĐỊNH preloadConversations (command 10053)
        // -------------------------------------------------------------------------
        printSection(2, "KIỂM ĐỊNH api.preloadConversations() TRÊN DỮ LIỆU THẬT");
        const preload = await api.preloadConversations();
        console.log(`✅ Server Zalo trả về thành công!`);
        console.log(`   - Tổng số tin nhắn mới nhất (messages): ${preload.messages.length}`);
        console.log(`   - Số tin nhắn cá nhân (msgs): ${Array.isArray(preload.msgs) ? preload.msgs.length : 0}`);
        console.log(`   - Số tin nhắn Zalo OA / ZNS (pageMessages): ${preload.pageMessages.length}`);
        console.log(
            `   - Số tin nhắn nhóm (groupMsgs): ${Array.isArray(preload.groupMsgs) ? preload.groupMsgs.length : 0}`,
        );
        console.log(`   - Số trạng thái đã đọc (unreadCleared): ${preload.unreadCleared.length}`);

        if (preload.pageMessages.length > 0) {
            console.log(`   - Mẫu tin nhắn Zalo OA / ZNS giải mã từ pageMessages:`);
            for (const oaMsg of preload.pageMessages.slice(0, 3)) {
                console.log(
                    `     • [OA:${oaMsg.oaData?.kind ?? oaMsg.data.msgType}] từ=${oaMsg.data.dName || oaMsg.data.uidFrom}: ${oaMsg.oaData?.text || JSON.stringify(oaMsg.oaData?.bundleData ?? {})}`,
                );
            }
        }

        if (preload.messages.length > 0) {
            console.log(`   - Mẫu 3 tin nhắn thật đầu tiên:`);
            for (const msg of preload.messages.slice(0, 3)) {
                const preview =
                    typeof msg.data.content === "string"
                        ? msg.data.content.slice(0, 60)
                        : `[Object: ${msg.data.msgType}]`;
                console.log(
                    `     • [${msg.type === ThreadType.Group ? "Nhóm" : "Cá nhân"}] msgId=${msg.data.msgId} | từ=${msg.data.dName || msg.data.uidFrom}: ${preview}`,
                );
            }
        }

        // -------------------------------------------------------------------------
        // BƯỚC 3: KIỂM ĐỊNH getNoisedIds (command 12390), decryptGids (12054) & cancelPullMobile (12700)
        // -------------------------------------------------------------------------
        printSection(3, "KIỂM ĐỊNH api.getNoisedIds(), api.decryptGids() & api.cancelPullMobile() TRÊN DỮ LIỆU THẬT");
        const noisedRes = await api.getNoisedIds({ fids: [ownId], gids: [] });
        console.log(`✅ /api/znoise phản hồi thành công:`, JSON.stringify(noisedRes));

        if (noisedRes.fids.length > 0) {
            const decryptedRes = await api.decryptGids(noisedRes.fids);
            console.log(`✅ /api/gid/decrypt phản hồi thành công:`, JSON.stringify(decryptedRes));
        }

        const dummyKeyPair = generateRSAKeyPair();
        await api.cancelPullMobile({ public_key: dummyKeyPair.publicKeyBase64, pc_name: "Web" });
        console.log(`✅ /api/message/cancel_pull_mobile_msg (command 12700) phản hồi thành công (error_code=0)!`);

        // -------------------------------------------------------------------------
        // BƯỚC 4 & 5: KẾT NỐI WEBSOCKET THẬT -> KIỂM ĐỊNH requestOldMessages (510/511)
        //             VÀ ĐỒNG BỘ TỪ ĐIỆN THOẠI THẬT (requestSyncFromPhone + ZDB4.0)
        // -------------------------------------------------------------------------
        printSection(4, "KIỂM ĐỊNH WEBSOCKET THẬT: requestOldMessages (cmd 510/511) & ĐỒNG BỘ ĐIỆN THOẠI (ZDB4.0)");

        let activePrivateKey = "";
        let activePublicKeyBase64 = "";
        let activePcName = "Web";
        let syncTriggered = false;
        let syncCompleted = false;

        await new Promise<void>((resolve) => {
            const maxWaitTimer = setTimeout(async () => {
                console.log("\n⏰ Đã hết thời gian chờ đồng bộ từ điện thoại (45s).");
                if (activePublicKeyBase64 && !syncCompleted) {
                    console.log("🧹 Đang gọi api.cancelPullMobile() để đóng yêu cầu đồng bộ trên điện thoại...");
                    try {
                        await api.cancelPullMobile({
                            public_key: activePublicKeyBase64,
                            pc_name: activePcName,
                        });
                        console.log("✅ Đã gọi api.cancelPullMobile() (command 12700) thành công!");
                    } catch (err) {
                        console.error("⚠️ Lỗi khi gọi cancelPullMobile:", err);
                    }
                }
                resolve();
            }, 45000);

            api.listener.on("connected", () => {
                console.log("🟢 WebSocket đã kết nối tới máy chủ Zalo thật!");
            });

            api.listener.on("unread_cleared", (items) => {
                console.log(`🧹 [unread_cleared] Nhận ${items.length} sự kiện xoá chưa đọc thật từ WebSocket!`);
            });

            api.listener.on("oa_message", (oaMsg) => {
                console.log(
                    `🏢 [oa_message] Nhận tin nhắn Zalo OA/ZNS (${oaMsg.oaData?.kind}) từ ${oaMsg.data.dName || oaMsg.data.uidFrom}: ${oaMsg.oaData?.text}`,
                );
            });

            api.listener.on("oa_event", (oaEv) => {
                console.log(`🏢 [oa_event] Sự kiện OA (${oaEv.act}): oaIds=${oaEv.oaIds.join(",")}`);
            });

            api.listener.on("old_messages", (messages, type, hasMore) => {
                const label = type === ThreadType.User ? "Cá nhân (cmd 510)" : "Nhóm (cmd 511)";
                console.log(
                    `📥 [old_messages - ${label}] Nhận ${messages.length} tin nhắn thật từ hàng đợi WebSocket (hasMore=${Boolean(hasMore)})`,
                );
                for (const m of messages.slice(0, 2)) {
                    const text =
                        typeof m.data.content === "string" ? m.data.content.slice(0, 50) : `[${m.data.msgType}]`;
                    console.log(`     • msgId=${m.data.msgId} | từ=${m.data.dName || m.data.uidFrom}: ${text}`);
                }
            });

            api.listener.on("call_event", (callEv) => {
                console.log(`📞 [call_event] Nhận tín hiệu VoIP thời gian thực: type=${callEv.type}`, callEv.data);
            });

            api.listener.on("sync_event", async (event) => {
                console.log(
                    `\n🔔 [sync_event] Nhận sự kiện đồng bộ thật từ Zalo: type=${event.type} (act=${event.act})`,
                );

                if (event.type === SyncEventType.TRANSFER_AFTER_LOGIN && !syncTriggered) {
                    syncTriggered = true;
                    console.log(
                        "🔑 Phát hiện bạn đã tích 'Đồng bộ tin nhắn' khi quét QR! Đang gửi pull_mobile_msg kèm temp_key...",
                    );
                    const session = await api.requestSyncFromPhone({ tempKey: event.data.temp_key });
                    activePrivateKey = session.privateKey;
                    activePublicKeyBase64 = session.publicKeyBase64;
                    activePcName = session.pcName;
                    console.log("✅ Đã gửi pull_mobile_msg tự động kèm temp_key!");
                } else if (event.type === SyncEventType.USER_CONFIRM) {
                    console.log(
                        "📱 BẠN ĐÃ BẤM XÁC NHẬN ĐỒNG BỘ TRÊN ĐIỆN THOẠI! (user_action=" + event.data.user_action + ")",
                    );
                    console.log("⏳ Đang chờ điện thoại đóng gói và tải file sao lưu ZDB4.0 lên máy chủ Zalo...");
                } else if (event.type === SyncEventType.SYNCMSG_INFO) {
                    syncCompleted = true;
                    console.log("📦 ĐIỆN THOẠI ĐÃ TẢI LÊN GÓI SAO LƯU THẬT!");
                    console.log(`   - Tên file: ${event.data.file_name}`);
                    console.log(`   - Dung lượng: ${event.data.file_size} bytes`);
                    console.log(`   - Checksum: ${event.data.checksum_code}`);
                    console.log(
                        `   - Thông tin DB: ${typeof event.data.db_info === "string" ? event.data.db_info : JSON.stringify(event.data.db_info)}`,
                    );

                    console.log("⬇️ Đang gọi api.getSyncData() để tải gói sao lưu thật về máy...");
                    const dlResult = await api.getSyncData({
                        url: event.data.url,
                        encrypted_key: event.data.encrypted_key,
                        file_name: event.data.file_name,
                        file_size: event.data.file_size,
                        checksum_code: event.data.checksum_code,
                        from_seq_id: event.data.from_seq_id,
                        is_full_transfer: event.data.is_full_transfer,
                        savePath: SYNC_SAVE_DIR,
                    });

                    if (dlResult.success && dlResult.data) {
                        console.log(`✅ Đã tải thành công file sao lưu thật tại: ${dlResult.data.file_path}`);
                        if (activePrivateKey) {
                            console.log("🔐 Đang giải mã khoá RSA PKCS#1 v1.5 và giải mã container ZDB4.0 thật...");
                            const rawRsa = decryptWithPrivateKey(activePrivateKey, dlResult.data.encrypted_key);
                            const aesKey = deriveZdbAesKey(rawRsa);
                            const cryptBuf = fs.readFileSync(dlResult.data.file_path);
                            const zdbPlain = decryptZdbBuffer(cryptBuf, aesKey);
                            const magic = zdbPlain.subarray(0, 6).toString("ascii");
                            const toc = parseZdbHeader(zdbPlain);
                            console.log(`🎉 GIẢI MÃ ZDB4.0 THẬT THÀNH CÔNG 100%!`);
                            console.log(`   - Magic Header: "${magic}"`);
                            console.log(`   - Tổng dung lượng giải mã: ${zdbPlain.length} bytes`);
                            console.log(
                                `   - Số lượng file SQLite (.db) bên trong gói sao lưu: ${toc.entries.length} hội thoại (XZ offset: ${toc.xzOffset})`,
                            );
                            console.log(`   - Mẫu 5 file SQLite đầu tiên:`, toc.entries.slice(0, 5));
                        }
                    } else {
                        console.error("❌ Tải file sao lưu thất bại:", dlResult.error);
                    }

                    clearTimeout(maxWaitTimer);
                    resolve();
                } else if (event.type === SyncEventType.TRANSFER_ERROR) {
                    console.warn("⚠️ Sự kiện TRANSFER_ERROR từ điện thoại:", event.data);
                }
            });

            api.listener.on("cipher_key", async () => {
                console.log("🔑 Đã nhận cipher_key thật từ WebSocket! Đang gửi requestOldMessages (cmd 510 & 511)...");
                api.listener.requestOldMessages(ThreadType.User);
                api.listener.requestOldMessages(ThreadType.Group);

                if (skipSync) {
                    setTimeout(() => {
                        clearTimeout(maxWaitTimer);
                        resolve();
                    }, 3000);
                    return;
                }

                // Đợi 2 giây xem có sự kiện TRANSFER_AFTER_LOGIN tự động không; nếu không thì chủ động bắn requestSyncFromPhone
                setTimeout(async () => {
                    if (!syncTriggered) {
                        syncTriggered = true;
                        printSection(5, "KIỂM ĐỊNH ĐỒNG BỘ TỪ ĐIỆN THOẠI THẬT (api.requestSyncFromPhone)");
                        console.log("📡 Đang gọi api.requestSyncFromPhone() (pull_mobile_msg, command 12000)...");
                        const session = await api.requestSyncFromPhone({ pcName: "Web" });
                        activePrivateKey = session.privateKey;
                        activePublicKeyBase64 = session.publicKeyBase64;
                        activePcName = session.pcName;
                        console.log("✅ ĐÃ BẮN TÍN HIỆU ĐỒNG BỘ THÀNH CÔNG!");
                        console.log(
                            "👉 HÃY NHÌN VÀO ĐIỆN THOẠI CỦA BẠN: Mở thông báo Zalo và bấm 'Đồng bộ ngay' (trong vòng 40 giây)!",
                        );
                        console.log(
                            "   (Nếu bạn không bấm, sau 40 giây script sẽ tự động test luôn api.cancelPullMobile để thu hồi thông báo)",
                        );
                    }
                }, 2500);
            });

            api.listener.start();
        });
    }

    // -------------------------------------------------------------------------
    // BƯỚC 6: KIỂM ĐỊNH THỰC TẾ CALL ENGINE (HTTP 401/416 + UDP ZRTP 0x01 0x7e + ĐÀM THOẠI 2 CHIỀU)
    // -------------------------------------------------------------------------
    printSection(6, "KIỂM ĐỊNH THỰC TẾ BỘ MÁY GỌI (ZALO PRODUCTION SERVER + UDP RELAY)");
    const voiceCallUrls = api.zpwServiceMap.voice_call;
    console.log(`✅ Endpoint dịch vụ Voice Call của tài khoản: ${JSON.stringify(voiceCallUrls)}`);

    // Pha 6.1: Tự động kiểm định cấp phát phiên (401) + Bắt tay UDP 0x01 0x7e trực tiếp với Máy chủ Relay UDP thật của Zalo
    let probeUid = targetCallUid ?? "5249661060655759359"; // Mặc định: Ly Van Bong (0332606964)
    if (!probeUid) {
        try {
            const friends = await api.friend.getAllFriends();
            const firstFriend = Array.isArray(friends)
                ? friends.find((f) => f.userId && f.userId !== ownId && f.userId !== "7613400763746053261")
                : undefined;
            if (firstFriend) {
                probeUid = firstFriend.userId;
            }
        } catch {
            // ignore
        }
    }

    if (probeUid) {
        console.log(
            `\n🔬 [Pha 6.1] Kiểm định bắt tay UDP ZRTP (0x01 0x7e) trực tiếp với Máy chủ Relay Zalo thật (probe UID: ${probeUid})...`,
        );
        console.log(
            `   (Lưu ý: Bước 401 + UDP 0x01 0x7e chỉ xin cấp phát phòng và bắt tay với Server UDP của Zalo, CHƯA làm đổ chuông máy người nhận)`,
        );
        const probeCallId = Math.floor(Math.random() * 1_000_000_000);
        const serverInfo = await api.call.requestVoiceCall(probeUid, {
            callType: CallType.Audio,
            callId: probeCallId,
        });
        const rtpAddr = serverInfo.rtpServer ?? serverInfo.rtpIP ?? serverInfo.servers?.[0]?.rtpaddr ?? "";
        const fromUid = Number(serverInfo.fromId) || uidToUint32(ownId);
        const toUid = Number(serverInfo.toId) || uidToUint32(probeUid);
        console.log(`✅ [HTTP 401 Thành công] Server Zalo cấp phát phiên thật:`);
        console.log(`   - callId   : ${serverInfo.callId}`);
        console.log(`   - fromId   : ${fromUid}`);
        console.log(`   - toId     : ${toUid}`);
        console.log(`   - sessId   : ${serverInfo.sessId}`);
        console.log(`   - rtpAddr  : ${rtpAddr}`);
        console.log(`   - zrtpKey  : ${serverInfo.zrtpKey ?? "(none)"}`);
        console.log(`   - servers  : ${JSON.stringify(serverInfo.servers ?? [])}`);

        if (rtpAddr.includes(":")) {
            const [rtpHost, rtpPortStr] = rtpAddr.split(":");
            const rtpPort = Number.parseInt(rtpPortStr, 10);
            const udpSock = dgram.createSocket("udp4");

            const initReq = buildInitCallRequest({
                isCaller: true,
                seqNum: 0,
                headerCallId: probeCallId,
                callId: probeCallId,
                fromUid,
                toUid,
                subFlags: toUid,
                sessId: serverInfo.sessId,
            });

            console.log(
                `📡 Đang bắn gói UDP InitCall (0x01 0x7e, ${initReq.length} bytes) tới máy chủ Zalo Relay ${rtpHost}:${rtpPort}...`,
            );
            const udpResp = await new Promise<Buffer | null>((resolve) => {
                const timer = setTimeout(() => resolve(null), 4000);
                udpSock.once("message", (msg) => {
                    clearTimeout(timer);
                    resolve(msg);
                });
                udpSock.send(initReq, rtpPort, rtpHost);
            });

            if (udpResp) {
                const parsed = parseZRTPPacket(udpResp);
                console.log(
                    `🎉 [UDP 0x02 0x7e THÀNH CÔNG] Nhận phản hồi trực tiếp từ Máy chủ UDP Relay của Zalo (${udpResp.length} bytes):`,
                );
                console.log(`   - Hex raw      : ${udpResp.toString("hex")}`);
                console.log(`   - Parsed packet:`, parsed);

                if (parsed.family === "control") {
                    const pingReq = buildPingRequest({
                        seqNum: 1,
                        callId: probeCallId,
                        fromUid,
                        toUid,
                        elapsedMs: 100,
                    });
                    udpSock.send(pingReq, rtpPort, rtpHost);
                    console.log(`✅ Đã gửi gói UDP Ping (cmd=5, 40 bytes) tới ${rtpHost}:${rtpPort}!`);
                }
            } else {
                console.log(
                    `⚠️ Không nhận được phản hồi UDP trong 4s từ ${rtpHost}:${rtpPort} (có thể mạng chặn UDP hoặc server chờ Callee).`,
                );
            }
            udpSock.close();
        }
    }

    // Pha 6.2: Nếu có truyền --call <UID> hoặc bật chế độ tương tác cuộc gọi thật 2 chiều
    if (targetCallUid) {
        console.log(
            `\n📞 [Pha 6.2] Đang thực hiện cuộc gọi 2 chiều thật bằng ZaloRtcSession tới UID ${targetCallUid}...`,
        );
        const rtcSession = api.call.createRtcSession({
            enableSrtp: false,
            packetMode: 2,
        });

        rtcSession.on("state", (st) => {
            console.log(`🔄 [ZaloRtcSession State] -> ${st}`);
        });
        rtcSession.on("zrtp_control", (pkt) => {
            console.log(
                `📥 [UDP Control từ Zalo Relay] cmd=${pkt.cmd}, isResponse=${pkt.isResponse}, routingToken=${pkt.routingToken ?? "N/A"}, errorCode=${pkt.errorCode ?? "N/A"}`,
            );
        });
        rtcSession.on("rtp_packet", (ev) => {
            console.log(
                `🔊 [UDP Media từ đối phương] isVideo=${ev.isVideo}, seq=${ev.parsedRtp.sequenceNumber}, ts=${ev.parsedRtp.timestamp}, payload=${ev.parsedRtp.payload.length}B`,
            );
        });

        api.listener.start();
        const connParams = await rtcSession.startOutgoingCall(targetCallUid, {
            callType: videoOnly ? CallType.Video : CallType.Audio,
        });
        console.log(`✅ Đã khởi tạo cuộc gọi & đổ chuông thật! Thông số kết nối:`, connParams);
        console.log(`👉 Hãy bấm NGHE MÁY trên điện thoại người nhận (chờ 20 giây)...`);

        await new Promise((r) => setTimeout(r, 20000));
        await rtcSession.endCall();
        console.log(`✅ Đã kết thúc cuộc gọi kiểm thử!`);
    } else if (onlyCall) {
        console.log(`\n🎧 [Pha 6.2 - Chế độ Đợi Cuộc Gọi Đến / Tương Tác Trực Tiếp trong 60 giây]:`);
        console.log(
            `   👉 CÁCH 1: Lấy một tài khoản Zalo khác bấm GỌI THOẠI vào tài khoản vừa đăng nhập này -> Script sẽ TỰ ĐỘNG BẮT MÁY và giữ kết nối đàm thoại!`,
        );
        console.log(
            `   👉 CÁCH 2: Hoặc mở Zalo trên điện thoại của bạn, vào bất kỳ cuộc trò chuyện nào và nhắn tin chữ "call" -> Script sẽ tự động gọi cho người đó!`,
        );

        await new Promise<void>((resolve) => {
            const maxTimer = setTimeout(() => {
                console.log("⏱️ Đã hết 60 giây chờ tương tác cuộc gọi.");
                resolve();
            }, 60000);

            api.listener.on("call_event", async (event) => {
                console.log(`\n🔔 [WebSocket call_event] act=${event.act}, type=${event.type}, data=`, event.data);
                if (event.type === CallEventType.REQUEST) {
                    console.log(
                        `📲 Phát hiện cuộc gọi đến! Đang tự động bắt máy bằng ZaloRtcSession.acceptIncomingCall()...`,
                    );
                    try {
                        const rtcSession = api.call.createRtcSession({ enableSrtp: false });
                        rtcSession.on("state", (st) => console.log(`🔄 [ZaloRtcSession State] -> ${st}`));
                        rtcSession.on("zrtp_control", (pkt) =>
                            console.log(`📥 [UDP Control] cmd=${pkt.cmd}, routingToken=${pkt.routingToken}`),
                        );
                        rtcSession.on("rtp_packet", (pkt) =>
                            console.log(
                                `🔊 [Nhận gói RTP thật từ điện thoại] seq=${pkt.parsedRtp.sequenceNumber}, len=${pkt.parsedRtp.payload.length}B`,
                            ),
                        );
                        const params = await rtcSession.acceptIncomingCall(event);
                        console.log(
                            `🎉 ĐÃ BẮT MÁY THÀNH CÔNG! Điện thoại của bạn hiện đang trong cuộc gọi thật:`,
                            params,
                        );
                        setTimeout(async () => {
                            await rtcSession.endCall();
                            clearTimeout(maxTimer);
                            resolve();
                        }, 15000);
                    } catch (err) {
                        console.error("❌ Lỗi khi bắt máy:", err);
                    }
                }
            });

            api.listener.on("message", async (msg) => {
                const text = typeof msg.data.content === "string" ? msg.data.content.trim().toLowerCase() : "";
                if (text === "call" && msg.type === ThreadType.User) {
                    console.log(
                        `\n📲 Nhận lệnh "call" trong hội thoại với ${msg.threadId}! Đang gọi bằng ZaloRtcSession...`,
                    );
                    try {
                        const rtcSession = api.call.createRtcSession({ enableSrtp: false });
                        rtcSession.on("state", (st) => console.log(`🔄 [ZaloRtcSession State] -> ${st}`));
                        rtcSession.on("zrtp_control", (pkt) =>
                            console.log(`📥 [UDP Control] cmd=${pkt.cmd}, routingToken=${pkt.routingToken}`),
                        );
                        rtcSession.on("rtp_packet", (pkt) =>
                            console.log(
                                `🔊 [Nhận gói RTP thật từ điện thoại] seq=${pkt.parsedRtp.sequenceNumber}, len=${pkt.parsedRtp.payload.length}B`,
                            ),
                        );
                        const params = await rtcSession.startOutgoingCall(msg.threadId, {
                            callType: CallType.Audio,
                        });
                        console.log(`🎉 ĐÃ ĐỔ CHUÔNG THẬT TỚI ${msg.threadId}! Hãy bấm nghe máy:`, params);
                        setTimeout(async () => {
                            await rtcSession.endCall();
                            clearTimeout(maxTimer);
                            resolve();
                        }, 20000);
                    } catch (err) {
                        console.error("❌ Lỗi khi gọi đi:", err);
                    }
                }
            });

            api.listener.start();
        });
    }

    api.listener.stop();
    console.log("\n======================================================================");
    console.log("🎉 HOÀN TẤT TOÀN BỘ KỊCH BẢN KIỂM ĐỊNH TRÊN DỮ LIỆU THẬT!");
    console.log("======================================================================\n");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Lỗi trong quá trình kiểm định thực tế:", err);
    process.exit(1);
});
