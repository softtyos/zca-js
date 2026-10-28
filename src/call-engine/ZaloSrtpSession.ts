import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { ZaloApiError } from "../Errors/ZaloApiError.js";

export type SrtpCryptoSuite = "AES_CM_128_HMAC_SHA1_80" | "AES_CM_128_HMAC_SHA1_32" | "AES_CM_128_NULL_AUTH";

export type ZaloSrtpSessionOptions = {
    suite?: SrtpCryptoSuite;
    /**
     * Chế độ `srtpNoSeq` của Zalo Group Call (`zrtc::SrtpTransport::SetUpKey` @ `0x100299ef4`,
     * `cricket::SrtpSession::ProtectRtp` @ `0x100298eb8` & `UnprotectRtp` @ `0x1002990a0`):
     * - Sử dụng cipher suite `AES_CM_128_NULL_AUTH` (`tagLength = 0`, không gắn 10-byte HMAC tag)
     * - Tạm thời gán `seqNum = 0` (và `roc = 0`) khi tính IV AES-128-CTR (`IV = salt XOR (ssrc << 64)`),
     *   sau đó khôi phục `sequenceNumber` gốc vào RTP header để máy chủ SFU `zavi` có thể đổi `seqNum`
     *   khi forward giữa nhiều thành viên mà không làm hỏng giải mã SRTP.
     */
    zeroSeqMode?: boolean;
    zeroSsrcMode?: boolean;
    tagLength?: number;
};

export type SfuSvcExtensionData = {
    spatialId: number;
    temporalId: number;
    maxSpatialId: number;
    maxTemporalId: number;
    seq: [number, number, number];
};

export type ParsedRtpPacket = {
    version: number;
    padding: boolean;
    extension: boolean;
    csrcCount: number;
    csrcList: number[];
    /**
     * Trong Group Call (`zrtc::groupcall::GroupCallPeer::verifyVideoPacket` @ `0x100220d40`),
     * máy chủ SFU `zavi` đặt `voipUid` 32-bit của người gửi thực sự vào `csrc[0]` (offset 12..15)
     * nếu `csrcCount > 0 && csrc[0] !== 0`, ngược lại dùng `ssrc` (offset 8..11).
     */
    senderUid: number;
    marker: boolean;
    payloadType: number;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    headerLength: number;
    header: Buffer;
    payload: Buffer;
    sfuExt?: SfuSvcExtensionData;
};

export type BuildRtpPacketOptions = {
    payloadType?: number;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    csrcList?: number[];
    marker?: boolean;
    /**
     * Khối RFC 5285 One-Byte RTP Header Extension (`0xBEDE`, đã gồm 4-byte header + N*4-byte elements).
     * Khi truyền `headerExtension`, cờ `X = 1` (`0x10`) tại byte `0` của RTP header sẽ tự động được bật.
     */
    headerExtension?: Buffer;
    payload: Buffer;
};

/**
 * Tạo khối 24-byte RFC 5285 One-Byte RTP Header Extension (`0xBEDE`, 5 words = 20 bytes elements)
 * bắt buộc cho mọi gói Video RTP đi ra trong Zalo Group Call (`zrtc::VideoRtpRtcp::_create` @ `0x10028d8b4`,
 * `RTPSender::BuildRTPHeaderExtension` @ `0x1003f078c`, `RTPSender::BuildVideoGroupCallExtension` @ `0x1003f0ef0`,
 * `VCMReceiver::InsertPacketGC` @ `0x100437e24`):
 * - Element 1 (`id = 3`, `L = 2` -> `0x32`): 3-byte `kRtpExtensionAbsoluteSendTime`
 * - Element 2 (`id = 5`, `L = 1` -> `0x51`): 2-byte `kRtpExtensionTransportSequenceNumber`
 * - Element 3 (`id = 12`, `L = 2` -> `0xc2`): 3-byte `kRtpExtensionVideoGroupCall` (`layerByte` + uint16BE `seq`)
 * - Element 4 (`id = 13`, `L = 6` -> `0xd6`): 7-byte `kRtpExtensionCaptureNtpTime` (24-bit `ntpSec` + 32-bit `ntpFrac`)
 * - 1-byte RFC 5285 padding (`0x00`)
 */
