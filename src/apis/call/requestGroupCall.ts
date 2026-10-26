import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType } from "./sendVoiceCall.js";
import { normalizeGroupCallType } from "./sendVoiceCall.js";

export type RequestGroupCallOptions = {
    callId?: number;
    typeRequest?: CallType | number;
    data?: string | Record<string, unknown>;
    partners: string[];
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
    extraData?: string;
};

export type RequestGroupCallResponse = Record<string, unknown>;

export const requestGroupCallFactory = apiFactory<RequestGroupCallResponse>()((api, _ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Xin cấp phát phiên gọi nhóm (Group Call) và máy chủ relay (`/api/voicecall/group/requestcall`, command `12433`).
     *
     * @param groupId ID của nhóm
     * @param options Danh sách `partners`, `callId`, `typeRequest` (`0` / `CallType.GroupAudio = 5` hoặc `1` / `CallType.GroupVideo = 6`) và `data`
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
        const partnersList = options.partners.map(String);
        const typeRequest = normalizeGroupCallType(options.typeRequest);

        const defaultDataObj: Record<string, unknown> = {
            groupId: String(groupId),
            groupName: options.groupName ?? "",
            groupAvatar: options.groupAvatar ?? "",
            maxUsers: options.maxUsers ?? 8,
            noiseId: JSON.stringify(partnersList),
            extraData: options.extraData ?? "",
        };

        let dataStr: string;
        if (options.data === undefined) {
            dataStr = JSON.stringify(defaultDataObj);
        } else if (typeof options.data === "string") {
            try {
                const parsed = JSON.parse(options.data);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    const merged = { ...defaultDataObj, ...(parsed as Record<string, unknown>) };
                    if (typeof merged.noiseId !== "string") {
                        merged.noiseId = JSON.stringify(merged.noiseId ?? partnersList);
                    }
                    dataStr = JSON.stringify(merged);
                } else {
                    dataStr = options.data;
                }
            } catch {
                dataStr = options.data;
            }
        } else {
            const merged: Record<string, unknown> = { ...defaultDataObj, ...options.data };
            if (typeof merged.noiseId !== "string") {
                merged.noiseId = JSON.stringify(merged.noiseId ?? partnersList);
            }
            dataStr = JSON.stringify(merged);
        }

        const params = {
            groupId: String(groupId),
            callId,
            typeRequest,
            data: dataStr,
            partners: partnersList,
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

        const resolved = await utils.resolve(response);
        if (resolved && typeof resolved === "object" && !Array.isArray(resolved)) {
            const resObj = resolved as Record<string, unknown>;
            if (typeof resObj.params === "string") {
                try {
                    const parsedParams = JSON.parse(resObj.params);
                    if (parsedParams && typeof parsedParams === "object" && !Array.isArray(parsedParams)) {
                        const paramsRecord = parsedParams as Record<string, unknown>;
                        if (typeof paramsRecord.callSetting === "string") {
                            try {
                                paramsRecord.callSetting = JSON.parse(paramsRecord.callSetting);
                            } catch {
                                // Keep raw string if invalid JSON
                            }
                        }
                        return {
                            ...paramsRecord,
                            ...resObj,
                            params: paramsRecord,
                        };
                    }
                } catch {
                    // Keep original resolved object if params is not JSON
                }
            }
        }
        return resolved;
    };
});
