# Bắt đầu nhanh (Getting Started)

Hướng dẫn cài đặt, xác thực tài khoản, lưu/khôi phục phiên đăng nhập và sử dụng **333 API trên 12 Domains** cùng **18 sự kiện WebSocket Realtime** của `@softtynet/zca-js`.

---

## 1. Cài đặt

> **Yêu cầu môi trường**: **Node.js `>= 20.0.0`** hoặc **Bun `>= 1.1.0`** (TypeScript `>= 5.0` khuyến nghị).

```bash
# Cài đặt từ NPM Registry
npm install @softtynet/zca-js

# Hoặc dùng Bun / pnpm / yarn
bun add @softtynet/zca-js
pnpm add @softtynet/zca-js
```

---

## 2. Đăng nhập & Lưu phiên (`exportSession`)

### 2.1. Đăng nhập lần đầu bằng mã QR (`loginQR`) & Xuất phiên

Sau khi quét mã QR trên điện thoại, hãy gọi `api.auth.exportSession()` để xuất trọn bộ thông tin phiên (`cookie`, `imei`, `userAgent`, `language`, `uid`) lưu xuống đĩa hoặc Database cho những lần chạy tiếp theo:

```ts
import { Zalo } from "@softtynet/zca-js";
import fs from "node:fs/promises";

const zalo = new Zalo({
    selfListen: true, // Nhận cả sự kiện do chính tài khoản mình gửi từ thiết bị khác
    logging: true, // Bật log hệ thống
    requestTimeout: 30000, // Timeout mặc định cho mỗi HTTP request (30s)
});

const api = await zalo.loginQR({
    qrPath: "./qr.png", // Đường dẫn lưu ảnh QR
});

console.log("✅ Đăng nhập thành công UID:", api.getOwnId());

// Lưu phiên đăng nhập để tái sử dụng không cần quét lại QR
const session = api.auth.exportSession();
await fs.writeFile("./zalo-session.json", JSON.stringify(session, null, 2));
```

### 2.2. Khôi phục phiên đăng nhập đã lưu (`login`)

```ts
import { Zalo } from "@softtynet/zca-js";
import fs from "node:fs/promises";

const zalo = new Zalo({ selfListen: true, requestTimeout: 30000 });
const savedSession = JSON.parse(await fs.readFile("./zalo-session.json", "utf-8"));

const api = await zalo.login(savedSession);
console.log("🔄 Đã khôi phục phiên cho UID:", api.getOwnId());
```

---

## 3. Sử dụng các API theo 12 Domains (`333 APIs`)

Mọi phương thức đều có thể gọi theo phân hệ **`api.<domain>.<method>()`** (khuyến nghị để IDE gợi ý code rõ ràng) hoặc gọi phẳng **`api.<method>()`**:

