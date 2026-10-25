import type { API } from "../../apis.js";
import { ZaloRtcSession, type ZaloRtcSessionOptions } from "../../call-engine/ZaloRtcSession.js";
import type { ContextSession } from "../../context.js";

/**
 * Khởi tạo phiên gọi Thoại & Video thuần TypeScript / Node.js (`ZaloRtcSession` — UDP `ZRTPPacket` + `SRTP`)
 * hoạt động độc lập 100% trên Worker / Server / Desktop / Mobile Bridge mà không cần cài đặt Zalo PC.
 */
export function createRtcSessionFactory(_ctx: ContextSession, api: API) {
    return function createRtcSession(options: ZaloRtcSessionOptions = {}): ZaloRtcSession {
        return new ZaloRtcSession(api, options);
    };
}
