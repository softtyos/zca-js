import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type AnswerVoiceCallOptions = {
    status?: number;
    codec?: string;
    rtcpAddress?: string;
    rtpAddress?: string;
    sessionId?: string;
    extendData?: string | Record<string, unknown>;
    subCommand?: number;
};

export type AnswerVoiceCallResponse = Record<string, unknown>;

export const answerVoiceCallFactory = apiFactory<AnswerVoiceCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Chấp nhận / Nghe cuộc gọi thoại hoặc video đến (`/api/voicecall/answer`, command `11303`, signal `402`).
     *
     * @param callerId User ID của người gọi đến
     * @param callId ID của cuộc gọi
     * @param options Thông tin `sessionId`, `rtpAddress`, `rtcpAddress`, `codec`, `extendData` và `status`
     * @throws {ZaloApiError}
     */
    return async function answerVoiceCall(
        callerId: string,
        callId: number,
        options: AnswerVoiceCallOptions = {},
    ): Promise<AnswerVoiceCallResponse> {
        if (!callerId) throw new ZaloApiError("Missing callerId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const extendDataStr =
            options.extendData === undefined
                ? undefined
                : typeof options.extendData === "string"
                  ? options.extendData
                  : JSON.stringify(options.extendData);

        const params: Record<string, unknown> = {
            callerId: String(callerId),
            callId,
            status: options.status ?? 0,
            codec: options.codec ?? "",
            rtcpAddress: options.rtcpAddress ?? "",
            rtpAddress: options.rtpAddress ?? "",
            session_id: options.sessionId ?? "",
        };

        if (extendDataStr) {
            params.extendData = extendDataStr;
            params.subCommand = options.subCommand ?? 3;
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt answerVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/answer`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
