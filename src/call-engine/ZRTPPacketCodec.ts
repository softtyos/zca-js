import { Buffer } from "node:buffer";

/**
 * Các mã lệnh điều khiển UDP trong `zrtc::ZRTPPacket` (`_buildPacketInternal` @ `0x10015830c`)
 */
export enum ZRTPControlCommand {
    RelayPing = 2,
    EndCall = 3,
    Ping = 5,
    InitCallCaller = 11,
    InitCallCallee = 12,
    RequestForward = 32,
    InitZaviPing = 51,
}

/**
 * Sub-command cho gói tin điều khiển `RequestForward` (`cmd = 32` / `0x0020`, `byte[20]`)
 * dùng để Ping/Pong kiểm tra kết nối 2 chiều qua máy chủ Relay và điều khiển Audio/Video.
 */
export enum ZRTPForwardSubCommand {
    OnMic = 5,
    OffMic = 6,
    OnCamera = 7,
    OffCamera = 8,
    OffCameraCallKit = 9,
    VideoControl = 10,
    Ping = 11,
    Pong = 16,
    PartnerSuspendVideo = 17,
}

/**
 * Loại gói tin Media qua máy chủ Relay:
 * - Gửi đi (5-byte header `[type(1B)] + [routingToken(4B LE)] + [RTP/RTCP]`): `{3, 5, 7, 13, 15}`
 * - Nhận về từ Relay (1-byte header `[type(1B)] + [RTP]`): `{4, 7, 14}`
 * - Nhận về RTCP từ Relay (5-byte header `[type(1B)] + [routingToken(4B LE)] + [RTCP]`): `{5, 15}`
 */
export enum ZRTPLegacyMediaType {
    AudioRtp = 3,
    IncomingAudioRtp = 4,
    AudioRtcp = 5,
    AudioFec = 7,
    VideoRtp = 13,
    IncomingVideoRtp = 14,
    VideoRtcp = 15,
}

/**
 * Sub-command cho gói tin ZRTC Multiplexed Media (`byte[0] == 0x7f`, 9-byte header)
 */
export enum ZRTCMediaSubCommand {
    P2PPingRequest = 1,
    P2PPingResponse = 2,
    P2PInitCaller = 3,
    P2PInitCallee = 4,
    AudioRtp = 6,
    AudioRtcp = 7,
    VideoRtp = 8,
    VideoRtcp = 9,
    AudioFec = 10,
}

export enum ZRTCRole {
    Caller = 0,
    Callee = 1,
}

export type ZRTPInitCallRequestOptions = {
    isCaller?: boolean;
    seqNum?: number;
    headerCallId?: number;
    callId: number;
    fromUid?: number;
    toUid?: number;
    flags?: number;
    subFlags?: number;
    sessId: string;
    zrtcConfig?: string;
};

export type ZRTPInitCallResponseOptions = {
    isCaller?: boolean;
    seqNum?: number;
    headerCallId?: number;
    callId: number;
    fromUid?: number;
    toUid?: number;
    flags?: number;
    errorCode?: number;
    routingToken: number;
    sessId: string;
};

export type ZRTPPingRequestOptions = {
    seqNum: number;
    callId: number;
    fromUid?: number;
    toUid?: number;
    elapsedMs: number | string;
    minByteLength?: number;
};

export type ZRTPRelayPingRequestOptions = {
    seqNum?: number;
    callId?: number;
    fromUid: number;
    routingToken: number;
    sessId: string;
};

export type ZRTPRequestForwardOptions = {
    seqNum?: number;
    seqId: number;
    fromUid: number;
    routingToken: number;
    subCmd: ZRTPForwardSubCommand | number;
    payload?: string | Buffer;
};

export type ZRTPEchoRequestOptions = {
    seqNum: number;
    callId: number;
    fromUid?: number;
    toUid?: number;
    token: number;
};

export type ZRTPEndCallRequestOptions = {
    seqNum?: number;
    callId: number;
    fromUid?: number;
    toUid?: number;
    routingToken?: number;
    flags?: number;
};

