import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type DingTodoResponse = Record<string, unknown>;

export const dingTodoFactory = apiFactory<DingTodoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/todo/ding`);

    /**
     * Gửi nhắc nhở (Ding) cho các công việc trong Zalo To-Do (command 12426)
     *
     * @param taskIds Danh sách ID công việc cần nhắc nhở
     * @throws {ZaloApiError}
     */
    return async function dingTodo(taskIds: string | string[]) {
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
