import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UnholdVoiceCallOptions = {
    isResponse?: boolean;
};

export type UnholdVoiceCallResponse = Record<string, unknown>;

export const unholdVoiceCallFactory = apiFactory<UnholdVoiceCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi yêu cầu tiếp tục cuộc gọi đang tạm giữ (`/api/voicecall/unholdreq`, command `11309`, signal `413`)
     * hoặc phản hồi tiếp tục cuộc gọi (`/api/voicecall/unholdresp`, command `11310`, signal `414`).
     *
     * @param toId User ID của đối phương trong cuộc gọi
     * @param options Đặt `isResponse = true` nếu là gói phản hồi (`unholdresp`)
     * @throws {ZaloApiError}
     */
    return async function unholdVoiceCall(
        toId: string,
        options: UnholdVoiceCallOptions = {},
    ): Promise<UnholdVoiceCallResponse> {
        if (!toId) throw new ZaloApiError("Missing toId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            toId: String(toId),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt unholdVoiceCall params");

        const endpoint = options.isResponse ? "unholdresp" : "unholdreq";
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
