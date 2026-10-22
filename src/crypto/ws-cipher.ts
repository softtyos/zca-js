import crypto from "node:crypto";
import pako from "pako";
import JSONBig from "json-bigint";
import { ZaloApiError } from "../Errors/index.js";

export function decodeBase64ToBuffer(data: string) {
    return Buffer.from(data, "base64");
}

export function decodeUnit8Array(data: Uint8Array) {
    try {
        return new TextDecoder().decode(data);
    } catch {
        return null;
    }
}

export async function decodeEventData(parsed: Record<string, unknown>, cipherKey?: string) {
    if (typeof parsed.data !== "string")
        throw new ZaloApiError(`Invalid data, expected string but got ${typeof parsed.data}`);
    if (typeof parsed.encrypt !== "number")
        throw new ZaloApiError(`Invalid encrypt type, expected number but got ${typeof parsed.encrypt}`);
    if (parsed.encrypt < 0 || parsed.encrypt > 3)
        throw new ZaloApiError(`Invalid encrypt type, expected 0-3 but got ${parsed.encrypt}`);

    const rawData = parsed.data;
    const encryptType = parsed.encrypt as 0 | 1 | 2 | 3;

    if (encryptType === 0) return JSON.parse(rawData);

    const decodedBuffer = decodeBase64ToBuffer(encryptType === 1 ? rawData : decodeURIComponent(rawData));

    let decryptedBuffer: ArrayBuffer | Buffer = decodedBuffer;
    if (encryptType !== 1) {
        if (cipherKey && decodedBuffer.length >= 48) {
            const algorithm = {
                name: "AES-GCM",
                iv: decodedBuffer.subarray(0, 16),
                tagLength: 128,
                additionalData: decodedBuffer.subarray(16, 32),
            };
            const dataSource = decodedBuffer.subarray(32);

            const cryptoKey = await crypto.subtle.importKey("raw", decodeBase64ToBuffer(cipherKey), algorithm, false, [
                "decrypt",
            ]);
            decryptedBuffer = await crypto.subtle.decrypt(algorithm, cryptoKey, dataSource);
        } else {
            throw new ZaloApiError("Invalid data length or missing cipher key");
        }
    }

    const decompressedBuffer =
        encryptType === 3 ? new Uint8Array(decryptedBuffer) : pako.inflate(decryptedBuffer as ArrayBuffer);
    const decodedData = decodeUnit8Array(decompressedBuffer);

    if (!decodedData) return;
    return JSONBig.parse(decodedData);
}
