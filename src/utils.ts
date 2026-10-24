import cryptojs from "crypto-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import SparkMD5 from "spark-md5";
import toughCookie from "tough-cookie";

import { isContextSession, type ContextSession, type ContextBase } from "./context.js";
import { ZaloApiError, ZaloApiMissingImageMetadataGetter } from "./Errors/index.js";
import { FriendEventType } from "./models/FriendEvent.js";
import { GroupEventType } from "./models/GroupEvent.js";
import type { API } from "./zalo.js";
import type { AttachmentSource } from "./models/Attachment.js";
import { ZALO_DEFAULTS, ZALO_DOMAINS, ZALO_PROTOCOL } from "./constants/index.js";
import { decodeAES, encodeAES, preParseJsonIds } from "./crypto/index.js";

export * from "./constants/index.js";
export * from "./crypto/index.js";
export * from "./core/index.js";

export const isBun = typeof Bun !== "undefined";

export function hasOwn(obj: Record<string, unknown>, key: string): key is keyof typeof obj {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Get signed key for API requests.
 *
 * @param type
 * @param params
 * @returns MD5 hash
 */
export function getSignKey(type: string, params: Record<string, unknown>) {
    const n = [];
    for (const s in params) {
        if (hasOwn(params, s)) {
            n.push(s);
        }
    }

    n.sort();
    let a = ZALO_PROTOCOL.SIGN_KEY_PREFIX + type;
    for (let s = 0; s < n.length; s++) a += params[n[s]];
    return cryptojs.MD5(a).toString();
}

/**
 *
 * @param baseURL
 * @param params
 * @param apiVersion automatically add zalo api version to url params
 * @returns
 */
export function makeURL(
    ctx: ContextBase,
    baseURL: string,
    params: Record<string, string | number> = {},
    apiVersion: boolean = true,
) {
    const url = new URL(baseURL);
    for (const key in params) {
        if (hasOwn(params, key)) {
            url.searchParams.append(key, params[key].toString());
        }
    }

    if (apiVersion) {
        if (!url.searchParams.has("zpw_ver")) url.searchParams.set("zpw_ver", ctx.API_VERSION.toString());
        if (!url.searchParams.has("zpw_type")) url.searchParams.set("zpw_type", ctx.API_TYPE.toString());
    }

    return url.toString();
}

/**
 * Suy luận nền tảng hệ điều hành (OS) từ chuỗi User-Agent.
 *
 * @returns Chuỗi platform theo định dạng Sec-CH-UA-Platform, ví dụ: "Windows", "macOS", "Linux"
 */
export function getPlatformFromUA(userAgent: string | undefined): string {
    if (!userAgent) return ZALO_DEFAULTS.BROWSER.DEFAULT_PLATFORM;
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Macintosh|Mac OS X/i.test(userAgent)) return "macOS";
    if (/Linux|X11/i.test(userAgent)) return "Linux";
    return ZALO_DEFAULTS.BROWSER.DEFAULT_PLATFORM;
}

/**
 * Trích xuất phiên bản Chrome major từ chuỗi User-Agent.
 *
 * @returns Phiên bản Chrome major dạng string, ví dụ: "130", "133"
 */
export function getChromeVersionFromUA(userAgent: string | undefined): string {
    if (!userAgent) return ZALO_DEFAULTS.BROWSER.DEFAULT_CHROME_VERSION;
    const match = userAgent.match(/Chrome\/(\d+)/);
    return match ? match[1] : ZALO_DEFAULTS.BROWSER.DEFAULT_CHROME_VERSION;
}

/**
 * Chuẩn hóa chuỗi Accept-Language dựa theo thiết lập ngôn ngữ ngữ cảnh.
 *
 * @param language Mã ngôn ngữ ("vi", "en", ...)
 * @returns Chuỗi Accept-Language chuẩn theo hành vi trình duyệt
 */
export function getBrowserLanguage(language: string | undefined): string {
    if (language === "en") {
        return ZALO_DEFAULTS.BROWSER.ACCEPT_LANGUAGE_EN;
    }
    return ZALO_DEFAULTS.BROWSER.ACCEPT_LANGUAGE_VI;
}

/**
 * Sinh bộ header Sec-CH-UA nhất quán theo User-Agent (chỉ khi là Chromium/Chrome).
 *
 * @param userAgent Chuỗi User-Agent của client
 * @returns Record chứa các header sec-ch-ua-* hoặc object rỗng
 */
