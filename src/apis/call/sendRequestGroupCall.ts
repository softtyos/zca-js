import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType } from "./sendVoiceCall.js";

export type SendRequestGroupCallOptions = {
    calleeId?: string;
    callId: number;
    callType?: CallType | number;
    data?: string | Record<string, unknown>;
    session: string;
    partners: string[];
};

export type SendRequestGroupCallResponse = Record<string, unknown>;

export const sendRequestGroupCallFactory = apiFactory<SendRequestGroupCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi tín hiệu mời tham gia / đổ chuông cuộc gọi nhóm (`/api/voicecall/group/request`, command `12434`).
     *
     * @param groupId ID của nhóm
     * @param options Thông tin `callId`, `session`, `partners`, `callType` và `data`
     * @throws {ZaloApiError}
     */
    return async function sendRequestGroupCall(
        groupId: string,
        options: SendRequestGroupCallOptions,
    ): Promise<SendRequestGroupCallResponse> {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        if (!options?.callId) throw new ZaloApiError("Missing callId");
        if (!options?.session) throw new ZaloApiError("Missing session");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const dataStr =
            options.data === undefined
                ? "{}"
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify(options.data);

        const params = {
            calleeId: options.calleeId ?? "",
            callId: options.callId,
            callType: options.callType ?? CallType.GroupAudio,
            data: dataStr,
            session: options.session,
            partners: (options.partners ?? []).map(String),
            groupId: String(groupId),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt sendRequestGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/request`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
