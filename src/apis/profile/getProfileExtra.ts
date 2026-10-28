import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetProfileExtraResponse = Record<string, unknown>;

export const getProfileExtraFactory = apiFactory<GetProfileExtraResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/extra`);

    /**
     * Lấy thông tin mở rộng của hồ sơ cá nhân (command 11864)
     *
     * @param profileId ID người dùng (mặc định là `ctx.uid`)
     * @throws {ZaloApiError}
     */
    return async function getProfileExtra(profileId?: string) {
        const params = {
            profile_id: profileId ?? ctx.uid,
            imei: ctx.imei,
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
