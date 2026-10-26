import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType } from "./sendVoiceCall.js";

export type CancelVoiceCallOptions = {
    callType?: CallType | number;
    status?: number;
};

export type CancelVoiceCallResponse = Record<string, unknown>;

export const cancelVoiceCallFactory = apiFactory<CancelVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Huỷ cuộc gọi đang đổ chuông trước khi người nhận bắt máy (`/api/voicecall/cancel`, command `11305`).
     *
     * @param calleeId User ID của người nhận cuộc gọi
     * @param callId ID của cuộc gọi (nhận từ `sendVoiceCall`)
     * @param options Tuỳ chọn loại cuộc gọi (`callType`) và `status`
     * @throws {ZaloApiError}
     */
    return async function cancelVoiceCall(
        calleeId: string,
        callId: number,
        options: CancelVoiceCallOptions = {},
    ): Promise<CancelVoiceCallResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const rawCallType = options.callType ?? CallType.Audio;
        // Khớp với ZMessageSerializer::sendCancelCall (0x100026acc): callType = (callType != 1 ? 1 : 0)
        // Cho phép truyền trực tiếp 0 (Audio) hoặc 1 (Video), hoặc CallType.Audio (1) -> 0, CallType.Video (3) -> 1
        const normalizedCallType = rawCallType === 0 || rawCallType === CallType.Audio ? 0 : 1;

        const params = {
            callerId: String(calleeId),
            callId,
            callType: normalizedCallType,
            status: options.status ?? 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt cancelVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/cancel`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