export type ZRTPControlPacket = {
    family: "control";
    isResponse: boolean;
    packetType: 1 | 2;
    subType: number;
    seqNum: number;
    headerCallId: number;
    fromUid: number;
    toUid: number;
    cmd: number;
    flags: number;
    callId?: number;
    subFlags?: number;
    errorCode?: number;
    routingToken?: number;
    sessId?: string;
    zrtcConfig?: string;
    pingString?: string;
    forwardPayload?: Buffer;
    echoToken?: number;
    rawBody: Buffer;
};

export type ZRTPLegacyMediaPacket = {
    family: "legacy_media";
    mediaType: ZRTPLegacyMediaType;
    isVideo: boolean;
    isRtcp: boolean;
    isFec: boolean;
    routingId: number;
    rtpPayload: Buffer;
};

export type ZRTCMultiplexedMediaPacket = {
    family: "zrtc_media";
    version: number;
    role: ZRTCRole;
    routingToken: number;
    subCmd: ZRTCMediaSubCommand;
    isVideo: boolean;
    isRtcp: boolean;
    isFec: boolean;
    rtpPayload: Buffer;
};

export type ZRTCP2PPacket = {
    family: "zrtc_p2p";
    version: number;
    role: ZRTCRole;
    routingToken: number;
    subCmd: number;
    seqNum: number;
    callId: number;
    payload: Buffer;
};

export type ZRTPRawPacket = {
    family: "raw";
    raw: Buffer;
};

export type ParsedZRTPPacket =
    | ZRTPControlPacket
    | ZRTPLegacyMediaPacket
    | ZRTCMultiplexedMediaPacket
    | ZRTCP2PPacket
    | ZRTPRawPacket;

/**
 * Chuỗi codec Opus chuẩn được `ZaloCall` tạo trong `sendSignal 416`
 */
export const DEFAULT_ZALO_AUDIO_CODEC = JSON.stringify([
    {
        dynamicFptime: 0,
        frmPtime: 20,
        name: "opus/16000/1",
        payload: 112,
    },
]);

/**
 * Chuỗi codec Audio + Video H264 chuẩn cho cuộc gọi Video
 */
export const DEFAULT_ZALO_VIDEO_CODEC = JSON.stringify([
    {
        dynamicFptime: 0,
        frmPtime: 20,
        name: "opus/16000/1",
        payload: 112,
    },
]);

export type ZrtcExtendDataOptions = {
    rtpAddress: string;
    rtcpAddress: string;
    isVideo?: boolean;
    srtpMode?: number;
    srtpKey?: string;
    platform?: number;
    packetMode?: number;
};

/**
 * Tạo cấu trúc `extendData` chuẩn xác theo `ZaloCall` (`sendSignal 416` / `answer 402`).
 */
export function buildZrtcExtendData(options: ZrtcExtendDataOptions): Record<string, unknown> {
    const rtp = options.rtpAddress;
    const rtcp = options.rtcpAddress || options.rtpAddress;
    const isVideo = Boolean(options.isVideo);

    const extend: Record<string, unknown> = {
        callType: isVideo ? 1 : 0,
        fecTP: 0,
        gccAudio: 0,
        gccEarlyCall: 0,
        gccMode: 0,
        gccSVLR: 0,
        maxFT: 120,
        newZrtc: 1,
        packetMode: options.packetMode ?? 2,
        platform: options.platform ?? 2,
        sP2P: 0,
        serverAddr: [
            {
                rtcp,
                rtcpIPv6: `::FFFF:${rtcp}`,
                rtp,
                rtpIPv6: `::FFFF:${rtp}`,
                tpType: 0,
            },
        ],
        spTcp: 0,
        srtcp: 0,
        srtpMode: options.srtpMode ?? 0,
        supportCallBusy: 0,
        supportHevcDecode: 0,
        tpType: 0,
    };

    if (options.srtpKey) {
        extend.srtpKey = options.srtpKey;
    }

    // Khớp với CallController::getExtendData (0x10016871c): luôn đính kèm danh sách codec video
    // để phiên gọi có thể nâng cấp Thoại ➔ Video hoặc bật/tắt Camera giữa cuộc gọi.
    extend.video = {
        codec: [{ name: "h264", payload: 97 }],
    };

    return extend;
}

