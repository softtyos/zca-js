import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { StickerCategoryV2Item } from "./getStickerCategoriesV2.js";

export type GetStickerCategoryDataResponse = StickerCategoryV2Item;

export const getStickerCategoryDataFactory = apiFactory<GetStickerCategoryDataResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/category/detail`);

    /**
     * Lấy thông tin chi tiết một bộ nhãn dán theo `cid` (command 11156)
     *
     * @param cid ID bộ nhãn dán (Category ID)
     * @throws {ZaloApiError}
     */
    return async function getStickerCategoryData(cid: number) {
        const params = {
            cid,
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
