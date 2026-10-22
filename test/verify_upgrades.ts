import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pako from "pako";
import toughCookie from "tough-cookie";
import {
    API,
    CallEventType,
    CallType,
    ClearUnread,
    GroupMessage,
    SyncEventType,
    ThreadType,
    UserMessage,
    decryptWithPrivateKey,
    decryptZdbBuffer,
    deriveZdbAesKey,
    generateRSAKeyPair,
} from "../src/index.js";
import { createContext, type ContextSession } from "../src/context.js";
import { decodeAES, encodeAES, rsaDecryptPkcs1Manual } from "../src/utils.js";

/**
 * ============================================================================
 * BỘ KIỂM ĐỊNH TỰ ĐỘNG TOÀN DIỆN (AUTOMATED VERIFICATION SUITE) CHO ZCA-JS
 * Kiểm tra 100% các API và WebSocket Events vừa nâng cấp:
 *   1. preloadConversations (10053)
 *   2. pullMobile (12000), cancelPullMobile (12700), requestSyncFromPhone
 *   3. getNoisedIds (12390) + fallback zwid.api.zalo.me & decryptGids (12054)
 *   4. getSyncData + RSA-2048 PKCS#1 v1.5 (Native & BigInt CRT) + ZDB4.0 64KB chunk AES-256-CBC
 *   5. sendVoiceCall (11300 + 11301), cancelVoiceCall (11305), endVoiceCall (11306)
 *   6. Listener WebSocket: cmd 510/511 (subCmd 0/1 + deleteMsg undo), cmd 504/524 (unread_cleared),
 *      cmd 601 (syncmsgmb, transfer_msg, voip call_event)
 * ============================================================================
 */

const TEST_SECRET_KEY = Buffer.from("0123456789abcdef0123456789abcdef", "utf-8").toString("base64");
const TEST_UID = "1234567890123456789";
const TEST_IMEI = "test-imei-uuid-1234";

