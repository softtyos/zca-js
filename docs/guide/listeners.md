---
title: "Lắng nghe Sự kiện WebSocket & Truy vấn Thời Gian Thực (api.listener)"
description: "Tài liệu hướng dẫn chi tiết toàn bộ 18 sự kiện WebSocket thời gian thực và 4 phương thức truy vấn khung nhị phân của api.listener trong @softtynet/zca-js."
---

# 🔌 Lắng nghe Sự kiện WebSocket & Truy vấn Thời Gian Thực (`api.listener`)

Hệ thống [`api.listener`](file:///Users/bonglv/repos/zca-js/src/apis/listen.ts) duy trì kết nối WebSocket nhị phân thời gian thực với máy chủ Zalo (kèm cơ chế giải mã `AES-GCM 128-bit` + giải nén `Pako` + bảo toàn số nguyên 64-bit `storeAsString`, tự động Ping/Pong, Watchdog `50s` và xoay vòng máy chủ dự phòng).

---

## 1. Bảng Tổng Hợp 18 Sự Kiện WebSocket (`ListenerEvents`)

| Sự kiện                           |         Mã lệnh WS (`cmd` / `subCmd`)         | Mô tả dữ liệu trả về                                                                                                                               |
| :-------------------------------- | :-------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`connected`**                   |                       —                       | Phát ra khi kết nối WebSocket thành công tới máy chủ Zalo.                                                                                         |
| **`closed`** / **`disconnected`** |                       —                       | Phát ra khi kết nối WebSocket đóng (`code`, `reason`).                                                                                             |
| **`error`**                       |                       —                       | Phát ra khi xảy ra lỗi kết nối hoặc giải mã khung tin.                                                                                             |
| **`message`**                     |        `501` (`1-1`), `521` (`Group`)         | Tin nhắn mới đến hoặc tự gửi (Văn bản, Ảnh, Video, Voice, File, Sticker, Card...).                                                                 |
| **`oa_message`**                  | `533` $\rightarrow$ `570` $\rightarrow$ `534` | Tin nhắn 2 chiều từ Zalo Official Account (`oa_chat`, `oa_list`, `info_chat`, `ecard`, `footerv2`).                                                |
| **`reaction`**                    |          `612` (`subCmd=1/2`), `523`          | Biểu cảm (Tim, Like, Haha, Wow, Buồn, Giận) thả vào tin nhắn cá nhân hoặc nhóm.                                                                    |
| **`undo`**                        |          `501` / `521` (`chat.undo`)          | Sự kiện thu hồi tin nhắn từ người gửi trong hội thoại cá nhân hoặc nhóm.                                                                           |
| **`typing`**                      |      `602` (`act="typing"`, `"gtyping"`)      | Tín hiệu người dùng đang soạn tin nhắn trong chat 1-1 hoặc nhóm.                                                                                   |
| **`delivered_messages`**          |    `510` (`subCmd=0`), `511` (`subCmd=0`)     | Danh sách tin nhắn đã được chuyển tới thiết bị người nhận (`DeliveredMessage[]`).                                                                  |
| **`seen_messages`**               |     `502`, `522` (`1,2`), `510/511` (`1`)     | Danh sách tin nhắn đã được người nhận đọc (`SeenMessage[]`).                                                                                       |
| **`unread_cleared`**              |              `504` (`subCmd=1`)               | Sự kiện xóa số đếm tin nhắn chưa đọc khi đọc trên thiết bị khác.                                                                                   |
| **`friend_event`**                |             `601` (`act` bạn bè)              | Sự kiện kết bạn, chấp nhận/từ chối kết bạn, chặn/bỏ chặn, đặt biệt danh, ghim bạn bè.                                                              |
| **`group_event`**                 |              `601` (`act` nhóm)               | Sự kiện tạo nhóm, thêm/xóa thành viên, đổi tên/ảnh nhóm, bổ nhiệm phó nhóm, ghim bài...                                                            |
| **`call_event`**                  |          `601` (`voicecall`), `604`           | Sự kiện cuộc gọi 1-1 và Gọi Nhóm (`request`, `ringring`, `answer`, `cancel`, `endcall`, `group_request`...).                                       |
| **`sync_event`**                  |            `601` (`SyncEventType`)            | Sự kiện đồng bộ lịch sử tin nhắn từ điện thoại sang PC (`ZDB 4.0`).                                                                                |
| **`voice2text_event`**            |             `601` (`voice2text`)              | Kết quả chuyển đổi tin nhắn thoại sang văn bản bằng AI (`req_id`, `text`).                                                                         |
| **`oa_event`**                    |          `601` (`block` / `unblock`)          | Sự kiện chặn hoặc bỏ chặn Zalo Official Account (OA).                                                                                              |
| **`todo_event`**                  |          `602` (`subCmd=1`, `todo`)           | Sự kiện tạo mới, cập nhật, hoàn thành, nhắc việc (`ding`) hoặc xóa công việc Zalo To-Do.                                                           |
| **`poll_event`**                  |                `601` (`poll`)                 | Sự kiện tạo cuộc bình chọn, bỏ phiếu (`vote`), thêm phương án hoặc khóa bình chọn nhóm.                                                            |
| **`translate_event`**             |         `601` / `630` (`translate_*`)         | Kết quả dịch tự động tin nhắn đến (`translate_incoming_resp`), dịch gợi ý (`suggest_translate_resp`) hoặc đổi cấu hình dịch AI (`update_setting`). |
| **`emoji_status_event`**          |              `612` (`subCmd=3`)               | Sự kiện bạn bè hoặc tài khoản hiện tại cập nhật Trạng thái Cảm xúc (`Emoji Status`).                                                               |
| **`online_status_event`**         |              `603` (`subCmd=0`)               | Sự kiện thay đổi trạng thái trực tuyến (`Online` / `Offline`) của danh sách bạn bè.                                                                |
| **`control_sync_event`**          |          `610`, `611` (`subCmd=0/1`)          | Sự kiện đồng bộ hàng đợi điều khiển đa thiết bị (Nhãn hội thoại, Trả lời tự động, Danh mục, Tin nhắn nhanh...).                                    |
| **`zcloud_event`**                |                     `621`                     | Sự kiện thông báo đẩy từ đám mây lưu trữ ZCloud / My Cloud.                                                                                        |
| **`cipher_key`**                  |               `1` (`subCmd=1`)                | Khóa phiên giải mã AES-GCM 128-bit nhận từ máy chủ khi bắt tay WebSocket.                                                                          |

---

## 2. Ví dụ Lắng nghe Toàn Diện Các Sự Kiện Thời Gian Thực

```ts
import { Zalo, ThreadType } from "@softtynet/zca-js";

const zalo = new Zalo({ selfListen: true });
const api = await zalo.login(savedSession);

// 1. Tin nhắn 1-1, Nhóm & Zalo Official Account (OA)
api.listener.on("message", (msg) => {
    console.log(`[${msg.type === ThreadType.Group ? "Group" : "User"} ${msg.threadId}]`, msg.data.content);
});

api.listener.on("oa_message", (oaMsg) => {
    console.log(`[OA ${oaMsg.oaData?.kind}] ${oaMsg.data.dName}: ${oaMsg.oaData?.text}`);
});

// 2. Cảm xúc (Reaction), Thu hồi (Undo), Đã nhận / Đã xem
api.listener.on("reaction", (reaction) => {
    console.log("[Reaction]", reaction.threadId, reaction.data.uidFrom, reaction.data.content);
});

api.listener.on("undo", (undoEvent) => {
    console.log("[Undo]", undoEvent.threadId, undoEvent.data);
});

api.listener.on("seen_messages", (seen) => {
    console.log("[Seen Messages]", seen);
});

// 3. Sự kiện Nhóm, Bạn bè, Cuộc gọi & Đồng bộ ZDB 4.0
api.listener.on("group_event", (event) => {
    console.log("[Group Event]", event.type, event.groupId, event.data);
});

api.listener.on("friend_event", (event) => {
    console.log("[Friend Event]", event.type, event.data);
});

api.listener.on("call_event", (callEvent) => {
    console.log("[Call Event]", callEvent.act, callEvent.callId, callEvent.fromUid);
});

api.listener.on("sync_event", (syncEvent) => {
    console.log("[Sync Event]", syncEvent.phase, syncEvent.decryptedPayload);
});

// 4. Sự kiện Zalo To-Do, Bình chọn (Poll), Dịch AI & Emoji Status
api.listener.on("todo_event", (todoEv) => {
    console.log(`[To-Do Event] act=${todoEv.act}`, todoEv.data);
});

api.listener.on("poll_event", (pollEv) => {
    console.log(`[Poll Event] act=${pollEv.act}, groupId=${pollEv.groupId}`, pollEv.data);
});

api.listener.on("translate_event", (transEv) => {
    console.log(`[AI Translate Event] act=${transEv.act}`, transEv.data);
});

api.listener.on("emoji_status_event", (emojiEv) => {
    console.log("[Emoji Status Event]", emojiEv.data);
});

api.listener.on("online_status_event", (onlineEv) => {
    console.log("[Online Status Event]", onlineEv.data);
});

api.listener.on("control_sync_event", (ctrlEv) => {
    console.log(
        `[Control Sync] cmd=${ctrlEv.cmd}, subCmd=${ctrlEv.subCmd}, actionKey=${ctrlEv.actionKey}`,
        ctrlEv.data,
    );
});

api.listener.on("zcloud_event", (zcloudEv) => {
    console.log("[ZCloud Event]", zcloudEv.data);
});

// 5. Khởi chạy kết nối WebSocket (tự động kết nối lại khi ngắt mạng)
api.listener.start({ retryOnClose: true });
```

---

## 3. Các Phương Thức Gửi Khung Điều Khiển WebSocket Chủ Động

Bên cạnh việc lắng nghe sự kiện đẩy về, `api.listener` cung cấp 4 phương thức gửi khung nhị phân chủ động lên máy chủ WebSocket Zalo (chuẩn giao thức Zalo PC `26.7.10`):

```ts
api.listener.on("connected", () => {
    // 1. Gửi tín hiệu báo thiết bị đang ở trạng thái hoạt động (version=1, cmd=4, subCmd=1)
    api.listener.sendPingActive();

    // 2. Yêu cầu đồng bộ trạng thái Đã nhận / Đã xem mới nhất của các hội thoại (version=1, cmd=522, subCmd=1)
    api.listener.requestLastDeliverSeen();

    // 3. Yêu cầu đồng bộ trạng thái đã xem của các Tab phụ danh sách chat (version=1, cmd=522, subCmd=3)
    api.listener.requestLastSeenSubChatTab();

    // 4. Yêu cầu đồng bộ trạng thái đã xem biểu cảm (Reaction) mới nhất (version=1, cmd=523, subCmd=1)
    api.listener.requestLastSeenReaction();
});
```
