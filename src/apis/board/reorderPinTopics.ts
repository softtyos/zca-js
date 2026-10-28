import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ReorderPinTopicsResponse = Record<string, unknown>;

export const reorderPinTopicsFactory = apiFactory<ReorderPinTopicsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/pin/update`);

    /**
     * Sắp xếp lại thứ tự các chủ đề đã ghim trên bảng tin nhóm (command 12002)
     *
     * @param groupId ID nhóm
     * @param topics Danh sách chủ đề đã ghim theo thứ tự mới
     * @param boardVersion Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function reorderPinTopics(groupId: string, topics: unknown[], boardVersion: number = 0) {
        const params = {
            groupId: groupId.replace(/^g/, ""),
            topics,
            boardVersion,
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
