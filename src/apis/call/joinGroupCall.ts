import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { toVoipInt } from "./sendVoiceCall.js";

export type JoinGroupCallOptions = {
    userId?: string | number;
    hostCall: string | number;
    status?: number;
    srcJoinCall?: number;
    audioState?: number;
    videoState?: number;
    data?: string | Record<string, unknown>;
};

export type JoinGroupCallResponse = Record<string, unknown>;

export const joinGroupCallFactory = apiFactory<JoinGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Tham gia vào một cuộc gọi nhóm đang diễn ra (`/api/voicecall/group/join`, command `12043`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `userId`, `status`, `srcJoinCall`, `audioState`, `videoState` và `data`
     * @throws {ZaloApiError}
     */
    return async function joinGroupCall(callId: number, options: JoinGroupCallOptions): Promise<JoinGroupCallResponse> {
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
        const videoState = options.videoState ?? 0;
        const params = {
            userId: toVoipInt(options.userId ?? options.hostCall ?? ctx.uid),
            callId,
            hostCall: toVoipInt(options.hostCall),
            status: options.status ?? 0,
            srcJoinCall: options.srcJoinCall ?? 0,
            audiostate: audioState,
            videostate: videoState,
            data: dataStr,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt joinGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/join`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
