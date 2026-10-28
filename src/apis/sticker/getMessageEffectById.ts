import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetMessageEffectByIdResponse = Record<string, unknown>;

export const getMessageEffectByIdFactory = apiFactory<GetMessageEffectByIdResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/effect/get`);

    /**
     * Lấy chi tiết một hiệu ứng tin nhắn theo ID và kích thước (command 11743)
     *
     * @param id ID hiệu ứng
     * @param size Kích thước tài nguyên hiệu ứng (mặc định `130`)
     * @throws {ZaloApiError}
     */
    return async function getMessageEffectById(id: number | string, size: number = 130) {
        const params = {
            id,
            size,
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