/**
 * Rút gọn UID 64-bit dạng chuỗi của Zalo về `uint32` dùng trong header `ZRTPPacket`
 */
export function uidToUint32(uid: string | number | undefined): number {
    if (uid === undefined || uid === null || uid === "") return 0;
    if (typeof uid === "number") return uid >>> 0;
    try {
        return Number(BigInt(uid) & 0xffffffffn) >>> 0;
    } catch {
        return (Number.parseInt(uid, 10) || 0) >>> 0;
    }
}

function writeControlHeader(
    buf: Buffer,
    packetType: 1 | 2,
    subType: number,
    seqNum: number,
    headerCallId: number,
    fromUid: number,
    toUid: number,
    cmd: number,
    flags: number,
): void {
    buf.writeUInt8(packetType, 0);
    buf.writeUInt8(subType & 0xff, 1);
    buf.writeUInt32LE(seqNum >>> 0, 2);
    buf.writeUInt32LE(headerCallId >>> 0, 6);
    buf.writeUInt32LE(fromUid >>> 0, 10);
    buf.writeUInt32LE(toUid >>> 0, 14);
    buf.writeUInt16LE(cmd & 0xffff, 18);
    buf.writeUInt8(flags & 0xff, 20);
}

/**
 * Đóng gói gói tin UDP `InitCall` (`0x01 0x7e`, `cmd = 11` cho Caller hoặc `12` cho Callee)
 * gửi tới máy chủ `rtpaddr` của Zalo (`zrtc::ZRTPPacket::_buildPacketInternal` @ `0x10015830c`).
 */
export function buildInitCallRequest(options: ZRTPInitCallRequestOptions): Buffer {
    const isCaller = options.isCaller ?? true;
    const cmd = isCaller ? ZRTPControlCommand.InitCallCaller : ZRTPControlCommand.InitCallCallee;
    const seqNum = options.seqNum ?? 0;
    const headerCallId = options.headerCallId ?? options.callId ?? 0;
    const fromUid = options.fromUid ?? 0;
    const toUid = options.toUid ?? 0;
    const flags = options.flags ?? 1;
    const subFlags = options.subFlags ?? toUid;

    const sessBytes = Buffer.from(options.sessId, "utf-8");
    const cfgBytes = options.zrtcConfig ? Buffer.from(options.zrtcConfig, "utf-8") : undefined;

    const totalLen = 21 + 4 + 4 + 2 + sessBytes.length + (cfgBytes ? 2 + cfgBytes.length : 0);
    const buf = Buffer.alloc(totalLen);

    writeControlHeader(buf, 1, 0x7e, seqNum, headerCallId, fromUid, toUid, cmd, flags);
    buf.writeUInt32LE(options.callId >>> 0, 21);
    buf.writeUInt32LE(subFlags >>> 0, 25);
    buf.writeUInt16LE(sessBytes.length, 29);
    sessBytes.copy(buf, 31);

    if (cfgBytes) {
        const offset = 31 + sessBytes.length;
        buf.writeUInt16LE(cfgBytes.length, offset);
        cfgBytes.copy(buf, offset + 2);
    }

    return buf;
}

/**
 * Đóng gói gói tin UDP phản hồi `InitCall` (`0x02 0x7e`, `cmd = 11 | 12`)
 * khớp chính xác với `zrtc::ZRTPPacket::_parsePacketInternal` (`0x100158db8`)
 * và `zrtc::CallController` (`0x100177920`).
 */
export function buildInitCallResponse(options: ZRTPInitCallResponseOptions): Buffer {
    const isCaller = options.isCaller ?? true;
    const cmd = isCaller ? ZRTPControlCommand.InitCallCaller : ZRTPControlCommand.InitCallCallee;
    const seqNum = options.seqNum ?? 0;
    const headerCallId = options.headerCallId ?? 0;
    const fromUid = options.fromUid ?? 0;
    const toUid = options.toUid ?? 0;
    const flags = options.flags ?? 1;
    const errorCode = options.errorCode ?? 0;
    const routingToken = (options.routingToken >>> 0) || 1;

    const sessBytes = Buffer.from(options.sessId, "utf-8");
    const buf = Buffer.alloc(35 + sessBytes.length);

    writeControlHeader(buf, 2, 0x7e, seqNum, headerCallId, fromUid, toUid, cmd, flags);
    buf.writeUInt32LE(errorCode >>> 0, 21);
    buf.writeUInt32LE(options.callId >>> 0, 25);
    buf.writeUInt32LE(routingToken, 29);
    buf.writeUInt16LE(sessBytes.length, 33);
    sessBytes.copy(buf, 35);

    return buf;
}

