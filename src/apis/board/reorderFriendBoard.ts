import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ReorderFriendBoardResponse = Record<string, unknown>;

export const reorderFriendBoardFactory = apiFactory<ReorderFriendBoardResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/reorder`);

    /**
     * Sắp xếp lại thứ tự các tin nhắn đã ghim trong hội thoại 1-1 (command 12068)
     *
     * @param conversationId ID hội thoại 1-1
     * @param topics Danh sách tin nhắn đã ghim theo thứ tự mới
     * @param version Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function reorderFriendBoard(conversationId: string, topics: unknown[], version: number = 0) {
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
