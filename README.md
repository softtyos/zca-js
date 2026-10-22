# @softtynet/zca-js — Softtynet Zalo API SDK for Node.js & Bun

<p align="left">
  <a href="https://www.npmjs.com/package/@softtynet/zca-js"><img src="https://img.shields.io/npm/v/@softtynet/zca-js.svg?label=%40softtynet%2Fzca-js&color=0068ff" alt="npm version" /></a>
  <a href="https://github.com/softtyos/zca-js"><img src="https://img.shields.io/badge/Maintained%20by-Softtynet%20Co.%2C%20Ltd.-0a7cff" alt="Maintained by Softtynet" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
</p>

**`@softtynet/zca-js`** là bộ thư viện Zalo API nâng cao dành cho Node.js / TypeScript / Bun, được phát triển, tối ưu hoá và duy trì bởi **Softtynet Co., Ltd.** nhằm đáp ứng các bài toán tích hợp chuyên sâu: **Đồng bộ dữ liệu đa thiết bị (Offline Catch-up & Mobile Backup Sync `ZDB4.0`)**, **Tín hiệu Gọi Thoại & Gọi Video (Voice / Video Call Signaling)**, và **Xử lý WebSocket thời gian thực độ tin cậy cao**.

> [!WARNING]
> Đây là thư viện tương tác không chính thức thông qua giao thức Zalo Web / Zalo PC dành cho tài khoản cá nhân. Vui lòng sử dụng có trách nhiệm và tuân thủ quy định an toàn tài khoản.

---

## Mục lục

