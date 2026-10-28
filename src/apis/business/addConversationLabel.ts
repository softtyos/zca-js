import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type AddConversationLabelOptions = {
    text: string;
    color: number;
    emoji?: string;
    conversations?: string[];
};

export type AddConversationLabelResponse = {
    labelData?: unknown;
    version?: number;
    lastUpdateTime?: number;
    [key: string]: unknown;
};

export const addConversationLabelFactory = apiFactory<AddConversationLabelResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.label[0]}/api/convlabel/manage/add`);

    /**
     * Tạo nhãn phân loại hội thoại mới (command 12163)
     *
     * @param options Thông tin nhãn phân loại mới (`text`, `color`, `emoji`, `conversations`)
     * @throws {ZaloApiError}
     */
    return async function addConversationLabel(options: AddConversationLabelOptions) {
        const labelInfo: Record<string, unknown> = {
            text: options.text,
            color: options.color,
        };
        if (options.emoji) {
            labelInfo.emoji = options.emoji;
        }

        const params = {
            labelInfo: JSON.stringify(labelInfo),
            add: options.conversations ?? [],
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
