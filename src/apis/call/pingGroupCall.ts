import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { toVoipInt } from "./sendVoiceCall.js";

export type PingGroupCallOptions = {
    hostCall: string | number;
    userId?: string | number;
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
    return async function pingGroupCall(callId: number, options: PingGroupCallOptions): Promise<PingGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callState = options.callState ?? 1;
        const audioState = options.audioState ?? 1;
        const videoState = options.videoState ?? 0;
        const payload: Record<string, unknown> = {
            callId,
            hostCall: toVoipInt(options.hostCall),
            userId: toVoipInt(options.userId ?? options.hostCall ?? ctx.uid),
            callstate: callState,
            audiostate: audioState,
            videostate: videoState,
        };
        if (options.params !== undefined) {
            payload.params = typeof options.params === "string" ? options.params : JSON.stringify(options.params);
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(payload));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt pingGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/ping`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        const raw = await utils.resolve(response);
        const resObj: Record<string, unknown> =
            typeof raw === "string"
                ? (JSON.parse(raw) as Record<string, unknown>)
                : ((raw ?? {}) as Record<string, unknown>);

        // Trong ZMessageDeserializer::_parseResponsePing (0x100023494),
        // dữ liệu phản hồi thật (error, callId, hostCall, partnerInfo) nằm trong chuỗi JSON `data`.
        if (typeof resObj.data === "string" && resObj.data.length > 0) {
            try {
                const innerData = JSON.parse(resObj.data) as Record<string, unknown>;
                if (innerData && typeof innerData === "object") {
                    return {
                        ...innerData,
                        ...resObj,
                    };
                }
            } catch {
                // Giữ nguyên nếu data không phải JSON
            }
        }
        return resObj;
    };
});
