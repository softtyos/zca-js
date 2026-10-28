import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type SubmitCloudMediaExtInfoResponse = {
    noiseIdsErr?: string[];
    [key: string]: unknown;
};

export const submitCloudMediaExtInfoFactory = apiFactory<SubmitCloudMediaExtInfoResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.SUBMIT_MEDIA_EXT_INFO}`);

    /**
     * Gửi thông tin mở rộng (siêu dữ liệu / khóa giải mã) của các tệp Media lên hàng đợi ZCloud (command 12745)
     *
     * @param info Danh sách thông tin mở rộng của các mục Media
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function submitCloudMediaExtInfo(info: unknown[], viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<SubmitCloudMediaExtInfoResponse>(api, utils, {
            url: serviceURL,
            method: "POST",
            paramsPayload: { info },
            viewerKeyInfo,
        });
    };
});
