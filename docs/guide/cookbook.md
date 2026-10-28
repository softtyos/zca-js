---
title: "Cookbook & Best Practices - 10 Kịch bản Thực chiến Production"
description: "Hướng dẫn thực chiến: Lưu & khôi phục phiên đăng nhập (exportSession), gắn Proxy HTTP/SOCKS5 cho đa tài khoản, phân trang chống Rate-Limit, WebSocket 24/7, xử lý lỗi ZaloApiError, Gọi thoại/Video 2 chiều 1-1 & Nhóm (ZaloRtcSession), quản lý Zalo Official Account (OA), Dịch AI đa ngôn ngữ, Zalo To-Do & Nhắc hẹn 1-1, GIF Giphy/Guggy & Nhãn CRM."
---

# 🛠️ Kịch bản Thực chiến (Cookbook & Production Best Practices)

Tài liệu này tổng hợp **10 mẫu thiết kế chuẩn Production** khi vận hành hệ thống Bot / Worker Zalo thực tế với `@softtynet/zca-js`.

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

## 4. Duy trì Kết nối WebSocket Bền bỉ 24/7 (`Listener` + `KeepAlive` + 4 Outbound WS Requests)

```ts
api.listener.on("connected", () => {
    console.log("🟢 WebSocket Zalo đã kết nối");
    // Chủ động đồng bộ trạng thái Online, Đã nhận/Đã xem và cảm xúc ngay khi kết nối
    api.listener.sendPingActive();
    api.listener.requestLastDeliverSeen();
    api.listener.requestLastSeenSubChatTab();
    api.listener.requestLastSeenReaction();
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

## 6. Gọi Thoại, Video 1-1 & Gọi Nhóm 2 Chiều (`ZaloRtcSession` & 30 APIs trong `api.call`)

Phân hệ `api.call` cung cấp trọn bộ **30 API** gồm 28 API Báo hiệu (`zpw_type = 24`) và 2 bộ máy truyền tải **2 chiều thuần TypeScript (`createRtcSession` & `createController`)**:

```ts
import { CallType } from "@softtynet/zca-js";

const session = api.call.createRtcSession({ autoAttachListener: true });

// A. Gọi Video 1-1 hai chiều (Opus 16kHz + H.264 Annex-B FU-A)
const callParams = await session.startOutgoingCall(targetUid, {
    callType: CallType.Video, // Hoặc CallType.Audio
});
console.log("Đã kết nối RTP Server:", callParams.rtpAddress);

// B. Nhận khung âm thanh Opus & hình ảnh H.264 Annex-B từ đối phương / thành viên nhóm
session.on("audio_frame", (frame) => {
    // frame.payload: Buffer (Opus 16kHz Mono), frame.ssrc: number
});
session.on("video_annexb_frame", (frame) => {
    // frame.annexB: Buffer (00 00 00 01 + SPS/PPS/IDR/P-Slice)
    // frame.partnerId?: string (Zalo UID 19 chữ số của người phát trong Group Call)
    // frame.isKeyframe: boolean
});

// C. Tự động bắt máy khi có cuộc gọi 1-1 hoặc Gọi Nhóm đến qua WebSocket
api.listener.on("call_event", async (ev) => {
    if (ev.act === "request") {
        await session.ringIncomingCall(ev);
        await session.acceptIncomingCall(ev, { skipRingRing: true });
    } else if (ev.act === "group_request") {
        await session.ringIncomingCall(ev);
        await session.acceptIncomingGroupCall(ev, { skipRingRing: true });
    }
});

// D. Khởi tạo hoặc tham gia Cuộc gọi Nhóm Video 2 chiều qua Zavi SFU
// Lưu ý quy ước trạng thái Group Call: audioState = 0 (Mic Bật) / 1 (Mic Tắt), videoState = 0 (Cam Bật) / 1 (Cam Tắt)
const grpParams = await session.startGroupCall(groupId, memberUids, {
    callType: CallType.GroupVideo,
});
// Hoặc tham gia phòng gọi nhóm đang mở trên Banner:
// await session.joinActiveGroupCall(groupId, { callType: CallType.GroupVideo });
```

---

## 7. Nhận, Trả lời & Quản lý Zalo Official Account (`api.business` & `oa_message`)

`@softtynet/zca-js` hỗ trợ đầy đủ luồng hội thoại 2 chiều với Zalo Official Account (OA), tự động phân tách `pageMessages` và giải mã hồ sơ tích vàng (`isOAVerified`), thẻ bài viết (`chat.list.action`), nút bấm chân trang (`footerv2`):

```ts
import { ThreadType } from "@softtynet/zca-js";

// 1. Tra cứu hồ sơ chuẩn hóa của Zalo OA (bao gồm tích vàng, hotline, website, giờ mở cửa, DNR)
const oaProfile = await api.business.getOAProfile("2359864726282056346");
console.log(oaProfile.displayName, oaProfile.isVerified, oaProfile.hotline, oaProfile.website);

// 2. Tải trước các tin nhắn từ Zalo OA khi khởi động
const preload = await api.chat.preloadConversations();
for (const oaMsg of preload.pageMessages) {
    console.log(`[OA Preload] ${oaMsg.data.dName}: ${oaMsg.oaData?.text}`);
}

