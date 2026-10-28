import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type AckDingTodoResponse = Record<string, unknown>;

export const ackDingTodoFactory = apiFactory<AckDingTodoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/todo/dingack`);

    /**
     * Xác nhận đã nhận nhắc nhở (Ding ACK) trong Zalo To-Do (command 12427)
     *
     * @param taskIds Danh sách ID công việc xác nhận
     * @throws {ZaloApiError}
     */
    return async function ackDingTodo(taskIds: string | string[]) {
        const params = {
            taskIds: Array.isArray(taskIds) ? taskIds : [taskIds],
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
