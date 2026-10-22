import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetListPinTopicsResponse = {
    items: unknown[];
    version: number;
};

export const getListPinTopicsFactory = apiFactory<GetListPinTopicsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/pin/list`);

    /**
     * Lấy danh sách chủ đề / tin nhắn đã ghim trong bảng tin nhóm (command 12001)
     *
     * @param groupId ID nhóm
     * @param boardVersion Phiên bản bảng ghim hiện tại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function getListPinTopics(groupId: string, boardVersion: number = 0) {
        const params = {
            groupId,
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
