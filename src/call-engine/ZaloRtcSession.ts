import dgram from "node:dgram";
import EventEmitter from "node:events";
import { Buffer } from "node:buffer";
import type { API } from "../apis.js";
import { CallType, normalizeGroupCallType, type RequestCallServerInfo } from "../apis/call/sendVoiceCall.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { CallEventType, type CallEvent } from "../models/CallEvent.js";
import {
    DEFAULT_ZALO_AUDIO_CODEC,
    ZRTCMediaSubCommand,
    ZRTPControlCommand,
    ZRTPForwardSubCommand,
    ZRTPLegacyMediaType,
    ZRTCRole,
    buildAudioCodecMutePacket,
    buildEndCallRequest,
    buildGroupVideoQualityBitrateConfigPacket,
    buildGroupVideoQualityRequestPacket,
    buildInitCallRequest,
    buildInitZaviPingRequest,
    buildPingRequest,
    buildPingResponse,
    buildRelayPingRequest,
    buildRequestForwardPacket,
    buildZrtcExtendData,
    parseZRTPPacket,
    uidToUint32,
    wrapLegacyMediaPacket,
    wrapZrtcMediaPacket,
    type ParsedZRTPPacket,
    type ZRTPControlPacket,
} from "./ZRTPPacketCodec.js";
import {
    ZaloSrtpSession,
    buildGroupCallVideoRtpHeaderExtension,
    buildRtpPacket,
    generateSrtpMasterKeyBase64,
    parseRtpPacket,
    type ParsedRtpPacket,
    type SrtpCryptoSuite,
} from "./ZaloSrtpSession.js";

export type ZaloRtcSessionState = "idle" | "allocating" | "handshaking_udp" | "ringing" | "active" | "ended" | "error";

export type ZaloMobileDirectHandoffBundle = {
    callId: number;
    sessId: string;
    isCaller: boolean;
    partnerId: string;
    fromUid32: number;
    toUid32: number;
    callType: CallType;
    rtpHost: string;
    rtpPort: number;
    rtcpHost: string;
    rtcpPort: number;
    packetMode: 1 | 2;
    routingToken: number;
    codec: string;
    srtpMasterKeyBase64?: string;
    zrtpKey?: string;
    /**
     * Gói UDP `InitCall` (`0x01 0x7e`, `cmd=11` cho Caller hoặc `cmd=12` cho Callee) mã hoá sẵn dạng hex.
     * Mobile gửi gói này đầu tiên tới `rtpHost:rtpPort` để đăng ký NAT trực tiếp với Relay Server
     * và nhận phản hồi `0x02 0x7e` (chứa `routingToken` Int32LE tại byte `17..20`).
     */
    initCallPacketHex: string;
    /**
     * Gói UDP `RelayPing` (`0x01 0x7e`, `cmd=2`) kèm `sessId` mã hoá sẵn dạng hex (Mobile gửi mỗi 1000ms tới `rtpHost:rtpPort`).
     */
    relayPingPacketHex: string;
    /**
     * Gói UDP `Ping` (`0x01 0x7e`, `cmd=5`) giữ NAT mã hoá sẵn dạng hex (Mobile gửi mỗi 1000ms tới `rtpHost:rtpPort`).
     */
    pingPacketHex: string;
    /**
     * Gói UDP `RequestForward ManualControl` (`0x01 0x7e`, `cmd=32, subCmd=10`, 20-byte payload) báo FPS/PacketRate định kỳ mỗi 1000ms.
     */
    manualControlPacketHex: string;
    /**
     * Gói UDP `RequestForward OnCamera` (`0x01 0x7e`, `cmd=32, subCmd=7`) báo bật Camera.
     */
    cameraOnPacketHex: string;
    /**
     * Gói UDP `RequestForward OffCamera` (`0x01 0x7e`, `cmd=32, subCmd=8`) báo tắt Camera.
     */
    cameraOffPacketHex: string;
    /**
     * Gói UDP `RequestEndCall` (`0x01 0x7e`, `cmd=3`, 25 bytes) gửi 3 lần khi kết thúc cuộc gọi.
     */
    endCallPacketHex: string;
    /**
     * Tiền tố 5-byte (Relay mode `1`: `[type(1B)][routingToken(4B LE)]`) hoặc 9-byte (P2P mode `2`)
     * để Mobile ghép trực tiếp vào trước mỗi gói RTP/RTCP khi gửi/nhận qua UDP.
     */
    audioRtpPrefixHex: string;
    audioRtcpPrefixHex: string;
    videoRtpPrefixHex: string;
    videoRtcpPrefixHex: string;
};

export type GroupCallPartnerInfo = {
    id: string;
    userId?: number;
    name: string;
    avatar: string;
    [key: string]: unknown;
};

export type ParsedIncomingCallInfo = {
    callId: number;
    callerId: string;
    callerName: string;
    callerAvatar: string;
    fromUid32: number;
    toUid32: number;
    receiverId?: number;
    sessId: string;
    callType: CallType;
    isVideo: boolean;
    isGroupCall: boolean;
    groupId: string;
    internalGroupId?: string;
    groupName: string;
    groupAvatar: string;
    hostCall: string;
    partners: string[];
    partnerInfo: GroupCallPartnerInfo[];
    rtpAddress: string;
    rtpHost: string;
    rtpPort: number;
    rtcpAddress: string;
    rtcpHost: string;
    rtcpPort: number;
    codec: string;
    srtpKey?: string;
    srtpMode?: number;
    zrtpKey?: string;
    extendData: Record<string, unknown>;
    rawEvent: CallEvent | Record<string, unknown>;
};

export type ZaloCallConnectionParams = {
    callId: number;
    sessId: string;
    isCaller: boolean;
    partnerId: string;
    fromId: number;
    toId: number;
    callType: CallType;
    rtpAddress: string;
    rtpHost: string;
    rtpPort: number;
    rtcpAddress: string;
    rtcpHost: string;
    rtcpPort: number;
    routingToken: number;
    udpHandshakeVerified: boolean;
    localUdpPort: number;
    packetMode: 1 | 2;
    codec: string;
    extendData: Record<string, unknown>;
    zrtpKey?: string;
    srtpMasterKeyBase64?: string;
    audioZrtcHeaderHex: string;
    videoZrtcHeaderHex: string;
    groupId?: string;
    hostCall?: string;
    groupPartners?: string[];
    groupPartnerInfo?: GroupCallPartnerInfo[];
    serverInfo?: RequestCallServerInfo;
    mobileDirectHandoff: ZaloMobileDirectHandoffBundle;
};

export type ZaloRtcSessionOptions = {
    /**
     * Chế độ đóng gói gói tin Media UDP:
     * - `1` (Mặc định cho Relay Server): 5-byte Relay header (`0x03` Audio RTP, `0x05` Audio RTCP, `0x0d` Video RTP, `0x0f` Video RTCP)
     * - `2` (Dành riêng cho kết nối P2P trực tiếp): ZRTC Multiplexed 9-byte header (`0x7f 0x00 ...`)
     */
    packetMode?: 1 | 2;
    /**
     * Tự động gửi gói âm thanh Opus im lặng 20ms (khi không có audio ngoài) và báo cáo RTCP SR/RR định kỳ
     * để duy trì luồng RTP/RTCP ổn định (tránh cảnh báo "Kết nối không ổn định" sau 3-4 giây). Mặc định `true`.
     */
    autoKeepaliveMedia?: boolean;
    /**
     * Chế độ chỉ xử lý Signaling trên Worker (`true` = KHÔNG mở socket UDP và KHÔNG gửi Ping/Media từ Worker,
     * để ứng dụng Mobile tự kết nối UDP trực tiếp tới `rtpHost:rtpPort` bằng `mobileDirectHandoff`). Mặc định `false`.
     */
    signalingOnly?: boolean;
    /**
     * Bật mã hoá SRTP (RFC 3711 `AES_CM_128_HMAC_SHA1_80`) cho luồng RTP/RTCP.
     */
    enableSrtp?: boolean;
    srtpSuite?: SrtpCryptoSuite;
    srtpMasterKeyBase64?: string;
    /**
     * Thời gian chờ phản hồi UDP `0x02 0x7e` tối đa (mặc định `1500` ms).
     * Nếu server UDP chưa phản hồi kịp hoặc chạy trong môi trường test giả lập HTTP,
     * phiên sẽ tự động tiếp tục với `routingToken` dự phòng từ `callId`.
     */
    udpHandshakeTimeoutMs?: number;
    /**
     * Chu kỳ gửi gói tin UDP `Ping` (`cmd=2`, `cmd=5`, `cmd=32`) giữ kết nối NAT/Relay (mặc định `1000` ms).
     */
    pingIntervalMs?: number;
    /**
     * Tự động lắng nghe sự kiện `call_event` từ `api.listener` để cập nhật trạng thái cuộc gọi.
     */
    autoAttachListener?: boolean;
    /**
     * Cổng UDP nội bộ muốn bind (mặc định `0` để OS tự cấp phát).
     */
    localUdpPort?: number;
    /**
     * Thời gian chờ đổ chuông tối đa cho cuộc gọi đi trước khi tự động huỷ (`cancelVoiceCall`)
     * để giải phóng tài nguyên UDP socket (mặc định `60000` ms = 60 giây, đặt `0` để tắt).
     */
    ringingTimeoutMs?: number;
};

export type StartOutgoingCallOptions = {
    callType?: CallType;
    callId?: number;
    codec?: string;
    skipUdpHandshake?: boolean;
    /**
     * Chỉ thực hiện Signaling HTTP/WebSocket trên Worker mà không mở UDP socket tại Worker,
     * trả về `mobileDirectHandoff` để Mobile App tự kết nối UDP trực tiếp tới Relay Server.
     */
    signalingOnly?: boolean;
    /**
     * Bắt đầu cuộc gọi với Camera tắt (`offCameraAtStart`), nhưng vẫn khởi tạo sẵn kênh Video RTP/RTCP
     * để có thể bật Camera / chuyển lên Video tức thì giữa cuộc gọi.
     */
    offCameraAtStart?: boolean;
    /**
     * Khởi tạo sẵn đường truyền Video RTP/RTCP (`extendData.callType = 1` + `OffCamera` ban đầu)
     * ngay cả khi gọi Thoại (`CallType.Audio = 1`) để cho phép nâng cấp Thoại ➔ Video mượt mà giữa cuộc gọi
     * trên ứng dụng Zalo Mobile (`zrtc::Peer::initialize` @ `0x100199de0`). Mặc định `true`.
     */
    allowVideoUpgrade?: boolean;
};

export type AcceptIncomingCallOptions = {
    codec?: string;
    skipUdpHandshake?: boolean;
    signalingOnly?: boolean;
    allowVideoUpgrade?: boolean;
    offCameraAtStart?: boolean;
    /**
     * Nếu `true`, bỏ qua bước gọi lại `ringRingVoiceCall` (khi trước đó đã gọi `ringIncomingCall`).
     */
    skipRingRing?: boolean;
    /**
     * Nếu `true`, bỏ qua bước gửi tín hiệu HTTP `answerVoiceCall` / `answerGroupCall` (dùng khi đã gửi riêng hoặc khi giả lập local).
     */
    skipAnswerSignal?: boolean;
};

export type RejectIncomingCallOptions = {
    status?: number;
};

export type StartGroupCallOptions = {
    partners: string[];
    partnerInfo?: GroupCallPartnerInfo[];
    callType?: CallType;
    callId?: number;
    codec?: string;
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
    skipUdpHandshake?: boolean;
    signalingOnly?: boolean;
    offCameraAtStart?: boolean;
};

export type JoinGroupCallSessionOptions = {
    hostCall: string;
    groupId?: string;
    partners?: string[];
    callType?: CallType;
    rtpAddress?: string;
    rtcpAddress?: string;
    session?: string;
    skipUdpHandshake?: boolean;
    signalingOnly?: boolean;
};

export type ZaloCallMediaStateEvent = {
    isLocal: boolean;
    partnerId?: string;
    voipUid?: string;
    isCameraOn?: boolean;
    isMicMuted?: boolean;
    isHold?: boolean;
    isScreenSharing?: boolean;
    callType?: CallType;
    rawAct?: string;
    reason?: number;
};

type SsrcVideoAssembler = {
    ssrc: number;
    remoteSpsNal: Buffer | null;
    remotePpsNal: Buffer | null;
    fuaFragments: Buffer[];
    currentAccessUnitNals: Buffer[];
    currentAccessUnitTs: number;
    currentAccessUnitHasIdr: boolean;
    hasEmittedKeyframe: boolean;
    lastRtpSeq: number;
    lastRtpTs: number;
    maxSeq: number;
    seqCycles: number;
    lastSrMiddleNtp: number;
    lastSrReceivedAtMs: number;
};

export type IncomingRtpEvent = {
    isVideo: boolean;
    isFec: boolean;
    rtpPacket: Buffer;
    parsedRtp: ParsedRtpPacket;
    zrtpPacket: ParsedZRTPPacket;
};

export type IncomingAudioFrameEvent = {
    payload: Buffer;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    partnerId?: string;
    payloadType: number;
    marker: boolean;
};

export type IncomingVideoFrameEvent = {
    payload: Buffer;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    partnerId?: string;
    payloadType: number;
    marker: boolean;
};

export type IncomingVideoAnnexBFrameEvent = {
    annexB: Buffer;
    isKeyframe: boolean;
    timestamp: number;
    ssrc: number;
    partnerId?: string;
    sps?: Buffer;
    pps?: Buffer;
    nalTypes?: number[];
};

export type ZaloRtcMediaStateChangeEvent = ZaloCallMediaStateEvent;
export type ZaloRtcAudioFrameEvent = IncomingAudioFrameEvent;
export type ZaloRtcVideoFrameEvent = IncomingVideoFrameEvent;
export type ZaloRtcVideoAnnexBFrameEvent = IncomingVideoAnnexBFrameEvent;

export type IncomingRtcpEvent = {
    isVideo: boolean;
    rtcpPacket: Buffer;
    zrtpPacket: ParsedZRTPPacket;
};

export interface ZaloRtcSessionEvents {
    state: [state: ZaloRtcSessionState];
    connection_params: [params: ZaloCallConnectionParams];
    active: [params: ZaloCallConnectionParams];
    incoming_call: [info: ParsedIncomingCallInfo];
    media_state_change: [state: ZaloCallMediaStateEvent];
    group_partner_sync: [partners: GroupCallPartnerInfo[]];
    pli_request: [event: { timestamp: number }];
    zrtp_control: [packet: ZRTPControlPacket];
    zrtp_packet: [packet: ParsedZRTPPacket];
    rtp_packet: [event: IncomingRtpEvent];
    audio_frame: [frame: IncomingAudioFrameEvent];
    video_frame: [frame: IncomingVideoFrameEvent];
    video_annexb_frame: [frame: IncomingVideoAnnexBFrameEvent];
    rtcp_packet: [event: IncomingRtcpEvent];
    call_event: [event: CallEvent];
    ended: [reason: string];
    error: [error: unknown];
}

function startsWithAnnexBStartCode(buf: Buffer): boolean {
    if (!buf || buf.length < 3) return false;
    let zeroCount = 0;
    let i = 0;
    while (i < buf.length && buf[i] === 0x00) {
        zeroCount++;
        i++;
    }
    return zeroCount >= 2 && i < buf.length && buf[i] === 0x01;
}

function stripLeadingAnnexBStartCode(buf: Buffer): Buffer {
    if (!buf || buf.length === 0) return buf;
    let zeroCount = 0;
    let i = 0;
    while (i < buf.length && buf[i] === 0x00) {
        zeroCount++;
        i++;
    }
    if (zeroCount >= 2 && i < buf.length && buf[i] === 0x01) {
        return buf.subarray(i + 1);
    }
    return buf;
}

function splitAnnexBNals(buf: Buffer): Buffer[] {
    const nals: Buffer[] = [];
    let i = 0;
    let nalStart = -1;
    while (i < buf.length) {
        if (buf[i] === 0x00 && i + 2 < buf.length && buf[i + 1] === 0x00) {
            let j = i;
            while (j < buf.length && buf[j] === 0x00) {
                j++;
            }
            if (j < buf.length && buf[j] === 0x01 && j - i >= 2) {
                if (nalStart !== -1 && i > nalStart) {
                    nals.push(buf.subarray(nalStart, i));
                }
                nalStart = j + 1;
                i = j + 1;
                continue;
            }
        }
        i++;
    }
    if (nalStart !== -1 && nalStart < buf.length) {
        nals.push(buf.subarray(nalStart));
    } else if (nals.length === 0 && buf.length > 0) {
        nals.push(buf);
    }
    return nals;
}

function tryParseAggregatedNals(buf: Buffer, startOffset: number): Buffer[] | null {
    if (!buf || startOffset >= buf.length) return null;
    const chunks: Buffer[] = [];
    let offset = startOffset;
    while (offset + 2 <= buf.length) {
        const nalSize = buf.readUInt16BE(offset);
        offset += 2;
        if (nalSize <= 0 || offset + nalSize > buf.length) {
            return null;
        }
        chunks.push(buf.subarray(offset, offset + nalSize));
        offset += nalSize;
    }
    return offset === buf.length && chunks.length > 0 ? chunks : null;
}

function isZaloVideoPayloadType(pt: number): boolean {
    return pt === 97 || pt === 98 || pt === 121 || pt === 122 || pt === 125 || pt === 126;
}

function isZaloKeyframePayloadType(pt: number): boolean {
    return pt === 98 || pt === 121 || pt === 126;
}

function parseEndpoint(addr: string | undefined): { address: string; host: string; port: number } {
    if (!addr) return { address: "", host: "127.0.0.1", port: 0 };
    const idx = addr.lastIndexOf(":");
    if (idx === -1) return { address: addr, host: addr, port: 0 };
    const host = addr.slice(0, idx);
    const port = Number.parseInt(addr.slice(idx + 1), 10) || 0;
    return { address: addr, host, port };
}

function safeJsonParseRecord(value: unknown): Record<string, unknown> {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                return parsed as Record<string, unknown>;
            }
        } catch {
            // Ignore invalid JSON string
        }
    }
    return {};
}

function safeJsonParseArray(value: unknown): Array<Record<string, unknown>> {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value as Array<Record<string, unknown>>;
    }
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed as Array<Record<string, unknown>>;
            }
        } catch {
            // Ignore invalid JSON array
        }
    }
    return [];
}

function extractSrtpConfigFromSource(rawSource: unknown): {
    srtpKey?: string;
    srtpMode?: number;
    srtpNoSeq?: boolean;
    audSrtpNoSeq?: boolean;
} {
    const topObj = safeJsonParseRecord(rawSource);
    const dataObj = topObj.data !== undefined ? safeJsonParseRecord(topObj.data) : {};
    const paramsObj =
        topObj.params !== undefined
            ? safeJsonParseRecord(topObj.params)
            : dataObj.params !== undefined
              ? safeJsonParseRecord(dataObj.params)
              : {};
    const innerDataObj =
        paramsObj.data !== undefined
            ? safeJsonParseRecord(paramsObj.data)
            : dataObj.data !== undefined
              ? safeJsonParseRecord(dataObj.data)
              : {};
    const extendObj = safeJsonParseRecord(
        paramsObj.extendData ?? dataObj.extendData ?? topObj.extendData ?? innerDataObj.extendData,
    );
    const callSettingObj = safeJsonParseRecord(
        paramsObj.callSetting ?? dataObj.callSetting ?? topObj.callSetting ?? innerDataObj.callSetting,
    );
    const zrtcConfigObj = safeJsonParseRecord(
        callSettingObj.zrtcConfig ??
            paramsObj.zrtcConfig ??
            dataObj.zrtcConfig ??
            topObj.zrtcConfig ??
            extendObj.zrtcConfig,
    );

    for (const obj of [callSettingObj, zrtcConfigObj, extendObj, paramsObj, dataObj, innerDataObj, topObj]) {
        const encObj = safeJsonParseRecord(obj.enc ?? obj.srtp ?? obj.encryption);
        const candidateKey =
            (typeof encObj.key === "string" && encObj.key) ||
            (typeof encObj.srtpKey === "string" && encObj.srtpKey) ||
            (typeof obj.srtpKey === "string" && obj.srtpKey) ||
            (typeof obj.masterKey === "string" && obj.masterKey) ||
            (typeof obj.encKey === "string" && obj.encKey) ||
            undefined;
        if (candidateKey && candidateKey.length >= 40) {
            const vidNoSeqVal =
                encObj.noSeq ?? encObj.srtpNoSeq ?? obj.srtpNoSeq ?? obj.vidSrtpNoSeq ?? callSettingObj.srtpNoSeq;
            const audNoSeqVal = encObj.audSrtpNoSeq ?? obj.audSrtpNoSeq ?? callSettingObj.audSrtpNoSeq;
            const vidNoSeq = vidNoSeqVal !== undefined ? Boolean(Number(vidNoSeqVal)) : true;
            const audNoSeq = audNoSeqVal !== undefined ? Boolean(Number(audNoSeqVal)) : vidNoSeq;
            const modeVal = encObj.enable ?? encObj.mode ?? obj.srtpMode ?? callSettingObj.srtpMode;
            return {
                srtpKey: candidateKey,
                srtpMode: modeVal !== undefined ? Number(modeVal) : 1,
                srtpNoSeq: vidNoSeq,
                audSrtpNoSeq: audNoSeq,
            };
        }
    }
    return {};
}

/**
 * Giải mã chuẩn xác sự kiện cuộc gọi đến (`act: "request"` 1-1 hoặc `act: "group_request"` Nhóm)
 * khớp 100% với `zrtc_call::ZMessageDeserializer::_parseActRequest` (`0x10001c824`),
 * `_parseActRequestDetail` (`0x10001dfa0`), `_parseActRequestGroup` (`0x10001ffc4`) và
 * `ZCallInfo::_prepareCallConfig` (`0x1000cd588`).
 */
export function parseIncomingCallEvent(
    callEvent: CallEvent | Record<string, unknown>,
    localUid?: string | number,
): ParsedIncomingCallInfo {
    const rawData =
        "data" in callEvent && typeof callEvent.data === "object" && callEvent.data !== null
            ? (callEvent.data as Record<string, unknown>)
            : (callEvent as Record<string, unknown>);
    const act = "act" in callEvent && typeof callEvent.act === "string" ? callEvent.act : String(rawData.act ?? "");

    const parsedParams =
        rawData.params !== undefined
            ? safeJsonParseRecord(rawData.params)
            : rawData.data !== undefined
              ? safeJsonParseRecord(rawData.data)
              : rawData;

    const extendRaw =
        parsedParams.extendData !== undefined
            ? safeJsonParseRecord(parsedParams.extendData)
            : rawData.extendData !== undefined
              ? safeJsonParseRecord(rawData.extendData)
              : parsedParams;

    const innerData =
        parsedParams.data !== undefined && parsedParams.data !== rawData.data
            ? safeJsonParseRecord(parsedParams.data)
            : {};

    const callSetting = safeJsonParseRecord(rawData.callSetting ?? parsedParams.callSetting ?? innerData.callSetting);

    const isGroupCall =
        act.startsWith("group_") ||
        Boolean(rawData.groupId) ||
        Boolean(rawData.groupNoiseId) ||
        Boolean(rawData.hostCall) ||
        Boolean(parsedParams.hostCall) ||
        Boolean(innerData.hostCall) ||
        Boolean(innerData.groupId) ||
        Number(rawData.callType) === CallType.GroupAudio ||
        Number(rawData.callType) === CallType.GroupVideo;

    const callId = Number(
        rawData.callId ??
            rawData.call_id ??
            rawData.id ??
            parsedParams.callId ??
            parsedParams.call_id ??
            parsedParams.id ??
            extendRaw.callId ??
            extendRaw.id ??
            0,
    );

    const mapNoiseId = safeJsonParseRecord(
        rawData.mapNoiseId ?? parsedParams.mapNoiseId ?? innerData.mapNoiseId ?? extendRaw.mapNoiseId,
    );
    const forwardNoiseIdMap = new Map<string, number>();
    const reverseNoiseIdMap = new Map<number, string>();
    for (const [key, val] of Object.entries(mapNoiseId)) {
        const numVal = Number(val);
        const numKey = Number(key);
        if (
            Number.isFinite(numVal) &&
            numVal > 0 &&
            numVal <= 0xffffffff &&
            typeof key === "string" &&
            (key.length > 10 || Number.isNaN(numKey) || numKey > 0xffffffff)
        ) {
            const voipId = numVal >>> 0;
            forwardNoiseIdMap.set(key, voipId);
            reverseNoiseIdMap.set(voipId, key);
        } else if (Number.isFinite(numKey) && numKey > 0 && numKey <= 0xffffffff && typeof val === "string") {
            const voipId = numKey >>> 0;
            forwardNoiseIdMap.set(val, voipId);
            reverseNoiseIdMap.set(voipId, val);
        } else if (Number.isFinite(numVal) && numVal > 0 && typeof key === "string") {
            const voipId = numVal >>> 0;
            forwardNoiseIdMap.set(key, voipId);
            reverseNoiseIdMap.set(voipId, key);
        }
    }

    const rawCallerId = String(
        rawData.uidN ??
            rawData.callerId ??
            parsedParams.uidN ??
            parsedParams.callerId ??
            rawData.uidFrom ??
            rawData.fromId ??
            parsedParams.uidFrom ??
            parsedParams.fromId ??
            rawData.hostCall ??
            parsedParams.hostCall ??
            innerData.hostCall ??
            "",
    );
    const rawCallerNum = Number(rawCallerId);
    const callerId =
        Number.isFinite(rawCallerNum) &&
        rawCallerNum > 0 &&
        rawCallerNum <= 0xffffffff &&
        reverseNoiseIdMap.has(rawCallerNum >>> 0)
            ? reverseNoiseIdMap.get(rawCallerNum >>> 0)!
            : rawCallerId;

    const hostCall = String(
        rawData.hostCall ??
            parsedParams.hostCall ??
            innerData.hostCall ??
            rawData.groupNoiseId ??
            rawData.groupId ??
            rawCallerId,
    );
    const groupId = isGroupCall
        ? String(rawData.groupNoiseId ?? innerData.groupId ?? rawData.groupId ?? parsedParams.groupId ?? hostCall)
        : "";
    const internalGroupId = isGroupCall
        ? String(rawData.groupId ?? parsedParams.groupId ?? innerData.groupId ?? groupId)
        : undefined;

    const hostCallNum = Number(hostCall);
    if (
        isGroupCall &&
        callerId &&
        callerId.length > 10 &&
        callerId !== groupId &&
        Number.isFinite(hostCallNum) &&
        hostCallNum > 0 &&
        hostCallNum <= 0xffffffff &&
        !forwardNoiseIdMap.has(callerId)
    ) {
        forwardNoiseIdMap.set(callerId, hostCallNum >>> 0);
        reverseNoiseIdMap.set(hostCallNum >>> 0, callerId);
    }

    const mappedLocalVoipId =
        localUid !== undefined && localUid !== null ? forwardNoiseIdMap.get(String(localUid)) : undefined;
    const rawReceiverId = Number(
        rawData.receiverId ?? parsedParams.receiverId ?? rawData.uidTo ?? parsedParams.uidTo ?? mappedLocalVoipId ?? 0,
    );
    const receiverId = rawReceiverId > 0 ? rawReceiverId : undefined;
    const groupName = String(rawData.groupName ?? parsedParams.groupName ?? innerData.groupName ?? "");
    const groupAvatar = String(rawData.groupAvatar ?? parsedParams.groupAvatar ?? innerData.groupAvatar ?? "");

    const callerName = String(
        parsedParams.Dname ??
            rawData.Dname ??
            parsedParams.callerName ??
            rawData.callerName ??
            parsedParams.name ??
            rawData.name ??
            groupName ??
            callerId,
    );
    const callerAvatar = String(
        parsedParams.avatar ?? rawData.avatar ?? parsedParams.callerAvatar ?? rawData.callerAvatar ?? groupAvatar ?? "",
    );

    // Trong ZCallInfo::_prepareCallConfig (0x1000cd5c4):
    // - Khi nhận cuộc gọi (Callee): localUid32 = uidTo (hoặc receiverId),
    //   partnerUid32 = groupId 32-bit (nếu gọi nhóm) hoặc uidFrom/fromId (nếu gọi 1-1)
    const fromUid32 =
        Number(
            rawData.uidTo ??
                rawData.receiverId ??
                parsedParams.uidTo ??
                parsedParams.receiverId ??
                mappedLocalVoipId ??
                0,
        ) || uidToUint32(localUid ?? "");
    const groupToUid32Candidate = isGroupCall ? Number(internalGroupId ?? 0) : 0;
    const toUid32 =
        isGroupCall &&
        Number.isFinite(groupToUid32Candidate) &&
        groupToUid32Candidate > 0 &&
        groupToUid32Candidate <= 0xffffffff
            ? groupToUid32Candidate >>> 0
            : Number(rawData.uidFrom ?? rawData.fromId ?? parsedParams.uidFrom ?? parsedParams.fromId ?? 0) ||
              uidToUint32(isGroupCall ? groupId || callerId : callerId);

    const serversFromCallSetting = safeJsonParseArray(callSetting.servers);
    const serversFromParams = safeJsonParseArray(parsedParams.servers);
    const serversFromRaw = safeJsonParseArray(rawData.servers);
    const serversList =
        serversFromCallSetting.length > 0
            ? serversFromCallSetting
            : serversFromParams.length > 0
              ? serversFromParams
              : serversFromRaw;
    const firstServersEntry = serversList[0];

    const serverAddrFromExtend = safeJsonParseArray(extendRaw.serverAddr);
    const serverAddrFromParams = safeJsonParseArray(parsedParams.serverAddr);
    const serverAddrList = serverAddrFromExtend.length > 0 ? serverAddrFromExtend : serverAddrFromParams;
    const firstServerAddr = serverAddrList[0];

    const rtpArray = Array.isArray(extendRaw.rtp)
        ? (extendRaw.rtp as Array<{ ip?: string; port?: number }>)
        : Array.isArray(parsedParams.rtp)
          ? (parsedParams.rtp as Array<{ ip?: string; port?: number }>)
          : [];
    const rtcpArray = Array.isArray(extendRaw.rtcp)
        ? (extendRaw.rtcp as Array<{ ip?: string; port?: number }>)
        : Array.isArray(parsedParams.rtcp)
          ? (parsedParams.rtcp as Array<{ ip?: string; port?: number }>)
          : [];

    const rtpAddr = String(
        rawData.rtpAddress ??
            rawData.rtpIP ??
            rawData.rtpServer ??
            parsedParams.rtpAddress ??
            parsedParams.rtpIP ??
            parsedParams.rtpServer ??
            firstServersEntry?.rtpaddr ??
            firstServersEntry?.rtp ??
            firstServerAddr?.rtp ??
            firstServerAddr?.rtpaddr ??
            (rtpArray[0]?.ip && rtpArray[0]?.port ? `${rtpArray[0].ip}:${rtpArray[0].port}` : ""),
    );

    const rtcpFromArray = rtcpArray[0]?.ip && rtcpArray[0]?.port ? `${rtcpArray[0].ip}:${rtcpArray[0].port}` : "";
    const rtcpAddr = String(
        rawData.rtcpAddress ??
            rawData.rtcpIP ??
            rawData.rtcpServer ??
            parsedParams.rtcpAddress ??
            parsedParams.rtcpIP ??
            parsedParams.rtcpServer ??
            firstServersEntry?.rtcpaddr ??
            firstServersEntry?.rtcp ??
            firstServerAddr?.rtcp ??
            firstServerAddr?.rtcpaddr ??
            (rtcpFromArray || rtpAddr),
    );

    const rtpEp = parseEndpoint(rtpAddr);
    const rtcpEp = parseEndpoint(rtcpAddr || rtpAddr);

    const rawCallType = Number(extendRaw.callType ?? parsedParams.callType ?? rawData.callType ?? 0);
    const isVideo =
        rawCallType === 1 ||
        rawCallType === CallType.Video ||
        rawCallType === CallType.GroupVideo ||
        Boolean(extendRaw.video);

    const callType = isGroupCall
        ? isVideo
            ? CallType.GroupVideo
            : CallType.GroupAudio
        : isVideo
          ? CallType.Video
          : CallType.Audio;

    const sessId = String(
        rawData.session ??
            rawData.sessId ??
            callSetting.session ??
            parsedParams.sessId ??
            parsedParams.session ??
            extendRaw.sessId ??
            (isGroupCall ? `${hostCall || callerId}_${callId}_501` : `${callerId}_${callId}_401`),
    );

    const rawPartnersSource =
        rawData.partnerInfo ??
        parsedParams.partnerInfo ??
        rawData.partners ??
        parsedParams.partners ??
        innerData.noiseId ??
        extendRaw.noiseId;
    let rawPartners: unknown[] = [];
    if (Array.isArray(rawPartnersSource)) {
        rawPartners = rawPartnersSource;
    } else if (typeof rawPartnersSource === "string" && rawPartnersSource.trim().startsWith("[")) {
        try {
            const parsedArr = JSON.parse(rawPartnersSource);
            if (Array.isArray(parsedArr)) {
                rawPartners = parsedArr;
            }
        } catch {
            // Ignore invalid JSON array
        }
    }

    const partnerInfo: GroupCallPartnerInfo[] = [];
    for (const p of rawPartners) {
        if (typeof p === "string" || typeof p === "number") {
            const rawStr = String(p).trim();
            if (!rawStr) continue;
            const numVal = Number(rawStr);
            const mappedFromVoip =
                Number.isFinite(numVal) && numVal > 0 && numVal <= 0xffffffff
                    ? reverseNoiseIdMap.get(numVal >>> 0)
                    : undefined;
            const id = mappedFromVoip ?? rawStr;
            const mappedVoip = forwardNoiseIdMap.get(id) ?? (mappedFromVoip !== undefined ? numVal >>> 0 : undefined);
            partnerInfo.push({
                id,
                ...(mappedVoip !== undefined ? { userId: mappedVoip } : {}),
                name: "",
                avatar: "",
            });
        } else if (p && typeof p === "object") {
            const obj = p as Record<string, unknown>;
            const rawIdNum = Number(obj.userId ?? (typeof obj.id === "number" ? obj.id : obj.id));
            const candidateVoipId =
                obj.userId !== undefined && Number.isFinite(Number(obj.userId)) && Number(obj.userId) > 0
                    ? Number(obj.userId) >>> 0
                    : typeof obj.id === "number" && obj.id > 0 && obj.id <= 0xffffffff
                      ? obj.id >>> 0
                      : Number.isFinite(rawIdNum) &&
                          rawIdNum > 0 &&
                          rawIdNum <= 0xffffffff &&
                          reverseNoiseIdMap.has(rawIdNum >>> 0)
                        ? rawIdNum >>> 0
                        : undefined;
            const mappedNoiseId = candidateVoipId !== undefined ? reverseNoiseIdMap.get(candidateVoipId) : undefined;
            const rawStrId =
                typeof obj.uid === "string"
                    ? obj.uid
                    : typeof obj.noiseId === "string"
                      ? obj.noiseId
                      : typeof obj.id === "string" && (obj.id.length > 10 || mappedNoiseId === undefined)
                        ? obj.id
                        : undefined;
            const id = String(rawStrId ?? mappedNoiseId ?? obj.id ?? obj.userId ?? "").trim();
            if (!id) continue;
            const resolvedVoipId = candidateVoipId ?? forwardNoiseIdMap.get(id);
            const name = String(obj.name ?? obj.dName ?? obj.Dname ?? obj.displayName ?? "");
            const avatar = String(obj.avatar ?? obj.zpw_avatar ?? "");
            const rawState = obj.state ?? obj.callstate ?? obj.callState;
            const normalizedState =
                rawState !== undefined && Number.isFinite(Number(rawState)) ? Number(rawState) : undefined;
            partnerInfo.push({
                ...obj,
                id,
                ...(resolvedVoipId !== undefined ? { userId: resolvedVoipId } : {}),
                ...(normalizedState !== undefined ? { state: normalizedState } : {}),
                name,
                avatar,
            });
        }
    }

    const normalizedLocalUid = localUid !== undefined && localUid !== null ? String(localUid).trim() : "";
    if (isGroupCall) {
        for (const [noiseUid, voipUid] of forwardNoiseIdMap.entries()) {
            if (normalizedLocalUid && noiseUid === normalizedLocalUid) continue;
            if (receiverId !== undefined && voipUid === receiverId) continue;
            const exists = partnerInfo.some(
                (p) => p.id === noiseUid || (p.userId !== undefined && p.userId === voipUid),
            );
            if (!exists) {
                const isCallerEntry = noiseUid === callerId;
                partnerInfo.push({
                    id: noiseUid,
                    userId: voipUid,
                    name: isCallerEntry && callerName !== groupName ? callerName : "",
                    avatar: isCallerEntry && callerAvatar !== groupAvatar ? callerAvatar : "",
                    ...(isCallerEntry ? { state: 2 } : {}),
                });
            }
        }
        if (normalizedLocalUid) {
            for (let i = partnerInfo.length - 1; i >= 0; i--) {
                const item = partnerInfo[i];
                if (
                    item.id === normalizedLocalUid ||
                    (receiverId !== undefined && (item.userId === receiverId || item.id === String(receiverId)))
                ) {
                    partnerInfo.splice(i, 1);
                }
            }
        }
    }
    const partners = partnerInfo.map((p) => p.id);

    const codec =
        typeof parsedParams.codec === "string" && parsedParams.codec !== "[]"
            ? parsedParams.codec
            : typeof rawData.codec === "string" && rawData.codec !== "[]"
              ? rawData.codec
              : DEFAULT_ZALO_AUDIO_CODEC;

    const extractedSrtp = extractSrtpConfigFromSource(callEvent);

    return {
        callId,
        callerId,
        callerName,
        callerAvatar,
        fromUid32,
        toUid32,
        ...(receiverId !== undefined ? { receiverId } : {}),
        sessId,
        callType,
        isVideo,
        isGroupCall,
        groupId,
        ...(internalGroupId !== undefined ? { internalGroupId } : {}),
        groupName,
        groupAvatar,
        hostCall,
        partners,
        partnerInfo,
        rtpAddress: rtpEp.address,
        rtpHost: rtpEp.host,
        rtpPort: rtpEp.port,
        rtcpAddress: rtcpEp.address,
        rtcpHost: rtcpEp.host,
        rtcpPort: rtcpEp.port,
        codec,
        srtpKey:
            typeof extendRaw.srtpKey === "string" && extendRaw.srtpKey.length >= 40
                ? extendRaw.srtpKey
                : extractedSrtp.srtpKey,
        srtpMode: extendRaw.srtpMode !== undefined ? Number(extendRaw.srtpMode) : extractedSrtp.srtpMode,
        zrtpKey:
            typeof parsedParams.zrtpKey === "string"
                ? parsedParams.zrtpKey
                : typeof extendRaw.zrtpKey === "string"
                  ? extendRaw.zrtpKey
                  : undefined,
        extendData: extendRaw,
        rawEvent: callEvent,
    };
}

