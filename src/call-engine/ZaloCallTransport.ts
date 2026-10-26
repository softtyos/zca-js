import crypto from "node:crypto";
import EventEmitter from "node:events";
import fs from "node:fs";
import net from "node:net";
import { Buffer } from "node:buffer";

export type ZaloCallIpcMessage = {
    type: string;
    command?: number | string;
    data?: unknown;
    [key: string]: unknown;
};

/**
 * Khoá AES-128-CBC tĩnh chuẩn trong module `4KIH` của Zalo PC và binary `ZaloCall` (`yjAF9oqMWl6XfXYJn9mA7w==`).
 */
export const DEFAULT_ZALOCALL_IPC_KEY_BASE64 = "yjAF9oqMWl6XfXYJn9mA7w==";

export type ZaloCallTransportOptions = {
    /**
     * Hậu tố định danh cho Unix Domain Socket / Named Pipe (mặc định dùng `process.pid`
     * để cô lập hoàn toàn, không đụng độ với Zalo PC đang chạy có hậu tố `1111111111`).
     */
    socketId?: string;
    /**
     * Khoá AES-128-CBC dạng Base64 (mặc định `yjAF9oqMWl6XfXYJn9mA7w==`).
     */
    keyBase64?: string;
    /**
     * Thời gian chờ phản hồi `"ack"` tối đa trên một khung truyền (mặc định `250` ms).
     */
    ackTimeoutMs?: number;
};

export interface ZaloCallTransportEvents {
    ready: [];
    client_connected: [];
    message: [message: ZaloCallIpcMessage];
    raw_ack: [];
    error: [error: unknown];
    close: [];
}

const MAX_IPC_CHUNK_LENGTH = 4000;
const MAX_IPC_RECEIVE_BUFFER_LENGTH = 4 * 1024 * 1024;

/**
 * Tầng giao thức IPC双kênh (`receiveSocketPath` & `sendSocketPath`) mã hoá AES-128-CBC (Hex + `$` framing + 4000-char chunking)
 * khớp 100% với module `3Zc2` / `4KIH` của Zalo PC và `zrtc_call::ZIpcClientMac` (`0x10012eb50`).
 */
export class ZaloCallTransport extends EventEmitter<ZaloCallTransportEvents> {
    public readonly socketId: string;
    public readonly sendSocketPath: string;
    public readonly receiveSocketPath: string;
    public readonly keyBase64: string;

    private readonly keyBuffer: Buffer;
    private readonly ivBuffer: Buffer;
    private readonly ackTimeoutMs: number;

    private sendServer: net.Server | null = null;
    private receiveServer: net.Server | null = null;
    private sendClient: net.Socket | null = null;
    private receiveClient: net.Socket | null = null;

    private receiveBuffer = "";
    private outgoingQueue: string[] = [];
    private waitingForAck = false;
    private ackTimer: ReturnType<typeof setTimeout> | null = null;
    private emittedConnected = false;

    constructor(options: ZaloCallTransportOptions = {}) {
        super();
        this.socketId = options.socketId ?? `${process.pid}_${Math.floor(Math.random() * 10000)}`;
        this.keyBase64 = options.keyBase64 ?? DEFAULT_ZALOCALL_IPC_KEY_BASE64;
        this.ackTimeoutMs = options.ackTimeoutMs ?? 250;

        const decodedKey = Buffer.from(this.keyBase64, "base64");
        this.keyBuffer = Buffer.alloc(16, 0);
        decodedKey.copy(this.keyBuffer, 0, 0, Math.min(16, decodedKey.length));
        this.ivBuffer = Buffer.alloc(16, 0);

        if (process.platform === "win32") {
            this.receiveSocketPath = `\\\\.\\pipe\\receive_socket_${this.socketId}`;
            this.sendSocketPath = `\\\\.\\pipe\\send_socket_${this.socketId}`;
        } else {
            this.receiveSocketPath = `/tmp/zcall_r_${this.socketId}`;
            this.sendSocketPath = `/tmp/zcall_s_${this.socketId}`;
        }
    }

    /**
     * Mã hoá đối tượng JSON thành mảng các mảnh Hex (tối đa 4000 ký tự/mảnh, mảnh cuối kết thúc bằng `$`).
     */
    public encryptFrames(payload: unknown): string[] {
        const json = typeof payload === "string" ? payload : JSON.stringify(payload);
        const cipher = crypto.createCipheriv("aes-128-cbc", this.keyBuffer, this.ivBuffer);
        const encryptedHex = cipher.update(json, "utf-8", "hex") + cipher.final("hex");

        const chunks: string[] = [];
        let offset = 0;
        while (offset < encryptedHex.length) {
            chunks.push(encryptedHex.slice(offset, offset + MAX_IPC_CHUNK_LENGTH));
            offset += MAX_IPC_CHUNK_LENGTH;
        }
        if (chunks.length === 0) {
            chunks.push("$");
        } else {
            chunks[chunks.length - 1] += "$";
        }
        return chunks;
    }

    /**
     * Giải mã một khung chuỗi Hex (không bao gồm ký tự `$`) thành đối tượng JSON.
     */
    public decryptFrame(encryptedHex: string): ZaloCallIpcMessage {
        const clean = encryptedHex.endsWith("$") ? encryptedHex.slice(0, -1) : encryptedHex;
        const decipher = crypto.createDecipheriv("aes-128-cbc", this.keyBuffer, this.ivBuffer);
        const plain = decipher.update(clean, "hex", "utf-8") + decipher.final("utf-8");
        return JSON.parse(plain) as ZaloCallIpcMessage;
    }