export function buildGroupCallVideoRtpHeaderExtension(options: {
    sequenceNumber: number;
    transportSequenceNumber?: number;
    spatialId?: number;
    temporalId?: number;
    maxSpatialId?: number;
    maxTemporalId?: number;
    absSendTimeMs?: number;
}): Buffer {
    const ext = Buffer.allocUnsafe(24);
    // RFC 5285 One-Byte Header magic 0xBEDE + length = 5 (5 * 4 = 20 bytes)
    ext.writeUInt16BE(0xbede, 0);
    ext.writeUInt16BE(0x0005, 2);

    const nowMs = options.absSendTimeMs ?? Date.now();
    // Element 1: id = 3 (AbsoluteSendTime), L = 2 (3 bytes) -> 0x32
    const absSendTime = Math.floor(nowMs * 262.144) & 0xffffff;
    ext.writeUInt8(0x32, 4);
    ext.writeUInt8((absSendTime >>> 16) & 0xff, 5);
    ext.writeUInt8((absSendTime >>> 8) & 0xff, 6);
    ext.writeUInt8(absSendTime & 0xff, 7);

    // Element 2: id = 5 (TransportSequenceNumber), L = 1 (2 bytes) -> 0x51
    const seq16 = options.sequenceNumber & 0xffff;
    const transportSeq16 = (options.transportSequenceNumber ?? seq16) & 0xffff;
    ext.writeUInt8(0x51, 8);
    ext.writeUInt16BE(transportSeq16, 9);

    // Element 3: id = 12 (0x0c, VideoGroupCall 3-byte), L = 2 (3 bytes) -> 0xc2
    const spatialId = options.spatialId ?? 0;
    const temporalId = options.temporalId ?? 0;
    const maxSpatialId = options.maxSpatialId ?? spatialId;
    const maxTemporalId = options.maxTemporalId ?? options.temporalId ?? 0;
    const curLayer = (spatialId * 3 + temporalId) & 0x0f;
    const maxLayer = (maxSpatialId * 3 + maxTemporalId) & 0x0f;
    const layerByte = (curLayer << 4) | maxLayer;

    ext.writeUInt8(0xc2, 11);
    ext.writeUInt8(layerByte, 12);
    ext.writeUInt16BE(seq16, 13);

    // Element 4: id = 13 (0x0d, CaptureNtpTime 7-byte), L = 6 (7 bytes) -> 0xd6
    const ntpSec = (Math.floor(nowMs / 1000) + 2208988800) & 0xffffff;
    const ntpFrac = Math.floor(((nowMs % 1000) / 1000) * 0x100000000) >>> 0;
    ext.writeUInt8(0xd6, 15);
    ext.writeUInt8((ntpSec >>> 16) & 0xff, 16);
    ext.writeUInt8((ntpSec >>> 8) & 0xff, 17);
    ext.writeUInt8(ntpSec & 0xff, 18);
    ext.writeUInt32BE(ntpFrac, 19);

    // 1-byte RFC 5285 padding
    ext.writeUInt8(0x00, 23);
    return ext;
}

/**
 * Sinh ngẫu nhiên khoá Master Key (16 bytes) + Master Salt (14 bytes) = 30 bytes,
 * mã hoá thành chuỗi Base64 40 ký tự chuẩn `zrtc::SrtpTransport` của Zalo.
 */
export function generateSrtpMasterKeyBase64(): string {
    return crypto.randomBytes(30).toString("base64");
}

/**
 * Đóng gói gói tin chuẩn WebRTC RTP (12-byte header + optional CSRC list + optional RFC 5285 extension + payload).
 */
