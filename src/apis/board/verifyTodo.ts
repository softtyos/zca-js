import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type VerifyTodoResponse = Record<string, unknown>;

export const verifyTodoFactory = apiFactory<VerifyTodoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.boards[0]}/api/board/personal/todo/verify`);

    /**
     * Kiểm tra tính đồng bộ của danh sách công việc trong Zalo To-Do (command 12603)
     *
     * @param scrollId Mã cuộn hiện tại
     * @param lastUpdatedTime Thời điểm cập nhật cuối cùng
     * @throws {ZaloApiError}
     */
    return async function verifyTodo(scrollId: string = "", lastUpdatedTime: number = 0) {
        const params = {
            scrollId,
            lastUpdatedTime,
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

        try {
            return await utils.resolve(response);
        } catch (err) {
            if (err instanceof ZaloApiError && err.message === "Stop retry.") {
                return { deleted: [], updated: [], scrollId: "" };
            }
            throw err;
        }
    };
});
