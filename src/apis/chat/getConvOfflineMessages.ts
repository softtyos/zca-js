import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetConvOfflineMessagesOptions = {
    queueInfo: unknown;
    lastMsgId?: string | number;
    lastActId?: string | number;
};

export type GetConvOfflineMessagesResponse = Record<string, unknown>;

export const getConvOfflineMessagesFactory = apiFactory<GetConvOfflineMessagesResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/cm/grOfl`);

    /**
     * Lấy danh sách hội thoại nhóm có tin nhắn ngoại tuyến mới (command 12300)
     *
     * @param options Thông tin hàng đợi và ID tin nhắn / hành động cuối cùng
     * @throws {ZaloApiError}
     */
    return async function getConvOfflineMessages(options: GetConvOfflineMessagesOptions) {
        const params = {
            queueInfo: options.queueInfo,
            lastActId: options.lastActId ?? "0",
            lastMsgId: options.lastMsgId ?? "0",
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
