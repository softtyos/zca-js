import {
    apiFactory,
    getServiceEndpoint,
    requestZCloudDecrypted,
    ZALO_DOMAINS,
    ZALO_ENDPOINTS,
} from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetCloudSettingsResponse = {
    cloud_media_file_size_limit: number;
    enable_community: number;
    my_cloud_file_size_limit: number;
    opt_in: number;
    key_export: Record<string, unknown>;
    enable_offload: number;
};

export const getCloudSettingsFactory = apiFactory<GetCloudSettingsResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.CLOUD_SETTINGS}`);

    /**
     * Lấy cấu hình giới hạn tệp và cài đặt ZCloud của tài khoản (command 12756)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.
     * @throws {ZaloApiError}
     */
    return async function getCloudSettings(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<GetCloudSettingsResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo,
        });
    };
});
