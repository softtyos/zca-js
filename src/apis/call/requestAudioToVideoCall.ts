import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RequestAudioToVideoCallOptions = {
    status?: number;
};

export type RequestAudioToVideoCallResponse = Record<string, unknown>;

export const requestAudioToVideoCallFactory = apiFactory<RequestAudioToVideoCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi yêu cầu chuyển đổi cuộc gọi thoại đang diễn ra sang cuộc gọi video (`/api/voicecall/requestaudio2video`, command `12056`).
     *
     * @param uidTo User ID của đối phương
     * @param callId ID của cuộc gọi
     * @param options Trạng thái yêu cầu (`status`, mặc định `1`)
     * @throws {ZaloApiError}
     */
    return async function requestAudioToVideoCall(
        uidTo: string,
        callId: number,
        options: RequestAudioToVideoCallOptions = {},
    ): Promise<RequestAudioToVideoCallResponse> {
        if (!uidTo) throw new ZaloApiError("Missing uidTo");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            uidTo: String(uidTo),
            callId,
            status: options.status ?? 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt requestAudioToVideoCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/requestaudio2video`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
