import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {
    Zalo,
    ThreadType,
    UserMessage,
    type API,
    type OAProfileInfo,
    type ParsedOAMessage,
    type TMessage,
} from "../src/index.js";

const PORT = Number(process.env.OA_STUDIO_PORT ?? 3389);
const CREDENTIALS_PATH = path.resolve(process.cwd(), "test", "credentials.json");
const HTML_PATH = path.resolve(process.cwd(), "test", "oa_studio.html");

let api: API | null = null;
const sseClients = new Set<http.ServerResponse>();

type StoredMessageItem = {
    msgId: string;
    cliMsgId: string;
    actionId: string;
    threadId: string;
    uidFrom: string;
    idTo: string;
    dName: string;
    ts: number;
    msgType: string;
    isSelf: boolean;
    isOA: boolean;
    source: string;
    oaData?: ParsedOAMessage;
    rawContent: unknown;
    rawMessage: unknown;
};

const messageStore = new Map<string, StoredMessageItem>();
const oaProfiles = new Map<string, OAProfileInfo>();

function broadcastSse(payload: Record<string, unknown>): void {
    const line = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of sseClients) {
        try {
            res.write(line);
        } catch {
            sseClients.delete(res);
        }
    }
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => {
            raw += chunk.toString("utf-8");
        });
        req.on("end", () => {
            try {
                resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
            } catch {
                resolve({});
            }
        });
    });
}

async function ensureOAProfile(oaId: string, forceRefresh: boolean = false): Promise<OAProfileInfo | null> {
    const cleanId = String(oaId).trim().split("_")[0];
    if (!cleanId) return null;

    if (!forceRefresh && oaProfiles.has(cleanId)) {
        return oaProfiles.get(cleanId)!;
    }

    if (!api) return null;

    try {
        const profile = await api.business.getOAProfile(cleanId);
        if (profile.isOA || cleanId === "2359864726282056346") {
            oaProfiles.set(cleanId, profile);
            return profile;
        }
    } catch {
        // Ignore lookup error
    }

    return oaProfiles.get(cleanId) ?? null;
}

async function ingestUserMessage(userMsg: UserMessage, source: string): Promise<StoredMessageItem> {
    const raw = userMsg.data;
    const msgId = String(raw.msgId || raw.cliMsgId || `${Date.now()}`);
    const threadId = String(userMsg.threadId);
    const tsNum = Number(raw.ts) || Date.now();
    const isOA = userMsg.isOAMessage() || oaProfiles.has(threadId);

    if (isOA) {
        await ensureOAProfile(threadId);
    }

    const stored: StoredMessageItem = {
        msgId,
        cliMsgId: String(raw.cliMsgId ?? ""),
        actionId: String(raw.actionId ?? ""),
        threadId,
        uidFrom: String(raw.uidFrom ?? ""),
        idTo: String(raw.idTo ?? ""),
        dName: String(raw.dName || oaProfiles.get(threadId)?.displayName || threadId),
        ts: tsNum,
        msgType: String(raw.msgType ?? "webchat"),
        isSelf: userMsg.isSelf,
        isOA,
        source,
        oaData: userMsg.oaData,
        rawContent: raw.content,
        rawMessage: raw,
    };

    messageStore.set(msgId, stored);
    broadcastSse({
        type: "message",
        item: stored,
        oaProfile: oaProfiles.get(threadId),
    });

    return stored;
}

async function syncInitialMessages(): Promise<void> {
    if (!api) return;
    try {
        const preload = await api.preloadConversations();
        for (const msg of preload.pageMessages) {
            await ingestUserMessage(msg, "HTTP preloadConversations (pageMsgs)");
        }
        for (const msg of preload.messages) {
            if (msg.type === ThreadType.User && !messageStore.has(String(msg.data.msgId))) {
                if (msg.isOAMessage() || oaProfiles.has(msg.threadId)) {
                    await ingestUserMessage(msg, "HTTP preloadConversations (msgs)");
                }
            }
        }
    } catch (err) {
        console.error("⚠️ Lỗi preloadConversations:", err);
    }
}

