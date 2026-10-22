import {
    Zalo,
    LoginQRCallbackEventType,
    ThreadType,
    SyncEventType,
    CallType,
    decryptWithPrivateKey,
    deriveZdbAesKey,
    decryptZdbBuffer,
    parseZdbHeader,
} from "../src/index.js";
import fs from "node:fs";

/**
 * ==============================================================================
 * ZCA-JS: HƯỚNG DẪN ĐỒNG BỘ TIN NHẮN & LẤY BÙ TIN NHẮN KHI MẤT KẾT NỐI
 * ==============================================================================
 */

// ==============================================================================
// 🟢 TRƯỜNG HỢP 1: LẤY BÙ TIN NHẮN KHI MỞ LẠI APP / SAU KHI MẤT KẾT NỐI WEBSOCKET
// ==============================================================================
export async function exampleCase1_CatchUpMissedMessages() {
    console.log("=== TRƯỜNG HỢP 1: LẤY BÙ TIN NHẮN KHI MỞ LẠI APP ===");

    const creds = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));
    const zalo = new Zalo({ selfListen: true, logging: true });
    const api = await zalo.login(creds);

    // Bước 1: Gọi preloadConversations để lấy danh sách tin nhắn mới nhất & trạng thái đã đọc
    const preload = await api.preloadConversations();
    console.log(`📦 Preload: ${preload.messages.length} tin nhắn mới nhất, ${preload.unreadCleared.length} hội thoại đã đọc.`);

    // Bước 2: Lắng nghe tin nhắn hàng đợi (cmd 510 / 511) từ WebSocket
    api.listener.on("old_messages", (messages, type, hasMore) => {
        console.log(
            `📥 [HÀNG ĐỢI OFFLINE] Nhận ${messages.length} tin nhắn (${type === ThreadType.User ? "Cá nhân" : "Nhóm"}, còn tiếp: ${Boolean(hasMore)})`,
        );
    });

    // Bước 3: Khi WebSocket nhận được cipher_key, yêu cầu Zalo đẩy hàng đợi tin nhắn nhỡ về
    api.listener.on("cipher_key", () => {
        api.listener.requestOldMessages(ThreadType.User);
        api.listener.requestOldMessages(ThreadType.Group);
    });

    api.listener.start({ retryOnClose: true });
}

// ==============================================================================
// 🔵 TRƯỜNG HỢP 2: TỰ ĐỘNG ĐỒNG BỘ KHI ĐĂNG NHẬP QR (AUTO-SYNC ON LOGIN)
// ==============================================================================
export async function exampleCase2_AutoSyncOnLogin() {
    console.log("=== TRƯỜNG HỢP 2: TỰ ĐỘNG ĐỒNG BỘ KHI ĐĂNG NHẬP QR ===");

    const zalo = new Zalo({ selfListen: true, logging: true });
    const api = await zalo.loginQR({ qrPath: "./qr.png" }, (event) => {
        if (event.type === LoginQRCallbackEventType.QRCodeGenerated) {
            console.log("👉 Mở app Zalo trên điện thoại quét mã QR trong file qr.png.");
            console.log("👉 Tích chọn 'Đồng bộ tin nhắn' trước khi bấm Đăng nhập!");
        }
        if (event.type === LoginQRCallbackEventType.GotLoginInfo) {
            fs.writeFileSync("./credentials.json", JSON.stringify(event.data, null, 2));
        }
    });

    let activePrivateKey = "";

    api.listener.on("sync_event", async (event) => {
        // Khi quét QR có tích chọn "Đồng bộ tin nhắn", Zalo đẩy temp_key qua sự kiện TRANSFER_AFTER_LOGIN
        if (event.type === SyncEventType.TRANSFER_AFTER_LOGIN) {
            console.log("🔑 Nhận được temp_key từ phiên đăng nhập QR, đang tự động kéo dữ liệu...");
            const syncSession = await api.requestSyncFromPhone({ tempKey: event.data.temp_key });
            activePrivateKey = syncSession.privateKey;
        } else if (event.type === SyncEventType.SYNCMSG_INFO && activePrivateKey) {
            console.log("📦 Điện thoại đã tải lên bản sao lưu:", event.data.file_name);
            const downloadRes = await api.getSyncData({
                ...event.data,
                savePath: "./sync_data",
            });
            if (downloadRes.success && downloadRes.data) {
                console.log("✅ Đã lưu file sao lưu tại:", downloadRes.data.file_path);
            }
        }
    });

    api.listener.start();
}

