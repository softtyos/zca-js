import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DEFAULTS, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";

export type GetCloudViewerKeyResponse = {
    viewer_key: string;
    enk: string;
};

export const getCloudViewerKeyFactory = apiFactory<GetCloudViewerKeyResponse>()((_api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${ZALO_DOMAINS.WPA_CHAT}${ZALO_ENDPOINTS.WPA.GET_CLOUD_VIEWER_KEY}`);

    /**
     * Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho hệ thống ZCloud / MyCloud (command 12741).
     * Tự động cache trong bộ nhớ `ctx.zcloudViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp.
     *
     * @param forceRefresh Đặt `true` nếu muốn bỏ qua bộ nhớ đệm và bắt buộc lấy khóa mới từ máy chủ
     * @throws {ZaloApiError}
     */
    return async function getCloudViewerKey(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && ctx.zcloudViewerKeyCache && ctx.zcloudViewerKeyCache.expiresAt > now) {
            return {
                viewer_key: ctx.zcloudViewerKeyCache.viewer_key,
                enk: ctx.zcloudViewerKeyCache.enk,
            };
        }

        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        const res = await utils.resolve(response);
        let parsed: GetCloudViewerKeyResponse;
        if (typeof res === "string") {
            try {
                parsed = JSON.parse(res) as GetCloudViewerKeyResponse;
            } catch {
                throw new ZaloApiError("Failed to parse CloudViewerKey response");
            }
        } else {
            parsed = res;
        }

        if (parsed?.viewer_key && parsed?.enk) {
            ctx.zcloudViewerKeyCache = {
                viewer_key: parsed.viewer_key,
                enk: parsed.enk,
                expiresAt: now + ZALO_DEFAULTS.ZCLOUD.VIEWER_KEY_CACHE_TTL_MS,
            };
        }

        return parsed;
    };
});