export function getSecChUaHeaders(userAgent: string | undefined): Record<string, string> {
    if (!userAgent || !/Chrome\//i.test(userAgent)) return {};

    const platform = getPlatformFromUA(userAgent);
    const chromeVer = getChromeVersionFromUA(userAgent);

    return {
        "sec-ch-ua": `"Not=A?Brand";v="99", "Google Chrome";v="${chromeVer}", "Chromium";v="${chromeVer}"`,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": `"${platform}"`,
    };
}

export async function getDefaultHeaders(ctx: ContextBase, origin: string = ZALO_DOMAINS.CHAT_WEB) {
    if (!ctx.cookie) throw new ZaloApiError("Cookie is not available");
    if (!ctx.userAgent) throw new ZaloApiError("User agent is not available");

    const secChUa = getSecChUaHeaders(ctx.userAgent);

    return {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": getBrowserLanguage(ctx.language),
        "content-type": "application/x-www-form-urlencoded",
        cookie: await ctx.cookie.getCookieString(origin),
        origin: origin,
        priority: "u=1, i",
        referer: `${origin}/`,
        "user-agent": ctx.userAgent,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": origin === ZALO_DOMAINS.AUTH_ID ? "same-origin" : "same-site",
        ...secChUa,
    };
}

export async function request(ctx: ContextBase, url: string, options?: RequestInit, raw = false) {
    if (!ctx.cookie) ctx.cookie = new toughCookie.CookieJar();
    const origin = new URL(url).origin;

    const defaultHeaders = await getDefaultHeaders(ctx, origin);
    if (!raw) {
        if (options && options.headers) {
            const mergedHeaders: Record<string, string> = { ...defaultHeaders };
            const inputHeaders = options.headers as Record<string, string>;
            for (const [key, value] of Object.entries(inputHeaders)) {
                const lowerKey = key.toLowerCase();
                for (const existingKey of Object.keys(mergedHeaders)) {
                    if (existingKey.toLowerCase() === lowerKey && existingKey !== key) {
                        delete mergedHeaders[existingKey];
                    }
                }
                mergedHeaders[key] = value;
            }
            options.headers = mergedHeaders;
        } else {
            options = { ...(options || {}), headers: defaultHeaders };
        }
    }

    const timeoutMs = ctx.options?.requestTimeout;
    const defaultSignal =
        !options?.signal &&
        typeof timeoutMs === "number" &&
        timeoutMs > 0 &&
        typeof AbortSignal !== "undefined" &&
        typeof AbortSignal.timeout === "function"
            ? AbortSignal.timeout(timeoutMs)
            : undefined;

    const isAgentUndiciDispatcher = Boolean(
        ctx.options.agent && typeof (ctx.options.agent as { dispatch?: unknown }).dispatch === "function",
    );
    const resolvedDispatcher =
        ctx.options.dispatcher ?? (isAgentUndiciDispatcher ? ctx.options.agent : undefined);
    const resolvedAgent =
        ctx.options.agent && !isAgentUndiciDispatcher ? ctx.options.agent : undefined;

    const _options: RequestInit & Record<string, unknown> = {
        ...(options ?? {}),
        ...(defaultSignal ? { signal: defaultSignal } : {}),
        ...(isBun
            ? {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  proxy: ctx.options.agent?.proxy?.href,
              }
            : {
                  ...(resolvedAgent ? { agent: resolvedAgent } : {}),
                  ...(resolvedDispatcher ? { dispatcher: resolvedDispatcher } : {}),
              }),
    };

    const response = await ctx.options.polyfill(url, _options);
    const setCookieRaw = response.headers.get("set-cookie");
    if (setCookieRaw && !raw) {
        let cookieStrings: string[] = [];
        const headers = response.headers as Headers & {
            raw?: () => Record<string, string[]>;
            getSetCookie?: () => string[];
        };
        if (typeof headers.raw === "function") {
            const rawHeaders = headers.raw();
            if (rawHeaders && rawHeaders["set-cookie"]) {
                cookieStrings = rawHeaders["set-cookie"];
            }
        } else if (typeof headers.getSetCookie === "function") {
            cookieStrings = headers.getSetCookie();
        } else {
            cookieStrings = setCookieRaw.split(/,\s*(?=[a-zA-Z0-9_-]+\s*=)/);
        }
        for (const cookie of cookieStrings) {
            const parsed = toughCookie.Cookie.parse(cookie);
            try {
                if (parsed)
                    await ctx.cookie.setCookie(
                        parsed,
                        parsed.domain != "zalo.me" ? `https://${parsed.domain}` : origin,
                    );
            } catch (error: unknown) {
                logger(ctx).error(error);
            }
        }
    }

    const redirectURL = response.headers.get("location");

    if (redirectURL) {
        const redirectOptions = { ...options };
        redirectOptions.method = "GET";
        if (!raw) {
            redirectOptions.headers = new Headers(redirectOptions.headers);
            redirectOptions.headers.set("Referer", `${ZALO_DOMAINS.AUTH_ID}/`);
        }
        return await request(ctx, redirectURL, redirectOptions);
    }

    return response;
}

export async function getImageMetaData(ctx: ContextBase, filePath: string) {
    if (!ctx.options.imageMetadataGetter) {
        throw new ZaloApiMissingImageMetadataGetter();
    }

    const imageData = await ctx.options.imageMetadataGetter(filePath);
    if (!imageData) {
        throw new ZaloApiError("Failed to get image metadata");
    }

    const fileName = filePath.split("/").pop()!;

    return {
        fileName,
        totalSize: imageData.size,
        width: imageData.width,
        height: imageData.height,
    };
}

export async function getFileSize(filePath: string) {
    return fs.promises.stat(filePath).then((s) => s.size);
}

export async function getGifMetaData(ctx: ContextBase, filePath: string) {
    if (!ctx.options.imageMetadataGetter) {
        throw new ZaloApiMissingImageMetadataGetter();
    }

    const gifData = await ctx.options.imageMetadataGetter(filePath);
    if (!gifData) {
        throw new ZaloApiError("Failed to get gif metadata");
    }

    const fileName = path.basename(filePath);

    return {
        fileName,
        totalSize: gifData.size,
        width: gifData.width,
        height: gifData.height,
    };
}

export async function getMd5LargeFileObject(source: AttachmentSource, fileSize: number) {
    const buffer = typeof source == "string" ? await fs.promises.readFile(source) : source.data;
    return new Promise<{
        currentChunk: number;
        data: string;
    }>((resolve) => {
        let currentChunk = 0;
        const chunkSize = ZALO_DEFAULTS.UPLOAD.MD5_CHUNK_SIZE_BYTES,
            chunks = Math.ceil(fileSize / chunkSize),
            spark = new SparkMD5.ArrayBuffer();

        function loadNext() {
            const start = currentChunk * chunkSize,
                end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;

            spark.append(new Uint8Array(buffer.subarray(start, end)).buffer as ArrayBuffer);
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                resolve({
                    currentChunk,
                    data: spark.end(),
                });
            }
        }

        loadNext();
    });
}

