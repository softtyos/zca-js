import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type PushProfileVerificationMessageOptions = {
    uid?: string;
    groupName?: string;
    type?: number;
};

export type PushProfileVerificationMessageResponse = Record<string, unknown>;

export const pushProfileVerificationMessageFactory = apiFactory<PushProfileVerificationMessageResponse>()((
    api,
    ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/ekyc/push-oa`);

    /**
     * Yêu cầu đẩy tin nhắn hướng dẫn xác thực tài khoản (eKYC) từ Official Account (command 12151)
     *
     * @param options Thông tin `uid`, `groupName`, `type`
     * @throws {ZaloApiError}
     */
    return async function pushProfileVerificationMessage(options: PushProfileVerificationMessageOptions = {}) {
        const params = {
            uid: options.uid ?? ctx.uid,
            groupName: options.groupName ?? "",
            type: options.type ?? 0,
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
