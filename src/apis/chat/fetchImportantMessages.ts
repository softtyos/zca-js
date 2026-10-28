import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type FetchImportantMessagesOptions = {
    limit?: number;
    newestId?: string | null;
    lastId?: string | null;
};

export type FetchImportantMessagesResponse = Record<string, unknown>;

export const fetchImportantMessagesFactory = apiFactory<FetchImportantMessagesResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/fetchImportant`);

    /**
     * Lấy danh sách các tin nhắn được đánh dấu quan trọng / đánh dấu sao (command 12114)
     *
     * @param options Tùy chọn phân trang (`newestId` hoặc `lastId`, mặc định `lastId = "-1"`)
     * @throws {ZaloApiError}
     */
    return async function fetchImportantMessages(options: FetchImportantMessagesOptions = {}) {
        const params: Record<string, unknown> = {
            limit: options.limit ?? 50,
            uid: ctx.uid,
        };
        if (options.newestId != null) {
            params.newestId = options.newestId;
        } else {
            params.lastId = options.lastId ?? "-1";
        }

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
