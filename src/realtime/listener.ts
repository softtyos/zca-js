import EventEmitter from "events";
import WebSocket from "ws";
import { ThreadType } from "../models/index.js";
import { getBrowserLanguage, hasOwn, logger, makeURL, ZALO_DEFAULTS, ZALO_DOMAINS } from "../utils.js";
import { ZaloApiError } from "../Errors/ZaloApiError.js";
import type { ContextSession } from "../context.js";
import {
    CloseReason,
    type HasMsgIdItem,
    type HasMsgQueueId,
    type ListenerEvents,
    type OnClosedCallback,
    type OnErrorCallback,
    type OnMessageCallback,
    type WsPayload,
} from "./types.js";
import { handleRealtimeMessagePacket } from "./handlers/message.handler.js";
import { handleRealtimeControlPacket } from "./handlers/control.handler.js";
import { handleRealtimeReactionPacket } from "./handlers/reaction.handler.js";
import { handleRealtimeStatusPacket } from "./handlers/status.handler.js";

export class Listener extends EventEmitter<ListenerEvents> {
    private wsURL: string;
    private cookie: string;
    private userAgent: string;

    private ws: WebSocket | null;
    private retryCount: Record<
        string,
        {
            count: number;
            max: number;
            times: number[];
        }
    >;
    private rotateCount: number;

    private onConnectedCallback: () => unknown;
    private onClosedCallback: OnClosedCallback;
    private onErrorCallback: OnErrorCallback;
    private onMessageCallback: OnMessageCallback;
    private cipherKey?: string;

    private selfListen: boolean;
    private pingInterval?: ReturnType<typeof setInterval>;
    private retryTimeout?: ReturnType<typeof setTimeout>;
    private watchdogTimeout?: ReturnType<typeof setTimeout>;
    private consecutive1006Count = 0;
    private isManualStop = false;

    private id = 0;

    constructor(
        private ctx: ContextSession,
        private urls: string[],
    ) {
        super();
        if (!ctx.cookie) throw new ZaloApiError("Cookie is not available");
        if (!ctx.userAgent) throw new ZaloApiError("User agent is not available");

        this.wsURL = makeURL(this.ctx, this.urls[0], {
            t: Date.now(),
        });
        this.retryCount = {};
        this.rotateCount = 0;

        for (const retry in ctx.settings.features.socket.retries) {
            const { times, max } = ctx.settings.features.socket.retries[retry];
            this.retryCount[retry] = {
                count: 0,
                max: max || 0,
                times: typeof times === "number" ? [times] : times,
            };
        }

        this.cookie = ctx.cookie.getCookieStringSync(ZALO_DOMAINS.CHAT_WEB);
        this.userAgent = ctx.userAgent;

        this.selfListen = ctx.options.selfListen;

        this.ws = null;

        this.onConnectedCallback = () => {};
        this.onClosedCallback = () => {};
        this.onErrorCallback = () => {};
        this.onMessageCallback = () => {};
    }

    /**
     * @deprecated Use `on` method instead
     */
    public onConnected(cb: () => unknown) {
        this.onConnectedCallback = cb;
    }

    /**
     * @deprecated Use `on` method instead
     */
    public onClosed(cb: OnClosedCallback) {
        this.onClosedCallback = cb;
    }

    /**
     * @deprecated Use `on` method instead
     */
    public onError(cb: OnErrorCallback) {
        this.onErrorCallback = cb;
    }

    /**
     * @deprecated Use `on` method instead
     */
    public onMessage(cb: OnMessageCallback) {
        this.onMessageCallback = cb;
    }

    private isRetryable(code: CloseReason) {
        return (
            code === CloseReason.AbnormalClosure ||
            this.ctx.settings.features.socket.close_and_retry_codes.includes(code)
        );
    }

    private canRetry(code: CloseReason) {
        if (!this.isRetryable(code)) return false;

        const retry = this.retryCount[code.toString()] ?? this.retryCount["internal"];
        if (!retry || retry.count >= retry.max) return false;
        retry.count++;

        const { count, max, times } = retry;
        let retryTime: number;
        if (count - 1 < times.length) {
            retryTime = times[count - 1];
        } else {
            const lastTime = times[times.length - 1] || 1000;
            const multiplier = Math.min(Math.pow(1.5, count - times.length), 10);
            const jitter = Math.floor(Math.random() * 1000);
            retryTime = Math.min(Math.floor(lastTime * multiplier) + jitter, ZALO_DEFAULTS.SOCKET.MAX_RETRY_BACKOFF_MS);
        }

        logger(this.ctx).verbose(`Retry for code ${code} in ${retryTime}ms (${count}/${max})`);

        return retryTime;
    }

    private resetRetryCount() {
        for (const retry of Object.values(this.retryCount)) {
            retry.count = 0;
        }
    }

