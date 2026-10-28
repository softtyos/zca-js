import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateConversationLabelItemOptions = {
    id: number;
    text: string;
    color: number;
    offset: number;
    add?: string[];
    remove?: string[];
};

export type UpdateConversationLabelItemResponse = {
    labelData?: unknown;
    version?: number;
    lastUpdateTime?: number;
    [key: string]: unknown;
};

export const updateConversationLabelItemFactory = apiFactory<UpdateConversationLabelItemResponse>()((
    api,
    _ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/manage/update`);

    /**
     * Cập nhật thông tin một nhãn phân loại hội thoại và danh sách hội thoại gắn nhãn (command 12164)
     *
     * @param options Thông tin nhãn cần cập nhật và danh sách hội thoại thêm/xóa
     * @throws {ZaloApiError}
     */
    return async function updateConversationLabelItem(options: UpdateConversationLabelItemOptions) {
        const params = {
            labelInfo: JSON.stringify({
                id: options.id,
                text: options.text,
                color: options.color,
                offset: options.offset,
            }),
            add: options.add ?? [],
            remove: options.remove ?? [],
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
