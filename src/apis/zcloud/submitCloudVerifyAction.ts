import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type SubmitCloudVerifyActionResponse = Record<string, unknown>;

export const submitCloudVerifyActionFactory = apiFactory<SubmitCloudVerifyActionResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.ONBOARDING_ACK_V2}`);

    /**
     * Gửi hành động xác thực bảo mật ZCloud (Onboarding ACK V2 - command 12750)
     *
     * @param payload Dữ liệu hành động xác thực ZCloud
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function submitCloudVerifyAction(
        payload: Record<string, unknown>,
        viewerKeyInfo?: GetCloudViewerKeyResponse,
    ) {
        return requestZCloudDecrypted<SubmitCloudVerifyActionResponse>(api, utils, {
            url: serviceURL,
            method: "POST",
            paramsPayload: payload,
            viewerKeyInfo,
            allowEmptyDataOn904: true,
        });
    };
});
