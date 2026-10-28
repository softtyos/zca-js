import fs from "node:fs";
import { CallType, Zalo, type Credentials } from "../src/index.js";

/**
 * Ví dụ sử dụng ZaloRtcSession để:
 * 1. Khởi tạo cuộc gọi 1-1 (Audio / Video 2 chiều) hoặc Gọi Nhóm (GroupAudio / GroupVideo qua Zavi SFU)
 * 2. Tự động đổ chuông & bắt máy khi có cuộc gọi 1-1 hoặc Gọi Nhóm đến
 * 3. Lắng nghe luồng âm thanh Opus (16kHz Mono) và hình ảnh H.264 Annex-B (tự động phân luồng partnerId từ CSRC[0])
 */
const zalo = new Zalo({ selfListen: true });

const credentialsPath = "./test/credentials.json";
const saved: Partial<Credentials> = fs.existsSync(credentialsPath)
    ? JSON.parse(fs.readFileSync(credentialsPath, "utf-8"))
    : {};

const api =
    saved.cookie && saved.imei && saved.userAgent
        ? await zalo.login(saved as Credentials)
        : await zalo.loginQR({ qrPath: "./qr.png" });

const session = api.call.createRtcSession({
    autoAttachListener: true,
    autoKeepaliveMedia: true,
});

session.on("state", (state) => {
    console.log(`[Call State] -> ${state}`);
});

session.on("audio_frame", (frame) => {
    // frame.payload: Buffer (Opus 16kHz Mono), frame.ssrc: number
    if (frame.sequenceNumber % 100 === 0) {
        console.log(`[Audio In] ssrc=${frame.ssrc} seq=${frame.sequenceNumber} bytes=${frame.payload.length}`);
    }
});

session.on("video_annexb_frame", (frame) => {
    // frame.annexB: Buffer (00 00 00 01 + SPS/PPS/IDR/P-Slice)
    // frame.partnerId?: string (Zalo UID 19 chữ số của người phát trong Group Call)
    if (frame.isKeyframe) {
        console.log(
            `[Video Keyframe In] partner=${frame.partnerId ?? "peer"} ssrc=${frame.ssrc} bytes=${frame.annexB.length}`,
        );
    }
});

session.on("media_state_change", (ev) => {
    console.log("[Media State Change]", {
        rawAct: ev.rawAct,
        partnerId: ev.partnerId,
        isMicMuted: ev.isMicMuted,
        isCameraOn: ev.isCameraOn,
    });
});

session.on("ended", (reason) => {
    console.log(`[Call Ended] reason=${reason}`);
});

// Tự động bắt máy khi nhận cuộc gọi 1-1 hoặc Gọi Nhóm đến
api.listener.on("call_event", async (ev) => {
    if (ev.act === "request") {
        console.log("📲 Có cuộc gọi 1-1 đến, đang báo đổ chuông và bắt máy...");
        await session.ringIncomingCall(ev);
        await session.acceptIncomingCall(ev, { skipRingRing: true });
    } else if (ev.act === "group_request") {
        console.log("👥 Có lời mời Gọi Nhóm đến, đang báo đổ chuông và tham gia phòng Zavi SFU...");
        await session.ringIncomingCall(ev);
        await session.acceptIncomingGroupCall(ev, { skipRingRing: true });
    }
});

api.listener.start({ retryOnClose: true });

// Tuỳ chọn: Truyền tham số dòng lệnh để thử gọi đi ngay:
//   npx tsx examples/call_session.ts --call 5249661060655759359
//   npx tsx examples/call_session.ts --group 1493339370763911324 5249661060655759359
const args = process.argv.slice(2);
if (args[0] === "--call" && args[1]) {
    const params = await session.startOutgoingCall(args[1], {
        callType: CallType.Video,
    });
    console.log("🚀 Đã khởi tạo cuộc gọi Video 1-1:", params.callId, params.rtpAddress);
} else if (args[0] === "--group" && args[1] && args[2]) {
    const grpParams = await session.startGroupCall(args[1], args.slice(2), {
        callType: CallType.GroupVideo,
    });
    console.log("🚀 Đã mở phòng Gọi Nhóm Video Zavi SFU:", grpParams.callId, grpParams.rtpAddress);
}
