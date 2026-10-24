import crypto from "node:crypto";
import pako from "pako";
import JSONBig from "json-bigint";
import { ZaloApiError } from "../Errors/index.js";

const jsonBigString = JSONBig({ storeAsString: true });

export const DEFAULT_BIGINT_ID_FIELDS = [
    "owner_id",
    "group_id",
    "uidFrom",
    "uidTo",
    "uid",
    "ownerId",
    "destId",
    "srcId",
    "fromUid",
    "threadId",
    "globalMsgId",
    "global_msg_id",
    "globalDelMsgId",
    "msgId",
    "refMessageId",
    "cliMsgId",
    "client_msg_id",
    "actionId",
    "lastActionIdOther",
    "lastActionId",
    "resetLastActionId",
    "lastId",
    "ids",
    "topicId",
    "reminderId",
    "eventId",
] as const;

/**
 * Tiền xử lý chuỗi JSON trước khi `JSON.parse` (tương đương `preParse(e, t)` trong `app.asar` của Zalo PC).
 * Bọc dấu ngoặc kép quanh các trường định danh 64-bit (`owner_id`, `group_id`, hoặc các số nguyên >= 16 chữ số
 * vượt quá `Number.MAX_SAFE_INTEGER`) để tránh mất 3 chữ số cuối của UID/MsgId do làm tròn IEEE-754.
 */
export function preParseJsonIds(
    jsonStr: string,
    alwaysStringFields: readonly string[] = ["owner_id", "group_id"],
    bigIntSafeFields: readonly string[] = DEFAULT_BIGINT_ID_FIELDS,
): string {
    if (!jsonStr || typeof jsonStr !== "string") return jsonStr;

    const alwaysSet = new Set(alwaysStringFields);
    const allFields = Array.from(new Set([...alwaysStringFields, ...bigIntSafeFields]));
    if (allFields.length === 0) return jsonStr;

    const escapedKeys = allFields.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const keyValueRegex = new RegExp(`"(${escapedKeys})"(\\s*:\\s*)(\\d+|\\[\\s*\\d+(?:\\s*,\\s*\\d+)*\\s*\\])`, "g");

    return jsonStr.replace(keyValueRegex, (fullMatch, key: string, sep: string, rawVal: string) => {
        const forceString = alwaysSet.has(key);
        if (rawVal.startsWith("[")) {
            const inner = rawVal.slice(1, -1);
            const parts = inner.split(",").map((part) => {
                const trimmed = part.trim();
                if (forceString || trimmed.length >= 16 || Number(trimmed) > Number.MAX_SAFE_INTEGER) {
                    return `"${trimmed}"`;
                }
                return trimmed;
            });
            return `"${key}"${sep}[${parts.join(",")}]`;
        }
        if (forceString || rawVal.length >= 16 || Number(rawVal) > Number.MAX_SAFE_INTEGER) {
            return `"${key}"${sep}"${rawVal}"`;
        }
        return fullMatch;
    });
}

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

    if (encryptType === 0) return jsonBigString.parse(preParseJsonIds(rawData));

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
    return jsonBigString.parse(preParseJsonIds(decodedData));
}
