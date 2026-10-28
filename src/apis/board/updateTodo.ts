import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateTodoOptions = {
    id: string;
    title?: string;
    content?: string;
    assignees?: string[];
    watchers?: string[];
    dueDate?: number;
    dateDefaultType?: number;
    status?: number;
    schedule?: unknown;
    [key: string]: unknown;
};

export type UpdateTodoResponse = Record<string, unknown>;

export const updateTodoFactory = apiFactory<UpdateTodoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/todo/update`);

    /**
     * Cập nhật nội dung công việc trong Zalo To-Do (command 12414)
     *
     * @param options Thông tin công việc cần cập nhật
     * @throws {ZaloApiError}
     */
    return async function updateTodo(options: UpdateTodoOptions) {
        const params = {
            ...options,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
