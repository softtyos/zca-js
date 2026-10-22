import crypto from "node:crypto";
import { ZALO_PROTOCOL } from "../constants/index.js";

/**
 * Encrypts a plaintext string for ZCloud / ZFamily APIs (`CLOUD_API` / `CLOUD_FAMILY_API`, module `"98yS"`),
 * using AES-256-CBC with a random 16-byte IV prepended to the ciphertext before Base64 encoding.
 */
export function encryptZCloudAES(plainText: string, base64Key: string): string {
    const key = Buffer.from(base64Key, "base64");
    const iv = crypto.randomBytes(ZALO_PROTOCOL.ZCLOUD_IV_BYTE_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString("base64");
}

/**
 * Decrypts a Base64 payload from ZCloud / ZFamily APIs (`CLOUD_API` / `CLOUD_FAMILY_API`, module `"98yS"`),
 * extracting the first 16 bytes as the AES-256-CBC IV and the remainder as PKCS#7-padded ciphertext.
 */
export function decryptZCloudAES(base64CipherText: string, base64Key: string): string {
    const key = Buffer.from(base64Key, "base64");
    const raw = Buffer.from(base64CipherText, "base64");
    const ivLen = ZALO_PROTOCOL.ZCLOUD_IV_BYTE_LENGTH;
    const iv = raw.subarray(0, ivLen);
    const ciphertext = raw.subarray(ivLen);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
