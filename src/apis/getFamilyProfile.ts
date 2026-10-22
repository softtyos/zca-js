import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, decryptZCloudAES } from "../utils.js";
import type { GetFamilyViewerKeyResponse } from "./getFamilyViewerKey.js";

export type GetFamilyProfileResponse = Record<string, unknown>;

export const getFamilyProfileFactory = apiFactory<GetFamilyProfileResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.zfamily?.[0] || "https://zfml.chat.zalo.me";
    const serviceURL = utils.makeURL(`${baseDomain}/zfamily/pc/family-profile/v1/family`);

    /**
     * Lấy thông tin nhóm gia đình ZFamily (command 12757)
     *
     * @param familyKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getFamilyViewerKey()`.
     * @throws {ZaloApiError}
     */
    return async function getFamilyProfile(familyKeyInfo?: GetFamilyViewerKeyResponse) {
        const keyInfo = familyKeyInfo ?? (await api.getFamilyViewerKey());
        if (!keyInfo?.viewer_key || !keyInfo?.enk) {
            throw new ZaloApiError("Invalid FamilyViewerKey");
        }

        const response = await utils.request(serviceURL, {
            method: "GET",
            headers: {
                "zfamily-viewer-key": keyInfo.viewer_key,
            },
        });

        const json = (await response.json()) as { error_code: number; error_message: string; data?: string };
        if (json.error_code !== 0 && json.error_code !== -904) {
            throw new ZaloApiError(json.error_message || "getFamilyProfile failed", json.error_code);
        }
        if (!json.data) {
            return {};
        }

        const decrypted = decryptZCloudAES(json.data, keyInfo.enk);
        return JSON.parse(decrypted) as GetFamilyProfileResponse;
    };
});
