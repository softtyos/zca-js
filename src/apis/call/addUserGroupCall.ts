import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType } from "./sendVoiceCall.js";

export type AddUserGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string;
    data?: string | Record<string, unknown>;
    session: string;
    partners: string[];
};

export type AddUserGroupCallResponse = Record<string, unknown>;

export const addUserGroupCallFactory = apiFactory<AddUserGroupCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Mời thêm thành viên vào cuộc gọi nhóm đang diễn ra (`/api/voicecall/group/adduser`, command `12435`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `session`, `partners`, `calleeId`, `callType` và `data`
     * @throws {ZaloApiError}
     */
    return async function addUserGroupCall(
        callId: number,
        options: AddUserGroupCallOptions,
    ): Promise<AddUserGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
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
            callId,
            callType: options.callType ?? CallType.GroupAudio,
            hostCall: String(options.hostCall),
            data: dataStr,
            session: options.session,
            partners: (options.partners ?? []).map(String),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt addUserGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/adduser`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
