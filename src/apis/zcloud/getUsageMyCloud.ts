import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetUsageMyCloudResponse = {
    usage: number;
    quota: number;
    plan: number;
};

export const getUsageMyCloudFactory = apiFactory<GetUsageMyCloudResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.USAGE_MYCLOUD}`);

    /**
     * Kiểm tra hạn mức và dung lượng sử dụng Cloud của tôi (MyCloud - command 12748)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.
     * @throws {ZaloApiError}
     */
    return async function getUsageMyCloud(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<GetUsageMyCloudResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo,
        });
    };
});
