import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type EndVoiceCallOptions = {
    status?: number;
};

export type EndVoiceCallResponse = Record<string, unknown>;

export const endVoiceCallFactory = apiFactory<EndVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Kết thúc cuộc gọi thoại / video (`/api/voicecall/endcall`, command `11306`).
     *
     * @param calleeId User ID của đối phương
     * @param callId ID của cuộc gọi
     * @param options Tuỳ chọn mã trạng thái kết thúc (`status`, mặc định `3`)
     * @throws {ZaloApiError}
     */
    return async function endVoiceCall(
        calleeId: string,
        callId: number,
        options: EndVoiceCallOptions = {},
    ): Promise<EndVoiceCallResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            uidTo: String(calleeId),
            callId,
            status: options.status ?? 3,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt endVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/endcall`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
