import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateTodoStatusResponse = Record<string, unknown>;

export const updateTodoStatusFactory = apiFactory<UpdateTodoStatusResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/todo/status`);

    /**
     * Cập nhật trạng thái công việc trong Zalo To-Do (command 12418)
     *
     * @param todoId ID công việc
     * @param status Trạng thái mới (ví dụ: đang thực hiện, hoàn thành)
     * @throws {ZaloApiError}
     */
    return async function updateTodoStatus(todoId: string, status: number) {
        const params = {
            id: todoId,
            status,
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
