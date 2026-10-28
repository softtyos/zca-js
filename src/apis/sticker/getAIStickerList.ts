import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetAIStickerListResponse = Record<string, unknown>;

export const getAIStickerListFactory = apiFactory<GetAIStickerListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/ai/list`);

    /**
     * Lấy danh sách Sticker AI của người dùng (command 12190)
     *
     * @throws {ZaloApiError}
     */
    return async function getAIStickerList() {
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
