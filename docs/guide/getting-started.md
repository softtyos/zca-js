# Bắt đầu nhanh (Getting Started)

## 1. Cài đặt

```bash
npm install @softtynet/zca-js
# hoặc dùng Bun
bun add @softtynet/zca-js
```

## 2. Đăng nhập tài khoản Zalo

### Đăng nhập bằng mã QR (`loginQR`)

```ts
import { Zalo } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true, logging: true });
const api = await zalo.loginQR();

console.log("Đăng nhập thành công UID:", api.getOwnId());
```

### Đăng nhập bằng Cookie & IMEI đã lưu (`login`)

```ts
import { Zalo } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.login({
    cookie: savedCookies,
    imei: "your-device-imei",
    userAgent: "Mozilla/5.0 ...",
});
```

## 3. Sử dụng các API theo 12 Domains

```ts
// 1. Phân hệ Group (api.group)
const groupInfo = await api.group.getGroupInfo(groupId);
const chatHistory = await api.group.getGroupChatHistory(groupId, { count: 50, cursor: 0 });
const msgStatus = await api.group.getGroupMessageStatus(groupId, memberUids);

// 2. Phân hệ Media Store (api.media)
const previewMedia = await api.media.getMediaStorePreview(groupId, 50);
const mediaList = await api.media.getConversationMedia({ groupId, mediaType: "media", limit: 50 });

// 3. Phân hệ Chat (api.chat)
await api.chat.sendMessage({ msg: "Xin chào từ @softtynet/zca-js!" }, threadId, ThreadType.Group);

// 4. Phân hệ ZCloud (api.zcloud)
const usage = await api.zcloud.getUsageZCloud();
```

## 4. Cấu hình `imageMetadataGetter` khi gửi ảnh từ đĩa

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
