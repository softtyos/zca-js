import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type TranslateMessageSuggestOptions = {
    reqId?: string;
    threadId: string;
    type?: number;
    srcLang: string;
    desLang: string;
    text: string;
    immutableItems?: unknown[];
};

export type TranslateMessageSuggestResponse = Record<string, unknown>;

export const translateMessageSuggestFactory = apiFactory<TranslateMessageSuggestResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.ai_features?.[0] || ZALO_DOMAINS.AI_FEATURES_FALLBACK;
    const serviceURL = utils.makeURL(`${baseDomain}/api/aifeatures/translate/v1/suggest`);

    /**
     * Gửi yêu cầu dịch gợi ý tin nhắn đang soạn thảo bằng Zalo AI (command 13399).
     * Kết quả dịch bất đồng bộ có thể được đẩy về qua sự kiện `api.listener.on("translate_event", ...)`.
     *
     * @param options Nội dung tin nhắn đang soạn thảo và cặp ngôn ngữ cần dịch
     * @throws {ZaloApiError}
     */
    return async function translateMessageSuggest(options: TranslateMessageSuggestOptions) {
        const params = {
            reqId: options.reqId ?? `pcw_${Date.now()}`,
            threadId: options.threadId,
            type: options.type ?? 0,
            srcLang: options.srcLang,
            desLang: options.desLang,
            msg: {
                text: options.text,
                metadata: {
                    immutableItems: options.immutableItems ?? [],
                },
            },
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
