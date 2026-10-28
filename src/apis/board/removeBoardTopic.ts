import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RemoveBoardTopicResponse = Record<string, unknown>;

export const removeBoardTopicFactory = apiFactory<RemoveBoardTopicResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/remove`);

    /**
     * Xóa chủ đề / ghi chú trên bảng tin nhóm (command 12143)
     *
     * @param groupId ID nhóm
     * @param topicId ID chủ đề cần xóa
     * @throws {ZaloApiError}
     */
    return async function removeBoardTopic(groupId: string, topicId: string) {
        const params = {
            grid: groupId.replace(/^g/, ""),
            topicId,
            imei: ctx.imei,
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
