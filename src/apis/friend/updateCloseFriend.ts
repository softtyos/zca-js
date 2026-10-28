import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateCloseFriendResponse = Record<string, unknown>;

export const updateCloseFriendFactory = apiFactory<UpdateCloseFriendResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/closefr/update`);

    /**
     * Thêm hoặc xóa người dùng khỏi danh sách Bạn thân (command 11421)
     *
     * @param fids ID hoặc danh sách ID người dùng
     * @param action Hành động (`1` = Thêm bạn thân, `0` = Xóa bạn thân)
     * @throws {ZaloApiError}
     */
    return async function updateCloseFriend(fids: string | string[], action: number = 1) {
        const params = {
            fids: Array.isArray(fids) ? fids : [fids],
            action,
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