/**
 * Đóng gói gói tin UDP `Ping` (`0x01 0x01`, `cmd = 5`) gửi định kỳ tới máy chủ relay của Zalo.
 */
export function buildPingRequest(options: ZRTPPingRequestOptions): Buffer {
    const elapsedBytes = Buffer.from(String(options.elapsedMs), "utf-8");
    const minLen = options.minByteLength ?? 40;
    const rawLen = 21 + 2 + elapsedBytes.length;
    const buf = Buffer.alloc(Math.max(rawLen, minLen));

    writeControlHeader(
        buf,
        1,
        0x01,
        options.seqNum,
        options.callId,
        options.fromUid ?? 0,
        options.toUid ?? 0,
        ZRTPControlCommand.Ping,
        0x01,
    );
    buf.writeUInt16LE(elapsedBytes.length, 21);
    elapsedBytes.copy(buf, 23);

    return buf;
}

/**
 * Đóng gói gói tin UDP phản hồi `Ping` (`0x02 0x01`, `cmd = 5`).
 */
export function buildPingResponse(options: ZRTPPingRequestOptions & { errorCode?: number }): Buffer {
    const elapsedBytes = Buffer.from(String(options.elapsedMs), "utf-8");
    const buf = Buffer.alloc(21 + 4 + 2 + elapsedBytes.length);

    writeControlHeader(
        buf,
        2,
        0x01,
        options.seqNum,
        options.callId,
        options.fromUid ?? 0,
        options.toUid ?? 0,
        ZRTPControlCommand.Ping,
        0x01,
    );
    buf.writeUInt32LE((options.errorCode ?? 0) >>> 0, 21);
    buf.writeUInt16LE(elapsedBytes.length, 25);
    elapsedBytes.copy(buf, 27);

    return buf;
}

/**
 * Đóng gói gói tin UDP `RequestPing` (`0x01 0x01`, `cmd = 2`) gửi tới máy chủ Relay Zalo
 * (`zrtc::ZRTPPacket::initZRTPPacketRequestPing` @ `0x100157b88`).
 */
export function buildRelayPingRequest(options: ZRTPRelayPingRequestOptions): Buffer {
    const sessBytes = Buffer.from(options.sessId, "utf-8");
    const buf = Buffer.alloc(21 + 2 + sessBytes.length);

    writeControlHeader(
        buf,
        1,
        0x01,
        options.seqNum ?? 0,
        options.callId ?? 0,
        options.fromUid >>> 0,
        options.routingToken >>> 0,
        ZRTPControlCommand.RelayPing,
        0x01,
    );
    buf.writeUInt16LE(sessBytes.length, 21);
    sessBytes.copy(buf, 23);

    return buf;
}

/**
 * Đóng gói gói tin UDP `RequestForward` (`0x01 0x01`, `cmd = 32` / `0x0020`)
 * dùng cho Ping (`subCmd = 11`) / Pong (`subCmd = 16`) giữa 2 đầu qua máy chủ Relay
 * (`zrtc::ZRTPPacket::initZRTPPacketRequestForward` @ `0x100157c4c`).
 */
export function buildRequestForwardPacket(options: ZRTPRequestForwardOptions): Buffer {
    const payloadBuf =
        options.payload === undefined
            ? Buffer.alloc(0)
            : Buffer.isBuffer(options.payload)
              ? options.payload
              : Buffer.from(options.payload, "utf-8");

    const buf = Buffer.alloc(21 + 4 + payloadBuf.length);
    writeControlHeader(
        buf,
        1,
        0x01,
        options.seqNum ?? 0,
        options.seqId >>> 0,
        options.fromUid >>> 0,
        options.routingToken >>> 0,
        ZRTPControlCommand.RequestForward,
        options.subCmd & 0xff,
    );
    buf.writeUInt32LE(payloadBuf.length >>> 0, 21);
    if (payloadBuf.length > 0) {
        payloadBuf.copy(buf, 25);
    }

    return buf;
}

