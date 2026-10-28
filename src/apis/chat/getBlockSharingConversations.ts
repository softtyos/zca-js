import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetBlockSharingConversationsResponse = {
    convers?: unknown[];
    [key: string]: unknown;
};

export const getBlockSharingConversationsFactory = apiFactory<GetBlockSharingConversationsResponse>()((
    api,
    _ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/conv/blocksharing/getConvers`);

    /**
     * Lấy danh sách hội thoại đang bật chế độ chặn chia sẻ / chuyển tiếp tin nhắn (command 12178)
     *
     * @throws {ZaloApiError}
     */
    return async function getBlockSharingConversations() {
        const encryptedParams = utils.encodeAES(JSON.stringify({}));
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
