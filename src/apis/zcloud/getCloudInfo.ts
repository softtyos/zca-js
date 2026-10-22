import {
    apiFactory,
    getServiceEndpoint,
    requestZCloudDecrypted,
    ZALO_DOMAINS,
    ZALO_ENDPOINTS,
} from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetCloudInfoResponse = Record<string, unknown>;

export const getCloudInfoFactory = apiFactory<GetCloudInfoResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.CLOUD_INFO}`);

    /**
     * Lấy thông tin gói thuê bao Zalo Cloud (command 12754)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`.
     * @throws {ZaloApiError}
     */
    return async function getCloudInfo(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<GetCloudInfoResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo,
            allowEmptyDataOn904: true,
        });
    };
});