export function buildRtpPacket(options: BuildRtpPacketOptions): Buffer {
    const csrcCount = Math.min(15, options.csrcList?.length ?? 0);
    const hasExtension = Boolean(options.headerExtension && options.headerExtension.length >= 4);
    const header = Buffer.allocUnsafe(12 + csrcCount * 4);
    header.writeUInt8((0x80 | (hasExtension ? 0x10 : 0x00) | (csrcCount & 0x0f)) & 0xff, 0);
    const ptByte = ((options.marker ? 0x80 : 0x00) | ((options.payloadType ?? 112) & 0x7f)) & 0xff;
    header.writeUInt8(ptByte, 1);
    header.writeUInt16BE(options.sequenceNumber & 0xffff, 2);
    header.writeUInt32BE(options.timestamp >>> 0, 4);
    header.writeUInt32BE(options.ssrc >>> 0, 8);
    for (let i = 0; i < csrcCount; i++) {
        header.writeUInt32BE((options.csrcList![i] ?? 0) >>> 0, 12 + i * 4);
    }
    return hasExtension
        ? Buffer.concat([header, options.headerExtension!, options.payload])
        : Buffer.concat([header, options.payload]);
}

/**
 * Phân tích gói tin chuẩn WebRTC RTP (RFC 3550).
 */
export function parseRtpPacket(packet: Buffer): ParsedRtpPacket {
    if (!packet || packet.length < 12) {
        throw new ZaloApiError(`Invalid RTP packet length: ${packet?.length ?? 0}`);
    }

    const firstByte = packet.readUInt8(0);
    const secondByte = packet.readUInt8(1);

    const version = (firstByte >> 6) & 0x03;
    const padding = ((firstByte >> 5) & 0x01) === 1;
    const extension = ((firstByte >> 4) & 0x01) === 1;
    const csrcCount = firstByte & 0x0f;
    const marker = ((secondByte >> 7) & 0x01) === 1;
    const payloadType = secondByte & 0x7f;
    const sequenceNumber = packet.readUInt16BE(2);
    const timestamp = packet.readUInt32BE(4);
    const ssrc = packet.readUInt32BE(8);

    let headerLength = 12 + csrcCount * 4;
    if (packet.length < headerLength) {
        throw new ZaloApiError("RTP packet shorter than CSRC header length");
    }

    const csrcList: number[] = [];
    for (let i = 0; i < csrcCount; i++) {
        csrcList.push(packet.readUInt32BE(12 + i * 4));
    }
    const senderUid = csrcList.length > 0 && csrcList[0] !== 0 ? csrcList[0] : ssrc;

    let sfuExt: SfuSvcExtensionData | undefined;
    if (extension) {
        if (packet.length < headerLength + 4) {
            throw new ZaloApiError("RTP packet shorter than extension header");
        }
        const extProfile = packet.readUInt16BE(headerLength);
        const extLenWords = packet.readUInt16BE(headerLength + 2);
        const extStart = headerLength + 4;
        headerLength += 4 + extLenWords * 4;
        if (packet.length < headerLength) {
            throw new ZaloApiError("RTP packet shorter than extension payload");
        }
        // Giải mã RFC 5285 One-Byte Header (0xBEDE) để trích xuất kRtpExtensionVideoSvcLayerIdx (id = 14)
        // khớp với RtpHeaderParser::ParseOneByteExtensionHeader (0x1003f5df0) & VCMReceiver::InsertPacketGC (0x100437e24)
        if (extProfile === 0xbede) {
            let pos = extStart;
            while (pos < headerLength) {
                const b = packet.readUInt8(pos);
                if (b === 0) {
                    pos++;
                    continue;
                }
                const extId = (b >> 4) & 0x0f;
                const extLen = (b & 0x0f) + 1;
                if (extId === 15) break;
                if (pos + 1 + extLen > headerLength) break;
                if (extId === 14 && extLen >= 7) {
                    const layerByte = packet.readUInt8(pos + 1);
                    const curLayer = (layerByte >> 4) & 0x0f;
                    const maxLayer = layerByte & 0x0f;
                    const seq0 = packet.readUInt16BE(pos + 2);
                    const seq1 = packet.readUInt16BE(pos + 4);
                    const seq2 = packet.readUInt16BE(pos + 6);
                    const maxTemporalId = maxLayer % 3;
                    sfuExt = {
                        spatialId: Math.floor(curLayer / 3),
                        temporalId: curLayer % 3,
                        maxSpatialId: Math.floor(maxLayer / 3),
                        maxTemporalId,
                        seq: [seq0, seq1, seq2],
                    };
                } else if (extId === 12 && extLen >= 3 && !sfuExt) {
                    const layerByte = packet.readUInt8(pos + 1);
                    const curLayer = (layerByte >> 4) & 0x0f;
                    const maxLayer = layerByte & 0x0f;
                    const seq0 = packet.readUInt16BE(pos + 2);
                    const maxTemporalId = maxLayer % 3;
                    sfuExt = {
                        spatialId: Math.floor(curLayer / 3),
                        temporalId: curLayer % 3,
                        maxSpatialId: Math.floor(maxLayer / 3),
                        maxTemporalId,
                        seq: [seq0, seq0, seq0],
                    };
                }
                pos += 1 + extLen;
            }
        }
    }

    let payloadEnd = packet.length;
    if (padding && packet.length > headerLength) {
        const paddingLen = packet.readUInt8(packet.length - 1);
        if (paddingLen > 0 && headerLength + paddingLen <= packet.length) {
            payloadEnd = packet.length - paddingLen;
        }
    }

    return {
        version,
        padding,
        extension,
        csrcCount,
        csrcList,
        senderUid,
        marker,
        payloadType,
        sequenceNumber,
        timestamp,
        ssrc,
        headerLength,
        header: packet.subarray(0, headerLength),
        payload: packet.subarray(headerLength, payloadEnd),
        ...(sfuExt ? { sfuExt } : {}),
    };
}

