import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetRecentSearchListResponse = {
    version: number;
    list_recent: Record<string, unknown>[];
    list_keyword: string[];
};

export const getRecentSearchListFactory = apiFactory<GetRecentSearchListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.recent_search[0]}/api/recentsearch/list`);

    /**
     * Lấy danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12125)
     *
     * @param version Phiên bản lịch sử tìm kiếm (mặc định: 0)
     * @throws {ZaloApiError}
     */
    return async function getRecentSearchList(version: number = 0) {
        const params = {
            version,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
