import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type TranslateMessageAutoItem = {
    text: string;
    metadata: {
        cmi: string;
        gmi: string;
        immutableItems?: unknown[];
    };
};

export type TranslateMessageAutoOptions = {
    reqId?: string;
    threadId: string;
    type?: number;
    srcLang: string;
    desLang: string;
    msgs: TranslateMessageAutoItem[];
};

export type TranslateMessageAutoResponse = Record<string, unknown>;

export const translateMessageAutoFactory = apiFactory<TranslateMessageAutoResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.ai_features?.[0] || ZALO_DOMAINS.AI_FEATURES_FALLBACK;
    const serviceURL = utils.makeURL(`${baseDomain}/api/aifeatures/translate/v1/auto`);

    /**
     * Gửi yêu cầu dịch tự động hàng loạt tin nhắn đến bằng Zalo AI (command 13398).
     * Kết quả dịch bất đồng bộ có thể được đẩy về qua sự kiện `api.listener.on("translate_event", ...)`.
     *
     * @param options Danh sách tin nhắn và cặp ngôn ngữ cần dịch tự động
     * @throws {ZaloApiError}
     */
    return async function translateMessageAuto(options: TranslateMessageAutoOptions) {
        const params = {
            reqId: options.reqId ?? `pcw_${Date.now()}`,
            threadId: options.threadId,
            type: options.type ?? 0,
            srcLang: options.srcLang,
            desLang: options.desLang,
            msgs: options.msgs.map((m) => ({
                text: m.text,
                metadata: {
                    cmi: m.metadata.cmi,
                    gmi: m.metadata.gmi,
                    immutableItems: m.metadata.immutableItems ?? [],
                },
            })),
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