/**
 * Thuật toán dẫn xuất khoá phiên SRTP/SRTCP theo RFC 3711 Mục 4.3.1 (AES-CM PRF).
 */
export function deriveSrtpSessionKey(
    masterKey: Buffer,
    masterSalt: Buffer,
    label: number,
    outByteLength: number,
): Buffer {
    const iv = Buffer.alloc(16, 0);
    masterSalt.copy(iv, 0, 0, 14);
    // label nằm tại byte thứ 7 (tức (label << 48) trong khối 112-bit salt)
    iv[7] ^= label & 0xff;

    const cipher = crypto.createCipheriv("aes-128-ctr", masterKey, iv);
    const zeroBlock = Buffer.alloc(outByteLength, 0);
    return Buffer.concat([cipher.update(zeroBlock), cipher.final()]).subarray(0, outByteLength);
}

function buildSrtpCtrIv(sessionSalt: Buffer, ssrc: number, roc: number, seqNum: number): Buffer {
    const iv = Buffer.alloc(16, 0);
    sessionSalt.copy(iv, 0, 0, 14);

    const ssrcBuf = Buffer.allocUnsafe(4);
    ssrcBuf.writeUInt32BE(ssrc >>> 0, 0);
    for (let i = 0; i < 4; i++) {
        iv[4 + i] ^= ssrcBuf[i];
    }

    const rocBuf = Buffer.allocUnsafe(4);
    rocBuf.writeUInt32BE(roc >>> 0, 0);
    for (let i = 0; i < 4; i++) {
        iv[8 + i] ^= rocBuf[i];
    }

    iv[12] ^= (seqNum >>> 8) & 0xff;
    iv[13] ^= seqNum & 0xff;
    return iv;
}

