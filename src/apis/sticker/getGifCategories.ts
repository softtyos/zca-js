import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetGifCategoriesResponse = Record<string, unknown>;

export const getGifCategoriesFactory = apiFactory<GetGifCategoriesResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/giphy/cates`);

    /**
     * Lấy danh sách danh mục ảnh động Giphy GIF (command 11294)
     *
     * @param offset Vị trí bắt đầu (mặc định `0`)
     * @param limit Số lượng kết quả tối đa (mặc định `10`)
     * @throws {ZaloApiError}
     */
    return async function getGifCategories(offset: number = 0, limit: number = 10) {
        const params = {
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
