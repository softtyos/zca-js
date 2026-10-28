import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type TranslateMessageOptions = {
    reqId?: string;
    msgId: string;
    threadId: string;
    type?: number;
    srcLang: string;
    desLang: string;
    text: string;
    immutableItems?: unknown[];
};

export type TranslateMessageResponse = {
    reqId?: string;
    text?: string;
    metadata?: {
        immutableItems?: unknown[];
    };
    [key: string]: unknown;
};

export const translateMessageFactory = apiFactory<TranslateMessageResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.ai_features?.[0] || ZALO_DOMAINS.AI_FEATURES_FALLBACK;
    const serviceURL = utils.makeURL(`${baseDomain}/api/aifeatures/translate/v1/manual`);

    /**
     * Dịch thủ công một tin nhắn văn bản bằng Zalo AI (command 13397)
     *
     * @param options Thông tin tin nhắn và cặp ngôn ngữ cần dịch
     * @throws {ZaloApiError}
     */
    return async function translateMessage(options: TranslateMessageOptions) {
        const params = {
            reqId: options.reqId ?? `pcw_${Date.now()}`,
            msgId: options.msgId,
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
