import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetFriendsEmojiStatusOptions = {
    version?: number;
    fromUid?: string;
    maxEmojiStatusId?: string | number;
    page?: number;
};

export type GetFriendsEmojiStatusResponse = {
    expireTime: number;
    emojiStatuses: Record<string, unknown>[];
    version: number;
    type: number;
    maxEmojiStatusId: number;
    loadMore: boolean;
    lastUid: string;
    page: number;
};

export const getFriendsEmojiStatusFactory = apiFactory<GetFriendsEmojiStatusResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.emoji_stt?.[0] || "https://emoji-status.chat.zalo.me";
    const serviceURL = utils.makeURL(`${baseDomain}/api/v1/emoji-status/friends`);

    /**
     * Lấy danh sách trạng thái Emoji (Emoji Status) hiện tại của bạn bè (command 16301)
     *
     * @param options Tùy chọn phân trang (`version`, `fromUid`, `maxEmojiStatusId`, `page`)
     * @throws {ZaloApiError}
     */
    return async function getFriendsEmojiStatus(options: GetFriendsEmojiStatusOptions = {}) {
        const params = {
            version: options.version ?? 0,
            fromUid: options.fromUid ?? "0",
            maxEmojiStatusId: String(options.maxEmojiStatusId ?? "0"),
            page: options.page ?? 1,
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
