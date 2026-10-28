import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type DeleteConversationLabelResponse = {
    version?: number;
    lastUpdateTime?: number;
    [key: string]: unknown;
};

export const deleteConversationLabelFactory = apiFactory<DeleteConversationLabelResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/manage/delete`);

    /**
     * Xóa một hoặc nhiều nhãn phân loại hội thoại (command 12165)
     *
     * @param labelIds ID hoặc danh sách ID nhãn cần xóa
     * @throws {ZaloApiError}
     */
    return async function deleteConversationLabel(labelIds: number | number[]) {
        const params = {
            labelIds: Array.isArray(labelIds) ? labelIds : [labelIds],
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
