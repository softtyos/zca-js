import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType} from "./sendVoiceCall.js";
import { normalizeGroupCallType } from "./sendVoiceCall.js";

export type CancelGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string;
    session?: string;
    duration?: number;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type CancelGroupCallResponse = Record<string, unknown>;

export const cancelGroupCallFactory = apiFactory<CancelGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Từ chối / Huỷ lời mời tham gia cuộc gọi nhóm (`/api/voicecall/group/cancel`, command `12437`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `calleeId`, `callType` (`0` Audio / `1` Video), `partners` và `data`
     * @throws {ZaloApiError}
     */
    return async function cancelGroupCall(
        callId: number,
        options: CancelGroupCallOptions,
    ): Promise<CancelGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callType = normalizeGroupCallType(options.callType);
        const defaultDataObj: Record<string, unknown> = {
            callType,
            groupId: String(options.hostCall),
            duration: options.duration ?? 0,
            extraData: "",
            ...(options.session ? { session: options.session } : {}),
        };

        const dataStr =
            options.data === undefined
                ? JSON.stringify(defaultDataObj)
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify({ ...defaultDataObj, ...options.data, callType });

        const params = {
            calleeId: String(options.calleeId ?? ctx.uid),
            callId,
            callType,
            hostCall: String(options.hostCall),
            data: dataStr,
            partners: (options.partners ?? []).map(String),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt cancelGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/cancel`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
