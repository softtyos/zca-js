import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type CheckQuotaCommunityMemberResponse = {
    status?: number;
    canUpgrade?: boolean | number;
    [key: string]: unknown;
};

export const checkQuotaCommunityMemberFactory = apiFactory<CheckQuotaCommunityMemberResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/quota/members-comm`);

    /**
     * Kiểm tra điều kiện/hạn mức thành viên Cộng đồng đối với một thành viên cụ thể trong nhóm (command 12182)
     *
     * @param groupId ID của nhóm
     * @param uid UID của thành viên cần kiểm tra
     * @throws {ZaloApiError}
     */
    return async function checkQuotaCommunityMember(groupId: string, uid: string) {
        if (!groupId) {
            throw new ZaloApiError("Missing groupId");
        }
        if (!uid) {
            throw new ZaloApiError("Missing uid");
        }

        const cleanGroupId = groupId.startsWith("g") ? groupId.slice(1) : groupId;
        const params = {
            language: ctx.language || "vi",
            grId: cleanGroupId,
            uid: String(uid),
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
