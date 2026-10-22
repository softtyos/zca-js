import {
    apiFactory,
    getServiceEndpoint,
    requestZFamilyDecrypted,
    ZALO_DOMAINS,
    ZALO_ENDPOINTS,
} from "../../utils.js";
import type { GetFamilyViewerKeyResponse } from "./getFamilyViewerKey.js";

export type GetFamilyProfileResponse = Record<string, unknown>;

export const getFamilyProfileFactory = apiFactory<GetFamilyProfileResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zfamily", ZALO_DOMAINS.ZFAMILY_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.FAMILY_PROFILE}`);

    /**
     * Lấy thông tin nhóm gia đình ZFamily (command 12757)
     *
     * @param familyKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getFamilyViewerKey()`.
     * @throws {ZaloApiError}
     */
    return async function getFamilyProfile(familyKeyInfo?: GetFamilyViewerKeyResponse) {
        return requestZFamilyDecrypted<GetFamilyProfileResponse>(api, utils, {
            url: serviceURL,
            viewerKeyInfo: familyKeyInfo,
            allowEmptyDataOn904: true,
        });
    };
});
