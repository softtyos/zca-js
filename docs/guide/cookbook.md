---
title: "Cookbook & Best Practices - 6 Kịch bản Thực chiến Production"
description: "Hướng dẫn thực chiến: Lưu & khôi phục phiên đăng nhập (exportSession), gắn Proxy HTTP/SOCKS5 cho đa tài khoản, phân trang chống Rate-Limit, WebSocket 24/7, xử lý lỗi ZaloApiError và điều khiển 28 API Gọi thoại/Video 1-1 & Nhóm."
---

# 🛠️ Kịch bản Thực chiến (Cookbook & Production Best Practices)

Tài liệu này tổng hợp **6 mẫu thiết kế chuẩn Production** khi vận hành hệ thống Bot / Worker Zalo thực tế với `@softtynet/zca-js`.

---

## 1. Lưu & Khôi phục Phiên Đăng nhập (`exportSession` + `zalo.login`)

Để không phải quét mã QR lại mỗi khi khởi động lại server, hãy sử dụng `api.auth.exportSession()` ngay sau khi `loginQR()` thành công:

```ts
import { Zalo } from "@softtynet/zca-js";
import fs from "node:fs/promises";

const SESSION_FILE = "./zalo-session.json";

async function getAuthenticatedApi() {
    const zalo = new Zalo({ selfListen: true, requestTimeout: 30000 });

    // 1. Thử khôi phục phiên đã lưu từ đĩa / Database
    try {
        const raw = await fs.readFile(SESSION_FILE, "utf-8");
        const savedSession = JSON.parse(raw);
        const api = await zalo.login(savedSession);
        console.log("✅ Khôi phục phiên thành công cho UID:", api.getOwnId());
        return api;
    } catch {
        console.log("⚠️ Chưa có phiên hợp lệ, chuyển sang đăng nhập QR...");
    }

    // 2. Đăng nhập mới bằng QR và xuất phiên lưu lại
    const api = await zalo.loginQR();
    const session = api.auth.exportSession();
    await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2));
    console.log("💾 Đã lưu phiên đăng nhập mới cho UID:", session.uid);
    return api;
}
```

---

## 2. Chạy Đa Tài Khoản với Proxy Độc Lập (`agent` + `node-fetch`)

Khi vận hành nhiều tài khoản Zalo trên cùng một máy chủ, mỗi tài khoản nên đi qua một IP Proxy riêng kèm `userAgent` và `imei` cố định:

```ts
import { Zalo, type ExportedSession } from "@softtynet/zca-js";
import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch from "node-fetch";

async function createAccountWorker(session: ExportedSession, proxyUrl: string) {
    const proxyAgent = new HttpsProxyAgent(proxyUrl);

    const zalo = new Zalo({
        selfListen: true,
        logging: false,
        requestTimeout: 25000, // Tự động ngắt nếu Proxy treo quá 25 giây
        agent: proxyAgent,
        polyfill: nodeFetch as unknown as typeof fetch,
    });

    const api = await zalo.login(session);
    api.listener.start({ retryOnClose: true });
    return api;
}
```

---

## 3. Phân trang An toàn & Chống Rate-Limit (Lịch sử Chat & MediaStore)

Khi quét dữ liệu lịch sử lớn (tin nhắn nhóm hoặc kho lưu trữ Media/File/Link), luôn kết hợp con trỏ phân trang (`nextCursor` / `last_id`) với một khoảng nghỉ ngắn (`sleep`) giữa các trang:

```ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A. Phân trang Lịch sử Tin nhắn Nhóm (Cloud Message)
async function fetchGroupMessagesPaginated(api: any, groupId: string, maxPages = 10) {
    let cursor: string | number = 0;
    const allMessages = [];

    for (let page = 1; page <= maxPages; page++) {
        const res = await api.group.getGroupChatHistory(groupId, {
            count: 50,
            cursor,
            useOldEndpoint: page > 1, // Trang 1 gọi getrecentv2, các trang sau gọi getoldv2
        });

        if (!res.groupMsgs?.length) break;
        allMessages.push(...res.groupMsgs);

        if (!res.hasMore || !res.nextCursor || String(res.nextCursor) === String(cursor)) break;
        cursor = res.nextCursor;
        await sleep(350); // Nghỉ 350ms giữa các trang để bảo vệ tài khoản
    }
    return allMessages;
}

// B. Phân trang Kho Lưu Trữ Ảnh/Video, File, Link (MediaStore)
async function fetchGroupMediaOwners(api: any, groupId: string) {
    const ownerUids = new Set<string>();

    for (const mediaType of ["media", "file", "link"] as const) {
        let lastId: number | string | undefined = undefined;
        for (let page = 1; page <= 10; page++) {
            const res = await api.media.getConversationMedia({
                groupId,
                mediaType,
                limit: 50,
                lastId,
            });
            for (const item of res.items ?? []) {
                // owner_id 19 chữ số được bảo toàn chính xác nhờ preParseJsonIds
                if (item.owner_id) ownerUids.add(item.owner_id);
            }
            if (res.has_more !== 1 || !res.last_id || res.last_id === lastId) break;
            lastId = res.last_id;
            await sleep(300);
        }
    }
    return Array.from(ownerUids);
}
```

