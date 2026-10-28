import { apiFactory } from "../../utils.js";

export type GetRecommendedStickersResponse = Record<string, unknown>;

export const getRecommendedStickersFactory = apiFactory<GetRecommendedStickersResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/recommended`);

    /**
     * Lấy danh sách các bộ Sticker được Zalo đề xuất (command 11748)
     *
     * @throws {ZaloApiError}
     */
    return async function getRecommendedStickers() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
