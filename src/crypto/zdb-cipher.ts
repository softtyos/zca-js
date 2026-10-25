import crypto from "node:crypto";
import { ZALO_PROTOCOL } from "../constants/index.js";
import { ZaloApiError } from "../Errors/index.js";

/**
 * Generates an RSA 2048-bit key pair for mobile message synchronization (`pull_mobile_msg`)
 * @returns Object containing public and private keys in both PEM and Base64 formats
 */
export function generateRSAKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const publicKeyBase64: string = publicKey
        .toString()
        .replace(/-----BEGIN PUBLIC KEY-----/g, "")
        .replace(/-----END PUBLIC KEY-----/g, "")
        .replace(/\s+/g, "");
    const privateKeyBase64: string = privateKey
        .toString()
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s+/g, "");
    return { publicKeyBase64, privateKeyBase64, publicKey: publicKey.toString(), privateKey: privateKey.toString() };
}

function b64urlToBigInt(value: string): bigint {
    return BigInt("0x" + Buffer.from(value, "base64url").toString("hex"));
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    const zero = BigInt(0);
    const one = BigInt(1);
    let result = one;
    base %= mod;
    while (exp > zero) {
        if (exp & one) result = (result * base) % mod;
        base = (base * base) % mod;
        exp >>= one;
    }
    return result;
}

/**
 * Pure-BigInt RSA CRT PKCS#1 v1.5 decryption fallback for Node.js environments
 * where OpenSSL blocks `RSA_PKCS1_PADDING` in `crypto.privateDecrypt` (CVE-2023-46809).
 */
export function rsaDecryptPkcs1Manual(privateKeyPem: string, cipher: Buffer): Buffer {
    const jwk = crypto.createPrivateKey(privateKeyPem).export({ format: "jwk" }) as Record<string, string>;
    const n = b64urlToBigInt(jwk.n);
    const p = b64urlToBigInt(jwk.p);
    const q = b64urlToBigInt(jwk.q);
    const dp = b64urlToBigInt(jwk.dp);
    const dq = b64urlToBigInt(jwk.dq);
    const qi = b64urlToBigInt(jwk.qi);
    const c = BigInt("0x" + cipher.toString("hex"));
    const m1 = modPow(c, dp, p);
    const m2 = modPow(c, dq, q);
    const h = (qi * (((m1 - m2) % p) + p)) % p;
    const m = m2 + h * q;

    const k = Math.ceil(n.toString(16).length / 2);
    const em = Buffer.from(m.toString(16).padStart(k * 2, "0"), "hex");
    if (em[0] !== 0x00 || em[1] !== 0x02) throw new ZaloApiError("Invalid RSA PKCS#1 v1.5 padding");
    const sep = em.indexOf(0x00, 2);
    if (sep < 10) throw new ZaloApiError("Invalid RSA PKCS#1 v1.5 padding separator");
    return em.subarray(sep + 1);
}

/**
 * Decrypt `encrypted_key` from `syncmsg_info` using RSA private key with PKCS#1 v1.5 scheme.
 * Automatically falls back to pure-BigInt CRT decryption if OpenSSL disables `RSA_PKCS1_PADDING`.
 */