/**
 * Đóng gói gói tin UDP `Echo` (`cmd = 3`)
 */
export function buildEchoRequest(options: ZRTPEchoRequestOptions): Buffer {
    const buf = Buffer.alloc(25);
    writeControlHeader(
        buf,
        1,
        0x01,
        options.seqNum,
        options.callId,
        options.fromUid ?? 0,
        options.toUid ?? 0,
        ZRTPControlCommand.EndCall,
        0x01,
    );
    buf.writeUInt32LE(options.token >>> 0, 21);
    return buf;
}

/**
 * Đóng gói gói tin UDP `RequestEndCall` (`0x01 0x7e`, `cmd = 3`, 25 bytes)
 * khớp với `zrtc::ZRTPPacket::initZRTPPacketRequestEndCall` (`0x100157b44`)
 * và `_buildPacketInternal` (`0x10015830c`).
 */
export function buildEndCallRequest(options: ZRTPEndCallRequestOptions): Buffer {
    const buf = Buffer.alloc(25);
    const routingOrTo = (options.routingToken ?? options.toUid ?? 0) >>> 0;
    writeControlHeader(
        buf,
        1,
        0x7e,
        options.seqNum ?? 0,
        0,
        options.fromUid ?? 0,
        routingOrTo,
        ZRTPControlCommand.EndCall,
        options.flags ?? 0,
    );
    buf.writeUInt32LE(options.callId >>> 0, 21);
    return buf;
}

/**
 * Bọc gói tin chuẩn WebRTC RTP/RTCP/SRTP vào khung 5-byte Legacy Media của Zalo
 * (`byte[0]` in `{3, 5, 7, 13, 15}` + `routingId` 4B LE).
 */
export function wrapLegacyMediaPacket(
    mediaType: ZRTPLegacyMediaType,
    routingId: number,
    rtpOrRtcpPayload: Buffer,
): Buffer {
    const out = Buffer.allocUnsafe(5 + rtpOrRtcpPayload.length);
    out.writeUInt8(mediaType, 0);
    out.writeUInt32LE(routingId >>> 0, 1);
    rtpOrRtcpPayload.copy(out, 5);
    return out;
}

/**
 * Bọc gói tin chuẩn WebRTC RTP/RTCP/SRTP vào khung 9-byte ZRTC Multiplexed Media (`0x7f`)
 * (`[0x7f, 0x00, role, routingToken(4B LE), subCmd(2B LE)] + [RTP/RTCP]`).
 */
export function wrapZrtcMediaPacket(
    subCmd: ZRTCMediaSubCommand,
    routingToken: number,
    rtpOrRtcpPayload: Buffer,
    role: ZRTCRole = ZRTCRole.Caller,
): Buffer {
    const out = Buffer.allocUnsafe(9 + rtpOrRtcpPayload.length);
    out.writeUInt8(0x7f, 0);
    out.writeUInt8(0x00, 1);
    out.writeUInt8(role & 0xff, 2);
    out.writeUInt32LE(routingToken >>> 0, 3);
    out.writeUInt16LE(subCmd & 0xffff, 7);
    rtpOrRtcpPayload.copy(out, 9);
    return out;
}

/**
 * Giải mã bất kỳ gói tin UDP `ZRTPPacket` nào nhận được từ máy chủ Relay Zalo hoặc Peer
 * (`zrtc::ZRTPPacket::_parsePacketInternal` @ `0x1001589e8`).
 */