- [Điểm nổi bật trên phiên bản Softtynet (`@softtynet/zca-js`)](#-điểm-nổi-bật-trên-phiên-bản-softtynet-softtynetzca-js)
- [Cài đặt](#-cài-đặt)
- [Tài liệu chuyên sâu](#-tài-liệu-chuyên-sâu)
- [Hướng dẫn sử dụng nhanh](#-hướng-dẫn-sử-dụng-nhanh)
  - [1. Đăng nhập & Lưu phiên](#1-đăng-nhập--lưu-phiên)
  - [2. Lắng nghe tin nhắn thời gian thực](#2-lắng-nghe-tin-nhắn-thời-gian-thực)
  - [3. Đồng bộ bù tin nhắn khi Offline (Catch-up Sync)](#3-đồng-bộ-bù-tin-nhắn-khi-offline-catch-up-sync)
  - [4. Đồng bộ lịch sử sao lưu từ Điện thoại (`ZDB4.0`)](#4-đồng-bộ-lịch-sử-sao-lưu-từ-điện-thoại-zdb40)
  - [5. Khởi tạo Cuộc gọi Thoại & Gọi Video](#5-khởi-tạo-cuộc-gọi-thoại--gọi-video)
  - [6. Gửi tin nhắn & Sticker](#6-gửi-tin-nhắn--sticker)
- [Kiểm định & Chạy thử nghiệm](#-kiểm-định--chạy-thử-nghiệm)
- [Nguồn gốc & Ghi nhận (Credits & Attribution)](#-nguồn-gốc--ghi-nhận-credits--attribution)
- [Giấy phép (License)](#-giấy-phép-license)

---

## 🚀 Điểm nổi bật trên phiên bản Softtynet (`@softtynet/zca-js`)

So với phiên bản cộng đồng tiêu chuẩn, **`@softtynet/zca-js`** bổ sung các phân hệ cốt lõi đã được kiểm định trực tiếp trên máy chủ Zalo thật:

| Phân hệ | Tính năng trên `@softtynet/zca-js` |
| :--- | :--- |
| **Đồng bộ bù khi Offline (Catch-up Sync)** | Hỗ trợ [`api.preloadConversations()`](src/apis/preloadConversations.ts) (`cmd 10053`), kéo hàng đợi tin nhắn cá nhân & nhóm qua [`api.listener.requestOldMessages()`](src/apis/listen.ts) (`cmd 510` / `511`, cả `subCmd 0` & `1`), kèm cờ phân trang `hasMore`, tách biệt sự kiện thu hồi `undo` và đồng bộ trạng thái đã đọc `unread_cleared` (`cmd 504` / `524`). |
| **Đồng bộ sao lưu từ Điện thoại (`ZDB4.0`)** | Hỗ trợ trọn vẹn chu trình [`api.requestSyncFromPhone()`](src/apis/requestSyncFromPhone.ts) (`cmd 12000`), [`api.cancelPullMobile()`](src/apis/cancelPullMobile.ts) (`cmd 12700`), sự kiện `sync_event` (`user_confirm`, `syncmsg_info`, `transfer_after_login`), tải gói `.db.crypt` qua [`api.getSyncData()`](src/apis/getSyncData.ts) và giải mã RSA-2048 PKCS#1 v1.5 + AES-256-CBC đa khối 64KB + đọc mục lục SQLite (`parseZdbHeader`). |
| **Ánh xạ ID ẩn danh (Noised / Global ID)** | Hỗ trợ [`api.getNoisedIds()`](src/apis/getNoisedIds.ts) (`cmd 12390` kèm cơ chế tự động fallback sang `zwid.api.zalo.me`) và [`api.decryptGids()`](src/apis/decryptGids.ts) (`cmd 12054`) để ánh xạ tên file SQLite `3_<me>_<peer>.db` về User ID / Group ID thật. |
| **Gọi Thoại & Gọi Video (Signaling 2 bước)** | Hỗ trợ [`api.sendVoiceCall()`](src/apis/sendVoiceCall.ts) (`cmd 11300` + `11301`), [`api.cancelVoiceCall()`](src/apis/cancelVoiceCall.ts) (`cmd 11305`), [`api.endVoiceCall()`](src/apis/endVoiceCall.ts) (`cmd 11306`) và sự kiện `call_event` chuẩn giao thức C++ `ZaloCall` cho cả **Gọi Thoại (`CallType.Audio = 1`)** lẫn **Gọi Video (`CallType.Video = 3`, H.264)**. |
| **Độ ổn định & Bảo vệ bộ nhớ** | Tự động giải phóng bộ nhớ `uploadCallbacks` sau 5 phút trong [`uploadAttachment`](src/apis/uploadAttachment.ts), xử lý phản hồi rỗng hợp lệ (`error_code === 0, data === ""`) và bảo toàn độ chính xác chuỗi UID 19 chữ số. |

---

## 📦 Cài đặt

```bash
npm install @softtynet/zca-js
# hoặc dùng Bun
bun add @softtynet/zca-js
```

### Cấu hình `imageMetadataGetter` (Khi gửi ảnh từ đường dẫn file)

Từ kiến trúc V2, thư viện tách rời phụ thuộc xử lý ảnh để giữ dung lượng gọn nhẹ. Nếu ứng dụng của bạn gửi ảnh/GIF từ file nội bộ, hãy truyền hàm `imageMetadataGetter` (ví dụ dùng `sharp`):

```bash
npm install sharp
```

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

## 📚 Tài liệu chuyên sâu

- **[Hướng dẫn Tích hợp: Đồng bộ Tin nhắn Đa Thiết bị (`ZDB4.0`) & Gọi Thoại / Video](docs/INTEGRATION_GUIDE_SYNC_AND_CALL.md)** — Tài liệu đầy đủ kèm sơ đồ kiến trúc và code mẫu tích hợp thực tế của Softtynet.
- **[Kế hoạch & Hướng dẫn Dịch ngược Zalo bằng REA (`morluto/rea`)](docs/REA_REVERSE_ENGINEERING_PLAN.md)** — Tài liệu quy trình phân tích tĩnh Binary C++ (`ZaloCall`, `libzdatabase.dylib`) và ASAR.
- **[API Reference Cơ bản](https://zca-js.tdung.com)** — Tra cứu danh mục các API cơ bản.

---

## ⚡ Hướng dẫn sử dụng nhanh

### 1. Đăng nhập & Lưu phiên

```ts
import { Zalo } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.loginQR();
console.log("Đã đăng nhập với UID:", api.getOwnId());
```

### 2. Lắng nghe tin nhắn thời gian thực

```ts
import { Zalo, ThreadType } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.loginQR();

api.listener.on("message", (message) => {
    const isPlainText = typeof message.data.content === "string";
    if (!isPlainText) return;

    if (message.type === ThreadType.User) {
        console.log(`[Cá nhân] ${message.data.dName}: ${message.data.content}`);
    } else if (message.type === ThreadType.Group) {
        console.log(`[Nhóm ${message.threadId}] ${message.data.dName}: ${message.data.content}`);
    }
});

api.listener.start({ retryOnClose: true });
```

> [!IMPORTANT]
> Mỗi tài khoản Zalo chỉ duy trì một kết nối WebSocket Web tại một thời điểm. Nếu bạn mở thêm tab Zalo Web trên trình duyệt, kết nối WebSocket cũ sẽ nhận sự kiện `duplicate_connection`.

### 3. Đồng bộ bù tin nhắn khi Offline (Catch-up Sync)

```ts
import { ThreadType } from "@softtynet/zca-js";

// 1. Lấy nhanh các tin nhắn mới nhất & danh sách đã đọc qua HTTP (cmd 10053)
const preload = await api.preloadConversations();
console.log(`Preloaded: ${preload.messages.length} tin nhắn, ${preload.unreadCleared.length} trạng thái đã đọc`);

// 2. Nhận tin nhắn từ hàng đợi WebSocket (cmd 510 & 511)
api.listener.on("old_messages", (messages, type, hasMore) => {
    console.log(`Nhận ${messages.length} tin nhắn cũ (type=${type}, hasMore=${hasMore})`);
    if (hasMore && messages.length > 0) {
        const lastMsgId = messages[messages.length - 1].data.msgId;
        api.listener.requestOldMessages(type, lastMsgId);
    }
});

// 3. Kích hoạt kéo hàng đợi ngay khi nhận khoá giải mã WebSocket
api.listener.on("cipher_key", () => {
    api.listener.requestOldMessages(ThreadType.User);
    api.listener.requestOldMessages(ThreadType.Group);
});

api.listener.start({ retryOnClose: true });
```

### 4. Đồng bộ lịch sử sao lưu từ Điện thoại (`ZDB4.0`)

```ts
import fs from "node:fs";
import {
    SyncEventType,
    decryptWithPrivateKey,
    deriveZdbAesKey,
    decryptZdbBuffer,
    parseZdbHeader,
} from "@softtynet/zca-js";

let privateKey = "";

api.listener.on("sync_event", async (event) => {
    if (event.type === SyncEventType.USER_CONFIRM) {
        console.log("Người dùng đã bấm xác nhận trên điện thoại, đang chờ tải gói sao lưu...");
    } else if (event.type === SyncEventType.SYNCMSG_INFO) {
        const res = await api.getSyncData({ ...event.data, savePath: "./sync_data" });
        if (res.success && res.data && privateKey) {
            const rawRsa = decryptWithPrivateKey(privateKey, res.data.encrypted_key);
            const aesKey = deriveZdbAesKey(rawRsa);
            const zdbPlain = decryptZdbBuffer(fs.readFileSync(res.data.file_path), aesKey);
            const toc = parseZdbHeader(zdbPlain);
            console.log(`Giải mã thành công ZDB4.0 (${toc.entries.length} hội thoại SQLite):`, toc.entries.slice(0, 5));
        }
    }
});

api.listener.on("cipher_key", async () => {
    const session = await api.requestSyncFromPhone({ pcName: "Web" });
    privateKey = session.privateKey;
    console.log("Vui lòng mở điện thoại và bấm 'Đồng bộ ngay' trên thông báo Zalo!");
});
```

### 5. Khởi tạo Cuộc gọi Thoại & Gọi Video

```ts
import { CallType } from "@softtynet/zca-js";

const targetUid = "5249661060655759359"; // Chuỗi UID 19 chữ số

// Gọi Video (CallType.Video = 3, tự động đính kèm H.264 payload 97)
const videoCall = await api.sendVoiceCall(targetUid, {
    callType: CallType.Video,
});
console.log("Đang đổ chuông Video:", videoCall.callId, videoCall.rtpServer);

// Huỷ cuộc gọi khi đang đổ chuông
await api.cancelVoiceCall(targetUid, videoCall.callId, {
    callType: CallType.Video,
});

// Hoặc gọi Thoại (CallType.Audio = 1)
const audioCall = await api.sendVoiceCall(targetUid, {
    callType: CallType.Audio,
});
await api.cancelVoiceCall(targetUid, audioCall.callId);
```

### 6. Gửi tin nhắn & Sticker

```ts
// Trả lời tin nhắn văn bản
await api.sendMessage(
    {
        msg: "Xin chào từ hệ thống Softtynet!",
        quote: message.data,
    },
    message.threadId,
    message.type,
);

// Tìm và gửi Sticker
const stickerIds = await api.getStickers("xin chào");
if (stickerIds.length > 0) {
    const stickerObject = await api.getStickersDetail(stickerIds[0]);
    await api.sendMessageSticker(stickerObject, message.threadId, message.type);
}
```

---

## 🧪 Kiểm định & Chạy thử nghiệm

Dự án đi kèm bộ kiểm định 2 lớp trong thư mục [`test/`](test):

1. **Kiểm định tự động (Offline / Unit Verification Suite)**:
   ```bash
   npm run test:verify
   ```
   Kiểm tra tự động toàn bộ 6 hạng mục: `preloadConversations`, `requestSyncFromPhone` / `pullMobile` / `cancelPullMobile`, `getNoisedIds` / `decryptGids`, giải mã `RSA-2048` + `ZDB4.0` đa khối 64KB, `sendVoiceCall` (Audio & Video) / `cancelVoiceCall` / `endVoiceCall`, và các sự kiện WebSocket (`510`, `511`, `504`, `601`).

2. **Kiểm định trực tiếp trên tài khoản Zalo thật (Live Verification Suite)**:
   ```bash
   # Chạy toàn bộ 6 bước (Quét QR -> Preload -> ZNoise -> OldMessages -> Đồng bộ ZDB4.0 từ ĐT -> Voice/Video Call)
   npm run test:live

   # Chỉ test nhanh Gọi Thoại + Gọi Video tới 1 UID bạn bè
   npm run test:live -- --only-call --call <UID_BAN_BE>
   ```

---

## 🤝 Nguồn gốc & Ghi nhận (Credits & Attribution)

Dự án **`@softtynet/zca-js`** được phát triển, nâng cấp và duy trì bởi **Softtynet Co., Ltd.** ([`softtyos/zca-js`](https://github.com/softtyos/zca-js)), kế thừa nền tảng mã nguồn mở từ dự án gốc:

- **Dự án gốc**: [RFS-ADRENO/zca-js](https://github.com/RFS-ADRENO/zca-js)
- **Tác giả nền tảng gốc**: RFS-ADRENO, truong9c2208, JustKemForFun cùng các thành viên đóng góp từ cộng đồng mã nguồn mở.

Chúng tôi trân trọng cảm ơn các tác giả của dự án gốc đã xây dựng nền tảng ban đầu cho cộng đồng JavaScript/TypeScript.

---

## 📄 Giấy phép (License)

Phát hành theo giấy phép [MIT License](LICENSE).
