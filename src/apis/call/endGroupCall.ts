import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType } from "./sendVoiceCall.js";

export type EndGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type EndGroupCallResponse = Record<string, unknown>;

export const endGroupCallFactory = apiFactory<EndGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Rời khỏi hoặc kết thúc cuộc gọi nhóm (`/api/voicecall/group/endcall`, command `12438`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `calleeId`, `callType`, `partners` và `data`
     * @throws {ZaloApiError}
     */
    return async function endGroupCall(
        callId: number,
        options: EndGroupCallOptions,
    ): Promise<EndGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const dataStr =
            options.data === undefined
                ? "{}"
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify(options.data);

        const params = {
            calleeId: String(options.calleeId ?? ctx.uid),
            callId,
            callType: options.callType ?? CallType.GroupAudio,
            hostCall: String(options.hostCall),
            data: dataStr,
            partners: (options.partners ?? []).map(String),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt endGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/endcall`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
