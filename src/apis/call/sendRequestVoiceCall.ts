import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type SendRequestVoiceCallOptions = {
    callId: number;
    session: string;
    rtpAddress: string;
    rtcpAddress: string;
    codec?: string;
    extendData?: string | Record<string, unknown>;
    subCommand?: number;
};

export type SendRequestVoiceCallResponse = Record<string, unknown>;

export const sendRequestVoiceCallFactory = apiFactory<SendRequestVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi tín hiệu đổ chuông kèm thông tin kết nối RTP/RTCP & `extendData` (`/api/voicecall/request`, command `11301`, signal `416`).
     *
     * @param calleeId User ID của người nhận cuộc gọi
     * @param options Thông tin `callId`, `session`, `rtpAddress`, `rtcpAddress`, `codec` và `extendData`
     * @throws {ZaloApiError}
     */
    return async function sendRequestVoiceCall(
        calleeId: string,
        options: SendRequestVoiceCallOptions,
    ): Promise<SendRequestVoiceCallResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!options?.callId) throw new ZaloApiError("Missing callId");
        if (!options?.session) throw new ZaloApiError("Missing session");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const extendDataStr =
            options.extendData === undefined
                ? undefined
                : typeof options.extendData === "string"
                  ? options.extendData
                  : JSON.stringify(options.extendData);

        const params: Record<string, unknown> = {
            calleeId: String(calleeId),
            rtcpAddress: options.rtcpAddress ?? "",
            rtpAddress: options.rtpAddress ?? "",
            codec: options.codec ?? "[]",
            session: options.session,
            callId: options.callId,
            imei: ctx.imei,
        };

        if (extendDataStr) {
            params.extendData = extendDataStr;
            params.subCommand = options.subCommand ?? 3;
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt sendRequestVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/request`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
