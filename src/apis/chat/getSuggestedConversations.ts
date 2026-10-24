import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetSuggestedConversationsResponse = {
    conversations?: unknown[];
    [key: string]: unknown;
};

export const getSuggestedConversationsFactory = apiFactory<GetSuggestedConversationsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/suggestconvers/list`);

    /**
     * Lấy danh sách các cuộc hội thoại được gợi ý (command 11233)
     *
     * @param language Ngôn ngữ hiển thị (mặc định theo `ctx.language` hoặc `"vi"`)
     * @throws {ZaloApiError}
     */
    return async function getSuggestedConversations(language?: string) {
        const params = {
            language: language ?? ctx.language ?? "vi",
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
