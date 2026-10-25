import type { API } from "../apis.js";
import type { ContextSession } from "../context.js";
import { ZaloCallController, type ZaloCallControllerOptions } from "./ZaloCallController.js";
import { ZaloRtcSession, type ZaloRtcSessionOptions } from "./ZaloRtcSession.js";

export * from "./ZRTPPacketCodec.js";
export * from "./ZaloSrtpSession.js";
export * from "./ZaloRtcSession.js";
export * from "./ZaloCallTransport.js";
export * from "./ZaloCallController.js";

/**
 * Factory khởi tạo phiên gọi thuần TypeScript / Node.js (`ZaloRtcSession` — UDP `ZRTPPacket` + `SRTP`)
 * không phụ thuộc Zalo PC, dùng cho Worker / Server / Mobile Bridge / Desktop.
 */
export function createRtcSessionFactory(_ctx: ContextSession, api: API) {
    return function createRtcSession(options: ZaloRtcSessionOptions = {}): ZaloRtcSession {
        return new ZaloRtcSession(api, options);
    };
}

/**
 * Factory khởi tạo bộ điều phối cuộc gọi thuần TypeScript `ZaloCallController` (`ZaloRtcSession` + `ZaloCallTransport`).
 */
export function createCallControllerFactory(_ctx: ContextSession, api: API) {
    return function createController(options: ZaloCallControllerOptions = {}): ZaloCallController {
        return new ZaloCallController(api, options);
    };
}
