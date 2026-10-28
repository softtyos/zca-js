import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RegisterTrialBizAccountResponse = Record<string, unknown>;

export const registerTrialBizAccountFactory = apiFactory<RegisterTrialBizAccountResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/biz-register-trial-v2`);

    /**
     * Đăng ký dùng thử gói Zalo Business V2 cho tài khoản (command 12152)
     *
     * @param uid ID người dùng (mặc định là `ctx.uid`)
     * @throws {ZaloApiError}
     */
    return async function registerTrialBizAccount(uid?: string) {
        const params = {
            uid: uid ?? ctx.uid,
            language: ctx.language || "vi",
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
