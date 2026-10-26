import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType } from "./sendVoiceCall.js";
import { normalizeGroupCallType, toVoipInt } from "./sendVoiceCall.js";

export type AddUserGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
    rtpAddress?: string;
    rtcpAddress?: string;
    codec?: string;
    extendData?: string | Record<string, unknown>;
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
     * @param options Thông tin `hostCall`, `session`, `partners`, `calleeId`, `callType` (`0` Audio / `1` Video) và `data`
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

        const partnersList = (options.partners ?? []).map(String);
        const callType = normalizeGroupCallType(options.callType);
        const groupIdVal = toVoipInt(options.groupId ?? options.hostCall);
        const hostCallVal = toVoipInt(options.hostCall);
        const innerGroupData = {
            groupId: groupIdVal,
            hostCall: hostCallVal,
            groupName: options.groupName ?? "",
            groupAvatar: options.groupAvatar ?? "",
            maxUsers: options.maxUsers ?? 8,
            noiseId: JSON.stringify(partnersList),
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
                hostCall: hostCallVal,
                noiseId: JSON.stringify(partnersList),
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
                      : JSON.stringify(innerGroupData);
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
                hostCall: rawObj.hostCall !== undefined ? toVoipInt(rawObj.hostCall as string | number) : hostCallVal,
                noiseId: rawObj.noiseId ?? JSON.stringify(partnersList),
                data: resolvedInner,
            });
        }

        const params = {
            calleeId: options.calleeId ?? "",
            callId,
            callType,
            hostCall: hostCallVal,
            groupId: groupIdVal,
            data: dataStr,
            session: options.session,
            partners: partnersList,
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

        const raw = await utils.resolve(response);
        const resObj: Record<string, unknown> =
            typeof raw === "string"
                ? (JSON.parse(raw) as Record<string, unknown>)
                : ((raw ?? {}) as Record<string, unknown>);

        // Trong ZMessageDeserializer::_parseResponseAddUserGroup (0x100022180),
        // dữ liệu phản hồi thật nằm trong chuỗi JSON `params`.
        if (typeof resObj.params === "string" && resObj.params.length > 0) {
            try {
                const innerParams = JSON.parse(resObj.params) as Record<string, unknown>;
                if (innerParams && typeof innerParams === "object") {
                    return {
                        ...innerParams,
                        ...resObj,
                    };
                }
            } catch {
                // Giữ nguyên nếu params không phải JSON
            }
        }
        return resObj;
    };
});
