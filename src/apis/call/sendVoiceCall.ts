import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { DEFAULT_ZALO_AUDIO_CODEC, buildZrtcExtendData } from "../../call-engine/ZRTPPacketCodec.js";
import { apiFactory, resolveResponse } from "../../utils.js";

export enum CallType {
    Audio = 1,
    Video = 3,
    GroupAudio = 5,
    GroupVideo = 6,
}

export type SendVoiceCallOptions = {
    callType?: CallType;
    callId?: number;
    codec?: string;
};

export type RequestCallServerEntry = {
    rtpaddr?: string;
    rtcpaddr?: string;
    rtpIPv6?: string;
    rtcpIPv6?: string;
    spTcp?: number;
    bonus?: number;
    [key: string]: unknown;
};

export type RequestCallServerInfo = {
    sessId: string;
    fromId?: number;
    toId?: number;
    protocol?: number;
    rtpServer?: string;
    rtcpServer?: string;
    rtpIP?: string;
    rtcpIP?: string;
    rtpIPv6?: string;
    rtcpIPv6?: string;
    servers?: RequestCallServerEntry[];
    zrtpKey?: string;
    zrtc_config?: Record<string, unknown> | string;
    settings?: Record<string, unknown>;
    expiredTime?: number;
    codec?: string;
    [key: string]: unknown;
};

export type SendVoiceCallResponse = {
    callId: number;
    sessId: string;
    rtpServer: string;
    rtcpServer: string;
    zrtpKey?: string;
    expiredTime?: number;
    codec?: string;
    serverInfo?: RequestCallServerInfo;
    requestResult?: unknown;
};

function parseServerEndpoint(addr: string | undefined): { host: string; ip: string; port: number } {
    if (!addr) return { host: "", ip: "0.0.0.0", port: 0 };
    const idx = addr.lastIndexOf(":");
    if (idx === -1) return { host: addr, ip: addr, port: 0 };
    const ip = addr.slice(0, idx);
    const port = Number.parseInt(addr.slice(idx + 1), 10) || 0;
    return { host: addr, ip, port };
}

export const sendVoiceCallFactory = apiFactory<SendVoiceCallResponse>()((api, ctx, utils) => {
    const voiceCallService = api.zpwServiceMap.voice_call?.[0];

    /**
     * Khởi tạo cuộc gọi thoại / video (Signaling 2 bước: `/api/voicecall/requestcall` command `11300`
     * + `/api/voicecall/request` command `11301`) giúp đổ chuông trực tiếp trên thiết bị của người nhận.
     *
     * @param calleeId User ID của người nhận cuộc gọi
     * @param options Tuỳ chọn loại cuộc gọi (`CallType.Audio` hoặc `CallType.Video`) và `callId`
     * @throws {ZaloApiError}
     */
    return async function sendVoiceCall(
        calleeId: string,
        options: SendVoiceCallOptions = {},
    ): Promise<SendVoiceCallResponse> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");
        if (!voiceCallService) throw new ZaloApiError("Missing voice_call service URL in zpwServiceMap");

        const callType = options.callType ?? CallType.Audio;
        const callId = options.callId ?? Math.floor(Math.random() * 2_000_000_000);
        const codec = options.codec ?? DEFAULT_ZALO_AUDIO_CODEC;
        const normalizedCalleeId = String(calleeId);

        // Step 1: Allocate call session & RTP/RTCP relay endpoints (/api/voicecall/requestcall, command 11300)
        const step1Params = {
            calleeId: normalizedCalleeId,
            callId,
            codec,
            typeRequest: callType,
            imei: ctx.imei,
        };

        const encryptedStep1 = utils.encodeAES(JSON.stringify(step1Params));
        if (!encryptedStep1) throw new ZaloApiError("Failed to encrypt requestcall params");

        const requestCallURL = utils.makeURL(`${voiceCallService}/api/voicecall/requestcall`, {
            zpw_type: 24,
            params: encryptedStep1,
        });

        const step1Res = await utils.request(requestCallURL, {
            method: "GET",
        });

        const serverInfo = await resolveResponse<RequestCallServerInfo>(ctx, step1Res, (result) => {
            const raw = result.data as RequestCallServerInfo | string;
            return typeof raw === "string" ? (JSON.parse(raw) as RequestCallServerInfo) : raw;
        });

        const resolvedRtpServer =
            serverInfo?.rtpServer ?? serverInfo?.rtpIP ?? serverInfo?.servers?.[0]?.rtpaddr ?? "";
        const resolvedRtcpServer =
            serverInfo?.rtcpServer ?? serverInfo?.rtcpIP ?? serverInfo?.servers?.[0]?.rtcpaddr ?? "";

        const rtp = parseServerEndpoint(resolvedRtpServer);
        const rtcp = parseServerEndpoint(resolvedRtcpServer);
        const sessId = serverInfo?.sessId ?? `${normalizedCalleeId}_${callId}_401`;
        const resolvedCodec =
            serverInfo?.codec && serverInfo.codec !== "[]" ? serverInfo.codec : codec;

        // Step 2: Send ringing signaling request (/api/voicecall/request, command 11301)
        const isVideo = callType === CallType.Video;
        const extendData = JSON.stringify({
            ...buildZrtcExtendData({
                rtpAddress: rtp.host,
                rtcpAddress: rtcp.host,
                isVideo,
            }),
            rtcpDiff: 0,
            rtcp: [{ ip: rtcp.ip, port: rtcp.port }],
            rtp: [{ ip: rtp.ip, port: rtp.port }],
            status: 0,
        });

        const step2Params = {
            calleeId: normalizedCalleeId,
            rtcpAddress: rtcp.host,
            rtpAddress: rtp.host,
            codec: resolvedCodec,
            session: sessId,
            callId,
            imei: ctx.imei,
            subCommand: 3,
            extendData,
        };

        const encryptedStep2 = utils.encodeAES(JSON.stringify(step2Params));
        if (!encryptedStep2) throw new ZaloApiError("Failed to encrypt voicecall request params");

        const requestURL = utils.makeURL(`${voiceCallService}/api/voicecall/request`, {
            zpw_type: 24,
            params: encryptedStep2,
        });

        const step2Res = await utils.request(requestURL, {
            method: "GET",
        });

        const requestResult = await utils.resolve(step2Res);

        return {
            callId,
            sessId,
            rtpServer: resolvedRtpServer,
            rtcpServer: resolvedRtcpServer,
            zrtpKey: serverInfo?.zrtpKey,
            expiredTime: serverInfo?.expiredTime,
            codec: resolvedCodec,
            serverInfo,
            requestResult,
        };
    };
});