    private resetWatchdog() {
        if (this.watchdogTimeout) clearTimeout(this.watchdogTimeout);
        this.watchdogTimeout = setTimeout(() => {
            logger(this.ctx).verbose(
                "Watchdog timeout: no packet/pong received from Zalo WebSocket in 50s. Forcing reconnect...",
            );
            if (this.ws) {
                try {
                    if (typeof this.ws.terminate === "function") {
                        this.ws.terminate();
                    } else if (typeof this.ws.close === "function") {
                        this.ws.close(CloseReason.AbnormalClosure);
                    }
                } catch {
                    // Ignore if already terminated
                }
            }
        }, ZALO_DEFAULTS.SOCKET.WATCHDOG_TIMEOUT_MS);
    }

    private shouldRotate(code: CloseReason) {
        if (code === CloseReason.AbnormalClosure) {
            this.consecutive1006Count++;
            if (this.consecutive1006Count >= ZALO_DEFAULTS.SOCKET.CONSECUTIVE_1006_ROTATE_THRESHOLD) {
                this.consecutive1006Count = 0;
                return true;
            }
            return false;
        }

        this.consecutive1006Count = 0;
        return this.ctx.settings.features.socket.rotate_error_codes.includes(code);
    }

    private rotateEndpoint() {
        this.rotateCount = (this.rotateCount + 1) % this.urls.length;
        this.wsURL = makeURL(this.ctx, this.urls[this.rotateCount], {
            t: Date.now(),
        });
        logger(this.ctx).verbose(`Rotating endpoint to ${this.wsURL}`);
    }

    public start({ retryOnClose = false }: { retryOnClose?: boolean } = {}) {
        this.isManualStop = false;
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = undefined;
        }

