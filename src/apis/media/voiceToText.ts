import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type VoiceToTextResponse = {
    req_id: string;
};

export const voiceToTextFactory = apiFactory<VoiceToTextResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.ai_features?.[0] || ZALO_DOMAINS.AI_FEATURES_FALLBACK;
    const serviceURL = utils.makeURL(`${baseDomain}/api/aifeatures/voice2text`);

    /**
     * Gửi yêu cầu chuyển đổi tin nhắn thoại sang văn bản bằng Zalo AI (command 13394).
     * Kết quả văn bản sau khi xử lý xong sẽ được đẩy về qua sự kiện `api.listener.on("voice2text_event", ...)` khớp với `req_id`.
     *
     * @param voiceUrl Đường dẫn URL của tệp ghi âm tin nhắn thoại (`.aac` / `.mp3` / `.m4a`)
     * @throws {ZaloApiError}
     */
    return async function voiceToText(voiceUrl: string) {
        if (!voiceUrl) {
            throw new ZaloApiError("Missing voiceUrl");
        }

        const encryptedParams = utils.encodeAES(JSON.stringify({ url: voiceUrl }));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
