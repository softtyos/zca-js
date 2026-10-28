import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ReorderConversationLabelEntry = {
    id: number;
    offset: number;
};

export type ReorderConversationLabelsResponse = {
    labelData?: unknown;
    version?: number;
    lastUpdateTime?: number;
    [key: string]: unknown;
};

export const reorderConversationLabelsFactory = apiFactory<ReorderConversationLabelsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/manage/reorder`);

    /**
     * Sắp xếp lại vị trí hiển thị của các nhãn phân loại hội thoại (command 12166)
     *
     * @param items Danh sách `{ id, offset }` theo thứ tự mới
     * @throws {ZaloApiError}
     */
    return async function reorderConversationLabels(items: ReorderConversationLabelEntry[]) {
        const params = {
            lsLabelInfo: JSON.stringify(
                items.map((item) => ({
                    id: item.id,
                    offset: item.offset,
                })),
            ),
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