export function decryptWithPrivateKey(privateKey: string, encryptedBase64: string): Buffer {
    const cleanKey = privateKey.replace(/\\n/g, "\n");
    const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

    try {
        return crypto.privateDecrypt(
            {
                key: cleanKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            encryptedBuffer as unknown as NodeJS.ArrayBufferView,
        );
    } catch (err: unknown) {
        const errorObj = err as { code?: string; message?: string };
        const code = String(errorObj?.code || "");
        const msg = String(errorObj?.message || "");
        if (code.includes("INVALID_ARG") || /RSA_PKCS1_PADDING|security-revert|not supported/i.test(msg)) {
            return rsaDecryptPkcs1Manual(cleanKey, encryptedBuffer);
        }
        throw err;
    }
}

/**
 * Derives the 32-byte AES-256-CBC key for Zalo ZDB4.0 (`.db.crypt`) backup files
 * from the raw RSA-decrypted bytes: first 32 uppercase hex characters as ASCII bytes.
 */
export function deriveZdbAesKey(decryptedRsaBytes: Buffer): Buffer {
    const upperHex = decryptedRsaBytes.toString("hex").toUpperCase();
    if (upperHex.length < ZALO_PROTOCOL.AES_256_KEY_BYTE_LENGTH) {
        throw new ZaloApiError(`Decrypted RSA key hex is too short (${upperHex.length} chars, expected >= 32)`);
    }
    return Buffer.from(upperHex.slice(0, ZALO_PROTOCOL.AES_256_KEY_BYTE_LENGTH), "ascii");
}

/**
 * Decrypts a Zalo ZDB4.0 (`.db.crypt`) backup buffer into its plaintext ZDB4.0 container
 * (header + table of contents + XZ stream) using 64KB independent AES-256-CBC chunks (`IV = 0`).
 */
export function decryptZdbBuffer(zdbBuffer: Buffer, aesKey: Buffer): Buffer {
    const ZDB_MAGIC = Buffer.from(ZALO_PROTOCOL.ZDB_MAGIC_HEADER, "ascii");
    const CHUNK_SIZE = ZALO_PROTOCOL.ZDB_CHUNK_SIZE;
    const zeroIv = Buffer.alloc(16, 0);

    for (const startOffset of [0, 4]) {
        const encryptedLength = Math.floor((zdbBuffer.length - startOffset) / 16) * 16;
        if (encryptedLength < 16) continue;

        const firstChunkLen = Math.min(CHUNK_SIZE, encryptedLength);
        const firstDecipher = crypto.createDecipheriv("aes-256-cbc", aesKey, zeroIv);
        firstDecipher.setAutoPadding(false);
        const firstPlain = Buffer.concat([
            firstDecipher.update(zdbBuffer.subarray(startOffset, startOffset + firstChunkLen)),
            firstDecipher.final(),
        ]);

        if (!firstPlain.subarray(0, ZDB_MAGIC.length).equals(ZDB_MAGIC)) {
            continue;
        }

        const chunks: Buffer[] = [firstPlain];
        for (let offset = CHUNK_SIZE; offset < encryptedLength; offset += CHUNK_SIZE) {
            const len = Math.min(CHUNK_SIZE, encryptedLength - offset);
            const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, zeroIv);
            decipher.setAutoPadding(false);
            chunks.push(
                Buffer.concat([
                    decipher.update(zdbBuffer.subarray(startOffset + offset, startOffset + offset + len)),
                    decipher.final(),
                ]),
            );
        }
        return Buffer.concat(chunks);
    }

    throw new ZaloApiError("Invalid AES key or buffer is not in ZDB4.0 format");
}

export type ZdbTocEntry = {
    name: string;
    size: number;
};

/**
 * Parses the Table of Contents (TOC) from a decrypted ZDB4.0 container buffer,
 * returning the list of SQLite `.db` files (`<uid>.db` / `group_<gid>.db`) and the byte offset where the XZ stream starts.
 */
export function parseZdbHeader(zdbPlaintext: Buffer): { entries: ZdbTocEntry[]; xzOffset: number } {
    const ZDB_MAGIC = Buffer.from(ZALO_PROTOCOL.ZDB_MAGIC_HEADER, "ascii");
    const COUNT_OFFSET = 14;
    if (zdbPlaintext.length < COUNT_OFFSET + 4 || !zdbPlaintext.subarray(0, ZDB_MAGIC.length).equals(ZDB_MAGIC)) {
        throw new ZaloApiError("Buffer is not a valid decrypted ZDB4.0 container");
    }

    const count = zdbPlaintext.readUInt32BE(COUNT_OFFSET);
    if (count > 100000) {
        throw new ZaloApiError(`ZDB4.0 header entry count exceeds safety limit (${count})`);
    }
    let offset = COUNT_OFFSET + 4;
    const entries: ZdbTocEntry[] = [];

    for (let i = 0; i < count; i++) {
        if (offset + 4 > zdbPlaintext.length) {
            throw new ZaloApiError("Truncated ZDB4.0 header while reading entry name length");
        }
        const nameLen = zdbPlaintext.readUInt32BE(offset);
        if (nameLen > 4096 || offset + 4 + nameLen + 4 > zdbPlaintext.length) {
            throw new ZaloApiError("Truncated or invalid ZDB4.0 header while reading entry metadata");
        }
        const rawName = zdbPlaintext
            .toString("utf8", offset + 4, offset + 4 + nameLen)
            .replace(/\0+$/, "");
        const name = rawName.split(/[\\/]/).pop() || rawName;
        if (name === ".." || name === "." || name.includes("..")) {
            throw new ZaloApiError(`Unsafe entry name in ZDB4.0 header: ${rawName}`);
        }
        const size = zdbPlaintext.readUInt32BE(offset + 4 + nameLen);
        entries.push({ name, size });
        offset += 4 + nameLen + 4;
    }

    return { entries, xzOffset: offset };
}
