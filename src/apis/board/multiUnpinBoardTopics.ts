import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type MultiUnpinBoardTopicsResponse = Record<string, unknown>;

export const multiUnpinBoardTopicsFactory = apiFactory<MultiUnpinBoardTopicsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/multi_unpin`);

    /**
     * Bỏ ghim đồng thời nhiều chủ đề khỏi bảng tin nhóm (command 12010)
     *
     * @param groupId ID nhóm
     * @param topics Danh sách chủ đề cần bỏ ghim
     * @param boardVersion Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function multiUnpinBoardTopics(groupId: string, topics: unknown[], boardVersion: number = 0) {
        const params = {
            grid: groupId.replace(/^g/, ""),
            topics,
            boardVersion,
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
