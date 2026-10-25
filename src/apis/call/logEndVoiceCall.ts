import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type LogEndVoiceCallOptions = {
    status?: number;
    logData?: string | Record<string, unknown>;
    duration?: number;
    role?: boolean | number;
};

export type LogEndVoiceCallResponse = Record<string, unknown>;

export const logEndVoiceCallFactory = apiFactory<LogEndVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi báo cáo thống kê chất lượng / kết thúc cuộc gọi (`/api/voicecall/logendcall`, command `11311`, signal `406`).
     *
     * @param partnerId User ID của đối phương
     * @param callId ID của cuộc gọi
     * @param options Thông tin `status`, `duration`, `role` và `logData`
     * @throws {ZaloApiError}
     */
    return async function logEndVoiceCall(
        partnerId: string,
        callId: number,
        options: LogEndVoiceCallOptions = {},
    ): Promise<LogEndVoiceCallResponse> {
        if (!partnerId) throw new ZaloApiError("Missing partnerId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const logdata =
            options.logData === undefined
                ? "{}"
                : typeof options.logData === "string"
                  ? options.logData
                  : JSON.stringify(options.logData);

        const params = {
            call_id: callId,
            partner_id: String(partnerId),
            status: options.status ?? 0,
            logdata,
            duration: options.duration ?? 0,
            role: options.role ?? true,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt logEndVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/logendcall`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
