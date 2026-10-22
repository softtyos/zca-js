import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetPersonalizedStickerListResponse = {
    list: unknown[];
    version: number;
};

export const getPersonalizedStickerListFactory = apiFactory<GetPersonalizedStickerListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/personalized/list`);

    /**
     * Lấy danh sách Sticker cá nhân hóa của tài khoản (command 11745)
     *
     * @throws {ZaloApiError}
     */
    return async function getPersonalizedStickerList() {
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
