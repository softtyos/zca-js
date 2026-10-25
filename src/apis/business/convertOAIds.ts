import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ConvertOAIdsResponse = {
    [oaId: string]: string | unknown;
};

export const convertOAIdsFactory = apiFactory<ConvertOAIdsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/convertid`);

    /**
     * Chuyển đổi danh sách OA ID sang Zalo UID nội bộ (hoặc ngược lại).
     * Tương ứng với hàm `convertOAIds` (`commandId = 11863`) trên Zalo Desktop.
     *
     * @param oaIds Một OA ID hoặc mảng các OA ID cần chuyển đổi
     *
     * @throws {ZaloApiError}
     */
    return async function convertOAIds(oaIds: string | string[]) {
        const normalizedIds = (Array.isArray(oaIds) ? oaIds : [oaIds]).map(String);
        const params = {
            oa_ids: normalizedIds,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
