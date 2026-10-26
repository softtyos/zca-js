import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType } from "./sendVoiceCall.js";
import { normalizeGroupCallType, toVoipInt } from "./sendVoiceCall.js";

export type NotifyGroupCallOptions = {
    hostCall: string | number;
    callType?: CallType | number;
    status?: number;
    data?: string | Record<string, unknown>;
};

export type NotifyGroupCallResponse = Record<string, unknown>;

export const notifyGroupCallFactory = apiFactory<NotifyGroupCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi thông báo sự kiện trong cuộc gọi nhóm (`/api/voicecall/group/notify`, command `12447`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `callType`, `status` và `data`
     * @throws {ZaloApiError}
     */
    return async function notifyGroupCall(
        callId: number,
        options: NotifyGroupCallOptions,
    ): Promise<NotifyGroupCallResponse> {
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
            hostCall: toVoipInt(options.hostCall),
            callType: normalizeGroupCallType(options.callType),
            status: options.status ?? 0,
            data: dataStr,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt notifyGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/notify`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
