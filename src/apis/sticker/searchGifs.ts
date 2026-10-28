import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type SearchGifsResponse = Record<string, unknown>;

export const searchGifsFactory = apiFactory<SearchGifsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/search`);

    /**
     * Tìm kiếm ảnh động Giphy GIF theo từ khóa (command 11297)
     *
     * @param keyword Từ khóa tìm kiếm
     * @param offset Vị trí bắt đầu (mặc định `0`)
     * @param limit Số lượng kết quả tối đa (mặc định `10`)
     * @throws {ZaloApiError}
     */
    return async function searchGifs(keyword: string, offset: number = 0, limit: number = 10) {
        const params = {
            keyword,
            offset,
            limit,
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
