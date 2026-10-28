import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetTenorStickerMappingResponse = Record<string, unknown>;

export const getTenorStickerMappingFactory = apiFactory<GetTenorStickerMappingResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/tenor/mapping`);

    /**
     * Lấy bảng ánh xạ Tenor sang Sticker Zalo (command 12015)
     *
     * @throws {ZaloApiError}
     */
    return async function getTenorStickerMapping() {
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
