import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import type { UserSetting } from "../../models/index.js";
import { apiFactory, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";

export type GetSettingsResponse = UserSetting;

export const getSettingsFactory = apiFactory<GetSettingsResponse>()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${ZALO_DOMAINS.WPA_CHAT}${ZALO_ENDPOINTS.WPA.SETTING_ME}`);

    /**
     * Get my account settings
     *
     * @throws {ZaloApiError}
     */
    return async function getSettings() {
        const params = {};

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
