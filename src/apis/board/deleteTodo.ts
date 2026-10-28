import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type DeleteTodoResponse = Record<string, unknown>;

export const deleteTodoFactory = apiFactory<DeleteTodoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/delete`);

    /**
     * Xóa công việc trong Zalo To-Do (command 12415)
     *
     * @param todoId ID công việc cần xóa
     * @throws {ZaloApiError}
     */
    return async function deleteTodo(todoId: string) {
        const params = {
            id: todoId,
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
