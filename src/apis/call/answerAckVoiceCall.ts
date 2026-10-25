import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type AnswerAckVoiceCallOptions = {
    status?: number;
};

export type AnswerAckVoiceCallResponse = Record<string, unknown>;

export const answerAckVoiceCallFactory = apiFactory<AnswerAckVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Xác nhận bắt tay hoàn tất từ phía người gọi sau khi người nhận bắt máy (`/api/voicecall/answerack`, command `11304`, signal `408`).
     *
     * @param calleeId User ID của người nhận cuộc gọi
     * @param callId ID của cuộc gọi
     * @param options Tuỳ chọn mã trạng thái (`status`, mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function answerAckVoiceCall(
        calleeId: string,
        callId: number,
        options: AnswerAckVoiceCallOptions = {},
    ): Promise<AnswerAckVoiceCallResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            calleeId: String(calleeId),
            callId,
            status: options.status ?? 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt answerAckVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/answerack`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
