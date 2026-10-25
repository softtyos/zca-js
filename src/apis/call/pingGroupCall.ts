import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type PingGroupCallOptions = {
    hostCall: string;
    userId?: string;
    callState?: number;
    audioState?: number;
    videoState?: number;
    params?: string | Record<string, unknown>;
};

export type PingGroupCallResponse = Record<string, unknown>;

export const pingGroupCallFactory = apiFactory<PingGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi gói tin heartbeat (ping) duy trì kết nối cuộc gọi nhóm (`/api/voicecall/group/ping`, command `12097`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `userId`, `callState`, `audioState`, `videoState` và `params`
     * @throws {ZaloApiError}
     */
    return async function pingGroupCall(
        callId: number,
        options: PingGroupCallOptions,
    ): Promise<PingGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const paramsStr =
            options.params === undefined
                ? "{}"
                : typeof options.params === "string"
                  ? options.params
                  : JSON.stringify(options.params);

        const payload = {
            callId,
            hostCall: String(options.hostCall),
            userId: String(options.userId ?? ctx.uid),
            callstate: options.callState ?? 1,
            audiostate: options.audioState ?? 1,
            videostate: options.videoState ?? 0,
            params: paramsStr,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(payload));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt pingGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/ping`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
