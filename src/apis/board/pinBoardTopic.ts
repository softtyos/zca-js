import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type PinBoardTopicResponse = Record<string, unknown>;

export const pinBoardTopicFactory = apiFactory<PinBoardTopicResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/pinv2`);

    /**
     * Ghim một chủ đề / bài đăng lên bảng tin nhóm (command 12004)
     *
     * @param groupId ID nhóm
     * @param topicId ID chủ đề cần ghim
     * @param type Loại chủ đề (ví dụ: ghi chú, bình chọn, nhắc hẹn)
     * @throws {ZaloApiError}
     */
    return async function pinBoardTopic(groupId: string, topicId: string, type: number) {
        const params = {
            grid: groupId.replace(/^g/, ""),
            topicId,
            type,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response);
    };
});
