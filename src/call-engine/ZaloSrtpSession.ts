import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { ZaloApiError } from "../Errors/ZaloApiError.js";

export type SrtpCryptoSuite = "AES_CM_128_HMAC_SHA1_80" | "AES_CM_128_HMAC_SHA1_32";

export type ParsedRtpPacket = {
    version: number;
    padding: boolean;
    extension: boolean;
    csrcCount: number;
    marker: boolean;
    payloadType: number;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    headerLength: number;
    header: Buffer;
    payload: Buffer;
};

export type BuildRtpPacketOptions = {
    payloadType?: number;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    marker?: boolean;
    payload: Buffer;
};

/**
 * Sinh ngẫu nhiên khoá Master Key (16 bytes) + Master Salt (14 bytes) = 30 bytes,
 * mã hoá thành chuỗi Base64 40 ký tự chuẩn `zrtc::SrtpTransport` của Zalo.
 */
export function generateSrtpMasterKeyBase64(): string {
    return crypto.randomBytes(30).toString("base64");
}

/**
 * Đóng gói gói tin chuẩn WebRTC RTP (12-byte header + payload).
 */
export function buildRtpPacket(options: BuildRtpPacketOptions): Buffer {
    const header = Buffer.allocUnsafe(12);
    header.writeUInt8(0x80, 0); // Version = 2, P = 0, X = 0, CC = 0
    const ptByte = ((options.marker ? 0x80 : 0x00) | ((options.payloadType ?? 112) & 0x7f)) & 0xff;
    header.writeUInt8(ptByte, 1);
    header.writeUInt16BE(options.sequenceNumber & 0xffff, 2);
    header.writeUInt32BE(options.timestamp >>> 0, 4);
    header.writeUInt32BE(options.ssrc >>> 0, 8);
    return Buffer.concat([header, options.payload]);
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

    if (extension) {
        if (packet.length < headerLength + 4) {
            throw new ZaloApiError("RTP packet shorter than extension header");
        }
        const extLenWords = packet.readUInt16BE(headerLength + 2);
        headerLength += 4 + extLenWords * 4;
        if (packet.length < headerLength) {
            throw new ZaloApiError("RTP packet shorter than extension payload");
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
        marker,
        payloadType,
        sequenceNumber,
        timestamp,
        ssrc,
        headerLength,
        header: packet.subarray(0, headerLength),
        payload: packet.subarray(headerLength, payloadEnd),
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
 * tương thích 100% với `zrtc::SrtpTransport` (`AES_CM_128_HMAC_SHA1_80` / `AES_CM_128_HMAC_SHA1_32`).
 */
export class ZaloSrtpSession {
    public readonly masterKey: Buffer;
    public readonly masterSalt: Buffer;
    public readonly masterKeyBase64: string;
    public readonly suite: SrtpCryptoSuite;
    public readonly tagLength: number;

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

    constructor(masterKeyInput: string | Buffer, suite: SrtpCryptoSuite = "AES_CM_128_HMAC_SHA1_80") {
        const raw =
            typeof masterKeyInput === "string"
                ? Buffer.from(masterKeyInput, "base64")
                : Buffer.from(masterKeyInput);

        if (raw.length < 30) {
            throw new ZaloApiError(
                `SRTP master key + salt must be at least 30 bytes (got ${raw.length} bytes)`,
            );
        }

        this.masterKey = raw.subarray(0, 16);
        this.masterSalt = raw.subarray(16, 30);
        this.masterKeyBase64 = raw.subarray(0, 30).toString("base64");
        this.suite = suite;
        this.tagLength = suite === "AES_CM_128_HMAC_SHA1_32" ? 4 : 10;

        this.rtpKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x00, 16);
        this.rtpAuthKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x01, 20);
        this.rtpSalt = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x02, 14);

        this.rtcpKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x03, 16);
        this.rtcpAuthKey = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x04, 20);
        this.rtcpSalt = deriveSrtpSessionKey(this.masterKey, this.masterSalt, 0x05, 14);
    }

    /**
     * Mã hoá gói tin RTP thành SRTP (AES-128-CTR + HMAC-SHA1 tag).
     */
    public protectRtp(rtpPacket: Buffer, explicitRoc?: number): Buffer {
        const parsed = parseRtpPacket(rtpPacket);
        let roc = explicitRoc ?? this.sendRoc;

        if (explicitRoc === undefined) {
            if (this.lastSendSeq !== -1 && parsed.sequenceNumber < this.lastSendSeq && this.lastSendSeq - parsed.sequenceNumber > 0x8000) {
                this.sendRoc = (this.sendRoc + 1) >>> 0;
                roc = this.sendRoc;
            }
            this.lastSendSeq = parsed.sequenceNumber;
        }

        const iv = buildSrtpCtrIv(this.rtpSalt, parsed.ssrc, roc, parsed.sequenceNumber);
        const cipher = crypto.createCipheriv("aes-128-ctr", this.rtpKey, iv);
        const encryptedPayload = Buffer.concat([cipher.update(parsed.payload), cipher.final()]);

        const rocBuf = Buffer.allocUnsafe(4);
        rocBuf.writeUInt32BE(roc >>> 0, 0);

        const hmac = crypto.createHmac("sha1", this.rtpAuthKey);
        hmac.update(parsed.header);
        hmac.update(encryptedPayload);
        hmac.update(rocBuf);
        const authTag = hmac.digest().subarray(0, this.tagLength);

        return Buffer.concat([parsed.header, encryptedPayload, authTag]);
    }

    /**
     * Xác thực HMAC-SHA1 và giải mã gói tin SRTP về RTP thuần.
     */
    public unprotectRtp(srtpPacket: Buffer, explicitRoc?: number): Buffer {
        if (!srtpPacket || srtpPacket.length < 12 + this.tagLength) {
            throw new ZaloApiError(`Invalid SRTP packet length: ${srtpPacket?.length ?? 0}`);
        }

        const rtpPortion = srtpPacket.subarray(0, srtpPacket.length - this.tagLength);
        const receivedTag = srtpPacket.subarray(srtpPacket.length - this.tagLength);
        const parsed = parseRtpPacket(rtpPortion);

        let roc = explicitRoc ?? this.recvRoc;
        if (explicitRoc === undefined && this.lastRecvSeq !== -1) {
            if (parsed.sequenceNumber < this.lastRecvSeq && this.lastRecvSeq - parsed.sequenceNumber > 0x8000) {
                roc = (this.recvRoc + 1) >>> 0;
            }
        }

        const rocBuf = Buffer.allocUnsafe(4);
        rocBuf.writeUInt32BE(roc >>> 0, 0);

        const hmac = crypto.createHmac("sha1", this.rtpAuthKey);
        hmac.update(parsed.header);
        hmac.update(parsed.payload);
        hmac.update(rocBuf);
        const expectedTag = hmac.digest().subarray(0, this.tagLength);

        if (!crypto.timingSafeEqual(receivedTag, expectedTag)) {
            throw new ZaloApiError("SRTP authentication tag verification failed");
        }

        if (explicitRoc === undefined) {
            this.recvRoc = roc;
            this.lastRecvSeq = parsed.sequenceNumber;
        }

        const iv = buildSrtpCtrIv(this.rtpSalt, parsed.ssrc, roc, parsed.sequenceNumber);
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
