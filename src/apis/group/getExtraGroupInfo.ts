import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ExtraContextInfo = {
    purpose: string;
    role: string[];
    [key: string]: unknown;
};

export type GetExtraGroupInfoResponse = Record<string, ExtraContextInfo>;

export const getExtraGroupInfoFactory = apiFactory<GetExtraGroupInfoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/userctx/multiget`);

    /**
     * Lấy ngữ cảnh và vai trò mở rộng của người dùng đối với nhiều nhóm (command 12607)
     *
     * @param groupIds Mảng ID các nhóm cần truy vấn
     * @throws {ZaloApiError}
     */
    return async function getExtraGroupInfo(groupIds: string[]) {
        if (!Array.isArray(groupIds) || groupIds.length === 0) {
            return {};
        }

        const cleanGroupIds = groupIds.map((g) => (g.startsWith("g") ? g.slice(1) : g));
        const params = {
            grids: cleanGroupIds,
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
