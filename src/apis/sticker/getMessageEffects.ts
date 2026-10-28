import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetMessageEffectsResponse = Record<string, unknown>;

export const getMessageEffectsFactory = apiFactory<GetMessageEffectsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/effects`);

    /**
     * Lấy thông tin hiệu ứng tin nhắn theo danh sách ID (command 11742)
     *
     * @param effectIds ID hoặc danh sách ID hiệu ứng
     * @throws {ZaloApiError}
     */
    return async function getMessageEffects(effectIds: number | number[] = [1]) {
        const params = {
            effect_ids: Array.isArray(effectIds) ? effectIds : [effectIds],
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
