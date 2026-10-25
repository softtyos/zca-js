import type { API } from "../../apis.js";
import { ZaloCallController, type ZaloCallControllerOptions } from "../../call-engine/ZaloCallController.js";
import type { ContextSession } from "../../context.js";

/**
 * Khởi tạo bộ điều phối cuộc gọi thuần TypeScript `ZaloCallController` (tích hợp `ZaloRtcSession` và kênh IPC `ZaloCallTransport`).
 */
export function createControllerFactory(_ctx: ContextSession, api: API) {
    return function createController(options: ZaloCallControllerOptions = {}): ZaloCallController {
        return new ZaloCallController(api, options);
    };
}
