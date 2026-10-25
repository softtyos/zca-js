import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType } from "./sendVoiceCall.js";

export type AnswerGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type AnswerGroupCallResponse = Record<string, unknown>;

export const answerGroupCallFactory = apiFactory<AnswerGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Chấp nhận / Nghe cuộc gọi nhóm đến (`/api/voicecall/group/answer`, command `12436`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `calleeId`, `callType`, `partners` và `data`
     * @throws {ZaloApiError}
     */
    return async function answerGroupCall(
        callId: number,
        options: AnswerGroupCallOptions,
    ): Promise<AnswerGroupCallResponse> {
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
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt answerGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/answer`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
