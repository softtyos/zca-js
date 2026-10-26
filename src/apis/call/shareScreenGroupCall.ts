import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ShareScreenGroupCallOptions = {
    userId?: string;
    hostCall: string;
    status?: number;
    audioState?: number;
    videoState?: number;
    data?: string | Record<string, unknown>;
};

export type ShareScreenGroupCallResponse = Record<string, unknown>;

export const shareScreenGroupCallFactory = apiFactory<ShareScreenGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Bật/tắt chia sẻ màn hình trong cuộc gọi nhóm (`/api/voicecall/group/sharescreen`, command `12044`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `userId`, `status`, `audioState`, `videoState` và `data`
     * @throws {ZaloApiError}
     */
    return async function shareScreenGroupCall(
        callId: number,
        options: ShareScreenGroupCallOptions,
    ): Promise<ShareScreenGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const dataStr =
            options.data === undefined
                ? "{}"
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify(options.data);

        const audioState = options.audioState ?? 1;
        const videoState = options.videoState ?? 1;
        const params = {
            userId: String(options.userId ?? ctx.uid),
            callId,
            hostCall: String(options.hostCall),
            status: options.status ?? 1,
            audioState,
            videoState,
            audiostate: audioState,
            videostate: videoState,
            data: dataStr,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt shareScreenGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/sharescreen`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
