import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RemoveGroupTopicResponse = Record<string, unknown>;

export const removeGroupTopicFactory = apiFactory<RemoveGroupTopicResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/topic/remove`);

    /**
     * Xóa chủ đề đang ghim trên đầu nhóm (command 11829)
     *
     * @param groupId ID nhóm
     * @throws {ZaloApiError}
     */
    return async function removeGroupTopic(groupId: string) {
        const params = {
            grid: groupId.replace(/^g/, ""),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
