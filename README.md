# @softtynet/zca-js

<p align="left">
  <a href="https://www.npmjs.com/package/@softtynet/zca-js"><img src="https://img.shields.io/npm/v/@softtynet/zca-js.svg?label=%40softtynet%2Fzca-js&color=0068ff" alt="npm version" /></a>
  <a href="https://softtyos.github.io/zca-js-docs/"><img src="https://img.shields.io/badge/Docs-VitePress-646cff.svg" alt="Documentation" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
</p>

**`@softtynet/zca-js`** là bộ thư viện SDK kết nối và tương tác Zalo dành cho **Node.js**, **TypeScript** và **Bun**, được phát triển và duy trì bởi **Softtynet Co., Ltd.** dựa trên phân tích giao thức Zalo PC `26.7.10`.

- **Trang tài liệu chính thức (Documentation)**: [**https://softtyos.github.io/zca-js-docs/**](https://softtyos.github.io/zca-js-docs/)

---

## Điểm nổi bật

- **Kiến trúc 12 Domains (`333 API nguyên bản`)**: Tổ chức trực quan qua `api.auth`, `api.chat`, `api.group`, `api.friend`, `api.profile`, `api.sync`, `api.zcloud`, `api.call`, `api.media`, `api.sticker`, `api.board`, `api.business` (vẫn hỗ trợ gọi phẳng `api.<method>` tương thích ngược 100%).
- **Dịch Tin Nhắn Tự Động Bằng Zalo AI & Quản Lý Hội Thoại Nâng Cao (`52 API` trong `api.chat`)**: Hỗ trợ dịch thủ công (`translateMessage`), dịch tự động hàng loạt (`translateMessageAuto`), dịch gợi ý khi đang gõ (`translateMessageSuggest`), chặn chia sẻ tin nhắn (`getBlockSharingConversations` / `updateBlockSharingConversation`), tải tin nhắn quan trọng (`fetchImportantMessages`) và gia hạn đường dẫn tệp hết hạn (`renewMessageLink`).
- **Zalo To-Do, Bảng Tin 1-1, Ghim Nhóm & Bình Chọn (`38 API` trong `api.board`)**: Quản lý trọn vẹn vòng đời giao việc Zalo To-Do (`createTodo`, `updateTodo`, `updateTodoStatus`, `getTodoList`, `verifyTodo`, `dingTodo`), nhắc hẹn hội thoại 1-1 (`createOneOneBoardTopic`, `getListOneOneBoard`), ghim chủ đề nhóm/bạn bè (`pinBoardTopic`, `reorderPinTopics`, `pinFriendMessage`) và bình chọn (`createPoll`, `votePoll`).
- **Kho GIF (Giphy / Guggy / Tenor), Sticker AI & Hiệu Ứng Tin Nhắn (`24 API` trong `api.sticker`)**: Tìm kiếm và lấy GIF thịnh hành Giphy (`getTrendingGifs`, `searchGifs`, `getGifCategories`), ảnh động ngữ cảnh Guggy (`getDefaultGuggyGifs`, `searchGuggyGifs`), ánh xạ Tenor (`getTenorStickerMapping`) và hiệu ứng tin nhắn (`getMessageEffects`).
- **Đồng bộ lịch sử Mobile (`ZDB 4.0`) & Catch-up Sync (`11 API` trong `api.sync`)**: Hỗ trợ đầy đủ luồng `requestSyncFromPhone` $\rightarrow$ `getSyncData` (giải mã RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate), `pullMobile`, `getBackupMsgInfo`, `getCrossDbInfo` & `submitSyncMediaActions`.
- **ZCloud, MediaStore & Bảo toàn Số nguyên 64-bit (`17 API` trong `api.zcloud` + `preParseJsonIds`)**: Tự động giữ nguyên độ chính xác chuỗi 19 chữ số cho `owner_id`, `group_id`, `globalMsgId`, `cliMsgId` trước khi `JSON.parse()` và tích hợp bộ mã hóa `98yS` AES-256-CBC cho ZCloud/ZFamily (`getCloudDownloadUrls`, `resetCloudQueue`, `submitCloudMediaExtInfo`, `migrateCloudRecent`).
- **Zalo Call Engine thuần TypeScript (`30 API` trong `api.call` + `ZaloRtcSession` / `ZaloCallController`)**: Hỗ trợ đầy đủ cả **Gọi Đi** và **Nhận Cuộc Gọi Đến** (Thoại 1-1, Video Call H.264 FU-A Annex-B 2 chiều, Gọi Nhóm), nâng cấp Thoại $\rightarrow$ Video giữa cuộc gọi, bật/tắt Camera/Mic, Tạm giữ (Hold/Unhold), Tái kết nối UDP (`reconnectUdp`), và **Bàn giao kết nối UDP trực tiếp cho Mobile App (`signalingOnly` / `handoffUdpToExternal`)**.
- **Hội thoại & Quản lý Zalo Official Account (OA) 2 chiều & CRM (`36 API` trong `api.business`)**: Tự động bóc tách tin nhắn OA (`pageMsgs`, `chat.list.action`, `footerv2`), giải mã bitmask tích vàng (`isOAVerified`), quản lý nhãn phân loại CRM (`addConversationLabel`, `updateConversationLabelItem`, `deleteConversationLabel`, `reorderConversationLabels`) và lắng nghe thời gian thực qua `oa_message` & `oa_event`.
- **Hệ thống WebSocket Realtime Toàn Diện (`18 Sự kiện` & `4 Phương thức Truy vấn WS`)**: Lắng nghe đẩy thời gian thực cho tin nhắn, cảm xúc, nhóm, cuộc gọi, đồng bộ ZDB, Zalo OA, To-Do (`todo_event`), Bình chọn (`poll_event`), Dịch AI (`translate_event`), Emoji Status (`emoji_status_event`), Trạng thái Online (`online_status_event`) và ZCloud (`zcloud_event`).

---

## Cài đặt

```bash
npm install @softtynet/zca-js
# hoặc dùng Bun
bun add @softtynet/zca-js
```

### Cấu hình `imageMetadataGetter` (Tùy chọn khi gửi ảnh từ file nội bộ)

```ts
import { Zalo } from "@softtynet/zca-js";
import sharp from "sharp";
import fs from "node:fs";

async function imageMetadataGetter(filePath: string) {
    const data = await fs.promises.readFile(filePath);
    const metadata = await sharp(data).metadata();
    return {
        height: metadata.height,
        width: metadata.width,
        size: metadata.size || data.length,
    };
}

const zalo = new Zalo({ imageMetadataGetter });
```

---

## Kiến trúc 12 Phân hệ (Domains — 333 APIs)

| Phân hệ                                    | Namespace      | Số lượng API | Tài liệu chi tiết                              |
| :----------------------------------------- | :------------- | :----------: | :--------------------------------------------- |
| **Xác thực & Phiên**                       | `api.auth`     |      14      | [`docs/api/auth.md`](docs/api/auth.md)         |
| **Tin nhắn, Hội thoại & Dịch AI**          | `api.chat`     |      52      | [`docs/api/chat.md`](docs/api/chat.md)         |
| **Nhóm & Cộng đồng**                       | `api.group`    |      47      | [`docs/api/group.md`](docs/api/group.md)       |
| **Bạn bè & Danh bạ**                       | `api.friend`   |      37      | [`docs/api/friend.md`](docs/api/friend.md)     |
| **Hồ sơ cá nhân & Doanh nghiệp**           | `api.profile`  |      22      | [`docs/api/profile.md`](docs/api/profile.md)   |
| **Đồng bộ Mobile ZDB 4.0 & Cross-DB**      | `api.sync`     |      11      | [`docs/api/sync.md`](docs/api/sync.md)         |
| **Đám mây ZCloud & ZFamily**               | `api.zcloud`   |      17      | [`docs/api/zcloud.md`](docs/api/zcloud.md)     |
| **Gọi thoại, Video & Gọi nhóm**            | `api.call`     |      27      | [`docs/api/call.md`](docs/api/call.md)         |
| **Kho lưu trữ & Voice-to-Text**            | `api.media`    |      8       | [`docs/api/media.md`](docs/api/media.md)       |
| **Nhãn dán, GIF & Hiệu ứng**               | `api.sticker`  |      24      | [`docs/api/sticker.md`](docs/api/sticker.md)   |
| **Bảng tin, To-Do, Bình chọn & Lịch hẹn**  | `api.board`    |      38      | [`docs/api/board.md`](docs/api/board.md)       |
| **Zalo Business, OA, Nhãn CRM & Danh mục** | `api.business` |      36      | [`docs/api/business.md`](docs/api/business.md) |

> Xem tổng quan toàn bộ tài liệu tại [`docs/api/index.md`](docs/api/index.md) hoặc chạy trang tài liệu VitePress cục bộ bằng lệnh `npm run docs:dev`.

---

## Sử dụng cơ bản

### 1. Đăng nhập bằng mã QR

```ts
import { Zalo } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.loginQR();
console.log("Đã đăng nhập:", api.getOwnId());
```

### 2. Lắng nghe sự kiện WebSocket thời gian thực

```ts
import { Zalo, ThreadType } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.loginQR();

api.listener.on("message", (message) => {
    if (typeof message.data.content !== "string") return;

    if (message.type === ThreadType.User) {
        console.log(`[User] ${message.data.dName}: ${message.data.content}`);
    } else if (message.type === ThreadType.Group) {
        console.log(`[Group ${message.threadId}] ${message.data.dName}: ${message.data.content}`);
    }
});

api.listener.start({ retryOnClose: true });
```

### 3. Gọi API theo Domain Namespace

```ts
// Nhóm & Lịch sử tin nhắn Cloud
const groupInfo = await api.group.getGroupInfo("888999000");
const history = await api.group.getGroupChatHistory("888999000", { count: 50, cursor: 0 });
const msgStatus = await api.group.getGroupMessageStatus("888999000", ["1000000000000000001"]);

// Kho lưu trữ Media / File / Link
const mediaPreview = await api.media.getMediaStorePreview("888999000", 50);
const mediaList = await api.media.getConversationMedia({
    groupId: "888999000",
    mediaType: "media",
    limit: 50,
});

// Giải mã thông tin thành viên hàng loạt
const profiles = await api.group.getGroupMembersInfo(["1000000000000000001"]);
```

### 4. Gọi Thoại, Video Call 1-1 & Gọi Nhóm 2 Chiều (`ZaloRtcSession`)

> Xem hướng dẫn đầy đủ tại [`docs/guide/call-engine.md`](docs/guide/call-engine.md).

```ts
import { CallType } from "@softtynet/zca-js";

const session = api.call.createRtcSession({ autoAttachListener: true });

// 1) Gọi đi 1-1 (Audio hoặc Video Call 2 chiều)
const params = await session.startOutgoingCall("5249661060655759359", {
    callType: CallType.Video,
});

// 2) Hoặc tạo / tham gia Cuộc Gọi Nhóm Video 2 chiều qua Zavi SFU
const grpParams = await session.startGroupCall("1493339370763911324", ["5249661060655759359"], {
    callType: CallType.GroupVideo,
});
// Tham gia phòng gọi nhóm đang mở trên Banner nhóm:
// await session.joinActiveGroupCall("1493339370763911324", { callType: CallType.GroupVideo });

// 3) Nhận luồng Audio Opus (16kHz Mono) & Video H.264 Annex-B thời gian thực (tự động tách partnerId từ CSRC[0] trong gọi nhóm)
session.on("audio_frame", (frame) => {
    // frame.payload: Buffer (Opus 16kHz mono), frame.ssrc: number
});
session.on("video_annexb_frame", (frame) => {
    // frame.annexB: Buffer (00 00 00 01 + SPS/PPS/IDR/P-Slice)
    // frame.partnerId?: string (Zalo UID 19 chữ số của người phát), frame.isKeyframe: boolean
});

// 4) Gửi luồng Audio Opus & Video H.264 Annex-B (Constrained Baseline avc1.42001e)
await session.sendAudioFrame(opusFrameBuffer);
await session.sendH264AnnexBFrame(annexBFrameBuffer, { timestamp: rtpTimestamp90kHz });

// 5) Nhận cuộc gọi 1-1 hoặc Gọi Nhóm đến từ sự kiện WebSocket `call_event`
api.listener.on("call_event", async (ev) => {
    if (ev.act === "request") {
        await session.ringIncomingCall(ev); // Báo máy đang đổ chuông (11302)
        await session.acceptIncomingCall(ev, { skipRingRing: true });
    } else if (ev.act === "group_request") {
        await session.ringIncomingCall(ev); // Báo máy đang đổ chuông nhóm (12439)
        await session.acceptIncomingGroupCall(ev, { skipRingRing: true });
    }
});

// 6) Chế độ Worker tạo cuộc gọi và bàn giao gói UDP trực tiếp cho Mobile App:
const handoffParams = await session.startOutgoingCall("5249661060655759359", {
    callType: CallType.Audio,
    signalingOnly: true, // Worker không mở UDP, xuất sẵn gói `params.mobileDirectHandoff` cho Mobile
});
```

### 5. Nhận, Trả lời & Quản lý Zalo Official Account (OA) 2 chiều

```ts
import { ThreadType } from "@softtynet/zca-js";

// 1) Lấy hồ sơ chi tiết của Zalo OA (tích vàng isVerified, hotline, website, giờ mở cửa, DNR)
const oaProfile = await api.business.getOAProfile("2359864726282056346");
console.log(oaProfile.displayName, oaProfile.isVerified, oaProfile.hotline);

// 2) Lắng nghe tin nhắn OA thời gian thực (`oa_chat`, `oa_list`, `info_chat`, `ecard`) và trả lời 2 chiều
api.listener.on("oa_message", async (msg) => {
    console.log(`[OA ${msg.oaData?.kind}] ${msg.data.dName}: ${msg.oaData?.text}`);
    if (!msg.isSelf) {
        await api.chat.sendMessage({ msg: "Cảm ơn OA!" }, msg.threadId, ThreadType.User);
    }
});

// 3) Chặn / Bỏ chặn OA & chuyển đổi OA ID
await api.business.blockOA("2359864726282056346");
await api.business.unblockOA("2359864726282056346");
```

### 6. Dịch Tin Nhắn Zalo AI, Quản lý Công Việc To-Do, Kho GIF & Nhãn CRM

```ts
// 1) Dịch tin nhắn bằng Zalo AI (thủ công, tự động hàng loạt & dịch gợi ý khi đang soạn thảo)
const translateSetting = await api.chat.getTranslateSetting();
const translated = await api.chat.translateMessage({
    msgId: "4829384719283746192",
    threadId: "5249661060655759359",
    srcLang: "en",
    desLang: "vi",
    text: "Hello from Zalo AI Translation!",
});

// 2) Quản lý công việc Zalo To-Do & Nhắc hẹn hội thoại 1-1
const todoSync = await api.board.verifyTodo("", 0);
const todoList = await api.board.getTodoList();
const oneOneBoard = await api.board.getListOneOneBoard({ uid: "5249661060655759359" });

// 3) Kho ảnh động GIF (Giphy / Guggy), Ánh xạ Tenor & Hiệu ứng tin nhắn
const trendingGifs = await api.sticker.getTrendingGifs();
const searchGifs = await api.sticker.searchGifs("xin chào");
const guggyGifs = await api.sticker.searchGuggyGifs("chúc mừng");
const msgEffects = await api.sticker.getMessageEffects([1]);

// 4) Quản lý Nhãn phân loại hội thoại CRM (Thêm, Sửa, Xóa, Sắp xếp vị trí)
const addedLabel = await api.business.addConversationLabel({
    text: "Khách VIP",
    color: 1,
    conversations: ["5249661060655759359"],
});

// 5) Lắng nghe các sự kiện WebSocket Realtime mở rộng & gửi truy vấn đồng bộ
api.listener.on("todo_event", (ev) => console.log("[To-Do Event]", ev));
api.listener.on("poll_event", (ev) => console.log("[Poll Event]", ev));
api.listener.on("translate_event", (ev) => console.log("[AI Translate Event]", ev));
api.listener.on("emoji_status_event", (ev) => console.log("[Emoji Status Event]", ev));
api.listener.on("online_status_event", (ev) => console.log("[Online Status Event]", ev));

// Gửi khung điều khiển WebSocket chủ động khi kết nối:
api.listener.sendPingActive();
api.listener.requestLastDeliverSeen();
api.listener.requestLastSeenSubChatTab();
api.listener.requestLastSeenReaction();
```

---

## Chạy trang Tài liệu (VitePress Docs) & Bộ Công cụ Studio Kiểm thử

```bash
# Khởi chạy máy chủ tài liệu VitePress cục bộ (http://localhost:5173)
npm run docs:dev

# Sinh lại tài liệu từ mã nguồn src/apis/* và đóng gói tĩnh
npm run docs:build

# Chạy bộ kiểm định tự động 11 hạng mục (Typecheck + Mock Suite)
npm run test:verify

# Khởi chạy Call Studio trực quan trên trình duyệt (Gọi 1-1 & Gọi Nhóm 2 chiều tại http://localhost:3388)
npm run test:call-studio

# Khởi chạy OA Studio trực quan trên trình duyệt (Quản lý & Chat OA 2 chiều tại http://localhost:3399)
npm run test:oa-studio
```

---

## Nguồn gốc & Ghi nhận (Credits)

Phiên bản này được phát triển và duy trì bởi **Softtynet Co., Ltd.**, kế thừa nền tảng mã nguồn mở từ dự án gốc:

- **Dự án gốc**: [RFS-ADRENO/zca-js](https://github.com/RFS-ADRENO/zca-js)
- **Tác giả nền tảng ban đầu**: RFS-ADRENO, truong9c2208, JustKemForFun cùng các thành viên đóng góp từ cộng đồng mã nguồn mở.

---

## Giấy phép (License)

Phát hành theo giấy phép [MIT License](LICENSE).
