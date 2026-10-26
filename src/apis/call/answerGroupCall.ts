import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { CallType } from "./sendVoiceCall.js";
import { normalizeGroupCallType, toVoipInt } from "./sendVoiceCall.js";

export type AnswerGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    session?: string;
    status?: number;
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
     * @param options Thông tin `hostCall`, `calleeId`, `callType` (`0` Audio / `1` Video), `session`, `status`, `partners` và `data`
     * @throws {ZaloApiError}
     */
    return async function answerGroupCall(
        callId: number,
        options: AnswerGroupCallOptions,
    ): Promise<AnswerGroupCallResponse> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callType = normalizeGroupCallType(options.callType);
        const status = options.status ?? 0;
        const session = options.session ?? `${options.hostCall}_${callId}_501`;
        const hostCallVal = toVoipInt(options.hostCall);
        const groupIdVal = toVoipInt(options.groupId ?? options.hostCall);
        const defaultDataObj: Record<string, unknown> = {
            callId,
            callType,
            groupId: groupIdVal,
            session,
            status,
            codec: "[]",
            extendData: "",
            extraData: status !== 0 ? JSON.stringify({ status }) : "",
        };

        let dataStr: string;
        if (options.data === undefined) {
            dataStr = JSON.stringify(defaultDataObj);
        } else if (typeof options.data === "string") {
            try {
                const parsed = JSON.parse(options.data);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    const parsedObj = parsed as Record<string, unknown>;
                    dataStr = JSON.stringify({
                        ...defaultDataObj,
                        ...parsedObj,
                        ...(parsedObj.groupId !== undefined
                            ? { groupId: toVoipInt(parsedObj.groupId as string | number) }
                            : {}),
                        callType: normalizeGroupCallType(
                            (parsedObj.callType as number | undefined) ?? options.callType,
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
                ...(options.data.groupId !== undefined
                    ? { groupId: toVoipInt(options.data.groupId as string | number) }
                    : {}),
                callType: normalizeGroupCallType((options.data.callType as number | undefined) ?? options.callType),
            });
        }

        const params = {
            calleeId: String(options.calleeId ?? ctx.uid),
            callId,
            callType,
            hostCall: hostCallVal,
            session,
            status,
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

        const raw = await utils.resolve(response);
        const resObj: Record<string, unknown> =
            typeof raw === "string"
                ? (JSON.parse(raw) as Record<string, unknown>)
                : ((raw ?? {}) as Record<string, unknown>);

        // Trong ZMessageDeserializer::_parseAnswerCallResponseGroup (0x100022f2c),
        // dữ liệu phản hồi thật (status, callId, hostCall, partnerInfo) nằm trong chuỗi JSON `params`.
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
