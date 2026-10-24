import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RequestShareScreenCallOptions = {
    status?: number;
};

export type RequestShareScreenCallResponse = Record<string, unknown>;

export const requestShareScreenCallFactory = apiFactory<RequestShareScreenCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi tín hiệu bật/tắt chia sẻ màn hình trong cuộc gọi 1-1 (`/api/voicecall/requestsharescreen`, command `12064`).
     *
     * @param uidTo User ID của đối phương
     * @param callId ID của cuộc gọi
     * @param options Trạng thái chia sẻ màn hình (`status`: `1` bật, `0` tắt)
     * @throws {ZaloApiError}
     */
    return async function requestShareScreenCall(
        uidTo: string,
        callId: number,
        options: RequestShareScreenCallOptions = {},
    ): Promise<RequestShareScreenCallResponse> {
        if (!uidTo) throw new ZaloApiError("Missing uidTo");
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            uidTo: String(uidTo),
            callId,
            status: options.status ?? 1,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt requestShareScreenCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/requestsharescreen`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