// 3. Lắng nghe tin nhắn OA thời gian thực qua WebSocket và tự động trả lời 2 chiều
api.listener.on("oa_message", async (msg) => {
    console.log(`[OA Realtime - ${msg.oaData?.kind}] ${msg.data.dName}: ${msg.oaData?.text}`);
    if (msg.oaData?.footer?.footerList.length) {
        console.log("Nút bấm chân trang (footerv2):", msg.oaData.footer.footerList);
    }
    if (!msg.isSelf) {
        await api.chat.sendMessage({ msg: "Cảm ơn OA, tôi đã nhận được thông tin!" }, msg.threadId, ThreadType.User);
    }
});

// 4. Lắng nghe sự kiện chặn / bỏ chặn OA và quản lý trạng thái OA
api.listener.on("oa_event", (ev) => {
    console.log(`Sự kiện OA: act=${ev.act}, isBlocked=${ev.isBlocked}, oaIds=${ev.oaIds.join(",")}`);
});
await api.business.blockOA("2359864726282056346");
await api.business.unblockOA("2359864726282056346");
```

---

## 8. Dịch Tin Nhắn Đa Ngôn Ngữ Tự Động Bằng Zalo AI (`api.chat` & `translate_event`)

Sử dụng bộ 5 API Dịch AI nguyên bản của Zalo PC (`zpw_type = 30`) để dịch tức thì tin nhắn thủ công, dịch tự động theo hội thoại hoặc lấy gợi ý bản dịch:

```ts
// 1. Dịch thủ công một đoạn văn bản sang tiếng Việt hoặc tiếng Anh
const manualRes = await api.chat.translateMessageManual({
    content: "Bonjour, comment allez-vous aujourd'hui ?",
    targetLanguage: "vi",
});
console.log("Bản dịch AI:", manualRes);

// 2. Dịch tự động tin nhắn trong luồng hội thoại
const autoRes = await api.chat.translateMessageAuto({
    content: "Let's schedule our deployment at 10 AM tomorrow.",
    targetLanguage: "vi",
});

// 3. Lấy gợi ý bản dịch nhanh khi đang soạn thảo
const suggestRes = await api.chat.getTranslateSuggestion({
    content: "Cảm ơn bạn đã hợp tác cùng chúng tôi!",
    targetLanguage: "en",
});

// 4. Kiểm tra và cập nhật cấu hình tự động dịch cho hội thoại
const translateSetting = await api.chat.getTranslateSetting();
api.listener.on("translate_event", (ev) => {
    console.log("[WebSocket AI Translate Update]", ev.data);
});
```

---

## 9. Quản Lý Công Việc Zalo To-Do, Nhắc Hẹn 1-1 & Bảng Tin Nhóm (`api.board`)

Tự động hóa giao việc (Zalo To-Do), quản lý lịch hẹn 1-1 (`getListOneOneBoard`) và lắng nghe sự kiện công việc / bình chọn thời gian thực:

```ts
// 1. Kiểm tra trạng thái kích hoạt Zalo To-Do và lấy danh sách công việc
const todoVerify = await api.board.verifyTodo();
const todoList = await api.board.getTodoList({ page: 1, count: 20 });

// 2. Tạo công việc mới (Zalo To-Do) giao cho thành viên kèm hạn hoàn thành
const newTodo = await api.board.createTodo({
    title: "Hoàn thành kiểm thử tích hợp ZCA-JS v1.4",
    content: "Kiểm tra toàn bộ 333 API và 18 sự kiện WebSocket Realtime",
    assignees: [targetUid],
    dueDate: Date.now() + 24 * 3600 * 1000,
    watchers: [],
});

// 3. Lấy danh sách nhắc hẹn 1-1 và bảng tin chung với một người bạn
const oneOneReminders = await api.board.getListOneOneBoard(targetUid);
const friendBoards = await api.board.getFriendBoardList(targetUid);

// 4. Lắng nghe sự kiện Zalo To-Do & Bình chọn nhóm qua WebSocket
api.listener.on("todo_event", (ev) => {
    console.log(`[To-Do Realtime] subCmd=${ev.subCmd}:`, ev.data);
});
api.listener.on("poll_event", (ev) => {
    console.log(`[Poll Realtime] pollId=${ev.pollId}:`, ev.data);
});
```

---

## 10. Kho Ảnh Động GIF Giphy/Guggy, Hiệu Ứng Tin Nhắn & Quản Lý Nhãn CRM (`api.sticker` & `api.business`)

Tích hợp tìm kiếm ảnh động GIF từ Giphy / Guggy / Tenor, hiệu ứng tin nhắn nền và quản lý Nhãn phân loại khách hàng CRM:

```ts
// 1. Lấy danh sách GIF thịnh hành & tìm kiếm GIF theo từ khóa (Giphy & Guggy)
const trendingGifs = await api.sticker.getTrendingGiphyGifs({ limit: 10 });
const happyGifs = await api.sticker.searchGiphyGifs("chúc mừng", { limit: 10 });
const textGifs = await api.sticker.searchGuggyGifs("Xin chào");

// 2. Lấy danh sách hiệu ứng tin nhắn (Message Effects & Visual Keyword Rules)
const effects = await api.sticker.getMessageEffects();
const keywordRules = await api.sticker.getVisualKeywordRule();

// 3. Quản lý Nhãn phân loại hội thoại CRM (Conversation Labels)
const crmLabels = await api.business.getConversationLabels();
console.log("Danh sách nhãn CRM hiện tại:", crmLabels.labelData, "Phiên bản:", crmLabels.version);
```
