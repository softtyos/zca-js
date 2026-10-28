import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdatePersonalizedStickerListResponse = Record<string, unknown>;

export const updatePersonalizedStickerListFactory = apiFactory<UpdatePersonalizedStickerListResponse>()((
    api,
    ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/personalized/update`);

    /**
     * Cập nhật danh sách các bộ Sticker cá nhân hóa của người dùng (command 11746)
     *
     * @param stickerCateIds Danh sách ID danh mục Sticker
     * @param version Phiên bản hiện tại của danh sách
     * @throws {ZaloApiError}
     */
    return async function updatePersonalizedStickerList(stickerCateIds: number[], version: number = 0) {
        const params = {
            version,
            sticker_cates: stickerCateIds,
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
