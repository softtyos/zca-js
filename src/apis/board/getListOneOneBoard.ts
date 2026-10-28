import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetListOneOneBoardOptions = {
    uid?: string;
    conversationId?: string;
    boardType?: number;
    page?: number;
    count?: number;
    lastId?: number;
    lastType?: number;
};

export type GetListOneOneBoardResponse = Record<string, unknown> | unknown[];

export const getListOneOneBoardFactory = apiFactory<GetListOneOneBoardResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/list`);

    /**
     * Lấy danh sách nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12432)
     *
     * @param options Tùy chọn truy vấn danh sách bảng tin 1-1
     * @throws {ZaloApiError}
     */
    return async function getListOneOneBoard(options: GetListOneOneBoardOptions) {
        const targetUid = options.uid ?? options.conversationId ?? "";
        const params = {
            objectData: JSON.stringify({
                uid: targetUid,
                board_type: options.boardType ?? 1,
                page: options.page ?? 1,
                count: options.count ?? 20,
                last_id: options.lastId ?? 0,
                last_type: options.lastType ?? 0,
            }),
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

        try {
            return await utils.resolve(response);
        } catch (err) {
            if (err instanceof ZaloApiError && (err.message === "null" || err.message === "[]")) {
                return [];
            }
            throw err;
        }
    };
});