async function initZaloSession(): Promise<void> {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Không tìm thấy file phiên đăng nhập tại ${CREDENTIALS_PATH}`);
    }

    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const zalo = new Zalo({ selfListen: true, logging: false });
    api = await zalo.login(creds);

    await ensureOAProfile("2359864726282056346", true);
    await syncInitialMessages();

    api.listener.on("connected", () => {
        console.log("🟢 [Zalo OA Studio] WebSocket đã kết nối tới máy chủ Zalo!");
        broadcastSse({
            type: "log",
            level: "ok",
            message: "WebSocket Zalo đã kết nối thành công.",
        });
    });

    api.listener.on("cipher_key", () => {
        console.log("🔑 [Zalo OA Studio] Đã nhận cipher_key -> Tự động kéo hàng đợi tin nhắn OA (cmd=510)...");
        broadcastSse({
            type: "log",
            level: "info",
            message: "Đã xác thực cipher_key WebSocket -> Đang đồng bộ hàng đợi tin nhắn OA (cmd=510)...",
        });
        api?.listener.requestOldMessages(ThreadType.User, "1");
    });

    api.listener.on("oa_message", (msg) => {
        console.log(
            `🏢 [Zalo OA Studio - oa_message] msgId=${msg.data.msgId} | kind=${msg.oaData?.kind} | từ=${msg.data.dName || msg.threadId}: ${msg.oaData?.text}`,
        );
        void ingestUserMessage(msg, "WSS oa_message");
    });

    api.listener.on("message", (msg) => {
        if (msg.type === ThreadType.User && !msg.isOAMessage() && oaProfiles.has(msg.threadId)) {
            void ingestUserMessage(msg, "WSS message (501)");
        }
    });

    api.listener.on("old_messages", (msgs, type, hasMore) => {
        if (type === ThreadType.User) {
            const oaCount = msgs.filter((m) => m.type === ThreadType.User && (m.isOAMessage() || oaProfiles.has(m.threadId))).length;
            console.log(`📥 [Zalo OA Studio - old_messages] Nhận ${msgs.length} tin nhắn (${oaCount} tin OA, hasMore=${Boolean(hasMore)})`);
            broadcastSse({
                type: "log",
                level: "ok",
                message: `WebSocket cmd=510 trả về ${oaCount} tin nhắn Zalo OA.`,
            });
            for (const m of msgs) {
                if (m.type === ThreadType.User && (m.isOAMessage() || oaProfiles.has(m.threadId))) {
                    void ingestUserMessage(m, "WSS old_messages (cmd=510)");
                }
            }
        }
    });

    api.listener.on("oa_event", (ev) => {
        console.log(`🔔 [Zalo OA Studio - oa_event] act=${ev.act} oaIds=${ev.oaIds.join(",")}`);
        for (const id of ev.oaIds) {
            const prof = oaProfiles.get(id);
            if (prof) {
                prof.isBlocked = ev.isBlocked;
                prof.dnrStatus.isBlocked = ev.isBlocked;
                oaProfiles.set(id, prof);
            }
        }
        broadcastSse({
            type: "oa_event",
            event: ev,
        });
    });

    api.listener.on("disconnected", (code, reason) => {
        broadcastSse({
            type: "log",
            level: "warn",
            message: `WebSocket ngắt kết nối (code=${code}, reason=${reason})`,
        });
    });

    api.listener.start({ retryOnClose: true });
}

async function startServer(): Promise<void> {
    await initZaloSession();

    const server = http.createServer(async (req, res) => {
        const u = new URL(req.url ?? "/", `http://localhost:${PORT}`);

        if (req.method === "GET" && u.pathname === "/") {
            const html = fs.readFileSync(HTML_PATH, "utf-8");
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(html);
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/events") {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });
            res.write(
                `data: ${JSON.stringify({
                    type: "log",
                    level: "ok",
                    message: "Đã kết nối kênh SSE thời gian thực của Zalo OA Studio",
                })}\n\n`,
            );
            sseClients.add(res);
            req.on("close", () => sseClients.delete(res));
            return;
        }

        if (req.method === "GET" && u.pathname === "/api/state") {
            const allMessages = Array.from(messageStore.values()).sort((a, b) => a.ts - b.ts);
            const allProfiles = Array.from(oaProfiles.values());
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(
                JSON.stringify({
                    ok: true,
                    uid: api?.getOwnId(),
                    oaProfiles: allProfiles,
                    messages: allMessages,
                }),
            );
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/oa/sync") {
            try {
                await syncInitialMessages();
                api?.listener.requestOldMessages(ThreadType.User, "1");
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(
                    JSON.stringify({
                        ok: true,
                        oaProfiles: Array.from(oaProfiles.values()),
                        messages: Array.from(messageStore.values()).sort((a, b) => a.ts - b.ts),
                    }),
                );
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/oa/profile") {
            const body = await readJsonBody(req);
            const oaId = String(body.oaId ?? "").trim();
            if (!oaId) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Thiếu oaId" }));
                return;
            }
            try {
                const profile = await api!.business.getOAProfile(oaId);
                oaProfiles.set(profile.oaId, profile);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, profile }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/oa/send") {
            const body = await readJsonBody(req);
            const oaId = String(body.oaId ?? "").trim();
            const text = String(body.message ?? "").trim();
            if (!oaId || !text) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: "Vui lòng nhập oaId và nội dung tin nhắn" }));
                return;
            }

            try {
                const sendRes = await api!.sendMessage({ msg: text }, oaId, ThreadType.User);
                const sentMsgId = String(sendRes?.message?.msgId ?? Date.now());
                const nowTs = Date.now();
                const syntheticRaw: TMessage = {
                    actionId: sentMsgId,
                    msgId: sentMsgId,
                    cliMsgId: String(nowTs),
                    msgType: "webchat",
                    uidFrom: "0",
                    idTo: oaId,
                    dName: oaProfiles.get(oaId)?.displayName || oaId,
                    ts: String(nowTs),
                    status: 1,
                    content: text,
                    notify: "1",
                    ttl: 0,
                    userId: "0",
                    uin: "0",
                    topOut: "0",
                    topOutTimeOut: "0",
                    topOutImprTimeOut: "0",
                    propertyExt: undefined,
                    paramsExt: { countUnread: 0, containType: 0, platformType: 0 },
                    cmd: 501,
                    st: 1,
                    at: 0,
                    realMsgId: sentMsgId,
                    quote: undefined,
                };
                const userMsg = new UserMessage(api!.getOwnId(), syntheticRaw, true);
                const stored = await ingestUserMessage(userMsg, "HTTP sendMessage -> OA");

                broadcastSse({
                    type: "log",
                    level: "ok",
                    message: `Đã gửi tin nhắn tới OA ${oaId} thành công (msgId=${sentMsgId}): "${text}"`,
                });

                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, sendRes, item: stored }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/oa/block") {
            const body = await readJsonBody(req);
            const oaId = String(body.oaId ?? "").trim();
            const block = Boolean(body.block);
            try {
                const apiRes = block
                    ? await api!.business.blockOA(oaId)
                    : await api!.business.unblockOA(oaId);
                const prof = oaProfiles.get(oaId);
                if (prof) {
                    prof.isBlocked = block;
                    prof.dnrStatus.isBlocked = block;
                    oaProfiles.set(oaId, prof);
                }
                broadcastSse({
                    type: "log",
                    level: "ok",
                    message: `Đã ${block ? "CHẶN (blockOA)" : "BỎ CHẶN (unblockOA)"} OA ${oaId} thành công.`,
                });
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, isBlocked: block, response: apiRes }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/oa/convert-id") {
            const body = await readJsonBody(req);
            const oaIds = Array.isArray(body.oaIds)
                ? body.oaIds.map(String)
                : String(body.oaIds ?? "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
            try {
                const result = await api!.business.convertOAIds(oaIds);
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: true, result }));
            } catch (err) {
                res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
            }
            return;
        }

        if (req.method === "POST" && u.pathname === "/api/oa/simulate") {
            const body = await readJsonBody(req);
            const oaId = String(body.oaId ?? "2359864726282056346").trim();
            const simType = String(body.simType ?? "oa_list");
            const nowTs = Date.now();
            const simMsgId = `sim_${nowTs}`;

            let simRawMsg: TMessage & { footerv2?: unknown };
            if (simType === "oa_list") {
                simRawMsg = {
                    actionId: simMsgId,
                    msgId: simMsgId,
                    cliMsgId: String(nowTs),
                    msgType: "chat.list.action",
                    uidFrom: oaId,
                    idTo: api!.getOwnId(),
                    dName: oaProfiles.get(oaId)?.displayName || "SofttyNet Company Limited",
                    ts: String(nowTs),
                    status: 1,
                    content: {
                        items: [
                            {
                                type: "l.a.header.full",
                                title: "Ra mắt nền tảng tự động hóa Softty.net AI",
                                description: "Giải pháp quản lý bán hàng đa kênh và tích hợp Zalo Official Account tự động.",
                                thumb: oaProfiles.get(oaId)?.cover || oaProfiles.get(oaId)?.avatar || "",
                                href: "https://www.softty.net",
                            },
                            {
                                type: "l.a.normal",
                                title: "Tài liệu tích hợp SDK @softtynet/zca-js",
                                description: "Hỗ trợ đầy đủ Zalo Call 2 chiều, ZCloud và Zalo Official Account (OA).",
                                href: "https://github.com/softtyos/zca-js",
                            },
                        ],
                    },
                    footerv2: {
                        type: 0,
                        data: {
                            canForward: 1,
                            footerList: [
                                { title: "Website SofttyNet", action: "open_url", href: "https://www.softty.net" },
                                { title: "Tư vấn ngay", action: "send_msg", text: "Tư vấn giải pháp OA" },
                            ],
                        },
                    },
                    notify: "1",
                    ttl: 0,
                    userId: oaId,
                    uin: "0",
                    topOut: "1",
                    topOutTimeOut: "315360000",
                    topOutImprTimeOut: "315360000",
                    propertyExt: undefined,
                    paramsExt: { countUnread: 1, containType: 0, platformType: 0 },
                    cmd: 501,
                    st: 5,
                    at: 0,
                    realMsgId: simMsgId,
                    quote: undefined,
                };
            } else {
                simRawMsg = {
                    actionId: simMsgId,
                    msgId: simMsgId,
                    cliMsgId: String(nowTs),
                    msgType: "webchat",
                    uidFrom: oaId,
                    idTo: api!.getOwnId(),
                    dName: oaProfiles.get(oaId)?.displayName || "SofttyNet Company Limited",
                    ts: String(nowTs),
                    status: 1,
                    content: "Xin chào! Đây là tin nhắn tương tác từ Zalo OA kèm nút bấm chân trang (footerv2).",
                    footerv2: {
                        type: 0,
                        data: {
                            canForward: 1,
                            footerList: [
                                { title: "Báo giá dịch vụ", action: "send_msg", text: "Cho tôi xin báo giá" },
                                { title: "Liên hệ kỹ thuật", action: "send_msg", text: "Hỗ trợ kỹ thuật" },
                            ],
                        },
                    },
                    notify: "1",
                    ttl: 0,
                    userId: oaId,
                    uin: "0",
                    topOut: "1",
                    topOutTimeOut: "315360000",
                    topOutImprTimeOut: "315360000",
                    propertyExt: undefined,
                    paramsExt: { countUnread: 1, containType: 0, platformType: 0 },
                    cmd: 501,
                    st: 5,
                    at: 0,
                    realMsgId: simMsgId,
                    quote: undefined,
                };
            }

            const userMsg = new UserMessage(api!.getOwnId(), simRawMsg, true);
            const stored = await ingestUserMessage(userMsg, `OA Simulator (${simType})`);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: true, item: stored }));
            return;
        }

        res.writeHead(404);
        res.end("Not Found");
    });

    server.listen(PORT, () => {
        console.log(`\n========================================================================`);
        console.log(`🏢 ZCA-JS ZALO OA STUDIO ĐÃ CHẠY TẠI: http://localhost:${PORT}`);
        console.log(`👤 Tài khoản đang đăng nhập: ${api?.getOwnId()}`);
        console.log(`🎯 Official Account đã nạp: SofttyNet Company Limited (2359864726282056346)`);
        console.log(`========================================================================\n`);
    });
}

startServer().catch((err) => {
    console.error("❌ Không thể khởi động Zalo OA Studio:", err);
    process.exit(1);
});