        if (this.ws) {
            const state = this.ws.readyState;
            if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
                logger(this.ctx).warn("Listener is already active or connecting. Skipping duplicate start().");
                return;
            }
            try {
                this.ws.removeAllListeners();
                this.ws.close();
            } catch {
                // ignore
            }
            this.ws = null;
        }

        this.wsURL = makeURL(this.ctx, this.urls[this.rotateCount], {
            t: Date.now(),
        });

        const cookie = this.ctx.cookie.getCookieStringSync(ZALO_DOMAINS.CHAT_WEB);
        const wsAgent =
            this.ctx.options.agent && typeof (this.ctx.options.agent as { dispatch?: unknown }).dispatch !== "function"
                ? this.ctx.options.agent
                : undefined;

        const ws = new WebSocket(this.wsURL, {
            headers: {
                "accept-language": getBrowserLanguage(this.ctx.language),
                "cache-control": "no-cache",
                connection: "Upgrade",
                host: new URL(this.wsURL).host,
                origin: ZALO_DOMAINS.CHAT_WEB,
                pragma: "no-cache",
                "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
                "sec-websocket-version": "13",
                upgrade: "websocket",
                "user-agent": this.userAgent,
                cookie,
            },
            ...(wsAgent ? { agent: wsAgent } : {}),
        });
        this.ws = ws;

        ws.onopen = () => {
            this.consecutive1006Count = 0;
            this.resetRetryCount();
            this.resetWatchdog();
            this.onConnectedCallback();
            this.emit("connected");
        };

        ws.onclose = (event) => {
            this.reset();
            this.emit("disconnected", event.code as CloseReason, event.reason);
            const retry =
                !this.isManualStop &&
                retryOnClose &&
                this.isRetryable(event.code as CloseReason) &&
                this.canRetry(event.code as CloseReason);
            if (retry && retryOnClose) {
                const shouldRotate = this.shouldRotate(event.code as CloseReason);
                if (shouldRotate) {
                    this.rotateEndpoint();
                }
                this.emit("reconnecting", event.code as CloseReason);
                this.retryTimeout = setTimeout(() => {
                    try {
                        this.start({ retryOnClose: true });
                    } catch (error) {
                        logger(this.ctx).error("Failed to auto-restart listener on retry timeout:", error);
                    }
                }, retry);
            } else {
                this.onClosedCallback(event.code, event.reason);
                this.emit("closed", event.code as CloseReason, event.reason);
            }
        };

        ws.onerror = (event) => {
            this.onErrorCallback(event);
            this.emit("error", event);
        };

        ws.onmessage = async (event) => {
            this.resetWatchdog();
            this.emit("pong");
            const { data } = event;
            if (!(data instanceof Buffer)) return;

            const encodedHeader = data.subarray(0, 4);
            const [version, cmd, subCmd] = getHeader(encodedHeader);

            try {
                const dataToDecode = data.subarray(4);
                const decodedData = new TextDecoder("utf-8").decode(dataToDecode);
                if (decodedData.length == 0) return;

                const parsed = JSON.parse(decodedData);

                if (version == 1 && cmd == 1 && subCmd == 1 && hasOwn(parsed, "key")) {
                    this.cipherKey = parsed.key as string;
                    this.emit("cipher_key", this.cipherKey);
                    this.requestOfflineVoipControls();

                    if (this.pingInterval) clearInterval(this.pingInterval);

                    const ping = () => {
                        const payload = {
                            version: 1,
                            cmd: 2,
                            subCmd: 1,
                            data: { eventId: Date.now() },
                        };
                        this.sendWs(payload, false);
                        this.emit("ping");
                    };

                    const pingIntervalTime = Math.min(
                        Math.max(
                            this.ctx.settings?.features?.socket?.ping_interval ||
                                ZALO_DEFAULTS.SOCKET.DEFAULT_PING_INTERVAL_MS,
                            ZALO_DEFAULTS.SOCKET.MIN_PING_INTERVAL_MS,
                        ),
                        ZALO_DEFAULTS.SOCKET.MAX_PING_INTERVAL_MS,
                    );

                    this.pingInterval = setInterval(() => {
                        ping();
                    }, pingIntervalTime);
                }

                await handleRealtimeMessagePacket(
                    this,
                    this.ctx,
                    this.selfListen,
                    this.onMessageCallback,
                    version,
                    cmd,
                    subCmd,
                    parsed,
                    this.cipherKey,
                );

                await handleRealtimeControlPacket(
                    this,
                    this.ctx,
                    this.selfListen,
                    version,
                    cmd,
                    subCmd,
                    parsed,
                    this.cipherKey,
                );

                await handleRealtimeReactionPacket(this, this.ctx, this.selfListen, cmd, parsed, this.cipherKey);

                await handleRealtimeStatusPacket(this, this.ctx, this.selfListen, cmd, subCmd, parsed, this.cipherKey);

                if (version == 1 && cmd == 3000 && subCmd == 0) {
                    logger(this.ctx).error();
                    logger(this.ctx).error("Another connection is opened, closing this one");
                    logger(this.ctx).error();
                    if (ws.readyState !== WebSocket.CLOSED) ws.close(CloseReason.DuplicateConnection);
                }
            } catch (error) {
                if (
                    error instanceof ZaloApiError &&
                    error.message.includes("Invalid data length or missing cipher key")
                ) {
                    logger(this.ctx).verbose(
                        "Ignored undecryptable Zalo packet. This is normal for some reaction/system events.",
                    );
                    return;
                }
                this.onErrorCallback(error);
                this.emit("error", error);
            }
        };
    }

    public stop() {
        this.isManualStop = true;
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = undefined;
        }
        if (this.watchdogTimeout) {
            clearTimeout(this.watchdogTimeout);
            this.watchdogTimeout = undefined;
        }
        if (this.ws) {
            if (this.ws.readyState !== WebSocket.CLOSED && this.ws.readyState !== WebSocket.CLOSING) {
                this.ws.close(CloseReason.ManualClosure);
            }
        }
        this.reset();
    }

    public sendWs(payload: WsPayload, requireId: boolean = true) {
        if (this.ws && (this.ws.readyState === undefined || this.ws.readyState === WebSocket.OPEN)) {
            if (requireId) {
                const reqId = `req_${this.id++}`;
                payload.data["req_id"] = reqId;
                payload.data["reqId"] = reqId;
            }

            const encodedData = new TextEncoder().encode(JSON.stringify(payload.data));
            const dataLength = encodedData.length;

            const buf = Buffer.alloc(4 + dataLength);
            buf.writeUInt8(payload.version, 0);
            buf.writeUInt16LE(payload.cmd, 1);
            buf.writeInt8(payload.subCmd, 3);
            Buffer.from(encodedData).copy(buf, 4);

            this.ws.send(buf);
        }
    }

    /**
     * Request old messages from Zalo WebSocket queue (`cmd 510` for User, `cmd 511` for Group).
     * When `lastMsgId` is `null` or omitted, defaults to `"10000000000000000"` to fetch the latest offline messages.
     *
     * @param threadType ThreadType.User or ThreadType.Group
     * @param lastMsgId Optional cursor message ID (`actionId`) for pagination
     */
    public requestOldMessages(threadType: ThreadType, lastMsgId: string | null = null) {
        const payload = {
            version: 1,
            cmd: threadType === ThreadType.User ? 510 : 511,
            subCmd: 1,
            data: { first: true, lastId: lastMsgId ?? ZALO_DEFAULTS.SOCKET.OLD_MSG_INITIAL_CURSOR, preIds: [] },
        };
        this.sendWs(payload);
    }

    /**
     * Request old reactions
     *
     * @param threadType ThreadType.User or ThreadType.Group
     * @param lastMsgId Optional cursor message ID
     */
    public requestOldReactions(threadType: ThreadType, lastMsgId: string | null = null) {
        const payload = {
            version: 1,
            cmd: threadType === ThreadType.User ? 610 : 611,
            subCmd: 1,
            data: { first: true, lastId: lastMsgId, preIds: [] },
        };
        this.sendWs(payload);
    }

    /**
     * Kéo danh sách tin nhắn cụ thể theo `queueId` và mảng `ids` (`cmd 570` GET_MSG)
     * khi nhận tín hiệu `cmd 533` (`HAS_MSG`) từ Zalo WebSocket (thường dùng cho tin nhắn OA / ZNS / Missed Queue).
     * Tự động chia batch tối đa 20 ID mỗi gói theo đúng cấu hình `max_msg_get = 20` trên Zalo Desktop.
     */
    public requestMessagesByIds(queueId: HasMsgQueueId, ids: HasMsgIdItem[], lastId: string = "0") {
        if (!queueId || !Array.isArray(ids) || ids.length === 0) return;

        const maxBatchSize = 20;
        for (let i = 0; i < ids.length; i += maxBatchSize) {
            const chunk = ids.slice(i, i + maxBatchSize);
            const reqId = `req_${this.id++}`;
            this.sendWs(
                {
                    version: 1,
                    cmd: 570,
                    subCmd: 0,
                    data: {
                        queueId,
                        ids: chunk,
                        lastId,
                        reqId,
                        req_id: reqId,
                    },
                },
                false,
            );
        }
    }

    /**
     * Kích hoạt và kéo hàng đợi sự kiện điều khiển / VoIP (`cmd 603` CTRL_PULL_CTRL).
     * Giúp nhận ngay các cuộc gọi đến đang đổ chuông và sự kiện điều khiển ngay cả khi vừa mở kết nối WebSocket.
     */
    public requestOfflineVoipControls(lastId: string = "1", subCmd?: number) {
        if (subCmd !== undefined) {
            this.sendWs({
                version: 1,
                cmd: 603,
                subCmd,
                data: { first: lastId === "1", lastId, preIds: [] },
            });
            return;
        }
        this.sendWs({
            version: 1,
            cmd: 603,
            subCmd: 0,
            data: { first: lastId === "1", lastId, preIds: [] },
        });
        this.sendWs({
            version: 1,
            cmd: 603,
            subCmd: 1,
            data: { first: lastId === "1", lastId, preIds: [] },
        });
    }

    /**
     * Gửi tín hiệu giữ trạng thái hoạt động (`PING_ACTIVE`, `cmd 2, subCmd 2`) qua WebSocket.
     *
     * @param status Trạng thái hoạt động (`1` = đang hoạt động, `0` = nền)
     */
    public sendPingActive(status: number = 1) {
        this.sendWs(
            {
                version: 1,
                cmd: 2,
                subCmd: 2,
                data: {
                    eventId: Date.now(),
                    status,
                },
            },
            false,
        );
    }

    /**
     * Yêu cầu trạng thái Đã nhận / Đã xem mới nhất qua WebSocket (`GET_LAST_DELIVER_SEEN`, `cmd 577`).
     */
    public requestLastDeliverSeen() {
        this.sendWs({
            version: 1,
            cmd: 577,
            subCmd: 0,
            data: {},
        });
    }

    /**
     * Yêu cầu thời điểm xem cuối cùng của các tab hội thoại phụ qua WebSocket (`GET_LAST_SEEN_CHAT_CONTAINER`, `cmd 578`).
     *
     * @param subtabs Danh sách ID tab phụ cần truy vấn
     */
    public requestLastSeenSubChatTab(subtabs: unknown[]) {
        this.sendWs({
            version: 1,
            cmd: 578,
            subCmd: 0,
            data: {
                data: { subtabs },
            },
        });
    }

    /**
     * Yêu cầu thông tin biểu cảm (Reaction) đã xem cuối cùng qua WebSocket (`CTRL_GET_LAST_SEEN_REACT`, `cmd 614`).
     */
    public requestLastSeenReaction() {
        this.sendWs({
            version: 1,
            cmd: 614,
            subCmd: 0,
            data: {},
        });
    }

    /**
     * Gửi tín hiệu đánh thức thiết bị di động qua WebSocket (`REQUEST_MOBILE_WAKE_UP`, `cmd 592`) để phục vụ đồng bộ dữ liệu.
     */
    public requestMobileWakeUp() {
        this.sendWs({
            version: 1,
            cmd: 592,
            subCmd: 0,
            data: {},
        });
    }

    private reset() {
        this.ws = null;
        this.cipherKey = undefined;
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (this.watchdogTimeout) clearTimeout(this.watchdogTimeout);
    }
}

function getHeader(buffer: Buffer) {
    if (buffer.byteLength < 4) {
        throw new ZaloApiError("Invalid header");
    }

    return [buffer[0], buffer.readUInt16LE(1), buffer[3]];
}
