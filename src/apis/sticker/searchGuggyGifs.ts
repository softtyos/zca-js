import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type SearchGuggyGifsResponse = Record<string, unknown>;

export const searchGuggyGifsFactory = apiFactory<SearchGuggyGifsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/guggy/search`);

    /**
     * Tìm kiếm ảnh động Guggy GIF theo từ khóa (command 11750)
     *
     * @param keyword Từ khóa tìm kiếm
     * @param limit Số lượng kết quả tối đa (mặc định `10`)
     * @throws {ZaloApiError}
     */
    return async function searchGuggyGifs(keyword: string, limit: number = 10) {
        const params = {
            keyword,
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