```ts
import { ThreadType, CallType } from "@softtynet/zca-js";

// 1. 🔐 Phân hệ Auth (api.auth — 27 APIs)
const devices = await api.auth.getListDevice();
const safety = await api.auth.scanURL("https://zalo.me");

// 2. 💬 Phân hệ Chat & Dịch AI (api.chat — 67 APIs)
await api.chat.sendMessage({ msg: "Xin chào từ @softtynet/zca-js!" }, threadId, ThreadType.Group);
const translated = await api.chat.translateMessageManual({
    content: "Hello world, how are you today?",
    targetLanguage: "vi",
});
const lastSeen = await api.chat.getLastSeen({ userIds: ["687719761480069038"] });

// 3. 👥 Phân hệ Group & Cộng đồng (api.group — 56 APIs)
const groupInfo = await api.group.getGroupInfo(groupId);
const chatHistory = await api.group.getGroupChatHistory(groupId, { count: 50, cursor: 0 });
const msgStatus = await api.group.getGroupMessageStatus(groupId, memberUids);

// 4. 🤝 Phân hệ Bạn bè & Danh bạ (api.friend — 36 APIs)
const friends = await api.friend.getAllFriends();
const onlines = await api.friend.getFriendOnlines();

// 5. 🪪 Phân hệ Hồ sơ cá nhân & Emoji Status (api.profile — 34 APIs)
const myInfo = await api.profile.getUserInfo(api.getOwnId());
const miniProfile = await api.profile.getMiniProfile(api.getOwnId());

// 6. 🔄 Phân hệ Đồng bộ Mobile ZDB 4.0 (api.sync — 10 APIs)
const preload = await api.sync.preloadConversations();
const crossDb = await api.sync.getCrossDbInfo();

// 7. ☁️ Phân hệ ZCloud & ZFamily (api.zcloud — 16 APIs)
const usage = await api.zcloud.getUsageZCloud();
const cloudInfo = await api.zcloud.getZCloudInfo();

// 8. 📞 Phân hệ Gọi thoại, Video 1-1 & Gọi nhóm (api.call — 30 APIs)
const rtcSession = api.call.createRtcSession({ autoAttachListener: true });
// await rtcSession.startOutgoingCall(targetUid, { callType: CallType.Video });

// 9. 🖼️ Phân hệ Media Store & Voice-to-Text AI (api.media — 5 APIs)
const previewMedia = await api.media.getMediaStorePreview(groupId, 50);
const mediaList = await api.media.getConversationMedia({ groupId, mediaType: "media", limit: 50 });

// 10. ✨ Phân hệ Sticker, GIF Giphy/Guggy & Hiệu ứng (api.sticker — 14 APIs)
const stickers = await api.sticker.getStickers("xin chào");
const trendingGifs = await api.sticker.getTrendingGiphyGifs({ limit: 10 });
const msgEffects = await api.sticker.getMessageEffects();

// 11. 📌 Phân hệ Board, Bình chọn, Lịch hẹn & Zalo To-Do (api.board — 27 APIs)
const boardItems = await api.board.getListBoard({ groupId });
const oneOneReminders = await api.board.getListOneOneBoard(targetUid);
const todoStatus = await api.board.verifyTodo();

// 12. 💼 Phân hệ Zalo Business, OA & Nhãn CRM (api.business — 27 APIs)
const labels = await api.business.getConversationLabels();
const oaProfile = await api.business.getOAProfile("2359864726282056346");
```

---

## 4. Lắng nghe Sự kiện Thời gian thực (WebSocket Listener)

`@softtynet/zca-js` cung cấp **18 sự kiện WebSocket** và **4 phương thức gửi tín hiệu chủ động** qua `api.listener`:

```ts
api.listener.on("connected", () => {
    console.log("🟢 WebSocket Zalo đã kết nối!");
    api.listener.sendPingActive();
    api.listener.requestLastDeliverSeen();
});

api.listener.on("message", (msg) => {
    console.log(`[Tin nhắn mới] từ ${msg.data.uidFrom}:`, msg.data.content);
});

api.listener.on("todo_event", (ev) => {
    console.log(`[Zalo To-Do] subCmd=${ev.subCmd}`, ev.data);
});

api.listener.on("poll_event", (ev) => {
    console.log(`[Bình chọn Nhóm] pollId=${ev.pollId}`, ev.data);
});

api.listener.start({ retryOnClose: true });
```

> 📖 Xem chi tiết toàn bộ 18 sự kiện và cấu trúc dữ liệu tại trang **[Lắng nghe sự kiện WebSocket (Listener)](./listeners.md)**.

---

## 5. Cấu hình `imageMetadataGetter` khi gửi ảnh từ đĩa

Khi sử dụng `api.chat.sendMessage({ attachments: [...] })` với tệp ảnh cục bộ, bạn có thể cung cấp hàm `imageMetadataGetter` (ví dụ dùng `sharp` hoặc `image-size`) để Zalo hiển thị đúng khung tỷ lệ ảnh:

```ts
import { Zalo } from "@softtynet/zca-js";
import sharp from "sharp";
import fs from "node:fs";

const zalo = new Zalo({
    imageMetadataGetter: async (filePath) => {
        const buf = await fs.promises.readFile(filePath);
        const meta = await sharp(buf).metadata();
        return { width: meta.width, height: meta.height, size: meta.size || buf.length };
    },
});
```
