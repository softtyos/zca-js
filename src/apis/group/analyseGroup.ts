import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type AnalyseGroupResponse = {
    [key: string]: unknown;
};

export const analyseGroupFactory = apiFactory<AnalyseGroupResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/analyse`);

    /**
     * Lấy dữ liệu phân tích/thống kê của nhóm qua `/api/group/analyse` (command 12407)
     *
     * @param groupId ID của nhóm
     * @throws {ZaloApiError}
     */
    return async function analyseGroup(groupId: string) {
        if (!groupId) {
            throw new ZaloApiError("Missing groupId");
        }

        const cleanGroupId = groupId.startsWith("g") ? groupId.slice(1) : groupId;
        const params = {
            grid: cleanGroupId,
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
