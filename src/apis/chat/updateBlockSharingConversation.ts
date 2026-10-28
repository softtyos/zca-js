import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateBlockSharingConversationOptions = {
    threadId: string;
    isGroup?: boolean;
    isEnabled: boolean | number;
    clientLang?: string;
};

export type UpdateBlockSharingConversationResponse = Record<string, unknown>;

export const updateBlockSharingConversationFactory = apiFactory<UpdateBlockSharingConversationResponse>()((
    api,
    ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/blocksharing/updateConvers`);

    /**
     * Bật hoặc tắt chế độ chặn chia sẻ / chuyển tiếp tin nhắn trong một hội thoại (command 12179)
     *
     * @param options Thông tin hội thoại và trạng thái bật/tắt
     * @throws {ZaloApiError}
     */
    return async function updateBlockSharingConversation(options: UpdateBlockSharingConversationOptions) {
        const params = {
            threadId: options.threadId,
            isGroup: options.isGroup ? 1 : 0,
            isEnabled: options.isEnabled,
            clientLang: options.clientLang ?? ctx.language ?? "vi",
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
