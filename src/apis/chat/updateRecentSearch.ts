import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateRecentSearchOptions = {
    listRecent?: Record<string, unknown>[];
    listKeyword?: string[];
    version?: number;
};

export type UpdateRecentSearchResponse = {
    version: number;
    list_recent: Record<string, unknown>[];
    list_keyword: string[];
};

export const updateRecentSearchFactory = apiFactory<UpdateRecentSearchResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.recent_search[0]}/api/recentsearch/update`);

    /**
     * Cập nhật danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12126)
     *
     * @param options Danh sách tìm kiếm gần đây và từ khóa (`listRecent`, `listKeyword`, `version`)
     * @throws {ZaloApiError}
     */
    return async function updateRecentSearch(options: UpdateRecentSearchOptions = {}) {
        let currentVersion = options.version;
        if (currentVersion === undefined) {
            try {
                const current = await api.getRecentSearchList(0);
                currentVersion = current?.version ?? 0;
            } catch {
                currentVersion = 0;
            }
        }

        const params = {
            list_recent: options.listRecent ?? [],
            version: currentVersion,
            list_keyword: options.listKeyword ?? [],
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
