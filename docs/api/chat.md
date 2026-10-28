---
title: "Tin nhắn, Hội thoại & Dịch AI (Chat) (api.chat) - 52 APIs"
description: "Gửi/nhận tin nhắn văn bản, ảnh, video, voice, card, thu hồi tin nhắn, Dịch đa ngôn ngữ bằng Zalo AI, đánh dấu tin nhắn quan trọng, chặn chia sẻ và trạng thái Đã nhận/Đã xem. Tra cứu chi tiết 52 phương thức thuộc phân hệ api.chat trong bộ SDK @softtynet/zca-js."
---

# 💬 Tin nhắn, Hội thoại & Dịch AI (Chat)

> Namespace: `api.chat` (hoặc gọi trực tiếp `api.<methodName>`) — **52 API nguyên bản**

Gửi/nhận tin nhắn văn bản, ảnh, video, voice, card, thu hồi tin nhắn, Dịch đa ngôn ngữ bằng Zalo AI, đánh dấu tin nhắn quan trọng, chặn chia sẻ và trạng thái Đã nhận/Đã xem.

## Danh sách nhanh

| Phương thức                                                         |  HTTP  | Endpoint Zalo                                                         | Mô tả                                                                                                                                                                            |
| :------------------------------------------------------------------ | :----: | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`addReaction`](#addreaction)                                       | `POST` | `/api/message/reaction`<br/>`/api/group/reaction`                     | Thả biểu cảm (Reaction: Tim, Like, Haha, Wow, Buồn, Giận) vào một tin nhắn cá nhân hoặc nhóm.                                                                                    |
| [`addUnreadMark`](#addunreadmark)                                   | `POST` | `/api/conv/addUnreadMark`                                             | Đánh dấu hội thoại là chưa đọc (Unread).                                                                                                                                         |
| [`deleteChat`](#deletechat)                                         | `POST` | `/api/message/deleteconver`<br/>`/api/group/deleteconver`             | Xóa lịch sử cuộc trò chuyện cá nhân hoặc nhóm ở phía tài khoản hiện tại.                                                                                                         |
| [`deleteMessage`](#deletemessage)                                   | `POST` | `/api/message/delete`<br/>`/api/group/deletemsg`                      | Xóa một tin nhắn cụ thể (chỉ xóa ở phía tôi hoặc thu hồi).                                                                                                                       |
| [`fetchImportantMessages`](#fetchimportantmessages)                 | `GET`  | `/api/message/fetchImportant`                                         | Lấy danh sách các tin nhắn được đánh dấu quan trọng / đánh dấu sao (command 12114)                                                                                               |
| [`forwardMessage`](#forwardmessage)                                 | `POST` | `/api/message/mforward`<br/>`/api/group/mforward`                     | Chuyển tiếp (Forward) tin nhắn văn bản hoặc đính kèm tới nhiều hội thoại cùng lúc.                                                                                               |
| [`getArchivedChatList`](#getarchivedchatlist)                       | `GET`  | `/api/archivedchat/list`                                              | Lấy danh sách các hội thoại đã được lưu trữ (Archived Chats).                                                                                                                    |
| [`getAutoDeleteChat`](#getautodeletechat)                           | `GET`  | `/api/conv/autodelete/getConvers`                                     | Lấy danh sách các hội thoại đang bật chế độ tin nhắn tự xóa.                                                                                                                     |
| [`getBlockSharingConversations`](#getblocksharingconversations)     | `GET`  | `/api/conv/blocksharing/getConvers`                                   | Lấy danh sách hội thoại đang bật chế độ chặn chia sẻ / chuyển tiếp tin nhắn (command 12178)                                                                                      |
| [`getConvOfflineMessages`](#getconvofflinemessages)                 | `GET`  | `/api/conv/cm/grOfl`                                                  | Lấy danh sách hội thoại nhóm có tin nhắn ngoại tuyến mới (command 12300)                                                                                                         |
| [`getDirectMessageStatus`](#getdirectmessagestatus)                 | `POST` | `/api/message/getStatusMsg`                                           | Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn trong các hội thoại cá nhân 1-1 (command 12016)                                                              |
| [`getHiddenConversations`](#gethiddenconversations)                 | `GET`  | `/api/hiddenconvers/get-all`                                          | Lấy danh sách các cuộc trò chuyện đang được ẩn bằng mã PIN.                                                                                                                      |
| [`getLastSeen`](#getlastseen)                                       | `GET`  | `/api/preloadconvers/get-last-seen`                                   | Lấy thông tin trạng thái đã xem cuối cùng của danh sách nhóm và cá nhân (command 12009)                                                                                          |
| [`getLastSeenReaction`](#getlastseenreaction)                       | `GET`  | `/api/react/gLastSn`                                                  | Lấy trạng thái đã xem cảm xúc (Reaction) cuối cùng của danh sách nhóm và cá nhân (command 12450)                                                                                 |
| [`getMute`](#getmute)                                               | `GET`  | `/api/social/profile/getmute`                                         | Lấy danh sách các cuộc trò chuyện đang tắt thông báo (Mute).                                                                                                                     |
| [`getPinConversations`](#getpinconversations)                       | `GET`  | `/api/pinconvers/list`                                                | Lấy danh sách các cuộc trò chuyện đang được ghim trên đầu danh sách chat.                                                                                                        |
| [`getRecentSearchList`](#getrecentsearchlist)                       | `GET`  | `/api/recentsearch/list`                                              | Lấy danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12125)                                                                                                                 |
| [`getSuggestedConversations`](#getsuggestedconversations)           | `GET`  | `/api/suggestconvers/list`                                            | Lấy danh sách các cuộc hội thoại được gợi ý (command 11233)                                                                                                                      |
| [`getTranslateSetting`](#gettranslatesetting)                       | `GET`  | `/api/aifeatures/translate/v1/setting`                                | Lấy cấu hình tính năng dịch tin nhắn tự động bằng Zalo AI (command 13395)                                                                                                        |
| [`getUnreadMark`](#getunreadmark)                                   | `GET`  | `/api/conv/getUnreadMark`                                             | Lấy danh sách các cuộc trò chuyện đang được đánh dấu là chưa đọc.                                                                                                                |
| [`markSubTabSeen`](#marksubtabseen)                                 | `POST` | `/api/subtab/seen`                                                    | Đánh dấu đã xem các tab phụ của danh sách hội thoại (command 16214)                                                                                                              |
| [`parseLink`](#parselink)                                           | `GET`  | `/api/message/parselink`                                              | Phân tích siêu dữ liệu (Title, Description, Thumbnail) của một đường dẫn URL trước khi gửi.                                                                                      |
| [`preloadConversations`](#preloadconversations)                     | `GET`  | `/api/preloadconvers/get-last-msgs`                                   | Tải trước tin nhắn cuối cùng và trạng thái đã đọc của các hội thoại đang hoạt động (command 10053).                                                                              |
| [`removeUnreadMark`](#removeunreadmark)                             | `POST` | `/api/conv/removeUnreadMark`                                          | Gỡ bỏ đánh dấu chưa đọc trên cuộc trò chuyện.                                                                                                                                    |
| [`renewMessageLink`](#renewmessagelink)                             | `POST` | `/api/message/renewlink`                                              | Gia hạn đường dẫn tải tệp đính kèm / đa phương tiện đã hết hạn trong tin nhắn (command 12094)                                                                                    |
| [`resetHiddenConversPin`](#resethiddenconverspin)                   | `GET`  | `/api/hiddenconvers/reset`                                            | Đặt lại (Reset) mã PIN bảo vệ trò chuyện ẩn.                                                                                                                                     |
| [`sendBankCard`](#sendbankcard)                                     | `POST` | `/api/transfer/card`                                                  | Gửi danh thiếp thông tin tài khoản ngân hàng (Bank Card) vào cuộc trò chuyện.                                                                                                    |
| [`sendCard`](#sendcard)                                             | `POST` | `/api/message/forward`<br/>`/api/group/forward`                       | Gửi danh thiếp liên hệ Zalo (Contact Card / QR) vào hội thoại cá nhân hoặc nhóm.                                                                                                 |
| [`sendDeliveredEvent`](#senddeliveredevent)                         | `POST` | `/api/message/deliveredv2`<br/>`/api/group/deliveredv2`               | Gửi tín hiệu xác nhận Đã nhận (Delivered) cho một hoặc nhiều tin nhắn.                                                                                                           |
| [`sendLink`](#sendlink)                                             | `POST` | `/api/message/link`<br/>`/api/group/sendlink`                         | Gửi tin nhắn kèm bản xem trước liên kết (Link Preview) vào hội thoại.                                                                                                            |
| [`sendMessage`](#sendmessage)                                       | `POST` | `/api/message`<br/>`/api/group`<br/>`/api/message/`<br/>`/api/group/` | Gửi tin nhắn văn bản, trích dẫn (Quote), nhắc tên (@Mention) hoặc tệp đính kèm (Ảnh/File/GIF) tới cá nhân hoặc nhóm.                                                             |
| [`sendReport`](#sendreport)                                         | `POST` | `/api/report/abuse-v2`<br/>`/api/social/profile/reportabuse`          | Gửi báo cáo vi phạm (Report Abuse) đối với người dùng hoặc cuộc trò chuyện.                                                                                                      |
| [`sendSeenEvent`](#sendseenevent)                                   | `POST` | `/api/message/seenv2`<br/>`/api/group/seenv2`                         | Gửi tín hiệu xác nhận Đã xem (Seen) cho các tin nhắn trong hội thoại.                                                                                                            |
| [`sendSticker`](#sendsticker)                                       | `POST` | `/api/message/sticker`<br/>`/api/group/sticker`                       | Gửi nhãn dán (Sticker) vào cuộc trò chuyện cá nhân hoặc nhóm.                                                                                                                    |
| [`sendTypingEvent`](#sendtypingevent)                               | `POST` | `/api/message/typing`<br/>`/api/group/typing`                         | Gửi tín hiệu trạng thái Đang soạn tin nhắn (Typing...) tới người nhận hoặc nhóm.                                                                                                 |
| [`sendVideo`](#sendvideo)                                           | `POST` | `/api/message/forward`<br/>`/api/group/forward`                       | Gửi tệp video kèm ảnh thu nhỏ (Thumbnail) và thời lượng vào hội thoại cá nhân hoặc nhóm.                                                                                         |
| [`sendVoice`](#sendvoice)                                           | `POST` | `/api/message/forward`<br/>`/api/group/forward`                       | Gửi tin nhắn thoại (Voice / Audio MP3 / AAC) vào hội thoại cá nhân hoặc nhóm.                                                                                                    |
| [`setHiddenConversations`](#sethiddenconversations)                 | `POST` | `/api/hiddenconvers/add-remove`                                       | Ẩn hoặc bỏ ẩn một hoặc nhiều cuộc trò chuyện bằng mã PIN.                                                                                                                        |
| [`setMute`](#setmute)                                               | `POST` | `/api/social/profile/setmute`                                         | Bật hoặc tắt chế độ im lặng (Mute thông báo) cho cuộc trò chuyện theo khoảng thời gian.                                                                                          |
| [`setPinnedConversations`](#setpinnedconversations)                 | `POST` | `/api/pinconvers/updatev2`                                            | Ghim hoặc bỏ ghim cuộc trò chuyện lên đầu danh sách.                                                                                                                             |
| [`translateMessage`](#translatemessage)                             | `POST` | `/api/aifeatures/translate/v1/manual`                                 | Dịch thủ công một tin nhắn văn bản bằng Zalo AI (command 13397)                                                                                                                  |
| [`translateMessageAuto`](#translatemessageauto)                     | `POST` | `/api/aifeatures/translate/v1/auto`                                   | Gửi yêu cầu dịch tự động hàng loạt tin nhắn đến bằng Zalo AI (command 13398). Kết quả dịch bất đồng bộ có thể được đẩy về qua sự kiện `api.listener.on("translate_event", ...)`. |
| [`translateMessageSuggest`](#translatemessagesuggest)               | `POST` | `/api/aifeatures/translate/v1/suggest`                                | Gửi yêu cầu dịch gợi ý tin nhắn đang soạn thảo bằng Zalo AI (command 13399). Kết quả dịch bất đồng bộ có thể được đẩy về qua sự kiện `api.listener.on("translate_event", ...)`.  |
| [`undo`](#undo)                                                     | `POST` | `/api/message/undo`<br/>`/api/group/undomsg`                          | Thu hồi (Undo) một tin nhắn đã gửi với tất cả mọi người trong cuộc trò chuyện.                                                                                                   |
| [`undoMultiMessage`](#undomultimessage)                             | `POST` | `/api/group/multi_undomsg`<br/>`/api/message/multi_undo`              | Thu hồi hàng loạt nhiều tin nhắn cùng lúc trong hội thoại cá nhân hoặc nhóm (command 12115 / 12116)                                                                              |
| [`updateArchivedChatList`](#updatearchivedchatlist)                 | `POST` | `/api/archivedchat/update`                                            | Đưa cuộc trò chuyện vào mục Lưu trữ (Archive) hoặc khôi phục ra ngoài.                                                                                                           |
| [`updateAutoDeleteChat`](#updateautodeletechat)                     | `POST` | `/api/conv/autodelete/updateConvers`                                  | Cấu hình thời gian tự động xóa tin nhắn cho cuộc trò chuyện (1 ngày, 7 ngày, 30 ngày hoặc tắt).                                                                                  |
| [`updateBlockSharingConversation`](#updateblocksharingconversation) | `POST` | `/api/conv/blocksharing/updateConvers`                                | Bật hoặc tắt chế độ chặn chia sẻ / chuyển tiếp tin nhắn trong một hội thoại (command 12179)                                                                                      |
| [`updateHiddenConversPin`](#updatehiddenconverspin)                 | `GET`  | `/api/hiddenconvers/update-pin`                                       | Đặt mới hoặc thay đổi mã PIN bảo mật cho tính năng Trò chuyện ẩn.                                                                                                                |
| [`updatePinConversations`](#updatepinconversations)                 | `POST` | `/api/pinconvers/updatev2`<br/>`/api/pinconvers/update`               | Cập nhật danh sách hội thoại ghim qua `/api/pinconvers/update` (command 12121) hoặc `/api/pinconvers/updatev2` (command 12122)                                                   |
| [`updateRecentSearch`](#updaterecentsearch)                         | `POST` | `/api/recentsearch/update`                                            | Cập nhật danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12126)                                                                                                            |
| [`updateTranslateSetting`](#updatetranslatesetting)                 | `POST` | `/api/aifeatures/translate/v1/setting`                                | Cập nhật cấu hình dịch tin nhắn Zalo AI cho một hội thoại (command 13396)                                                                                                        |

---

## `addReaction`

Thả biểu cảm (Reaction: Tim, Like, Haha, Wow, Buồn, Giận) vào một tin nhắn cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/reaction</span> <span class="zca-endpoint-pill">/api/group/reaction</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.addReaction(icon: Reactions | CustomReaction, dest: AddReactionDestination)
// Hoặc gọi phẳng (Flat Alias):
await api.addReaction(icon: Reactions | CustomReaction, dest: AddReactionDestination)
```

### Tham số

- `icon`: Reaction icon
- `dest`: Destination data including message IDs and thread information

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddReactionResponse = {
    msgIds: number[];
};

export type CustomReaction = {
    rType: number;
    source: number;
    icon: string;
};

export type AddReactionDestination = {
    data: {
        msgId: string;
        cliMsgId: string;
    };
    threadId: string;
    type: ThreadType;
};
```

---

## `addUnreadMark`

Đánh dấu hội thoại là chưa đọc (Unread).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/addUnreadMark</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.addUnreadMark(threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.addUnreadMark(threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `threadId`: Thread ID
- `type`: Thread type (User/Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddUnreadMarkResponse = {
    data: {
        updateId: number;
    };
    status: number;
};
```

---

## `deleteChat`

Xóa lịch sử cuộc trò chuyện cá nhân hoặc nhóm ở phía tài khoản hiện tại.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/deleteconver</span> <span class="zca-endpoint-pill">/api/group/deleteconver</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.deleteChat(lastMessage: DeleteChatLastMessage, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteChat(lastMessage: DeleteChatLastMessage, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `lastMessage`: Last message info
- `threadId`: Thread ID
- `type`: Thread type

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteChatResponse = {
    status: number;
};

export type DeleteChatLastMessage = {
    /**
     * Last message owner ID to delete backwards
     */
    ownerId: string;
    /**
     * Last message client ID to delete backwards
     */
    cliMsgId: string;
    /**
     * Last message global ID to delete backwards
     */
    globalMsgId: string;
};
```

---

## `deleteMessage`

Xóa một tin nhắn cụ thể (chỉ xóa ở phía tôi hoặc thu hồi).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/delete</span> <span class="zca-endpoint-pill">/api/group/deletemsg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.deleteMessage(dest: DeleteMessageDestination, onlyMe = false)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteMessage(dest: DeleteMessageDestination, onlyMe = false)
```

### Tham số

- `dest`: Delete target
- `onlyMe`: Delete message for only you

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteMessageResponse = {
    status: number;
};

export type DeleteMessageDestination = {
    data: {
        cliMsgId: string;
        msgId: string;
        uidFrom: string;
    };
    threadId: string;
    type?: ThreadType;
};
```

---

## `fetchImportantMessages`

Lấy danh sách các tin nhắn được đánh dấu quan trọng / đánh dấu sao (command 12114)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/fetchImportant</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.fetchImportantMessages(options: FetchImportantMessagesOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.fetchImportantMessages(options: FetchImportantMessagesOptions = {})
```

### Tham số

- `options`: Tùy chọn phân trang (`newestId` hoặc `lastId`, mặc định `lastId = "-1"`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FetchImportantMessagesOptions = {
    limit?: number;
    newestId?: string | null;
    lastId?: string | null;
};

export type FetchImportantMessagesResponse = Record<string, unknown>;
```

---

## `forwardMessage`

Chuyển tiếp (Forward) tin nhắn văn bản hoặc đính kèm tới nhiều hội thoại cùng lúc.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/mforward</span> <span class="zca-endpoint-pill">/api/group/mforward</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.forwardMessage(payload: ForwardMessagePayload, threadIds: string[], type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.forwardMessage(payload: ForwardMessagePayload, threadIds: string[], type: ThreadType = ThreadType.User,)
```

### Tham số

- `payload`: Forward message payload
- `threadId`: Thread ID(s)
- `type`: Thread type (User/Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ForwardMessagePayload = {
    message: string;
    ttl?: number;
    reference?: {
        id: string;
        ts: number;
        logSrcType: number;
        fwLvl: number;
    };
};

export type ForwardMessageSuccess = {
    clientId: string;
    msgId: string;
};

export type ForwardMessageFail = {
    clientId: string;
    error_code: string;
};

export type ForwardMessageResponse = {
    success: ForwardMessageSuccess[];
    fail: ForwardMessageFail[];
};
```

---

## `getArchivedChatList`

Lấy danh sách các hội thoại đã được lưu trữ (Archived Chats).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/archivedchat/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getArchivedChatList();
// Hoặc gọi phẳng (Flat Alias):
await api.getArchivedChatList();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetArchivedChatListResponse = {
    items: unknown[]; // @TODO: check type
    version: number;
};
```

---

## `getAutoDeleteChat`

Lấy danh sách các hội thoại đang bật chế độ tin nhắn tự xóa.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/autodelete/getConvers</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getAutoDeleteChat();
// Hoặc gọi phẳng (Flat Alias):
await api.getAutoDeleteChat();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAutoDeleteChatResponse = {
    convers: {
        destId: string;
        isGroup: boolean;
        ttl: number;
        createdAt: number;
    }[];
};
```

---

## `getBlockSharingConversations`

Lấy danh sách hội thoại đang bật chế độ chặn chia sẻ / chuyển tiếp tin nhắn (command 12178)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/blocksharing/getConvers</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getBlockSharingConversations();
// Hoặc gọi phẳng (Flat Alias):
await api.getBlockSharingConversations();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetBlockSharingConversationsResponse = {
    convers?: unknown[];
    [key: string]: unknown;
};
```

---

## `getConvOfflineMessages`

Lấy danh sách hội thoại nhóm có tin nhắn ngoại tuyến mới (command 12300)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/cm/grOfl</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getConvOfflineMessages(options: GetConvOfflineMessagesOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.getConvOfflineMessages(options: GetConvOfflineMessagesOptions)
```

### Tham số

- `options`: Thông tin hàng đợi và ID tin nhắn / hành động cuối cùng

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetConvOfflineMessagesOptions = {
    queueInfo: unknown;
    lastMsgId?: string | number;
    lastActId?: string | number;
};

export type GetConvOfflineMessagesResponse = Record<string, unknown>;
```

---

## `getDirectMessageStatus`

Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn trong các hội thoại cá nhân 1-1 (command 12016)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/getStatusMsg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getDirectMessageStatus(data: Array<string | { tId: string; [key: string]: unknown }>)
// Hoặc gọi phẳng (Flat Alias):
await api.getDirectMessageStatus(data: Array<string | { tId: string; [key: string]: unknown }>)
```

### Tham số

- `data`: Danh sách UID hoặc đối tượng truy vấn `{ tId }`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DirectMessageStatusItem = {
    tId: string;
    seen?: string | number;
    deliver?: string | number;
    [key: string]: unknown;
};

export type GetDirectMessageStatusResponse = {
    statusInfos: DirectMessageStatusItem[];
    [key: string]: unknown;
};
```

---

## `getHiddenConversations`

Lấy danh sách các cuộc trò chuyện đang được ẩn bằng mã PIN.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/hiddenconvers/get-all</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getHiddenConversations();
// Hoặc gọi phẳng (Flat Alias):
await api.getHiddenConversations();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetHiddenConversationsResponse = {
    pin: string;
    threads: {
        /**
         * 1: true, 0: false
         */
        is_group: number;
        thread_id: string;
    }[];
};
```

---

## `getLastSeen`

Lấy thông tin trạng thái đã xem cuối cùng của danh sách nhóm và cá nhân (command 12009)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/preloadconvers/get-last-seen</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getLastSeen(options: GetLastSeenOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.getLastSeen(options: GetLastSeenOptions = {})
```

### Tham số

- `options`: Danh sách ID nhóm (`groupIds`) và UID cá nhân (`userIds`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetLastSeenOptions = {
    groupIds?: string[];
    userIds?: string[];
};

export type GetLastSeenResponse = {
    clearUnreadInfo?: Record<string, unknown>[];
    data?: string;
    status?: number;
    [key: string]: unknown;
};
```

---

## `getLastSeenReaction`

Lấy trạng thái đã xem cảm xúc (Reaction) cuối cùng của danh sách nhóm và cá nhân (command 12450)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/react/gLastSn</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getLastSeenReaction(options: GetLastSeenReactionOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.getLastSeenReaction(options: GetLastSeenReactionOptions = {})
```

### Tham số

- `options`: Danh sách ID nhóm (`groupIds`) và UID cá nhân (`userIds`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetLastSeenReactionOptions = {
    groupIds?: string[];
    userIds?: string[];
};

export type GetLastSeenReactionResponse = {
    clearUnreadInfo: Record<string, unknown>[];
    [key: string]: unknown;
};
```

---

## `getMute`

Lấy danh sách các cuộc trò chuyện đang tắt thông báo (Mute).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/social/profile/getmute</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getMute();
// Hoặc gọi phẳng (Flat Alias):
await api.getMute();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type MuteEntriesInfo = {
    id: string;
    duration: number;
    startTime: number;
    systemTime: number;
    currentTime: number;
    muteMode: number;
};

export type GetMuteResponse = {
    chatEntries: MuteEntriesInfo[];
    groupChatEntries: MuteEntriesInfo[];
};
```

---

## `getPinConversations`

Lấy danh sách các cuộc trò chuyện đang được ghim trên đầu danh sách chat.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/pinconvers/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getPinConversations();
// Hoặc gọi phẳng (Flat Alias):
await api.getPinConversations();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetPinConversationsResponse = {
    conversations: string[];
    version: number;
};
```

---

## `getRecentSearchList`

Lấy danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12125)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/recentsearch/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getRecentSearchList(version: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.getRecentSearchList(version: number = 0)
```

### Tham số

- `version`: Phiên bản lịch sử tìm kiếm (mặc định: 0)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetRecentSearchListResponse = {
    version: number;
    list_recent: Record<string, unknown>[];
    list_keyword: string[];
};
```

---

## `getSuggestedConversations`

Lấy danh sách các cuộc hội thoại được gợi ý (command 11233)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/suggestconvers/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getSuggestedConversations(language?: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getSuggestedConversations(language?: string)
```

### Tham số

- `language`: Ngôn ngữ hiển thị (mặc định theo `ctx.language` hoặc `"vi"`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetSuggestedConversationsResponse = {
    conversations?: unknown[];
    [key: string]: unknown;
};
```

---

## `getTranslateSetting`

Lấy cấu hình tính năng dịch tin nhắn tự động bằng Zalo AI (command 13395)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/aifeatures/translate/v1/setting</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getTranslateSetting();
// Hoặc gọi phẳng (Flat Alias):
await api.getTranslateSetting();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetTranslateSettingResponse = {
    info?: unknown[];
    version?: number;
    [key: string]: unknown;
};
```

---

## `getUnreadMark`

Lấy danh sách các cuộc trò chuyện đang được đánh dấu là chưa đọc.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/getUnreadMark</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.getUnreadMark();
// Hoặc gọi phẳng (Flat Alias):
await api.getUnreadMark();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UnreadMark = {
    id: number;
    cliMsgId: number;
    fromUid: number;
    ts: number;
};

export type GetUnreadMarkResponse = {
    data: {
        convsGroup: UnreadMark[];
        convsUser: UnreadMark[];
    };
    status: number;
};
```

---

## `markSubTabSeen`

Đánh dấu đã xem các tab phụ của danh sách hội thoại (command 16214)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/subtab/seen</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.markSubTabSeen(seens: unknown[])
// Hoặc gọi phẳng (Flat Alias):
await api.markSubTabSeen(seens: unknown[])
```

### Tham số

- `seens`: Danh sách thông tin tab phụ đã xem

### Kiểu dữ liệu (TypeScript Types)

```ts
export type MarkSubTabSeenResponse = {
    status?: number;
    [key: string]: unknown;
};
```

---

## `parseLink`

Phân tích siêu dữ liệu (Title, Description, Thumbnail) của một đường dẫn URL trước khi gửi.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/parselink</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.parseLink(link: string)
// Hoặc gọi phẳng (Flat Alias):
await api.parseLink(link: string)
```

### Tham số

- `link`: link to parse

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ParseLinkErrorMaps = Record<string, number>;

export type ParseLinkResponse = {
    data: {
        thumb: string;
        title: string;
        desc: string;
        src: string;
        href: string;
        media: {
            type: number;
            count: number;
            mediaTitle: string;
            artist: string;
            streamUrl: string;
            stream_icon: string;
        };
        stream_icon: string;
    };
    error_maps: ParseLinkErrorMaps;
};
```

---

## `preloadConversations`

Tải trước tin nhắn cuối cùng và trạng thái đã đọc của các hội thoại đang hoạt động (command 10053).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/preloadconvers/get-last-msgs</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.preloadConversations(threadIdLocalMsgId: Record<string, string | number> = {})
// Hoặc gọi phẳng (Flat Alias):
await api.preloadConversations(threadIdLocalMsgId: Record<string, string | number> = {})
```

### Tham số

- `threadIdLocalMsgId`: Optional map of `{ [threadId]: lastLocalMsgId }` (defaults to `{}`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PreloadConversationsRawResponse = {
    msgs?: TMessage[];
    groupMsgs?: TGroupMessage[];
    allmsgs?: Array<TMessage | (TGroupMessage & { isGroup?: boolean | number })>;
    eeMsgs?: unknown[];
    pageMsgs?: TMessage[];
    clearUnreads?: TClearUnreadItem[];
    clearUnreadsReact?: TClearUnreadItem[];
    seens?: unknown[];
    lastActionId?: string;
    lastActionIdOther?: string;
    more?: number;
    conversations?: Array<{
        conv_id: string;
        last_msgs?: unknown[];
        unread_count?: number;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

export type PreloadConversationsResponse = PreloadConversationsRawResponse & {
    messages: Message[];
    pageMessages: UserMessage[];
    unreadCleared: ClearUnread[];
};
```

---

## `removeUnreadMark`

Gỡ bỏ đánh dấu chưa đọc trên cuộc trò chuyện.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/removeUnreadMark</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.removeUnreadMark(threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.removeUnreadMark(threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `threadId`: Thread ID
- `type`: Thread type (User/Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveUnreadMarkResponse = {
    data: {
        updateId: number;
    };
    status: number;
};
```

---

## `renewMessageLink`

Gia hạn đường dẫn tải tệp đính kèm / đa phương tiện đã hết hạn trong tin nhắn (command 12094)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/renewlink</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.renewMessageLink(options: RenewMessageLinkOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.renewMessageLink(options: RenewMessageLinkOptions)
```

### Tham số

- `options`: Thông tin tin nhắn và đường dẫn cần gia hạn

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RenewMessageLinkOptions = {
    toId: string;
    msgType: number;
    msgInfo: Record<string, unknown>;
    clientId?: string | number;
    isGroup?: boolean;
};

export type RenewMessageLinkResponse = Record<string, unknown>;
```

---

## `resetHiddenConversPin`

Đặt lại (Reset) mã PIN bảo vệ trò chuyện ẩn.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/hiddenconvers/reset</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.resetHiddenConversPin();
// Hoặc gọi phẳng (Flat Alias):
await api.resetHiddenConversPin();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ResetHiddenConversPinResponse = "";
```

---

## `sendBankCard`

Gửi danh thiếp thông tin tài khoản ngân hàng (Bank Card) vào cuộc trò chuyện.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/transfer/card</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendBankCard(payload: SendBankCardPayload, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendBankCard(payload: SendBankCardPayload, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `payload`: The payload containing the bank card information
- `threadId`: The ID of the thread to send the bank card to
- `type`: The type of thread to send the bank card to

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendBankCardPayload = {
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank?: string;
};

export type SendBankCardResponse = "";
```

---

## `sendCard`

Gửi danh thiếp liên hệ Zalo (Contact Card / QR) vào hội thoại cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/forward</span> <span class="zca-endpoint-pill">/api/group/forward</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendCard(options: SendCardOptions, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.sendCard(options: SendCardOptions, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `userId`: Unique ID for Card
- `phoneNumber`: Optional phone number for sending card to a User
- `ttl`: Time to live in milliseconds (default: 0)
- `threadId`: ID of the conversation
- `type`: Message type (User or GroupMessage)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendCardOptions = {
    userId: string;
    phoneNumber?: string;
    ttl?: number;
};

export type SendCardResponse = {
    msgId: number;
};
```

---

## `sendDeliveredEvent`

Gửi tín hiệu xác nhận Đã nhận (Delivered) cho một hoặc nhiều tin nhắn.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/deliveredv2</span> <span class="zca-endpoint-pill">/api/group/deliveredv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendDeliveredEvent(isSeen: boolean, messages: SendDeliveredEventMessageParams | SendDeliveredEventMessageParams[], type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendDeliveredEvent(isSeen: boolean, messages: SendDeliveredEventMessageParams | SendDeliveredEventMessageParams[], type: ThreadType = ThreadType.User,)
```

### Tham số

- `isSeen`: Whether the message is seen or not
- `messages`: List of messages to send delivered event
- `type`: Messages type (User or Group), defaults to User

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendDeliveredEventResponse = "" | { status: number };

export type SendDeliveredEventMessageParams = {
    msgId: string;
    cliMsgId: string;
    uidFrom: string;
    idTo: string;
    msgType: string;
    st: number;
    at: number;
    cmd: number;
    ts: string | number;
};

type RequestMessageParams = {
    gmi: string;
    cmi: string;
    si: string;
    di: string;
    mt: string;
    st: number;
    at: number;
    cmd: number;
    ts: number;
};

type MsgInfos = {
    seen: number;
    data: RequestMessageParams[];
    grid?: string; // Optional, any random value works
};
```

---

## `sendLink`

Gửi tin nhắn kèm bản xem trước liên kết (Link Preview) vào hội thoại.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/link</span> <span class="zca-endpoint-pill">/api/group/sendlink</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendLink(options: SendLinkOptions, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.sendLink(options: SendLinkOptions, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `options`: Link and ttl
- `threadId`: Thread ID
- `type`: Thread type

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendLinkOptions = {
    msg?: string;
    link: string;
    ttl?: number;
};

export type SendLinkResponse = {
    msgId: string;
};
```

---

## `sendMessage`

Gửi tin nhắn văn bản, trích dẫn (Quote), nhắc tên (@Mention) hoặc tệp đính kèm (Ảnh/File/GIF) tới cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message</span> <span class="zca-endpoint-pill">/api/group</span> <span class="zca-endpoint-pill">/api/message/</span> <span class="zca-endpoint-pill">/api/group/</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendMessage(message: MessageContent | string, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendMessage(message: MessageContent | string, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `message`: Message content
- `threadId`: group or user id
- `type`: Message type (User or Group)
- `quote`: Message or GroupMessage instance (optional), used for quoting

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendMessageResult = {
    msgId: number;
};

export type SendMessageResponse = {
    message: SendMessageResult | null;
    attachment: SendMessageResult[];
};

export type SendMessageQuote = {
    content: TMessage["content"];
    msgType: TMessage["msgType"];
    propertyExt: TMessage["propertyExt"];

    uidFrom: TMessage["uidFrom"];
    msgId: TMessage["msgId"];
    cliMsgId: TMessage["cliMsgId"];
    ts: TMessage["ts"];
    ttl: TMessage["ttl"];
};

export enum TextStyle {
    Bold = "b",
    Italic = "i",
    Underline = "u",
    StrikeThrough = "s",
    Red = "c_db342e",
    Orange = "c_f27806",
    Yellow = "c_f7b503",
    Green = "c_15a85f",
    Small = "f_13",
    Big = "f_18",
    UnorderedList = "lst_1",
    OrderedList = "lst_2",
    Indent = "ind_$",
}

export type Style =
    | {
          start: number;
          len: number;
          st: Exclude<TextStyle, TextStyle.Indent>;
      }
    | {
          start: number;
          len: number;
          st: TextStyle.Indent;
          /**
           * Number of spaces used for indentation.
           */
          indentSize?: number;
      };

export enum Urgency {
    Default,
    Important,
    Urgent,
}

export type Mention = {
    /**
     * mention position
     */
    pos: number;
    /**
     * id of the mentioned user
     */
    uid: string;
    /**
     * length of the mention
     */
    len: number;
};

export type MessageContent = {
    /**
     * Text content of the message
     */
    msg: string;
    /**
     * Text styles
     */
    styles?: Style[];
    /**
     * Urgency of the message
     */
    urgency?: Urgency;
    /**
     * Quoted message (optional)
     */
    quote?: SendMessageQuote;
    /**
     * Mentions in the message (optional)
     */
    mentions?: Mention[];
    /**
     * Attachments in the message (optional)
     */
    attachments?: AttachmentSource | AttachmentSource[];
    /**
     * Time to live in milliseconds
     */
    ttl?: number;
};
```

---

## `sendReport`

Gửi báo cáo vi phạm (Report Abuse) đối với người dùng hoặc cuộc trò chuyện.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/report/abuse-v2</span> <span class="zca-endpoint-pill">/api/social/profile/reportabuse</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendReport(options: SendReportOptions, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.sendReport(options: SendReportOptions, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `options`: Report options
- `threadId`: The threadID to report
- `type`: Thread type, default direct

### Kiểu dữ liệu (TypeScript Types)

```ts
export enum ReportReason {
    Sensitive = 1,
    Annoy = 2,
    Fraud = 3,
    Other = 0,
}

export type SendReportOptions =
    | {
          reason: ReportReason.Other;
          content: string;
      }
    | {
          reason: Exclude<ReportReason, ReportReason.Other>;
      };

export type SendReportResponse = {
    reportId: string;
};
```

---

## `sendSeenEvent`

Gửi tín hiệu xác nhận Đã xem (Seen) cho các tin nhắn trong hội thoại.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/seenv2</span> <span class="zca-endpoint-pill">/api/group/seenv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendSeenEvent(messages: SendSeenEventMessageParams | SendSeenEventMessageParams[], type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendSeenEvent(messages: SendSeenEventMessageParams | SendSeenEventMessageParams[], type: ThreadType = ThreadType.User,)
```

### Tham số

- `messages`: List of messages to send seen event
- `type`: Messages type (User or Group), defaults to User

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendSeenEventResponse = {
    status: number;
};

export type SendSeenEventMessageParams = {
    msgId: string;
    cliMsgId: string;
    uidFrom: string;
    idTo: string;
    msgType: string;
    st: number;
    at: number;
    cmd: number;
    ts: string | number;
};

type RequestMessageParams = {
    gmi: string;
    cmi: string;
    si: string;
    di: string;
    mt: string;
    st: number;
    at: number;
    cmd: number;
    ts: number;
};

type MsgInfos = {
    data: RequestMessageParams[];
    grid?: string;
    senderId?: string;
};
```

---

## `sendSticker`

Gửi nhãn dán (Sticker) vào cuộc trò chuyện cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/sticker</span> <span class="zca-endpoint-pill">/api/group/sticker</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendSticker(sticker: SendStickerPayload, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendSticker(sticker: SendStickerPayload, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `sticker`: Sticker object
- `threadId`: group or user id
- `type`: Message type (User or GroupMessage)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendStickerPayload = {
    id: number;
    cateId: number;
    type: number;
};

export type SendStickerResponse = {
    msgId: number;
};
```

---

## `sendTypingEvent`

Gửi tín hiệu trạng thái Đang soạn tin nhắn (Typing...) tới người nhận hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/typing</span> <span class="zca-endpoint-pill">/api/group/typing</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendTypingEvent(threadId: string, type: ThreadType = ThreadType.User, destType: DestType = DestType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendTypingEvent(threadId: string, type: ThreadType = ThreadType.User, destType: DestType = DestType.User,)
```

### Tham số

- `threadId`: The ID of the User or Group to send the typing event to
- `type`: The type of thread (User or Group)
- `destType`: The destination type (User or Page), for User threads only, defaults to User

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendTypingEventResponse = {
    status: number;
};
```

---

## `sendVideo`

Gửi tệp video kèm ảnh thu nhỏ (Thumbnail) và thời lượng vào hội thoại cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/forward</span> <span class="zca-endpoint-pill">/api/group/forward</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendVideo(options: SendVideoOptions, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.sendVideo(options: SendVideoOptions, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `options`: send video options
- `threadId`: ID of the user or group to send the video to
- `type`: Type of thread (USER or GROUP)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendVideoOptions = {
    /**
     * Optional message to send along with the video
     */
    msg?: string;
    /**
     * URL of the video
     */
    videoUrl: string;
    /**
     * URL of the thumbnail
     */
    thumbnailUrl: string;
    /**
     * Video duration in milliseconds || Eg: video duration: 5.5s => 5.5 * 1000 = 5500
     */
    duration?: number;
    /**
     * Width of the video
     */
    width?: number;
    /**
     * Height of the video
     */
    height?: number;
    /**
     * Time to live in milliseconds (default: 0)
     */
    ttl?: number;
};

export type SendVideoResponse = {
    msgId: number;
};
```

---

## `sendVoice`

Gửi tin nhắn thoại (Voice / Audio MP3 / AAC) vào hội thoại cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/forward</span> <span class="zca-endpoint-pill">/api/group/forward</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.sendVoice(options: SendVoiceOptions, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.sendVoice(options: SendVoiceOptions, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `options`: voice options
- `threadId`: ID of the user or group to send the voice to
- `type`: Type of thread, default user

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendVoiceOptions = {
    voiceUrl: string;
    /**
     * Time to live in milliseconds (default: 0)
     */
    ttl?: number;
};

export type SendVoiceResponse = {
    msgId: string;
};
```

---

## `setHiddenConversations`

Ẩn hoặc bỏ ẩn một hoặc nhiều cuộc trò chuyện bằng mã PIN.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/hiddenconvers/add-remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.setHiddenConversations(hidden: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.setHiddenConversations(hidden: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)
```

### Tham số

- `hidden`: - Hide or unhide conversations
- `threadId`: Thread ID(s)
- `type`: Thread type (User/Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SetHiddenConversationsResponse = "";
```

---

## `setMute`

Bật hoặc tắt chế độ im lặng (Mute thông báo) cho cuộc trò chuyện theo khoảng thời gian.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/social/profile/setmute</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.setMute(params: SetMuteParams = {}, threadID: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.setMute(params: SetMuteParams = {}, threadID: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `params`: - Mute parameters
- `threadID`: - ID of the thread to mute
- `type`: - Type of thread (User or Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SetMuteParams = {
    /**
     * Mute duration in seconds or predefined durations
     */
    duration?: MuteDuration | number;
    action?: MuteAction;
};

export type SetMuteResponse = "";

export enum MuteDuration {
    ONE_HOUR = 3600,
    FOUR_HOURS = 14400,
    FOREVER = -1,
    UNTIL_8AM = "until8AM",
}

export enum MuteAction {
    MUTE = 1,
    UNMUTE = 3, // khi tat thi duration = -1
}
```

---

## `setPinnedConversations`

Ghim hoặc bỏ ghim cuộc trò chuyện lên đầu danh sách.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/pinconvers/updatev2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.setPinnedConversations(pinned: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.setPinnedConversations(pinned: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)
```

### Tham số

- `pinned`: Should pin conversations
- `threadId`: The ID(s) of the thread
- `type`: Type of thread, default User

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SetPinnedConversationsResponse = "";
```

---

## `translateMessage`

Dịch thủ công một tin nhắn văn bản bằng Zalo AI (command 13397)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/aifeatures/translate/v1/manual</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.translateMessage(options: TranslateMessageOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.translateMessage(options: TranslateMessageOptions)
```

### Tham số

- `options`: Thông tin tin nhắn và cặp ngôn ngữ cần dịch

### Kiểu dữ liệu (TypeScript Types)

```ts
export type TranslateMessageOptions = {
    reqId?: string;
    msgId: string;
    threadId: string;
    type?: number;
    srcLang: string;
    desLang: string;
    text: string;
    immutableItems?: unknown[];
};

export type TranslateMessageResponse = {
    reqId?: string;
    text?: string;
    metadata?: {
        immutableItems?: unknown[];
    };
    [key: string]: unknown;
};
```

---

## `translateMessageAuto`

Gửi yêu cầu dịch tự động hàng loạt tin nhắn đến bằng Zalo AI (command 13398). Kết quả dịch bất đồng bộ có thể được đẩy về qua sự kiện `api.listener.on("translate_event", ...)`.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/aifeatures/translate/v1/auto</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.translateMessageAuto(options: TranslateMessageAutoOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.translateMessageAuto(options: TranslateMessageAutoOptions)
```

### Tham số

- `options`: Danh sách tin nhắn và cặp ngôn ngữ cần dịch tự động

### Kiểu dữ liệu (TypeScript Types)

```ts
export type TranslateMessageAutoItem = {
    text: string;
    metadata: {
        cmi: string;
        gmi: string;
        immutableItems?: unknown[];
    };
};

export type TranslateMessageAutoOptions = {
    reqId?: string;
    threadId: string;
    type?: number;
    srcLang: string;
    desLang: string;
    msgs: TranslateMessageAutoItem[];
};

export type TranslateMessageAutoResponse = Record<string, unknown>;
```

---

## `translateMessageSuggest`

Gửi yêu cầu dịch gợi ý tin nhắn đang soạn thảo bằng Zalo AI (command 13399). Kết quả dịch bất đồng bộ có thể được đẩy về qua sự kiện `api.listener.on("translate_event", ...)`.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/aifeatures/translate/v1/suggest</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.translateMessageSuggest(options: TranslateMessageSuggestOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.translateMessageSuggest(options: TranslateMessageSuggestOptions)
```

### Tham số

- `options`: Nội dung tin nhắn đang soạn thảo và cặp ngôn ngữ cần dịch

### Kiểu dữ liệu (TypeScript Types)

```ts
export type TranslateMessageSuggestOptions = {
    reqId?: string;
    threadId: string;
    type?: number;
    srcLang: string;
    desLang: string;
    text: string;
    immutableItems?: unknown[];
};

export type TranslateMessageSuggestResponse = Record<string, unknown>;
```

---

## `undo`

Thu hồi (Undo) một tin nhắn đã gửi với tất cả mọi người trong cuộc trò chuyện.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/message/undo</span> <span class="zca-endpoint-pill">/api/group/undomsg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.undo(payload: UndoPayload, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.undo(payload: UndoPayload, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `payload`: Undo payload containing message ID and client message ID
- `threadId`: group or user id
- `type`: Message type (User or Group), default is User

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UndoPayload = {
    msgId: string | number;
    cliMsgId: string | number;
};

export type UndoResponse = {
    status: number;
};
```

---

## `undoMultiMessage`

Thu hồi hàng loạt nhiều tin nhắn cùng lúc trong hội thoại cá nhân hoặc nhóm (command 12115 / 12116)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/group/multi_undomsg</span> <span class="zca-endpoint-pill">/api/message/multi_undo</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.undoMultiMessage(msgs: UndoMultiMessageItem[], threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.undoMultiMessage(msgs: UndoMultiMessageItem[], threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `msgs`: Danh sách tin nhắn cần thu hồi (`globalMsgId`, `cliMsgId` của tin nhắn gốc)
- `threadId`: ID người nhận hoặc ID nhóm
- `type`: Loại hội thoại (`ThreadType.User` hoặc `ThreadType.Group`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UndoMultiMessageItem = {
    globalMsgId: string | number;
    cliMsgId: string | number;
    cliMsgIdUndo?: string | number;
    destId?: string;
};

export type UndoMultiMessageResponse = Record<string, unknown>;
```

---

## `updateArchivedChatList`

Đưa cuộc trò chuyện vào mục Lưu trữ (Archive) hoặc khôi phục ra ngoài.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/archivedchat/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updateArchivedChatList(isArchived: boolean, conversations: UpdateArchivedChatListTarget | UpdateArchivedChatListTarget[],)
// Hoặc gọi phẳng (Flat Alias):
await api.updateArchivedChatList(isArchived: boolean, conversations: UpdateArchivedChatListTarget | UpdateArchivedChatListTarget[],)
```

### Tham số

- `isArchived`: - true to archive, false to unarchive
- `conversations`: - List of conversations to archive/unarchive

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateArchivedChatListTarget = { id: string; type: ThreadType };

export type UpdateArchivedChatListResponse = { needResync: boolean; version: number };
```

---

## `updateAutoDeleteChat`

Cấu hình thời gian tự động xóa tin nhắn cho cuộc trò chuyện (1 ngày, 7 ngày, 30 ngày hoặc tắt).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/autodelete/updateConvers</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updateAutoDeleteChat(ttl: ChatTTL, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.updateAutoDeleteChat(ttl: ChatTTL, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `ttl`: The time to live of the chat
- `threadId`: The thread ID to auto delete chat
- `type`: Type of thread (User or Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export enum ChatTTL {
    NO_DELETE = 0,
    ONE_DAY = 86400000,
    SEVEN_DAYS = 604800000,
    FOURTEEN_DAYS = 1209600000,
}

export type UpdateAutoDeleteChatResponse = "";
```

---

## `updateBlockSharingConversation`

Bật hoặc tắt chế độ chặn chia sẻ / chuyển tiếp tin nhắn trong một hội thoại (command 12179)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/conv/blocksharing/updateConvers</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updateBlockSharingConversation(options: UpdateBlockSharingConversationOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.updateBlockSharingConversation(options: UpdateBlockSharingConversationOptions)
```

### Tham số

- `options`: Thông tin hội thoại và trạng thái bật/tắt

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateBlockSharingConversationOptions = {
    threadId: string;
    isGroup?: boolean;
    isEnabled: boolean | number;
    clientLang?: string;
};

export type UpdateBlockSharingConversationResponse = Record<string, unknown>;
```

---

## `updateHiddenConversPin`

Đặt mới hoặc thay đổi mã PIN bảo mật cho tính năng Trò chuyện ẩn.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/hiddenconvers/update-pin</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updateHiddenConversPin(pin: string)
// Hoặc gọi phẳng (Flat Alias):
await api.updateHiddenConversPin(pin: string)
```

### Tham số

- `pin`: The pin to update (must be a 4-digit number between 0000-9999)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateHiddenConversPinResponse = "";
```

---

## `updatePinConversations`

Cập nhật danh sách hội thoại ghim qua `/api/pinconvers/update` (command 12121) hoặc `/api/pinconvers/updatev2` (command 12122)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/pinconvers/updatev2</span> <span class="zca-endpoint-pill">/api/pinconvers/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updatePinConversations(options: UpdatePinConversationsOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.updatePinConversations(options: UpdatePinConversationsOptions)
```

### Tham số

- `options`: Cấu hình danh sách hội thoại ghim

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdatePinConversationsOptions = {
    /**
     * Danh sách ID hội thoại cần ghim / bỏ ghim (prefix `g` cho nhóm hoặc UID cho cá nhân).
     */
    conversations: string[];
    /**
     * Loại thao tác khi dùng V2 (`1`: ghim, `2`: bỏ ghim). Nếu truyền `actionType`, API sẽ gọi `/api/pinconvers/updatev2` (cmd 12122).
     */
    actionType?: number;
    /**
     * Tab hội thoại khi dùng V2 (tùy chọn).
     */
    tab?: number;
    /**
     * Phiên bản danh sách ghim khi dùng V1 (`/api/pinconvers/update`, cmd 12121, mặc định: `0`).
     */
    version?: number;
};

export type UpdatePinConversationsResponse = {
    version?: number;
    conversations?: string[];
    [key: string]: unknown;
};
```

---

## `updateRecentSearch`

Cập nhật danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12126)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/recentsearch/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updateRecentSearch(options: UpdateRecentSearchOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.updateRecentSearch(options: UpdateRecentSearchOptions = {})
```

### Tham số

- `options`: Danh sách tìm kiếm gần đây và từ khóa (`listRecent`, `listKeyword`, `version`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateRecentSearchOptions = {
    listRecent?: Record<string, unknown>[];
    listKeyword?: string[];
    version?: number;
};

export type UpdateRecentSearchResponse = {
    version: number;
    list_recent: Record<string, unknown>[];
    list_keyword: string[];
};
```

---

## `updateTranslateSetting`

Cập nhật cấu hình dịch tin nhắn Zalo AI cho một hội thoại (command 13396)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.chat</span><span class="zca-endpoint-pill">/api/aifeatures/translate/v1/setting</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.chat.updateTranslateSetting(options: UpdateTranslateSettingOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.updateTranslateSetting(options: UpdateTranslateSettingOptions)
```

### Tham số

- `options`: Thiết lập dịch tự động và cặp ngôn ngữ cho hội thoại

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateTranslateSettingOptions = {
    threadId: string;
    type: number;
    settings: {
        auto: boolean | number;
        suggest: boolean | number;
        srcLang: string;
        desLang: string;
    };
    [key: string]: unknown;
};

export type UpdateTranslateSettingResponse = Record<string, unknown>;
```

---
