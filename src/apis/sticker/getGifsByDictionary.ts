import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetGifsByDictionaryResponse = Record<string, unknown>;

export const getGifsByDictionaryFactory = apiFactory<GetGifsByDictionaryResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/gifsbydict`);

    /**
     * Lấy danh sách ảnh động Giphy GIF theo ID từ điển (command 11299)
     *
     * @param dicId ID từ điển GIF
     * @param offset Vị trí bắt đầu (mặc định `0`)
     * @param limit Số lượng kết quả tối đa (mặc định `10`)
     * @throws {ZaloApiError}
     */
    return async function getGifsByDictionary(dicId: number, offset: number = 0, limit: number = 10) {
        const params = {
            dic_id: dicId,
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