function makeEncryptedZaloHttpResponse(secretKey: string, innerData: unknown, outerErrorCode = 0): Response {
    if (innerData === "") {
        return new Response(
            JSON.stringify({
                error_code: outerErrorCode,
                error_message: "Successful.",
                data: "",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
        );
    }

    const innerJson = JSON.stringify({
        error_code: 0,
        error_message: "Successful.",
        data: innerData,
    });
    const encrypted = encodeAES(secretKey, innerJson);
    return new Response(
        JSON.stringify({
            error_code: outerErrorCode,
            error_message: "Successful.",
            data: encrypted,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
    );
}

function buildWsFrame(version: number, cmd: number, subCmd: number, payloadObj: unknown): Buffer {
    const jsonBytes = Buffer.from(JSON.stringify(payloadObj), "utf-8");
    const header = Buffer.alloc(4);
    header.writeUInt8(version, 0);
    header.writeUInt16LE(cmd, 1);
    header.writeUInt8(subCmd, 3);
    return Buffer.concat([header, jsonBytes]);
}

async function encryptWsPayloadAesGcm(cipherKeyB64: string, dataObj: unknown): Promise<{ encrypt: 2; data: string }> {
    const compressed = Buffer.from(pako.deflate(Buffer.from(JSON.stringify(dataObj), "utf-8")));
    const iv = crypto.randomBytes(16);
    const aad = crypto.randomBytes(16);
    const key = await crypto.subtle.importKey(
        "raw",
        Buffer.from(cipherKeyB64, "base64"),
        { name: "AES-GCM", iv, tagLength: 128, additionalData: aad },
        false,
        ["encrypt"],
    );
    const encrypted = Buffer.from(
        await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128, additionalData: aad }, key, compressed),
    );
    const combined = Buffer.concat([iv, aad, encrypted]);
    return {
        encrypt: 2,
        data: encodeURIComponent(combined.toString("base64")),
    };
}

async function runVerificationSuite() {
    console.log("🚀 Bắt đầu chạy bộ kiểm định tự động các tính năng nâng cấp trên nhánh `lib`...\n");

    const capturedRequests: Array<{ url: string; method: string; body?: unknown }> = [];
    let failPrimaryZnoise = false;

    const zdbKeyPair = generateRSAKeyPair();
    const rawRsaSecret = crypto.randomBytes(16);
    const encryptedKeyB64 = crypto
        .publicEncrypt({ key: zdbKeyPair.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, rawRsaSecret)
        .toString("base64");
    const derivedAesKey = deriveZdbAesKey(rawRsaSecret);

    // Tạo một container ZDB4.0 giả lập dài > 64KB (2 chunks: 65536 + 1024 bytes) để kiểm định giải mã đa khối
    const plainChunk0 = Buffer.alloc(0x10000, 0x41);
    Buffer.from("ZDB4.0", "ascii").copy(plainChunk0, 0);
    const plainChunk1 = Buffer.alloc(1024, 0x42);
    const zeroIv = Buffer.alloc(16, 0);
    const encChunk = (buf: Buffer) => {
        const c = crypto.createCipheriv("aes-256-cbc", derivedAesKey, zeroIv);
        c.setAutoPadding(false);
        return Buffer.concat([c.update(buf), c.final()]);
    };
    const simulatedZdbCrypt = Buffer.concat([encChunk(plainChunk0), encChunk(plainChunk1)]);

    const ctx = createContext(30, 689) as ContextSession;
    ctx.uid = TEST_UID;
    ctx.imei = TEST_IMEI;
    ctx.cookie = new toughCookie.CookieJar();
    ctx.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36";
    ctx.language = "vi";
    ctx.secretKey = TEST_SECRET_KEY;
    ctx.settings = {
        features: {
            sharefile: {
                big_file_domain_list: [],
                max_size_share_file_v2: 100,
                max_size_share_file_v3: 100,
                file_upload_show_icon_1GB: true,
                restricted_ext: "",
                next_file_time: 0,
                max_file: 10,
                max_size_photo: 20,
                max_size_share_file: 100,
                max_size_resize_photo: 10,
                max_size_gif: 10,
                max_size_original_photo: 20,
                chunk_size_file: 1024 * 1024,
                restricted_ext_file: [],
            },
            socket: {
                rotate_error_codes: [3000],
                retries: { internal: { max: 3, times: [1000] } },
                debug: { enable: false },
                ping_interval: 20000,
                reset_endpoint: 1,
                queue_ctrl_actionid_map: {
                    "611_0": "",
                    "610_1": "",
                    "610_0": "",
                    "603_0": "",
                    "611_1": "",
                },
                close_and_retry_codes: [1006],
                max_msg_size: 4096,
                enable_ctrl_socket: true,
                reconnect_after_fallback: true,
                enable_chat_socket: true,
                submit_wss_log: false,
                disable_lp: false,
                offline_monitor: { enable: true },
            },
        },
        keepalive: { alway_keepalive: 1, keepalive_duration: 60, time_deactive: 300 },
    };

    ctx.options.logging = false;
    ctx.options.selfListen = true;
    ctx.options.polyfill = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = String(input);
        const method = init?.method ?? "GET";
        capturedRequests.push({ url: urlStr, method, body: init?.body });

        const u = new URL(urlStr);
        const encryptedParams = u.searchParams.get("params");
        const decodedParams = encryptedParams ? JSON.parse(decodeAES(TEST_SECRET_KEY, encryptedParams)!) : null;

        if (u.pathname === "/api/preloadconvers/get-last-msgs") {
            assert.equal(typeof decodedParams.threadIdLocalMsgId, "string", "threadIdLocalMsgId phải là chuỗi JSON");
            assert.equal(decodedParams.imei, TEST_IMEI);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                msgs: [
                    {
                        actionId: "101",
                        msgId: "2001",
                        cliMsgId: "3001",
                        msgType: "webchat",
                        uidFrom: "999888777",
                        idTo: TEST_UID,
                        dName: "User A",
                        ts: "1760000000000",
                        status: 1,
                        content: "Tin nhắn cá nhân khi offline",
                        notify: 1,
                        ttl: 0,
                        userId: "999888777",
                        uin: "0",
                        cmd: 501,
                        st: 1,
                        at: 0,
                        realMsgId: "2001",
                    },
                ],
                groupMsgs: [
                    {
                        actionId: "102",
                        msgId: "2002",
                        cliMsgId: "3002",
                        msgType: "webchat",
                        uidFrom: "999888777",
                        idTo: "888777666",
                        dName: "Group Member",
                        ts: "1760000001000",
                        status: 1,
                        content: "Tin nhắn nhóm khi offline",
                        notify: 1,
                        ttl: 0,
                        userId: "999888777",
                        uin: "0",
                        cmd: 521,
                        st: 1,
                        at: 0,
                        realMsgId: "2002",
                    },
                ],
                clearUnreads: [
                    {
                        idTo: "999888777",
                        lastMsgId: "2001",
                        isGroup: 0,
                        ts: 1760000002000,
                    },
                ],
            });
        }

        if (u.pathname === "/api/message/pull_mobile_msg" || u.pathname === "/api/message/cancel_pull_mobile_msg") {
            assert.ok(decodedParams.public_key, "Phải có public_key");
            assert.equal(decodedParams.imei, TEST_IMEI);
            // Mô phỏng chính xác hành vi Zalo: trả về data chuỗi rỗng "" và error_code = 0
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, "");
        }

        if (u.pathname === "/api/znoise") {
            if (u.hostname === "profile.zalo.me" && failPrimaryZnoise) {
                return new Response("Internal Server Error", { status: 500 });
            }
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                fids: ["1112223334445556667", "0"],
                gids: ["g7778889990001112223"],
            });
        }

        if (u.pathname === "/api/gid/decrypt") {
            assert.ok(decodedParams.globalUids, "decryptGids phải truyền globalUids JSON");
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                gids: { g_abc: "1112223334445556667" },
            });
        }

        if (u.pathname === "/sync-download/backup.db.crypt") {
            return new Response(simulatedZdbCrypt, {
                status: 200,
                headers: {
                    "content-type": "application/octet-stream",
                    "content-length": String(simulatedZdbCrypt.length),
                },
            });
        }

        if (u.pathname === "/api/voicecall/requestcall") {
            assert.equal(u.searchParams.get("zpw_type"), "24", "VoiceCall phải dùng zpw_type=24");
            assert.equal(decodedParams.calleeId, "5249661060655759359", "Phải giữ nguyên chuỗi UID 19 chữ số");
            assert.equal(decodedParams.typeRequest, CallType.Audio);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                sessId: "5249661060655759359_555666_401",
                rtpIP: "171.244.25.120:4200",
                rtcpIP: "171.244.25.120:4200",
                servers: [{ rtpaddr: "171.244.25.120:4200", rtcpaddr: "171.244.25.120:4200" }],
                zrtpKey: "zrtp-secret-key-base64",
                expiredTime: 60,
                codec: "[]",
            });
        }

        if (u.pathname === "/api/voicecall/request") {
            assert.equal(u.searchParams.get("zpw_type"), "24");
            assert.equal(decodedParams.calleeId, "5249661060655759359");
            assert.equal(decodedParams.session, "5249661060655759359_555666_401");
            assert.equal(decodedParams.subCommand, 3);
            const ext = JSON.parse(decodedParams.extendData);
            assert.equal(ext.rtp[0].ip, "171.244.25.120");
            assert.equal(ext.rtp[0].port, 4200);
            assert.equal(ext.rtcp[0].port, 4200);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { status: 0 });
        }

        if (u.pathname === "/api/voicecall/cancel") {
            assert.equal(u.searchParams.get("zpw_type"), "24");
            assert.equal(decodedParams.callerId, "5249661060655759359");
            assert.equal(decodedParams.status, 0);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { status: 0 });
        }

        if (u.pathname === "/api/voicecall/endcall") {
            assert.equal(u.searchParams.get("zpw_type"), "24");
            assert.equal(decodedParams.uidTo, "5249661060655759359");
            assert.equal(decodedParams.status, 3);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { status: 0 });
        }

        throw new Error(`Unexpected request URL in test: ${urlStr}`);
    }) as typeof fetch;

    const serviceMap = new Proxy(
        {},
        {
            get(_target, prop: string) {
                return [`https://${prop.replace(/_/g, "")}.zalo.me`];
            },
        },
    ) as unknown as ConstructorParameters<typeof API>[1];

    const api = new API(ctx, serviceMap, ["wss://ws.chat.zalo.me/sub"]);

    // -------------------------------------------------------------------------
    // TEST 1: preloadConversations (command 10053)
    // -------------------------------------------------------------------------
    const preloadRes = await api.preloadConversations({ "999888777": "2000" });
    assert.equal(preloadRes.messages.length, 2, "Phải parse đủ 2 tin nhắn (1 User + 1 Group)");
    assert.ok(preloadRes.messages[0] instanceof UserMessage);
    assert.ok(preloadRes.messages[1] instanceof GroupMessage);
    assert.equal(preloadRes.unreadCleared.length, 1);
    assert.ok(preloadRes.unreadCleared[0] instanceof ClearUnread);
    assert.equal(preloadRes.unreadCleared[0].idTo, "999888777");
    console.log("✅ [1/6] preloadConversations: Chính xác tham số threadIdLocalMsgId & parse messages/unreadCleared.");

    // -------------------------------------------------------------------------
    // TEST 2: requestSyncFromPhone, pullMobile (12000), cancelPullMobile (12700)
    // -------------------------------------------------------------------------
    const syncSession = await api.requestSyncFromPhone({ pcName: "Zalo-Test-Mac" });
    assert.equal(syncSession.success, true);
    assert.equal(syncSession.pcName, "Zalo-Test-Mac");
    assert.ok(syncSession.publicKeyBase64.length > 100);
    assert.ok(syncSession.privateKey.includes("BEGIN PRIVATE KEY"));

    await api.cancelPullMobile({ public_key: syncSession.publicKeyBase64, pc_name: "Zalo-Test-Mac" });
    console.log("✅ [2/6] requestSyncFromPhone / pullMobile / cancelPullMobile: Vượt qua kiểm tra data rỗng (error_code=0).");

    // -------------------------------------------------------------------------
    // TEST 3: getNoisedIds (12390) + Fallback zwid.api.zalo.me & decryptGids (12054)
    // -------------------------------------------------------------------------
    const noised1 = await api.getNoisedIds({ fids: ["12345", "67890"], gids: ["55555"] });
    assert.deepEqual(noised1.fids, ["1112223334445556667", ""]);
    assert.deepEqual(noised1.gids, ["7778889990001112223"]);

    failPrimaryZnoise = true;
    const noisedFallback = await api.getNoisedIds({ fids: [12345], gids: [55555] });
    assert.deepEqual(noisedFallback.fids, ["1112223334445556667"]);
    assert.deepEqual(noisedFallback.gids, ["7778889990001112223"]);

    const decryptedGids = await api.decryptGids(["g_abc"]);
    assert.equal(decryptedGids.gids?.g_abc, "1112223334445556667");
    console.log("✅ [3/6] getNoisedIds (primary + fallback zwid.api.zalo.me) & decryptGids (globalUids): Hoạt động chính xác.");

    // -------------------------------------------------------------------------
    // TEST 4: getSyncData + RSA PKCS#1 v1.5 (Native & Manual CRT) + ZDB4.0 Decrypt
    // -------------------------------------------------------------------------
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zca-sync-test-"));
    try {
        const dlRes = await api.getSyncData({
            url: "https://file.zalo.me/sync-download/backup.db.crypt",
            encrypted_key: encryptedKeyB64,
            file_name: "backup_test",
            file_size: simulatedZdbCrypt.length,
            checksum_code: "md5-test",
            from_seq_id: 0,
            is_full_transfer: 1,
            savePath: tmpDir,
        });
        assert.equal(dlRes.success, true);
        assert.ok(dlRes.data?.file_path.endsWith("backup_test.db.crypt"));

        const rawDecrypted1 = decryptWithPrivateKey(zdbKeyPair.privateKey, encryptedKeyB64);
        const rawDecrypted2 = rsaDecryptPkcs1Manual(zdbKeyPair.privateKey, Buffer.from(encryptedKeyB64, "base64"));
        assert.ok(rawDecrypted1.equals(rawRsaSecret), "Native RSA decrypt phải khớp");
        assert.ok(rawDecrypted2.equals(rawRsaSecret), "BigInt CRT Manual RSA decrypt phải khớp");

        const aesKey = deriveZdbAesKey(rawDecrypted2);
        const savedCrypt = fs.readFileSync(dlRes.data!.file_path);
        const recoveredZdb = decryptZdbBuffer(savedCrypt, aesKey);
        assert.equal(recoveredZdb.length, plainChunk0.length + plainChunk1.length);
        assert.ok(recoveredZdb.subarray(0, 6).equals(Buffer.from("ZDB4.0", "ascii")));
        assert.equal(recoveredZdb[0x10000], 0x42, "Chunk thứ 2 (sau 64KB) phải giải mã đúng với IV=0 độc lập");
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    console.log("✅ [4/6] getSyncData + RSA-2048 (Native & BigInt CRT) + ZDB4.0 64KB multi-chunk AES-256-CBC: Hoạt động chính xác.");

    // -------------------------------------------------------------------------
    // TEST 5: Voice Call Signaling (sendVoiceCall 11300+11301, cancelVoiceCall 11305, endVoiceCall 11306)
    // -------------------------------------------------------------------------
    const callRes = await api.sendVoiceCall("5249661060655759359", { callType: CallType.Audio, callId: 555666 });
    assert.equal(callRes.callId, 555666);
    assert.equal(callRes.sessId, "5249661060655759359_555666_401");
    assert.equal(callRes.rtpServer, "171.244.25.120:4200");
    assert.equal(callRes.rtcpServer, "171.244.25.120:4200");
    assert.equal(callRes.zrtpKey, "zrtp-secret-key-base64");

    await api.cancelVoiceCall("5249661060655759359", 555666);
    await api.endVoiceCall("5249661060655759359", 555666);
    console.log("✅ [5/6] sendVoiceCall (2-step 11300->11301) / cancelVoiceCall (11305) / endVoiceCall (11306): Hoạt động chính xác.");

    // -------------------------------------------------------------------------
    // TEST 6: Listener WebSocket Events (510/511, 504/524, 601 sync_event & call_event)
    // -------------------------------------------------------------------------
    const wsCipherKey = crypto.randomBytes(16).toString("base64");
    const sentWsPayloads: unknown[] = [];
    const listenerAny = api.listener as unknown as {
        cipherKey: string;
        ws: { send: (data: DataView) => void; readyState: number };
    };

    listenerAny.cipherKey = wsCipherKey;
    listenerAny.ws = {
        readyState: 1,
        send(view: DataView) {
            const buf = Buffer.from(view.buffer, view.byteOffset, view.byteLength);
            const version = buf.readUInt8(0);
            const cmd = buf.readUInt16LE(1);
            const subCmd = buf.readUInt8(3);
            const json = JSON.parse(buf.subarray(4).toString("utf-8"));
            sentWsPayloads.push({ version, cmd, subCmd, json });
        },
    };

    // Kiểm tra requestOldMessages mặc định lastId = "10000000000000000"
    api.listener.requestOldMessages(ThreadType.User);
    assert.equal(sentWsPayloads.length, 1);
    const firstSent = sentWsPayloads[0] as { cmd: number; subCmd: number; json: { lastId: string } };
    assert.equal(firstSent.cmd, 510);
    assert.equal(firstSent.subCmd, 1);
    assert.equal(firstSent.json.lastId, "10000000000000000");
    listenerAny.ws = null as unknown as typeof listenerAny.ws;

    // Gắn mock onmessage từ Listener bằng cách tạo fake WebSocket thông qua xử lý gói tin trực tiếp
    const receivedOldUserMsgs: UserMessage[][] = [];
    const receivedOldGroupMsgs: Array<{ msgs: GroupMessage[]; hasMore?: boolean }> = [];
    const receivedUndos: unknown[] = [];
    const receivedUnreadCleared: ClearUnread[][] = [];
    const receivedSyncEvents: unknown[] = [];
    const receivedCallEvents: unknown[] = [];

    api.listener.on("old_messages", (msgs, type, hasMore) => {
        if (type === ThreadType.User) receivedOldUserMsgs.push(msgs as UserMessage[]);
        else receivedOldGroupMsgs.push({ msgs: msgs as GroupMessage[], hasMore });
    });
    api.listener.on("undo", (u) => receivedUndos.push(u));
    api.listener.on("unread_cleared", (items) => receivedUnreadCleared.push(items));
    api.listener.on("sync_event", (ev) => receivedSyncEvents.push(ev));
    api.listener.on("call_event", (ev) => receivedCallEvents.push(ev));

    // Khởi tạo 1 socket nội bộ ngắn để kích hoạt đúng hàm ws.onmessage thật của Listener
    const { WebSocketServer } = await import("ws");
    const wss = new WebSocketServer({ port: 0 });
    const port = (wss.address() as { port: number }).port;
    (api.listener as unknown as { urls: string[] }).urls = [`ws://127.0.0.1:${port}`];

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("WebSocket test timeout")), 5000);
        wss.on("connection", async (serverWs) => {
            try {
                // 1. Gửi cipher_key (cmd=1, subCmd=1)
                serverWs.send(buildWsFrame(1, 1, 1, { key: wsCipherKey }));

                // 2. Gửi cmd=510, subCmd=0 (tin nhắn thường + 1 tin nhắn thu hồi deleteMsg)
                const frame510 = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        msgs: [
                            {
                                actionId: "1",
                                msgId: "9001",
                                cliMsgId: "9001",
                                msgType: "webchat",
                                uidFrom: "111",
                                idTo: TEST_UID,
                                dName: "Tester",
                                ts: "1760000000000",
                                status: 1,
                                content: "Hello 510 subCmd 0",
                                notify: 1,
                                ttl: 0,
                                userId: "111",
                                uin: "0",
                                cmd: 510,
                                st: 1,
                                at: 0,
                                realMsgId: "9001",
                            },
                            {
                                actionId: "2",
                                msgId: "9002",
                                cliMsgId: "9002",
                                msgType: "chat.undo",
                                uidFrom: "111",
                                idTo: TEST_UID,
                                dName: "Tester",
                                ts: "1760000001000",
                                status: 1,
                                content: { deleteMsg: 1, globalMsgId: 9001, cliMsgId: 9001, destId: 111 },
                                notify: 1,
                                ttl: 0,
                                userId: "111",
                                uin: "0",
                                cmd: 510,
                                st: 1,
                                at: 0,
                                realMsgId: "9002",
                            },
                        ],
                        more: 0,
                    },
                });
                serverWs.send(buildWsFrame(1, 510, 0, frame510));

                // 3. Gửi cmd=511, subCmd=1 (Group old_messages với more=1)
                const frame511 = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        groupMsgs: [
                            {
                                actionId: "3",
                                msgId: "9003",
                                cliMsgId: "9003",
                                msgType: "webchat",
                                uidFrom: "111",
                                idTo: "222",
                                dName: "Group Tester",
                                ts: "1760000002000",
                                status: 1,
                                content: "Hello Group 511",
                                notify: 1,
                                ttl: 0,
                                userId: "111",
                                uin: "0",
                                cmd: 511,
                                st: 1,
                                at: 0,
                                realMsgId: "9003",
                            },
                        ],
                        more: 1,
                    },
                });
                serverWs.send(buildWsFrame(1, 511, 1, frame511));

                // 4. Gửi cmd=504, subCmd=0 (unread_cleared)
                const frame504 = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        clearUnreads: [{ idTo: "222", lastMsgId: "9003", isGroup: 1, ts: 1760000003000 }],
                    },
                });
                serverWs.send(buildWsFrame(1, 504, 0, frame504));

                // 5. Gửi cmd=601, subCmd=0 (syncmsgmb + transfer_msg + voip)
                const frame601 = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        controls: [
                            {
                                content: {
                                    act_type: "syncmsgmb",
                                    act: "user_confirm",
                                    data: JSON.stringify({
                                        user_action: 1,
                                        public_key: zdbKeyPair.publicKeyBase64,
                                        pc_name: "Web",
                                    }),
                                },
                            },
                            {
                                content: {
                                    act_type: "transfer_msg",
                                    act: "transfer_after_login",
                                    data: JSON.stringify({
                                        temp_key: "auto-sync-temp-key-xyz",
                                        imei: TEST_IMEI,
                                    }),
                                },
                            },
                            {
                                content: {
                                    act_type: "voip",
                                    act: "answer",
                                    data: JSON.stringify({
                                        callId: 555666,
                                        callerId: TEST_UID,
                                        calleeId: "987654321",
                                        status: 0,
                                    }),
                                },
                            },
                        ],
                    },
                });
                serverWs.send(buildWsFrame(1, 601, 0, frame601));

                setTimeout(() => {
                    clearTimeout(timeout);
                    resolve();
                }, 250);
            } catch (err) {
                clearTimeout(timeout);
                reject(err);
            }
        });

        api.listener.start();
    });

    api.listener.stop();
    wss.close();

    assert.equal(receivedOldUserMsgs.length, 1, "Phải nhận được 1 lô old_messages cá nhân (subCmd=0)");
    assert.equal(receivedOldUserMsgs[0].length, 1, "Tin nhắn deleteMsg phải được lọc ra khỏi old_messages");
    assert.equal(receivedUndos.length, 1, "Tin nhắn deleteMsg trong cmd 510 phải phát sự kiện undo");
    assert.equal(receivedOldGroupMsgs.length, 1, "Phải nhận được 1 lô old_messages nhóm");
    assert.equal(receivedOldGroupMsgs[0].hasMore, true, "Cờ hasMore phải là true khi more=1");
    assert.equal(receivedUnreadCleared.length, 1, "Phải nhận được sự kiện unread_cleared từ cmd 504");
    assert.equal(receivedUnreadCleared[0][0].isGroup, true);
    assert.equal(receivedSyncEvents.length, 2, "Phải nhận đủ 2 sync_event (user_confirm + transfer_after_login)");
    assert.equal((receivedSyncEvents[0] as { type: string }).type, SyncEventType.USER_CONFIRM);
    assert.equal((receivedSyncEvents[1] as { type: string }).type, SyncEventType.TRANSFER_AFTER_LOGIN);
    assert.equal(receivedCallEvents.length, 1, "Phải nhận được sự kiện call_event (voip answer)");
    assert.equal((receivedCallEvents[0] as { type: string }).type, CallEventType.ANSWER);

    console.log("✅ [6/6] Listener WebSocket (510/511 subCmd 0&1, undo, 504 unread_cleared, 601 sync_event & call_event): Hoạt động chính xác.");
    console.log("\n🎉 TẤT CẢ 6 HẠNG MỤC KIỂM ĐỊNH ĐỀU VƯỢT QUA 100%!");
}

runVerificationSuite().catch((err) => {
    console.error("❌ Kiểm định thất bại:", err);
    process.exit(1);
});
