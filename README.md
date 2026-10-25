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

- **Kiến trúc 12 Domains (`256 API nguyên bản`)**: Tổ chức trực quan qua `api.auth`, `api.chat`, `api.group`, `api.friend`, `api.profile`, `api.sync`, `api.zcloud`, `api.call`, `api.media`, `api.sticker`, `api.board`, `api.business` (vẫn hỗ trợ gọi phẳng `api.<method>` tương thích ngược 100%).
- **Đồng bộ lịch sử Mobile (`ZDB 4.0`) & Catch-up Sync**: Hỗ trợ đầy đủ luồng `requestSyncFromPhone` $\rightarrow$ `getSyncData` (giải mã RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate) & `pullMobile`.
- **ZCloud, MediaStore & Bảo toàn Số nguyên 64-bit (`preParseJsonIds`)**: Tự động giữ nguyên độ chính xác chuỗi 19 chữ số cho `owner_id`, `group_id`, `globalMsgId`, `cliMsgId` trước khi `JSON.parse()` và tích hợp bộ mã hóa `98yS` AES-256-CBC cho ZCloud/ZFamily.
- **Zalo Call Engine thuần TypeScript (`30 API` trong `api.call` + `ZaloRtcSession` / `ZaloCallController`)**: Hỗ trợ đầy đủ cả **Gọi Đi** và **Nhận Cuộc Gọi Đến** (Thoại 1-1, Video Call H.264 FU-A Annex-B 2 chiều, Gọi Nhóm), nâng cấp Thoại $\rightarrow$ Video giữa cuộc gọi, bật/tắt Camera/Mic, Tạm giữ (Hold/Unhold), Tái kết nối UDP (`reconnectUdp`), và **Bàn giao kết nối UDP trực tiếp cho Mobile App (`signalingOnly` / `handoffUdpToExternal`)**.
- **Hội thoại & Quản lý Zalo Official Account (OA) 2 chiều (`api.business.getOAProfile`, `blockOA`, `unblockOA`, `convertOAIds`)**: Tự động bóc tách tin nhắn OA (`pageMsgs`, `chat.list.action`, `footerv2`), giải mã bitmask tích vàng (`isOAVerified`), Zalo Bot (`isZaloBot`), trạng thái DNR (`parseOADnrStatus`) và lắng nghe thời gian thực qua `oa_message` & `oa_event`.

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

## Kiến trúc 12 Phân hệ (Domains)

| Phân hệ | Namespace | Số lượng API | Tài liệu chi tiết |
| :--- | :--- | :---: | :--- |
| **Xác thực & Phiên** | `api.auth` | 14 | [`docs/api/auth.md`](docs/api/auth.md) |
| **Tin nhắn & Hội thoại** | `api.chat` | 41 | [`docs/api/chat.md`](docs/api/chat.md) |
| **Nhóm & Cộng đồng** | `api.group` | 44 | [`docs/api/group.md`](docs/api/group.md) |
| **Bạn bè & Danh bạ** | `api.friend` | 33 | [`docs/api/friend.md`](docs/api/friend.md) |
| **Hồ sơ cá nhân** | `api.profile` | 16 | [`docs/api/profile.md`](docs/api/profile.md) |
| **Đồng bộ Mobile ZDB 4.0** | `api.sync` | 5 | [`docs/api/sync.md`](docs/api/sync.md) |
| **Đám mây ZCloud & ZFamily** | `api.zcloud` | 9 | [`docs/api/zcloud.md`](docs/api/zcloud.md) |
| **Gọi thoại, Video & Gọi nhóm** | `api.call` | 30 | [`docs/api/call.md`](docs/api/call.md) |
| **Kho lưu trữ & Voice-to-Text** | `api.media` | 8 | [`docs/api/media.md`](docs/api/media.md) |
| **Nhãn dán & Biểu cảm** | `api.sticker` | 10 | [`docs/api/sticker.md`](docs/api/sticker.md) |
| **Bảng tin, Bình chọn & Lịch hẹn** | `api.board` | 16 | [`docs/api/board.md`](docs/api/board.md) |
| **Zalo Business, OA & Danh mục** | `api.business` | 30 | [`docs/api/business.md`](docs/api/business.md) |

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

### 4. Gọi Thoại, Video Call 2 chiều & Nhận Cuộc Gọi Đến (`ZaloRtcSession`)

```ts
import { CallType } from "@softtynet/zca-js";

const session = api.call.createRtcSession({ autoAttachListener: true });

// 1) Gọi đi (Audio hoặc Video Call)
const params = await session.startOutgoingCall("5249661060655759359", {
    callType: CallType.Video,
});

// 2) Nhận luồng Audio Opus & Video H.264 Annex-B thời gian thực
session.on("audio_frame", (frame) => {
    // frame.payload: Buffer (Opus 16kHz mono)
});
session.on("video_annexb_frame", (frame) => {
    // frame.annexB: Buffer (00 00 00 01 + SPS/PPS/IDR/P-Slice), frame.isKeyframe: boolean
});

// 3) Nhận cuộc gọi đến từ sự kiện WebSocket `call_event`
api.listener.on("call_event", async (ev) => {
    if (ev.act === "request" || ev.act === "group_request") {
        await session.ringIncomingCall(ev); // Báo máy đang đổ chuông (402 / 502)
        const incomingParams = await session.acceptIncomingCall(ev, { skipRingRing: true });
        console.log("Đã bắt máy cuộc gọi đến:", incomingParams.callId, incomingParams.rtpAddress);
    }
});

// 4) Chế độ Worker tạo cuộc gọi và bàn giao gói UDP trực tiếp cho Mobile App:
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

---

## Chạy trang Tài liệu (VitePress Docs)

```bash
# Khởi chạy máy chủ tài liệu VitePress cục bộ (http://localhost:5173)
npm run docs:dev

# Sinh lại tài liệu từ mã nguồn src/apis/* và đóng gói tĩnh
npm run docs:build
```

---

## Nguồn gốc & Ghi nhận (Credits)

Phiên bản này được phát triển và duy trì bởi **Softtynet Co., Ltd.**, kế thừa nền tảng mã nguồn mở từ dự án gốc:

- **Dự án gốc**: [RFS-ADRENO/zca-js](https://github.com/RFS-ADRENO/zca-js)
- **Tác giả nền tảng ban đầu**: RFS-ADRENO, truong9c2208, JustKemForFun cùng các thành viên đóng góp từ cộng đồng mã nguồn mở.

---

## Giấy phép (License)

Phát hành theo giấy phép [MIT License](LICENSE).
