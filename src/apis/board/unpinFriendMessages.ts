import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UnpinFriendMessagesResponse = Record<string, unknown>;

export const unpinFriendMessagesFactory = apiFactory<UnpinFriendMessagesResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/multi_unpin`);

    /**
     * Bỏ ghim một hoặc nhiều tin nhắn trong hội thoại 1-1 (command 12069)
     *
     * @param conversationId ID hội thoại 1-1
     * @param topics Danh sách tin nhắn / chủ đề cần bỏ ghim
     * @param version Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function unpinFriendMessages(conversationId: string, topics: unknown[], version: number = 0) {
        const params = {
            conversationId,
            topics,
            version,
            lang: ctx.language || "vi",
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
