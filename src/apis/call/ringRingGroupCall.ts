import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType} from "./sendVoiceCall.js";
import { normalizeGroupCallType } from "./sendVoiceCall.js";

export type RingRingGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string;
    session?: string;
    status?: number;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type RingRingGroupCallResponse = Record<string, unknown>;

export const ringRingGroupCallFactory = apiFactory<RingRingGroupCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Báo hiệu thiết bị đang đổ chuông cho cuộc gọi nhóm (`/api/voicecall/group/ringring`, command `12439`).
     *
     * @param callId ID của cuộc gọi nhóm
     * @param options Thông tin `hostCall`, `calleeId`, `callType` (`0` Audio / `1` Video), `session`, `status`, `partners` và `data`
     * @throws {ZaloApiError}
     */
    return async function ringRingGroupCall(
        callId: number,
        options: RingRingGroupCallOptions,
    ): Promise<RingRingGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callType = normalizeGroupCallType(options.callType);
        const status = options.status ?? 0;
        const session = options.session ?? `${options.hostCall}_${callId}_501`;
        const defaultDataObj: Record<string, unknown> = {
            callId,
            callType,
            groupId: String(options.hostCall),
            session,
            status,
            extraData: "",
        };

        let dataStr: string;
        if (options.data === undefined) {
            dataStr = JSON.stringify(defaultDataObj);
        } else if (typeof options.data === "string") {
            try {
                const parsed = JSON.parse(options.data);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    dataStr = JSON.stringify({
                        ...defaultDataObj,
                        ...(parsed as Record<string, unknown>),
                        callType: normalizeGroupCallType(
                            (parsed as Record<string, unknown>).callType as number | undefined ?? options.callType,
                        ),
                    });
                } else {
                    dataStr = options.data;
                }
            } catch {
                dataStr = options.data;
            }
        } else {
            dataStr = JSON.stringify({
                ...defaultDataObj,
                ...options.data,
                callType: normalizeGroupCallType(
                    (options.data.callType as number | undefined) ?? options.callType,
                ),
            });
        }

        const params = {
            calleeId: String(options.calleeId ?? ctx.uid),
            callId,
            callType,
            hostCall: String(options.hostCall),
            session,
            status,
            data: dataStr,
            partners: (options.partners ?? []).map(String),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt ringRingGroupCall params");

        const url = utils.makeURL(`${voiceCallService}/api/voicecall/group/ringring`, {
            zpw_type: 24,
            params: encryptedParams,
        });

        const response = await utils.request(url, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
