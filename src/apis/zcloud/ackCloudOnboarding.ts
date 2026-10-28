import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type AckCloudOnboardingResponse = Record<string, unknown>;

export const ackCloudOnboardingFactory = apiFactory<AckCloudOnboardingResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.ONBOARDING_ACK_V1}`);

    /**
     * Xác nhận hoàn tất bước khởi tạo (Onboarding ACK V1) trên ZCloud (command 12746)
     *
     * @param payload Thông tin xác nhận khởi tạo ZCloud
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function ackCloudOnboarding(
        payload: Record<string, unknown> = {},
        viewerKeyInfo?: GetCloudViewerKeyResponse,
    ) {
        return requestZCloudDecrypted<AckCloudOnboardingResponse>(api, utils, {
            url: serviceURL,
            method: "POST",
            paramsPayload: payload,
            viewerKeyInfo,
            allowEmptyDataOn904: true,
        });
    };
});
