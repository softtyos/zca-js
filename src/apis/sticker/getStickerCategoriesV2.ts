import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type StickerCategoryV2Item = {
    id: number;
    name: string;
    desc?: string;
    totalImage?: number;
    iconUrl?: string;
    thumbUrl?: string;
    previewUrl?: string;
    status?: number;
    type?: number;
    [key: string]: unknown;
};

export type GetStickerCategoriesV2Response = {
    categories: StickerCategoryV2Item[];
    [key: string]: unknown;
};

export const getStickerCategoriesV2Factory = apiFactory<GetStickerCategoriesV2Response>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/category/list/v2`);

    /**
     * Lấy danh sách danh mục bộ nhãn dán (Sticker Categories V2 - command 12020)
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerCategoriesV2() {
        const encryptedParams = utils.encodeAES("");
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