// ==============================================================================
// 🟣 TRƯỜNG HỢP 3: KÍCH HOẠT ĐỒNG BỘ THỦ CÔNG TỪ XA SANG ĐIỆN THOẠI (PULL MOBILE)
// ==============================================================================
export async function exampleCase3_ManualTriggerSyncFromPhone() {
    console.log("\n=== TRƯỜNG HỢP 3: KÍCH HOẠT ĐỒNG BỘ THỦ CÔNG TỪ XA ===");

    const creds = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));
    const zalo = new Zalo({ selfListen: true, logging: true });
    const api = await zalo.login(creds);

    let privateKeyPem = "";

    api.listener.on("sync_event", async (event) => {
        if (event.type === SyncEventType.USER_CONFIRM) {
            console.log("📱 Người dùng đã bấm xác nhận trên điện thoại, đang chờ điện thoại tải gói tin nhắn lên...");
        } else if (event.type === SyncEventType.SYNCMSG_INFO) {
            console.log("📦 Đã nhận thông tin gói sao lưu ZDB4.0:", event.data.file_name);
            const result = await api.getSyncData({
                url: event.data.url,
                encrypted_key: event.data.encrypted_key,
                file_name: event.data.file_name,
                file_size: event.data.file_size,
                checksum_code: event.data.checksum_code,
                from_seq_id: event.data.from_seq_id,
                is_full_transfer: event.data.is_full_transfer,
                savePath: "./sync_data",
            });

            if (result.success && result.data && privateKeyPem) {
                const rawRsaKey = decryptWithPrivateKey(privateKeyPem, result.data.encrypted_key);
                const aesKey = deriveZdbAesKey(rawRsaKey);
                const encryptedBuf = fs.readFileSync(result.data.file_path);
                const zdbPlaintext = decryptZdbBuffer(encryptedBuf, aesKey);
                const toc = parseZdbHeader(zdbPlaintext);
                fs.writeFileSync(`${result.data.file_path}.zdb`, zdbPlaintext);
                console.log(
                    `🔓 Đã giải mã thành công container ZDB4.0 (${zdbPlaintext.length} bytes, ${toc.entries.length} hội thoại SQLite)!`,
                );
            }
        } else if (event.type === SyncEventType.TRANSFER_ERROR) {
            console.error("⚠️ Lỗi đồng bộ từ điện thoại:", event.data);
        }
    });

    api.listener.on("cipher_key", async () => {
        console.log("🟢 WebSocket đã sẵn sàng! Đang gửi yêu cầu đồng bộ sang điện thoại...");
        const session = await api.requestSyncFromPhone({ pcName: "Web" });
        privateKeyPem = session.privateKey;
        console.log("👉 Vui lòng mở app Zalo trên điện thoại và bấm 'Đồng bộ ngay'!");
    });

    api.listener.start();
}

// ==============================================================================
// 🟠 TRƯỜNG HỢP 4: KHỞI TẠO CUỘC GỌI THOẠI & GỌI VIDEO (SIGNALING 2 BƯỚC)
// ==============================================================================
export async function exampleCase4_VoiceAndVideoCall(targetUid: string) {
    console.log("\n=== TRƯỜNG HỢP 4: GỌI THOẠI & GỌI VIDEO ===");

    const creds = JSON.parse(fs.readFileSync("./credentials.json", "utf-8"));
    const zalo = new Zalo({ selfListen: true, logging: true });
    const api = await zalo.login(creds);

    // 1. Gọi Video (CallType.Video = 3)
    const videoCall = await api.sendVoiceCall(targetUid, { callType: CallType.Video });
    console.log(`📹 Đang đổ chuông Video tới ${targetUid} (callId=${videoCall.callId}, rtp=${videoCall.rtpServer})`);

    await new Promise((r) => setTimeout(r, 5000));
    await api.cancelVoiceCall(targetUid, videoCall.callId, { callType: CallType.Video });
    console.log("✅ Đã huỷ cuộc gọi Video thành công!");
}
