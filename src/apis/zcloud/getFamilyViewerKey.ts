import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DEFAULTS, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";

export type GetFamilyViewerKeyResponse = {
    viewer_key: string;
    enk: string;
};

export const getFamilyViewerKeyFactory = apiFactory<GetFamilyViewerKeyResponse>()((_api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${ZALO_DOMAINS.WPA_CHAT}${ZALO_ENDPOINTS.WPA.GET_FAMILY_VIEWER_KEY}`);

    /**
     * Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho gói gia đình ZFamily (command 12759).
     * Tự động cache trong bộ nhớ `ctx.zfamilyViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp.
     *
     * @param forceRefresh Đặt `true` nếu muốn bỏ qua bộ nhớ đệm và bắt buộc lấy khóa mới từ máy chủ
     * @throws {ZaloApiError}
     */
    return async function getFamilyViewerKey(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && ctx.zfamilyViewerKeyCache && ctx.zfamilyViewerKeyCache.expiresAt > now) {
            return {
                viewer_key: ctx.zfamilyViewerKeyCache.viewer_key,
                enk: ctx.zfamilyViewerKeyCache.enk,
            };
        }

        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        const res = await utils.resolve(response);
        let parsed: GetFamilyViewerKeyResponse;
        if (typeof res === "string") {
            try {
                parsed = JSON.parse(res) as GetFamilyViewerKeyResponse;
            } catch {
                throw new ZaloApiError("Failed to parse FamilyViewerKey response");
            }
        } else {
            parsed = res;
        }

        if (parsed?.viewer_key && parsed?.enk) {
            ctx.zfamilyViewerKeyCache = {
                viewer_key: parsed.viewer_key,
                enk: parsed.enk,
                expiresAt: now + ZALO_DEFAULTS.ZCLOUD.VIEWER_KEY_CACHE_TTL_MS,
            };
        }

        return parsed;
    };
});
