import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RemoveOneOneBoardTopicResponse = Record<string, unknown>;

export const removeOneOneBoardTopicFactory = apiFactory<RemoveOneOneBoardTopicResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/remove`);

    /**
     * Xóa nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12431)
     *
     * @param uid ID người dùng đối phương
     * @param reminderId ID nhắc hẹn cần xóa
     * @throws {ZaloApiError}
     */
    return async function removeOneOneBoardTopic(uid: string, reminderId: string) {
        const params = {
            uid,
            reminderId,
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
