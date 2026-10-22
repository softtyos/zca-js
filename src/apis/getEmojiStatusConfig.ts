import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type EmojiStatusItem = {
    id: number;
    caption: {
        vi: string;
        en: string;
    };
    thumb: string;
    full: string;
};

export type GetEmojiStatusConfigResponse = {
    expireTime: number;
    config: {
        emojis: EmojiStatusItem[];
        [key: string]: unknown;
    };
};

export const getEmojiStatusConfigFactory = apiFactory<GetEmojiStatusConfigResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.emoji_stt?.[0] || "https://emoji-status.chat.zalo.me";
    const serviceURL = utils.makeURL(`${baseDomain}/api/v1/emoji-status/resource-config`);

    /**
     * Lấy cấu hình và danh sách bộ biểu tượng Trạng thái Emoji (Emoji Status - command 16300)
     *
     * @param version Phiên bản bộ nhớ đệm (mặc định: 0 để lấy đầy đủ danh sách)
     * @throws {ZaloApiError}
     */
    return async function getEmojiStatusConfig(version: number = 0) {
        const encryptedParams = utils.encodeAES(JSON.stringify({ version }));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
