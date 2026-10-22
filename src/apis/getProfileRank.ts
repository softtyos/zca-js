import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetProfileRankResponse = {
    userRank: string;
    [key: string]: unknown;
};

export const getProfileRankFactory = apiFactory<GetProfileRankResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/getrank`);

    /**
     * Lấy hạng tài khoản Zalo của một người dùng (ví dụ `"WHITE"`, `"GOLD"` - command 12012)
     *
     * @param profileId UID của người dùng cần kiểm tra (mặc định: UID của tài khoản đang đăng nhập)
     * @throws {ZaloApiError}
     */
    return async function getProfileRank(profileId?: string) {
        const params = {
            profile_id: profileId ?? ctx.uid,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
