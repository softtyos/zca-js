import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import { CallType } from "./sendVoiceCall.js";

export type RequestGroupCallOptions = {
    callId?: number;
    typeRequest?: CallType | number;
    data?: string | Record<string, unknown>;
    partners: string[];
};

export type RequestGroupCallResponse = Record<string, unknown>;

export const requestGroupCallFactory = apiFactory<RequestGroupCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Xin cấp phát phiên gọi nhóm (Group Call) và máy chủ relay (`/api/voicecall/group/requestcall`, command `12433`).
     *
     * @param groupId ID của nhóm
     * @param options Danh sách `partners`, `callId`, `typeRequest` (`CallType.GroupAudio = 5` hoặc `CallType.GroupVideo = 6`) và `data`
     * @throws {ZaloApiError}
     */
    return async function requestGroupCall(
        groupId: string,
        options: RequestGroupCallOptions,
    ): Promise<RequestGroupCallResponse> {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        if (!options?.partners || !Array.isArray(options.partners)) {
            throw new ZaloApiError("Missing partners array");
        }
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callId = options.callId ?? Math.floor(Math.random() * 2_000_000_000);
        const dataStr =
            options.data === undefined
                ? "{}"
                : typeof options.data === "string"
                  ? options.data
                  : JSON.stringify(options.data);

        const params = {
            groupId: String(groupId),
            callId,
            typeRequest: options.typeRequest ?? CallType.GroupAudio,
            data: dataStr,
            partners: options.partners.map(String),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt requestGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/requestcall`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
