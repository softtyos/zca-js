import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type ResetCloudQueueResponse = Record<string, unknown>;

export const resetCloudQueueFactory = apiFactory<ResetCloudQueueResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.RESET_QUEUE}`);

    /**
     * Đặt lại hàng đợi đồng bộ Media trên ZCloud (command 12744)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function resetCloudQueue(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<ResetCloudQueueResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo,
            allowEmptyDataOn904: true,
        });
    };
});