function buildSrtcpCtrIv(sessionSalt: Buffer, ssrc: number, srtcpIndex: number): Buffer {
    const iv = Buffer.alloc(16, 0);
    sessionSalt.copy(iv, 0, 0, 14);

    const ssrcBuf = Buffer.allocUnsafe(4);
    ssrcBuf.writeUInt32BE(ssrc >>> 0, 0);
    for (let i = 0; i < 4; i++) {
        iv[4 + i] ^= ssrcBuf[i];
    }

    const idxBuf = Buffer.allocUnsafe(4);
    idxBuf.writeUInt32BE((srtcpIndex & 0x7fffffff) >>> 0, 0);
    for (let i = 0; i < 4; i++) {
        iv[10 + i] ^= idxBuf[i];
    }

    return iv;
}

/**
 * Phiên mã hoá / giải mã SRTP & SRTCP thuần Node.js (`node:crypto`)
 * tương thích 100% với `zrtc::SrtpTransport` (`AES_CM_128_HMAC_SHA1_80` / `AES_CM_128_HMAC_SHA1_32` / `AES_CM_128_NULL_AUTH`).
 */
export class ZaloSrtpSession {
    public readonly masterKey: Buffer;
    public readonly masterSalt: Buffer;
    public readonly masterKeyBase64: string;
    public readonly suite: SrtpCryptoSuite;
    public readonly tagLength: number;
    public readonly zeroSeqMode: boolean;
    public readonly zeroSsrcMode: boolean;

    public readonly rtpKey: Buffer;
    public readonly rtpAuthKey: Buffer;
    public readonly rtpSalt: Buffer;

    public readonly rtcpKey: Buffer;
    public readonly rtcpAuthKey: Buffer;
    public readonly rtcpSalt: Buffer;

    private sendRoc = 0;
    private recvRoc = 0;
    private lastSendSeq = -1;
    private lastRecvSeq = -1;
    private srtcpIndex = 0;