---

## 4. Duy trì Kết nối WebSocket Bền bỉ 24/7 (`Listener` + `KeepAlive`)

```ts
api.listener.on("connected", () => {
    console.log("🟢 WebSocket Zalo đã kết nối");
});

api.listener.on("disconnected", (code, reason) => {
    console.warn(`🟡 WebSocket tạm ngắt (code=${code}): ${reason}`);
});

api.listener.on("error", (err) => {
    console.error("🔴 Lỗi WebSocket:", err);
});

// Tự động kết nối lại khi đóng socket
api.listener.start({ retryOnClose: true });
```

---

## 5. Xử lý Ngoại lệ Tập trung với `ZaloApiError`

Mọi lỗi trả về từ máy chủ Zalo đều được chuẩn hóa thành `ZaloApiError` kèm mã lỗi số (`error.code`):

```ts
import { ZaloApiError } from "@softtynet/zca-js";

try {
    await api.friend.sendFriendRequest("Xin chào bạn!", targetUid);
} catch (err) {
    if (err instanceof ZaloApiError) {
        console.error(`Mã lỗi Zalo [${err.code}]: ${err.message}`);
        // Ví dụ: code 215 (bị chặn), code 222 (đối phương đã gửi lời mời trước đó)
    }
}
```

---

## 6. Điều khiển Vòng đời Cuộc gọi Thoại / Video 1-1 & Gọi Nhóm (`api.call` — 28 APIs)

Phân hệ `api.call` cung cấp trọn bộ **28 API Báo hiệu (`zpw_type = 24`)** từ cuộc gọi 1-1 (`11300` → `11311`, `12006`, `12056`, `12064`) đến cuộc gọi nhóm (`12433` → `12447`, `12043`, `12044`, `12097`, `12098`):

```ts
import { CallType } from "@softtynet/zca-js";

// A. Khởi tạo cuộc gọi 1-1 nhanh (gộp tự động 11300 + 11301)
const callRes = await api.call.sendVoiceCall(targetUid, {
    callType: CallType.Audio, // Hoặc CallType.Video
});
console.log("Đã đổ chuông! Call ID:", callRes.callId, "RTP Server:", callRes.rtpServer);

// B. Hoặc điều khiển từng bước (Step-by-step Signaling cho ZRTC Media Engine)
const step1 = await api.call.requestVoiceCall(targetUid, { callType: CallType.Video });
const step2 = await api.call.sendRequestVoiceCall(targetUid, {
    callId: step1.callId,
    sessId: step1.sessId,
    callType: CallType.Video,
    rtpServer: step1.rtpServer,
    rtcpServer: step1.rtcpServer,
    zrtpKey: step1.zrtpKey,
});

// C. Xử lý khi có cuộc gọi đến qua WebSocket (ringring -> answer -> conf -> endcall)
api.listener.on("call_event", async (evt) => {
    if (evt.action === "request") {
        // 1. Báo máy đang đổ chuông (cmd 11302)
        await api.call.ringRingVoiceCall(evt.fromUid, evt.callId);
        // 2. Bắt máy (cmd 11303) hoặc từ chối (cmd 11306)
        await api.call.answerVoiceCall(evt.fromUid, evt.callId);
        // 3. Đồng bộ trạng thái bật/tắt Mic & Camera (cmd 12006)
        await api.call.updateCallMediaState(evt.fromUid, evt.callId, { isMuteAudio: false, isOffVideo: true });
    }
});

// D. Khởi tạo và quản lý Cuộc gọi Nhóm (Group Call)
const grpRoom = await api.call.requestGroupCall(groupId, memberUids, { callType: CallType.GroupAudio });
await api.call.sendRequestGroupCall(groupId, grpRoom.callId, memberUids);
```