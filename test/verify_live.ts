import fs from "node:fs";
import path from "node:path";
import {
    Zalo,
    LoginQRCallbackEventType,
    ThreadType,
    SyncEventType,
    CallType,
    decryptWithPrivateKey,
    deriveZdbAesKey,
    decryptZdbBuffer,
} from "../src/index.js";

/**
 * ============================================================================
 * KỊCH BẢN KIỂM ĐỊNH THỰC TẾ TRÊN SERVER ZALO (LIVE E2E VERIFICATION)
 * Cách chạy:
 *   1. Kiểm định an toàn (chỉ đọc: preloadConversations, getNoisedIds, requestOldMessages):
 *      npx tsx test/verify_live.ts
 *   2. Kiểm định kích hoạt đồng bộ về điện thoại thật (requestSyncFromPhone + cancelPullMobile):
 *      npx tsx test/verify_live.ts --sync-mobile
 *   3. Kiểm định gọi điện đổ chuông thật (sendVoiceCall + tự động cancel sau 5s):
 *      npx tsx test/verify_live.ts --call <USER_ID_NGUOI_NHAN>
 * ============================================================================
 */

async function runLiveVerification() {
    const credPath = path.resolve("./test/credentials.json");
    if (!fs.existsSync(credPath)) {
        console.error("❌ Không tìm thấy file ./test/credentials.json để kiểm định Live.");
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const testSyncMobile = args.includes("--sync-mobile");
    const callIdx = args.indexOf("--call");
    const targetCalleeId = callIdx !== -1 ? args[callIdx + 1] : undefined;

    console.log("🔐 Đang đăng nhập Zalo bằng ./test/credentials.json...");
    const zalo = new Zalo({ selfListen: true, logging: false });
    let api;
    try {
        if (fs.existsSync(credPath) && !args.includes("--qr")) {
            const creds = JSON.parse(fs.readFileSync(credPath, "utf-8"));
            api = await zalo.login(creds);
        } else {
            throw new Error("Force QR login");
        }
    } catch {
        console.log("⚠️ Cookie trong ./test/credentials.json đã hết hạn hoặc chọn --qr. Đang tạo mã QR tại ./test/qr.png...");
        api = await zalo.loginQR({ qrPath: "./test/qr.png" }, (event) => {
            if (event.type === LoginQRCallbackEventType.QRCodeGenerated) {
                console.log("👉 Vui lòng mở Zalo trên điện thoại và quét mã QR tại file ./test/qr.png!");
            }
            if (event.type === LoginQRCallbackEventType.GotLoginInfo) {
                fs.writeFileSync(credPath, JSON.stringify(event.data, null, 2));
                console.log("💾 Đã lưu credentials mới vào ./test/credentials.json");
            }
        });
    }
    console.log(`✅ Đăng nhập thành công! Own UID: ${api.getOwnId()}\n`);

    // 1. Kiểm định Live: preloadConversations (/api/preloadconvers/get-last-msgs)
    console.log("📡 [1/3] Đang gọi api.preloadConversations()...");
    const preload = await api.preloadConversations();
    console.log(
        `   ✅ preloadConversations thành công! Nhận được ${preload.messages.length} tin nhắn mới nhất & ${preload.unreadCleared.length} trạng thái đã đọc.`,
    );

    // 2. Kiểm định Live: getNoisedIds (/api/znoise)
    console.log("📡 [2/3] Đang gọi api.getNoisedIds()...");
    const noised = await api.getNoisedIds({ fids: [api.getOwnId()], gids: [] });
    console.log(`   ✅ getNoisedIds phản hồi hợp lệ: fids=${JSON.stringify(noised.fids)}`);

    // 3. Kiểm định Tuỳ chọn: Gọi điện thoại (--call <calleeId>)
    if (targetCalleeId) {
        console.log(`\n📞 [CALL TEST] Đang gọi thử tới UID ${targetCalleeId}...`);
        const callInfo = await api.sendVoiceCall(targetCalleeId, { callType: CallType.Audio });
        console.log(`   ✅ Đã đổ chuông! callId=${callInfo.callId}, sessId=${callInfo.sessId}, rtp=${callInfo.rtpServer}`);
        console.log("   ⏳ Đang chờ 5 giây trước khi tự động huỷ cuộc gọi (cancelVoiceCall)...");
        await new Promise((r) => setTimeout(r, 5000));
        await api.cancelVoiceCall(targetCalleeId, callInfo.callId);
        console.log("   ✅ Đã huỷ cuộc gọi thành công!");
    }

    // 4. Kiểm định Live WebSocket: requestOldMessages (cmd 510/511) & sync_event
    console.log("\n📡 [3/3] Đang kết nối WebSocket Listener để kiểm định requestOldMessages (cmd 510/511)...");
    await new Promise<void>((resolve) => {
        let oldUserDone = false;
        let oldGroupDone = false;
        const finishTimer = setTimeout(() => {
            console.log("   ℹ️ Hoàn tất thời gian chờ WebSocket.");
            resolve();
        }, testSyncMobile ? 15000 : 6000);

        api.listener.on("old_messages", (msgs, type, hasMore) => {
            const label = type === ThreadType.User ? "Cá nhân (510)" : "Nhóm (511)";
            console.log(`   ✅ Nhận sự kiện old_messages [${label}]: ${msgs.length} tin nhắn (hasMore=${Boolean(hasMore)})`);
            if (type === ThreadType.User) oldUserDone = true;
            if (type === ThreadType.Group) oldGroupDone = true;
            if (oldUserDone && oldGroupDone && !testSyncMobile) {
                clearTimeout(finishTimer);
                resolve();
            }
        });

        api.listener.on("sync_event", async (event) => {
            console.log(`   🔔 Nhận sự kiện sync_event: type=${event.type}`);
            if (event.type === SyncEventType.SYNCMSG_INFO) {
                const res = await api.getSyncData({ ...event.data, savePath: "./sync_data" });
                console.log("   ✅ Đã tải gói sao lưu ZDB4.0:", res);
            }
        });

        api.listener.on("cipher_key", async () => {
            console.log("   🔑 Đã nhận cipher_key từ Zalo WebSocket, đang gửi requestOldMessages...");
            api.listener.requestOldMessages(ThreadType.User);
            api.listener.requestOldMessages(ThreadType.Group);

            if (testSyncMobile) {
                console.log("   📱 [--sync-mobile] Đang gửi yêu cầu đồng bộ tới điện thoại (requestSyncFromPhone)...");
                const session = await api.requestSyncFromPhone();
                console.log(`   ✅ Đã gửi pull_mobile_msg (publicKey length=${session.publicKeyBase64.length})!`);
                console.log("   ⏳ Sẽ tự động gửi cancelPullMobile sau 8 giây để dọn dẹp...");
                setTimeout(async () => {
                    await api.cancelPullMobile({ public_key: session.publicKeyBase64, pc_name: session.pcName });
                    console.log("   ✅ Đã gửi cancelPullMobile thành công!");
                    clearTimeout(finishTimer);
                    resolve();
                }, 8000);
            }
        });

        api.listener.start();
    });

    api.listener.stop();
    console.log("\n🎉 Hoàn tất kiểm định Live trên máy chủ Zalo!");
    process.exit(0);
}

void decryptWithPrivateKey;
void deriveZdbAesKey;
void decryptZdbBuffer;

runLiveVerification().catch((err) => {
    console.error("❌ Lỗi kiểm định Live:", err);
    process.exit(1);
});