    constructor(
        masterKeyInput: string | Buffer,
        suiteOrOptions: SrtpCryptoSuite | ZaloSrtpSessionOptions = "AES_CM_128_HMAC_SHA1_80",
        options?: ZaloSrtpSessionOptions,
    ) {
        const raw =
            typeof masterKeyInput === "string" ? Buffer.from(masterKeyInput, "base64") : Buffer.from(masterKeyInput);

        if (raw.length < 30) {
            throw new ZaloApiError(`SRTP master key + salt must be at least 30 bytes (got ${raw.length} bytes)`);
        }

        const resolvedOpts: ZaloSrtpSessionOptions =
            typeof suiteOrOptions === "string"
                ? { ...options, suite: options?.suite ?? suiteOrOptions }
                : suiteOrOptions;

        this.masterKey = raw.subarray(0, 16);
        this.masterSalt = raw.subarray(16, 30);
        this.masterKeyBase64 = raw.subarray(0, 30).toString("base64");
        this.zeroSeqMode = Boolean(resolvedOpts.zeroSeqMode || resolvedOpts.suite === "AES_CM_128_NULL_AUTH");
        this.zeroSsrcMode = Boolean(resolvedOpts.zeroSsrcMode);
        this.suite = resolvedOpts.suite ?? (this.zeroSeqMode ? "AES_CM_128_NULL_AUTH" : "AES_CM_128_HMAC_SHA1_80");
        this.tagLength =
            resolvedOpts.tagLength !== undefined
                ? resolvedOpts.tagLength
                : this.suite === "AES_CM_128_NULL_AUTH" || this.zeroSeqMode
                  ? 0
                  : this.suite === "AES_CM_128_HMAC_SHA1_32"
                    ? 4
                    : 10;

        this.rtpKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x00, 16);
        this.rtpAuthKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x01, 20);
        this.rtpSalt = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x02, 14);

        this.rtcpKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x03, 16);
        this.rtcpAuthKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x04, 20);
        this.rtcpSalt = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x05, 14);
    }

    /**
     * Mã hoá gói tin RTP thành SRTP (AES-128-CTR + HMAC-SHA1 tag hoặc NULL_AUTH cho Group Call `srtpNoSeq`).
     */
    public protectRtp(rtpPacket: Buffer, explicitRoc?: number): Buffer {
        const parsed = parseRtpPacket(rtpPacket);
        let roc = explicitRoc ?? this.sendRoc;

        if (explicitRoc === undefined && !this.zeroSeqMode) {
            if (
                this.lastSendSeq !== -1 &&
                parsed.sequenceNumber < this.lastSendSeq &&
                this.lastSendSeq - parsed.sequenceNumber > 0x8000
            ) {
                this.sendRoc = (this.sendRoc + 1) >>> 0;
                roc = this.sendRoc;
            }
            this.lastSendSeq = parsed.sequenceNumber;
        }

        const ivSsrc = this.zeroSsrcMode ? 0 : parsed.ssrc;
        const ivRoc = this.zeroSeqMode ? 0 : roc;
        const ivSeq = this.zeroSeqMode ? 0 : parsed.sequenceNumber;
        const iv = buildSrtpCtrIv(this.rtpSalt, ivSsrc, ivRoc, ivSeq);
        const cipher = crypto.createCipheriv("aes-128-ctr", this.rtpKey, iv);
        const encryptedPayload = Buffer.concat([cipher.update(parsed.payload), cipher.final()]);

        if (this.tagLength <= 0) {
            return Buffer.concat([parsed.header, encryptedPayload]);
        }

        const rocBuf = Buffer.allocUnsafe(4);
        rocBuf.writeUInt32BE(ivRoc >>> 0, 0);

        const hmac = crypto.createHmac("sha1", this.rtpAuthKey);
        hmac.update(parsed.header);
        hmac.update(encryptedPayload);
        hmac.update(rocBuf);
        const authTag = hmac.digest().subarray(0, this.tagLength);

        return Buffer.concat([parsed.header, encryptedPayload, authTag]);
    }

    /**
     * Xác thực HMAC-SHA1 (nếu `tagLength > 0`) và giải mã gói tin SRTP về RTP thuần.
     */
    public unprotectRtp(srtpPacket: Buffer, explicitRoc?: number): Buffer {
        if (!srtpPacket || srtpPacket.length < 12 + this.tagLength) {
            throw new ZaloApiError(`Invalid SRTP packet length: ${srtpPacket?.length ?? 0}`);
        }

        const rtpPortion = this.tagLength > 0 ? srtpPacket.subarray(0, srtpPacket.length - this.tagLength) : srtpPacket;
        const parsed = parseRtpPacket(rtpPortion);

        let roc = explicitRoc ?? this.recvRoc;
        if (explicitRoc === undefined && !this.zeroSeqMode && this.lastRecvSeq !== -1) {
            if (parsed.sequenceNumber < this.lastRecvSeq && this.lastRecvSeq - parsed.sequenceNumber > 0x8000) {
                roc = (this.recvRoc + 1) >>> 0;
            }
        }

        if (this.tagLength > 0) {
            const receivedTag = srtpPacket.subarray(srtpPacket.length - this.tagLength);
            const rocBuf = Buffer.allocUnsafe(4);
            rocBuf.writeUInt32BE((this.zeroSeqMode ? 0 : roc) >>> 0, 0);

            const hmac = crypto.createHmac("sha1", this.rtpAuthKey);
            hmac.update(parsed.header);
            hmac.update(parsed.payload);
            hmac.update(rocBuf);
            const expectedTag = hmac.digest().subarray(0, this.tagLength);

            if (!crypto.timingSafeEqual(receivedTag, expectedTag)) {
                throw new ZaloApiError("SRTP authentication tag verification failed");
            }
        }

        if (explicitRoc === undefined && !this.zeroSeqMode) {
            this.recvRoc = roc;
            this.lastRecvSeq = parsed.sequenceNumber;
        }

        const ivSsrc = this.zeroSsrcMode ? 0 : parsed.ssrc;
        const ivRoc = this.zeroSeqMode ? 0 : roc;
        const ivSeq = this.zeroSeqMode ? 0 : parsed.sequenceNumber;
        const iv = buildSrtpCtrIv(this.rtpSalt, ivSsrc, ivRoc, ivSeq);
        const decipher = crypto.createDecipheriv("aes-128-ctr", this.rtpKey, iv);
        const decryptedPayload = Buffer.concat([decipher.update(parsed.payload), decipher.final()]);

        return Buffer.concat([parsed.header, decryptedPayload]);
    }

    /**
     * Mã hoá gói tin RTCP thành SRTCP (RFC 3711 Mục 3.4).
     */
    public protectRtcp(rtcpPacket: Buffer): Buffer {
        if (!rtcpPacket || rtcpPacket.length < 8) {
            throw new ZaloApiError(`Invalid RTCP packet length: ${rtcpPacket?.length ?? 0}`);
        }

        const header = rtcpPacket.subarray(0, 8);
        const payload = rtcpPacket.subarray(8);
        const ssrc = rtcpPacket.readUInt32BE(4);
        const index = (this.srtcpIndex++ & 0x7fffffff) >>> 0;

        const iv = buildSrtcpCtrIv(this.rtcpSalt, ssrc, index);
        const cipher = crypto.createCipheriv("aes-128-ctr", this.rtcpKey, iv);
        const encryptedPayload = Buffer.concat([cipher.update(payload), cipher.final()]);

        const indexTrailer = Buffer.allocUnsafe(4);
        indexTrailer.writeUInt32BE((0x80000000 | index) >>> 0, 0);

        const hmac = crypto.createHmac("sha1", this.rtcpAuthKey);
        hmac.update(header);
        hmac.update(encryptedPayload);
        hmac.update(indexTrailer);
        const authTag = hmac.digest().subarray(0, this.tagLength);

        return Buffer.concat([header, encryptedPayload, indexTrailer, authTag]);
    }

    /**
     * Xác thực và giải mã gói tin SRTCP về RTCP thuần.
     */
    public unprotectRtcp(srtcpPacket: Buffer): Buffer {
        if (!srtcpPacket || srtcpPacket.length < 8 + 4 + this.tagLength) {
            throw new ZaloApiError(`Invalid SRTCP packet length: ${srtcpPacket?.length ?? 0}`);
        }

        const tagStart = srtcpPacket.length - this.tagLength;
        const indexStart = tagStart - 4;

        const header = srtcpPacket.subarray(0, 8);
        const encryptedPayload = srtcpPacket.subarray(8, indexStart);
        const indexTrailer = srtcpPacket.subarray(indexStart, tagStart);
        const receivedTag = srtcpPacket.subarray(tagStart);

        const hmac = crypto.createHmac("sha1", this.rtcpAuthKey);
        hmac.update(header);
        hmac.update(encryptedPayload);
        hmac.update(indexTrailer);
        const expectedTag = hmac.digest().subarray(0, this.tagLength);

        if (!crypto.timingSafeEqual(receivedTag, expectedTag)) {
            throw new ZaloApiError("SRTCP authentication tag verification failed");
        }

        const eAndIndex = indexTrailer.readUInt32BE(0);
        const isEncrypted = (eAndIndex & 0x80000000) !== 0;
        const index = eAndIndex & 0x7fffffff;

        if (!isEncrypted) {
            return Buffer.concat([header, encryptedPayload]);
        }

        const ssrc = header.readUInt32BE(4);
        const iv = buildSrtcpCtrIv(this.rtcpSalt, ssrc, index);
        const decipher = crypto.createDecipheriv("aes-128-ctr", this.rtcpKey, iv);
        const decryptedPayload = Buffer.concat([decipher.update(encryptedPayload), decipher.final()]);

        return Buffer.concat([header, decryptedPayload]);
    }
}
