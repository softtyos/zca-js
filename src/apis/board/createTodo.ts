import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type CreateTodoOptions = {
    title?: string;
    content?: string;
    assignees?: string[];
    watchers?: string[];
    dueDate?: number;
    dateDefaultType?: number;
    status?: number;
    schedule?: unknown;
    src?: number;
    [key: string]: unknown;
};

export type CreateTodoResponse = {
    id?: string;
    [key: string]: unknown;
};

export const createTodoFactory = apiFactory<CreateTodoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/todo/create`);

    /**
     * Tạo công việc mới trong Zalo To-Do (command 12413)
     *
     * @param options Thông tin công việc cần tạo
     * @throws {ZaloApiError}
     */
    return async function createTodo(options: CreateTodoOptions) {
        const params = {
            ...options,
            src: options.src ?? -1,
            imei: ctx.imei,
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
