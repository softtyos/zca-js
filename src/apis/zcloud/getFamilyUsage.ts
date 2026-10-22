import {
    apiFactory,
    getServiceEndpoint,
    requestZCloudDecrypted,
    ZALO_DOMAINS,
    ZALO_ENDPOINTS,
} from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetFamilyUsageResponse = {
    usage: number;
    quota: number;
    lastUpdated: number;
};

export const getFamilyUsageFactory = apiFactory<GetFamilyUsageResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.FAMILY_USAGE}`);

    /**
     * Kiểm tra dung lượng sử dụng gói ZCloud Gia đình (Family Usage - command 12758)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.
     * @throws {ZaloApiError}
     */
    return async function getFamilyUsage(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<GetFamilyUsageResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo,
        });
    };
});
