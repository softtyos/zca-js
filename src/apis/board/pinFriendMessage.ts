import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type PinFriendMessageResponse = Record<string, unknown>;

export const pinFriendMessageFactory = apiFactory<PinFriendMessageResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend_board[0]}/api/friendboard/create`);

    /**
     * Ghim tin nhắn / chủ đề trong hội thoại cá nhân 1-1 (command 12067)
     *
     * @param conversationId ID hội thoại 1-1
     * @param topic Thông tin tin nhắn / chủ đề cần ghim
     * @param version Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function pinFriendMessage(conversationId: string, topic: unknown, version: number = 0) {
        const params = {
            conversationId,
            topic,
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
