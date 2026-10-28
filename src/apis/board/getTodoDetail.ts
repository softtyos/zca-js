import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetTodoDetailResponse = Record<string, unknown>;

export const getTodoDetailFactory = apiFactory<GetTodoDetailResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/get`);

    /**
     * Lấy chi tiết công việc trong Zalo To-Do (command 12417)
     *
     * @param todoId ID công việc
     * @throws {ZaloApiError}
     */
    return async function getTodoDetail(todoId: string) {
        const params = {
            id: todoId,
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
