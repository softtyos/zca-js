import assert from "node:assert/strict";
import crypto from "node:crypto";
import dgram from "node:dgram";
import fs from "node:fs";
import net from "node:net";
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
    ZRTCMediaSubCommand,
    ZRTPControlCommand,
    ZRTPLegacyMediaType,
    ZRTCRole,
    ZaloSrtpSession,
    buildInitCallRequest,
    buildInitCallResponse,
    buildPingRequest,
    buildRtpPacket,
    decryptWithPrivateKey,
    decryptZCloudAES,
    decryptZdbBuffer,
    deriveZdbAesKey,
    encryptZCloudAES,
    formatOAHighlightText,
    generateRSAKeyPair,
    generateSrtpMasterKeyBase64,
    isOAProfile,
    isOAVerified,
    isZaloBot,
    normalizeOAProfile,
    parseIncomingCallEvent,
    parseOADnrStatus,
    parseOAFooter,
    parseOAMessage,
    parseRtpPacket,
    parseZRTPPacket,
    wrapLegacyMediaPacket,
    wrapZrtcMediaPacket,
} from "../src/index.js";
import { createContext, type ContextSession } from "../src/context.js";
import { decodeEventData } from "../src/crypto/ws-cipher.js";
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
        { name: "AES-GCM" },
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
        const encryptedParams =
            u.searchParams.get("params") ??
            (init?.body instanceof URLSearchParams ? init.body.get("params") : null);
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
                pageMsgs: [
                    {
                        actionId: "103",
                        msgId: "2003",
                        cliMsgId: "3003",
                        msgType: "chat.list.action",
                        uidFrom: "4455667788990011223",
                        idTo: TEST_UID,
                        dName: "Zalo Official Account",
                        ts: "1760000001500",
                        status: 1,
                        content: [
                            {
                                type: "l.a.header.full",
                                title: "Thông báo từ Zalo OA khi preload",
                                description: "Chi tiết thông báo OA",
                            },
                        ],
                        notify: 1,
                        ttl: 0,
                        userId: "4455667788990011223",
                        uin: "0",
                        cmd: 501,
                        st: 1,
                        at: 0,
                        realMsgId: "2003",
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
            assert.ok(
                decodedParams.typeRequest === CallType.Audio || decodedParams.typeRequest === CallType.Video,
                "typeRequest phải là CallType.Audio (1) hoặc CallType.Video (3)",
            );
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                sessId: `5249661060655759359_${decodedParams.callId}_401`,
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
            assert.ok(
                decodedParams.session === `5249661060655759359_${decodedParams.callId}_401` ||
                    decodedParams.session === "5249661060655759359_998877_401",
            );
            assert.equal(decodedParams.subCommand, 3);
            const ext = JSON.parse(decodedParams.extendData);
            if (Array.isArray(ext.rtp) && decodedParams.rtpAddress === "171.244.25.120:4200") {
                assert.equal(ext.rtp[0].ip, "171.244.25.120");
                assert.equal(ext.rtp[0].port, 4200);
                assert.equal(ext.rtcp[0].port, 4200);
            } else if (Array.isArray(ext.serverAddr)) {
                assert.ok(ext.serverAddr[0].rtp);
            }
            if (decodedParams.callId === 777888 || decodedParams.callId === 510001) {
                assert.equal(ext.callType, 1, "Video Call phải truyền extendData.callType = 1");
                assert.equal(ext.video.codec[0].name, "h264", "Video Call phải truyền codec h264");
                assert.equal(ext.video.codec[0].payload, 97);
            } else {
                assert.equal(ext.callType, 0, "Audio Call phải truyền extendData.callType = 0");
            }
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { status: 0 });
        }

        if (u.pathname === "/api/voicecall/cancel") {
            assert.equal(u.searchParams.get("zpw_type"), "24");
            assert.equal(decodedParams.callerId, "5249661060655759359");
            assert.ok(
                decodedParams.callType === 0 ||
                    decodedParams.callType === 1 ||
                    decodedParams.callType === CallType.Audio ||
                    decodedParams.callType === CallType.Video,
            );
            assert.equal(decodedParams.status, 0);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { status: 0 });
        }

        if (u.pathname === "/api/voicecall/endcall") {
            assert.equal(u.searchParams.get("zpw_type"), "24");
            assert.equal(decodedParams.uidTo, "5249661060655759359");
            assert.equal(decodedParams.status, 3);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { status: 0 });
        }

        if (u.pathname.startsWith("/api/voicecall/")) {
            assert.equal(u.searchParams.get("zpw_type"), "24", `Endpoint ${u.pathname} phải dùng zpw_type=24`);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                status: 0,
                endpoint: u.pathname,
                params: decodedParams,
            });
        }

        if (u.pathname === "/api/getCloudViewerKey") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                viewer_key: "vk-cloud-test-123",
                enk: "enk-cloud-test-456",
            });
        }

        if (u.pathname === "/api/group/getmg-v2") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                removedsGroup: [],
                unchangedsGroup: [],
                gridInfoMap: {
                    "888999000": {
                        groupId: "888999000",
                        name: "Cộng đồng Ẩn Thành Viên",
                        totalMember: 500,
                        creatorId: "1000000000000000001",
                        adminIds: ["1000000000000000002"],
                        memVerList: ["1000000000000000001_0", "1000000000000000002_0", `${TEST_UID}_0`],
                        setting: {
                            lockViewMember: 1,
                            joinAppr: 0,
                            enableMsgHistory: 1,
                        },
                    },
                },
            });
        }

        if (u.pathname === "/api/group/getgi/v2") {
            const mpage = Number(decodedParams.mpage ?? 1);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                groupId: "888999000",
                name: "Cộng đồng Ẩn Thành Viên",
                totalMember: 500,
                creatorId: "1000000000000000001",
                adminIds: ["1000000000000000002"],
                currentMems:
                    mpage === 1
                        ? [{ id: "1000000000000000001", dName: "Admin 1", zaloName: "Admin 1", avatar: "" }]
                        : [{ id: "2000000000000000001", dName: "Mem V2", zaloName: "Mem V2", avatar: "" }],
                memberIds: mpage === 1 ? ["1000000000000000001"] : ["2000000000000000001"],
                hasMoreMember: mpage === 1 ? 1 : 0,
                setting: { lockViewMember: 1 },
            });
        }

        if (u.pathname === "/api/group/getlg/v3") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                groups: [{ groupId: "888999000", name: "Cộng đồng Ẩn Thành Viên", totalMember: 500 }],
                hasMore: 0,
                total: 1,
            });
        }

        if (u.pathname === "/api/mediastore/preview") {
            // Mô phỏng chính xác JSON thực tế của Zalo: owner_id là số nguyên 64-bit 19 chữ số không có dấu ngoặc kép!
            const rawInnerJson =
                '{"error_code":0,"error_message":"Successful.","data":[{"id":1,"type":"media","owner_id":4829384719283746192,"group_id":888999000,"global_msg_id":999111222}]}';
            const encrypted = encodeAES(TEST_SECRET_KEY, rawInnerJson);
            return new Response(
                JSON.stringify({ error_code: 0, error_message: "Successful.", data: encrypted }),
                { status: 200, headers: { "content-type": "application/json" } },
            );
        }

        if (u.pathname === "/api/mediastore/list") {
            const mediaType = decodedParams.media_type;
            const ownerNum =
                mediaType === "media"
                    ? "4829384719283746193"
                    : mediaType === "file"
                      ? "4829384719283746194"
                      : "4829384719283746195";
            const rawInnerJson = `{"error_code":0,"error_message":"Successful.","data":{"items":[{"id":10,"type":"${mediaType}","owner_id":${ownerNum},"group_id":888999000}],"isLimitPermission":false,"last_id":10,"has_more":0}}`;
            const encrypted = encodeAES(TEST_SECRET_KEY, rawInnerJson);
            return new Response(
                JSON.stringify({ error_code: 0, error_message: "Successful.", data: encrypted }),
                { status: 200, headers: { "content-type": "application/json" } },
            );
        }

        if (u.pathname === "/api/cm/getrecentv2") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                lastMsgId: "5001",
                hasMore: true,
                groupMsgs: [
                    {
                        msgId: "5002",
                        cliMsgId: "5002",
                        uidFrom: "3000000000000000001",
                        idTo: "888999000",
                        msgType: "webchat",
                        content: "Hello",
                        quote: { ownerId: "3000000000000000002", msg: "Old msg" },
                        mentions: [{ uid: "3000000000000000003", pos: 0, len: 5, type: 0 }],
                    },
                ],
            });
        }

        if (u.pathname === "/api/cm/getoldv2") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                lastMsgId: "4000",
                hasMore: false,
                groupMsgs: [
                    {
                        msgId: "4001",
                        cliMsgId: "4001",
                        uidFrom: "3000000000000000004",
                        idTo: "888999000",
                        msgType: "webchat",
                        content: "Older message",
                    },
                ],
            });
        }

        if (u.pathname === "/api/group/history") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                groupMsgs: [
                    {
                        msgId: "3999",
                        cliMsgId: "3999",
                        uidFrom: "3000000000000000005",
                        idTo: "888999000",
                        msgType: "webchat",
                        content: "Legacy history msg",
                    },
                ],
            });
        }

        if (u.pathname === "/api/board/pin/list") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                items: [
                    {
                        type: 2,
                        creatorId: "1000000000000000001",
                        params: JSON.stringify({ senderUid: "5000000000000000001", title: "Pinned" }),
                    },
                ],
                version: 1,
            });
        }

        if (u.pathname === "/api/board/list") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                items: [
                    {
                        boardType: 1,
                        data: {
                            poll_id: 999,
                            creator: "1000000000000000001",
                            options: [{ option_id: 1, content: "Opt 1", voters: ["6000000000000000001"] }],
                        },
                    },
                ],
                count: 1,
            });
        }

        if (u.pathname === "/api/poll/detail") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                poll_id: 999,
                creator: "1000000000000000001",
                options: [
                    {
                        option_id: 1,
                        content: "Opt 1",
                        voters: ["6000000000000000001", "6000000000000000002"],
                    },
                ],
            });
        }

        if (u.pathname === "/api/board/listReminder") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, [
                { reminderId: "rem-1", creatorUid: "7000000000000000001" },
            ]);
        }

        if (u.pathname === "/api/board/topic/listResponseEvent") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                acceptMember: ["7000000000000000002"],
                rejectMember: ["7000000000000000003"],
            });
        }

        if (u.pathname === "/api/friend/group/related") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                groupRelateds: {
                    "8000000000000000001": ["888999000", "111111"],
                    "8000000000000000002": ["222222"],
                },
            });
        }

        if (u.pathname === "/api/group/getStatusMsg") {
            const parsedParam = JSON.parse(decodedParams.param);
            const reqItem = parsedParam.data[0];
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                statusInfos: [
                    {
                        tId: reqItem.tId,
                        ids: reqItem.ids.map((id: string) => ({
                            id,
                            seen: "5002",
                            deliver: "5002",
                        })),
                    },
                ],
            });
        }

        if (u.pathname === "/api/social/group/members") {
            const pmap: string[] = decodedParams.friend_pversion_map || [];
            const profiles: Record<string, unknown> = {};
            for (const entry of pmap) {
                const uid = entry.split("_")[0];
                profiles[uid] = {
                    id: uid,
                    displayName: `User ${uid.slice(-4)}`,
                    zaloName: `Zalo ${uid.slice(-4)}`,
                    avatar: "https://ava.zalo.me/1.jpg",
                    accountStatus: 0,
                    type: 0,
                    lastUpdateTime: 1700000000,
                    globalId: `gid_${uid}`,
                };
            }
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                profiles,
                unchangeds_profile: [],
            });
        }

        if (u.pathname === "/api/group/quota/members-comm") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                status: 1,
                canUpgrade: true,
                grId: decodedParams.grId,
                uid: decodedParams.uid,
            });
        }

        if (u.pathname === "/api/group/getlg/e2ee") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                version: 1,
                e2eeGroups: ["888999000"],
            });
        }

        if (u.pathname === "/api/cm/mget") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                groupMsgs: {
                    "888999000": [{ msgId: "9001", content: "Batch cloud msg" }],
                },
            });
        }

        if (u.pathname === "/api/cm/getpath") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                lastMsgId: "5000",
                hasMore: false,
                groupMsgs: [
                    {
                        msgId: "5002",
                        cliMsgId: "5002",
                        uidFrom: "3000000000000000009",
                        idTo: "888999000",
                        msgType: "webchat",
                        content: "Path message",
                    },
                ],
            });
        }

        if (u.pathname === "/api/group/analyse") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                grid: decodedParams.grid,
                activeMembers: 42,
            });
        }

        if (u.pathname === "/api/message/getStatusMsg") {
            const parsedParam = JSON.parse(decodedParams.param);
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                statusInfos: parsedParam.data.map((d: { tId: string }) => ({
                    tId: d.tId,
                    seen: "1002",
                    deliver: "1002",
                })),
            });
        }

        if (u.pathname === "/api/suggestconvers/list") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                conversations: [{ id: "1000000000000000001", name: "Suggested Friend" }],
            });
        }

        if (u.pathname === "/api/pinconvers/update" || u.pathname === "/api/pinconvers/updatev2") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                version: 2,
                conversations: decodedParams.conversations,
            });
        }

        if (u.pathname === "/api/social/friend/getprofiles/v2") {
            if (decodedParams.isReqOAInfo === 1) {
                return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                    changed_profiles: {
                        "2359864726282056346": {
                            userId: "2359864726282056346",
                            username: "2359864726282056346",
                            displayName: "SofttyNet Company Limited",
                            zaloName: "SofttyNet Company Limited",
                            avatar: "https://s120-ava-talk.zadn.vn/oa-avatar.jpg",
                            cover: "https://cover-talk.zadn.vn/oa-cover.png",
                            type: 7,
                            globalId: "O2U3X3L1Z2S260R2B2J382O0",
                            oaInfo: {
                                description: "SofttyNet là công ty phát triển phần mềm",
                                appUrl: null,
                                hotline: { label: "Hotline", value: "02862705168", icon: "" },
                                category: { label: "Danh mục", value: "Doanh nghiệp", icon: "" },
                                website: { label: "Website", value: "https://www.softty.net", icon: "" },
                                address: { label: "Địa chỉ", value: "Quận 7, TP.HCM", icon: "" },
                                openTime: { label: "Giờ mở cửa", value: "08:00 - 17:00", icon: "" },
                                group_msg: 0,
                            },
                            oa_status: {
                                blocked: 0,
                                enable_dnr: 1,
                                dnr_type: 2,
                                dnr_string: { vi: "Đang tắt thông báo đến 08:00" },
                            },
                        },
                    },
                    unchanged_profiles: {},
                    phonebook_version: 1,
                });
            }
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                profiles: {
                    "1000000000000000001": {
                        id: "1000000000000000001",
                        displayName: "Friend V2",
                        zaloName: "Friend V2",
                        avatar: "",
                    },
                },
                phonebook_version: 1,
            });
        }

        if (u.pathname === "/api/social/friend/get-bizacc") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                biz: {
                    desc: "SofttyNet Software",
                    cate: 1,
                    addr: "Quận 7, TP.HCM",
                    website: "https://www.softty.net",
                    email: "contact@softty.net",
                },
                setting_start_page: null,
                pkgId: 2,
            });
        }

        if (u.pathname === "/api/social/friend/active-pcweb") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                uids: ["1000000000000000001"],
            });
        }

        if (u.pathname === "/api/social/friend/verify") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                profiles: { "1000000000000000001": { isFr: 1 } },
                unchangeds_profile: [],
            });
        }

        if (u.pathname === "/api/media/oneone/list") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                items: [{ id: 101, type: decodedParams.media_type, owner_id: TEST_UID }],
                isLimitPermission: false,
                last_id: 101,
                has_more: 0,
            });
        }

        if (u.pathname === "/api/media/oneone/preview") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, [
                { id: 102, type: "media", owner_id: TEST_UID },
            ]);
        }

        if (u.pathname === "/api/media/oneone/remove") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                removedIds: [decodedParams.media_id],
            });
        }

        if (u.pathname === "/api/social/oa/block") {
            assert.equal(method, "POST", "blockOA phải dùng POST");
            assert.ok(decodedParams.oaid, "blockOA phải truyền oaid");
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, "");
        }

        if (u.pathname === "/api/social/oa/unblock") {
            assert.equal(method, "POST", "unblockOA phải dùng POST");
            assert.ok(decodedParams.oaid, "unblockOA phải truyền oaid");
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, "");
        }

        if (u.pathname === "/api/social/oa/convertid") {
            assert.equal(method, "GET", "convertOAIds phải dùng GET");
            assert.ok(Array.isArray(decodedParams.oa_ids), "convertOAIds phải truyền mảng oa_ids");
            const mapped: Record<string, string> = {};
            for (const id of decodedParams.oa_ids) {
                mapped[id] = `uid_oa_${id}`;
            }
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, mapped);
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
    assert.equal(preloadRes.messages.length, 3, "Phải parse đủ 3 tin nhắn (1 User + 1 OA pageMsg + 1 Group)");
    assert.ok(preloadRes.messages[0] instanceof UserMessage);
    assert.ok(preloadRes.messages[1] instanceof UserMessage);
    assert.ok(preloadRes.messages[2] instanceof GroupMessage);
    assert.equal(preloadRes.pageMessages.length, 1, "Phải tách riêng 1 tin nhắn OA trong pageMessages");
    assert.equal(preloadRes.pageMessages[0].isOAMessage(), true);
    assert.equal(preloadRes.pageMessages[0].oaData?.kind, "oa_list");
    assert.equal(preloadRes.unreadCleared.length, 1);
    assert.ok(preloadRes.unreadCleared[0] instanceof ClearUnread);
    assert.equal(preloadRes.unreadCleared[0].idTo, "999888777");
    console.log("✅ [1/11] preloadConversations: Chính xác tham số threadIdLocalMsgId & parse messages/pageMessages/unreadCleared.");

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
    // TEST 5: Voice Call & Video Call Signaling (sendVoiceCall 11300+11301, cancelVoiceCall 11305, endVoiceCall 11306)
    // -------------------------------------------------------------------------
    const callRes = await api.sendVoiceCall("5249661060655759359", { callType: CallType.Audio, callId: 555666 });
    assert.equal(callRes.callId, 555666);
    assert.equal(callRes.sessId, "5249661060655759359_555666_401");
    assert.equal(callRes.rtpServer, "171.244.25.120:4200");
    assert.equal(callRes.rtcpServer, "171.244.25.120:4200");
    assert.equal(callRes.zrtpKey, "zrtp-secret-key-base64");

    await api.cancelVoiceCall("5249661060655759359", 555666, { callType: CallType.Audio });

    const videoCallRes = await api.sendVoiceCall("5249661060655759359", { callType: CallType.Video, callId: 777888 });
    assert.equal(videoCallRes.callId, 777888);
    assert.equal(videoCallRes.sessId, "5249661060655759359_777888_401");
    await api.cancelVoiceCall("5249661060655759359", 777888, { callType: CallType.Video });
    await api.endVoiceCall("5249661060655759359", 777888);
    console.log("✅ [5/6] sendVoiceCall (Audio & Video 2-step 11300->11301) / cancelVoiceCall (11305) / endVoiceCall (11306): Hoạt động chính xác.");

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

    // Kiểm tra requestOldMessages mặc định lastId = "1"
    api.listener.requestOldMessages(ThreadType.User);
    assert.equal(sentWsPayloads.length, 1);
    const firstSent = sentWsPayloads[0] as { cmd: number; subCmd: number; json: { lastId: string } };
    assert.equal(firstSent.cmd, 510);
    assert.equal(firstSent.subCmd, 1);
    assert.equal(firstSent.json.lastId, "1");
    listenerAny.ws = null as unknown as typeof listenerAny.ws;

    // Gắn mock onmessage từ Listener bằng cách tạo fake WebSocket thông qua xử lý gói tin trực tiếp
    const receivedOldUserMsgs: UserMessage[][] = [];
    const receivedOldGroupMsgs: Array<{ msgs: GroupMessage[]; hasMore?: boolean }> = [];
    const receivedUndos: unknown[] = [];
    const receivedUnreadCleared: ClearUnread[][] = [];
    const receivedSyncEvents: unknown[] = [];
    const receivedCallEvents: unknown[] = [];
    const receivedVoice2TextEvents: Array<{ act: string; act_type: string; data: { req_id: string; text?: string } }> = [];

    api.listener.on("old_messages", (msgs, type, hasMore) => {
        if (type === ThreadType.User) receivedOldUserMsgs.push(msgs as UserMessage[]);
        else receivedOldGroupMsgs.push({ msgs: msgs as GroupMessage[], hasMore });
    });
    api.listener.on("undo", (u) => receivedUndos.push(u));
    api.listener.on("unread_cleared", (items) => receivedUnreadCleared.push(items));
    api.listener.on("sync_event", (ev) => receivedSyncEvents.push(ev));
    api.listener.on("call_event", (ev) => receivedCallEvents.push(ev));
    api.listener.on("voice2text_event", (ev) => receivedVoice2TextEvents.push(ev));

    // Khởi tạo 1 socket nội bộ ngắn để kích hoạt đúng hàm ws.onmessage thật của Listener
    const { WebSocketServer } = await import("ws");
    const wss = new WebSocketServer({ host: "127.0.0.1", port: 0 });
    await new Promise<void>((r) => wss.once("listening", () => r()));
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
                            {
                                content: {
                                    act_type: "voice2text",
                                    act: "convert_finish",
                                    data: JSON.stringify({
                                        req_id: "v2t-req-123",
                                        err: 0,
                                        text: "Xin chào Zalo AI",
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
    assert.equal(receivedVoice2TextEvents.length, 1, "Phải nhận được sự kiện voice2text_event");
    assert.equal(receivedVoice2TextEvents[0].data.req_id, "v2t-req-123");
    assert.equal(receivedVoice2TextEvents[0].data.text, "Xin chào Zalo AI");

    console.log("✅ [6/7] Listener WebSocket (510/511 subCmd 0&1, undo, 504 unread_cleared, 601 sync_event, call_event & voice2text_event): Hoạt động chính xác.");

    // ========================================================================
    // 7. KIỂM TRA MÃ HÓA ZCLOUD (98yS AES-256-CBC RANDOM IV) & 38 API MỚI (26.7.10)
    // ========================================================================
    const sampleZCloudKey = crypto.randomBytes(32).toString("base64");
    const sampleZCloudPayload = JSON.stringify({ usage: 1024, quota: 524288000, plan: -1 });
    const encryptedZCloud1 = encryptZCloudAES(sampleZCloudPayload, sampleZCloudKey);
    const encryptedZCloud2 = encryptZCloudAES(sampleZCloudPayload, sampleZCloudKey);
    assert.notEqual(encryptedZCloud1, encryptedZCloud2, "encryptZCloudAES phải tạo 16-byte random IV khác nhau mỗi lần");
    assert.equal(decryptZCloudAES(encryptedZCloud1, sampleZCloudKey), sampleZCloudPayload);
    assert.equal(decryptZCloudAES(encryptedZCloud2, sampleZCloudKey), sampleZCloudPayload);

    const newApiMethods = [
        "getCloudViewerKey",
        "getUsageZCloud",
        "getUsageMyCloud",
        "getCloudSettings",
        "getCloudInfo",
        "getFamilyUsage",
        "verifyCloudMedia",
        "getFamilyViewerKey",
        "getFamilyProfile",
        "voiceToText",
        "getEmojiStatusConfig",
        "getFriendsEmojiStatus",
        "getRecentSearchList",
        "updateRecentSearch",
        "getConversationMedia",
        "getMediaStorePreview",
        "removeConversationMedia",
        "encryptGids",
        "getMiniProfile",
        "getPhonebookV2",
        "getAliasListV2",
        "getBlockFriends",
        "getExtraGroupInfo",
        "getExtraFriendInfo",
        "getQuotaCommunity",
        "getProfileRank",
        "getProfileVerificationStatus",
        "getLastSeen",
        "getLastSeenReaction",
        "undoMultiMessage",
        "getLastReadContactTab",
        "readContactTab",
        "clearUnreadFriendRequests",
        "getListPinTopics",
        "getGroupCloudMessageJump",
        "getStickerCategoriesV2",
        "getStickerCategoryData",
        "getStickerSuggestKeywords",
        "getStickerSuggestion",
        "getPersonalizedStickerList",
        "getStickerHello",
        "keepAlive",
    ] as const;

    for (const methodName of newApiMethods) {
        assert.equal(typeof api[methodName], "function", `API method api.${methodName} phải tồn tại trên class API`);
    }

    console.log(`✅ [7/8] ZCloud AES-256-CBC (98yS) & ${newApiMethods.length} API mới từ Zalo PC 26.7.10: Đã gắn kết và kiểm định 100%.`);

    // -------------------------------------------------------------------------
    // TEST 8: Domain-Driven SDK Architecture (12 Domains, Lazy Getters, ViewerKey Cache)
    // -------------------------------------------------------------------------
    assert.equal(api.auth.keepAlive, api.keepAlive);
    assert.equal(api.chat.sendMessage, api.sendMessage);
    assert.equal(api.chat.undoMultiMessage, api.undoMultiMessage);
    assert.equal(api.group.getGroupInfo, api.getGroupInfo);
    assert.equal(api.group.getQuotaCommunity, api.getQuotaCommunity);
    assert.equal(api.friend.getPhonebookV2, api.getPhonebookV2);
    assert.equal(api.profile.getEmojiStatusConfig, api.getEmojiStatusConfig);
    assert.equal(api.sync.pullMobile, api.pullMobile);
    assert.equal(api.zcloud.getUsageZCloud, api.getUsageZCloud);
    assert.equal(api.call.sendVoiceCall, api.sendVoiceCall);
    assert.equal(api.media.voiceToText, api.voiceToText);
    assert.equal(api.sticker.getStickerCategoriesV2, api.getStickerCategoriesV2);
    assert.equal(api.board.getListPinTopics, api.getListPinTopics);
    assert.equal(api.business.getBizAccount, api.getBizAccount);

    // Kiểm tra ZCloud ViewerKey Cache (lần gọi đầu lưu vào ctx.zcloudViewerKeyCache, lần gọi sau lấy từ cache)
    const firstKey = await api.zcloud.getCloudViewerKey();
    assert.equal(firstKey.viewer_key, "vk-cloud-test-123");
    assert.ok(ctx.zcloudViewerKeyCache, "ctx.zcloudViewerKeyCache phải được tự động lưu sau lần gọi đầu tiên");
    const cachedKey = await api.zcloud.getCloudViewerKey();
    assert.equal(cachedKey.viewer_key, "vk-cloud-test-123");

    console.log("✅ [8/9] Kiến trúc Domain-Driven (12 Domains, Lazy Memoized Getters, ViewerKey Cache & Single Source Constants): Hoạt động chính xác.");

    // -------------------------------------------------------------------------
    // TEST 9: preParseJsonIds 64-bit & Các API Group nguyên bản mới (getGroupMessageStatus, getGroupInfoV2, getGroupListV3, getGroupHistoryLegacy, getGroupChatHistory)
    // -------------------------------------------------------------------------
    assert.equal(api.group.getGroupMessageStatus, api.getGroupMessageStatus);
    assert.equal(api.group.getGroupInfoV2, api.getGroupInfoV2);
    assert.equal(api.group.getGroupListV3, api.getGroupListV3);
    assert.equal(api.group.getGroupHistoryLegacy, api.getGroupHistoryLegacy);

    // 9.1 Kiểm tra preParseJsonIds giữ nguyên độ chính xác 64-bit integer (19 chữ số) của owner_id và group_id
    const mediaPreviewRes = await api.media.getMediaStorePreview("888999000", 50);
    assert.equal(mediaPreviewRes[0].owner_id, "4829384719283746192", "owner_id 19 chữ số không được mất độ chính xác IEEE-754");
    const mediaListRes = await api.media.getConversationMedia({ groupId: "888999000", mediaType: "media" });
    assert.equal(mediaListRes.items[0].owner_id, "4829384719283746193", "owner_id 19 chữ số trong /api/mediastore/list phải giữ chính xác");

    // 9.2 Kiểm tra getGroupMessageStatus (cmd 12017) - cả request payload và response
    const msgStatusRes = await api.group.getGroupMessageStatus("g888999000", ["8000000000000000001", "8000000000000000002"]);
    const statusReq = capturedRequests.find((r) => r.url.includes("/api/group/getStatusMsg"));
    assert.ok(statusReq, "Phải gửi request tới /api/group/getStatusMsg");
    assert.equal(statusReq.method, "POST");
    assert.equal(msgStatusRes.statusInfos.length, 1);
    assert.equal(msgStatusRes.statusInfos[0].tId, "888999000", "Phải tự động bỏ tiền tố g ở tId");
    assert.equal(msgStatusRes.statusInfos[0].ids.length, 2);
    assert.equal(msgStatusRes.statusInfos[0].ids[0].id, "8000000000000000001");
    assert.equal(msgStatusRes.statusInfos[0].ids[0].seen, "5002");

    // 9.3 Kiểm tra getGroupInfoV2 (cmd 11162) & getGroupListV3 (cmd 11161) & getGroupHistoryLegacy (cmd 11240)
    const groupInfoV2Res = await api.group.getGroupInfoV2("g888999000", { mpage: 1, mcount: 100 });
    assert.ok(capturedRequests.some((r) => r.url.includes("/api/group/getgi/v2")), "Phải gọi đúng /api/group/getgi/v2");
    assert.equal(groupInfoV2Res.groupId, "888999000");
    assert.equal(groupInfoV2Res.setting?.lockViewMember, 1);

    const groupListV3Res = await api.group.getGroupListV3({ page: 1, count: 100 });
    assert.ok(capturedRequests.some((r) => r.url.includes("/api/group/getlg/v3")), "Phải gọi đúng /api/group/getlg/v3");
    assert.equal(groupListV3Res.total, 1);
    assert.equal(groupListV3Res.groups?.[0]?.groupId, "888999000");

    const legacyHistoryRes = await api.group.getGroupHistoryLegacy("g888999000", 20);
    assert.ok(capturedRequests.some((r) => r.url.includes("/api/group/history")), "Phải gọi đúng /api/group/history");
    assert.equal(legacyHistoryRes.groupMsgs?.length, 1);
    assert.equal(legacyHistoryRes.groupMsgs?.[0]?.data.uidFrom, "3000000000000000005");

    // 9.4 Kiểm tra getGroupChatHistory phân trang với cursor và useOldEndpoint (/api/cm/getoldv2)
    const recentChatRes = await api.group.getGroupChatHistory("g888999000", { count: 50, cursor: 0 });
    assert.ok(capturedRequests.some((r) => r.url.includes("/api/cm/getrecentv2")), "Phải gọi đúng /api/cm/getrecentv2");
    assert.equal(recentChatRes.groupMsgs.length, 1);
    assert.equal(recentChatRes.groupMsgs[0].data.uidFrom, "3000000000000000001");
    assert.equal(recentChatRes.nextCursor, "5001");

    const oldChatRes = await api.group.getGroupChatHistory("888999000", {
        count: 50,
        cursor: recentChatRes.nextCursor,
        useOldEndpoint: true,
    });
    assert.ok(capturedRequests.some((r) => r.url.includes("/api/cm/getoldv2")), "Phải gọi đúng /api/cm/getoldv2");
    assert.equal(oldChatRes.groupMsgs.length, 1);
    assert.equal(oldChatRes.groupMsgs[0].data.uidFrom, "3000000000000000004");

    // 9.5 Kiểm tra 14 API nguyên bản bổ sung (Group, Chat, Friend, Personal Media Store)
    const quotaMemberRes = await api.group.checkQuotaCommunityMember("g888999000", "1000000000000000001");
    assert.equal(quotaMemberRes.canUpgrade, true);

    const e2eeGroupRes = await api.group.getE2eeGroupList();
    assert.deepEqual(e2eeGroupRes.e2eeGroups, ["888999000"]);

    const multiCloudRes = await api.group.getMultiGroupCloudMessages(["g888999000"]);
    assert.ok(multiCloudRes.groupMsgs?.["888999000"]);

    const cloudPathRes = await api.group.getGroupCloudMessagePath({
        groupId: "g888999000",
        globalMsgId: "5002",
        count: 20,
        reverse: true,
    });
    assert.equal(cloudPathRes.groupMsgs.length, 1);
    assert.equal(cloudPathRes.groupMsgs[0].data.uidFrom, "3000000000000000009");

    const analyseRes = await api.group.analyseGroup("g888999000");
    assert.equal(analyseRes.activeMembers, 42);

    const directStatusRes = await api.chat.getDirectMessageStatus(["1000000000000000001"]);
    assert.equal(directStatusRes.statusInfos.length, 1);
    assert.equal(directStatusRes.statusInfos[0].tId, "1000000000000000001");
    assert.equal(directStatusRes.statusInfos[0].seen, "1002");

    const suggestConvRes = await api.chat.getSuggestedConversations();
    assert.equal(suggestConvRes.conversations?.length, 1);

    const updatePinRes = await api.chat.updatePinConversations({
        conversations: ["g888999000"],
        actionType: 1,
    });
    assert.deepEqual(updatePinRes.conversations, ["g888999000"]);

    const friendProfilesV2Res = await api.friend.getFriendProfilesV2(["1000000000000000001"]);
    assert.equal(friendProfilesV2Res.profiles["1000000000000000001"]?.displayName, "Friend V2");

    const activePCWebRes = await api.friend.getFriendsActivePCWeb();
    assert.deepEqual(activePCWebRes.uids, ["1000000000000000001"]);

    const verifyFriendRes = await api.friend.verifyFriend("1000000000000000001");
    assert.ok(verifyFriendRes.profiles?.["1000000000000000001"]);

    const personalMediaRes = await api.media.getPersonalMedia({ mediaType: "media", limit: 20 });
    assert.equal(personalMediaRes.items.length, 1);

    const personalPreviewRes = await api.media.getPersonalMediaPreview(50);
    assert.equal(personalPreviewRes.length, 1);

    const removePersonalRes = await api.media.removePersonalMedia({ mediaType: "media", mediaId: 101 });
    assert.deepEqual(removePersonalRes.removedIds, [101]);

    // 9.6 Kiểm tra exportSession, requestTimeout mặc định & decodeEventData 64-bit string (ws-cipher)
    const exportedSession = api.auth.exportSession();
    assert.equal(exportedSession.uid, TEST_UID);
    assert.equal(exportedSession.imei, TEST_IMEI);
    assert.equal(exportedSession.language, "vi");
    assert.ok(Array.isArray(exportedSession.cookie), "cookie xuất ra phải là mảng SerializedCookie[]");
    assert.equal(ctx.options.requestTimeout, 30000, "requestTimeout mặc định phải là 30000ms");

    const wsEventDecoded = await decodeEventData({
        encrypt: 0,
        data: '{"owner_id":4829384719283746192,"big_num":9223372036854775807}',
    });
    assert.equal(typeof wsEventDecoded.owner_id, "string");
    assert.equal(wsEventDecoded.owner_id, "4829384719283746192");
    assert.equal(typeof wsEventDecoded.big_num, "string");
    assert.equal(wsEventDecoded.big_num, "9223372036854775807");

    // 9.7 Kiểm tra CallbacksMap TTL cleanup, sendWs readyState guard & Proxy Agent/Dispatcher resolution
    ctx.uploadCallbacks.set("test_file_1", () => {}, 60000);
    assert.equal(ctx.uploadCallbacks.has("test_file_1"), true);
    ctx.uploadCallbacks.delete("test_file_1");
    assert.equal(ctx.uploadCallbacks.has("test_file_1"), false);

    let lastFetchInit: Record<string, unknown> | undefined;
    const origPolyfill = ctx.options.polyfill;
    ctx.options.polyfill = (async (_url: string | URL | Request, init?: RequestInit) => {
        lastFetchInit = init as Record<string, unknown>;
        return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, { e2eeGroups: [] });
    }) as typeof fetch;

    const fakeHttpAgent = { keepAlive: true } as unknown as NonNullable<typeof ctx.options.agent>;
    ctx.options.agent = fakeHttpAgent;
    await api.group.getE2eeGroupList();
    assert.equal(lastFetchInit?.agent, fakeHttpAgent, "Khi truyền http.Agent phải gán vào init.agent");
    assert.equal(lastFetchInit?.dispatcher, undefined, "Không được gán http.Agent vào init.dispatcher của Undici");

    const fakeUndiciDispatcher = { dispatch: () => {} } as unknown as NonNullable<typeof ctx.options.agent>;
    ctx.options.agent = fakeUndiciDispatcher;
    await api.group.getE2eeGroupList();
    assert.equal(lastFetchInit?.dispatcher, fakeUndiciDispatcher, "Khi truyền Undici Dispatcher phải gán vào init.dispatcher");
    assert.equal(lastFetchInit?.agent, undefined, "Không được gán Undici Dispatcher vào init.agent");

    ctx.options.agent = undefined;
    ctx.options.polyfill = origPolyfill;

    // 9.8 Kiểm tra trọn bộ 28 API Voice & Video Call (1-1 & Group Call) trong api.call
    const callCalleeId = "5249661060655759359";
    const reqCallRes = await api.call.requestVoiceCall(callCalleeId, { callType: CallType.Audio, callId: 123456 });
    assert.equal(reqCallRes.callId, 123456);
    assert.equal(reqCallRes.sessId, "5249661060655759359_123456_401");

    const sendReqRes = await api.call.sendRequestVoiceCall(callCalleeId, {
        callId: 123456,
        session: reqCallRes.sessId,
        rtpAddress: "171.244.25.120:4200",
        rtcpAddress: "171.244.25.120:4200",
        extendData: {
            callType: 0,
            rtp: [{ ip: "171.244.25.120", port: 4200 }],
            rtcp: [{ ip: "171.244.25.120", port: 4200 }],
        },
    });
    assert.equal((sendReqRes as { status: number }).status, 0);

    const ringRes = await api.call.ringRingVoiceCall(callCalleeId, 123456);
    assert.equal((ringRes as { endpoint: string }).endpoint, "/api/voicecall/ringring");

    const ansRes = await api.call.answerVoiceCall(callCalleeId, 123456, {
        sessionId: reqCallRes.sessId,
        rtpAddress: "171.244.25.120:4200",
        rtcpAddress: "171.244.25.120:4200",
        extendData: { status: 0 },
    });
    assert.equal((ansRes as { endpoint: string }).endpoint, "/api/voicecall/answer");

    const ackRes = await api.call.answerAckVoiceCall(callCalleeId, 123456);
    assert.equal((ackRes as { endpoint: string }).endpoint, "/api/voicecall/answerack");

    const holdReqRes = await api.call.holdVoiceCall(callCalleeId);
    assert.equal((holdReqRes as { endpoint: string }).endpoint, "/api/voicecall/holdreq");
    const holdRespRes = await api.call.holdVoiceCall(callCalleeId, { isResponse: true });
    assert.equal((holdRespRes as { endpoint: string }).endpoint, "/api/voicecall/holdresp");

    const unholdReqRes = await api.call.unholdVoiceCall(callCalleeId);
    assert.equal((unholdReqRes as { endpoint: string }).endpoint, "/api/voicecall/unholdreq");
    const unholdRespRes = await api.call.unholdVoiceCall(callCalleeId, { isResponse: true });
    assert.equal((unholdRespRes as { endpoint: string }).endpoint, "/api/voicecall/unholdresp");

    const mediaStateRes = await api.call.updateCallMediaState(callCalleeId, 123456, {
        isOnCam: true,
        isOnMic: false,
    });
    assert.equal((mediaStateRes as { endpoint: string }).endpoint, "/api/voicecall/conf");

    const a2vRes = await api.call.requestAudioToVideoCall(callCalleeId, 123456);
    assert.equal((a2vRes as { endpoint: string }).endpoint, "/api/voicecall/requestaudio2video");

    const shareScreenRes = await api.call.requestShareScreenCall(callCalleeId, 123456, { status: 1 });
    assert.equal((shareScreenRes as { endpoint: string }).endpoint, "/api/voicecall/requestsharescreen");

    const logEndRes = await api.call.logEndVoiceCall(callCalleeId, 123456, { duration: 30, status: 0 });
    assert.equal((logEndRes as { endpoint: string }).endpoint, "/api/voicecall/logendcall");

    // Kiểm tra 14 API Group Call
    const grpReqCall = (await api.call.requestGroupCall("888999000", {
        callId: 654321,
        typeRequest: CallType.GroupVideo,
        partners: [callCalleeId],
    })) as { endpoint: string; params: Record<string, unknown> };
    assert.equal(grpReqCall.endpoint, "/api/voicecall/group/requestcall");
    assert.equal(
        grpReqCall.params.typeRequest,
        1,
        "requestGroupCall phải chuẩn hoá CallType.GroupVideo (6) -> typeRequest = 1",
    );
    const grpReqData = JSON.parse(String(grpReqCall.params.data));
    assert.equal(
        grpReqData.noiseId,
        JSON.stringify([callCalleeId]),
        "requestGroupCall phải đính kèm noiseId: JSON.stringify(partners) trong data",
    );

    const grpSendReq = (await api.call.sendRequestGroupCall("888999000", {
        callId: 654321,
        session: "grp_sess_1",
        callType: CallType.GroupVideo,
        partners: [callCalleeId],
    })) as { endpoint: string; params: Record<string, unknown> };
    assert.equal(grpSendReq.endpoint, "/api/voicecall/group/request");
    assert.equal(
        grpSendReq.params.callType,
        1,
        "sendRequestGroupCall phải chuẩn hoá CallType.GroupVideo (6) -> callType = 1",
    );
    const grpSendOuterData = JSON.parse(String(grpSendReq.params.data));
    assert.equal(grpSendOuterData.hostCall, "888999000");
    assert.equal(grpSendOuterData.noiseId, JSON.stringify([callCalleeId]));
    assert.equal(typeof grpSendOuterData.data, "string", "sendRequestGroupCall phải có cấu trúc JSON 2 lớp trong data");
    const grpSendInnerData = JSON.parse(String(grpSendOuterData.data));
    assert.equal(grpSendInnerData.hostCall, "888999000");
    assert.equal(grpSendInnerData.noiseId, JSON.stringify([callCalleeId]));

    const grpAddUser = await api.call.addUserGroupCall(654321, {
        hostCall: TEST_UID,
        session: "grp_sess_1",
        partners: [callCalleeId],
    });
    assert.equal((grpAddUser as { endpoint: string }).endpoint, "/api/voicecall/group/adduser");

    const grpAns = (await api.call.answerGroupCall(654321, {
        hostCall: TEST_UID,
        session: "grp_sess_1",
        callType: CallType.GroupVideo,
    })) as { endpoint: string; params: Record<string, unknown> };
    assert.equal(grpAns.endpoint, "/api/voicecall/group/answer");
    assert.equal(grpAns.params.callType, 1, "answerGroupCall phải chuẩn hoá callType = 0 | 1");
    const grpAnsData = JSON.parse(String(grpAns.params.data));
    assert.equal(grpAnsData.callType, 1);
    assert.equal(grpAnsData.session, "grp_sess_1");
    assert.equal(grpAnsData.status, 0);

    const grpRing = (await api.call.ringRingGroupCall(654321, {
        hostCall: TEST_UID,
        session: "grp_sess_1",
        callType: CallType.GroupAudio,
    })) as { endpoint: string; params: Record<string, unknown> };
    assert.equal(grpRing.endpoint, "/api/voicecall/group/ringring");
    assert.equal(grpRing.params.callType, 0, "ringRingGroupCall phải chuẩn hoá callType = 0 | 1");
    const grpRingData = JSON.parse(String(grpRing.params.data));
    assert.equal(grpRingData.callType, 0);
    assert.equal(grpRingData.session, "grp_sess_1");
    assert.equal(grpRingData.status, 0);

    const grpState = await api.call.getGroupCallState(654321, TEST_UID);
    assert.equal((grpState as { endpoint: string }).endpoint, "/api/voicecall/group/state");

    const grpPing = await api.call.pingGroupCall(654321, { hostCall: TEST_UID });
    assert.equal((grpPing as { endpoint: string }).endpoint, "/api/voicecall/group/ping");

    const grpBroadcast = await api.call.broadcastGroupCallState(654321, { hostCall: TEST_UID });
    assert.equal((grpBroadcast as { endpoint: string }).endpoint, "/api/voicecall/group/broadcast");

    const grpJoin = await api.call.joinGroupCall(654321, { hostCall: TEST_UID });
    assert.equal((grpJoin as { endpoint: string }).endpoint, "/api/voicecall/group/join");

    const grpShare = await api.call.shareScreenGroupCall(654321, { hostCall: TEST_UID });
    assert.equal((grpShare as { endpoint: string }).endpoint, "/api/voicecall/group/sharescreen");

    const grpNotify = await api.call.notifyGroupCall(654321, { hostCall: TEST_UID });
    assert.equal((grpNotify as { endpoint: string }).endpoint, "/api/voicecall/group/notify");

    const grpFinish = await api.call.finishGroupCall(654321, { hostCall: TEST_UID, duration: 120 });
    assert.equal((grpFinish as { endpoint: string }).endpoint, "/api/voicecall/group/finish");

    const grpCancel = await api.call.cancelGroupCall(654321, { hostCall: TEST_UID });
    assert.equal((grpCancel as { endpoint: string }).endpoint, "/api/voicecall/group/cancel");

    const grpEnd = await api.call.endGroupCall(654321, { hostCall: TEST_UID });
    assert.equal((grpEnd as { endpoint: string }).endpoint, "/api/voicecall/group/endcall");

    console.log(
        "✅ [9/10] preParseJsonIds 64-bit, ws-cipher storeAsString, exportSession, requestTimeout & 28 API Call (1-1 & Group): Chính xác 100%.",
    );

    // ========================================================================
    // 10. KIỂM TRA BỘ MÁY GỌI THUẦN TYPESCRIPT (ZRTPPacketCodec, ZaloSrtpSession, ZaloRtcSession & ZaloCallController)
    // ========================================================================
    // 10.1 Kiểm tra ZRTPPacketCodec (Control 0x01/0x02, Legacy 5B, ZRTC Multiplexed 9B 0x7f)
    const initReqBuf = buildInitCallRequest({
        isCaller: true,
        callId: 998877,
        fromUid: 111,
        toUid: 222,
        sessId: "5249661060655759359_998877_401",
    });
    const parsedInitReq = parseZRTPPacket(initReqBuf);
    assert.equal(parsedInitReq.family, "control");
    assert.equal(parsedInitReq.isResponse, false);
    assert.equal(parsedInitReq.cmd, ZRTPControlCommand.InitCallCaller);
    assert.equal(parsedInitReq.callId, 998877);
    assert.equal(parsedInitReq.sessId, "5249661060655759359_998877_401");

    const initRespBuf = buildInitCallResponse({
        isCaller: true,
        callId: 998877,
        routingToken: 0x11223344,
        sessId: "5249661060655759359_998877_401",
    });
    const parsedInitResp = parseZRTPPacket(initRespBuf);
    assert.equal(parsedInitResp.family, "control");
    assert.equal(parsedInitResp.isResponse, true);
    assert.equal(parsedInitResp.errorCode, 0);
    assert.equal(parsedInitResp.routingToken, 0x11223344);
    assert.equal(parsedInitResp.sessId, "5249661060655759359_998877_401");

    const pingBuf = buildPingRequest({
        seqNum: 7,
        callId: 998877,
        elapsedMs: 1234,
    });
    assert.equal(pingBuf.length, 40, "Gói UDP Ping chuẩn của Zalo phải dài tối thiểu 40 bytes");
    const parsedPing = parseZRTPPacket(pingBuf);
    assert.equal(parsedPing.family, "control");
    assert.equal(parsedPing.cmd, ZRTPControlCommand.Ping);
    assert.equal(parsedPing.pingString, "1234");

    // 10.2 Kiểm tra ZaloSrtpSession (RFC 3711 AES_CM_128_HMAC_SHA1_80) & đóng gói ZRTC 9-byte / Legacy 5-byte
    const masterKeyB64 = generateSrtpMasterKeyBase64();
    assert.equal(Buffer.from(masterKeyB64, "base64").length, 30);
    const srtpSender = new ZaloSrtpSession(masterKeyB64, "AES_CM_128_HMAC_SHA1_80");
    const srtpReceiver = new ZaloSrtpSession(masterKeyB64, "AES_CM_128_HMAC_SHA1_80");

    const sampleOpusPayload = Buffer.from("zalo-opus-frame-20ms-16khz", "utf-8");
    const rawRtp = buildRtpPacket({
        payloadType: 112,
        sequenceNumber: 100,
        timestamp: 32000,
        ssrc: 0xabcdef01,
        marker: true,
        payload: sampleOpusPayload,
    });
    const protectedSrtp = srtpSender.protectRtp(rawRtp);
    assert.equal(protectedSrtp.length, rawRtp.length + 10, "SRTP HMAC-SHA1-80 phải thêm đúng 10-byte auth tag");

    const zrtcFramed = wrapZrtcMediaPacket(
        ZRTCMediaSubCommand.AudioRtp,
        0x11223344,
        protectedSrtp,
        ZRTCRole.Caller,
    );
    const parsedZrtcMedia = parseZRTPPacket(zrtcFramed);
    assert.equal(parsedZrtcMedia.family, "zrtc_media");
    assert.equal(parsedZrtcMedia.routingToken, 0x11223344);
    assert.equal(parsedZrtcMedia.isVideo, false);

    const unprotectedRtp = srtpReceiver.unprotectRtp(parsedZrtcMedia.rtpPayload);
    const decodedRtp = parseRtpPacket(unprotectedRtp);
    assert.equal(decodedRtp.payloadType, 112);
    assert.equal(decodedRtp.sequenceNumber, 100);
    assert.equal(decodedRtp.timestamp, 32000);
    assert.equal(decodedRtp.ssrc, 0xabcdef01);
    assert.deepEqual(decodedRtp.payload, sampleOpusPayload);

    const legacyFramed = wrapLegacyMediaPacket(ZRTPLegacyMediaType.VideoRtp, 0x11223344, rawRtp);
    const parsedLegacy = parseZRTPPacket(legacyFramed);
    assert.equal(parsedLegacy.family, "legacy_media");
    assert.equal(parsedLegacy.isVideo, true);
    assert.equal(parsedLegacy.routingId, 0x11223344);

    // 10.3 Kiểm tra ZaloRtcSession (api.call.createRtcSession) với máy chủ Relay UDP thật trên localhost
    const mockRelaySocket = dgram.createSocket("udp4");
    await new Promise<void>((resolve) => mockRelaySocket.bind(0, "127.0.0.1", () => resolve()));
    const relayPort = mockRelaySocket.address().port;
    let relayReceivedInitCall = false;
    let relayReceivedPing = false;

    mockRelaySocket.on("message", (msg, rinfo) => {
        const pkt = parseZRTPPacket(msg);
        if (
            pkt.family === "control" &&
            !pkt.isResponse &&
            (pkt.cmd === ZRTPControlCommand.InitCallCaller ||
                pkt.cmd === ZRTPControlCommand.InitCallCallee)
        ) {
            relayReceivedInitCall = true;
            const resp = buildInitCallResponse({
                isCaller: pkt.cmd === ZRTPControlCommand.InitCallCaller,
                seqNum: pkt.seqNum,
                callId: pkt.callId ?? 998877,
                fromUid: pkt.toUid,
                toUid: pkt.fromUid,
                routingToken: 0x55667788,
                sessId: pkt.sessId ?? "",
            });
            mockRelaySocket.send(resp, rinfo.port, rinfo.address);
        } else if (pkt.family === "control" && !pkt.isResponse && pkt.cmd === ZRTPControlCommand.Ping) {
            relayReceivedPing = true;
        } else if ((pkt.family === "legacy_media" || pkt.family === "zrtc_media") && !pkt.isRtcp) {
            // Mô phỏng chính xác máy chủ Relay Zalo: chuyển gói 5-byte 0x03 (Outgoing Audio RTP)
            // thành gói 1-byte 0x04 (Incoming Audio RTP) gửi về cho client
            const forwarded = Buffer.allocUnsafe(1 + pkt.rtpPayload.length);
            forwarded.writeUInt8(
                pkt.isVideo ? ZRTPLegacyMediaType.IncomingVideoRtp : ZRTPLegacyMediaType.IncomingAudioRtp,
                0,
            );
            pkt.rtpPayload.copy(forwarded, 1);
            mockRelaySocket.send(forwarded, rinfo.port, rinfo.address);
        }
    });

    const prevPolyfill = ctx.options.polyfill;
    ctx.options.polyfill = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const u = new URL(String(input));
        if (u.pathname === "/api/voicecall/requestcall") {
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                sessId: `5249661060655759359_998877_401`,
                rtpIP: `127.0.0.1:${relayPort}`,
                rtcpIP: `127.0.0.1:${relayPort}`,
                servers: [{ rtpaddr: `127.0.0.1:${relayPort}`, rtcpaddr: `127.0.0.1:${relayPort}` }],
                zrtpKey: masterKeyB64,
                expiredTime: 60,
            });
        }
        if (u.pathname === "/api/voicecall/group/requestcall") {
            // Mô phỏng chính xác phản hồi của Zalo Server (_parseRequestCallResponseGroup @ 0x10001f3cc):
            // Dữ liệu cuộc gọi nằm trong trường `params` (chuỗi JSON chứa callId do Zalo cấp và callSetting.session)
            return makeEncryptedZaloHttpResponse(TEST_SECRET_KEY, {
                params: JSON.stringify({
                    callId: 778899,
                    groupId: "888999000",
                    maxUsers: 8,
                    callSetting: {
                        session: "888999000_778899_501",
                    },
                    servers: [{ rtpaddr: `127.0.0.1:${relayPort}`, rtcpaddr: `127.0.0.1:${relayPort}` }],
                }),
            });
        }
        return prevPolyfill!(input, init);
    }) as typeof fetch;

    const rtcSession = api.call.createRtcSession({
        enableSrtp: true,
        srtpMasterKeyBase64: masterKeyB64,
        pingIntervalMs: 200,
        autoKeepaliveMedia: false,
    });

    const connParams = await rtcSession.startOutgoingCall(callCalleeId, {
        callId: 998877,
        callType: CallType.Audio,
    });

    assert.equal(relayReceivedInitCall, true, "ZaloRtcSession phải gửi gói UDP 0x01 0x7e cmd=11 tới Relay");
    assert.equal(connParams.routingToken, 0x55667788, "ZaloRtcSession phải trích xuất đúng routingToken từ 0x02 0x7e");
    assert.equal(rtcSession.getState(), "ringing");

    await rtcSession.handleCallEvent({
        type: CallEventType.ANSWER,
        act: "answer",
        act_type: "voip",
        data: {
            callId: 998877,
            callerId: TEST_UID,
            calleeId: callCalleeId,
            status: 0,
        },
    });
    assert.equal(rtcSession.getState(), "active", "Khi nhận call_event answer phải chuyển sang active");

    const receivedEchoedAudio = await new Promise<Buffer>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout waiting for echoed audio_frame")), 2000);
        rtcSession.once("audio_frame", (frame) => {
            clearTimeout(timer);
            resolve(frame.payload);
        });
        void rtcSession.sendAudioFrame(Buffer.from("hello-zalo-voice-call-two-way", "utf-8"));
    });

    assert.equal(receivedEchoedAudio.toString("utf-8"), "hello-zalo-voice-call-two-way");
    assert.equal(relayReceivedPing, true, "ZaloRtcSession phải gửi gói UDP Ping (cmd=5)");

    // Kiểm định luồng Video H.264 2 chiều (PT=98 Keyframe STAP-A + FU-A, PT=97 Delta frame, và định dạng iOS g_nalHeaderSize=0)
    const testSps = Buffer.from([0x67, 0x42, 0xc0, 0x1f, 0xda, 0x01, 0xe0, 0x51, 0x9e]);
    const testPps = Buffer.from([0x68, 0xce, 0x3c, 0x80]);
    const testIdrBody = Buffer.alloc(1600, 0xab);
    const testIdr = Buffer.concat([Buffer.from([0x65]), testIdrBody]);
    const testKeyAnnexB = Buffer.concat([
        Buffer.from([0x00, 0x00, 0x00, 0x01]),
        testSps,
        Buffer.from([0x00, 0x00, 0x00, 0x01]),
        testPps,
        Buffer.from([0x00, 0x00, 0x00, 0x01]),
        testIdr,
    ]);

    const observedVideoRtpPts: number[] = [];
    rtcSession.on("video_frame", (vf) => {
        observedVideoRtpPts.push(vf.payloadType);
    });

    const echoedKeyframe = await new Promise<{
        annexB: Buffer;
        isKeyframe: boolean;
        nalTypes?: number[];
        sps?: Buffer;
        pps?: Buffer;
    }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout waiting for echoed H.264 Keyframe")), 2000);
        rtcSession.once("video_annexb_frame", (frame) => {
            clearTimeout(timer);
            resolve(frame);
        });
        void rtcSession.sendH264AnnexBFrame(testKeyAnnexB, { timestamp: 90000 });
    });

    assert.equal(echoedKeyframe.isKeyframe, true, "Khung IDR H.264 phải được đánh dấu isKeyframe=true");
    assert.deepEqual(echoedKeyframe.nalTypes, [7, 8, 5], "Khung Keyframe phải tách đúng NAL [7, 8, 5]");
    assert.ok(echoedKeyframe.sps?.equals(testSps), "SPS trích xuất phải khớp 100%");
    assert.ok(echoedKeyframe.pps?.equals(testPps), "PPS trích xuất phải khớp 100%");
    assert.ok(
        observedVideoRtpPts.length >= 3 && observedVideoRtpPts.every((pt) => pt === 98),
        "Mọi gói RTP của Keyframe H.264 phải gửi với payloadType=98 theo chuẩn Zalo RTPSender::SendOutgoingData",
    );

    // Kiểm định gói H.264 FU-A (origNalType=0) & SingleNAL (nal=0) chuẩn iOS VideoToolbox (g_nalHeaderSize=0) kèm gói RTP Padding (P=1)
    const iosFuaPayload = Buffer.concat([
        Buffer.from([0x00, 0x00, 0x00, 0x01]),
        testSps,
        Buffer.from([0x00, 0x00, 0x00, 0x01]),
        testPps,
        Buffer.from([0x00, 0x00, 0x00, 0x01]),
        testIdr,
    ]);
    const iosFrag1 = Buffer.concat([Buffer.from([0x1c, 0x80]), iosFuaPayload.subarray(0, 900)]);
    const iosFrag2 = Buffer.concat([Buffer.from([0x1c, 0x40]), iosFuaPayload.subarray(900)]);

    const iosKeyframe = await new Promise<{
        annexB: Buffer;
        isKeyframe: boolean;
        nalTypes?: number[];
    }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout waiting for iOS FU-A(orig=0) Keyframe")), 2000);
        rtcSession.once("video_annexb_frame", (frame) => {
            clearTimeout(timer);
            resolve(frame);
        });
        void rtcSession.sendVideoFrame(iosFrag1, { payloadType: 98, timestamp: 180000, marker: false });
        void rtcSession.sendVideoFrame(iosFrag2, { payloadType: 98, timestamp: 180000, marker: true });
    });

    assert.equal(iosKeyframe.isKeyframe, true, "Gói FU-A(orig=0) từ iOS phải nhận diện đúng Keyframe");
    assert.deepEqual(
        iosKeyframe.nalTypes,
        [7, 8, 5],
        "Gói FU-A(orig=0) từ iOS phải tách chuẩn xác [7, 8, 5] không bị thừa byte 0x00",
    );

    const iosDeltaFrame = await new Promise<{
        annexB: Buffer;
        isKeyframe: boolean;
        nalTypes?: number[];
    }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout waiting for iOS SingleNAL(nal=0) Delta")), 2000);
        rtcSession.once("video_annexb_frame", (frame) => {
            clearTimeout(timer);
            resolve(frame);
        });
        const iosSingleP = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x41, 0x9a, 0x24, 0x6c, 0x88]);
        void rtcSession.sendVideoFrame(iosSingleP, { payloadType: 97, timestamp: 186000, marker: true });
    });

    assert.equal(iosDeltaFrame.isKeyframe, false, "Gói P-slice PT=97 phải có isKeyframe=false");
    assert.deepEqual(iosDeltaFrame.nalTypes, [1], "Gói SingleNAL(nal=0) từ iOS phải tách đúng NAL [1]");

    // Kiểm định các lệnh điều khiển trong cuộc gọi (Camera On/Off, Mic Mute/Unmute, Hold/Unhold, Upgrade Audio -> Video, EndCall user_hangup)
    let relayReceivedEndCallCmd3 = false;
    let relayReceivedCamForward = false;
    mockRelaySocket.on("message", (msg) => {
        const pkt = parseZRTPPacket(msg);
        if (pkt.family === "control" && !pkt.isResponse && pkt.cmd === ZRTPControlCommand.EndCall) {
            assert.equal(msg.length, 25, "Gói UDP RequestEndCall (cmd=3) phải dài đúng 25 bytes");
            assert.equal(msg[0], 0x01);
            assert.equal(msg[1], 0x7e);
            if (pkt.callId === 998877) {
                relayReceivedEndCallCmd3 = true;
            }
        } else if (
            pkt.family === "control" &&
            !pkt.isResponse &&
            pkt.cmd === ZRTPControlCommand.RequestForward &&
            (pkt.flags === 7 || pkt.flags === 8)
        ) {
            relayReceivedCamForward = true;
        }
    });

    await rtcSession.setMicMuted(true);
    assert.equal(rtcSession.getMediaState().isMicMuted, true);
    await rtcSession.setCameraEnabled(true);
    await new Promise((r) => setTimeout(r, 25));
    assert.equal(rtcSession.getMediaState().isCameraOn, true);
    assert.equal(relayReceivedCamForward, true, "Bật/tắt camera phải gửi gói UDP RequestForward cmd=32 subCmd=7/8");
    await rtcSession.setHoldState(true);
    assert.equal(rtcSession.getMediaState().isHold, true);
    await rtcSession.setScreenShareEnabled(true);
    assert.equal(rtcSession.getMediaState().isScreenSharing, true);
    await rtcSession.upgradeAudioToVideoCall(1);
    assert.equal(rtcSession.getMediaState().callType, CallType.Video);

    const endCallReqCountBefore = capturedRequests.filter((r) => r.url.includes("/api/voicecall/endcall")).length;
    await rtcSession.endCall("user_hangup");
    await new Promise((r) => setTimeout(r, 25));
    const endCallReqCountAfter = capturedRequests.filter((r) => r.url.includes("/api/voicecall/endcall")).length;
    assert.equal(rtcSession.getState(), "ended");
    assert.equal(relayReceivedEndCallCmd3, true, "endCall('user_hangup') phải gửi gói UDP cmd=3 RequestEndCall");
    assert.ok(
        endCallReqCountAfter > endCallReqCountBefore,
        "endCall('user_hangup') bắt buộc phải gọi HTTP /api/voicecall/endcall để ngắt máy phía đối phương",
    );

    // Kiểm định chuẩn cấu trúc sự kiện Gọi đến 1-1 thực tế của Zalo (_parseActRequest @ 0x10001c824: callId nằm trong JSON string params.id, rtpIP, rtcpIP, uidN, uidFrom, uidTo)
    const realZaloIncoming1v1Event = {
        act: "request",
        act_type: "voip",
        type: CallEventType.REQUEST,
        data: {
            status: 0,
            uidFrom: 1412345678,
            uidTo: 1987654321,
            uidN: callCalleeId,
            ts: Date.now(),
            params: JSON.stringify({
                id: 889911,
                sessId: `127.0.0.1:${relayPort}-889911`,
                rtpIP: `127.0.0.1:${relayPort}`,
                rtcpIP: `127.0.0.1:${relayPort}`,
                Dname: "Ly Van Bong",
                avatar: "https://s120-ava-talk.zadn.vn/test.jpg",
                extendData: JSON.stringify({
                    callType: 1,
                    video: 1,
                }),
            }),
        },
    };

    const parsed1v1 = parseIncomingCallEvent(realZaloIncoming1v1Event);
    assert.equal(parsed1v1.callId, 889911, "parseIncomingCallEvent phải trích xuất đúng callId từ params.id");
    assert.equal(parsed1v1.callerId, callCalleeId, "parseIncomingCallEvent phải lấy uidN làm callerId");
    assert.equal(parsed1v1.fromUid32, 1987654321, "fromUid32 của Callee phải lấy từ uidTo");
    assert.equal(parsed1v1.toUid32, 1412345678, "toUid32 của Callee phải lấy từ uidFrom");
    assert.equal(parsed1v1.callerName, "Ly Van Bong");
    assert.equal(parsed1v1.isVideo, true);
    assert.equal(parsed1v1.callType, CallType.Video);
    assert.equal(parsed1v1.rtpPort, relayPort);

    const incomingSession = api.call.createRtcSession({
        autoAttachListener: false,
        autoKeepaliveMedia: false,
    });
    const ringedInfo = await incomingSession.ringIncomingCall(realZaloIncoming1v1Event);
    assert.equal(ringedInfo.callId, 889911);
    assert.equal(incomingSession.getState(), "ringing");

    const accepted1v1Params = await incomingSession.acceptIncomingCall(realZaloIncoming1v1Event, {
        skipRingRing: true,
    });
    assert.equal(accepted1v1Params.callId, 889911);
    assert.equal(accepted1v1Params.fromId, 1987654321);
    assert.equal(accepted1v1Params.toId, 1412345678);
    assert.equal(accepted1v1Params.udpHandshakeVerified, true);
    assert.equal(incomingSession.getState(), "active");
    await incomingSession.endCall("local_end");

    // Kiểm định Direct Mobile Media Handoff (signalingOnly: true -> Worker không mở UDP socket, trả trọn bộ gói hex cho Mobile)
    const workerSignalingOnlySession = api.call.createRtcSession({
        autoAttachListener: false,
        signalingOnly: true,
    });
    const mobileHandoffParams = await workerSignalingOnlySession.startOutgoingCall(callCalleeId, {
        callId: 998877,
        callType: CallType.Audio,
    });
    assert.equal(
        mobileHandoffParams.localUdpPort,
        0,
        "Chế độ signalingOnly trên Worker tuyệt đối không được mở UDP socket tại Worker",
    );
    assert.ok(mobileHandoffParams.mobileDirectHandoff.initCallPacketHex.length > 40);
    const parsedMobileInitPkt = parseZRTPPacket(
        Buffer.from(mobileHandoffParams.mobileDirectHandoff.initCallPacketHex, "hex"),
    );
    assert.equal(parsedMobileInitPkt.family, "control");
    if (parsedMobileInitPkt.family === "control") {
        assert.equal(parsedMobileInitPkt.cmd, ZRTPControlCommand.InitCallCaller);
        assert.equal(parsedMobileInitPkt.callId, 998877);
    }
    await workerSignalingOnlySession.endCall("local_end");

    // Kiểm định rejectIncomingCall (1-1 với params.id), startGroupCall, ringIncomingCall & acceptIncomingGroupCall (với data.id & callSetting.session & partnerInfo)
    const rejectSession = api.call.createRtcSession({ autoAttachListener: false });
    await rejectSession.rejectIncomingCall(realZaloIncoming1v1Event);
    assert.equal(rejectSession.getState(), "ended");

    // Kiểm định Gọi nhóm đi (startGroupCall):
    // 1. typeRequest/callType phải chuẩn hoá về 0 (Audio) | 1 (Video) thay vì 5 | 6
    // 2. requestGroupCall (12433) có noiseId: JSON.stringify(partners) và sendRequestGroupCall (12434) có JSON 2 lớp (hostCall, noiseId, rtpAddress, data)
    // 3. Đọc callId (778899) và callSetting.session ("888999000_778899_501") từ reqRes.params
    const grpOutgoingSession = api.call.createRtcSession({
        autoAttachListener: false,
        autoKeepaliveMedia: false,
    });
    const grpOutgoingParams = await grpOutgoingSession.startGroupCall("888999000", ["5001", "5002"], {
        callType: CallType.GroupVideo,
        groupName: "Nhóm Kiểm Định Outgoing",
        groupAvatar: "https://ava.zalo.me/group.jpg",
    });
    assert.equal(
        grpOutgoingParams.callId,
        778899,
        "startGroupCall phải trích xuất đúng callId thật từ reqRes.params do Zalo cấp phát",
    );
    assert.equal(
        grpOutgoingParams.sessId,
        "888999000_778899_501",
        "startGroupCall phải trích xuất đúng callSetting.session từ reqRes.params",
    );
    assert.equal(grpOutgoingParams.udpHandshakeVerified, true);
    const decodeCapturedUrlParams = (urlStr: string): Record<string, unknown> => {
        const enc = new URL(urlStr).searchParams.get("params");
        assert.ok(enc, `URL ${urlStr} phải có query param params`);
        return JSON.parse(decodeAES(TEST_SECRET_KEY, enc!)!);
    };
    const lastGrpSendReq = capturedRequests
        .filter((r) => r.url.includes("/api/voicecall/group/request") && !r.url.includes("requestcall"))
        .pop();
    assert.ok(lastGrpSendReq, "startGroupCall phải gọi /api/voicecall/group/request (12434)");
    const lastGrpSendDecoded = decodeCapturedUrlParams(lastGrpSendReq!.url);
    assert.equal(lastGrpSendDecoded.callId, 778899);
    assert.equal(lastGrpSendDecoded.callType, 1, "sendRequestGroupCall phải gửi callType = 1 cho GroupVideo");
    const lastGrpSendOuter = JSON.parse(String(lastGrpSendDecoded.data));
    assert.equal(lastGrpSendOuter.hostCall, TEST_UID);
    assert.equal(lastGrpSendOuter.noiseId, JSON.stringify(["5001", "5002"]));
    assert.equal(lastGrpSendOuter.rtpAddress, `127.0.0.1:${relayPort}`);
    const lastGrpSendInner = JSON.parse(String(lastGrpSendOuter.data));
    assert.equal(lastGrpSendInner.hostCall, TEST_UID);
    assert.equal(lastGrpSendInner.noiseId, JSON.stringify(["5001", "5002"]));
    assert.equal(lastGrpSendInner.groupName, "Nhóm Kiểm Định Outgoing");
    await grpOutgoingSession.endCall("local_end");

    const incomingGroupEvent = {
        act: "group_request",
        data: {
            id: 667788,
            fromId: 1412345678,
            receiverId: 1987654321,
            hostCall: "888999000",
            groupNoiseId: "888999000",
            groupName: "Nhóm Kiểm Định ZRTC",
            callType: 1,
            callSetting: {
                session: "888999000_667788_501",
            },
            partnerInfo: [
                { userId: 1001, id: "5001", name: "Nguyễn Văn A", avatar: "https://ava.zalo.me/a.jpg" },
                { userId: 1002, id: "5002", name: "Trần Thị B", avatar: "https://ava.zalo.me/b.jpg" },
            ],
            rtpAddress: `127.0.0.1:${relayPort}`,
            rtcpAddress: `127.0.0.1:${relayPort}`,
        },
    };

    // Kiểm định parseIncomingCallEvent giữ nguyên partnerInfo (id, userId, name, avatar) đồng thời giữ partners: string[]
    const parsedIncomingGrp = parseIncomingCallEvent(incomingGroupEvent);
    assert.deepEqual(parsedIncomingGrp.partners, ["5001", "5002"]);
    assert.equal(parsedIncomingGrp.partnerInfo.length, 2);
    assert.equal(parsedIncomingGrp.partnerInfo[0].id, "5001");
    assert.equal(parsedIncomingGrp.partnerInfo[0].userId, 1001);
    assert.equal(parsedIncomingGrp.partnerInfo[0].name, "Nguyễn Văn A");
    assert.equal(parsedIncomingGrp.partnerInfo[0].avatar, "https://ava.zalo.me/a.jpg");
    assert.equal(parsedIncomingGrp.partnerInfo[1].name, "Trần Thị B");

    const grpAcceptSession = api.call.createRtcSession({
        autoAttachListener: false,
        autoKeepaliveMedia: false,
    });
    const grpAcceptParams = await grpAcceptSession.acceptIncomingGroupCall(incomingGroupEvent, {
        skipUdpHandshake: true,
    });
    assert.equal(grpAcceptParams.callId, 667788);
    assert.equal(grpAcceptParams.sessId, "888999000_667788_501");
    assert.equal(grpAcceptSession.getState(), "active");
    assert.equal(grpAcceptSession.getGroupPartnerInfo().length, 2);
    assert.equal(grpAcceptSession.getGroupPartnerInfo()[0].name, "Nguyễn Văn A");
    assert.equal(grpAcceptSession.getGroupPartnerInfo()[0].avatar, "https://ava.zalo.me/a.jpg");

    const lastGrpRingReq = capturedRequests.filter((r) => r.url.includes("/api/voicecall/group/ringring")).pop();
    assert.ok(lastGrpRingReq, "acceptIncomingGroupCall phải gọi /api/voicecall/group/ringring (12439)");
    const lastGrpRingDecoded = decodeCapturedUrlParams(lastGrpRingReq!.url);
    assert.equal(lastGrpRingDecoded.callType, 1, "ringRingGroupCall phải gửi callType = 1 (không gửi 6)");
    const lastGrpRingData = JSON.parse(String(lastGrpRingDecoded.data));
    assert.equal(lastGrpRingData.callType, 1);
    assert.equal(lastGrpRingData.session, "888999000_667788_501");
    assert.equal(lastGrpRingData.status, 0);

    const lastGrpAnsReq = capturedRequests.filter((r) => r.url.includes("/api/voicecall/group/answer")).pop();
    assert.ok(lastGrpAnsReq, "acceptIncomingGroupCall phải gọi /api/voicecall/group/answer (12436)");
    const lastGrpAnsDecoded = decodeCapturedUrlParams(lastGrpAnsReq!.url);
    assert.equal(lastGrpAnsDecoded.callType, 1, "answerGroupCall phải gửi callType = 1 (không gửi 6)");
    const lastGrpAnsData = JSON.parse(String(lastGrpAnsDecoded.data));
    assert.equal(lastGrpAnsData.callType, 1);
    assert.equal(lastGrpAnsData.session, "888999000_667788_501");
    assert.equal(lastGrpAnsData.status, 0);

    await grpAcceptSession.endCall("local_end");

    // Kiểm định Gọi lại liên tiếp (Sequential Re-call) trên cùng một instance ZaloRtcSession & Tái kết nối UDP (reconnectUdp)
    const recallSession = api.call.createRtcSession({
        autoAttachListener: false,
        autoKeepaliveMedia: false,
    });
    const firstCallParams = await recallSession.startOutgoingCall(callCalleeId, {
        callId: 510001,
        callType: CallType.Video,
    });
    assert.equal(firstCallParams.callId, 510001);
    assert.equal(firstCallParams.udpHandshakeVerified, true);
    await recallSession.endCall("local_end");
    assert.equal(recallSession.getState(), "ended");

    // Cuộc gọi thứ 2 trên cùng instance recallSession phải reset sạch state và bắt tay UDP mới thành công
    const secondCallParams = await recallSession.startOutgoingCall(callCalleeId, {
        callId: 510002,
        callType: CallType.Audio,
    });
    assert.equal(secondCallParams.callId, 510002);
    assert.equal(secondCallParams.callType, CallType.Audio);
    assert.equal(secondCallParams.udpHandshakeVerified, true);
    assert.ok(secondCallParams.localUdpPort > 0);

    // Kiểm định handoffUdpToExternal() -> reconnectUdp() (tái kích hoạt kết nối UDP giữa cuộc gọi)
    const handoffMidCall = recallSession.handoffUdpToExternal();
    assert.equal(handoffMidCall.callId, 510002);
    assert.equal(recallSession.getConnectionParams()?.localUdpPort, 0);

    const reconnectedParams = await recallSession.reconnectUdp();
    assert.equal(reconnectedParams.callId, 510002);
    assert.equal(reconnectedParams.udpHandshakeVerified, true);
    assert.ok(reconnectedParams.localUdpPort > 0, "Sau reconnectUdp() phải bind lại cổng UDP mới thành công");
    await recallSession.endCall("local_end");

    mockRelaySocket.close();
    ctx.options.polyfill = prevPolyfill;

    // 10.4 Kiểm tra ZaloCallController & ZaloCallTransport (IPC AES-128-CBC Hex + $ + ack queue + sendSignal <-> recvSignal)
    const controller = api.call.createController({
        spawnProcess: false,
        autoForwardCallEvents: false,
    });
    await controller.start();

    const receivedFromController: Array<{ type: string; command?: number | string; data?: unknown }> = [];
    const recvSignalPromise = new Promise<{
        type: number;
        seqId: number;
        errorCode: number;
        sessId?: string;
    }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout waiting for recvSignal")), 3000);
        const mockSendSock = net.createConnection(controller.transport.sendSocketPath);
        const mockRecvSock = net.createConnection(controller.transport.receiveSocketPath);

        let buf = "";
        mockSendSock.on("data", (chunk) => {
            mockSendSock.write("ack");
            buf += chunk.toString("utf-8");
            let idx = buf.indexOf("$");
            while (idx !== -1) {
                const frame = buf.slice(0, idx);
                buf = buf.slice(idx + 1);
                if (frame) {
                    const msg = controller.transport.decryptFrame(frame);
                    receivedFromController.push(msg);
                    if (msg.type === "recvSignal") {
                        clearTimeout(timer);
                        mockSendSock.destroy();
                        mockRecvSock.destroy();
                        resolve(
                            msg.data as {
                                type: number;
                                seqId: number;
                                errorCode: number;
                                sessId?: string;
                            },
                        );
                    }
                }
                idx = buf.indexOf("$");
            }
        });

        mockRecvSock.on("connect", () => {
            for (const f of controller.transport.encryptFrames({
                type: "sendSignal",
                command: 401,
                data: {
                    seqId: 42,
                    calleeId: callCalleeId,
                    callId: 333444,
                    typeRequest: CallType.Audio,
                },
            })) {
                mockRecvSock.write(f);
            }
        });
    });

    const signalReply = await recvSignalPromise;
    assert.equal(signalReply.type, 401);
    assert.equal(signalReply.seqId, 42);
    assert.equal(signalReply.errorCode, 0);
    assert.equal(signalReply.sessId, `${callCalleeId}_333444_401`);
    assert.ok(
        receivedFromController.some((m) => m.type === "update" && m.command === "init"),
        "Controller phải gửi update.init ngay khi ZaloCall kết nối",
    );
    await controller.stop();

    console.log(
        "✅ [10/11] Call Engine (ZRTPPacketCodec, ZaloSrtpSession, ZaloRtcSession 2 chiều UDP/SRTP & ZaloCallController IPC): Chính xác 100%.",
    );

    // -------------------------------------------------------------------------
    // TEST 11: Zalo Official Account (OA) (parseOAMessage, footerv2, OA Bitmask, getOAProfile, blockOA, unblockOA, convertOAIds & WSS cmd 533 -> 570 -> 534 + 601 oa_event)
    // -------------------------------------------------------------------------
    const sampleOAChatMsgRaw = {
        actionId: "50001",
        msgId: "70001",
        cliMsgId: "80001",
        msgType: "webchat",
        uidFrom: "2359864726282056346",
        idTo: TEST_UID,
        dName: "SofttyNet Company Limited",
        ts: "1760000099000",
        status: 1,
        content: "Xin chào anh/chị! SofttyNet có thể hỗ trợ gì cho anh/chị hôm nay?",
        footerv2: {
            type: 0,
            data: {
                canForward: 1,
                footerList: [
                    { title: "Xem bảng giá", action: "open_url", href: "https://www.softty.net/pricing" },
                    { title: "Chat với tư vấn viên", action: "send_msg", text: "Tư vấn ngay" },
                ],
            },
        },
        notify: "1",
        ttl: 0,
        userId: "2359864726282056346",
        uin: "0",
        topOut: "1",
        topOutTimeOut: "0",
        topOutImprTimeOut: "0",
        propertyExt: undefined,
        paramsExt: { countUnread: 1, containType: 0, platformType: 0 },
        cmd: 501,
        st: 1,
        at: 0,
        realMsgId: "70001",
        quote: undefined,
    };

    // 11.1 Kiểm định OA Bitmask, DNR Status, FooterV2, parseOAMessage & UserMessage.oaData
    assert.equal(isOAProfile({ type: 7 }), true);
    assert.equal(isOAProfile({ type: 0 }), false);
    assert.equal(isOAVerified(7), true, "type = 7 (111b) phải là OA tích vàng (isOAVerified === true)");
    assert.equal(isOAVerified(5), true, "type = 5 (101b) phải là OA tích vàng (isOAVerified === true)");
    assert.equal(isOAVerified(2), false, "type = 2 (10b) không phải là OA tích vàng");
    assert.equal(isZaloBot(8), true, "type = 8 (1000b) phải là Zalo Bot");
    assert.equal(isZaloBot(7), false);

    const parsedDnr = parseOADnrStatus({
        blocked: 0,
        enable_dnr: 1,
        dnr_type: 2,
        dnr_string: { vi: "Đang tắt thông báo đến 08:00" },
    });
    assert.equal(parsedDnr.isBlocked, false);
    assert.equal(parsedDnr.enableDnr, true);
    assert.equal(parsedDnr.dnrType, 2);
    assert.equal(parsedDnr.dnrText, "Đang tắt thông báo đến 08:00");

    const parsedFooter = parseOAFooter(sampleOAChatMsgRaw.footerv2);
    assert.equal(parsedFooter?.canForward, true);
    assert.equal(parsedFooter?.footerList.length, 2);
    assert.equal(parsedFooter?.footerList[0].title, "Xem bảng giá");

    const oaChatMsg = new UserMessage(TEST_UID, sampleOAChatMsgRaw, true);
    assert.equal(oaChatMsg.isOAMessage(), true, "Tin nhắn hội thoại OA phải được nhận diện isOAMessage() === true");
    assert.equal(oaChatMsg.oaData?.kind, "oa_chat");
    assert.equal(oaChatMsg.oaData?.text, "Xin chào anh/chị! SofttyNet có thể hỗ trợ gì cho anh/chị hôm nay?");
    assert.equal(oaChatMsg.oaData?.topOut, true);
    assert.equal(oaChatMsg.oaData?.canReply, true);
    assert.equal(oaChatMsg.oaData?.footer?.footerList.length, 2);

    const parsedOAList = parseOAMessage({
        msgType: "chat.list.action",
        content: [
            {
                type: "l.a.header.full",
                title: "Thông báo bảo trì hệ thống",
                description: "Từ 00:00 đến 02:00 ngày 26/10",
                href: "https://oa.zalo.me/article/1",
            },
            {
                type: "l.a.normal",
                title: "Hướng dẫn giao dịch an toàn",
                description: "Xem chi tiết",
            },
        ],
    });
    assert.equal(parsedOAList?.kind, "oa_list");
    assert.equal(parsedOAList?.items?.length, 2);
    assert.ok(parsedOAList?.text.includes("Thông báo bảo trì hệ thống: Từ 00:00 đến 02:00 ngày 26/10"));

    const parsedInfoChat = parseOAMessage({
        msgType: "webchat",
        content: {
            action: "msginfo.actionlist",
            params: JSON.stringify({
                msg: { vi: "Bạn đã quan tâm %1$s" },
                highLightsV2: [{ dpn: "Zalo Official Account" }],
            }),
        },
    });
    assert.equal(parsedInfoChat?.kind, "info_chat");
    assert.equal(parsedInfoChat?.text, "Bạn đã quan tâm Zalo Official Account");

    const parsedECard = parseOAMessage({
        msgType: "chat.ecard",
        content: {
            title: "Chúc mừng sinh nhật",
            description: "Ưu đãi giảm 20% từ OA",
        },
    });
    assert.equal(parsedECard?.kind, "ecard");
    assert.equal(parsedECard?.text, "Chúc mừng sinh nhật — Ưu đãi giảm 20% từ OA");
    assert.equal(formatOAHighlightText("Xin chào %1$s - $2$s", ["A", "B"]), "Xin chào A - B");

    // 11.2 Kiểm định HTTP APIs cho Zalo OA (getOAProfile, blockOA, unblockOA, convertOAIds)
    const oaProfile = await api.business.getOAProfile("2359864726282056346");
    assert.equal(oaProfile.oaId, "2359864726282056346");
    assert.equal(oaProfile.displayName, "SofttyNet Company Limited");
    assert.equal(oaProfile.type, 7);
    assert.equal(oaProfile.isOA, true);
    assert.equal(oaProfile.isVerified, true);
    assert.equal(oaProfile.isZaloBot, false);
    assert.equal(oaProfile.hotline, "02862705168");
    assert.equal(oaProfile.website, "https://www.softty.net");
    assert.equal(oaProfile.category, "Doanh nghiệp");
    assert.equal(oaProfile.openTime, "08:00 - 17:00");
    assert.equal(oaProfile.email, "contact@softty.net");
    assert.equal(oaProfile.dnrStatus.enableDnr, true);
    assert.ok(normalizeOAProfile("2359864726282056346", oaProfile.rawProfile).isVerified);

    await api.business.blockOA("2359864726282056346");
    await api.business.unblockOA("2359864726282056346");
    const convertedOAs = await api.business.convertOAIds(["oa_101", "oa_102"]);
    assert.equal(convertedOAs.oa_101, "uid_oa_oa_101");
    assert.equal(convertedOAs.oa_102, "uid_oa_oa_102");

    // 11.3 Kiểm định WebSocket (wss) cho Zalo OA:
    //   - cmd = 533 (HAS_MSG với 25 IDs) -> Tự động gửi 2 gói cmd = 570 (GET_MSG, batch 20 + 5)
    //   - cmd = 570 (GET_MSG), cmd = 534 (PUSH_MISS_MSG), cmd = 501 (pageMsgs) -> emit "message" & "oa_message"
    //   - cmd = 601 (act_type = "oa", act = "block") -> emit "oa_event"
    const receivedOAMessages: UserMessage[] = [];
    const receivedOAEvents: Array<{ act: string; isBlocked: boolean; oaIds: string[] }> = [];
    const serverReceivedCmd570Batches: Array<{ queueId: unknown; ids: unknown[]; reqId: string }> = [];

    api.listener.on("oa_message", (msg) => {
        receivedOAMessages.push(msg);
    });
    api.listener.on("oa_event", (ev) => {
        receivedOAEvents.push(ev);
    });

    const oaWss = new WebSocketServer({ host: "127.0.0.1", port: 0 });
    await new Promise<void>((r) => oaWss.once("listening", () => r()));
    const oaWsPort = (oaWss.address() as { port: number }).port;
    (api.listener as unknown as { urls: string[] }).urls = [`ws://127.0.0.1:${oaWsPort}`];

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("OA WebSocket test timeout")), 5000);
        oaWss.on("connection", async (serverWs) => {
            try {
                serverWs.on("message", async (rawBuf: Buffer) => {
                    const cmd = rawBuf.readUInt16LE(1);
                    const subCmd = rawBuf.readUInt8(3);
                    if (cmd === 570 && subCmd === 0) {
                        const body = JSON.parse(rawBuf.subarray(4).toString("utf-8"));
                        serverReceivedCmd570Batches.push(body);
                        // Khi nhận đủ 2 batch cmd=570 (20 + 5 IDs), trả về gói cmd=570 chứa pageMsgs OA
                        if (serverReceivedCmd570Batches.length === 2) {
                            const frame570 = await encryptWsPayloadAesGcm(wsCipherKey, {
                                data: {
                                    msgs: [],
                                    pageMsgs: [sampleOAChatMsgRaw],
                                },
                            });
                            serverWs.send(buildWsFrame(1, 570, 0, frame570));
                        }
                    }
                });

                // 1. Gửi cipher_key
                serverWs.send(buildWsFrame(1, 1, 1, { key: wsCipherKey }));

                // 2. Gửi cmd=533 (HAS_MSG) báo có 25 tin nhắn OA đang chờ trong queue
                const twentyFiveIds = Array.from({ length: 25 }, (_, idx) => ({
                    actionId: String(60000 + idx),
                    msgId: String(80000 + idx),
                }));
                const frame533 = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        queueId: { cmd: 501, subCmd: 0, queueName: "page_msg_queue" },
                        ids: twentyFiveIds,
                    },
                });
                serverWs.send(buildWsFrame(1, 533, 0, frame533));

                // 3. Gửi cmd=534 (PUSH_MISS_MSG) chứa pageMsgs kiểu chat.list.action
                const frame534 = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        pageMsgs: [
                            {
                                ...sampleOAChatMsgRaw,
                                msgId: "70002",
                                msgType: "chat.list.action",
                                content: [
                                    {
                                        type: "l.a.header.full",
                                        title: "Tin tức Zalo OA qua cmd 534",
                                        description: "Nội dung chi tiết",
                                    },
                                ],
                            },
                        ],
                    },
                });
                serverWs.send(buildWsFrame(1, 534, 0, frame534));

                // 4. Gửi cmd=601 (act_type="oa", act="block")
                const frame601OA = await encryptWsPayloadAesGcm(wsCipherKey, {
                    data: {
                        controls: [
                            {
                                content: {
                                    act_type: "oa",
                                    act: "block",
                                    data: JSON.stringify({ uids: ["2359864726282056346"] }),
                                },
                            },
                        ],
                    },
                });
                serverWs.send(buildWsFrame(1, 601, 0, frame601OA));

                const checkDone = setInterval(() => {
                    if (
                        serverReceivedCmd570Batches.length === 2 &&
                        receivedOAMessages.length >= 2 &&
                        receivedOAEvents.length >= 1
                    ) {
                        clearInterval(checkDone);
                        clearTimeout(timeout);
                        resolve();
                    }
                }, 20);
            } catch (err) {
                clearTimeout(timeout);
                reject(err);
            }
        });

        api.listener.start({ retryOnClose: false });
    });

    api.listener.stop();
    await new Promise<void>((r) => oaWss.close(() => r()));

    assert.equal(serverReceivedCmd570Batches.length, 2, "cmd=533 với 25 IDs phải tự động chia thành 2 batch cmd=570 (20 + 5)");
    assert.equal(serverReceivedCmd570Batches[0].ids.length, 20);
    assert.equal(serverReceivedCmd570Batches[1].ids.length, 5);
    assert.equal(receivedOAMessages.length, 2, "Phải nhận đủ 2 tin nhắn OA từ cmd=570 và cmd=534");
    assert.ok(
        receivedOAMessages.some(
            (m) =>
                m.oaData?.kind === "oa_chat" &&
                m.oaData.text.includes("SofttyNet có thể hỗ trợ gì") &&
                m.oaData.footer?.footerList.length === 2,
        ),
        "Tin nhắn OA qua WSS cmd=570 phải giải mã đầy đủ nội dung và footerv2",
    );
    assert.ok(
        receivedOAMessages.some(
            (m) => m.oaData?.kind === "oa_list" && m.oaData.text.includes("Tin tức Zalo OA qua cmd 534"),
        ),
        "Tin nhắn OA qua WSS cmd=534 phải giải mã đúng danh sách bài viết",
    );
    assert.equal(receivedOAEvents.length, 1);
    assert.equal(receivedOAEvents[0].isBlocked, true);
    assert.deepEqual(receivedOAEvents[0].oaIds, ["2359864726282056346"]);

    console.log(
        "✅ [11/11] Zalo Official Account (OA) (parseOAMessage, footerv2, OA Bitmask, HTTP getOAProfile/blockOA/unblockOA/convertOAIds & WSS cmd 533->570->534 + oa_event): Chính xác 100%.",
    );
    console.log("\n🎉 TẤT CẢ 11 HẠNG MỤC KIỂM ĐỊNH ĐỀU VƯỢT QUA 100%!");
}

runVerificationSuite().catch((err) => {
    console.error("❌ Kiểm định thất bại:", err);
    process.exit(1);
});
