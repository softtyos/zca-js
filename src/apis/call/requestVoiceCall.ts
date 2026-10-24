import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, resolveResponse } from "../../utils.js";
import { CallType, type RequestCallServerInfo } from "./sendVoiceCall.js";

export type RequestVoiceCallOptions = {
    callType?: CallType;
    callId?: number;
    codec?: string;
};

export type RequestVoiceCallResponse = RequestCallServerInfo & {
    callId: number;
};

export const requestVoiceCallFactory = apiFactory<RequestVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Xin cấp phát phiên gọi thoại / video và máy chủ relay RTP/RTCP (`/api/voicecall/requestcall`, command `11300`, signal `401`).
     *
     * @param calleeId User ID của người nhận cuộc gọi
     * @param options Tuỳ chọn loại cuộc gọi (`callType`), `callId` và `codec`
     * @throws {ZaloApiError}
     */
    return async function requestVoiceCall(
        calleeId: string,
        options: RequestVoiceCallOptions = {},
    ): Promise<RequestVoiceCallResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callType = options.callType ?? CallType.Audio;
        const callId = options.callId ?? Math.floor(Math.random() * 2_000_000_000);
        const codec = options.codec ?? "[]";

        const params = {
            calleeId: String(calleeId),
            callId,
            codec,
            typeRequest: callType,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt requestVoiceCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/requestcall`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        const serverInfo = await resolveResponse<RequestCallServerInfo>(ctx, response, (result) => {
            const raw = result.data as RequestCallServerInfo | string;
            return typeof raw === "string" ? (JSON.parse(raw) as RequestCallServerInfo) : raw;
        });

        return {
            ...serverInfo,
            callId,
        };
    };
});
