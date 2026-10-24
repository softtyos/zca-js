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

- **Kiến trúc 12 Domains (`250 API nguyên bản`)**: Tổ chức trực quan qua `api.auth`, `api.chat`, `api.group`, `api.friend`, `api.profile`, `api.sync`, `api.zcloud`, `api.call`, `api.media`, `api.sticker`, `api.board`, `api.business` (vẫn hỗ trợ gọi phẳng `api.<method>` tương thích ngược 100%).
- **Đồng bộ lịch sử Mobile (`ZDB 4.0`) & Catch-up Sync**: Hỗ trợ đầy đủ luồng `requestSyncFromPhone` $\rightarrow$ `getSyncData` (giải mã RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate) & `pullMobile`.
- **ZCloud, MediaStore & Bảo toàn Số nguyên 64-bit (`preParseJsonIds`)**: Tự động giữ nguyên độ chính xác chuỗi 19 chữ số cho `owner_id`, `group_id`, `globalMsgId`, `cliMsgId` trước khi `JSON.parse()` và tích hợp bộ mã hóa `98yS` AES-256-CBC cho ZCloud/ZFamily.
- **Tín hiệu Gọi Thoại, Video Call 1-1 & Gọi Nhóm (`28 API`)**: Điều khiển trọn vẹn vòng đời cuộc gọi 1-1 (`11300` $\rightarrow$ `11311`, `12006`, `12056`, `12064`) và cuộc gọi nhóm (`12433` $\rightarrow$ `12447`, `12043`, `12044`, `12097`, `12098`) cùng lắng nghe `call_event` thời gian thực.

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
| **Gọi thoại, Video & Gọi nhóm** | `api.call` | 28 | [`docs/api/call.md`](docs/api/call.md) |
| **Kho lưu trữ & Voice-to-Text** | `api.media` | 8 | [`docs/api/media.md`](docs/api/media.md) |
| **Nhãn dán & Biểu cảm** | `api.sticker` | 10 | [`docs/api/sticker.md`](docs/api/sticker.md) |
| **Bảng tin, Bình chọn & Lịch hẹn** | `api.board` | 16 | [`docs/api/board.md`](docs/api/board.md) |
| **Zalo Business & Danh mục** | `api.business` | 26 | [`docs/api/business.md`](docs/api/business.md) |

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
