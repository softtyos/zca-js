import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type DisableLimitSearchPhoneReminderResponse = Record<string, unknown>;

export const disableLimitSearchPhoneReminderFactory = apiFactory<DisableLimitSearchPhoneReminderResponse>()((
    api,
    ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/biz-off-remind`);

    /**
     * Tắt thông báo nhắc nhở giới hạn tìm kiếm số điện thoại (command 12131)
     *
     * @param uid ID người dùng (mặc định là `ctx.uid`)
     * @throws {ZaloApiError}
     */
    return async function disableLimitSearchPhoneReminder(uid?: string) {
        const params = {
            uid: uid ?? ctx.uid,
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
