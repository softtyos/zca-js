import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RingRingVoiceCallOptions = {
    status?: number;
};

export type RingRingVoiceCallResponse = Record<string, unknown>;

export const ringRingVoiceCallFactory = apiFactory<RingRingVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Báo hiệu thiết bị của người nhận đang đổ chuông cho người gọi (`/api/voicecall/ringring`, command `11302`, signal `407`).
     *
     * @param callerId User ID của người gọi đến
     * @param callId ID của cuộc gọi
     * @param options Tuỳ chọn mã trạng thái (`status`, mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function ringRingVoiceCall(
        callerId: string,
        callId: number,
        options: RingRingVoiceCallOptions = {},
    ): Promise<RingRingVoiceCallResponse> {
        if (!callerId) throw new ZaloApiError("Missing callerId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            callerId: String(callerId),
            callId,
            status: options.status ?? 0,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt ringRingVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/ringring`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
