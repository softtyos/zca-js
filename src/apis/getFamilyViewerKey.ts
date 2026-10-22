import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetFamilyViewerKeyResponse = {
    viewer_key: string;
    enk: string;
};

export const getFamilyViewerKeyFactory = apiFactory<GetFamilyViewerKeyResponse>()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL("https://wpa.chat.zalo.me/api/getFamilyViewerKey");

    /**
     * Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho gói gia đình ZFamily (command 12759)
     *
     * @throws {ZaloApiError}
     */
    return async function getFamilyViewerKey() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        const res = await utils.resolve(response);
        if (typeof res === "string") {
            try {
                return JSON.parse(res) as GetFamilyViewerKeyResponse;
            } catch {
                throw new ZaloApiError("Failed to parse FamilyViewerKey response");
            }
        }
        return res;
    };
});
