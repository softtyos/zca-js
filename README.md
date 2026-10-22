# @softtynet/zca-js

<p align="left">
  <a href="https://www.npmjs.com/package/@softtynet/zca-js"><img src="https://img.shields.io/npm/v/@softtynet/zca-js.svg?label=%40softtynet%2Fzca-js&color=0068ff" alt="npm version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" /></a>
</p>

**`@softtynet/zca-js`** là bộ thư viện client hỗ trợ kết nối và tương tác Zalo dành cho Node.js, TypeScript và Bun, được duy trì nội bộ bởi **Softtynet Co., Ltd.**

---

## Cài đặt

```bash
npm install @softtynet/zca-js
# hoặc dùng Bun
bun add @softtynet/zca-js
```

### Cấu hình `imageMetadataGetter` (Tùy chọn khi gửi ảnh từ file nội bộ)

Nếu ứng dụng cần gửi ảnh hoặc GIF từ đường dẫn file trên máy, bạn có thể truyền hàm `imageMetadataGetter` (ví dụ sử dụng `sharp`):

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

## Sử dụng cơ bản

### 1. Đăng nhập bằng mã QR

```ts
import { Zalo } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.loginQR();
console.log("Đã đăng nhập:", api.getOwnId());
```

### 2. Lắng nghe tin nhắn

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

### 3. Gửi tin nhắn văn bản & Sticker

```ts
// Trả lời tin nhắn văn bản
await api.sendMessage(
    {
        msg: "Xin chào!",
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

## Nguồn gốc & Ghi nhận (Credits)

Phiên bản này được phát triển và duy trì bởi **Softtynet Co., Ltd.**, kế thừa nền tảng mã nguồn mở từ dự án gốc:

- **Dự án gốc**: [RFS-ADRENO/zca-js](https://github.com/RFS-ADRENO/zca-js)
- **Tác giả nền tảng ban đầu**: RFS-ADRENO, truong9c2208, JustKemForFun cùng các thành viên đóng góp từ cộng đồng mã nguồn mở.

---

## Giấy phép (License)

Phát hành theo giấy phép [MIT License](LICENSE).
