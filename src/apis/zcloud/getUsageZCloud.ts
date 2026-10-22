import {
    apiFactory,
    getServiceEndpoint,
    requestZCloudDecrypted,
    ZALO_DOMAINS,
    ZALO_ENDPOINTS,
} from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetUsageZCloudResponse = {
    service_usage: {
        my_cloud: number;
        message_backup: number;
    };
    usage: number;
    quota: number;
    plan: number;
};

export const getUsageZCloudFactory = apiFactory<GetUsageZCloudResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.USAGE_V2}`);

    /**
     * Kiểm tra dung lượng sử dụng ZCloud V2 (bao gồm MyCloud và Sao lưu tin nhắn - command 12749)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.
     * @throws {ZaloApiError}
     */
    return async function getUsageZCloud(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<GetUsageZCloudResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo,
        });
    };
});