/**
 * Khung Opus silence / DTX 20ms chuẩn (TOC `0xf8` = Silk-only WB 20ms mono + `0xff 0xfe`)
 */
const OPUS_SILENCE_20MS_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);

/**
 * Khung H.264 Baseline Profile Level 3.0 16x16 hợp lệ (SPS `0x67` + PPS `0x68` + IDR Slice `0x65`)
 * giúp bộ giải mã phần cứng đối phương render đủ 15fps ngay cả khi chưa bật camera ngoài
 * (`CallController::_checkEventLossVideoAndReason` @ `0x100182734`).
 */
const H264_KEEPALIVE_ANNEXB_FRAME = Buffer.from(
    "000000016742c01ed90f8888840000030004000003003c8f162e480000000168cb83cb20000000016588840033ff",
    "hex",
);

/**
 * Bộ máy xử lý phiên gọi Thoại & Video thuần TypeScript / Node.js (`node:dgram` UDP + `ZRTPPacket` + `SRTP`).
 *
 * Hoạt động độc lập 100% trên Worker, Linux Server, Docker, hoặc Desktop mà **không cần cài đặt Zalo PC**:
 * - Thực hiện trọn vẹn luồng Signaling 401 -> Bắt tay UDP `0x01 0x7e` (`cmd=11/12`) -> Nhận `routingToken` -> Signaling 416 / 402 -> Duy trì UDP Ping (`cmd=2/5/32`) & RTCP SR/RR.
 * - Hỗ trợ chế độ **Direct Mobile Media Handoff** (`signalingOnly: true` / `handoffUdpToExternal()`): Worker chỉ tạo/nhận cuộc gọi qua HTTPS/WebSocket rồi trả gói `mobileDirectHandoff` cho Mobile App tự kết nối UDP trực tiếp tới máy chủ Relay của Zalo mà không cần đi qua trung gian.
 * - Hỗ trợ đầy đủ cả **Chiều gọi đi (Outgoing)** lẫn **Chiều gọi đến (Incoming 1-1 & Nhóm)**: giải mã chuẩn `act: "request"` / `"group_request"`, báo đổ chuông (`ringIncomingCall`), bắt máy (`acceptIncomingCall` / `acceptIncomingGroupCall`), và từ chối (`rejectIncomingCall`).
 */
export class ZaloRtcSession extends EventEmitter<ZaloRtcSessionEvents> {
    private state: ZaloRtcSessionState = "idle";
    private udpSocket: dgram.Socket | null = null;
    private pingTimer: ReturnType<typeof setInterval> | null = null;
    private groupPingTimer: ReturnType<typeof setInterval> | null = null;
    private audioKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
    private videoKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
    private rtcpTimer: ReturnType<typeof setInterval> | null = null;
    private ringingTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
    private startedAtMs = 0;
    private activeStartedAtMs = 0;

    private callId = 0;
    private sessId = "";
    private isCaller = true;
    private partnerId = "";
    private groupId = "";
    private hostCall = "";
    private internalGroupId = "";
    private localVoipUid = "";
    private groupPartners: string[] = [];
    private groupPartnerInfo: GroupCallPartnerInfo[] = [];
    private removedGroupPartners = new Set<string>();
    private connectedGroupPartners = new Set<string>();
    private roomPartnerVoipUids = new Set<number>();
    private partnerVideoQualityIds = new Map<number, number[]>();
    private requestedLocalVideoQualityId = 0;
    private noiseIdToVoipUidMap = new Map<string, number>();
    private voipUidToNoiseIdMap = new Map<number, string>();
    private fromUid32 = 0;
    private toUid32 = 0;
    private callType: CallType = CallType.Audio;
    private isCameraOn = false;
    private isMicMuted = false;
    private isHold = false;
    private isScreenSharing = false;

    private rtpEndpoint = { address: "", host: "127.0.0.1", port: 0 };
    private rtcpEndpoint = { address: "", host: "127.0.0.1", port: 0 };
    private routingToken = 0;
    private udpHandshakeVerified = false;
    private hasReceivedPartnerMedia = false;
    private hasSentAnswerAck = false;
    private localUdpPort = 0;
    private zrtpKey?: string;
    private codec = DEFAULT_ZALO_AUDIO_CODEC;
    private extendData: Record<string, unknown> = {};
    private serverInfo?: RequestCallServerInfo;

