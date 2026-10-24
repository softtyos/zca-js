import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type HoldVoiceCallOptions = {
    isResponse?: boolean;
};

export type HoldVoiceCallResponse = Record<string, unknown>;

export const holdVoiceCallFactory = apiFactory<HoldVoiceCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi yêu cầu tạm giữ cuộc gọi (`/api/voicecall/holdreq`, command `11307`, signal `411`)
     * hoặc phản hồi tạm giữ cuộc gọi (`/api/voicecall/holdresp`, command `11308`, signal `412`).
     *
     * @param toId User ID của đối phương trong cuộc gọi
     * @param options Đặt `isResponse = true` nếu là gói phản hồi (`holdresp`)
     * @throws {ZaloApiError}
     */
    return async function holdVoiceCall(
        toId: string,
        options: HoldVoiceCallOptions = {},
    ): Promise<HoldVoiceCallResponse> {
        if (!toId) throw new ZaloApiError("Missing toId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            toId: String(toId),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt holdVoiceCall params");

        const endpoint = options.isResponse ? "holdresp" : "holdreq";
        const url = utils.makeURL(`${voiceCallService}/api/voicecall/${endpoint}`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
