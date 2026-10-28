import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type UpdateTranslateSettingOptions = {
    threadId: string;
    type: number;
    settings: {
        auto: boolean | number;
        suggest: boolean | number;
        srcLang: string;
        desLang: string;
    };
    [key: string]: unknown;
};

export type UpdateTranslateSettingResponse = Record<string, unknown>;

export const updateTranslateSettingFactory = apiFactory<UpdateTranslateSettingResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.ai_features?.[0] || ZALO_DOMAINS.AI_FEATURES_FALLBACK;
    const serviceURL = utils.makeURL(`${baseDomain}/api/aifeatures/translate/v1/setting`);

    /**
     * Cập nhật cấu hình dịch tin nhắn Zalo AI cho một hội thoại (command 13396)
     *
     * @param options Thiết lập dịch tự động và cặp ngôn ngữ cho hội thoại
     * @throws {ZaloApiError}
     */
    return async function updateTranslateSetting(options: UpdateTranslateSettingOptions) {
        const encryptedParams = utils.encodeAES(JSON.stringify(options));
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
