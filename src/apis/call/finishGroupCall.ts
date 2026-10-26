import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType} from "./sendVoiceCall.js";
import { normalizeGroupCallType } from "./sendVoiceCall.js";

export type FinishGroupCallOptions = {
    callType?: CallType | number;
    data?: string | Record<string, unknown>;
    duration?: number;
    hostCall: string;
    partners?: string[];
    status?: number;
    joinTime?: number;
};

export type FinishGroupCallResponse = Record<string, unknown>;

export const finishGroupCallFactory = apiFactory<FinishGroupCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi báo cáo hoàn tất / kết thúc phiên gọi nhóm (`/api/voicecall/group/finish`, command `12446`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `duration`, `joinTime`, `status`, `partners` và `data`
     * @throws {ZaloApiError}
     */
    return async function finishGroupCall(
        callId: number,
        options: FinishGroupCallOptions,
    ): Promise<FinishGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const dataStr =
            options.data === undefined
                ? "{}"
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify(options.data);

        const params = {
            callId,
            callType: normalizeGroupCallType(options.callType),
            data: dataStr,
            duration: options.duration ?? 0,
            hostCall: String(options.hostCall),
            partners: (options.partners ?? []).map(String),
            status: options.status ?? 0,
            joinTime: options.joinTime ?? 0,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt finishGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/finish`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
