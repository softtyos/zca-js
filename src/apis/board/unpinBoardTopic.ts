import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UnpinBoardTopicResponse = Record<string, unknown>;

export const unpinBoardTopicFactory = apiFactory<UnpinBoardTopicResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/unpinv2`);

    /**
     * Bỏ ghim một chủ đề khỏi bảng tin nhóm (command 12005)
     *
     * @param groupId ID nhóm
     * @param topic Thông tin chủ đề cần bỏ ghim (hoặc `{ id, type }`)
     * @param boardVersion Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function unpinBoardTopic(groupId: string, topic: unknown, boardVersion: number = 0) {
        const params = {
            grid: groupId.replace(/^g/, ""),
            topic,
            boardVersion,
            imei: ctx.imei,
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