export function parseZRTPPacket(buf: Buffer): ParsedZRTPPacket {
    if (!buf || buf.length < 5) {
        return { family: "raw", raw: buf ?? Buffer.alloc(0) };
    }

    const firstByte = buf.readUInt8(0);

    // 1. Gói tin điều khiển / bắt tay (0x01 = Request, 0x02 = Response)
    if ((firstByte === 1 || firstByte === 2) && buf.length >= 21) {
        const packetType = firstByte as 1 | 2;
        const isResponse = packetType === 2;
        const subType = buf.readUInt8(1);
        const seqNum = buf.readUInt32LE(2);
        const headerCallId = buf.readUInt32LE(6);
        const fromUid = buf.readUInt32LE(10);
        const toUid = buf.readUInt32LE(14);
        const cmd = buf.readUInt16LE(18);
        const flags = buf.readUInt8(20);
        const rawBody = buf.subarray(21);

        const packet: ZRTPControlPacket = {
            family: "control",
            isResponse,
            packetType,
            subType,
            seqNum,
            headerCallId,
            fromUid,
            toUid,
            cmd,
            flags,
            rawBody,
        };

        if (cmd === ZRTPControlCommand.InitCallCaller || cmd === ZRTPControlCommand.InitCallCallee) {
            if (!isResponse && flags !== 6 && buf.length >= 31) {
                packet.callId = buf.readUInt32LE(21);
                packet.subFlags = buf.readUInt32LE(25);
                const sessLen = buf.readUInt16LE(29);
                const sessEnd = Math.min(31 + sessLen, buf.length);
                packet.sessId = buf.subarray(31, sessEnd).toString("utf-8");
                if (buf.length >= sessEnd + 2) {
                    const cfgLen = buf.readUInt16LE(sessEnd);
                    const cfgEnd = Math.min(sessEnd + 2 + cfgLen, buf.length);
                    if (cfgLen > 0) {
                        packet.zrtcConfig = buf.subarray(sessEnd + 2, cfgEnd).toString("utf-8");
                    }
                }
            } else if (isResponse && buf.length >= 25) {
                packet.errorCode = buf.readInt32LE(21);
                if (buf.length >= 33) {
                    packet.callId = buf.readUInt32LE(25);
                    packet.routingToken = buf.readUInt32LE(29);
                }
                if (buf.length >= 35) {
                    const sessLen = buf.readUInt16LE(33);
                    const sessEnd = Math.min(35 + sessLen, buf.length);
                    packet.sessId = buf.subarray(35, sessEnd).toString("utf-8");
                }
            }
        } else if (cmd === ZRTPControlCommand.RelayPing) {
            if (!isResponse && buf.length >= 23) {
                const sessLen = buf.readUInt16LE(21);
                const sessEnd = Math.min(23 + sessLen, buf.length);
                packet.sessId = buf.subarray(23, sessEnd).toString("utf-8");
            } else if (isResponse && buf.length >= 25) {
                packet.errorCode = buf.readInt32LE(21);
                if (buf.length >= 27) {
                    const sessLen = buf.readUInt16LE(25);
                    const sessEnd = Math.min(27 + sessLen, buf.length);
                    packet.sessId = buf.subarray(27, sessEnd).toString("utf-8");
                }
            }
        } else if (cmd === ZRTPControlCommand.Ping) {
            if (!isResponse && buf.length >= 23) {
                const strLen = buf.readUInt16LE(21);
                const strEnd = Math.min(23 + strLen, buf.length);
                packet.pingString = buf.subarray(23, strEnd).toString("utf-8");
            } else if (isResponse && buf.length >= 25) {
                packet.errorCode = buf.readUInt32LE(21);
                if (buf.length >= 27) {
                    const strLen = buf.readUInt16LE(25);
                    const strEnd = Math.min(27 + strLen, buf.length);
                    packet.pingString = buf.subarray(27, strEnd).toString("utf-8");
                }
            }
        } else if (cmd === ZRTPControlCommand.RequestForward) {
            if (!isResponse && buf.length >= 25) {
                const payloadLen = buf.readUInt32LE(21);
                const payloadEnd = Math.min(25 + payloadLen, buf.length);
                packet.forwardPayload = buf.subarray(25, payloadEnd);
            } else if (!isResponse) {
                packet.forwardPayload = buf.subarray(21);
            } else if (isResponse && buf.length >= 25) {
                packet.errorCode = buf.readInt32LE(21);
            }
        } else if (cmd === ZRTPControlCommand.EndCall) {
            if (!isResponse && buf.length >= 25) {
                const val = buf.readUInt32LE(21);
                packet.callId = val;
                packet.echoToken = val;
            } else if (isResponse && buf.length >= 25) {
                packet.errorCode = buf.readInt32LE(21);
                if (buf.length >= 29) {
                    packet.echoToken = buf.readUInt32LE(25);
                }
            }
        }

        return packet;
    }

    // 2a. Gói tin Relay Media nhận về từ máy chủ Zalo (1-byte header: type in {4, 14})
    // (`zrtc::ZRTPPacket::_parsePacketInternal` @ `0x100158a1c`, mask `0x4090`)
    if (
        (firstByte === ZRTPLegacyMediaType.IncomingAudioRtp ||
            firstByte === ZRTPLegacyMediaType.IncomingVideoRtp) &&
        buf.length >= 13
    ) {
        const mediaType = firstByte as ZRTPLegacyMediaType;
        return {
            family: "legacy_media",
            mediaType,
            isVideo: mediaType === ZRTPLegacyMediaType.IncomingVideoRtp,
            isRtcp: false,
            isFec: false,
            routingId: 0,
            rtpPayload: buf.subarray(1),
        };
    }

    // 2b. Gói tin Relay Media 5-byte header (`type` in `{3, 5, 7, 13, 15}` + `routingToken` 4B LE)
    if (
        firstByte === ZRTPLegacyMediaType.AudioRtp ||
        firstByte === ZRTPLegacyMediaType.AudioRtcp ||
        firstByte === ZRTPLegacyMediaType.AudioFec ||
        firstByte === ZRTPLegacyMediaType.VideoRtp ||
        firstByte === ZRTPLegacyMediaType.VideoRtcp
    ) {
        const mediaType = firstByte as ZRTPLegacyMediaType;
        const routingId = buf.readUInt32LE(1);
        return {
            family: "legacy_media",
            mediaType,
            isVideo:
                mediaType === ZRTPLegacyMediaType.VideoRtp || mediaType === ZRTPLegacyMediaType.VideoRtcp,
            isRtcp:
                mediaType === ZRTPLegacyMediaType.AudioRtcp || mediaType === ZRTPLegacyMediaType.VideoRtcp,
            isFec: mediaType === ZRTPLegacyMediaType.AudioFec,
            routingId,
            rtpPayload: buf.subarray(5),
        };
    }

    // 3. Gói tin ZRTC Multiplexed Media / P2P (0x7f, >= 9 bytes)
    if (firstByte === 0x7f && buf.length >= 9) {
        const version = buf.readUInt8(1);
        const role = (buf.readUInt8(2) === 1 ? ZRTCRole.Callee : ZRTCRole.Caller) as ZRTCRole;
        const routingToken = buf.readUInt32LE(3);
        const subCmd = buf.readUInt16LE(7);

        if (
            subCmd === ZRTCMediaSubCommand.AudioRtp ||
            subCmd === ZRTCMediaSubCommand.AudioRtcp ||
            subCmd === ZRTCMediaSubCommand.VideoRtp ||
            subCmd === ZRTCMediaSubCommand.VideoRtcp ||
            subCmd === ZRTCMediaSubCommand.AudioFec
        ) {
            return {
                family: "zrtc_media",
                version,
                role,
                routingToken,
                subCmd,
                isVideo:
                    subCmd === ZRTCMediaSubCommand.VideoRtp || subCmd === ZRTCMediaSubCommand.VideoRtcp,
                isRtcp:
                    subCmd === ZRTCMediaSubCommand.AudioRtcp || subCmd === ZRTCMediaSubCommand.VideoRtcp,
                isFec: subCmd === ZRTCMediaSubCommand.AudioFec,
                rtpPayload: buf.subarray(9),
            };
        }

        if (buf.length >= 17) {
            return {
                family: "zrtc_p2p",
                version,
                role,
                routingToken,
                subCmd,
                seqNum: buf.readUInt32LE(9),
                callId: buf.readUInt32LE(13),
                payload: buf.subarray(17),
            };
        }
    }

    return { family: "raw", raw: buf };
}
