import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetGifsByCategoryResponse = Record<string, unknown>;

export const getGifsByCategoryFactory = apiFactory<GetGifsByCategoryResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/gifs`);

    /**
     * Lấy danh sách ảnh động Giphy GIF theo ID danh mục (command 11295)
     *
     * @param cateId ID danh mục GIF
     * @param offset Vị trí bắt đầu (mặc định `0`)
     * @param limit Số lượng kết quả tối đa (mặc định `10`)
     * @throws {ZaloApiError}
     */
    return async function getGifsByCategory(cateId: number, offset: number = 0, limit: number = 10) {
        const params = {
            cate_id: cateId,
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