    private controlSeq = 1;
    private forwardPingSeq = 0;
    private manualControlSeq = 1;
    private audioSeq = Math.floor(Math.random() * 30000);
    private audioTimestamp = Math.floor(Math.random() * 100000);
    private readonly audioSsrc = (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
    private audioPacketCount = 0;
    private audioOctetCount = 0;
    private lastExternalAudioSentAtMs = 0;

    private videoSeq = 0;
    private videoTimestamp = Math.floor(Math.random() * 100000);
    private readonly videoSsrc = (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
    private videoPacketCount = 0;
    private videoOctetCount = 0;
    private lastExternalVideoSentAtMs = 0;

    private remoteAudioSsrc = 0;
    private remoteAudioMaxSeq = 0;
    private remoteAudioSeqCycles = 0;
    private lastRemoteAudioSrMiddleNtp = 0;
    private lastRemoteAudioSrReceivedAtMs = 0;

    private remoteVideoSsrc = 0;
    private remoteVideoMaxSeq = 0;
    private remoteVideoSeqCycles = 0;
    private lastRemoteVideoSrMiddleNtp = 0;
    private lastRemoteVideoSrReceivedAtMs = 0;

    private localSpsNal: Buffer | null = null;
    private localPpsNal: Buffer | null = null;
    private lastLocalKeyframeAnnexB: Buffer | null = null;
    private lastKeyframeResentAtMs = 0;
    private remoteSpsNal: Buffer | null = null;
    private remotePpsNal: Buffer | null = null;
    private fuaFragments: Buffer[] = [];
    private currentAccessUnitNals: Buffer[] = [];
    private currentAccessUnitTs = -1;
    private currentAccessUnitHasIdr = false;
    private videoAssemblers = new Map<number, SsrcVideoAssembler>();

    private srtpSession: ZaloSrtpSession | null = null;
    private audioSrtpSession: ZaloSrtpSession | null = null;
    private readonly options: Required<
        Pick<
            ZaloRtcSessionOptions,
            | "packetMode"
            | "autoKeepaliveMedia"
            | "signalingOnly"
            | "enableSrtp"
            | "srtpSuite"
            | "udpHandshakeTimeoutMs"
            | "pingIntervalMs"
            | "autoAttachListener"
            | "localUdpPort"
            | "ringingTimeoutMs"
        >
    > & { srtpMasterKeyBase64?: string };

    private boundCallEventListener?: (event: CallEvent) => void;

    constructor(
        private readonly api: API,
        options: ZaloRtcSessionOptions = {},
    ) {
        super();
        this.options = {
            packetMode: options.packetMode ?? 1,
            autoKeepaliveMedia: options.autoKeepaliveMedia ?? true,
            signalingOnly: options.signalingOnly ?? false,
            enableSrtp: options.enableSrtp ?? false,
            srtpSuite: options.srtpSuite ?? "AES_CM_128_HMAC_SHA1_80",
            srtpMasterKeyBase64: options.srtpMasterKeyBase64,
            udpHandshakeTimeoutMs: options.udpHandshakeTimeoutMs ?? 1500,
            pingIntervalMs: options.pingIntervalMs ?? 1000,
            autoAttachListener: options.autoAttachListener ?? true,
            localUdpPort: options.localUdpPort ?? 0,
            ringingTimeoutMs: options.ringingTimeoutMs ?? 60000,
        };

        if (this.options.enableSrtp) {
            const keyB64 = this.options.srtpMasterKeyBase64 ?? generateSrtpMasterKeyBase64();
            this.srtpSession = new ZaloSrtpSession(keyB64, this.options.srtpSuite);
            this.audioSrtpSession = this.srtpSession;
        }
    }

    public getState(): ZaloRtcSessionState {
        return this.state;
    }

    public getSrtpSession(): ZaloSrtpSession | null {
        return this.srtpSession;
    }

    public getCallDurationSeconds(): number {
        if (!this.activeStartedAtMs) return 0;
        return Math.max(0, Math.floor((Date.now() - this.activeStartedAtMs) / 1000));
    }

    public getMediaState() {
        return {
            callId: this.callId,
            callType: this.callType,
            isCameraOn: this.isCameraOn,
            isMicMuted: this.isMicMuted,
            isHold: this.isHold,
            isScreenSharing: this.isScreenSharing,
            durationSeconds: this.getCallDurationSeconds(),
            groupId: this.groupId,
            hostCall: this.hostCall,
            groupPartners: this.groupPartners,
            groupPartnerInfo: this.groupPartnerInfo,
        };
    }

    private getLocalAudioSsrc(): number {
        return (this.fromUid32 || this.audioSsrc) >>> 0;
    }

    private getLocalVideoSsrc(): number {
        return (this.fromUid32 || this.videoSsrc) >>> 0;
    }

    private isGroupCallSession(): boolean {
        return Boolean(this.groupId) || this.callType === CallType.GroupAudio || this.callType === CallType.GroupVideo;
    }

    /**
     * Trong `ZCallGroupInfo::_processUpdatePing` (`0x10012b2cc`):
     * - `callState = 1`: Invited (`timeJoinCall == -1`)
     * - `callState = 2`: Ringing (`_receiveRinging`)
     * - `callState = 3`: Answered / In-Call (`_receiveAnswer`)
     * - `callState = 4`: Timeout / Left (`"ping contains timeout user"`)
     */
    private getLocalGroupCallState(): number {
        return this.state === "ringing" ? 2 : 3;
    }

    private getEffectivePacketMode(): 1 | 2 {
        return this.isGroupCallSession() ? 1 : this.options.packetMode;
    }

    private applyGroupSrtpConfig(rawSource?: unknown, resetFirst = false): void {
        if (!this.isGroupCallSession()) return;
        if (resetFirst) {
            this.srtpSession = null;
            this.audioSrtpSession = null;
        }
        const extracted = rawSource ? extractSrtpConfigFromSource(rawSource) : {};
        const keyB64 = extracted.srtpKey ?? this.options.srtpMasterKeyBase64;
        if (keyB64 && keyB64.length >= 40 && extracted.srtpMode !== 0) {
            const zeroSeq = extracted.srtpNoSeq ?? true;
            const audZeroSeq = extracted.audSrtpNoSeq ?? zeroSeq;
            this.srtpSession = new ZaloSrtpSession(keyB64, {
                suite: zeroSeq ? "AES_CM_128_NULL_AUTH" : this.options.srtpSuite,
                zeroSeqMode: zeroSeq,
                tagLength: zeroSeq ? 0 : undefined,
            });
            this.audioSrtpSession =
                audZeroSeq === zeroSeq
                    ? this.srtpSession
                    : new ZaloSrtpSession(keyB64, {
                          suite: audZeroSeq ? "AES_CM_128_NULL_AUTH" : this.options.srtpSuite,
                          zeroSeqMode: audZeroSeq,
                          tagLength: audZeroSeq ? 0 : undefined,
                      });
        } else if (extracted.srtpMode === 0) {
            this.srtpSession = null;
            this.audioSrtpSession = null;
        }
    }

    /**
     * Tạo bộ thông số + các gói tin nhị phân `ZRTPPacket` đã đóng gói sẵn dạng hex
     * để ứng dụng Mobile có thể mở socket UDP kết nối **trực tiếp** tới máy chủ Relay của Zalo (`rtpHost:rtpPort`)
     * mà không cần đẩy luồng dữ liệu âm thanh/hình ảnh qua Worker trung gian.
     */
    public getMobileDirectHandoffBundle(routingTokenOverride?: number): ZaloMobileDirectHandoffBundle {
        const role = this.isCaller ? ZRTCRole.Caller : ZRTCRole.Callee;
        const token = ((routingTokenOverride ?? this.routingToken) || this.callId) >>> 0;
        const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
        const toUid = this.toUid32 || uidToUint32(this.partnerId);
        const isGroup = this.isGroupCallSession();
        const effectivePacketMode = this.getEffectivePacketMode();
        const isVideo =
            this.callType === CallType.Video ||
            this.callType === CallType.GroupVideo ||
            Number(this.extendData?.callType) === 1;

        const initCallPkt = buildInitCallRequest({
            isCaller: this.isCaller,
            seqNum: 0,
            headerCallId: isGroup ? 0 : this.callId,
            callId: this.callId,
            fromUid,
            toUid: isGroup ? 0 : toUid,
            flags: isGroup ? 4 : 1,
            subFlags: isGroup ? 0 : toUid,
            sessId: this.sessId,
            ...(isGroup ? { extraData: Buffer.from([0x00, 0x05, isVideo ? 0x01 : 0x00, 0x01]) } : {}),
        });

        const relayPingPkt = isGroup
            ? buildInitZaviPingRequest({
                  seqNum: 0,
                  headerCallId: 0,
                  callId: this.callId,
                  fromUid,
                  routingToken: token,
                  sessId: this.sessId,
                  isVideo,
              })
            : buildRelayPingRequest({
                  seqNum: 0,
                  callId: 0,
                  fromUid,
                  routingToken: token,
                  sessId: this.sessId,
              });

        const pingPkt = buildPingRequest({
            seqNum: 1,
            callId: this.callId,
            fromUid,
            toUid,
            elapsedMs: 1000,
        });

        const manualCtrlPayload = Buffer.alloc(20);
        manualCtrlPayload.writeInt32LE(isVideo ? 15 : 0, 0);
        manualCtrlPayload.writeInt32LE(0, 4);
        manualCtrlPayload.writeInt32LE(0, 8);
        manualCtrlPayload.writeInt32LE(50, 12);
        manualCtrlPayload.writeInt32LE(isVideo ? 30 : 0, 16);
        const manualCtrlPkt = buildRequestForwardPacket({
            seqNum: 0,
            seqId: 1,
            fromUid,
            routingToken: token,
            subCmd: ZRTPForwardSubCommand.VideoControl,
            payload: manualCtrlPayload,
        });

        const cameraOnPkt = buildRequestForwardPacket({
            seqNum: 0,
            seqId: 1,
            fromUid,
            routingToken: token,
            subCmd: ZRTPForwardSubCommand.OnCamera,
            payload: "",
        });

        const cameraOffPkt = buildRequestForwardPacket({
            seqNum: 0,
            seqId: 1,
            fromUid,
            routingToken: token,
            subCmd: ZRTPForwardSubCommand.OffCamera,
            payload: "",
        });

        const endCallPkt = buildEndCallRequest({
            seqNum: 0,
            callId: this.callId,
            fromUid,
            toUid,
            routingToken: token,
            flags: 0,
        });

        const audioRtpPrefix = (
            effectivePacketMode === 1
                ? wrapLegacyMediaPacket(ZRTPLegacyMediaType.AudioRtp, token, Buffer.alloc(0))
                : wrapZrtcMediaPacket(ZRTCMediaSubCommand.AudioRtp, token, Buffer.alloc(0), role)
        ).toString("hex");
        const audioRtcpPrefix = (
            effectivePacketMode === 1
                ? wrapLegacyMediaPacket(ZRTPLegacyMediaType.AudioRtcp, token, Buffer.alloc(0))
                : wrapZrtcMediaPacket(ZRTCMediaSubCommand.AudioRtcp, token, Buffer.alloc(0), role)
        ).toString("hex");
        const videoRtpPrefix = (
            effectivePacketMode === 1
                ? wrapLegacyMediaPacket(ZRTPLegacyMediaType.VideoRtp, token, Buffer.alloc(0))
                : wrapZrtcMediaPacket(ZRTCMediaSubCommand.VideoRtp, token, Buffer.alloc(0), role)
        ).toString("hex");
        const videoRtcpPrefix = (
            effectivePacketMode === 1
                ? wrapLegacyMediaPacket(ZRTPLegacyMediaType.VideoRtcp, token, Buffer.alloc(0))
                : wrapZrtcMediaPacket(ZRTCMediaSubCommand.VideoRtcp, token, Buffer.alloc(0), role)
        ).toString("hex");

        return {
            callId: this.callId,
            sessId: this.sessId,
            isCaller: this.isCaller,
            partnerId: this.partnerId,
            fromUid32: fromUid,
            toUid32: toUid,
            callType: this.callType,
            rtpHost: this.rtpEndpoint.host,
            rtpPort: this.rtpEndpoint.port,
            rtcpHost: this.rtcpEndpoint.host,
            rtcpPort: this.rtcpEndpoint.port,
            packetMode: effectivePacketMode,
            routingToken: token,
            codec: this.codec,
            srtpMasterKeyBase64: this.srtpSession?.masterKeyBase64,
            zrtpKey: this.zrtpKey,
            initCallPacketHex: initCallPkt.toString("hex"),
            relayPingPacketHex: relayPingPkt.toString("hex"),
            pingPacketHex: pingPkt.toString("hex"),
            manualControlPacketHex: manualCtrlPkt.toString("hex"),
            cameraOnPacketHex: cameraOnPkt.toString("hex"),
            cameraOffPacketHex: cameraOffPkt.toString("hex"),
            endCallPacketHex: endCallPkt.toString("hex"),
            audioRtpPrefixHex: audioRtpPrefix,
            audioRtcpPrefixHex: audioRtcpPrefix,
            videoRtpPrefixHex: videoRtpPrefix,
            videoRtcpPrefixHex: videoRtcpPrefix,
        };
    }

    /**
     * Đặt lại toàn bộ trạng thái định tuyến UDP, bộ đếm RTP/RTCP, bộ đệm giải mã H.264 FU-A/SPS/PPS
     * và khóa SRTP trước khi bắt đầu hoặc chấp nhận một cuộc gọi mới trên cùng một instance `ZaloRtcSession`.
     */
    private resetSessionStateForNewCall(preserveRingingCallId = 0): void {
        const isContinuingSameRingingCall =
            preserveRingingCallId > 0 && this.callId === preserveRingingCallId && this.state === "ringing";

        this.cleanupResources();

        this.routingToken = 0;
        this.udpHandshakeVerified = false;
        this.hasReceivedPartnerMedia = false;
        this.hasSentAnswerAck = false;
        this.localUdpPort = 0;
        this.startedAtMs = 0;
        this.activeStartedAtMs = 0;

        this.controlSeq = 1;
        this.forwardPingSeq = 0;
        this.manualControlSeq = 1;

        this.audioSeq = Math.floor(Math.random() * 30000);
        this.audioTimestamp = Math.floor(Math.random() * 100000);
        this.audioPacketCount = 0;
        this.audioOctetCount = 0;
        this.lastExternalAudioSentAtMs = 0;

        this.videoSeq = 0;
        this.videoTimestamp = Math.floor(Math.random() * 100000);
        this.videoPacketCount = 0;
        this.videoOctetCount = 0;
        // Khởi tạo lastExternalVideoSentAtMs = Date.now() để ngăn khung 16x16 keepalive bắn ở 66ms đầu tiên trước khi Camera thật khởi động
        this.lastExternalVideoSentAtMs = Date.now();

        this.remoteAudioSsrc = 0;
        this.remoteAudioMaxSeq = 0;
        this.remoteAudioSeqCycles = 0;
        this.lastRemoteAudioSrMiddleNtp = 0;
        this.lastRemoteAudioSrReceivedAtMs = 0;

        this.remoteVideoSsrc = 0;
        this.remoteVideoMaxSeq = 0;
        this.remoteVideoSeqCycles = 0;
        this.lastRemoteVideoSrMiddleNtp = 0;
        this.lastRemoteVideoSrReceivedAtMs = 0;

        this.localSpsNal = null;
        this.localPpsNal = null;
        this.lastLocalKeyframeAnnexB = null;
        this.lastKeyframeResentAtMs = 0;
        this.remoteSpsNal = null;
        this.remotePpsNal = null;
        this.clearIncomingVideoAssemblyBuffers();

        if (this.options.enableSrtp) {
            const keyB64 = this.options.srtpMasterKeyBase64 ?? generateSrtpMasterKeyBase64();
            this.srtpSession = new ZaloSrtpSession(keyB64, this.options.srtpSuite);
            this.audioSrtpSession = this.srtpSession;
        } else {
            this.srtpSession = null;
            this.audioSrtpSession = null;
        }

        if (!isContinuingSameRingingCall) {
            this.hostCall = "";
            this.internalGroupId = "";
            this.localVoipUid = "";
            this.groupPartnerInfo = [];
            this.removedGroupPartners.clear();
            this.connectedGroupPartners.clear();
            this.roomPartnerVoipUids.clear();
            this.partnerVideoQualityIds.clear();
            this.requestedLocalVideoQualityId = 0;
            this.noiseIdToVoipUidMap.clear();
            this.voipUidToNoiseIdMap.clear();
            this.state = "idle";
        }
    }

    private clearIncomingVideoAssemblyBuffers(ssrc?: number): void {
        if (ssrc !== undefined) {
            const asm = this.videoAssemblers.get(ssrc >>> 0);
            if (asm) {
                asm.fuaFragments = [];
                asm.currentAccessUnitNals = [];
                asm.currentAccessUnitTs = -1;
                asm.currentAccessUnitHasIdr = false;
                asm.hasEmittedKeyframe = false;
            }
            return;
        }
        this.fuaFragments = [];
        this.currentAccessUnitNals = [];
        this.currentAccessUnitTs = -1;
        this.currentAccessUnitHasIdr = false;
        this.videoAssemblers.clear();
    }

    private getOrCreateVideoAssembler(ssrc: number): SsrcVideoAssembler {
        const normalizedSsrc = ssrc >>> 0;
        let asm = this.videoAssemblers.get(normalizedSsrc);
        if (!asm) {
            asm = {
                ssrc: normalizedSsrc,
                remoteSpsNal: null,
                remotePpsNal: null,
                fuaFragments: [],
                currentAccessUnitNals: [],
                currentAccessUnitTs: -1,
                currentAccessUnitHasIdr: false,
                hasEmittedKeyframe: false,
                lastRtpSeq: -1,
                lastRtpTs: -1,
                maxSeq: 0,
                seqCycles: 0,
                lastSrMiddleNtp: 0,
                lastSrReceivedAtMs: 0,
            };
            this.videoAssemblers.set(normalizedSsrc, asm);
        }
        return asm;
    }

    /**
     * Ánh xạ `32-bit VoIP ID` (hoặc `ssrc`) về `19-digit Zalo UID` (`id`) của thành viên trong nhóm
     * dựa trên bảng `mapNoiseId` và `groupPartnerInfo`.
     */
    public resolvePartnerId(uidOrVoipId?: string | number): string | undefined {
        if (uidOrVoipId === undefined || uidOrVoipId === null) return undefined;
        const rawStr = String(uidOrVoipId).trim();
        if (!rawStr) return undefined;

        for (const info of this.groupPartnerInfo) {
            if (info.id === rawStr) return info.id;
            if (info.userId !== undefined && String(info.userId) === rawStr && info.id) {
                return info.id;
            }
        }
        const numVal = Number(rawStr);
        if (Number.isFinite(numVal) && numVal > 0) {
            const mapped = this.voipUidToNoiseIdMap.get(numVal) ?? this.voipUidToNoiseIdMap.get(numVal >>> 0);
            if (mapped) return mapped;
        }
        return rawStr;
    }

    /**
     * Ánh xạ `19-digit Zalo UID` (`id`) sang `32-bit VoIP ID` (`userId` / `ssrc`) nếu đã biết.
     */
    public resolveVoipUid(uidOrVoipId?: string | number): number | undefined {
        if (uidOrVoipId === undefined || uidOrVoipId === null) return undefined;
        const rawStr = String(uidOrVoipId).trim();
        if (!rawStr) return undefined;

        const mapped = this.noiseIdToVoipUidMap.get(rawStr);
        if (mapped !== undefined) return mapped;

        for (const info of this.groupPartnerInfo) {
            if (info.id === rawStr && info.userId !== undefined) {
                return info.userId;
            }
        }
        const numVal = Number(rawStr);
        if (Number.isFinite(numVal) && numVal > 0 && numVal <= 0xffffffff) {
            return numVal >>> 0;
        }
        return undefined;
    }

    /**
     * Trích xuất và hợp nhất bảng ánh xạ `mapNoiseId` và danh sách `partnerInfo` từ mọi phản hồi
     * của máy chủ Zalo (`requestGroupCall`, `sendRequestGroupCall`, `answerGroupCall`, `pingGroupCall`, `group_broadcast`, ...).
     */
    private mergeGroupPartnerMappings(rawSource: unknown): void {
        if (!rawSource) return;
        const topObj = safeJsonParseRecord(rawSource);
        const dataObj = topObj.data !== undefined ? safeJsonParseRecord(topObj.data) : {};
        const paramsObj =
            topObj.params !== undefined
                ? safeJsonParseRecord(topObj.params)
                : dataObj.params !== undefined
                  ? safeJsonParseRecord(dataObj.params)
                  : {};
        const innerDataObj =
            paramsObj.data !== undefined
                ? safeJsonParseRecord(paramsObj.data)
                : dataObj.data !== undefined
                  ? safeJsonParseRecord(dataObj.data)
                  : {};

        for (const candidate of [
            topObj.mapNoiseId,
            dataObj.mapNoiseId,
            paramsObj.mapNoiseId,
            innerDataObj.mapNoiseId,
            topObj.noise,
            dataObj.noise,
            paramsObj.noise,
            innerDataObj.noise,
        ]) {
            if (!candidate) continue;
            const mapObj = safeJsonParseRecord(candidate);
            for (const [key, val] of Object.entries(mapObj)) {
                const numVal = Number(val);
                const numKey = Number(key);
                if (
                    Number.isFinite(numVal) &&
                    numVal > 0 &&
                    numVal <= 0xffffffff &&
                    typeof key === "string" &&
                    (key.length > 10 || Number.isNaN(numKey) || numKey > 0xffffffff)
                ) {
                    const voipId = numVal >>> 0;
                    this.noiseIdToVoipUidMap.set(key, voipId);
                    this.voipUidToNoiseIdMap.set(voipId, key);
                } else if (Number.isFinite(numKey) && numKey > 0 && numKey <= 0xffffffff && typeof val === "string") {
                    const voipId = numKey >>> 0;
                    this.noiseIdToVoipUidMap.set(val, voipId);
                    this.voipUidToNoiseIdMap.set(voipId, val);
                } else if (Number.isFinite(numVal) && numVal > 0 && typeof key === "string") {
                    const voipId = numVal >>> 0;
                    this.noiseIdToVoipUidMap.set(key, voipId);
                    this.voipUidToNoiseIdMap.set(voipId, key);
                }
            }
        }

        // Đồng bộ userId (32-bit VoIP ID) vào các phần tử đã có trong groupPartnerInfo từ mapNoiseId
        for (const item of this.groupPartnerInfo) {
            if (item.id && item.userId === undefined) {
                const mappedVoip = this.noiseIdToVoipUidMap.get(item.id);
                if (mappedVoip !== undefined) {
                    item.userId = mappedVoip;
                }
            } else if (item.userId !== undefined) {
                const mappedNoise = this.voipUidToNoiseIdMap.get(item.userId);
                if (mappedNoise && (!item.id || item.id === String(item.userId))) {
                    item.id = mappedNoise;
                }
            }
        }

        const localZaloUid = String(this.api.getContext().uid ?? "");
        if (localZaloUid) {
            const myMappedVoip = this.noiseIdToVoipUidMap.get(localZaloUid);
            if (myMappedVoip !== undefined && myMappedVoip > 0) {
                if (!this.localVoipUid || this.localVoipUid === localZaloUid) {
                    this.localVoipUid = String(myMappedVoip);
                }
                if (!this.fromUid32 || this.fromUid32 === uidToUint32(localZaloUid)) {
                    this.fromUid32 = myMappedVoip >>> 0;
                }
            }
        }

        const rawPartnerList = safeJsonParseArray(
            paramsObj.partnerInfo ?? dataObj.partnerInfo ?? innerDataObj.partnerInfo ?? topObj.partnerInfo,
        );
        if (rawPartnerList.length === 0) {
            const singleEvtObj =
                paramsObj.userId !== undefined || paramsObj.fromId !== undefined
                    ? paramsObj
                    : innerDataObj.userId !== undefined || innerDataObj.fromId !== undefined
                      ? innerDataObj
                      : dataObj.userId !== undefined || dataObj.fromId !== undefined
                        ? dataObj
                        : topObj.userId !== undefined || topObj.fromId !== undefined
                          ? topObj
                          : null;
            if (
                singleEvtObj &&
                (singleEvtObj.callState !== undefined ||
                    singleEvtObj.callstate !== undefined ||
                    singleEvtObj.videoState !== undefined ||
                    singleEvtObj.videostate !== undefined ||
                    singleEvtObj.audioState !== undefined ||
                    singleEvtObj.audiostate !== undefined)
            ) {
                rawPartnerList.push(singleEvtObj);
            }
        }
        for (const entry of rawPartnerList) {
            const rawVoipId =
                entry.userId !== undefined
                    ? Number(entry.userId)
                    : typeof entry.id === "number"
                      ? entry.id
                      : Number(entry.id);
            const validVoipId =
                Number.isFinite(rawVoipId) && rawVoipId > 0 && rawVoipId <= 0xffffffff ? rawVoipId >>> 0 : undefined;
            const rawNoiseStr =
                typeof entry.uid === "string"
                    ? entry.uid
                    : typeof entry.noiseId === "string"
                      ? entry.noiseId
                      : typeof entry.id === "string" && entry.id.length > 10
                        ? entry.id
                        : undefined;
            const resolvedNoiseId =
                rawNoiseStr ??
                (validVoipId !== undefined ? this.voipUidToNoiseIdMap.get(validVoipId) : undefined) ??
                String(entry.id ?? entry.userId ?? "").trim();
            if (!resolvedNoiseId) continue;

            if (validVoipId !== undefined && resolvedNoiseId !== String(validVoipId)) {
                this.noiseIdToVoipUidMap.set(resolvedNoiseId, validVoipId);
                this.voipUidToNoiseIdMap.set(validVoipId, resolvedNoiseId);
            }

            if (resolvedNoiseId === localZaloUid && validVoipId !== undefined) {
                if (!this.localVoipUid || this.localVoipUid === localZaloUid) {
                    this.localVoipUid = String(validVoipId);
                }
                this.fromUid32 = validVoipId;
                continue;
            }
            if (this.localVoipUid && validVoipId !== undefined && String(validVoipId) === this.localVoipUid) {
                continue;
            }

            const existingIdx = this.groupPartnerInfo.findIndex(
                (item) =>
                    item.id === resolvedNoiseId ||
                    (validVoipId !== undefined && (item.userId === validVoipId || item.id === String(validVoipId))),
            );
            const name = String(entry.name ?? entry.dName ?? entry.Dname ?? entry.displayName ?? "");
            const avatar = String(entry.avatar ?? entry.zpw_avatar ?? "");
            const rawState = entry.state ?? entry.callstate ?? entry.callState;
            const normalizedState =
                rawState !== undefined && Number.isFinite(Number(rawState)) ? Number(rawState) : undefined;
            if (existingIdx >= 0) {
                const prev = this.groupPartnerInfo[existingIdx];
                this.groupPartnerInfo[existingIdx] = {
                    ...prev,
                    ...entry,
                    id: resolvedNoiseId !== String(validVoipId) ? resolvedNoiseId : prev.id || resolvedNoiseId,
                    ...(validVoipId !== undefined ? { userId: validVoipId } : {}),
                    ...(normalizedState !== undefined ? { state: normalizedState } : {}),
                    name: name || prev.name,
                    avatar: avatar || prev.avatar,
                };
            } else {
                this.groupPartnerInfo.push({
                    ...entry,
                    id: resolvedNoiseId,
                    ...(validVoipId !== undefined ? { userId: validVoipId } : {}),
                    ...(normalizedState !== undefined ? { state: normalizedState } : {}),
                    name,
                    avatar,
                });
            }
            if (!this.groupPartners.includes(resolvedNoiseId)) {
                this.groupPartners.push(resolvedNoiseId);
            }
        }
        if (this.groupId && this.groupPartnerInfo.length > 0) {
            this.emit("group_partner_sync", this.getGroupPartnerInfo());
        }
    }

    /**
     * Tái kích hoạt (Re-activate / Re-bind) kết nối UDP và luồng Media/RTCP cho phiên gọi hiện tại:
     * - Dùng khi chuyển vùng mạng (Wi-Fi <-> 4G/5G), khi socket UDP bị gián đoạn, hoặc khi muốn thu hồi lại
     *   quyền xử lý UDP từ Mobile về lại Worker/Desktop sau khi đã gọi `signalingOnly` / `handoffUdpToExternal()`.
     * - Tự động mở cổng UDP mới, gửi lại gói bắt tay `0x01 0x7e` (`cmd=11` Caller hoặc `cmd=12` Callee),
     *   khởi động lại vòng lặp UDP Ping + Media Keepalive + RTCP SR/RR, đồng bộ lại trạng thái Mic/Camera
     *   và bắn `RTCP PLI` để khôi phục hình ảnh H.264 ngay lập tức.
     */
    public async reconnectUdp(options: { skipUdpHandshake?: boolean } = {}): Promise<ZaloCallConnectionParams> {
        if (!this.callId || this.rtpEndpoint.port <= 0) {
            throw new ZaloApiError("Cannot reconnect UDP: no active call endpoint");
        }

        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        this.stopMediaKeepaliveLoop();
        if (this.udpSocket) {
            try {
                this.udpSocket.removeAllListeners();
                this.udpSocket.close();
            } catch {
                // Ignore
            }
            this.udpSocket = null;
        }
        this.localUdpPort = 0;
        this.clearIncomingVideoAssemblyBuffers();

        await this.ensureUdpSocket();
        if (!options.skipUdpHandshake && this.rtpEndpoint.port > 0) {
            await this.performUdpInitHandshake(this.isCaller);
        } else if (!this.routingToken) {
            this.routingToken = this.callId >>> 0;
        }

        this.startUdpPingLoop();
        this.startMediaKeepaliveLoop();

        void this.sendMicState(!this.isMicMuted).catch(() => {});
        if (
            this.callType === CallType.Video ||
            this.callType === CallType.GroupVideo ||
            Number(this.extendData?.callType) === 1
        ) {
            void this.sendCameraState(this.isCameraOn).catch(() => {});
            void this.sendRtcpPli().catch(() => {});
        }

        const params = this.getConnectionParams();
        this.emit("connection_params", params);
        return params;
    }

    /**
     * Ngắt toàn bộ socket UDP và các vòng lặp Ping/Media cục bộ trên Worker
     * (nhưng vẫn giữ nguyên kết nối Signaling WebSocket để lắng nghe `answer`, `end`, `cancel`, `audio_to_video`),
     * nhằm bàn giao hoàn toàn kênh UDP cho ứng dụng Mobile kết nối trực tiếp tới máy chủ Relay Zalo
     * mà không bị xung đột NAT (NAT flip-flopping).
     */
    public handoffUdpToExternal(routingTokenOverride?: number): ZaloMobileDirectHandoffBundle {
        if (routingTokenOverride !== undefined && routingTokenOverride > 0) {
            this.routingToken = routingTokenOverride >>> 0;
        }
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        this.stopMediaKeepaliveLoop();
        if (this.udpSocket) {
            try {
                this.udpSocket.removeAllListeners();
                this.udpSocket.close();
            } catch {
                // Ignore
            }
            this.udpSocket = null;
        }
        this.localUdpPort = 0;
        return this.getMobileDirectHandoffBundle(routingTokenOverride);
    }

    /**
     * Xuất toàn bộ thông số kết nối cuộc gọi & UDP `ZRTPPacket` sau khi thương lượng xong
     * để truyền về Mobile App hoặc Media Bridge.
     */
    public getConnectionParams(): ZaloCallConnectionParams {
        const handoff = this.getMobileDirectHandoffBundle();

        return {
            callId: this.callId,
            sessId: this.sessId,
            isCaller: this.isCaller,
            partnerId: this.partnerId,
            fromId: this.fromUid32,
            toId: this.toUid32,
            callType: this.callType,
            rtpAddress: this.rtpEndpoint.address,
            rtpHost: this.rtpEndpoint.host,
            rtpPort: this.rtpEndpoint.port,
            rtcpAddress: this.rtcpEndpoint.address,
            rtcpHost: this.rtcpEndpoint.host,
            rtcpPort: this.rtcpEndpoint.port,
            routingToken: handoff.routingToken,
            udpHandshakeVerified: this.udpHandshakeVerified,
            localUdpPort: this.localUdpPort,
            packetMode: handoff.packetMode,
            codec: this.codec,
            extendData: this.extendData,
            zrtpKey: this.zrtpKey,
            srtpMasterKeyBase64: this.srtpSession?.masterKeyBase64,
            audioZrtcHeaderHex: handoff.audioRtpPrefixHex,
            videoZrtcHeaderHex: handoff.videoRtpPrefixHex,
            ...(this.groupId
                ? {
                      groupId: this.groupId,
                      hostCall: this.hostCall,
                      groupPartners: [...this.groupPartners],
                      groupPartnerInfo: this.getGroupPartnerInfo(),
                  }
                : {}),
            serverInfo: this.serverInfo,
            mobileDirectHandoff: handoff,
        };
    }

    /**
     * Khởi tạo cuộc gọi đi (Caller) 1-1 hoàn chỉnh:
     * 1. Gọi `/api/voicecall/requestcall` (401) lấy `sessId`, `rtpaddr`, `rtcpaddr`, `zrtpKey`
     * 2. Mở socket UDP và gửi gói bắt tay `0x01 0x7e` (`cmd=11`) tới `rtpaddr` để nhận `routingToken` (bỏ qua nếu `signalingOnly: true`)
     * 3. Gọi `/api/voicecall/request` (416) kèm codec Opus chuẩn và `extendData` để máy đối phương đổ chuông
     * 4. Duy trì nhịp tim UDP Ping (`0x01 0x7e`, `cmd=2/5/32`) và sẵn sàng truyền/nhận RTP/SRTP (nếu không bật `signalingOnly`)
     */
    public async startOutgoingCall(
        calleeId: string,
        options: StartOutgoingCallOptions = {},
    ): Promise<ZaloCallConnectionParams> {
        if (!calleeId) throw new ZaloApiError("Missing calleeId");

        this.resetSessionStateForNewCall();
        const isSignalingOnly = Boolean(options.signalingOnly ?? this.options.signalingOnly);

        this.isCaller = true;
        this.partnerId = String(calleeId);
        this.groupId = "";
        this.groupPartners = [];
        this.callType = options.callType ?? CallType.Audio;
        this.isCameraOn =
            (this.callType === CallType.Video || this.callType === CallType.GroupVideo) && !options.offCameraAtStart;
        this.isMicMuted = false;
        this.isHold = false;
        this.isScreenSharing = false;
        this.activeStartedAtMs = 0;
        this.callId = options.callId ?? Math.floor(Math.random() * 2_000_000_000);
        this.codec = options.codec ?? DEFAULT_ZALO_AUDIO_CODEC;
        this.udpHandshakeVerified = false;
        this.hasReceivedPartnerMedia = false;
        this.hasSentAnswerAck = false;
        this.setState("allocating");

        if (this.options.autoAttachListener) {
            this.attachCallEventListener();
        }

        // Bước 1: Xin cấp phát phiên & địa chỉ máy chủ Relay UDP (Signal 401)
        const serverInfo = await this.api.call.requestVoiceCall(this.partnerId, {
            callType: this.callType,
            callId: this.callId,
            codec: this.codec,
        });

        this.applyServerInfo(serverInfo);
        const serverSrtp = extractSrtpConfigFromSource(serverInfo);
        if (serverSrtp.srtpKey && serverSrtp.srtpKey.length >= 40 && serverSrtp.srtpMode !== 0) {
            this.srtpSession = new ZaloSrtpSession(serverSrtp.srtpKey, this.options.srtpSuite);
            this.audioSrtpSession = this.srtpSession;
        }

        // Bước 2: Mở UDP Socket & thực hiện bắt tay ZRTP InitCall (0x01 0x7e cmd=11)
        // (Nếu chạy chế độ signalingOnly cho Mobile tự kết nối UDP trực tiếp thì bỏ qua bước mở socket tại Worker)
        if (!isSignalingOnly) {
            await this.ensureUdpSocket();
            if (!options.skipUdpHandshake && this.rtpEndpoint.port > 0) {
                this.setState("handshaking_udp");
                await this.performUdpInitHandshake(true);
            } else {
                this.routingToken = this.callId >>> 0;
            }
        } else {
            this.routingToken = this.callId >>> 0;
        }

        // Bước 3: Gửi tín hiệu đổ chuông 416 kèm codec Opus & ZRTC extendData chuẩn
        const isVideo = this.callType === CallType.Video || this.callType === CallType.GroupVideo;
        const negotiateVideoPipeline =
            isVideo || Boolean(options.allowVideoUpgrade) || Boolean(options.offCameraAtStart);
        this.extendData = {
            ...buildZrtcExtendData({
                rtpAddress: this.rtpEndpoint.address,
                rtcpAddress: this.rtcpEndpoint.address,
                isVideo: negotiateVideoPipeline,
                packetMode: this.getEffectivePacketMode(),
                srtpMode: this.srtpSession ? 1 : 0,
                srtpKey: this.srtpSession?.masterKeyBase64,
            }),
            rtcpDiff: 0,
            rtcp: [{ ip: this.rtcpEndpoint.host, port: this.rtcpEndpoint.port }],
            rtp: [{ ip: this.rtpEndpoint.host, port: this.rtpEndpoint.port }],
            status: 0,
        };

        await this.api.call.sendRequestVoiceCall(this.partnerId, {
            callId: this.callId,
            session: this.sessId,
            rtpAddress: this.rtpEndpoint.address,
            rtcpAddress: this.rtcpEndpoint.address,
            codec: this.codec,
            extendData: this.extendData,
            subCommand: 3,
        });

        // Nếu khởi tạo cuộc gọi với Camera tắt ban đầu (gọi Thoại có allowVideoUpgrade hoặc Video tắt Cam),
        // đồng bộ ngay trạng thái OffCamera (cmd=32 subCmd=8 + /api/voicecall/conf isOnCam=0)
        // khớp với ZCallMainWindowVideo_v2::updateIncallState (0x1000410c0).
        if (negotiateVideoPipeline && !this.isCameraOn) {
            if (!isSignalingOnly) {
                void this.sendCameraState(false).catch(() => {});
            }
            void this.api.call
                .updateCallMediaState(this.partnerId, this.callId, {
                    isOnCam: 0,
                    isOnMic: -1,
                    data: "",
                })
                .catch(() => {});
        }

        // Bước 4: Bắt đầu gửi UDP Ping & Media Keepalive định kỳ giữ phiên Relay (nếu không bật signalingOnly)
        if (!isSignalingOnly) {
            this.startUdpPingLoop();
            this.startMediaKeepaliveLoop();
        }
        this.setState("ringing");

        const params = this.getConnectionParams();
        this.emit("connection_params", params);
        return params;
    }

    /**
     * Giải mã sự kiện cuộc gọi đến (`act: "request"` hoặc `"group_request"`) và gửi ngay tín hiệu
     * báo máy đang đổ chuông (`ringRingVoiceCall` `11302` / `ringRingGroupCall` `12439`) tới phía người gọi,
     * đồng thời chuyển phiên sang trạng thái `"ringing"` trong khi chờ người dùng bấm Nghe máy hoặc Từ chối.
     * Khớp với `zrtc_call::ZCallInfo::receiveIncomingCall` (`0x1000ccbbc`).
     */
    public async ringIncomingCall(callEvent: CallEvent | Record<string, unknown>): Promise<ParsedIncomingCallInfo> {
        const info = parseIncomingCallEvent(callEvent, this.api.getContext().uid);
        if (!info.callerId || !info.callId) {
            throw new ZaloApiError("Invalid incoming call event: missing callerId or callId");
        }

        this.resetSessionStateForNewCall();
        this.isCaller = false;
        this.callId = info.callId;
        this.partnerId = info.isGroupCall ? info.hostCall || info.callerId : info.callerId;
        this.groupId = info.groupId;
        this.hostCall = info.isGroupCall ? info.hostCall || info.callerId || info.groupId : "";
        this.internalGroupId = info.isGroupCall ? info.internalGroupId || info.groupId || this.hostCall : "";
        this.localVoipUid = info.isGroupCall ? String(info.receiverId || info.fromUid32 || this.hostCall) : "";
        this.groupPartners = info.partners;
        this.groupPartnerInfo = info.partnerInfo;
        this.fromUid32 = info.fromUid32;
        this.toUid32 = info.toUid32;
        this.sessId = info.sessId;
        this.callType = info.callType;
        this.isCameraOn = info.isVideo;
        this.rtpEndpoint = {
            address: info.rtpAddress,
            host: info.rtpHost,
            port: info.rtpPort,
        };
        this.rtcpEndpoint = {
            address: info.rtcpAddress,
            host: info.rtcpHost,
            port: info.rtcpPort,
        };
        this.codec = info.codec;
        this.zrtpKey = info.zrtpKey;

        if (this.options.autoAttachListener) {
            this.attachCallEventListener();
        }

        if (info.isGroupCall) {
            this.mergeGroupPartnerMappings(callEvent);
            this.applyGroupSrtpConfig(callEvent, true);
            const groupCallType = normalizeGroupCallType(this.callType);
            const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
            const ringRes = await this.api.call.ringRingGroupCall(this.callId, {
                hostCall: hostCallTarget,
                groupId: this.internalGroupId || this.groupId || hostCallTarget,
                callType: groupCallType,
                session: this.sessId,
                status: 0,
                partners: this.groupPartners,
                data: {
                    callId: this.callId,
                    callType: groupCallType,
                    groupId: this.internalGroupId || this.groupId || hostCallTarget,
                    session: this.sessId,
                    status: 0,
                    extraData: "",
                },
            });
            this.mergeGroupPartnerMappings(ringRes);
            this.applyGroupSrtpConfig(ringRes);
        } else {
            await this.api.call.ringRingVoiceCall(this.partnerId, this.callId);
        }

        this.setState("ringing");
        this.emit("incoming_call", info);
        return info;
    }

    /**
     * Chấp nhận cuộc gọi đến (Callee) từ sự kiện `call_event` (`act: "request"` hoặc `"group_request"`):
     * - Tự động giải mã chuẩn xác `params.id` (`callId`), `uidN` (`callerId`), `uidFrom` (`toUid32`), `uidTo` (`fromUid32`), `rtpIP`/`rtcpIP`/`servers`
     * - Nếu là cuộc gọi Nhóm (`isGroupCall`), tự động uỷ quyền sang `acceptIncomingGroupCall`
     * - Với cuộc gọi 1-1:
     *   1. Gửi `/api/voicecall/ringring` (407) (nếu chưa gửi)
     *   2. Nếu sự kiện thiếu địa chỉ Relay UDP, tự động gọi dự phòng `requestVoiceCall` (401) như `_trySendAcceptSignal` (`0x1000c2c9c`)
     *   3. Mở socket UDP và gửi gói bắt tay `0x01 0x7e` (`cmd=12`) tới `rtpaddr` (bỏ qua nếu `signalingOnly: true`)
     *   4. Gửi `/api/voicecall/answer` (402) để kết nối âm thanh/hình ảnh 2 chiều
     */
    public async acceptIncomingCall(
        callEvent: CallEvent | Record<string, unknown>,
        options: AcceptIncomingCallOptions = {},
    ): Promise<ZaloCallConnectionParams> {
        const info = parseIncomingCallEvent(callEvent, this.api.getContext().uid);
        if (info.isGroupCall) {
            return this.acceptIncomingGroupCall(callEvent, options);
        }
        if (!info.callerId || !info.callId) {
            throw new ZaloApiError("Invalid incoming call event: missing callerId or callId");
        }

        this.resetSessionStateForNewCall(info.callId);
        const isSignalingOnly = Boolean(options.signalingOnly ?? this.options.signalingOnly);

        this.isCaller = false;
        this.partnerId = info.callerId;
        this.groupId = "";
        this.groupPartners = [];
        this.callId = info.callId;
        this.fromUid32 = info.fromUid32;
        this.toUid32 = info.toUid32;
        this.sessId = info.sessId;
        this.codec = options.codec ?? info.codec ?? DEFAULT_ZALO_AUDIO_CODEC;
        this.zrtpKey = info.zrtpKey;
        this.hasReceivedPartnerMedia = false;
        this.hasSentAnswerAck = false;
        this.isScreenSharing = false;
        this.activeStartedAtMs = 0;

        this.rtpEndpoint = {
            address: info.rtpAddress,
            host: info.rtpHost,
            port: info.rtpPort,
        };
        this.rtcpEndpoint = {
            address: info.rtcpAddress,
            host: info.rtcpHost,
            port: info.rtcpPort,
        };
        this.callType = info.callType;
        this.isCameraOn = this.callType === CallType.Video && !options.offCameraAtStart;
        this.isMicMuted = false;
        this.isHold = false;

        if (typeof info.srtpKey === "string" && info.srtpKey.length >= 40 && info.srtpMode !== 0) {
            this.srtpSession = new ZaloSrtpSession(info.srtpKey, this.options.srtpSuite);
            this.audioSrtpSession = this.srtpSession;
        } else if (this.options.srtpMasterKeyBase64 && this.options.srtpMasterKeyBase64.length >= 40) {
            this.srtpSession = new ZaloSrtpSession(this.options.srtpMasterKeyBase64, this.options.srtpSuite);
            this.audioSrtpSession = this.srtpSession;
        } else {
            this.srtpSession = null;
            this.audioSrtpSession = null;
        }

        if (this.options.autoAttachListener) {
            this.attachCallEventListener();
        }

        // Bước 1: Báo máy đang đổ chuông (Signal 407)
        if (!options.skipRingRing) {
            await this.api.call.ringRingVoiceCall(this.partnerId, this.callId);
        }

        // Dự phòng theo _trySendAcceptSignal (0x1000c2c9c): nếu sự kiện thiếu rtpPort, xin cấp phát qua Signal 401
        if (this.rtpEndpoint.port <= 0) {
            try {
                const fallbackServer = await this.api.call.requestVoiceCall(this.partnerId, {
                    callId: this.callId,
                    callType: this.callType,
                    codec: this.codec,
                });
                this.applyServerInfo(fallbackServer);
            } catch {
                // Ignore if mock/offline environment does not require fallback
            }
        }

        // Bước 2: Mở UDP Socket & bắt tay Callee (0x01 0x7e cmd=12)
        if (!isSignalingOnly) {
            await this.ensureUdpSocket();
            if (!options.skipUdpHandshake && this.rtpEndpoint.port > 0) {
                this.setState("handshaking_udp");
                await this.performUdpInitHandshake(false);
            } else {
                this.routingToken = this.callId >>> 0;
            }
        } else {
            this.routingToken = this.callId >>> 0;
        }

        // Bước 3: Gửi tín hiệu bắt máy (Signal 402)
        const isVideo = this.callType === CallType.Video;
        const negotiateVideoPipeline =
            isVideo || Boolean(options.allowVideoUpgrade) || Boolean(options.offCameraAtStart);
        this.extendData = buildZrtcExtendData({
            rtpAddress: this.rtpEndpoint.address,
            rtcpAddress: this.rtcpEndpoint.address,
            isVideo: negotiateVideoPipeline,
            packetMode: this.getEffectivePacketMode(),
            srtpMode: this.srtpSession ? 1 : 0,
            srtpKey: this.srtpSession?.masterKeyBase64,
        });

        if (!options.skipAnswerSignal) {
            await this.api.call.answerVoiceCall(this.partnerId, this.callId, {
                sessionId: this.sessId,
                rtpAddress: this.rtpEndpoint.address,
                rtcpAddress: this.rtcpEndpoint.address,
                codec: this.codec,
                extendData: this.extendData,
                status: 0,
            });
        }

        if (negotiateVideoPipeline && !this.isCameraOn) {
            if (!isSignalingOnly) {
                void this.sendCameraState(false).catch(() => {});
            }
            void this.api.call
                .updateCallMediaState(this.partnerId, this.callId, {
                    isOnCam: 0,
                    isOnMic: -1,
                    data: "",
                })
                .catch(() => {});
        }

        if (!isSignalingOnly) {
            this.startUdpPingLoop();
            this.startMediaKeepaliveLoop();
        }
        this.setState("active");

        const params = this.getConnectionParams();
        this.emit("connection_params", params);
        this.emit("active", params);
        return params;
    }

    /**
     * Từ chối cuộc gọi đến (1-1 hoặc Nhóm) từ sự kiện `call_event` (`act: "request"` / `"group_request"`):
     * - Với 1-1: gọi `/api/voicecall/cancel` (`11305`) và `/api/voicecall/endcall` (`11306`)
     * - Với Nhóm: gọi `/api/voicecall/group/cancel` (`12437`) và `/api/voicecall/group/endcall` (`12438`)
     */
    public async rejectIncomingCall(
        callEvent: CallEvent | Record<string, unknown>,
        options: RejectIncomingCallOptions = {},
    ): Promise<void> {
        const info = parseIncomingCallEvent(callEvent, this.api.getContext().uid);
        const callerId = info.callerId || info.hostCall;
        const callId = info.callId;
        if (!callerId || !callId) {
            throw new ZaloApiError("Invalid incoming call event: missing callerId or callId");
        }

        this.callId = callId;
        this.partnerId = callerId;

        if (info.isGroupCall) {
            const hostCall = info.hostCall || info.callerId || info.groupId;
            const groupId = info.internalGroupId || info.groupId || hostCall;
            const groupCallType = normalizeGroupCallType(info.callType);
            this.groupId = info.groupId || groupId;
            this.internalGroupId = groupId;
            this.hostCall = hostCall;
            const rejectStatus = options.status ?? 3;
            await this.api.call
                .answerGroupCall(callId, {
                    hostCall,
                    groupId,
                    callType: groupCallType,
                    session: info.sessId,
                    status: rejectStatus,
                    partners: info.partners,
                    data: {
                        callId,
                        callType: groupCallType,
                        groupId,
                        session: info.sessId,
                        status: rejectStatus,
                        extraData: JSON.stringify({ status: rejectStatus }),
                    },
                })
                .catch(() => {});
            await this.api.call
                .cancelGroupCall(callId, {
                    hostCall,
                    groupId,
                    callType: groupCallType,
                    session: info.sessId,
                    status: options.status ?? 0,
                    partners: info.partners,
                })
                .catch(() => {});
            await this.api.call
                .endGroupCall(callId, {
                    hostCall,
                    groupId,
                    callType: groupCallType,
                    session: info.sessId,
                    status: options.status ?? 0,
                    partners: info.partners,
                })
                .catch(() => {});
        } else {
            await this.api.call
                .cancelVoiceCall(callerId, callId, {
                    callType: info.callType,
                })
                .catch(() => {});
            await this.api.call
                .endVoiceCall(callerId, callId, {
                    status: options.status ?? 3,
                })
                .catch(() => {});
        }

        this.setState("ended");
        this.cleanupResources();
        this.emit("ended", "rejected");
    }

    /**
     * Chấp nhận lời mời gọi Nhóm đến từ sự kiện `call_event` (`act: "group_request"`):
     * 1. Gửi `/api/voicecall/group/ringring` (`12439`, signal `506`)
     * 2. Mở socket UDP và bắt tay `InitCallCallee` (`0x01 0x7e`, `cmd=12`) (bỏ qua nếu `signalingOnly: true`)
     * 3. Gửi `/api/voicecall/group/answer` (`12436`, signal `503`)
     */
    public async acceptIncomingGroupCall(
        callEvent: CallEvent | Record<string, unknown>,
        options: AcceptIncomingCallOptions = {},
    ): Promise<ZaloCallConnectionParams> {
        const info = parseIncomingCallEvent(callEvent, this.api.getContext().uid);
        const hostCall = info.hostCall || info.groupId || info.callerId;
        const callId = info.callId;
        if (!hostCall || !callId) {
            throw new ZaloApiError("Invalid incoming group call event: missing hostCall or callId");
        }

        this.resetSessionStateForNewCall(callId);
        const isSignalingOnly = Boolean(options.signalingOnly ?? this.options.signalingOnly);

        this.isCaller = false;
        this.callId = callId;
        this.groupId = info.groupId || hostCall;
        this.hostCall = hostCall;
        this.internalGroupId = info.internalGroupId || info.groupId || hostCall;
        this.localVoipUid = String(info.receiverId || info.fromUid32 || hostCall);
        this.partnerId = hostCall;
        this.groupPartners = info.partners;
        this.groupPartnerInfo = info.partnerInfo;
        this.fromUid32 = info.fromUid32;
        const groupId32 = Number(this.internalGroupId);
        this.toUid32 =
            Number.isFinite(groupId32) && groupId32 > 0 && groupId32 <= 0xffffffff
                ? groupId32 >>> 0
                : info.toUid32 || uidToUint32(this.groupId);
        this.sessId = info.sessId;
        this.codec = options.codec ?? info.codec ?? DEFAULT_ZALO_AUDIO_CODEC;
        this.zrtpKey = info.zrtpKey;
        this.hasReceivedPartnerMedia = false;
        this.hasSentAnswerAck = false;
        this.isScreenSharing = false;
        this.activeStartedAtMs = 0;

        this.mergeGroupPartnerMappings(callEvent);

        this.rtpEndpoint = {
            address: info.rtpAddress,
            host: info.rtpHost,
            port: info.rtpPort,
        };
        this.rtcpEndpoint = {
            address: info.rtcpAddress,
            host: info.rtcpHost,
            port: info.rtcpPort,
        };
        this.callType =
            info.callType === CallType.GroupVideo || info.isVideo ? CallType.GroupVideo : CallType.GroupAudio;
        this.isCameraOn = this.callType === CallType.GroupVideo && !options.offCameraAtStart;
        this.isMicMuted = false;
        this.isHold = false;

        this.applyGroupSrtpConfig(callEvent, true);

        if (this.options.autoAttachListener) {
            this.attachCallEventListener();
        }

        const isVideo = this.callType === CallType.GroupVideo;
        const groupCallType = normalizeGroupCallType(this.callType);
        const hostCallTarget = this.hostCall || this.partnerId || this.groupId;

        if (!options.skipRingRing) {
            const ringRes = await this.api.call.ringRingGroupCall(this.callId, {
                hostCall: hostCallTarget,
                groupId: this.internalGroupId || this.groupId || hostCallTarget,
                callType: groupCallType,
                session: this.sessId,
                status: 0,
                partners: this.groupPartners,
                data: {
                    callId: this.callId,
                    callType: groupCallType,
                    groupId: this.internalGroupId || this.groupId || hostCallTarget,
                    session: this.sessId,
                    status: 0,
                    extraData: "",
                },
            });
            this.mergeGroupPartnerMappings(ringRes);
            this.applyGroupSrtpConfig(ringRes);
        }

        if (!isSignalingOnly) {
            await this.ensureUdpSocket();
            if (!options.skipUdpHandshake && this.rtpEndpoint.port > 0) {
                this.setState("handshaking_udp");
                await this.performUdpInitHandshake(false);
            } else {
                this.routingToken = this.callId >>> 0;
            }
        } else {
            this.routingToken = this.callId >>> 0;
        }

        const zrtcExtendPayload = buildZrtcExtendData({
            rtpAddress: this.rtpEndpoint.address,
            rtcpAddress: this.rtcpEndpoint.address,
            isVideo: isVideo || (options.allowVideoUpgrade ?? true),
            packetMode: 1,
            srtpMode: this.srtpSession ? 1 : 0,
            srtpKey: this.srtpSession?.masterKeyBase64,
        });
        const resolvedGroupIdVal = this.internalGroupId || this.groupId || hostCallTarget;
        this.extendData = {
            ...zrtcExtendPayload,
            callId: this.callId,
            callType: groupCallType,
            groupId: resolvedGroupIdVal,
            session: this.sessId,
            status: 0,
            codec: this.codec,
            extendData: JSON.stringify(zrtcExtendPayload),
            extraData: JSON.stringify({
                callType: groupCallType,
                status: 0,
                maxUsers: 8,
                platform: 1,
                audiostate: this.isMicMuted ? 1 : 0,
                videostate: this.isCameraOn ? 0 : 1,
                groupId: Number(resolvedGroupIdVal) || resolvedGroupIdVal,
            }),
        };

        if (!options.skipAnswerSignal) {
            const answerRes = await this.api.call.answerGroupCall(this.callId, {
                hostCall: hostCallTarget,
                groupId: this.internalGroupId || this.groupId || hostCallTarget,
                callType: groupCallType,
                session: this.sessId,
                status: 0,
                partners: this.groupPartners,
                data: this.extendData,
            });
            const ansRecord =
                typeof answerRes === "object" && answerRes !== null ? (answerRes as Record<string, unknown>) : {};
            if (ansRecord.status !== undefined && Number(ansRecord.status) !== 0) {
                this.setState("ended");
                this.cleanupResources();
                this.emit("ended", "answer_failed");
                throw new ZaloApiError(
                    String(ansRecord.msg || "Không thể tham gia cuộc gọi nhóm (cuộc gọi đã kết thúc)"),
                    Number(ansRecord.status),
                );
            }
            const prevFromUid32 = this.fromUid32;
            const prevToUid32 = this.toUid32;
            const prevSessId = this.sessId;
            const prevRtpAddr = this.rtpEndpoint.address;
            const ansServerInfo = this.extractGroupResponseServerInfo(answerRes);
            this.applyGroupSrtpConfig(answerRes);
            if (ansServerInfo.sessId) {
                this.sessId = ansServerInfo.sessId;
            }
            if (ansServerInfo.rtpServer || ansServerInfo.rtpIP || ansServerInfo.servers?.length) {
                this.applyServerInfo(ansServerInfo);
            }
            if (ansServerInfo.fromId !== undefined && Number(ansServerInfo.fromId) > 0) {
                this.localVoipUid = String(ansServerInfo.fromId);
                this.fromUid32 = Number(ansServerInfo.fromId) >>> 0;
            }
            if (
                ansServerInfo.groupId !== undefined &&
                ansServerInfo.groupId !== null &&
                String(ansServerInfo.groupId).length > 0
            ) {
                this.internalGroupId = String(ansServerInfo.groupId);
                const nextGroupId32 = Number(this.internalGroupId);
                if (Number.isFinite(nextGroupId32) && nextGroupId32 > 0 && nextGroupId32 <= 0xffffffff) {
                    this.toUid32 = nextGroupId32 >>> 0;
                }
            }
            const shouldRebindUdp =
                this.fromUid32 !== prevFromUid32 ||
                this.toUid32 !== prevToUid32 ||
                this.sessId !== prevSessId ||
                this.rtpEndpoint.address !== prevRtpAddr;
            if (
                shouldRebindUdp &&
                !isSignalingOnly &&
                !options.skipUdpHandshake &&
                this.udpSocket &&
                this.rtpEndpoint.port > 0
            ) {
                await this.performUdpInitHandshake(false);
            }
        }

        if (!isSignalingOnly) {
            this.startUdpPingLoop();
            void this.sendMicState(!this.isMicMuted).catch(() => {});
            void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
            void this.sendGroupVideoQualityRequest().catch(() => {});
            if (isVideo) {
                void this.sendCameraState(this.isCameraOn).catch(() => {});
            }
            this.startMediaKeepaliveLoop();
        }
        this.startGroupPingLoop();
        this.setState("active");

        const params = this.getConnectionParams();
        this.emit("connection_params", params);
        this.emit("active", params);
        return params;
    }

    /**
     * Khởi tạo cuộc gọi nhóm (Group Audio `CallType.GroupAudio = 5` hoặc Group Video `CallType.GroupVideo = 6`):
     * 1. Gọi `/api/voicecall/group/requestcall` (501) xin cấp phát máy chủ Relay UDP (gửi `typeRequest: 0 | 1` và `noiseId: JSON.stringify(partners)`)
     * 2. Đọc `reqRes.params` (hoặc `reqRes.data`) để lấy `callId` thật do Zalo cấp phát và `callSetting.session`
     * 3. Mở socket UDP và bắt tay `0x01 0x7e` (`cmd=11`) (bỏ qua nếu `signalingOnly: true`)
     * 4. Gọi `/api/voicecall/group/request` (513) với cấu trúc JSON 2 lớp chứa `hostCall`, `noiseId`, `rtpAddress`
     * 5. Duy trì nhịp tim UDP + `/api/voicecall/group/ping` (509) và luồng RTP/RTCP
     */
    public async startGroupCall(
        groupId: string,
        optionsOrPartners: StartGroupCallOptions | string[],
        maybeOptions?: Omit<StartGroupCallOptions, "partners"> & { partners?: string[] },
    ): Promise<ZaloCallConnectionParams> {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        const options: StartGroupCallOptions = Array.isArray(optionsOrPartners)
            ? { ...(maybeOptions ?? {}), partners: optionsOrPartners }
            : optionsOrPartners;
        if (!options?.partners || options.partners.length === 0) {
            throw new ZaloApiError("Missing group call partners");
        }

        this.resetSessionStateForNewCall();
        const isSignalingOnly = Boolean(options.signalingOnly ?? this.options.signalingOnly);

        this.isCaller = true;
        this.groupId = String(groupId);
        this.partnerId = String(groupId);
        this.groupPartners = options.partners.map(String);
        this.groupPartnerInfo = options.partnerInfo ?? this.groupPartners.map((id) => ({ id, name: "", avatar: "" }));
        const isVideo =
            options.callType === CallType.GroupVideo ||
            options.callType === CallType.Video ||
            (options.callType as number | undefined) === 1;
        this.callType = isVideo ? CallType.GroupVideo : CallType.GroupAudio;
        this.isCameraOn = isVideo && !options.offCameraAtStart;
        this.isMicMuted = false;
        this.isHold = false;
        this.isScreenSharing = false;
        this.activeStartedAtMs = 0;
        this.callId = options.callId ?? Math.floor(Math.random() * 2_000_000_000);
        this.codec = options.codec ?? DEFAULT_ZALO_AUDIO_CODEC;
        this.udpHandshakeVerified = false;
        this.hasReceivedPartnerMedia = false;
        this.hasSentAnswerAck = false;
        this.setState("allocating");

        if (this.options.autoAttachListener) {
            this.attachCallEventListener();
        }

        const groupCallType: 0 | 1 = isVideo ? 1 : 0;
        const maxUsers = options.maxUsers ?? 8;
        const groupName = options.groupName ?? "";
        const groupAvatar = options.groupAvatar ?? "";

        const reqRes = await this.api.call.requestGroupCall(this.groupId, {
            callId: this.callId,
            typeRequest: groupCallType,
            partners: this.groupPartners,
            groupName,
            groupAvatar,
            maxUsers,
            data: {
                groupId: this.groupId,
                groupName,
                groupAvatar,
                maxUsers,
                noiseId: JSON.stringify(this.groupPartners),
                extraData: "",
                codec: this.codec,
                isVideo: groupCallType,
            },
        });

        const serverInfo = this.extractGroupResponseServerInfo(reqRes);
        this.applyGroupSrtpConfig(reqRes, true);
        const serverStatus = serverInfo.status !== undefined ? Number(serverInfo.status) : 0;
        if (
            serverStatus !== 0 &&
            !serverInfo.callSetting &&
            !serverInfo.rtpServer &&
            !serverInfo.rtpIP &&
            !serverInfo.servers?.length
        ) {
            this.setState("ended");
            this.cleanupResources();
            throw new ZaloApiError(String(serverInfo.msg || "Không thể khởi tạo cuộc gọi nhóm"), serverStatus);
        }
        if (serverInfo.callId && Number(serverInfo.callId) > 0) {
            this.callId = Number(serverInfo.callId);
        }

        // Thiết lập hostCall, localVoipUid, internalGroupId, fromUid32 và toUid32 (Group ID 32-bit)
        // TRƯỚC khi gọi applyServerInfo và performUdpInitHandshake để gói bắt tay đầu tiên dùng đúng ID!
        const hostCallVal = String(
            serverInfo.hostCall ??
                serverInfo.fromId ??
                (this.localVoipUid || undefined) ??
                this.api.getContext().uid ??
                this.groupId,
        );
        this.hostCall = hostCallVal;
        this.localVoipUid = String(
            serverInfo.fromId ?? serverInfo.hostCall ?? (this.localVoipUid || undefined) ?? hostCallVal,
        );
        this.internalGroupId = String(serverInfo.groupId ?? this.groupId);
        this.partnerId = hostCallVal;

        this.applyServerInfo(serverInfo);

        const initialHostUid32 = Number(serverInfo.fromId ?? serverInfo.hostCall ?? this.localVoipUid);
        if (Number.isFinite(initialHostUid32) && initialHostUid32 > 0 && initialHostUid32 <= 0xffffffff) {
            this.fromUid32 = initialHostUid32 >>> 0;
        }
        const initialGroupId32 = Number(serverInfo.groupId ?? this.internalGroupId);
        if (Number.isFinite(initialGroupId32) && initialGroupId32 > 0 && initialGroupId32 <= 0xffffffff) {
            this.toUid32 = initialGroupId32 >>> 0;
        } else {
            this.toUid32 = uidToUint32(this.groupId);
        }

        if (!isSignalingOnly) {
            await this.ensureUdpSocket();
            if (!options.skipUdpHandshake && this.rtpEndpoint.port > 0) {
                this.setState("handshaking_udp");
                await this.performUdpInitHandshake(true);
            } else {
                this.routingToken = this.callId >>> 0;
            }
        } else {
            this.routingToken = this.callId >>> 0;
        }

        const noiseIdJson = JSON.stringify(this.groupPartners);
        const innerGroupRequestData = {
            noiseId: noiseIdJson,
            hostCall: hostCallVal,
            groupId: this.groupId,
            groupName,
            groupAvatar,
            maxUsers: Number(serverInfo.maxUsers ?? maxUsers) || maxUsers,
        };
        const zrtcExtendPayload = {
            ...buildZrtcExtendData({
                rtpAddress: this.rtpEndpoint.address,
                rtcpAddress: this.rtcpEndpoint.address,
                isVideo,
                packetMode: 1,
                srtpMode: this.srtpSession ? 1 : 0,
                srtpKey: this.srtpSession?.masterKeyBase64,
            }),
            rtcpDiff: 0,
            rtcp: [{ ip: this.rtcpEndpoint.host, port: this.rtcpEndpoint.port }],
            rtp: [{ ip: this.rtpEndpoint.host, port: this.rtpEndpoint.port }],
            status: 0,
        };
        this.extendData = {
            ...zrtcExtendPayload,
            codec: this.codec,
            extendData: JSON.stringify(zrtcExtendPayload),
            rtpAddress: this.rtpEndpoint.address,
            rtcpAddress: this.rtcpEndpoint.address,
            rtpAddressIPv6: "",
            rtcpAddressIPv6: "",
            hostCall: innerGroupRequestData.hostCall,
            noiseId: noiseIdJson,
            data: JSON.stringify(innerGroupRequestData),
        };

        const prevFromUid32 = this.fromUid32;
        const prevToUid32 = this.toUid32;
        const prevSessId = this.sessId;
        const prevRtpAddr = this.rtpEndpoint.address;

        const createCallRes = await this.api.call.sendRequestGroupCall(this.groupId, {
            callId: this.callId,
            callType: groupCallType,
            session: this.sessId,
            partners: this.groupPartners,
            hostCall: innerGroupRequestData.hostCall,
            rtpAddress: this.rtpEndpoint.address,
            rtcpAddress: this.rtcpEndpoint.address,
            codec: this.codec,
            data: this.extendData,
        });
        const createCallInfo = this.extractGroupResponseServerInfo(createCallRes);
        this.applyGroupSrtpConfig(createCallRes);
        if (createCallInfo.sessId && !createCallInfo.sessId.endsWith("_undefined_501")) {
            this.sessId = createCallInfo.sessId;
        }
        if (createCallInfo.rtpServer || createCallInfo.rtpIP || createCallInfo.servers?.length) {
            this.applyServerInfo(createCallInfo);
        }
        if (
            createCallInfo.hostCall !== undefined &&
            createCallInfo.hostCall !== null &&
            String(createCallInfo.hostCall).length > 0
        ) {
            this.hostCall = String(createCallInfo.hostCall);
            this.localVoipUid = this.hostCall;
            this.partnerId = this.hostCall;
            const hostUid32 = Number(this.hostCall);
            if (Number.isFinite(hostUid32) && hostUid32 > 0 && hostUid32 <= 0xffffffff) {
                this.fromUid32 = hostUid32 >>> 0;
            }
        }
        if (createCallInfo.fromId !== undefined && Number(createCallInfo.fromId) > 0) {
            this.localVoipUid = String(createCallInfo.fromId);
            this.fromUid32 = Number(createCallInfo.fromId) >>> 0;
        }
        if (
            createCallInfo.groupId !== undefined &&
            createCallInfo.groupId !== null &&
            String(createCallInfo.groupId).length > 0
        ) {
            this.internalGroupId = String(createCallInfo.groupId);
            const nextGroupId32 = Number(this.internalGroupId);
            if (Number.isFinite(nextGroupId32) && nextGroupId32 > 0 && nextGroupId32 <= 0xffffffff) {
                this.toUid32 = nextGroupId32 >>> 0;
            }
        }
        const shouldRebindUdp =
            this.fromUid32 !== prevFromUid32 ||
            this.toUid32 !== prevToUid32 ||
            this.sessId !== prevSessId ||
            this.rtpEndpoint.address !== prevRtpAddr;
        if (
            shouldRebindUdp &&
            !isSignalingOnly &&
            !options.skipUdpHandshake &&
            this.udpSocket &&
            this.rtpEndpoint.port > 0
        ) {
            await this.performUdpInitHandshake(true);
        }

        if (!isSignalingOnly) {
            this.startUdpPingLoop();
            void this.sendMicState(!this.isMicMuted).catch(() => {});
            void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
            void this.sendGroupVideoQualityRequest().catch(() => {});
            if (isVideo) {
                void this.sendCameraState(this.isCameraOn).catch(() => {});
            }
            this.startMediaKeepaliveLoop();
        }
        this.startGroupPingLoop();
        this.setState("active");

        const params = this.getConnectionParams();
        this.emit("connection_params", params);
        this.emit("active", params);
        return params;
    }

    /**
     * Tham gia cuộc gọi nhóm đang diễn ra (`/api/voicecall/group/join`, command `12043`).
     */
    public async joinActiveGroupCall(
        callId: number,
        options: JoinGroupCallSessionOptions,
    ): Promise<ZaloCallConnectionParams> {
        if (!callId) throw new ZaloApiError("Missing callId");
        if (!options?.hostCall) throw new ZaloApiError("Missing hostCall");

        this.resetSessionStateForNewCall();
        const isSignalingOnly = Boolean(options.signalingOnly ?? this.options.signalingOnly);

        this.isCaller = false;
        this.callId = callId;
        this.groupId = String(options.groupId ?? options.hostCall);
        this.hostCall = String(options.hostCall);
        this.internalGroupId = this.groupId;
        this.partnerId = String(options.hostCall);
        this.groupPartners = (options.partners ?? []).map(String);
        this.callType = options.callType ?? CallType.GroupAudio;
        this.isCameraOn = this.callType === CallType.GroupVideo || this.callType === CallType.Video;
        this.isMicMuted = false;
        this.isHold = false;
        this.isScreenSharing = false;
        this.activeStartedAtMs = 0;
        this.sessId = options.session ?? `${this.partnerId}_${this.callId}_501`;

        if (this.options.autoAttachListener) {
            this.attachCallEventListener();
        }

        const isVideo = this.callType === CallType.GroupVideo || this.callType === CallType.Video;
        const joinRes = await this.api.call.joinGroupCall(this.callId, {
            hostCall: String(options.hostCall),
            audioState: this.isMicMuted ? 1 : 0,
            videoState: isVideo ? 0 : 1,
            data: { codec: this.codec },
        });

        const serverInfo = this.extractGroupResponseServerInfo(joinRes);
        this.applyGroupSrtpConfig(joinRes);
        if (serverInfo.fromId !== undefined && Number(serverInfo.fromId) > 0) {
            this.localVoipUid = String(serverInfo.fromId);
            this.fromUid32 = Number(serverInfo.fromId) >>> 0;
        }
        if (options.rtpAddress) {
            this.rtpEndpoint = parseEndpoint(options.rtpAddress);
            this.rtcpEndpoint = parseEndpoint(options.rtcpAddress || options.rtpAddress);
            const groupId32 = Number(serverInfo.groupId ?? this.internalGroupId);
            if (Number.isFinite(groupId32) && groupId32 > 0 && groupId32 <= 0xffffffff) {
                this.toUid32 = groupId32 >>> 0;
            } else {
                this.toUid32 = uidToUint32(this.groupId);
            }
        } else {
            this.applyServerInfo(serverInfo);
        }

        if (!isSignalingOnly) {
            await this.ensureUdpSocket();
            if (!options.skipUdpHandshake && this.rtpEndpoint.port > 0) {
                this.setState("handshaking_udp");
                await this.performUdpInitHandshake(false);
            } else {
                this.routingToken = this.callId >>> 0;
            }

            this.startUdpPingLoop();
            void this.sendMicState(!this.isMicMuted).catch(() => {});
            void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
            void this.sendGroupVideoQualityRequest().catch(() => {});
            if (isVideo) {
                void this.sendCameraState(this.isCameraOn).catch(() => {});
            }
            this.startMediaKeepaliveLoop();
        } else {
            this.routingToken = this.callId >>> 0;
        }
        this.startGroupPingLoop();
        this.setState("active");

        const params = this.getConnectionParams();
        this.emit("connection_params", params);
        this.emit("active", params);
        return params;
    }

    /**
     * Mời thêm thành viên vào cuộc gọi nhóm đang diễn ra (`/api/voicecall/group/adduser`, command `12435`).
     */
    public async addMembersToGroupCall(partners: string[]): Promise<Record<string, unknown>> {
        if (!this.callId) throw new ZaloApiError("No active group call");
        const cleanPartners = partners.map(String).filter(Boolean);
        for (const p of cleanPartners) {
            if (!this.groupPartners.includes(p)) {
                this.groupPartners.push(p);
                this.groupPartnerInfo.push({ id: p, name: "", avatar: "" });
            }
        }
        const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
        const addRes = await this.api.call.addUserGroupCall(this.callId, {
            hostCall: hostCallTarget,
            groupId: this.internalGroupId || this.groupId || hostCallTarget,
            session: this.sessId,
            callType: normalizeGroupCallType(this.callType),
            partners: cleanPartners,
            rtpAddress: this.rtpEndpoint.address,
            rtcpAddress: this.rtcpEndpoint.address,
            codec: this.codec,
            data: this.extendData,
        });
        this.mergeGroupPartnerMappings(addRes);
        return addRes;
    }

    /**
     * Lấy danh sách thông tin thành viên (`id`, `name`, `avatar`) của cuộc gọi nhóm hiện tại.
     */
    public getGroupPartnerInfo(): GroupCallPartnerInfo[] {
        return [...this.groupPartnerInfo];
    }

    /**
     * Bật / tắt Camera trong cuộc gọi Video (đồng bộ cả gói UDP `cmd=32, subCmd=7/8` và HTTP `/api/voicecall/conf` hoặc `/api/voicecall/group/broadcast`).
     */
    public async setCameraEnabled(enabled: boolean): Promise<void> {
        const wasAudioCall = this.callType === CallType.Audio || this.callType === CallType.GroupAudio;
        this.isCameraOn = enabled;
        if (enabled && this.callType === CallType.Audio) {
            this.callType = CallType.Video;
        } else if (enabled && this.callType === CallType.GroupAudio) {
            this.callType = CallType.GroupVideo;
        }
        if (enabled) {
            this.startMediaKeepaliveLoop();
        }
        await this.sendCameraState(enabled).catch(() => {});
        if (this.groupId && this.callId > 0) {
            const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
            const localUserIdTarget =
                this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
            await this.api.call
                .broadcastGroupCallState(this.callId, {
                    hostCall: hostCallTarget,
                    userId: localUserIdTarget,
                    callState: this.getLocalGroupCallState(),
                    audioState: this.isMicMuted ? 1 : 0,
                    videoState: enabled ? 0 : 1,
                })
                .catch(() => {});
        } else if (this.partnerId && this.callId > 0) {
            if (enabled && wasAudioCall) {
                await this.api.call.requestAudioToVideoCall(this.partnerId, this.callId, { status: 1 }).catch(() => {});
            }
            await this.api.call
                .updateCallMediaState(this.partnerId, this.callId, {
                    isOnCam: enabled ? 1 : 0,
                    isOnMic: -1,
                    data: "",
                })
                .catch(() => {});
        }
        if (enabled) {
            void this.sendRtcpPli().catch(() => {});
        }
        this.emit("media_state_change", {
            isLocal: true,
            isCameraOn: this.isCameraOn,
            isMicMuted: this.isMicMuted,
            isHold: this.isHold,
            isScreenSharing: this.isScreenSharing,
            callType: this.callType,
        });
    }

    /**
     * Bật / tắt Microphone trong cuộc gọi (đồng bộ cả gói UDP `cmd=32, subCmd=5/6` và HTTP `/api/voicecall/conf` hoặc `/api/voicecall/group/broadcast`).
     */
    public async setMicMuted(muted: boolean): Promise<void> {
        this.isMicMuted = muted;
        await this.sendMicState(!muted).catch(() => {});
        if (this.groupId && this.callId > 0) {
            const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
            const localUserIdTarget =
                this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
            await this.api.call
                .broadcastGroupCallState(this.callId, {
                    hostCall: hostCallTarget,
                    userId: localUserIdTarget,
                    callState: this.getLocalGroupCallState(),
                    audioState: muted ? 1 : 0,
                    videoState: this.isCameraOn ? 0 : 1,
                })
                .catch(() => {});
        } else if (this.partnerId && this.callId > 0) {
            await this.api.call
                .updateCallMediaState(this.partnerId, this.callId, {
                    isOnCam: -1,
                    isOnMic: muted ? 0 : 1,
                    data: "",
                })
                .catch(() => {});
        }
        this.emit("media_state_change", {
            isLocal: true,
            isCameraOn: this.isCameraOn,
            isMicMuted: this.isMicMuted,
            isHold: this.isHold,
            isScreenSharing: this.isScreenSharing,
            callType: this.callType,
        });
    }

    /**
     * Tạm giữ (`hold`) hoặc tiếp tục (`unhold`) cuộc gọi 1-1 (`/api/voicecall/holdreq` & `/api/voicecall/unholdreq`).
     */
    public async setHoldState(isHold: boolean, isResponse = false): Promise<void> {
        this.isHold = isHold;
        if (this.partnerId) {
            if (isHold) {
                await this.api.call.holdVoiceCall(this.partnerId, { isResponse }).catch(() => {});
            } else {
                await this.api.call.unholdVoiceCall(this.partnerId, { isResponse }).catch(() => {});
                this.clearIncomingVideoAssemblyBuffers();
                void this.sendMicState(!this.isMicMuted).catch(() => {});
                void this.sendCameraState(this.isCameraOn).catch(() => {});
                void this.sendRtcpPli().catch(() => {});
            }
        }
        this.emit("media_state_change", {
            isLocal: true,
            isCameraOn: this.isCameraOn,
            isMicMuted: this.isMicMuted,
            isHold: this.isHold,
            isScreenSharing: this.isScreenSharing,
            callType: this.callType,
        });
    }

    /**
     * Bật / tắt chia sẻ màn hình trong cuộc gọi 1-1 (`/api/voicecall/requestsharescreen`, command `12064`)
     * hoặc cuộc gọi Nhóm (`/api/voicecall/group/sharescreen`, command `12044`).
     */
    public async setScreenShareEnabled(enabled: boolean): Promise<void> {
        this.isScreenSharing = enabled;
        if (this.groupId && this.callId > 0) {
            if (this.udpSocket && this.rtpEndpoint.port > 0 && this.state !== "ended") {
                const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
                const token = (this.routingToken || this.callId) >>> 0;
                const payload = Buffer.alloc(4);
                payload.writeInt32LE(0, 0);
                const subCmd = enabled
                    ? ZRTPForwardSubCommand.ShareScreen
                    : this.isCameraOn
                      ? ZRTPForwardSubCommand.OnCamera
                      : ZRTPForwardSubCommand.OffCamera;
                const pkt = buildRequestForwardPacket({
                    seqNum: 0,
                    seqId: 0,
                    fromUid,
                    routingToken: token,
                    subCmd,
                    payload,
                });
                void this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
            }
            const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
            const localUserIdTarget =
                this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
            await this.api.call
                .shareScreenGroupCall(this.callId, {
                    hostCall: hostCallTarget,
                    userId: localUserIdTarget,
                    status: enabled ? 1 : 0,
                    audioState: this.isMicMuted ? 1 : 0,
                    videoState: this.isCameraOn || enabled ? 0 : 1,
                })
                .catch(() => {});
        } else if (this.partnerId && this.callId > 0) {
            await this.api.call
                .requestShareScreenCall(this.partnerId, this.callId, {
                    status: enabled ? 1 : 0,
                })
                .catch(() => {});
        }
        this.emit("media_state_change", {
            isLocal: true,
            isCameraOn: this.isCameraOn,
            isMicMuted: this.isMicMuted,
            isHold: this.isHold,
            isScreenSharing: this.isScreenSharing,
            callType: this.callType,
        });
    }

    /**
     * Chuyển đổi cuộc gọi Thoại (Audio) đang diễn ra lên cuộc gọi Video (`/api/voicecall/requestaudio2video`, command `12056`):
     * - `status = 1`: Gửi yêu cầu bật Video
     * - `status = 2`: Đồng ý yêu cầu bật Video từ đối phương
     * Tự động kích hoạt luồng Video RTP/RTCP, tín hiệu UDP `OnCamera` (`cmd=32, subCmd=7`) & HTTP `/api/voicecall/conf` (`isOnCam=1, isOnMic=-1`) ngay lập tức.
     */
    public async upgradeAudioToVideoCall(status: 1 | 2 = 1): Promise<void> {
        this.callType = this.groupId ? CallType.GroupVideo : CallType.Video;
        this.isCameraOn = true;
        this.startMediaKeepaliveLoop();

        await this.sendCameraState(true).catch(() => {});
        if (Date.now() - this.lastExternalVideoSentAtMs >= 300) {
            await this.sendH264AnnexBFrame(H264_KEEPALIVE_ANNEXB_FRAME, {
                timestampStep: 6000,
                isKeepalive: true,
            }).catch(() => {});
        }

        if (this.partnerId && this.callId > 0 && !this.groupId) {
            await this.api.call.requestAudioToVideoCall(this.partnerId, this.callId, { status }).catch(() => {});
            await this.api.call
                .updateCallMediaState(this.partnerId, this.callId, {
                    isOnCam: 1,
                    isOnMic: -1,
                    data: "",
                })
                .catch(() => {});
        } else if (this.groupId && this.callId > 0) {
            const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
            const localUserIdTarget =
                this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
            await this.api.call
                .broadcastGroupCallState(this.callId, {
                    hostCall: hostCallTarget,
                    userId: localUserIdTarget,
                    callState: this.getLocalGroupCallState(),
                    audioState: this.isMicMuted ? 1 : 0,
                    videoState: 0,
                })
                .catch(() => {});
        }

        this.emit("media_state_change", {
            isLocal: true,
            isCameraOn: this.isCameraOn,
            isMicMuted: this.isMicMuted,
            isHold: this.isHold,
            isScreenSharing: this.isScreenSharing,
            callType: this.callType,
        });
    }

    /**
     * Gửi trực tiếp một khung âm thanh Opus (mặc định 20ms @ 16kHz = 320 samples)
     * qua đường truyền UDP của cuộc gọi.
     * Tự động đóng gói RTP 12-byte header -> (Tuỳ chọn) Mã hoá SRTP -> Bọc `ZRTPPacket` header.
     */
    public async sendAudioFrame(
        opusPayload: Buffer,
        options: {
            payloadType?: number;
            samples?: number;
            marker?: boolean;
            sequenceNumber?: number;
            timestamp?: number;
            ssrc?: number;
            isKeepalive?: boolean;
        } = {},
    ): Promise<void> {
        if (!options.isKeepalive) {
            this.lastExternalAudioSentAtMs = Date.now();
        }
        const seq = options.sequenceNumber ?? (this.audioSeq = (this.audioSeq + 1) & 0xffff);
        const samples = options.samples ?? 320;
        const ts = options.timestamp ?? (this.audioTimestamp = (this.audioTimestamp + samples) >>> 0);
        const ssrc = options.ssrc ?? this.getLocalAudioSsrc();

        this.audioPacketCount = (this.audioPacketCount + 1) >>> 0;
        this.audioOctetCount = (this.audioOctetCount + opusPayload.length) >>> 0;

        const rtpPacket = buildRtpPacket({
            payloadType: options.payloadType ?? 112,
            sequenceNumber: seq,
            timestamp: ts,
            ssrc,
            marker: options.marker,
            payload: opusPayload,
        });

        await this.sendAudioRtp(rtpPacket);
    }

    /**
     * Gửi một gói tin chuẩn WebRTC RTP (Audio) qua đường truyền UDP Zalo.
     */
    public async sendAudioRtp(rtpPacket: Buffer): Promise<void> {
        const activeAudioSrtp = this.audioSrtpSession ?? this.srtpSession;
        const protectedRtp = activeAudioSrtp ? activeAudioSrtp.protectRtp(rtpPacket) : rtpPacket;
        const token = (this.routingToken || this.callId) >>> 0;
        const role = this.isCaller ? ZRTCRole.Caller : ZRTCRole.Callee;

        const framed =
            this.getEffectivePacketMode() === 1
                ? wrapLegacyMediaPacket(ZRTPLegacyMediaType.AudioRtp, token, protectedRtp)
                : wrapZrtcMediaPacket(ZRTCMediaSubCommand.AudioRtp, token, protectedRtp, role);

        await this.sendRawUdp(framed, this.rtpEndpoint.host, this.rtpEndpoint.port);
    }

    /**
     * Gửi trực tiếp một khung hình ảnh H.264 NAL / RTP payload (mặc định 90kHz clock, payloadType=97)
     * qua đường truyền UDP của cuộc gọi Video.
     */
    public async sendVideoFrame(
        h264Payload: Buffer,
        options: {
            payloadType?: number;
            timestampStep?: number;
            marker?: boolean;
            sequenceNumber?: number;
            timestamp?: number;
            ssrc?: number;
            isKeepalive?: boolean;
        } = {},
    ): Promise<void> {
        if (!options.isKeepalive) {
            this.lastExternalVideoSentAtMs = Date.now();
        }
        const seq = options.sequenceNumber ?? (this.videoSeq = (this.videoSeq + 1) & 0xffff);
        const step = options.timestampStep ?? 3750; // ~24fps @ 90kHz
        const ts = options.timestamp ?? (this.videoTimestamp = (this.videoTimestamp + step) >>> 0);
        const ssrc = options.ssrc ?? this.getLocalVideoSsrc();

        this.videoPacketCount = (this.videoPacketCount + 1) >>> 0;
        this.videoOctetCount = (this.videoOctetCount + h264Payload.length) >>> 0;

        const isGroup = this.isGroupCallSession();
        const activeQualityId = Math.max(0, Math.min(15, this.requestedLocalVideoQualityId || 0));
        const sId = Math.floor(activeQualityId / 3);
        const tId = activeQualityId % 3;
        const headerExtension = isGroup
            ? buildGroupCallVideoRtpHeaderExtension({
                  sequenceNumber: seq,
                  transportSequenceNumber: seq,
                  spatialId: sId,
                  temporalId: tId,
                  maxSpatialId: sId,
                  maxTemporalId: tId,
              })
            : undefined;

        const rtpPacket = buildRtpPacket({
            payloadType: options.payloadType ?? 97,
            sequenceNumber: seq,
            timestamp: ts,
            ssrc,
            marker: options.marker ?? true,
            headerExtension,
            payload: h264Payload,
        });

        await this.sendVideoRtp(rtpPacket);
    }

    /**
     * Đóng gói một khung hình H.264 dạng Annex-B (`00 00 00 01 <NAL>`) theo chuẩn `RtpPacketizerH264` (`g_nalHeaderSize = 0`)
     * và `VCMPacket::CopyCodecSpecifics` (`0x1004347dc`) của Zalo:
     * - Tự động tách các NAL unit, lưu cache SPS (`type=7`) / PPS (`type=8`) và ghép thành chuỗi Annex-B hoàn chỉnh
     *   (`00 00 00 01 <SPS> 00 00 00 01 <PPS> 00 00 00 01 <IDR>` cho Keyframe `PT=98`, `00 00 00 01 <P-slice>` cho Delta `PT=97`)
     * - Không cho phép khung keepalive 16x16 ghi đè `localSpsNal` / `localPpsNal` của camera thực
     * - Khung `<= 1135` bytes: gửi trong 1 gói RTP Single-AnnexB (`packetization_type=1`, `completeNALU=kNaluComplete`, `marker=true`)
     * - Khung `> 1135` bytes: phân mảnh đều thành các gói RTP **FU-A Annex-B (`0x1c`, `origNalType=0`)** cùng `timestamp` 90kHz
     * - Đặt cờ `marker = true` ở gói RTP cuối cùng của khung hình để `VCMSessionInfo` giải mã và hiển thị ngay.
     */
    public async sendH264AnnexBFrame(
        annexB: Buffer,
        options: {
            payloadType?: number;
            timestampStep?: number;
            timestamp?: number;
            ssrc?: number;
            isKeepalive?: boolean;
        } = {},
    ): Promise<void> {
        const rawNals = splitAnnexBNals(annexB).filter((n) => n.length > 0);
        if (rawNals.length === 0) return;

        if (!options.isKeepalive) {
            this.lastExternalVideoSentAtMs = Date.now();
        }

        let inlineSps: Buffer | null = null;
        let inlinePps: Buffer | null = null;
        let hasIdr = false;
        const vclAndSeiNals: Buffer[] = [];

        for (const nal of rawNals) {
            const nalType = nal[0] & 0x1f;
            if (nalType === 7) {
                inlineSps = Buffer.from(nal);
                if (!options.isKeepalive || !this.localSpsNal) {
                    this.localSpsNal = inlineSps;
                }
            } else if (nalType === 8) {
                inlinePps = Buffer.from(nal);
                if (!options.isKeepalive || !this.localPpsNal) {
                    this.localPpsNal = inlinePps;
                }
            } else if (nalType === 9) {
                // Bỏ qua Access Unit Delimiter (AUD, type=9) để tương thích phần cứng VideoToolbox iOS
                continue;
            } else {
                if (nalType === 5) hasIdr = true;
                vclAndSeiNals.push(nal);
            }
        }

        const spsToUse = inlineSps ?? (hasIdr ? this.localSpsNal : null);
        const ppsToUse = inlinePps ?? (hasIdr ? this.localPpsNal : null);

        const startCode = Buffer.from([0x00, 0x00, 0x00, 0x01]);
        const annexBParts: Buffer[] = [];
        if (spsToUse) annexBParts.push(startCode, spsToUse);
        if (ppsToUse) annexBParts.push(startCode, ppsToUse);
        for (const nal of vclAndSeiNals) {
            annexBParts.push(startCode, nal);
        }
        if (annexBParts.length === 0) return;

        const fullAnnexB = Buffer.concat(annexBParts);
        if (hasIdr && !options.isKeepalive) {
            this.lastLocalKeyframeAnnexB = fullAnnexB;
        }

        const step = options.timestampStep ?? 6000; // ~15fps @ 90kHz
        const frameTs = options.timestamp ?? (this.videoTimestamp = (this.videoTimestamp + step) >>> 0);
        const maxPayloadSize = 1000;

        const rtpPayloads: Buffer[] = [];
        if (fullAnnexB.length <= maxPayloadSize) {
            rtpPayloads.push(fullAnnexB);
        } else {
            const numPackets = Math.ceil(fullAnnexB.length / maxPayloadSize);
            let offset = 0;
            for (let i = 0; i < numPackets; i++) {
                const remainingBytes = fullAnnexB.length - offset;
                const remainingPackets = numPackets - i;
                const chunkLen = Math.ceil(remainingBytes / remainingPackets);
                const isFirst = i === 0;
                const isLast = i === numPackets - 1;
                const frag = Buffer.allocUnsafe(2 + chunkLen);
                frag[0] = 0x1c; // F=0, NRI=0, Type=28 (FU-A)
                frag[1] = (isFirst ? 0x80 : 0) | (isLast ? 0x40 : 0); // S/E bits, origNalType=0 (Annex-B stream)
                fullAnnexB.copy(frag, 2, offset, offset + chunkLen);
                rtpPayloads.push(frag);
                offset += chunkLen;
            }
        }

        // Trong RTPSender::SendOutgoingData (0x1003ed76c) & RTPReceiverVideo::ParseRtpPacket (0x1003e8b4c):
        // Zalo quy định:
        // - Keyframe H.264 (SPS+PPS+IDR, frameType=3) BẮT BUỘC gửi trên payloadType = 98 (0x62)
        // - Delta frame H.264 (P-slice, frameType=4) gửi trên payloadType = 97 (0x61)
        const resolvedPayloadType = options.payloadType ?? (hasIdr ? 98 : 97);
        const frameSsrc = options.ssrc ?? this.getLocalVideoSsrc();

        // Cấp phát đồng bộ dãy sequenceNumber liên tiếp cho toàn bộ các mảnh FU-A của cùng 1 khung hình
        // để ngăn hiện tượng xen kẽ (interleaving) sequenceNumber khi có nhiều lệnh gửi bất đồng bộ
        const allocatedSeqs: number[] = [];
        for (let i = 0; i < rtpPayloads.length; i++) {
            this.videoSeq = (this.videoSeq + 1) & 0xffff;
            allocatedSeqs.push(this.videoSeq);
        }

        for (let i = 0; i < rtpPayloads.length; i++) {
            const isLastPacket = i === rtpPayloads.length - 1;
            await this.sendVideoFrame(rtpPayloads[i], {
                payloadType: resolvedPayloadType,
                sequenceNumber: allocatedSeqs[i],
                timestamp: frameTs,
                ssrc: frameSsrc,
                marker: isLastPacket,
                isKeepalive: options.isKeepalive,
            });
        }
    }

    /**
     * Phát sự kiện `"pli_request"` để bộ mã hoá WebCodecs/FFmpeg phía ứng dụng tạo ngay keyframe IDR mới,
     * hoặc phát lại khung hình khoá H.264 (`SPS + PPS + IDR` trên `PT=98`) gần nhất nếu không có luồng camera trực tiếp đang chạy.
     * Được gọi tự động khi có thành viên mới trả lời (`GROUP_ANSWER` / `ANSWER`), bật lại camera,
     * hoặc khi nhận gói RTCP PLI (`PT=206, FMT=1`) / FIR (`FMT=4`).
     */
    private resendCachedLocalKeyframe(force = false): void {
        if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended" || !this.isCameraOn) return;
        const now = Date.now();
        if (!force && now - this.lastKeyframeResentAtMs < 250) return;
        this.lastKeyframeResentAtMs = now;
        this.emit("pli_request", { timestamp: now });
        // Chỉ phát lại bản lưu lastLocalKeyframeAnnexB khi không có luồng VideoEncoder trực tiếp đang truyền
        // để không chèn khung IDR cũ (frame_num=0) vào giữa các P-slice mới làm hỏng bộ đệm tham chiếu H.264 (DPB)
        const isLiveExternalStreamActive = now - this.lastExternalVideoSentAtMs < 1500;
        if (this.lastLocalKeyframeAnnexB && !isLiveExternalStreamActive) {
            const cached = this.lastLocalKeyframeAnnexB;
            void this.sendH264AnnexBFrame(cached, {
                timestampStep: 3000,
                isKeepalive: true,
            }).catch(() => {});
        }
    }

    /**
     * Gửi tín hiệu bật/tắt Camera (`cmd = 32, subCmd = 7` `OnCamera` / `subCmd = 8` `OffCamera`)
     * khớp với `GroupCallPeer::startStopVideoCapture` (`0x100213648` & `0x100213710`),
     * `GroupCallController::vidSetLocalOffCamera` (`0x100207134`) và `CallController::vidSendSignalOffCamera` (`0x10016fbe4`).
     * Phát lặp 3 lần (0ms, 60ms, 150ms) để chống mất gói UDP.
     */
    public async sendCameraState(isCameraOn: boolean, reason = 0): Promise<void> {
        if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") return;
        const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
        const token = (this.routingToken || this.callId) >>> 0;
        const payload = Buffer.alloc(4);
        payload.writeInt32LE(reason | 0, 0);
        const pkt = buildRequestForwardPacket({
            seqNum: 0,
            seqId: 0,
            fromUid,
            routingToken: token,
            subCmd: isCameraOn ? ZRTPForwardSubCommand.OnCamera : ZRTPForwardSubCommand.OffCamera,
            payload,
        });
        await this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port);
        if (isCameraOn && this.isGroupCallSession()) {
            void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
        }
        if (!this.isGroupCallSession()) {
            for (const delayMs of [60, 150]) {
                const t = setTimeout(() => {
                    if (this.udpSocket && this.rtpEndpoint.port > 0 && this.state !== "ended") {
                        void this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
                    }
                }, delayMs);
                if (typeof t.unref === "function") t.unref();
            }
        }
    }

    /**
     * Gửi tín hiệu bật/tắt Microphone (`cmd = 32, subCmd = 5` `OnMic` / `subCmd = 6` `OffMic`
     * kèm gói `cmd = 1` `AudioCodec` `codecType = 3 | 9` trong Group Call) qua máy chủ Relay UDP.
     */
    public async sendMicState(isMicOn: boolean): Promise<void> {
        if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") return;
        const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
        const token = (this.routingToken || this.callId) >>> 0;
        const payload = Buffer.alloc(4);
        payload.writeInt32LE(0, 0);
        const pkt = buildRequestForwardPacket({
            seqNum: 0,
            seqId: 0,
            fromUid,
            routingToken: token,
            subCmd: isMicOn ? ZRTPForwardSubCommand.OnMic : ZRTPForwardSubCommand.OffMic,
            payload,
        });
        await this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port);
        const codecPkt = this.isGroupCallSession()
            ? buildAudioCodecMutePacket({
                  seqNum: 0,
                  callId: 0,
                  fromUid,
                  routingToken: token,
                  muted: !isMicOn,
              })
            : null;
        if (codecPkt) {
            await this.sendRawUdp(codecPkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
        }
        if (!this.isGroupCallSession()) {
            for (const delayMs of [60, 150]) {
                const t = setTimeout(() => {
                    if (this.udpSocket && this.rtpEndpoint.port > 0 && this.state !== "ended") {
                        void this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
                    }
                }, delayMs);
                if (typeof t.unref === "function") t.unref();
            }
        }
    }

    /**
     * Gửi cấu hình chất lượng Video Group Call (`cmd = 32, subCmd = 12`) tới máy chủ SFU `zavi`
     * (`GroupCallController::sendVideoQualityBitrateConfig` @ `0x1001f9298`).
     */
    public async sendGroupVideoQualityBitrateConfig(): Promise<void> {
        if (!this.isGroupCallSession() || !this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") {
            return;
        }
        const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
        const token = (this.routingToken || this.callId) >>> 0;
        const pkt = buildGroupVideoQualityBitrateConfigPacket({
            seqNum: 0,
            seqId: 0,
            fromUid,
            routingToken: token,
        });
        await this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port);
    }

