import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType} from "./sendVoiceCall.js";
import { normalizeGroupCallType } from "./sendVoiceCall.js";

export type SendRequestGroupCallOptions = {
    calleeId?: string;
    callId: number;
    callType?: CallType | number;
    data?: string | Record<string, unknown>;
    session: string;
    partners: string[];
    hostCall?: string | number;
    rtpAddress?: string;
    rtcpAddress?: string;
    codec?: string;
    extendData?: string | Record<string, unknown>;
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
};

export type SendRequestGroupCallResponse = Record<string, unknown>;

export const sendRequestGroupCallFactory = apiFactory<SendRequestGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Gửi tín hiệu mời tham gia / đổ chuông cuộc gọi nhóm (`/api/voicecall/group/request`, command `12434`).
     *
     * @param groupId ID của nhóm
     * @param options Thông tin `callId`, `session`, `partners`, `callType` (`0` Audio / `1` Video) và `data`
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

        const partnersList = (options.partners ?? []).map(String);
        const noiseIdJson = JSON.stringify(partnersList);
        const callType = normalizeGroupCallType(options.callType);
        const hostCallVal = String(options.hostCall ?? groupId);
        const innerGroupData = {
            noiseId: noiseIdJson,
            hostCall: hostCallVal,
            groupId: String(groupId),
            groupName: options.groupName ?? "",
            groupAvatar: options.groupAvatar ?? "",
            maxUsers: options.maxUsers ?? 8,
        };

        let dataStr: string;
        if (options.data === undefined) {
            const extendDataStr =
                typeof options.extendData === "string"
                    ? options.extendData
                    : options.extendData
                      ? JSON.stringify(options.extendData)
                      : "";
            dataStr = JSON.stringify({
                codec: options.codec ?? "",
                extendData: extendDataStr,
                rtpAddress: options.rtpAddress ?? "",
                rtcpAddress: options.rtcpAddress ?? options.rtpAddress ?? "",
                rtpAddressIPv6: "",
                rtcpAddressIPv6: "",
                hostCall: innerGroupData.hostCall,
                noiseId: noiseIdJson,
                data: JSON.stringify(innerGroupData),
            });
        } else if (typeof options.data === "string") {
            dataStr = options.data;
        } else {
            const rawObj = options.data;
            const resolvedInner =
                typeof rawObj.data === "string"
                    ? rawObj.data
                    : rawObj.data && typeof rawObj.data === "object"
                      ? JSON.stringify({ ...innerGroupData, ...(rawObj.data as Record<string, unknown>) })
                      : JSON.stringify({
                            ...innerGroupData,
                            ...(rawObj.hostCall !== undefined ? { hostCall: rawObj.hostCall } : {}),
                            ...(rawObj.noiseId !== undefined ? { noiseId: rawObj.noiseId } : {}),
                        });
            const resolvedRtp = String(rawObj.rtpAddress ?? options.rtpAddress ?? "");
            const resolvedRtcp = String(rawObj.rtcpAddress ?? options.rtcpAddress ?? resolvedRtp);
            const resolvedExtend =
                typeof rawObj.extendData === "string"
                    ? rawObj.extendData
                    : rawObj.extendData && typeof rawObj.extendData === "object"
                      ? JSON.stringify(rawObj.extendData)
                      : JSON.stringify(rawObj);
            dataStr = JSON.stringify({
                ...rawObj,
                codec: String(rawObj.codec ?? options.codec ?? ""),
                extendData: resolvedExtend,
                rtpAddress: resolvedRtp,
                rtcpAddress: resolvedRtcp,
                rtpAddressIPv6: String(rawObj.rtpAddressIPv6 ?? ""),
                rtcpAddressIPv6: String(rawObj.rtcpAddressIPv6 ?? ""),
                hostCall: rawObj.hostCall ?? innerGroupData.hostCall,
                noiseId: rawObj.noiseId ?? noiseIdJson,
                data: resolvedInner,
            });
        }

        const params = {
            calleeId: options.calleeId ?? "",
            callId: options.callId,
            callType,
            data: dataStr,
            session: options.session,
            partners: partnersList,
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