    /**
     * Khởi tạo 2 máy chủ IPC (`receiveSocketPath` và `sendSocketPath`) sẵn sàng đón tiến trình `ZaloCall`.
     */
    public async start(): Promise<void> {
        this.unlinkUnixSockets();
        this.emittedConnected = false;

        this.sendServer = net.createServer((socket) => {
            this.sendClient = socket;
            socket.on("data", (chunk) => {
                const text = chunk.toString("utf-8");
                if (text.includes("ack")) {
                    this.emit("raw_ack");
                    this.onAckReceived();
                }
            });
            socket.on("error", (err) => this.emit("error", err));
            this.checkBothConnected();
            this.flushOutgoingQueue();
        });

        this.receiveServer = net.createServer((socket) => {
            this.receiveClient = socket;
            socket.on("data", (chunk) => {
                this.handleReceiveChunk(chunk.toString("utf-8"));
            });
            socket.on("error", (err) => this.emit("error", err));
            this.checkBothConnected();
        });

        await Promise.all([
            new Promise<void>((resolve, reject) => {
                this.receiveServer!.once("error", reject);
                this.receiveServer!.listen(this.receiveSocketPath, () => {
                    if (process.platform !== "win32") {
                        try {
                            fs.chmodSync(this.receiveSocketPath, 0o600);
                        } catch {
                            // Ignore chmod error if unsupported
                        }
                    }
                    resolve();
                });
            }),
            new Promise<void>((resolve, reject) => {
                this.sendServer!.once("error", reject);
                this.sendServer!.listen(this.sendSocketPath, () => {
                    if (process.platform !== "win32") {
                        try {
                            fs.chmodSync(this.sendSocketPath, 0o600);
                        } catch {
                            // Ignore chmod error if unsupported
                        }
                    }
                    resolve();
                });
            }),
        ]);

        this.emit("ready");
    }

    /**
     * Gửi một thông điệp IPC đã mã hoá AES-128-CBC xuống tiến trình `ZaloCall` (qua hàng đợi `"ack"`).
     */
    public send(message: ZaloCallIpcMessage): void {
        const frames = this.encryptFrames(message);
        this.outgoingQueue.push(...frames);
        this.flushOutgoingQueue();
    }

    public isConnected(): boolean {
        return Boolean(
            this.sendClient && !this.sendClient.destroyed && this.receiveClient && !this.receiveClient.destroyed,
        );
    }

    /**
     * Đóng toàn bộ kết nối và dọn dẹp file socket trên đĩa.
     */
    public async close(): Promise<void> {
        if (this.ackTimer) {
            clearTimeout(this.ackTimer);
            this.ackTimer = null;
        }
        this.outgoingQueue = [];
        this.waitingForAck = false;
        this.emittedConnected = false;

        if (this.sendClient) {
            this.sendClient.destroy();
            this.sendClient = null;
        }
        if (this.receiveClient) {
            this.receiveClient.destroy();
            this.receiveClient = null;
        }

        await Promise.all([
            new Promise<void>((resolve) => {
                if (this.sendServer) this.sendServer.close(() => resolve());
                else resolve();
            }),
            new Promise<void>((resolve) => {
                if (this.receiveServer) this.receiveServer.close(() => resolve());
                else resolve();
            }),
        ]);

        this.sendServer = null;
        this.receiveServer = null;
        this.unlinkUnixSockets();
        this.emit("close");
    }

    private checkBothConnected(): void {
        if (this.isConnected() && !this.emittedConnected) {
            this.emittedConnected = true;
            this.emit("client_connected");
        }
    }

    private onAckReceived(): void {
        if (this.ackTimer) {
            clearTimeout(this.ackTimer);
            this.ackTimer = null;
        }
        this.waitingForAck = false;
        this.flushOutgoingQueue();
    }

    private flushOutgoingQueue(): void {
        if (this.waitingForAck || !this.sendClient || this.sendClient.destroyed) {
            return;
        }
        const nextFrame = this.outgoingQueue.shift();
        if (!nextFrame) return;

        this.waitingForAck = true;
        this.sendClient.write(nextFrame, "utf-8");

        this.ackTimer = setTimeout(() => {
            this.waitingForAck = false;
            this.flushOutgoingQueue();
        }, this.ackTimeoutMs);

        if (typeof this.ackTimer.unref === "function") {
            this.ackTimer.unref();
        }
    }

    private handleReceiveChunk(chunk: string): void {
        if (this.receiveBuffer.length + chunk.length > MAX_IPC_RECEIVE_BUFFER_LENGTH) {
            this.receiveBuffer = "";
            this.emit("error", new Error("IPC receive buffer exceeded maximum allowed size (4MB)"));
            return;
        }
        this.receiveBuffer += chunk;

        let dollarIdx = this.receiveBuffer.indexOf("$");
        while (dollarIdx !== -1) {
            const frame = this.receiveBuffer.slice(0, dollarIdx);
            this.receiveBuffer = this.receiveBuffer.slice(dollarIdx + 1);

            if (frame.length > 0) {
                try {
                    const parsed = this.decryptFrame(frame);
                    this.emit("message", parsed);
                } catch (err) {
                    this.emit("error", err);
                }
            }

            dollarIdx = this.receiveBuffer.indexOf("$");
        }
    }

    private unlinkUnixSockets(): void {
        if (process.platform === "win32") return;
        for (const p of [this.sendSocketPath, this.receiveSocketPath]) {
            try {
                if (fs.existsSync(p)) fs.unlinkSync(p);
            } catch {
                // Ignore unlink errors
            }
        }
    }
}