    /**
     * Gửi gói đăng ký nhận luồng Video (`cmd = 32, subCmd = 13`) của tất cả thành viên đang trong phòng Group Call tới SFU `zavi`
     * (`GroupCallController::sendVideoQualityRequest` @ `0x100204fd8`).
     */
    public async sendGroupVideoQualityRequest(explicitPartnerUids?: number[]): Promise<void> {
        if (!this.isGroupCallSession() || !this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") {
            return;
        }
        const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
        const localVoipNum = Number(this.localVoipUid);
        const candidateUids = new Set<number>();

        if (explicitPartnerUids && explicitPartnerUids.length > 0) {
            for (const uid of explicitPartnerUids) {
                if (Number.isFinite(uid) && uid > 0 && uid <= 0xffffffff) {
                    candidateUids.add(uid >>> 0);
                }
            }
        }
        for (const uid of this.roomPartnerVoipUids) {
            if (uid > 0) candidateUids.add(uid >>> 0);
        }
        for (const info of this.groupPartnerInfo) {
            if (info.userId !== undefined && info.userId > 0 && info.userId <= 0xffffffff) {
                if (
                    !this.removedGroupPartners.has(String(info.userId)) &&
                    (!info.id || !this.removedGroupPartners.has(String(info.id)))
                ) {
                    candidateUids.add(info.userId >>> 0);
                }
            }
        }
        for (const [voipUid, noiseId] of this.voipUidToNoiseIdMap.entries()) {
            if (
                voipUid > 0 &&
                !this.removedGroupPartners.has(String(voipUid)) &&
                !this.removedGroupPartners.has(noiseId)
            ) {
                candidateUids.add(voipUid >>> 0);
            }
        }
        const hostNum = Number(this.hostCall);
        if (
            Number.isFinite(hostNum) &&
            hostNum > 0 &&
            hostNum <= 0xffffffff &&
            !this.removedGroupPartners.has(String(hostNum))
        ) {
            candidateUids.add(hostNum >>> 0);
        }

        if (fromUid > 0) candidateUids.delete(fromUid >>> 0);
        if (Number.isFinite(localVoipNum) && localVoipNum > 0) candidateUids.delete(localVoipNum >>> 0);

        if (candidateUids.size === 0) return;

        const token = (this.routingToken || this.callId) >>> 0;
        const partners = Array.from(candidateUids).map((partnerUid) => {
            const advertised = this.partnerVideoQualityIds.get(partnerUid);
            const qualityId = advertised && advertised.length > 0 ? (advertised.includes(0) ? 0 : advertised[0]) : 0;
            return {
                partnerUid,
                qualityId,
            };
        });
        const pkt = buildGroupVideoQualityRequestPacket({
            seqNum: 0,
            seqId: 0,
            fromUid,
            routingToken: token,
            partners,
        });
        await this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port);
    }

    /**
     * Gửi gói RTCP PLI (Picture Loss Indication — `PT=206, FMT=1`) yêu cầu máy đối phương
     * gửi ngay khung hình khoá H.264 IDR kèm SPS/PPS.
     */
    public async sendRtcpPli(targetSsrc?: number): Promise<void> {
        const ssrcsToRequest = new Set<number>();
        if (targetSsrc !== undefined && targetSsrc !== 0) {
            ssrcsToRequest.add(targetSsrc >>> 0);
        } else {
            for (const ssrc of this.videoAssemblers.keys()) {
                if (ssrc !== 0) ssrcsToRequest.add(ssrc >>> 0);
            }
            if (this.remoteVideoSsrc !== 0) {
                ssrcsToRequest.add(this.remoteVideoSsrc >>> 0);
            }
            if (ssrcsToRequest.size === 0) {
                if (this.isGroupCallSession()) {
                    const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
                    for (const uid of this.roomPartnerVoipUids) {
                        if (uid > 0 && uid !== fromUid) ssrcsToRequest.add(uid >>> 0);
                    }
                    for (const info of this.groupPartnerInfo) {
                        if (
                            info.userId !== undefined &&
                            info.userId > 0 &&
                            info.userId <= 0xffffffff &&
                            info.userId !== fromUid &&
                            !this.removedGroupPartners.has(String(info.userId))
                        ) {
                            ssrcsToRequest.add(info.userId >>> 0);
                        }
                    }
                } else if (this.toUid32 !== 0) {
                    ssrcsToRequest.add(this.toUid32 >>> 0);
                }
            }
        }
        if (ssrcsToRequest.size === 0) return;

        const localSsrc = this.getLocalVideoSsrc();
        for (const remoteSsrc of ssrcsToRequest) {
            const pli = Buffer.alloc(12);
            pli.writeUInt8(0x81, 0); // V=2, FMT=1 (PLI)
            pli.writeUInt8(206, 1); // PT=206 (PSFB)
            pli.writeUInt16BE(2, 2); // length = 2 words (12 bytes)
            pli.writeUInt32BE(localSsrc, 4);
            pli.writeUInt32BE(remoteSsrc >>> 0, 8);
            await this.sendRtcp(pli, true);
        }
    }

    /**
     * Gửi một gói tin chuẩn WebRTC RTP (Video H.264) qua đường truyền UDP Zalo.
     */
    public async sendVideoRtp(rtpPacket: Buffer): Promise<void> {
        const protectedRtp = this.srtpSession ? this.srtpSession.protectRtp(rtpPacket) : rtpPacket;
        const token = (this.routingToken || this.callId) >>> 0;
        const role = this.isCaller ? ZRTCRole.Caller : ZRTCRole.Callee;

        const framed =
            this.getEffectivePacketMode() === 1
                ? wrapLegacyMediaPacket(ZRTPLegacyMediaType.VideoRtp, token, protectedRtp)
                : wrapZrtcMediaPacket(ZRTCMediaSubCommand.VideoRtp, token, protectedRtp, role);

        await this.sendRawUdp(framed, this.rtpEndpoint.host, this.rtpEndpoint.port);
    }

    /**
     * Gửi gói tin điều khiển chất lượng RTCP (Audio hoặc Video) qua đường truyền UDP Zalo.
     * Lưu ý: Trong Group Call (`GroupCallPeer::sendMediaPacket` @ `0x10021af48`), các gói `0x05` (`AudioRtcp`),
     * `0x07` (`AudioFec`), `0x0f` (`VideoRtcp`) luôn gửi raw RTCP không mã hoá SRTP.
     */
    public async sendRtcp(rtcpPacket: Buffer, isVideo = false): Promise<void> {
        const shouldProtectRtcp =
            !this.isGroupCallSession() && Boolean(this.srtpSession) && Number(this.extendData?.srtcp) === 1;
        const protectedRtcp =
            shouldProtectRtcp && this.srtpSession ? this.srtpSession.protectRtcp(rtcpPacket) : rtcpPacket;
        const token = (this.routingToken || this.callId) >>> 0;
        const role = this.isCaller ? ZRTCRole.Caller : ZRTCRole.Callee;

        const framed =
            this.getEffectivePacketMode() === 1
                ? wrapLegacyMediaPacket(
                      isVideo ? ZRTPLegacyMediaType.VideoRtcp : ZRTPLegacyMediaType.AudioRtcp,
                      token,
                      protectedRtcp,
                  )
                : wrapZrtcMediaPacket(
                      isVideo ? ZRTCMediaSubCommand.VideoRtcp : ZRTCMediaSubCommand.AudioRtcp,
                      token,
                      protectedRtcp,
                      role,
                  );

        const target = this.rtcpEndpoint.port > 0 ? this.rtcpEndpoint : this.rtpEndpoint;
        await this.sendRawUdp(framed, target.host, target.port);
    }

    /**
     * Kết thúc cuộc gọi hiện tại:
     * 1. Gửi gói UDP `RequestEndCall` (`0x01 0x7e`, `cmd=3`, 25 bytes) 3 lần tới máy chủ Relay (`_sendRequestZRTPEndCall` @ `0x10016a880`)
     * 2. Giải phóng toàn bộ tài nguyên UDP socket & bộ định thời
     * 3. Gửi tín hiệu HTTP `/api/voicecall/cancel` (`11305`) và `/api/voicecall/endcall` (`11306`) hoặc `/api/voicecall/group/end` (`12046`)
     *    cho mọi thao tác ngắt máy từ phía local (`local_end`, `user_hangup`, `new_call`, ...).
     */
    public async endCall(reason = "local_end"): Promise<void> {
        if (this.state === "ended") return;
        const prevState = this.state;
        this.setState("ended");

        if (this.udpSocket && this.rtpEndpoint.port > 0 && this.callId > 0) {
            try {
                const endPkt = buildEndCallRequest({
                    seqNum: 0,
                    callId: this.callId,
                    fromUid: this.fromUid32 || uidToUint32(this.api.getContext().uid),
                    toUid: this.toUid32 || uidToUint32(this.partnerId),
                    routingToken: (this.routingToken || this.callId) >>> 0,
                    flags: 0,
                });
                for (let i = 0; i < 3; i++) {
                    await this.sendRawUdp(endPkt, this.rtpEndpoint.host, this.rtpEndpoint.port);
                }
            } catch {
                // Ignore UDP send error on teardown
            }
        }

        this.cleanupResources();

        const isRemoteReason =
            reason === "remote_end" ||
            reason === "remote_cancel" ||
            reason === "end" ||
            reason === "cancel" ||
            reason === "rejected" ||
            reason === "busy";

        if (this.callId > 0 && !isRemoteReason) {
            try {
                if (this.groupId || this.callType === CallType.GroupAudio || this.callType === CallType.GroupVideo) {
                    const groupCallType = normalizeGroupCallType(this.callType);
                    const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
                    const groupIdTarget = this.internalGroupId || this.groupId || hostCallTarget;
                    if ((prevState === "ringing" || !this.hasReceivedPartnerMedia) && this.isCaller) {
                        await this.api.call
                            .cancelGroupCall(this.callId, {
                                hostCall: hostCallTarget,
                                groupId: groupIdTarget,
                                callType: groupCallType,
                                session: this.sessId,
                                status: 0,
                                partners: this.groupPartners,
                            })
                            .catch(() => {});
                    }
                    await this.api.call
                        .endGroupCall(this.callId, {
                            hostCall: hostCallTarget,
                            groupId: groupIdTarget,
                            callType: groupCallType,
                            session: this.sessId,
                            status: 0,
                            partners: this.groupPartners,
                        })
                        .catch(() => {});
                } else if (this.partnerId) {
                    const wasStillRinging =
                        (prevState === "ringing" || prevState === "handshaking_udp" || prevState === "allocating") &&
                        !this.hasReceivedPartnerMedia;

                    if (wasStillRinging && this.isCaller) {
                        await this.api.call
                            .cancelVoiceCall(this.partnerId, this.callId, {
                                callType: this.callType,
                            })
                            .catch(() => {});
                        // Dự phòng trường hợp máy đối phương vừa bắt máy nhưng sự kiện WS chưa kịp về:
                        await this.api.call.endVoiceCall(this.partnerId, this.callId).catch(() => {});
                    } else {
                        await this.api.call.endVoiceCall(this.partnerId, this.callId).catch(() => {});
                    }

                    if (this.activeStartedAtMs > 0) {
                        const durationSec = Math.max(1, Math.floor((Date.now() - this.activeStartedAtMs) / 1000));
                        void this.api.call
                            .logEndVoiceCall(this.partnerId, this.callId, {
                                duration: durationSec,
                                status: 0,
                                role: this.isCaller,
                            })
                            .catch(() => {});
                    }
                }
            } catch {
                // Ignore signaling error if already ended
            }
        }

        this.emit("ended", reason);
    }

    /**
     * Xử lý sự kiện `call_event` từ WebSocket (hoặc truyền thủ công).
     */
    public async handleCallEvent(event: CallEvent): Promise<void> {
        const rawParams =
            event.data.params !== undefined
                ? safeJsonParseRecord(event.data.params)
                : event.data.data !== undefined
                  ? safeJsonParseRecord(event.data.data)
                  : event.data;

        const eventCallId = Number(
            event.data.callId ??
                event.data.call_id ??
                event.data.id ??
                rawParams.callId ??
                rawParams.call_id ??
                rawParams.id ??
                0,
        );
        if (this.callId > 0 && eventCallId > 0 && eventCallId !== this.callId) {
            return;
        }

        this.emit("call_event", event);

        if (
            event.type === CallEventType.REQUEST ||
            event.type === CallEventType.GROUP_REQUEST ||
            event.act === "request" ||
            event.act === "group_request"
        ) {
            const incomingInfo = parseIncomingCallEvent(event, this.api.getContext().uid);
            this.emit("incoming_call", incomingInfo);
            return;
        }

        const extendRaw =
            rawParams.extendData !== undefined
                ? safeJsonParseRecord(rawParams.extendData)
                : event.data.extendData !== undefined
                  ? safeJsonParseRecord(event.data.extendData)
                  : {};

        if (this.isGroupCallSession()) {
            this.applyGroupSrtpConfig(event.data);
        } else {
            const eventSrtp = extractSrtpConfigFromSource(event.data);
            const candidateKey =
                typeof extendRaw.srtpKey === "string" && extendRaw.srtpKey.length >= 40
                    ? extendRaw.srtpKey
                    : eventSrtp.srtpKey;
            const candidateMode = extendRaw.srtpMode !== undefined ? Number(extendRaw.srtpMode) : eventSrtp.srtpMode;
            if (candidateKey && candidateKey.length >= 40 && candidateMode !== 0) {
                this.srtpSession = new ZaloSrtpSession(candidateKey, this.options.srtpSuite);
                this.audioSrtpSession = this.srtpSession;
            } else if (candidateMode === 0 && !this.options.srtpMasterKeyBase64) {
                this.srtpSession = null;
                this.audioSrtpSession = null;
            }
        }

        if (event.type === CallEventType.RINGRING || event.type === CallEventType.GROUP_RINGRING) {
            if (event.type === CallEventType.GROUP_RINGRING) {
                this.mergeGroupPartnerMappings(event.data);
            }
            if (this.state === "handshaking_udp" || this.state === "allocating") {
                this.setState("ringing");
            }
        } else if (
            event.type === CallEventType.ANSWER ||
            event.type === CallEventType.GROUP_ANSWER ||
            event.type === CallEventType.GROUP_JOIN ||
            event.act === "group_join" ||
            event.act === "group_join_call"
        ) {
            const isGroupJoinOrAnswer =
                event.type === CallEventType.GROUP_ANSWER ||
                event.type === CallEventType.GROUP_JOIN ||
                event.act === "group_join" ||
                event.act === "group_join_call";
            if (isGroupJoinOrAnswer) {
                this.mergeGroupPartnerMappings(event.data);
                const extraDataObj =
                    rawParams.extraData !== undefined
                        ? safeJsonParseRecord(rawParams.extraData)
                        : event.data.extraData !== undefined
                          ? safeJsonParseRecord(event.data.extraData)
                          : {};
                const answerStatus = Number(extraDataObj.status ?? rawParams.status ?? event.data.status ?? 0);
                const answeringUid = String(
                    rawParams.fromId ?? rawParams.userId ?? event.data.fromId ?? event.data.userId ?? "",
                );
                const resolvedAnsweringPartnerId = this.resolvePartnerId(answeringUid) ?? (answeringUid || undefined);
                // Khớp với ZCallGroupInfo::receiveAnswer (0x100129f7c): status=3 là từ chối (_receiveReject), status=1 là máy bận (_receiveBusy)
                if (answerStatus === 3 || answerStatus === 1) {
                    this.emit("media_state_change", {
                        isLocal: false,
                        partnerId: resolvedAnsweringPartnerId,
                        voipUid: answeringUid || undefined,
                        rawAct: answerStatus === 3 ? "group_reject" : "group_busy",
                        reason: answerStatus,
                    });
                    if (answeringUid) {
                        const remaining = this.markGroupPartnerRemoved(answeringUid);
                        if (remaining === 0) {
                            await this.endCall(answerStatus === 3 ? "rejected" : "busy");
                        }
                    }
                    return;
                }
            }
            this.hasReceivedPartnerMedia = true;
            if (this.isCaller && this.partnerId && this.callId > 0 && !this.groupId && !this.hasSentAnswerAck) {
                this.hasSentAnswerAck = true;
                try {
                    await this.api.call.answerAckVoiceCall(this.partnerId, this.callId);
                } catch {
                    // Ignore ack failure
                }
            }

            this.setState("active");
            if (
                this.callType === CallType.Video ||
                this.callType === CallType.GroupVideo ||
                Number(this.extendData?.callType) === 1
            ) {
                void this.sendCameraState(this.isCameraOn).catch(() => {});
                if (!this.isCameraOn && this.partnerId && this.callId > 0 && !this.groupId) {
                    void this.api.call
                        .updateCallMediaState(this.partnerId, this.callId, {
                            isOnCam: 0,
                            isOnMic: -1,
                            data: "",
                        })
                        .catch(() => {});
                }
                void this.sendRtcpPli().catch(() => {});
                this.resendCachedLocalKeyframe(true);
                const kfRetryTimer = setTimeout(() => {
                    if (this.state === "active") {
                        this.resendCachedLocalKeyframe(true);
                    }
                }, 250);
                if (typeof kfRetryTimer.unref === "function") kfRetryTimer.unref();
            }
            if (isGroupJoinOrAnswer) {
                const answeringUid = String(
                    rawParams.fromId ?? rawParams.userId ?? event.data.fromId ?? event.data.userId ?? "",
                );
                const resolvedAnsweringPartnerId = this.resolvePartnerId(answeringUid) ?? (answeringUid || undefined);
                if (answeringUid) {
                    this.removedGroupPartners.delete(answeringUid);
                    this.connectedGroupPartners.add(answeringUid);
                }
                if (resolvedAnsweringPartnerId) {
                    this.removedGroupPartners.delete(resolvedAnsweringPartnerId);
                    this.connectedGroupPartners.add(resolvedAnsweringPartnerId);
                }
                const answeringVoipNum = Number(answeringUid);
                if (Number.isFinite(answeringVoipNum) && answeringVoipNum > 0 && answeringVoipNum <= 0xffffffff) {
                    this.roomPartnerVoipUids.add(answeringVoipNum >>> 0);
                } else if (resolvedAnsweringPartnerId) {
                    const mappedVoip = this.resolveVoipUid(resolvedAnsweringPartnerId);
                    if (mappedVoip) this.roomPartnerVoipUids.add(mappedVoip >>> 0);
                }

                const syncGroupStateForPartner = (isFollowUp = false) => {
                    if (this.state === "ended") return;
                    if (!isFollowUp && this.groupId && this.callId > 0) {
                        const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
                        const localUserIdTarget =
                            this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
                        void this.api?.call
                            ?.pingGroupCall?.(this.callId, {
                                hostCall: hostCallTarget,
                                userId: localUserIdTarget,
                                callState: this.getLocalGroupCallState(),
                                audioState: this.isMicMuted ? 1 : 0,
                                videoState: this.isCameraOn ? 0 : 1,
                            })
                            ?.catch(() => {});
                        void this.api?.call
                            ?.broadcastGroupCallState?.(this.callId, {
                                hostCall: hostCallTarget,
                                userId: localUserIdTarget,
                                callState: this.getLocalGroupCallState(),
                                audioState: this.isMicMuted ? 1 : 0,
                                videoState: this.isCameraOn ? 0 : 1,
                            })
                            ?.catch(() => {});
                    }
                    if (!isFollowUp) {
                        void this.sendMicState(!this.isMicMuted).catch(() => {});
                        void this.sendCameraState(this.isCameraOn).catch(() => {});
                    }
                    void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
                    void this.sendGroupVideoQualityRequest().catch(() => {});
                    void this.sendRtcpPli().catch(() => {});
                    this.resendCachedLocalKeyframe(true);
                };
                syncGroupStateForPartner(false);
                const resyncT1 = setTimeout(() => syncGroupStateForPartner(true), 450);
                resyncT1.unref?.();

                const innerDataObj =
                    rawParams.data !== undefined
                        ? safeJsonParseRecord(rawParams.data)
                        : event.data.data !== undefined
                          ? safeJsonParseRecord(event.data.data)
                          : {};
                const extraAnsObj =
                    rawParams.extraData !== undefined
                        ? safeJsonParseRecord(rawParams.extraData)
                        : event.data.extraData !== undefined
                          ? safeJsonParseRecord(event.data.extraData)
                          : innerDataObj.extraData !== undefined
                            ? safeJsonParseRecord(innerDataObj.extraData)
                            : {};
                const audioStateVal =
                    rawParams.audioState ??
                    rawParams.audiostate ??
                    innerDataObj.audioState ??
                    innerDataObj.audiostate ??
                    extraAnsObj.audioState ??
                    extraAnsObj.audiostate ??
                    event.data.audioState ??
                    event.data.audiostate;
                const videoStateVal =
                    rawParams.videoState ??
                    rawParams.videostate ??
                    innerDataObj.videoState ??
                    innerDataObj.videostate ??
                    extraAnsObj.videoState ??
                    extraAnsObj.videostate ??
                    event.data.videoState ??
                    event.data.videostate;
                // Trong Zalo Group Call: videoState = 0 là Bật Camera, 1 là Tắt Camera;
                // audioState = 0 là Bật Mic (Unmuted), 1 là Tắt Mic (Muted).
                const isVideoAns =
                    videoStateVal !== undefined
                        ? Number(videoStateVal) === 0
                        : extendRaw.isVideo !== undefined
                          ? Boolean(Number(extendRaw.isVideo))
                          : innerDataObj.callType !== undefined
                            ? Number(innerDataObj.callType) === 1
                            : extraAnsObj.callType !== undefined
                              ? Number(extraAnsObj.callType) === 1
                              : this.callType === CallType.GroupVideo;
                const isMicMutedAns = audioStateVal !== undefined ? Number(audioStateVal) !== 0 : false;
                this.emit("media_state_change", {
                    isLocal: false,
                    partnerId: resolvedAnsweringPartnerId,
                    voipUid: answeringUid || undefined,
                    isCameraOn: isVideoAns,
                    isMicMuted: isMicMutedAns,
                    rawAct: event.act || "group_answer",
                });
            }
            const params = this.getConnectionParams();
            this.emit("connection_params", params);
            this.emit("active", params);
        } else if (
            event.type === CallEventType.CANCEL ||
            event.type === CallEventType.END ||
            event.type === CallEventType.GROUP_CANCEL
        ) {
            this.setState("ended");
            this.cleanupResources();
            this.emit("ended", event.act);
        } else if (event.type === CallEventType.GROUP_END) {
            // Khớp với ZCallGroupInfo::receiveEndcall (0x10012a31c) & _removePartner (0x10011ed20):
            // Nếu thành viên rời đi trùng với localUserId (cúp máy trên thiết bị khác) hoặc không còn thành viên nào trong phòng (remaining === 0) mới kết thúc cuộc gọi.
            const leavingUid = String(
                rawParams.fromId ?? rawParams.userId ?? event.data.fromId ?? event.data.userId ?? "",
            );
            const resolvedLeavingPartnerId = this.resolvePartnerId(leavingUid) ?? leavingUid;
            const localZaloUid = String(this.api.getContext().uid ?? "");
            const isLocalSelfEnd =
                !leavingUid ||
                (Boolean(this.localVoipUid) && leavingUid === this.localVoipUid) ||
                (Boolean(localZaloUid) && (leavingUid === localZaloUid || resolvedLeavingPartnerId === localZaloUid));
            if (isLocalSelfEnd) {
                this.setState("ended");
                this.cleanupResources();
                this.emit("ended", event.act);
            } else {
                const remaining = this.markGroupPartnerRemoved(leavingUid);
                this.emit("media_state_change", {
                    isLocal: false,
                    partnerId: resolvedLeavingPartnerId,
                    voipUid: leavingUid || undefined,
                    rawAct: "group_leave",
                });
                if (remaining === 0) {
                    this.setState("ended");
                    this.cleanupResources();
                    this.emit("ended", event.act);
                }
            }
        } else if (event.type === CallEventType.GROUP_ADD_USER || event.act === "group_add_user") {
            this.mergeGroupPartnerMappings(event.data);
            const parsedAdd = parseIncomingCallEvent(event, this.api.getContext().uid);
            for (const p of parsedAdd.partners) {
                this.removedGroupPartners.delete(String(p));
                if (!this.groupPartners.includes(p)) {
                    this.groupPartners.push(p);
                }
            }
            for (const infoItem of parsedAdd.partnerInfo) {
                if (infoItem.id) this.removedGroupPartners.delete(String(infoItem.id));
                if (infoItem.userId !== undefined) this.removedGroupPartners.delete(String(infoItem.userId));
                const existingIdx = this.groupPartnerInfo.findIndex(
                    (existing) =>
                        existing.id === infoItem.id ||
                        (infoItem.userId !== undefined && existing.userId === infoItem.userId),
                );
                if (existingIdx >= 0) {
                    this.groupPartnerInfo[existingIdx] = {
                        ...this.groupPartnerInfo[existingIdx],
                        ...infoItem,
                        name: infoItem.name || this.groupPartnerInfo[existingIdx].name,
                        avatar: infoItem.avatar || this.groupPartnerInfo[existingIdx].avatar,
                    };
                } else {
                    this.groupPartnerInfo.push(infoItem);
                }
            }
        } else if (
            event.type === CallEventType.GROUP_BROADCAST ||
            event.type === CallEventType.GROUP_BROADCAST_CONFIG ||
            event.act === "group_broadcast" ||
            event.act === "group_broadcast_config"
        ) {
            this.mergeGroupPartnerMappings(event.data);
            const innerBroadcastData =
                rawParams.data !== undefined
                    ? safeJsonParseRecord(rawParams.data)
                    : event.data.data !== undefined
                      ? safeJsonParseRecord(event.data.data)
                      : {};
            const localZaloUid = String(this.api.getContext().uid ?? "");

            const broadcastPartners = safeJsonParseArray(
                innerBroadcastData.partnerInfo ?? rawParams.partnerInfo ?? event.data.partnerInfo,
            );
            if (broadcastPartners.length > 0) {
                let lastRemainingCount: number | null = null;
                for (const p of broadcastPartners) {
                    const rawPid = String(p.userId ?? p.id ?? p.fromId ?? "").trim();
                    if (!rawPid) continue;
                    const resolvedPid = this.resolvePartnerId(rawPid) ?? rawPid;
                    if (
                        (this.localVoipUid && rawPid === this.localVoipUid) ||
                        (localZaloUid && (rawPid === localZaloUid || resolvedPid === localZaloUid))
                    ) {
                        continue;
                    }
                    const rawPState = p.state ?? p.callstate ?? p.callState;
                    const pState = rawPState !== undefined ? Number(rawPState) : 1;
                    // Trong ZCallGroupInfo::_processUpdatePing (0x10012b2cc):
                    // callState = 1 (Invited), 2 (Ringing), 3 (Answered / In-Call), >= 4 (Timeout / Left)
                    if (pState === 0) continue;
                    if (pState >= 4 || pState < 0) {
                        if (!this.removedGroupPartners.has(rawPid) && !this.removedGroupPartners.has(resolvedPid)) {
                            lastRemainingCount = this.markGroupPartnerRemoved(rawPid);
                            this.emit("media_state_change", {
                                isLocal: false,
                                partnerId: resolvedPid,
                                voipUid: rawPid,
                                rawAct: "group_leave",
                            });
                        }
                        continue;
                    }
                    this.removedGroupPartners.delete(rawPid);
                    this.removedGroupPartners.delete(resolvedPid);
                    this.connectedGroupPartners.add(rawPid);
                    this.connectedGroupPartners.add(resolvedPid);
                    const rawVoipNum = Number(p.userId ?? rawPid);
                    if (Number.isFinite(rawVoipNum) && rawVoipNum > 0 && rawVoipNum <= 0xffffffff) {
                        this.roomPartnerVoipUids.add(rawVoipNum >>> 0);
                    } else {
                        const mappedVoip = this.resolveVoipUid(resolvedPid);
                        if (mappedVoip) this.roomPartnerVoipUids.add(mappedVoip >>> 0);
                    }
                    const pAudio = p.audioState ?? p.audiostate;
                    const pVideo = p.videoState ?? p.videostate;
                    if (pAudio !== undefined || pVideo !== undefined) {
                        this.emit("media_state_change", {
                            isLocal: false,
                            partnerId: resolvedPid,
                            voipUid: rawPid,
                            isCameraOn: pVideo !== undefined ? Number(pVideo) === 0 : undefined,
                            isMicMuted: pAudio !== undefined ? Number(pAudio) !== 0 : undefined,
                            rawAct: event.act || "group_broadcast",
                        });
                    }
                }
                if (this.roomPartnerVoipUids.size > 0) {
                    void this.sendGroupVideoQualityRequest().catch(() => {});
                }
                if (lastRemainingCount === 0) {
                    this.setState("ended");
                    this.cleanupResources();
                    this.emit("ended", event.act);
                }
                return;
            }

            const rawBroadcastUid = String(
                innerBroadcastData.userId ??
                    innerBroadcastData.fromId ??
                    rawParams.userId ??
                    rawParams.fromId ??
                    event.data.userId ??
                    event.data.fromId ??
                    "",
            );
            const resolvedBroadcastPid = this.resolvePartnerId(rawBroadcastUid);
            if (!resolvedBroadcastPid) return;
            if (
                (this.localVoipUid && rawBroadcastUid === this.localVoipUid) ||
                (localZaloUid && (rawBroadcastUid === localZaloUid || resolvedBroadcastPid === localZaloUid))
            ) {
                return;
            }
            const rawBroadcastState =
                innerBroadcastData.state ??
                innerBroadcastData.callstate ??
                innerBroadcastData.callState ??
                rawParams.state ??
                rawParams.callstate ??
                rawParams.callState ??
                event.data.state ??
                event.data.callstate ??
                event.data.callState;
            const broadcastCallState = rawBroadcastState !== undefined ? Number(rawBroadcastState) : 1;
            if (broadcastCallState === 0) return;
            if (broadcastCallState >= 4 || broadcastCallState < 0) {
                const remaining = this.markGroupPartnerRemoved(rawBroadcastUid);
                this.emit("media_state_change", {
                    isLocal: false,
                    partnerId: resolvedBroadcastPid,
                    voipUid: rawBroadcastUid || undefined,
                    rawAct: "group_leave",
                });
                if (remaining === 0) {
                    this.setState("ended");
                    this.cleanupResources();
                    this.emit("ended", event.act);
                }
                return;
            }
            this.removedGroupPartners.delete(rawBroadcastUid);
            this.removedGroupPartners.delete(resolvedBroadcastPid);
            this.connectedGroupPartners.add(rawBroadcastUid);
            this.connectedGroupPartners.add(resolvedBroadcastPid);
            const broadcastVoipNum = Number(rawBroadcastUid);
            if (Number.isFinite(broadcastVoipNum) && broadcastVoipNum > 0 && broadcastVoipNum <= 0xffffffff) {
                this.roomPartnerVoipUids.add(broadcastVoipNum >>> 0);
            } else {
                const mappedVoip = this.resolveVoipUid(resolvedBroadcastPid);
                if (mappedVoip) this.roomPartnerVoipUids.add(mappedVoip >>> 0);
            }
            const audioStateVal =
                innerBroadcastData.audioState ??
                innerBroadcastData.audiostate ??
                rawParams.audioState ??
                rawParams.audiostate ??
                event.data.audioState ??
                event.data.audiostate;
            const videoStateVal =
                innerBroadcastData.videoState ??
                innerBroadcastData.videostate ??
                rawParams.videoState ??
                rawParams.videostate ??
                event.data.videoState ??
                event.data.videostate;
            if (videoStateVal !== undefined && Number(videoStateVal) === 0) {
                void this.sendGroupVideoQualityRequest().catch(() => {});
                void this.sendRtcpPli().catch(() => {});
            }
            if (audioStateVal !== undefined || videoStateVal !== undefined) {
                this.emit("media_state_change", {
                    isLocal: false,
                    partnerId: resolvedBroadcastPid,
                    voipUid: rawBroadcastUid || undefined,
                    isCameraOn: videoStateVal !== undefined ? Number(videoStateVal) === 0 : undefined,
                    isMicMuted: audioStateVal !== undefined ? Number(audioStateVal) !== 0 : undefined,
                    rawAct: event.act,
                });
            }
        } else if (event.act === "onoff_camera") {
            const camType = Number(rawParams.type ?? 0);
            const reason = Number(rawParams.reason ?? 0);
            if (camType === 1 || camType === 2) {
                this.clearIncomingVideoAssemblyBuffers();
            }
            // Khi đối phương gửi onoff_camera (đặc biệt reason=2/3 báo video loss hoặc bật lại camera), phản hồi ngay trạng thái camera và PLI
            void this.sendCameraState(this.isCameraOn).catch(() => {});
            void this.sendRtcpPli().catch(() => {});
            this.resendCachedLocalKeyframe();
            if (reason === 2 || reason === 3) {
                this.emit("media_state_change", {
                    isLocal: false,
                    rawAct: event.act,
                    reason,
                });
            } else {
                this.emit("media_state_change", {
                    isLocal: false,
                    isCameraOn: camType === 1 || camType === 2,
                    rawAct: event.act,
                    reason,
                });
            }
        } else if (
            event.act === "audio_to_video" ||
            event.act === "requestaudio2video" ||
            Number(event.data.subCmd) === 12056
        ) {
            const reqStatus = Number(rawParams.status ?? event.data.status ?? 1);
            this.callType = this.groupId ? CallType.GroupVideo : CallType.Video;
            this.isCameraOn = true;
            this.clearIncomingVideoAssemblyBuffers();
            this.startMediaKeepaliveLoop();
            if (reqStatus === 1 && this.partnerId && this.callId > 0) {
                void this.api.call.requestAudioToVideoCall(this.partnerId, this.callId, { status: 2 }).catch(() => {});
            }
            void this.sendCameraState(true).catch(() => {});
            void this.sendRtcpPli().catch(() => {});
            this.emit("media_state_change", {
                isLocal: false,
                callType: this.callType,
                isCameraOn: true,
                rawAct: event.act,
            });
        } else if (event.act === "holdreq") {
            if (this.partnerId) {
                void this.api.call.holdVoiceCall(this.partnerId, { isResponse: true }).catch(() => {});
            }
            this.emit("media_state_change", {
                isLocal: false,
                isHold: true,
                rawAct: event.act,
            });
        } else if (event.act === "unholdreq") {
            if (this.partnerId) {
                void this.api.call.unholdVoiceCall(this.partnerId, { isResponse: true }).catch(() => {});
            }
            this.clearIncomingVideoAssemblyBuffers();
            void this.sendMicState(!this.isMicMuted).catch(() => {});
            void this.sendCameraState(this.isCameraOn).catch(() => {});
            void this.sendRtcpPli().catch(() => {});
            this.emit("media_state_change", {
                isLocal: false,
                isHold: false,
                rawAct: event.act,
            });
        } else if (
            event.act === "requestsharescreen" ||
            event.act === "sharescreen" ||
            event.act === "group_sharescreen"
        ) {
            const shareStatus = Number(rawParams.status ?? event.data.status ?? 1);
            this.emit("media_state_change", {
                isLocal: false,
                isScreenSharing: shareStatus === 1,
                rawAct: event.act,
            });
        } else if (event.act === "conf" || event.act === "mute_audio") {
            this.emit("media_state_change", {
                isLocal: false,
                isCameraOn:
                    rawParams.isOnCam !== undefined && Number(rawParams.isOnCam) !== -1
                        ? Boolean(Number(rawParams.isOnCam))
                        : undefined,
                isMicMuted:
                    rawParams.isOnMic !== undefined && Number(rawParams.isOnMic) !== -1
                        ? !Boolean(Number(rawParams.isOnMic))
                        : undefined,
                rawAct: event.act,
            });
        }
    }

    private setState(nextState: ZaloRtcSessionState): void {
        if (this.state !== nextState) {
            if (nextState === "active" && !this.activeStartedAtMs) {
                this.activeStartedAtMs = Date.now();
            }
            if (nextState === "ringing" && this.options.ringingTimeoutMs > 0) {
                if (this.ringingTimeoutTimer) clearTimeout(this.ringingTimeoutTimer);
                this.ringingTimeoutTimer = setTimeout(() => {
                    if (this.state === "ringing") {
                        void this.endCall("ringing_timeout");
                    }
                }, this.options.ringingTimeoutMs);
                if (typeof this.ringingTimeoutTimer.unref === "function") {
                    this.ringingTimeoutTimer.unref();
                }
            } else if (nextState !== "ringing" && this.ringingTimeoutTimer) {
                clearTimeout(this.ringingTimeoutTimer);
                this.ringingTimeoutTimer = null;
            }
            this.state = nextState;
            this.emit("state", nextState);
        }
    }

    private extractGroupResponseServerInfo(rawRes: unknown): RequestCallServerInfo {
        this.mergeGroupPartnerMappings(rawRes);
        const topObj = safeJsonParseRecord(rawRes);
        const dataObj = topObj.data !== undefined ? safeJsonParseRecord(topObj.data) : topObj;
        const paramsObj =
            topObj.params !== undefined
                ? safeJsonParseRecord(topObj.params)
                : dataObj.params !== undefined
                  ? safeJsonParseRecord(dataObj.params)
                  : dataObj;
        const callSettingObj = safeJsonParseRecord(paramsObj.callSetting ?? dataObj.callSetting ?? topObj.callSetting);
        const resolvedCallId =
            Number(paramsObj.callId ?? paramsObj.id ?? dataObj.callId ?? topObj.callId ?? this.callId) || this.callId;
        const resolvedSession =
            callSettingObj.session ??
            paramsObj.session ??
            paramsObj.sessId ??
            dataObj.session ??
            dataObj.sessId ??
            topObj.session ??
            topObj.sessId ??
            (this.sessId || `${this.partnerId}_${resolvedCallId}_501`);
        const serversFromCallSetting = safeJsonParseArray(callSettingObj.servers);
        const serversFromParams = safeJsonParseArray(paramsObj.servers);
        const serversFromData = safeJsonParseArray(dataObj.servers);
        const serversFromTop = safeJsonParseArray(topObj.servers);
        const resolvedServers =
            serversFromCallSetting.length > 0
                ? serversFromCallSetting
                : serversFromParams.length > 0
                  ? serversFromParams
                  : serversFromData.length > 0
                    ? serversFromData
                    : serversFromTop.length > 0
                      ? serversFromTop
                      : undefined;

        return {
            ...topObj,
            ...dataObj,
            ...paramsObj,
            ...(resolvedServers ? { servers: resolvedServers } : {}),
            callId: resolvedCallId,
            sessId: String(resolvedSession),
        } as RequestCallServerInfo;
    }

    private applyServerInfo(serverInfo: RequestCallServerInfo): void {
        this.serverInfo = serverInfo;
        const callSettingObj = safeJsonParseRecord(serverInfo?.callSetting);
        const callSettingServers = Array.isArray(callSettingObj.servers)
            ? (callSettingObj.servers as Array<Record<string, unknown>>)
            : safeJsonParseArray(callSettingObj.servers);
        const firstServer = (serverInfo?.servers?.[0] ?? callSettingServers[0]) as Record<string, unknown> | undefined;
        const rtpServer = String(
            serverInfo?.rtpServer ??
                serverInfo?.rtpIP ??
                (serverInfo?.rtp as string | undefined) ??
                (serverInfo?.rtpAddress as string | undefined) ??
                firstServer?.rtpaddr ??
                firstServer?.rtp ??
                firstServer?.rtpIP ??
                callSettingObj.rtpServer ??
                callSettingObj.rtpIP ??
                callSettingObj.rtp ??
                "",
        );
        const rtcpServer = String(
            serverInfo?.rtcpServer ??
                serverInfo?.rtcpIP ??
                (serverInfo?.rtcp as string | undefined) ??
                (serverInfo?.rtcpAddress as string | undefined) ??
                firstServer?.rtcpaddr ??
                firstServer?.rtcp ??
                firstServer?.rtcpIP ??
                callSettingObj.rtcpServer ??
                callSettingObj.rtcpIP ??
                callSettingObj.rtcp ??
                rtpServer,
        );

        this.rtpEndpoint = parseEndpoint(rtpServer);
        this.rtcpEndpoint = parseEndpoint(rtcpServer || rtpServer);
        const isGroup =
            Boolean(this.groupId) || this.callType === CallType.GroupAudio || this.callType === CallType.GroupVideo;
        const fallbackSuffix = isGroup ? "501" : "401";
        this.sessId = String(
            callSettingObj.session ??
                serverInfo?.sessId ??
                (serverInfo?.session as string | undefined) ??
                `${this.partnerId}_${this.callId}_${fallbackSuffix}`,
        );
        this.zrtpKey = serverInfo?.zrtpKey;
        if (isGroup) {
            const candidateFrom = Number(serverInfo?.fromId ?? serverInfo?.hostCall);
            if (Number.isFinite(candidateFrom) && candidateFrom > 0 && candidateFrom <= 0xffffffff) {
                this.fromUid32 = candidateFrom >>> 0;
            } else if (!this.fromUid32) {
                this.fromUid32 = uidToUint32(this.api.getContext().uid);
            }
            const candidateTo = Number(serverInfo?.groupId ?? serverInfo?.toId ?? this.internalGroupId);
            if (Number.isFinite(candidateTo) && candidateTo > 0 && candidateTo <= 0xffffffff) {
                this.toUid32 = candidateTo >>> 0;
            } else if (!this.toUid32) {
                this.toUid32 = uidToUint32(this.groupId || this.partnerId);
            }
        } else {
            this.fromUid32 = Number(serverInfo?.fromId) || uidToUint32(this.api.getContext().uid);
            this.toUid32 = Number(serverInfo?.toId) || uidToUint32(this.partnerId);
        }

        if (serverInfo?.codec && serverInfo.codec !== "[]") {
            this.codec = serverInfo.codec;
        }
    }

    private async ensureUdpSocket(): Promise<dgram.Socket> {
        if (this.udpSocket) return this.udpSocket;

        const sock = dgram.createSocket("udp4");
        this.udpSocket = sock;

        sock.on("message", (msg) => {
            this.handleIncomingUdpPacket(msg);
        });

        sock.on("error", (err) => {
            this.emit("error", err);
        });

        await new Promise<void>((resolve, reject) => {
            const onError = (err: Error) => {
                sock.removeListener("listening", onListening);
                reject(err);
            };
            const onListening = () => {
                sock.removeListener("error", onError);
                this.localUdpPort = sock.address().port;
                resolve();
            };
            sock.once("error", onError);
            sock.once("listening", onListening);
            sock.bind(this.options.localUdpPort);
        });

        return sock;
    }

    private async performUdpInitHandshake(isCaller: boolean): Promise<void> {
        const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
        const toUid = this.toUid32 || uidToUint32(this.partnerId);
        const isGroup = this.isGroupCallSession();
        const isVideo =
            this.callType === CallType.Video ||
            this.callType === CallType.GroupVideo ||
            Number(this.extendData?.callType) === 1;
        // Khớp với GroupCallController::_sendPacketInitCall (0x100297558) trên ZaloCall:
        // Group Call gửi headerCallId = 0, toUid = 0, flags = 4, subFlags = 0, extraData = [0x00, 0x05, isVideo, 0x01]
        const initPacket = buildInitCallRequest({
            isCaller,
            seqNum: 0,
            headerCallId: isGroup ? 0 : this.callId,
            callId: this.callId,
            fromUid,
            toUid: isGroup ? 0 : toUid,
            flags: isGroup ? 4 : 1,
            subFlags: isGroup ? 0 : toUid,
            sessId: this.sessId,
            extraData: isGroup ? Buffer.from([0x00, 0x05, isVideo ? 0x01 : 0x00, 0x01]) : undefined,
        });

        const timeoutMs = this.options.udpHandshakeTimeoutMs;

        await new Promise<void>((resolve) => {
            let settled = false;
            const retryInterval = setInterval(() => {
                if (!settled && this.udpSocket) {
                    void this.sendRawUdp(initPacket, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
                }
            }, 350);

            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                clearInterval(retryInterval);
                this.removeListener("zrtp_control", onControl);
                if (!this.routingToken) {
                    this.routingToken = this.callId >>> 0;
                }
                resolve();
            }, timeoutMs);

            const onControl = (pkt: ZRTPControlPacket) => {
                if (
                    pkt.isResponse &&
                    (pkt.cmd === ZRTPControlCommand.InitCallCaller || pkt.cmd === ZRTPControlCommand.InitCallCallee) &&
                    pkt.errorCode === 0 &&
                    pkt.routingToken
                ) {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    clearInterval(retryInterval);
                    this.removeListener("zrtp_control", onControl);
                    this.routingToken = pkt.routingToken >>> 0;
                    this.udpHandshakeVerified = true;
                    resolve();
                }
            };

            this.on("zrtp_control", onControl);
            void this.sendRawUdp(initPacket, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
        });
    }

    private startUdpPingLoop(): void {
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.startedAtMs = Date.now();

        const sendPing = () => {
            if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") return;
            const elapsed = Math.max(1, Date.now() - this.startedAtMs);
            const fromUid = this.fromUid32 || uidToUint32(this.api.getContext().uid);
            const toUid = this.toUid32 || uidToUint32(this.partnerId);
            const token = (this.routingToken || this.callId) >>> 0;
            const isGroup = this.isGroupCallSession();

            // 1. Gói RelayPing (cmd=2) tới máy chủ Relay kèm sessId
            if (this.sessId) {
                const relayPing = buildRelayPingRequest({
                    seqNum: 0,
                    callId: 0,
                    fromUid,
                    routingToken: token,
                    sessId: this.sessId,
                });
                void this.sendRawUdp(relayPing, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
            }

            // 2. Gói Ping (cmd=5) giữ NAT
            const pkt = buildPingRequest({
                seqNum: this.controlSeq++,
                callId: this.callId,
                fromUid,
                toUid: isGroup ? 0 : toUid,
                elapsedMs: elapsed,
            });
            void this.sendRawUdp(pkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});

            if (isGroup) {
                // Khớp với GroupCallController::_sendPacketInitZaviPing (0x100297fc4, cmd=51)
                const zaviPing = buildInitZaviPingRequest({
                    seqNum: 0,
                    callId: this.callId,
                    fromUid,
                    routingToken: token,
                    sessId: this.sessId,
                    subCmd: 1,
                });
                void this.sendRawUdp(zaviPing, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
                // Khớp với GroupCallController::_monitorCall (0x1001f9f3c–0x1001f9f60): gửi mỗi ~3 giây,
                // KHÔNG gửi lặp subCmd=7 (OnCamera) mỗi giây vì sẽ khiến máy nhận Zalo reset bộ giải mã của mình
                if (this.controlSeq === 1 || this.controlSeq % 3 === 0) {
                    void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
                    void this.sendGroupVideoQualityRequest().catch(() => {});
                }
            }

            // 3. Gói RequestForward Ping (cmd=32, subCmd=11) qua Relay tới máy đối phương
            const fwdPing = buildRequestForwardPacket({
                seqNum: 0,
                seqId: this.forwardPingSeq,
                fromUid,
                routingToken: token,
                subCmd: ZRTPForwardSubCommand.Ping,
                payload: String(elapsed),
            });
            void this.sendRawUdp(fwdPing, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});

            // 4. Gói RequestForward ManualControl / VideoControl (cmd=32, subCmd=10, 20-byte payload)
            // Cập nhật partnerRenderFps (15fps), partnerAudioRecvPktPerSec (50), partnerVideoRecvPktPerSec (30)
            // khớp với CallController::_sendPacketManualControl (0x100184664) & isPartnerRenderFpsLow (0x1001895dc)
            const isVideo =
                this.callType === CallType.Video ||
                this.callType === CallType.GroupVideo ||
                Number(this.extendData?.callType) === 1;
            const manualCtrlPayload = Buffer.alloc(20);
            manualCtrlPayload.writeInt32LE(isVideo ? 15 : 0, 0); // renderFps >= 3
            manualCtrlPayload.writeInt32LE(0, 4); // isReadyForHevcDec
            manualCtrlPayload.writeInt32LE(0, 8); // deviceOrientation
            manualCtrlPayload.writeInt32LE(50, 12); // audioRecvPktCountPerSec > 6
            manualCtrlPayload.writeInt32LE(isVideo ? 30 : 0, 16); // videoRecvPktCountPerSec
            const manualCtrlPkt = buildRequestForwardPacket({
                seqNum: 0,
                seqId: this.manualControlSeq++,
                fromUid,
                routingToken: token,
                subCmd: ZRTPForwardSubCommand.VideoControl,
                payload: manualCtrlPayload,
            });
            void this.sendRawUdp(manualCtrlPkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
        };

        sendPing();
        this.pingTimer = setInterval(sendPing, this.options.pingIntervalMs);
        if (typeof this.pingTimer.unref === "function") {
            this.pingTimer.unref();
        }
    }

    private markGroupPartnerRemoved(uidOrVoipId: string): number {
        const key = String(uidOrVoipId).trim();
        if (key) {
            this.removedGroupPartners.add(key);
            this.connectedGroupPartners.delete(key);
            const keyVoipNum = Number(key);
            if (Number.isFinite(keyVoipNum) && keyVoipNum > 0 && keyVoipNum <= 0xffffffff) {
                this.roomPartnerVoipUids.delete(keyVoipNum >>> 0);
            }
            const resolvedNoise = this.resolvePartnerId(key);
            if (resolvedNoise) {
                this.removedGroupPartners.add(resolvedNoise);
                this.connectedGroupPartners.delete(resolvedNoise);
            }
            const resolvedVoip = this.resolveVoipUid(key);
            if (resolvedVoip !== undefined) {
                this.removedGroupPartners.add(String(resolvedVoip));
                this.connectedGroupPartners.delete(String(resolvedVoip));
                this.roomPartnerVoipUids.delete(resolvedVoip >>> 0);
            }
            for (const item of this.groupPartnerInfo) {
                if (
                    item.id === key ||
                    item.id === resolvedNoise ||
                    (item.userId !== undefined && (String(item.userId) === key || item.userId === resolvedVoip))
                ) {
                    if (item.id) {
                        this.removedGroupPartners.add(String(item.id));
                        this.connectedGroupPartners.delete(String(item.id));
                    }
                    if (item.userId !== undefined) {
                        this.removedGroupPartners.add(String(item.userId));
                        this.connectedGroupPartners.delete(String(item.userId));
                        this.roomPartnerVoipUids.delete(Number(item.userId) >>> 0);
                    }
                }
            }
        }
        const localZaloUid = String(this.api.getContext().uid ?? "");
        if (this.groupPartnerInfo.length > 0) {
            const remoteInfos = this.groupPartnerInfo.filter(
                (item) =>
                    item.id !== localZaloUid &&
                    (item.userId === undefined || String(item.userId) !== this.localVoipUid),
            );
            if (remoteInfos.length === 0) return 0;
            return remoteInfos.filter(
                (item) =>
                    !this.removedGroupPartners.has(String(item.id)) &&
                    !(item.userId !== undefined && this.removedGroupPartners.has(String(item.userId))),
            ).length;
        }
        if (this.groupPartners.length > 0) {
            const remotePartners = this.groupPartners.filter(
                (p) => String(p) !== localZaloUid && String(p) !== this.localVoipUid,
            );
            if (remotePartners.length === 0) return 0;
            return remotePartners.filter((p) => !this.removedGroupPartners.has(String(p))).length;
        }
        return 0;
    }

    private startGroupPingLoop(): void {
        if (this.groupPingTimer) {
            clearInterval(this.groupPingTimer);
            this.groupPingTimer = null;
        }
        if (!this.groupId || !this.callId) return;

        const loopStartedAtMs = Date.now();
        const sendGroupPing = () => {
            if (this.state === "ended" || !this.groupId || !this.callId) return;
            const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
            const localUserIdTarget =
                this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
            void this.api.call
                .pingGroupCall(this.callId, {
                    hostCall: hostCallTarget,
                    userId: localUserIdTarget,
                    callState: this.getLocalGroupCallState(),
                    audioState: this.isMicMuted ? 1 : 0,
                    videoState: this.isCameraOn ? 0 : 1,
                })
                .then((res) => {
                    if (this.state === "ended") return;
                    const pingRecord = typeof res === "object" && res !== null ? (res as Record<string, unknown>) : {};
                    // Khớp với ZCallGroupInfo::receiveResponsePing (0x10012bcf8): nếu error != 0 thì kết thúc cuộc gọi ("ping fail")
                    if (pingRecord.error !== undefined && Number(pingRecord.error) !== 0) {
                        void this.endCall("remote_end").catch(() => {});
                        return;
                    }

                    this.mergeGroupPartnerMappings(res);
                    const pingDataObj = pingRecord.data !== undefined ? safeJsonParseRecord(pingRecord.data) : {};
                    const pingParamsObj =
                        pingRecord.params !== undefined
                            ? safeJsonParseRecord(pingRecord.params)
                            : pingDataObj.params !== undefined
                              ? safeJsonParseRecord(pingDataObj.params)
                              : {};
                    const pingPartners = safeJsonParseArray(
                        pingRecord.partnerInfo ?? pingDataObj.partnerInfo ?? pingParamsObj.partnerInfo,
                    );
                    const localZaloUid = String(this.api.getContext().uid ?? "");
                    const elapsedSinceStartMs = Date.now() - loopStartedAtMs;
                    const presentKeys = new Set<string>();
                    let lastRemainingCount: number | null = null;
                    let didMutatePartners = false;

                    if (pingPartners.length > 0) {
                        for (const p of pingPartners) {
                            const rawPid = String(p.userId ?? p.id ?? p.fromId ?? "").trim();
                            if (!rawPid) continue;
                            const resolvedPid = this.resolvePartnerId(rawPid) ?? rawPid;
                            presentKeys.add(rawPid);
                            presentKeys.add(resolvedPid);

                            if (
                                (this.localVoipUid && rawPid === this.localVoipUid) ||
                                (localZaloUid && (rawPid === localZaloUid || resolvedPid === localZaloUid))
                            ) {
                                continue;
                            }

                            const rawPState = p.state ?? p.callstate ?? p.callState;
                            const pState = rawPState !== undefined ? Number(rawPState) : 1;
                            // Trong ZCallGroupInfo::_processUpdatePing (0x10012b2cc):
                            // callState = 1 (Invited), 2 (Ringing), 3 (Answered / In-Call), >= 4 (Timeout / Left)
                            if (pState >= 4 || pState < 0) {
                                if (
                                    !this.removedGroupPartners.has(rawPid) &&
                                    !this.removedGroupPartners.has(resolvedPid)
                                ) {
                                    lastRemainingCount = this.markGroupPartnerRemoved(rawPid);
                                    didMutatePartners = true;
                                    this.emit("media_state_change", {
                                        isLocal: false,
                                        partnerId: resolvedPid,
                                        voipUid: rawPid,
                                        rawAct: "group_leave",
                                    });
                                }
                                continue;
                            }
                            if (pState === 0) {
                                // Thành viên chưa bắt máy quá 35s (hết chuông) -> tự động đánh dấu rời phòng
                                if (
                                    elapsedSinceStartMs >= 35_000 &&
                                    !this.removedGroupPartners.has(rawPid) &&
                                    !this.removedGroupPartners.has(resolvedPid)
                                ) {
                                    lastRemainingCount = this.markGroupPartnerRemoved(rawPid);
                                    didMutatePartners = true;
                                    this.emit("media_state_change", {
                                        isLocal: false,
                                        partnerId: resolvedPid,
                                        voipUid: rawPid,
                                        rawAct: "group_leave",
                                        reason: 408,
                                    });
                                }
                                continue;
                            }

                            this.removedGroupPartners.delete(rawPid);
                            this.removedGroupPartners.delete(resolvedPid);
                            this.connectedGroupPartners.add(rawPid);
                            this.connectedGroupPartners.add(resolvedPid);
                            const rawVoipNum = Number(p.userId ?? rawPid);
                            if (Number.isFinite(rawVoipNum) && rawVoipNum > 0 && rawVoipNum <= 0xffffffff) {
                                this.roomPartnerVoipUids.add(rawVoipNum >>> 0);
                            } else {
                                const mappedVoip = this.resolveVoipUid(resolvedPid);
                                if (mappedVoip) this.roomPartnerVoipUids.add(mappedVoip >>> 0);
                            }
                            const pAudio = p.audioState ?? p.audiostate;
                            const pVideo = p.videoState ?? p.videostate;
                            if (pAudio !== undefined || pVideo !== undefined) {
                                this.emit("media_state_change", {
                                    isLocal: false,
                                    partnerId: resolvedPid,
                                    voipUid: rawPid,
                                    isCameraOn: pVideo !== undefined ? Number(pVideo) === 0 : undefined,
                                    isMicMuted: pAudio !== undefined ? Number(pAudio) !== 0 : undefined,
                                    rawAct: "group_ping",
                                });
                            }
                        }
                        if (this.roomPartnerVoipUids.size > 0) {
                            void this.sendGroupVideoQualityRequest().catch(() => {});
                        }
                    }

                    // Kiểm tra những thành viên đã từng tham gia nhưng biến mất khỏi partnerInfo của pingGroupCall,
                    // hoặc thành viên được mời nhưng sau 35s vẫn chưa từng bắt máy (kể cả khi pingGroupCall trả về partnerInfo rỗng)
                    for (const item of this.groupPartnerInfo) {
                        const itemId = String(item.id ?? "").trim();
                        const itemVoipStr = item.userId !== undefined ? String(item.userId) : "";
                        if (
                            (localZaloUid && itemId === localZaloUid) ||
                            (this.localVoipUid && (itemId === this.localVoipUid || itemVoipStr === this.localVoipUid))
                        ) {
                            continue;
                        }
                        const isAlreadyRemoved =
                            (itemId && this.removedGroupPartners.has(itemId)) ||
                            (itemVoipStr && this.removedGroupPartners.has(itemVoipStr));
                        if (isAlreadyRemoved) continue;

                        const isPresent =
                            (itemId && presentKeys.has(itemId)) || (itemVoipStr && presentKeys.has(itemVoipStr));
                        const wasConnected =
                            (itemId && this.connectedGroupPartners.has(itemId)) ||
                            (itemVoipStr && this.connectedGroupPartners.has(itemVoipStr));

                        const shouldRemove =
                            pingPartners.length > 0
                                ? !isPresent && (wasConnected || elapsedSinceStartMs >= 35_000)
                                : !wasConnected && elapsedSinceStartMs >= 35_000;

                        if (shouldRemove) {
                            lastRemainingCount = this.markGroupPartnerRemoved(itemId || itemVoipStr);
                            didMutatePartners = true;
                            this.emit("media_state_change", {
                                isLocal: false,
                                partnerId: itemId || itemVoipStr,
                                voipUid: itemVoipStr || undefined,
                                rawAct: "group_leave",
                                ...(wasConnected ? {} : { reason: 408 }),
                            });
                        }
                    }

                    if (pingPartners.length > 0 || didMutatePartners) {
                        this.emit("group_partner_sync", this.getGroupPartnerInfo());
                    }
                    if (lastRemainingCount === 0) {
                        void this.endCall("remote_end").catch(() => {});
                    }
                })
                .catch(() => {});
        };

        const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
        const localUserIdTarget = this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
        void this.api.call
            .broadcastGroupCallState(this.callId, {
                hostCall: hostCallTarget,
                userId: localUserIdTarget,
                callState: this.getLocalGroupCallState(),
                audioState: this.isMicMuted ? 1 : 0,
                videoState: this.isCameraOn ? 0 : 1,
            })
            .catch(() => {});
        sendGroupPing();

        this.groupPingTimer = setInterval(sendGroupPing, 10000);
        if (typeof this.groupPingTimer.unref === "function") {
            this.groupPingTimer.unref();
        }
    }

    private startMediaKeepaliveLoop(): void {
        this.stopMediaKeepaliveLoop();
        if (!this.options.autoKeepaliveMedia) return;

        // 1. Luồng Audio RTP 20ms (50 gói/giây) thoả mãn audio_recheck_sock (checkPkgRec >= 14 / 2s)
        this.audioKeepaliveTimer = setInterval(() => {
            if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") return;
            if (Date.now() - this.lastExternalAudioSentAtMs >= 18) {
                void this.sendAudioFrame(OPUS_SILENCE_20MS_FRAME, { isKeepalive: true }).catch(() => {});
            }
        }, 20);
        if (typeof this.audioKeepaliveTimer.unref === "function") {
            this.audioKeepaliveTimer.unref();
        }

        // 2. Nếu là cuộc gọi Video: chỉ gửi H264_KEEPALIVE_ANNEXB_FRAME khi KHÔNG có camera ngoài gửi frame!
        // Đặc biệt khi vừa bắt đầu cuộc gọi (localSpsNal === null), chờ tối thiểu 2500ms để bộ mã hoá camera thật
        // kịp khởi tạo và gửi SPS/PPS 640x480 đầu tiên, tuyệt đối không bắn sớm gói 16x16 ở 66ms làm hỏng VideoToolbox iOS.
        const isVideo =
            this.callType === CallType.Video ||
            this.callType === CallType.GroupVideo ||
            Number(this.extendData?.callType) === 1;
        if (isVideo) {
            this.videoKeepaliveTimer = setInterval(() => {
                if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") return;
                if (!this.isCameraOn) return;
                const idleThresholdMs = this.localSpsNal ? 1000 : 2500;
                if (Date.now() - this.lastExternalVideoSentAtMs >= idleThresholdMs) {
                    void this.sendH264AnnexBFrame(H264_KEEPALIVE_ANNEXB_FRAME, {
                        timestampStep: 6000,
                        isKeepalive: true,
                    }).catch(() => {});
                }
            }, 66);
            if (typeof this.videoKeepaliveTimer.unref === "function") {
                this.videoKeepaliveTimer.unref();
            }
        }

        // 3. Báo cáo RTCP Sender Report + Receiver Report + SDES mỗi 500ms (thoả mãn durationCheckNoReportSec: 4)
        const sendPeriodicRtcp = () => {
            if (!this.udpSocket || this.rtpEndpoint.port <= 0 || this.state === "ended") return;
            const audioRtcp = this.buildCompoundRtcpReport(false);
            void this.sendRtcp(audioRtcp, false).catch(() => {});

            const activeVideo =
                this.callType === CallType.Video ||
                this.callType === CallType.GroupVideo ||
                Number(this.extendData?.callType) === 1;
            if (activeVideo) {
                const videoRtcp = this.buildCompoundRtcpReport(true);
                void this.sendRtcp(videoRtcp, true).catch(() => {});
                if (this.videoAssemblers.size > 0) {
                    for (const asm of this.videoAssemblers.values()) {
                        if (asm.ssrc !== 0 && !asm.remoteSpsNal) {
                            void this.sendRtcpPli(asm.ssrc).catch(() => {});
                        }
                    }
                } else if (this.remoteVideoSsrc !== 0 && !this.remoteSpsNal) {
                    void this.sendRtcpPli(this.remoteVideoSsrc).catch(() => {});
                }
            }
        };
        sendPeriodicRtcp();
        this.rtcpTimer = setInterval(sendPeriodicRtcp, 500);
        if (typeof this.rtcpTimer.unref === "function") {
            this.rtcpTimer.unref();
        }
    }

    private stopMediaKeepaliveLoop(): void {
        if (this.audioKeepaliveTimer) {
            clearInterval(this.audioKeepaliveTimer);
            this.audioKeepaliveTimer = null;
        }
        if (this.videoKeepaliveTimer) {
            clearInterval(this.videoKeepaliveTimer);
            this.videoKeepaliveTimer = null;
        }
        if (this.rtcpTimer) {
            clearInterval(this.rtcpTimer);
            this.rtcpTimer = null;
        }
    }

    private buildCompoundRtcpReport(isVideo: boolean): Buffer {
        const nowMs = Date.now();
        const ntpSec = (Math.floor(nowMs / 1000) + 2208988800) >>> 0;
        const ntpFrac = Math.floor(((nowMs % 1000) / 1000) * 0x100000000) >>> 0;
        const nowMiddleNtp = (((ntpSec & 0xffff) << 16) | ((ntpFrac >>> 16) & 0xffff)) >>> 0;

        const localSsrc = isVideo ? this.getLocalVideoSsrc() : this.getLocalAudioSsrc();
        const rtpTs = isVideo ? this.videoTimestamp : this.audioTimestamp;
        const pktCount = isVideo ? this.videoPacketCount : this.audioPacketCount;
        const octCount = isVideo ? this.videoOctetCount : this.audioOctetCount;

        interface RtcpReportBlockEntry {
            ssrc: number;
            maxSeq: number;
            cycles: number;
            lastSrMiddleNtp: number;
            lastSrAtMs: number;
        }
        const reportBlocks: RtcpReportBlockEntry[] = [];
        if (isVideo) {
            for (const asm of this.videoAssemblers.values()) {
                if (asm.ssrc !== 0 && reportBlocks.length < 31) {
                    reportBlocks.push({
                        ssrc: asm.ssrc >>> 0,
                        maxSeq: asm.maxSeq,
                        cycles: asm.seqCycles,
                        lastSrMiddleNtp: asm.lastSrMiddleNtp,
                        lastSrAtMs: asm.lastSrReceivedAtMs,
                    });
                }
            }
            if (reportBlocks.length === 0 && this.remoteVideoSsrc !== 0) {
                reportBlocks.push({
                    ssrc: this.remoteVideoSsrc >>> 0,
                    maxSeq: this.remoteVideoMaxSeq,
                    cycles: this.remoteVideoSeqCycles,
                    lastSrMiddleNtp: this.lastRemoteVideoSrMiddleNtp,
                    lastSrAtMs: this.lastRemoteVideoSrReceivedAtMs,
                });
            }
        } else if (this.remoteAudioSsrc !== 0) {
            reportBlocks.push({
                ssrc: this.remoteAudioSsrc >>> 0,
                maxSeq: this.remoteAudioMaxSeq,
                cycles: this.remoteAudioSeqCycles,
                lastSrMiddleNtp: this.lastRemoteAudioSrMiddleNtp,
                lastSrAtMs: this.lastRemoteAudioSrReceivedAtMs,
            });
        }

        const rc = reportBlocks.length;
        const srLenBytes = 28 + rc * 24;
        const sdesLenBytes = 16;
        const rembSsrcs = isVideo ? reportBlocks.map((b) => b.ssrc) : [];
        const rembLenBytes = rembSsrcs.length > 0 ? 20 + rembSsrcs.length * 4 : 0;
        const buf = Buffer.alloc(srLenBytes + sdesLenBytes + rembLenBytes);

        // RTCP Sender Report (PT = 200)
        buf.writeUInt8((0x80 | (rc & 0x1f)) >>> 0, 0);
        buf.writeUInt8(200, 1);
        buf.writeUInt16BE(srLenBytes / 4 - 1, 2);
        buf.writeUInt32BE(localSsrc >>> 0, 4);
        buf.writeUInt32BE(ntpSec, 8);
        buf.writeUInt32BE(ntpFrac, 12);
        buf.writeUInt32BE(rtpTs >>> 0, 16);
        buf.writeUInt32BE(pktCount >>> 0, 20);
        buf.writeUInt32BE(octCount >>> 0, 24);

        for (let i = 0; i < rc; i++) {
            const rb = reportBlocks[i];
            const rbOffset = 28 + i * 24;
            const extMaxSeq = (((rb.cycles & 0xffff) << 16) | (rb.maxSeq & 0xffff)) >>> 0;
            const lsr = rb.lastSrMiddleNtp !== 0 ? rb.lastSrMiddleNtp >>> 0 : (nowMiddleNtp - 1638) >>> 0; // Fallback 25ms ago
            const dlsr =
                rb.lastSrAtMs > 0 && rb.lastSrMiddleNtp !== 0
                    ? Math.max(65, Math.floor(((nowMs - rb.lastSrAtMs) / 1000) * 65536)) >>> 0
                    : 1638; // 25ms in 1/65536s units so RTT is ~25ms (1 <= rtt < 9999)
            buf.writeUInt32BE(rb.ssrc >>> 0, rbOffset);
            buf.writeUInt32BE(0, rbOffset + 4); // fractionLost = 0, cumulativeLost = 0
            buf.writeUInt32BE(extMaxSeq, rbOffset + 8);
            buf.writeUInt32BE(10, rbOffset + 12); // interarrival jitter
            buf.writeUInt32BE(lsr, rbOffset + 16);
            buf.writeUInt32BE(dlsr, rbOffset + 20);
        }

        // RTCP SDES (PT = 202)
        const sdesOffset = srLenBytes;
        buf.writeUInt8(0x81, sdesOffset);
        buf.writeUInt8(202, sdesOffset + 1);
        buf.writeUInt16BE(3, sdesOffset + 2);
        buf.writeUInt32BE(localSsrc >>> 0, sdesOffset + 4);
        buf.writeUInt8(1, sdesOffset + 8); // CNAME
        buf.writeUInt8(5, sdesOffset + 9);
        buf.write("zcajs", sdesOffset + 10, "ascii");
        buf.writeUInt8(0, sdesOffset + 15);

        // RTCP REMB (PT = 206, FMT = 15, 'R' 'E' 'M' 'B', ~1.46 Mbps) cho tất cả Video SSRC đang hoạt động
        if (rembLenBytes > 0) {
            const rembOffset = srLenBytes + sdesLenBytes;
            buf.writeUInt8(0x8f, rembOffset); // V=2, P=0, FMT=15
            buf.writeUInt8(206, rembOffset + 1); // PT=206 (PSFB)
            buf.writeUInt16BE(rembLenBytes / 4 - 1, rembOffset + 2);
            buf.writeUInt32BE(localSsrc >>> 0, rembOffset + 4);
            buf.writeUInt32BE(0, rembOffset + 8);
            buf.write("REMB", rembOffset + 12, "ascii");
            buf.writeUInt8(rembSsrcs.length, rembOffset + 16); // numSsrcs
            // brExp = 3, brMantissa = 183105 (0x2cb41) => 183105 << 3 = 1,464,840 bps
            buf.writeUInt8(0x0e, rembOffset + 17);
            buf.writeUInt8(0xcb, rembOffset + 18);
            buf.writeUInt8(0x41, rembOffset + 19);
            for (let i = 0; i < rembSsrcs.length; i++) {
                buf.writeUInt32BE(rembSsrcs[i] >>> 0, rembOffset + 20 + i * 4);
            }
        }

        return buf;
    }

    private markCallActiveFromPartnerTraffic(): void {
        this.hasReceivedPartnerMedia = true;
        if (this.state === "ringing" || this.state === "handshaking_udp") {
            this.setState("active");
            if (this.isCaller && this.partnerId && this.callId > 0 && !this.groupId && !this.hasSentAnswerAck) {
                this.hasSentAnswerAck = true;
                void this.api.call.answerAckVoiceCall(this.partnerId, this.callId).catch(() => {});
            }
            if (
                this.callType === CallType.Video ||
                this.callType === CallType.GroupVideo ||
                Number(this.extendData?.callType) === 1
            ) {
                void this.sendCameraState(this.isCameraOn).catch(() => {});
                if (!this.isCameraOn && this.partnerId && this.callId > 0 && !this.groupId) {
                    void this.api.call
                        .updateCallMediaState(this.partnerId, this.callId, {
                            isOnCam: 0,
                            isOnMic: -1,
                            data: "",
                        })
                        .catch(() => {});
                }
                void this.sendRtcpPli().catch(() => {});
            }
            const params = this.getConnectionParams();
            this.emit("connection_params", params);
            this.emit("active", params);
        }
    }

    private handleIncomingUdpPacket(msg: Buffer): void {
        const parsed = parseZRTPPacket(msg);
        this.emit("zrtp_packet", parsed);

        if (parsed.family === "control") {
            if (
                parsed.isResponse &&
                (parsed.cmd === ZRTPControlCommand.InitCallCaller ||
                    parsed.cmd === ZRTPControlCommand.InitCallCallee) &&
                parsed.routingToken
            ) {
                this.routingToken = parsed.routingToken >>> 0;
            } else if (
                parsed.cmd === ZRTPControlCommand.EndCall &&
                (this.state === "ringing" || this.state === "active")
            ) {
                this.emit("zrtp_control", parsed);
                void this.endCall("remote_end");
                return;
            } else if (
                !parsed.isResponse &&
                parsed.cmd === ZRTPControlCommand.Ping &&
                this.udpSocket &&
                this.rtpEndpoint.port > 0
            ) {
                const resp = buildPingResponse({
                    seqNum: parsed.seqNum,
                    callId: parsed.headerCallId || this.callId,
                    fromUid: parsed.toUid,
                    toUid: parsed.fromUid,
                    elapsedMs: parsed.pingString ?? "0",
                });
                void this.sendRawUdp(resp, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
            } else if (parsed.cmd === ZRTPControlCommand.ZaviRoomUpdated) {
                // Khớp với GroupCallController::_handlePacketZaviRoomUpdated (0x10029a85c, cmd=50):
                // SFU gửi danh sách 32-bit VoIP UID của các thành viên đang kết nối trong phòng Zavi.
                this.markCallActiveFromPartnerTraffic();
                const roomUids = parsed.roomPartnerUids ?? [];
                for (const uid32 of roomUids) {
                    if (uid32 > 0 && uid32 !== this.fromUid32) {
                        const normalizedUid32 = uid32 >>> 0;
                        this.roomPartnerVoipUids.add(normalizedUid32);
                        const voipStr = String(normalizedUid32);
                        this.connectedGroupPartners.add(voipStr);
                        this.removedGroupPartners.delete(voipStr);
                        const resolvedPid = this.resolvePartnerId(normalizedUid32);
                        if (resolvedPid) {
                            this.connectedGroupPartners.add(resolvedPid);
                            this.removedGroupPartners.delete(resolvedPid);
                        }
                        const existingIdx = this.groupPartnerInfo.findIndex(
                            (p) => p.userId === normalizedUid32 || p.id === resolvedPid || p.id === voipStr,
                        );
                        if (existingIdx >= 0) {
                            this.groupPartnerInfo[existingIdx] = {
                                ...this.groupPartnerInfo[existingIdx],
                                userId: normalizedUid32,
                            };
                        } else {
                            this.groupPartnerInfo.push({
                                id: resolvedPid ?? voipStr,
                                userId: normalizedUid32,
                                name: "",
                                avatar: "",
                            });
                        }
                    }
                }
                this.emit("group_partner_sync", this.getGroupPartnerInfo());
                const syncZaviRoomState = (isFollowUp = false) => {
                    if (this.state === "ended") return;
                    if (!isFollowUp && this.groupId && this.callId > 0) {
                        const hostCallTarget = this.hostCall || this.partnerId || this.groupId;
                        const localUserIdTarget =
                            this.localVoipUid || (this.fromUid32 ? String(this.fromUid32) : "") || hostCallTarget;
                        void this.api?.call
                            ?.pingGroupCall?.(this.callId, {
                                hostCall: hostCallTarget,
                                userId: localUserIdTarget,
                                callState: this.getLocalGroupCallState(),
                                audioState: this.isMicMuted ? 1 : 0,
                                videoState: this.isCameraOn ? 0 : 1,
                            })
                            ?.catch(() => {});
                        void this.api?.call
                            ?.broadcastGroupCallState?.(this.callId, {
                                hostCall: hostCallTarget,
                                userId: localUserIdTarget,
                                callState: this.getLocalGroupCallState(),
                                audioState: this.isMicMuted ? 1 : 0,
                                videoState: this.isCameraOn ? 0 : 1,
                            })
                            ?.catch(() => {});
                    }
                    if (!isFollowUp) {
                        void this.sendMicState(!this.isMicMuted).catch(() => {});
                        void this.sendCameraState(this.isCameraOn).catch(() => {});
                    }
                    void this.sendGroupVideoQualityBitrateConfig().catch(() => {});
                    void this.sendGroupVideoQualityRequest().catch(() => {});
                    void this.sendRtcpPli().catch(() => {});
                    this.resendCachedLocalKeyframe(true);
                };
                syncZaviRoomState(false);
                const zaviSyncT1 = setTimeout(() => syncZaviRoomState(true), 450);
                zaviSyncT1.unref?.();
            } else if (!parsed.isResponse && parsed.cmd === ZRTPControlCommand.AudioCodec) {
                // Khớp với _sendPacketAudioCodec (cmd=1, codecType=9 MUTE / codecType=3 OPUS)
                this.markCallActiveFromPartnerTraffic();
                const senderUid32 = parsed.fromUid >>> 0;
                if (
                    this.isGroupCallSession() &&
                    (senderUid32 === 0 || (this.fromUid32 !== 0 && senderUid32 === this.fromUid32))
                ) {
                    this.emit("zrtp_control", parsed);
                    return;
                }
                if (parsed.audioCodecType === 9 || parsed.audioCodecType === 3) {
                    const resolvedSenderPartnerId =
                        senderUid32 > 0 ? this.resolvePartnerId(senderUid32) : this.partnerId || undefined;
                    this.emit("media_state_change", {
                        isLocal: false,
                        partnerId: resolvedSenderPartnerId,
                        voipUid: senderUid32 > 0 ? String(senderUid32) : undefined,
                        isMicMuted: parsed.audioCodecType === 9,
                        rawAct: parsed.audioCodecType === 9 ? "udp_audio_codec_mute" : "udp_audio_codec_unmute",
                    });
                }
            } else if (
                !parsed.isResponse &&
                parsed.cmd === ZRTPControlCommand.RequestForward &&
                this.udpSocket &&
                this.rtpEndpoint.port > 0
            ) {
                this.markCallActiveFromPartnerTraffic();
                if (parsed.flags === ZRTPForwardSubCommand.Ping) {
                    const pongPkt = buildRequestForwardPacket({
                        seqNum: 0,
                        seqId: parsed.headerCallId,
                        fromUid: this.fromUid32 || uidToUint32(this.api.getContext().uid),
                        routingToken: (this.routingToken || this.callId) >>> 0,
                        subCmd: ZRTPForwardSubCommand.Pong,
                        payload: parsed.forwardPayload ?? Buffer.alloc(0),
                    });
                    void this.sendRawUdp(pongPkt, this.rtpEndpoint.host, this.rtpEndpoint.port).catch(() => {});
                } else if (parsed.flags === ZRTPForwardSubCommand.Pong) {
                    if (parsed.headerCallId === this.forwardPingSeq) {
                        this.forwardPingSeq = (this.forwardPingSeq + 1) >>> 0;
                    }
                } else if (
                    parsed.flags === ZRTPForwardSubCommand.VideoQualityBitrateConfig ||
                    parsed.flags === ZRTPForwardSubCommand.VideoQualityRequest
                ) {
                    const senderUid32 = parsed.fromUid >>> 0;
                    if (this.isGroupCallSession() && senderUid32 > 0 && senderUid32 !== this.fromUid32) {
                        this.removedGroupPartners.delete(String(senderUid32));
                        const resolvedPid = this.resolvePartnerId(senderUid32);
                        if (resolvedPid) this.removedGroupPartners.delete(resolvedPid);
                        const wasKnown = this.roomPartnerVoipUids.has(senderUid32);
                        this.roomPartnerVoipUids.add(senderUid32);
                        let qualityChanged = !wasKnown;
                        if (
                            parsed.flags === ZRTPForwardSubCommand.VideoQualityBitrateConfig &&
                            parsed.videoQualityConfigs &&
                            parsed.videoQualityConfigs.length > 0
                        ) {
                            const nextIds = parsed.videoQualityConfigs.map((c) => c.qualityId);
                            const prevIds = this.partnerVideoQualityIds.get(senderUid32);
                            if (
                                !prevIds ||
                                prevIds.length !== nextIds.length ||
                                prevIds.some((id, idx) => id !== nextIds[idx])
                            ) {
                                qualityChanged = true;
                            }
                            this.partnerVideoQualityIds.set(senderUid32, nextIds);
                        }
                        if (qualityChanged) {
                            void this.sendGroupVideoQualityRequest().catch(() => {});
                        }
                    }
                    if (parsed.flags === ZRTPForwardSubCommand.VideoQualityRequest) {
                        const localVoipNum = Number(this.localVoipUid) >>> 0;
                        if (parsed.videoQualityRequests && parsed.videoQualityRequests.length > 0) {
                            for (const req of parsed.videoQualityRequests) {
                                if (
                                    (req.partnerUid === this.fromUid32 ||
                                        (localVoipNum > 0 && req.partnerUid === localVoipNum) ||
                                        req.partnerUid === 0) &&
                                    req.qualityId >= 0 &&
                                    req.qualityId < 16
                                ) {
                                    this.requestedLocalVideoQualityId = req.qualityId;
                                }
                            }
                        }
                        this.resendCachedLocalKeyframe(true);
                    }
                } else if (
                    parsed.flags === ZRTPForwardSubCommand.OnCamera ||
                    parsed.flags === ZRTPForwardSubCommand.OffCamera ||
                    parsed.flags === ZRTPForwardSubCommand.OffCameraCallKit ||
                    parsed.flags === ZRTPForwardSubCommand.PartnerSuspendVideo
                ) {
                    const senderUid32 = parsed.fromUid >>> 0;
                    const isGroup = this.isGroupCallSession();
                    // Trong cuộc gọi nhóm, bỏ qua các gói RequestForward không rõ nguồn (fromUid=0) hoặc dội lại từ chính mình
                    if (isGroup && (senderUid32 === 0 || (this.fromUid32 !== 0 && senderUid32 === this.fromUid32))) {
                        this.emit("zrtp_control", parsed);
                        return;
                    }
                    const resolvedSenderPartnerId =
                        senderUid32 > 0 ? this.resolvePartnerId(senderUid32) : this.partnerId || undefined;
                    // Trong Group Call, subCmd=9 là ShareScreen (bật chia sẻ màn hình), còn trong 1-1 subCmd=9 là OffCameraCallKit
                    const isGroupShareScreen = isGroup && parsed.flags === ZRTPForwardSubCommand.ShareScreen;
                    const isCamOn = parsed.flags === ZRTPForwardSubCommand.OnCamera || isGroupShareScreen;
                    if (isGroup && senderUid32 > 0) {
                        const senderAsm = this.videoAssemblers.get(senderUid32);
                        if (senderAsm) {
                            senderAsm.fuaFragments = [];
                            senderAsm.currentAccessUnitNals = [];
                            senderAsm.currentAccessUnitTs = -1;
                            senderAsm.currentAccessUnitHasIdr = false;
                        }
                    } else {
                        this.clearIncomingVideoAssemblyBuffers();
                    }
                    if (isCamOn) {
                        if (this.callType === CallType.Audio) {
                            this.callType = CallType.Video;
                            this.startMediaKeepaliveLoop();
                        } else if (this.callType === CallType.GroupAudio) {
                            this.callType = CallType.GroupVideo;
                            this.startMediaKeepaliveLoop();
                        }
                        if (isGroup && senderUid32 > 0) {
                            this.roomPartnerVoipUids.add(senderUid32);
                            void this.sendGroupVideoQualityRequest().catch(() => {});
                        }
                        void this.sendRtcpPli(senderUid32 || undefined).catch(() => {});
                        this.resendCachedLocalKeyframe();
                        const t = setTimeout(() => {
                            if (this.state === "active") {
                                void this.sendRtcpPli(senderUid32 || undefined).catch(() => {});
                            }
                        }, 250);
                        if (typeof t.unref === "function") t.unref();
                    }
                    this.emit("media_state_change", {
                        isLocal: false,
                        partnerId: resolvedSenderPartnerId,
                        voipUid: senderUid32 > 0 ? String(senderUid32) : undefined,
                        isCameraOn: isCamOn,
                        ...(isGroupShareScreen ? { isScreenSharing: true } : {}),
                        callType: this.callType,
                        rawAct: isGroupShareScreen
                            ? "udp_share_screen"
                            : isCamOn
                              ? "udp_on_camera"
                              : parsed.flags === ZRTPForwardSubCommand.OffCameraCallKit
                                ? "udp_off_camera_callkit"
                                : parsed.flags === ZRTPForwardSubCommand.PartnerSuspendVideo
                                  ? "udp_partner_suspend_video"
                                  : "udp_off_camera",
                    });
                } else if (
                    parsed.flags === ZRTPForwardSubCommand.OnMic ||
                    parsed.flags === ZRTPForwardSubCommand.OffMic
                ) {
                    const senderUid32 = parsed.fromUid >>> 0;
                    if (
                        this.isGroupCallSession() &&
                        (senderUid32 === 0 || (this.fromUid32 !== 0 && senderUid32 === this.fromUid32))
                    ) {
                        this.emit("zrtp_control", parsed);
                        return;
                    }
                    const resolvedSenderPartnerId =
                        senderUid32 > 0 ? this.resolvePartnerId(senderUid32) : this.partnerId || undefined;
                    this.emit("media_state_change", {
                        isLocal: false,
                        partnerId: resolvedSenderPartnerId,
                        voipUid: senderUid32 > 0 ? String(senderUid32) : undefined,
                        isMicMuted: parsed.flags === ZRTPForwardSubCommand.OffMic,
                        rawAct: parsed.flags === ZRTPForwardSubCommand.OnMic ? "udp_on_mic" : "udp_off_mic",
                    });
                }
            }
            this.emit("zrtp_control", parsed);
            return;
        }

        if (parsed.family === "legacy_media" || parsed.family === "zrtc_media") {
            this.markCallActiveFromPartnerTraffic();
            try {
                if (parsed.isRtcp) {
                    let rawRtcp = parsed.rtpPayload;
                    if (!this.isGroupCallSession() && this.srtpSession && Number(this.extendData?.srtcp) === 1) {
                        try {
                            rawRtcp = this.srtpSession.unprotectRtcp(parsed.rtpPayload);
                        } catch {
                            rawRtcp = parsed.rtpPayload;
                        }
                    }
                    // Quét toàn bộ các sub-packet trong gói Compound RTCP để tìm Sender Report (PT=200) và PLI/FIR/NACK (PT=206/205)
                    let rtcpOffset = 0;
                    while (rtcpOffset + 8 <= rawRtcp.length) {
                        const fmt = rawRtcp.readUInt8(rtcpOffset) & 0x1f;
                        const pt = rawRtcp.readUInt8(rtcpOffset + 1);
                        const lenWords = rawRtcp.readUInt16BE(rtcpOffset + 2);
                        const pktBytes = (lenWords + 1) * 4;
                        if (pt === 200 && rtcpOffset + 28 <= rawRtcp.length) {
                            const srSsrc = rawRtcp.readUInt32BE(rtcpOffset + 4);
                            const middleNtp = rawRtcp.readUInt32BE(rtcpOffset + 10);
                            if (parsed.isVideo) {
                                if (!this.remoteVideoSsrc) this.remoteVideoSsrc = srSsrc;
                                this.lastRemoteVideoSrMiddleNtp = middleNtp;
                                this.lastRemoteVideoSrReceivedAtMs = Date.now();
                                if (srSsrc !== 0) {
                                    const asm = this.getOrCreateVideoAssembler(srSsrc);
                                    asm.lastSrMiddleNtp = middleNtp;
                                    asm.lastSrReceivedAtMs = this.lastRemoteVideoSrReceivedAtMs;
                                }
                            } else {
                                if (!this.remoteAudioSsrc) this.remoteAudioSsrc = srSsrc;
                                this.lastRemoteAudioSrMiddleNtp = middleNtp;
                                this.lastRemoteAudioSrReceivedAtMs = Date.now();
                            }
                        } else if (
                            parsed.isVideo &&
                            ((pt === 206 && (fmt === 1 || fmt === 4)) || (pt === 205 && fmt === 1))
                        ) {
                            this.resendCachedLocalKeyframe(false);
                        }
                        if (pktBytes <= 0) break;
                        rtcpOffset += pktBytes;
                    }
                    this.emit("rtcp_packet", {
                        isVideo: parsed.isVideo,
                        rtcpPacket: rawRtcp,
                        zrtpPacket: parsed,
                    });
                } else {
                    let rawRtp = parsed.rtpPayload;
                    const activeSrtp = parsed.isVideo ? this.srtpSession : (this.audioSrtpSession ?? this.srtpSession);
                    if (activeSrtp) {
                        try {
                            rawRtp = activeSrtp.unprotectRtp(parsed.rtpPayload);
                        } catch {
                            rawRtp = parsed.rtpPayload;
                        }
                    }
                    const parsedRtp = parseRtpPacket(rawRtp);
                    // Khớp với GroupCallController::_incomingDataPacket (0x10029a9a8):
                    // Trong Group Call qua SFU Zavi, nếu csrcCount > 0 thì CSRC[0] (parsedRtp.senderUid) là 32-bit VoIP UID thực của người gửi.
                    const isGroup = this.isGroupCallSession();
                    const effectiveSenderSsrc =
                        (isGroup ? parsedRtp.senderUid || parsedRtp.ssrc : parsedRtp.ssrc) >>> 0;
                    if (
                        isGroup &&
                        effectiveSenderSsrc > 0 &&
                        effectiveSenderSsrc !== this.fromUid32 &&
                        !this.roomPartnerVoipUids.has(effectiveSenderSsrc)
                    ) {
                        this.roomPartnerVoipUids.add(effectiveSenderSsrc);
                        void this.sendGroupVideoQualityRequest().catch(() => {});
                    }
                    if (parsed.isVideo) {
                        if (isZaloVideoPayloadType(parsedRtp.payloadType)) {
                            this.remoteVideoSsrc = effectiveSenderSsrc;
                            if (
                                parsedRtp.sequenceNumber < this.remoteVideoMaxSeq &&
                                this.remoteVideoMaxSeq - parsedRtp.sequenceNumber > 30000
                            ) {
                                this.remoteVideoSeqCycles++;
                            }
                            this.remoteVideoMaxSeq = parsedRtp.sequenceNumber;
                            const asm = this.getOrCreateVideoAssembler(effectiveSenderSsrc);
                            if (
                                parsedRtp.sequenceNumber < asm.maxSeq &&
                                asm.maxSeq - parsedRtp.sequenceNumber > 30000
                            ) {
                                asm.seqCycles++;
                            }
                            asm.maxSeq = parsedRtp.sequenceNumber;
                        }
                    } else {
                        this.remoteAudioSsrc = effectiveSenderSsrc;
                        if (
                            parsedRtp.sequenceNumber < this.remoteAudioMaxSeq &&
                            this.remoteAudioMaxSeq - parsedRtp.sequenceNumber > 30000
                        ) {
                            this.remoteAudioSeqCycles++;
                        }
                        this.remoteAudioMaxSeq = parsedRtp.sequenceNumber;
                    }

                    this.emit("rtp_packet", {
                        isVideo: parsed.isVideo,
                        isFec: parsed.isFec,
                        rtpPacket: rawRtp,
                        parsedRtp,
                        zrtpPacket: parsed,
                    });

                    const resolvedRtpPartnerId = this.resolvePartnerId(effectiveSenderSsrc);
                    if (!parsed.isVideo && !parsed.isFec) {
                        this.emit("audio_frame", {
                            payload: parsedRtp.payload,
                            sequenceNumber: parsedRtp.sequenceNumber,
                            timestamp: parsedRtp.timestamp,
                            ssrc: effectiveSenderSsrc,
                            partnerId: resolvedRtpPartnerId,
                            payloadType: parsedRtp.payloadType,
                            marker: parsedRtp.marker,
                        });
                    } else if (parsed.isVideo && !parsed.isFec && isZaloVideoPayloadType(parsedRtp.payloadType)) {
                        this.emit("video_frame", {
                            payload: parsedRtp.payload,
                            sequenceNumber: parsedRtp.sequenceNumber,
                            timestamp: parsedRtp.timestamp,
                            ssrc: effectiveSenderSsrc,
                            partnerId: resolvedRtpPartnerId,
                            payloadType: parsedRtp.payloadType,
                            marker: parsedRtp.marker,
                        });
                        this.handleIncomingVideoRtpPayload(parsedRtp, effectiveSenderSsrc);
                    }
                }
            } catch (err) {
                if (this.listenerCount("error") > 0) {
                    this.emit("error", err);
                }
            }
        }
    }

    private handleIncomingVideoRtpPayload(parsedRtp: ParsedRtpPacket, senderSsrcOverride?: number): void {
        const payload = parsedRtp.payload;
        // Bỏ qua ngay các gói RTP padding rỗng (P=1) để không làm flush nhầm frame đang ghép
        if (!payload || payload.length < 1) return;
        // Khi máy đối phương gửi đồng thời nhiều lớp Simulcast Spatial (ví dụ spatialId=0 320x240 và spatialId=1 640x480),
        // chỉ ghép lớp có độ phân giải mục tiêu (spatialId === maxSpatialId) để không bị trộn 2 luồng H.264 khác nhau cùng SSRC
        if (
            this.isGroupCallSession() &&
            parsedRtp.sfuExt &&
            parsedRtp.sfuExt.spatialId !== parsedRtp.sfuExt.maxSpatialId
        ) {
            return;
        }

        const effectiveSsrc =
            (senderSsrcOverride !== undefined
                ? senderSsrcOverride
                : this.isGroupCallSession()
                  ? parsedRtp.senderUid || parsedRtp.ssrc
                  : parsedRtp.ssrc) >>> 0;
        const asm = this.getOrCreateVideoAssembler(effectiveSsrc);
        if (
            parsedRtp.sequenceNumber !== 0 &&
            parsedRtp.sequenceNumber === asm.lastRtpSeq &&
            parsedRtp.timestamp === asm.lastRtpTs
        ) {
            return;
        }
        asm.lastRtpSeq = parsedRtp.sequenceNumber;
        asm.lastRtpTs = parsedRtp.timestamp;

        if (asm.currentAccessUnitTs !== -1 && parsedRtp.timestamp !== asm.currentAccessUnitTs) {
            this.flushIncomingAccessUnit(asm, asm.currentAccessUnitTs, effectiveSsrc);
            asm.currentAccessUnitNals = [];
            asm.currentAccessUnitHasIdr = false;
            asm.fuaFragments = [];
        }
        asm.currentAccessUnitTs = parsedRtp.timestamp;
        this.currentAccessUnitTs = parsedRtp.timestamp;

        if (isZaloKeyframePayloadType(parsedRtp.payloadType)) {
            asm.currentAccessUnitHasIdr = true;
            this.currentAccessUnitHasIdr = true;
        }

        // Trường hợp 1: Payload đã bắt đầu trực tiếp bằng Annex-B start code (00 00 00 01 hoặc 00 00 01)
        if (startsWithAnnexBStartCode(payload)) {
            for (const nal of splitAnnexBNals(payload)) {
                this.recordIncomingNal(asm, nal);
            }
            if (parsedRtp.marker) {
                this.flushIncomingAccessUnit(asm, parsedRtp.timestamp, effectiveSsrc);
            }
            return;
        }

        const nalHeader = payload[0];
        const nalType = nalHeader & 0x1f;

        if (nalType === 0) {
            // Khi g_nalHeaderSize == 0 trên iOS, NextAggregatePacket (0x1003db3a4) ghi trực tiếp
            // [uint16BE len1][00 00 00 01 SPS][uint16BE len2][00 00 00 01 PPS] tại offset 0
            const agg = tryParseAggregatedNals(payload, 0);
            if (agg) {
                for (const chunk of agg) {
                    for (const nal of splitAnnexBNals(chunk)) {
                        this.recordIncomingNal(asm, nal);
                    }
                }
            } else {
                for (const nal of splitAnnexBNals(payload)) {
                    this.recordIncomingNal(asm, nal);
                }
            }
        } else if (nalType >= 1 && nalType <= 23) {
            for (const nal of splitAnnexBNals(payload)) {
                this.recordIncomingNal(asm, nal);
            }
        } else if (nalType === 24) {
            // RFC 6184 STAP-A (Single-Time Aggregation Packet)
            const agg = tryParseAggregatedNals(payload, 1);
            if (agg) {
                for (const chunk of agg) {
                    for (const nal of splitAnnexBNals(chunk)) {
                        this.recordIncomingNal(asm, nal);
                    }
                }
            } else {
                let offset = 1;
                while (offset + 2 <= payload.length) {
                    const nalSize = payload.readUInt16BE(offset);
                    offset += 2;
                    if (nalSize > 0 && offset + nalSize <= payload.length) {
                        for (const nal of splitAnnexBNals(payload.subarray(offset, offset + nalSize))) {
                            this.recordIncomingNal(asm, nal);
                        }
                    }
                    offset += nalSize;
                }
            }
        } else if ((nalType === 28 || nalType === 29) && payload.length >= 2) {
            // RFC 6184 FU-A (28) / FU-B (29) + Zalo ZRTP FU-A (origNalType = 0 với Annex-B bên trong)
            const fuIndicator = payload[0];
            const fuHeader = payload[1];
            const isStart = (fuHeader & 0x80) !== 0;
            const isEnd = (fuHeader & 0x40) !== 0;
            const origNalType = fuHeader & 0x1f;
            const reconstructedNalHeader = (fuIndicator & 0xe0) | origNalType;
            const headerSize = nalType === 29 ? 4 : 2;

            if (payload.length > headerSize) {
                const body = payload.subarray(headerSize);
                if (isStart) {
                    // Nếu origNalType === 0 hoặc body đã bắt đầu bằng Annex-B start code (00 00 00 01 / 00 00 01),
                    // TUYỆT ĐỐI KHÔNG chèn thêm byte 0x00 vào đầu để không biến 00 00 00 01 thành 5 byte!
                    if (origNalType === 0 || startsWithAnnexBStartCode(body)) {
                        asm.fuaFragments = [body];
                    } else {
                        asm.fuaFragments = [Buffer.from([reconstructedNalHeader]), body];
                    }
                } else if (asm.fuaFragments.length > 0) {
                    if (asm.fuaFragments.length >= 512) {
                        asm.fuaFragments = [];
                    } else {
                        asm.fuaFragments.push(body);
                    }
                }

                if (isEnd && asm.fuaFragments.length > 0) {
                    const fullNal = Buffer.concat(asm.fuaFragments);
                    asm.fuaFragments = [];
                    for (const nal of splitAnnexBNals(fullNal)) {
                        this.recordIncomingNal(asm, nal);
                    }
                }
            }
        }

        if (parsedRtp.marker) {
            this.flushIncomingAccessUnit(asm, parsedRtp.timestamp, effectiveSsrc);
        }
    }

    private recordIncomingNal(asm: SsrcVideoAssembler, rawNal: Buffer): void {
        if (!rawNal || rawNal.length === 0) return;
        const nal = stripLeadingAnnexBStartCode(rawNal);
        if (!nal || nal.length === 0) return;

        const nalType = nal[0] & 0x1f;
        // Bỏ qua NAL rỗng (type=0) hoặc Access Unit Delimiter (AUD, type=9)
        if (nalType === 0 || nalType === 9) return;

        if (nalType === 7) {
            const spsCopy = Buffer.from(nal);
            asm.remoteSpsNal = spsCopy;
            this.remoteSpsNal = spsCopy;
        } else if (nalType === 8) {
            const ppsCopy = Buffer.from(nal);
            asm.remotePpsNal = ppsCopy;
            this.remotePpsNal = ppsCopy;
        } else if (nalType === 5) {
            asm.currentAccessUnitHasIdr = true;
            this.currentAccessUnitHasIdr = true;
        }
        if (asm.currentAccessUnitNals.length >= 256) {
            asm.currentAccessUnitNals = [];
        }
        asm.currentAccessUnitNals.push(Buffer.from(nal));
    }

    private flushIncomingAccessUnit(asm: SsrcVideoAssembler, timestamp: number, ssrc: number): void {
        if (asm.currentAccessUnitNals.length === 0) return;
        const startCode = Buffer.from([0x00, 0x00, 0x00, 0x01]);
        const chunks: Buffer[] = [];
        const nalTypes = asm.currentAccessUnitNals.map((n) => n[0] & 0x1f);

        const hasInlineSps = nalTypes.includes(7);
        const hasInlinePps = nalTypes.includes(8);
        const hasIdrSlice = nalTypes.includes(5);
        const hasVclSlice = nalTypes.some((t) => t === 1 || t === 5);

        // Nếu chỉ mới nhận SPS/PPS mà chưa có slice hình ảnh (IDR/P-slice), giữ lại cho gói tiếp theo
        if (!hasVclSlice) {
            return;
        }

        const hasSpsPps = (hasInlineSps || Boolean(asm.remoteSpsNal)) && (hasInlinePps || Boolean(asm.remotePpsNal));
        const isKeyframe = hasIdrSlice && hasSpsPps;

        if (hasIdrSlice) {
            if (!hasInlineSps && asm.remoteSpsNal) {
                chunks.push(startCode, asm.remoteSpsNal);
            }
            if (!hasInlinePps && asm.remotePpsNal) {
                chunks.push(startCode, asm.remotePpsNal);
            }
        }

        for (const nal of asm.currentAccessUnitNals) {
            chunks.push(startCode, nal);
        }

        const annexB = Buffer.concat(chunks);
        asm.currentAccessUnitNals = [];
        asm.currentAccessUnitHasIdr = false;
        asm.currentAccessUnitTs = -1;

        // Không phát khung Delta (P-slice) về bộ giải mã trước khi nhận được ít nhất 1 Keyframe hoàn chỉnh (SPS+PPS+IDR)
        if (!isKeyframe && !asm.hasEmittedKeyframe) {
            void this.sendRtcpPli(ssrc).catch(() => {});
            return;
        }
        if (isKeyframe) {
            asm.hasEmittedKeyframe = true;
        }

        const resolvedPartnerId = this.resolvePartnerId(ssrc);
        if (this.isGroupCallSession() && ssrc > 0 && ssrc !== this.fromUid32) {
            const partnerEntry = this.groupPartnerInfo.find(
                (p) =>
                    (resolvedPartnerId && p.id === resolvedPartnerId) ||
                    (p.userId !== undefined && Number(p.userId) >>> 0 === ssrc),
            );
            if (partnerEntry && partnerEntry.videoState !== 0) {
                partnerEntry.videoState = 0;
                if (!partnerEntry.state || Number(partnerEntry.state) < 3) {
                    partnerEntry.state = 3;
                }
                this.emit("group_partner_sync", this.groupPartnerInfo);
                this.emit("media_state_change", {
                    isLocal: false,
                    partnerId: partnerEntry.id || resolvedPartnerId,
                    voipUid: String(ssrc),
                    isCameraOn: true,
                    rawAct: "rtp_video_active",
                });
            }
        }

        this.emit("video_annexb_frame", {
            annexB,
            isKeyframe,
            timestamp,
            ssrc,
            partnerId: resolvedPartnerId,
            sps: asm.remoteSpsNal ?? undefined,
            pps: asm.remotePpsNal ?? undefined,
            nalTypes,
        });
    }

    private attachCallEventListener(): void {
        if (this.boundCallEventListener) return;
        this.boundCallEventListener = (event: CallEvent) => {
            void this.handleCallEvent(event);
        };
        try {
            this.api.listener.on("call_event", this.boundCallEventListener);
        } catch {
            // Listener might not be initialized if cookie/userAgent is missing in unit test mocks
        }
    }

    private detachCallEventListener(): void {
        if (!this.boundCallEventListener) return;
        try {
            this.api.listener.removeListener("call_event", this.boundCallEventListener);
        } catch {
            // Ignore
        }
        this.boundCallEventListener = undefined;
    }

    private cleanupResources(): void {
        if (this.ringingTimeoutTimer) {
            clearTimeout(this.ringingTimeoutTimer);
            this.ringingTimeoutTimer = null;
        }
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.groupPingTimer) {
            clearInterval(this.groupPingTimer);
            this.groupPingTimer = null;
        }
        this.stopMediaKeepaliveLoop();
        this.detachCallEventListener();
        if (this.udpSocket) {
            try {
                this.udpSocket.removeAllListeners();
                this.udpSocket.close();
            } catch {
                // Ignore
            }
            this.udpSocket = null;
        }
    }

    private sendRawUdp(buf: Buffer, host: string, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.udpSocket) {
                reject(new ZaloApiError("UDP socket is not open"));
                return;
            }
            this.udpSocket.send(buf, port, host, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
