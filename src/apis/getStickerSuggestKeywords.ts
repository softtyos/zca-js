import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetStickerSuggestKeywordsResponse = {
    time: number;
    suggest_data: {
        version: number;
        sdata: Array<{
            keyword: string;
            stickers?: number[];
            [key: string]: unknown;
        }>;
    };
};

export const getStickerSuggestKeywordsFactory = apiFactory<GetStickerSuggestKeywordsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/suggest/keywords`);

    /**
     * Lấy bộ từ khóa gợi ý Sticker tự động khi gõ tin nhắn (command 11740)
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerSuggestKeywords() {
        const params = {
            imei: ctx.imei,
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
