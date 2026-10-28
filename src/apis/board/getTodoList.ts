import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetTodoListOptions = {
    scrollId?: string;
    queries?: Record<string, unknown> | string;
    offset?: number;
    limit?: number;
    type?: number;
};

export type GetTodoListResponse = Record<string, unknown>;

export const getTodoListFactory = apiFactory<GetTodoListResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/list`);

    /**
     * Lấy danh sách công việc trong Zalo To-Do (command 12416)
     *
     * @param options Tùy chọn lọc và phân trang danh sách công việc
     * @throws {ZaloApiError}
     */
    return async function getTodoList(options: GetTodoListOptions = {}) {
        const params = {
            scrollId: options.scrollId ?? "",
            offset: options.offset ?? 0,
            limit: options.limit ?? 20,
            queries:
                typeof options.queries === "string"
                    ? options.queries
                    : JSON.stringify(
                          options.queries ?? {
                              role: "creator",
                              status: { lt: 3 },
                              creator: ctx.uid,
                          },
                      ),
            type: options.type ?? 1,
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
            if (err instanceof ZaloApiError && err.message === "Stop retry.") {
                return { todos: [], scrollId: "", total: 0 };
            }
            throw err;
        }
    };
});
