import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType, normalizeGroupCallType } from "./sendVoiceCall.js";

export type GetGroupCallStateResponse = Record<string, unknown>;

export const getGroupCallStateFactory = apiFactory<GetGroupCallStateResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Lấy trạng thái hiện tại của cuộc gọi nhóm (`/api/voicecall/group/state`, command `12445`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param hostCall User ID hoặc Group ID chủ trì cuộc gọi (`hostCall`)
     * @param callType Loại cuộc gọi nhóm (`CallType.GroupAudio = 5` hoặc `CallType.GroupVideo = 6`)
     * @throws {ZaloApiError}
     */
    return async function getGroupCallState(
        callId: number,
        hostCall: string,
        callType: CallType | number = CallType.GroupAudio,
    ): Promise<GetGroupCallStateResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const params = {
            callId,
            hostCall: String(hostCall),
            callType: normalizeGroupCallType(callType),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt getGroupCallState params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/state`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
