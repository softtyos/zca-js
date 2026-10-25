import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateCallMediaStateOptions = {
    isOnCam?: boolean | number;
    isOnMic?: boolean | number;
    data?: string | Record<string, unknown>;
};

export type UpdateCallMediaStateResponse = Record<string, unknown>;

export const updateCallMediaStateFactory = apiFactory<UpdateCallMediaStateResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Đồng bộ trạng thái bật/tắt Camera và Microphone trong cuộc gọi 1-1 (`/api/voicecall/conf`, command `12006`).
     * Khớp chính xác với `ZMessageSerializer::sendOnOffMicCam` (`0x100026cdc`):
     * - Khi bật/tắt Camera (`UiOnOffCameraEvent`): `isOnCam = 1 | 0`, `isOnMic = -1`, `data = ""`
     * - Khi bật/tắt Mic (`UiMuteEvent`): `isOnCam = -1`, `isOnMic = 1 | 0`, `data = ""`
     *
     * @param calleeId User ID của đối phương
     * @param callId ID của cuộc gọi
     * @param options Trạng thái `isOnCam`, `isOnMic` và `data` bổ sung
     * @throws {ZaloApiError}
     */
    return async function updateCallMediaState(
        calleeId: string,
        callId: number,
        options: UpdateCallMediaStateOptions,
    ): Promise<UpdateCallMediaStateResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const dataStr =
            options.data === undefined
                ? ""
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify(options.data);

        const isOnCamVal =
            options.isOnCam === undefined
                ? -1
                : typeof options.isOnCam === "boolean"
                  ? options.isOnCam
                      ? 1
                      : 0
                  : Number(options.isOnCam);

        const isOnMicVal =
            options.isOnMic === undefined
                ? -1
                : typeof options.isOnMic === "boolean"
                  ? options.isOnMic
                      ? 1
                      : 0
                  : Number(options.isOnMic);

        const params = {
            calleeId: String(calleeId),
            callId,
            isOnCam: isOnCamVal,
            isOnMic: isOnMicVal,
            data: dataStr,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt updateCallMediaState params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/conf`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
