import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateProfileModeResponse = Record<string, unknown>;

export const updateProfileModeFactory = apiFactory<UpdateProfileModeResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/mode`);

    /**
     * Cập nhật chế độ hồ sơ người dùng (command 11865)
     *
     * @param mode Chế độ hồ sơ cần đặt
     * @throws {ZaloApiError}
     */
    return async function updateProfileMode(mode: number) {
        const params = {
            mode,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response);
    };
});
