import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetStickerSuggestionOptions = {
    keyword: string;
    gif?: 0 | 1;
    guggy?: 0 | 1;
};

export type GetStickerSuggestionResponse = {
    sdata: unknown;
    gif?: unknown;
    guggy?: unknown;
    [key: string]: unknown;
};

export const getStickerSuggestionFactory = apiFactory<GetStickerSuggestionResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/suggest/stickers`);

    /**
     * Gợi ý Sticker/GIF theo từ khóa đang nhập (command 11741)
     *
     * @param options Từ khóa và tùy chọn kèm theo (`gif`, `guggy`)
     * @throws {ZaloApiError}
     */
    return async function getStickerSuggestion(options: GetStickerSuggestionOptions | string) {
        const normalized = typeof options === "string" ? { keyword: options } : options;
        const params = {
            keyword: normalized.keyword,
            gif: normalized.gif ?? 1,
            guggy: normalized.guggy ?? 0,
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
