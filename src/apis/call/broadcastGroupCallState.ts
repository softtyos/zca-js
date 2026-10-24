import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type BroadcastGroupCallStateOptions = {
    hostCall: string;
    userId?: string;
    callState?: number;
    audioState?: number;
    videoState?: number;
    params?: string | Record<string, unknown>;
};

export type BroadcastGroupCallStateResponse = Record<string, unknown>;

export const broadcastGroupCallStateFactory = apiFactory<BroadcastGroupCallStateResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Phát (broadcast) trạng thái âm thanh / hình ảnh của thành viên trong cuộc gọi nhóm (`/api/voicecall/group/broadcast`, command `12098`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `userId`, `callState`, `audioState`, `videoState` và `params`
     * @throws {ZaloApiError}
     */
    return async function broadcastGroupCallState(
        callId: number,
        options: BroadcastGroupCallStateOptions,
    ): Promise<BroadcastGroupCallStateResponse> {
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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt broadcastGroupCallState params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/broadcast`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