export const logger = (ctx: { options: { logging?: boolean } }) => ({
    verbose: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[35m🚀 VERBOSE\x1b[0m", ...args);
    },
    info: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[34mINFO\x1b[0m", ...args);
    },
    warn: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[33mWARN\x1b[0m", ...args);
    },
    error: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[31mERROR\x1b[0m", ...args);
    },
    success: (...args: unknown[]) => {
        if (ctx.options.logging) console.log("\x1b[32mSUCCESS\x1b[0m", ...args);
    },
    timestamp: (...args: unknown[]) => {
        const now = new Date().toISOString();
        if (ctx.options.logging) console.log(`\x1b[90m[${now}]\x1b[0m`, ...args);
    },
});

export function getClientMessageType(msgType: string) {
    if (msgType === "webchat") return 1;
    if (msgType === "chat.voice") return 31;
    if (msgType === "chat.photo") return 32;
    if (msgType === "chat.sticker") return 36;
    if (msgType === "chat.doodle") return 37;
    if (msgType === "chat.recommended") return 38;

    if (msgType === "chat.link") return 38;
    if (msgType === "chat.video.msg") return 44;

    if (msgType === "share.file") return 46;
    if (msgType === "chat.gif") return 49;
    if (msgType === "chat.location.new") return 43;

    return 1;
}

export function strPadLeft(e: number | string, t: string, n: number) {
    const a = (e = "" + e).length;
    return a === n ? e : a > n ? e.slice(-n) : t.repeat(n - a) + e;
}

export function formatTime(format: string, timestamp: number = Date.now()): string {
    const date = new Date(timestamp);

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    const formatted = new Intl.DateTimeFormat("vi-VN", options).format(date);

    if (format.includes("%H") || format.includes("%d")) {
        return format
            .replace("%H", date.getHours().toString().padStart(2, "0"))
            .replace("%M", date.getMinutes().toString().padStart(2, "0"))
            .replace("%S", date.getSeconds().toString().padStart(2, "0"))
            .replace("%d", date.getDate().toString().padStart(2, "0"))
            .replace("%m", (date.getMonth() + 1).toString().padStart(2, "0"))
            .replace("%Y", date.getFullYear().toString());
    }

    return formatted;
}

export function getFullTimeFromMillisecond(e: number) {
    const t = new Date(e);
    return (
        strPadLeft(t.getHours(), "0", 2) +
        ":" +
        strPadLeft(t.getMinutes(), "0", 2) +
        " " +
        strPadLeft(t.getDate(), "0", 2) +
        "/" +
        strPadLeft(t.getMonth() + 1, "0", 2) +
        "/" +
        t.getFullYear()
    );
}

export function getFileExtension(e: string) {
    return path.extname(e).slice(1);
}

export function getFileName(e: string) {
    return path.basename(e);
}

export function removeUndefinedKeys(e: Record<string, unknown>) {
    for (const t in e) if (e[t] === undefined) delete e[t];
    return e;
}

export function getGroupEventType(act: string) {
    if (act == "join_request") return GroupEventType.JOIN_REQUEST;
    if (act == "join") return GroupEventType.JOIN;
    if (act == "leave") return GroupEventType.LEAVE;
    if (act == "remove_member") return GroupEventType.REMOVE_MEMBER;
    if (act == "block_member") return GroupEventType.BLOCK_MEMBER;
    if (act == "update_setting") return GroupEventType.UPDATE_SETTING;
    if (act == "update_avatar") return GroupEventType.UPDATE_AVATAR;
    if (act == "update") return GroupEventType.UPDATE;
    if (act == "new_link") return GroupEventType.NEW_LINK;
    if (act == "add_admin") return GroupEventType.ADD_ADMIN;
    if (act == "remove_admin") return GroupEventType.REMOVE_ADMIN;

    if (act == "new_pin_topic") return GroupEventType.NEW_PIN_TOPIC;
    if (act == "update_pin_topic") return GroupEventType.UPDATE_PIN_TOPIC;
    if (act == "update_topic") return GroupEventType.UPDATE_TOPIC;
    if (act == "update_board") return GroupEventType.UPDATE_BOARD;
    if (act == "remove_board") return GroupEventType.REMOVE_BOARD;
    if (act == "reorder_pin_topic") return GroupEventType.REORDER_PIN_TOPIC;
    if (act == "unpin_topic") return GroupEventType.UNPIN_TOPIC;
    if (act == "remove_topic") return GroupEventType.REMOVE_TOPIC;
    if (act == "accept_remind") return GroupEventType.ACCEPT_REMIND;
    if (act == "reject_remind") return GroupEventType.REJECT_REMIND;
    if (act == "remind_topic") return GroupEventType.REMIND_TOPIC;

    return GroupEventType.UNKNOWN;
}

export function getFriendEventType(act: string) {
    if (act == "add") return FriendEventType.ADD;
    if (act == "remove") return FriendEventType.REMOVE;
    if (act == "block") return FriendEventType.BLOCK;
    if (act == "unblock") return FriendEventType.UNBLOCK;
    if (act == "block_call") return FriendEventType.BLOCK_CALL;
    if (act == "unblock_call") return FriendEventType.UNBLOCK_CALL;

    if (act == "req_v2") return FriendEventType.REQUEST;
    if (act == "reject") return FriendEventType.REJECT_REQUEST;
    if (act == "undo_req") return FriendEventType.UNDO_REQUEST;

    if (act == "seen_fr_req") return FriendEventType.SEEN_FRIEND_REQUEST;

    if (act == "pin_unpin") return FriendEventType.PIN_UNPIN;
    if (act == "pin_create") return FriendEventType.PIN_CREATE;

    return FriendEventType.UNKNOWN;
}

export type ZaloResponse<T> = {
    data: T | null;
    error: {
        message: string;
        code?: number;
    } | null;
};

export async function handleZaloResponse<T = unknown>(ctx: ContextSession, response: Response, isEncrypted = true) {
    const result: ZaloResponse<T> = {
        data: null,
        error: null,
    };

    if (!response.ok) {
        result.error = {
            message: "Request failed with status code " + response.status,
        };
        return result;
    }

    try {
        const jsonData: {
            error_code: number;
            error_message: string;
            data: string;
        } = await response.json();

        if (jsonData.error_code != 0) {
            result.error = {
                message: jsonData.error_message,
                code: jsonData.error_code,
            };
            return result;
        }

        if (isEncrypted && (!jsonData.data || jsonData.data.length === 0)) {
            result.data = {} as T;
            return result;
        }

        const decodedStr = isEncrypted ? decodeAES(ctx.secretKey!, jsonData.data) : null;
        if (isEncrypted && (!decodedStr || decodedStr.length === 0)) {
            result.data = {} as T;
            return result;
        }

        const safeJsonStr = isEncrypted ? preParseJsonIds(decodedStr!) : null;
        const decodedData: {
            error_code: number;
            error_message: string;
            data: T;
        } = isEncrypted ? JSON.parse(safeJsonStr!) : jsonData;

        if (decodedData.error_code != 0) {
            result.error = {
                message: decodedData.error_message,
                code: decodedData.error_code,
            };
            return result;
        }

        result.data = decodedData.data;
    } catch (error) {
        logger(ctx).error("Failed to parse response data:", error);
        result.error = {
            message: "Failed to parse response data",
        };
    }

    return result;
}

export async function resolveResponse<T = unknown>(
    ctx: ContextSession,
    res: Response,
    cb?: (result: ZaloResponse<unknown>) => T,
    isEncrypted?: boolean,
) {
    const result = await handleZaloResponse<T>(ctx, res, isEncrypted);
    if (result.error) throw new ZaloApiError(result.error.message, result.error.code);
    if (cb) return cb(result);

    return result.data as T;
}

export type FactoryUtils<T> = {
    makeURL: (
        baseURL: string,
        params?: Record<string, string | number>,
        apiVersion?: boolean,
    ) => ReturnType<typeof makeURL>;
    encodeAES: (data: cryptojs.lib.WordArray | string, t?: number) => ReturnType<typeof encodeAES>;
    request: (url: string, options?: RequestInit, raw?: boolean) => ReturnType<typeof request>;
    logger: ReturnType<typeof logger>;
    resolve: (
        res: Response,
        cb?: (result: ZaloResponse<unknown>) => T,
        isEncrypted?: boolean,
    ) => ReturnType<typeof resolveResponse<T>>;
};

export function apiFactory<T>() {
    return <K extends (api: API, ctx: ContextSession, utils: FactoryUtils<T>) => unknown>(callback: K) => {
        return (ctx: ContextBase, api: API) => {
            if (!isContextSession(ctx)) throw new ZaloApiError("Invalid context " + JSON.stringify(ctx, null, 2));

            const utils = {
                makeURL(baseURL: string, params?: Record<string, string | number>, apiVersion?: boolean) {
                    return makeURL(ctx, baseURL, params, apiVersion);
                },
                encodeAES(data: cryptojs.lib.WordArray | string, t?: number) {
                    return encodeAES(ctx.secretKey, data, t);
                },
                request(url: string, options?: RequestInit, raw?: boolean) {
                    return request(ctx, url, options, raw);
                },
                logger: logger(ctx),
                resolve: (res: Response, cb?: (result: ZaloResponse<unknown>) => T, isEncrypted?: boolean) =>
                    resolveResponse<T>(ctx, res, cb, isEncrypted),
            };

            return callback(api, ctx, utils) as ReturnType<K>;
        };
    };
}

export function generateZaloUUID(userAgent: string) {
    return crypto.randomUUID() + "-" + cryptojs.MD5(userAgent).toString();
}

/**
 * Converts a hex color code to a negative color number used by Zalo API
 * @param hex Hex color code (e.g. '#00FF00' or '00FF00')
 * @returns Negative color number (e.g. -16711936)
 */
export function hexToNegativeColor(hex: string): number {
    if (!hex.startsWith("#")) {
        hex = "#" + hex;
    }

    let hexValue = hex.slice(1);
    if (hexValue.length === 6) {
        hexValue = "FF" + hexValue;
    }
    const decimal = parseInt(hexValue, 16);
    return decimal > 0x7fffffff ? decimal - 4294967296 : decimal;
}

/**
 * Converts a negative color number from Zalo API to hex color code
 * @param negativeColor Negative color number (e.g. -16711936)
 * @returns Hex color code (e.g. '#00FF00')
 */
export function negativeColorToHex(negativeColor: number): string {
    const positiveColor = negativeColor + 4294967296;
    return "#" + positiveColor.toString(16).slice(-6).padStart(6, "0");
}

export function normalizeHolderName(input?: string) {
    if (!input) return undefined;
    const normalized = input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, " ")
        .trim();

    return normalized.length >= 5 ? normalized : undefined;
}
