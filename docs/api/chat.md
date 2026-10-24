# Tin nhắn & Hội thoại (Chat)

> Namespace: `api.chat` (hoặc gọi trực tiếp `api.<methodName>`) — **41 API**

Gửi/nhận tin nhắn văn bản, ảnh, video, voice, card, thu hồi tin nhắn, ghim/ẩn/lưu trữ hội thoại và trạng thái Đã nhận/Đã xem.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`addReaction`](#addreaction) | `POST` | `/api/message/reaction`<br/>`/api/group/reaction` | Add reaction to a message |
| [`addUnreadMark`](#addunreadmark) | `POST` | `/api/conv/addUnreadMark` | Add unread mark to conversation |
| [`deleteChat`](#deletechat) | `POST` | `/api/message/deleteconver`<br/>`/api/group/deleteconver` | Delete chat |
| [`deleteMessage`](#deletemessage) | `POST` | `/api/message/delete`<br/>`/api/group/deletemsg` | Delete a message |
| [`forwardMessage`](#forwardmessage) | `POST` | `/api/message/mforward`<br/>`/api/group/mforward` | Forward message to multiple threads |
| [`getArchivedChatList`](#getarchivedchatlist) | `GET` | `/api/archivedchat/list` | Get arcnived chat list |
| [`getAutoDeleteChat`](#getautodeletechat) | `GET` | `/api/conv/autodelete/getConvers` | Get auto delete chat |
| [`getDirectMessageStatus`](#getdirectmessagestatus) | `POST` | `/api/message/getStatusMsg` | Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn trong các hội thoại cá nhân 1-1 (command 12016) |
| [`getHiddenConversations`](#gethiddenconversations) | `GET` | `/api/hiddenconvers/get-all` | Get hidden conversations |
| [`getLastSeen`](#getlastseen) | `GET` | `/api/preloadconvers/get-last-seen` | Lấy thông tin trạng thái đã xem cuối cùng của danh sách nhóm và cá nhân (command 12009) |
| [`getLastSeenReaction`](#getlastseenreaction) | `GET` | `/api/react/gLastSn` | Lấy trạng thái đã xem cảm xúc (Reaction) cuối cùng của danh sách nhóm và cá nhân (command 12450) |
| [`getMute`](#getmute) | `GET` | `/api/social/profile/getmute` | Get mute |
| [`getPinConversations`](#getpinconversations) | `GET` | `/api/pinconvers/list` | Get pin conversations |
| [`getRecentSearchList`](#getrecentsearchlist) | `GET` | `/api/recentsearch/list` | Lấy danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12125) |
| [`getSuggestedConversations`](#getsuggestedconversations) | `GET` | `/api/suggestconvers/list` | Lấy danh sách các cuộc hội thoại được gợi ý (command 11233) |
| [`getUnreadMark`](#getunreadmark) | `GET` | `/api/conv/getUnreadMark` | Get unread mark |
| [`parseLink`](#parselink) | `GET` | `/api/message/parselink` | Parse link |
| [`preloadConversations`](#preloadconversations) | `GET` | `/api/preloadconvers/get-last-msgs` | Preload last messages and unread-cleared states across active conversations. Useful for initial state loading and catching up missed messages after reconnect. |
| [`removeUnreadMark`](#removeunreadmark) | `POST` | `/api/conv/removeUnreadMark` | Remove unread mark from conversation |
| [`resetHiddenConversPin`](#resethiddenconverspin) | `GET` | `/api/hiddenconvers/reset` | Reset hidden conversation pin |
| [`sendBankCard`](#sendbankcard) | `POST` | `/api/transfer/card` | Send bank card |
| [`sendCard`](#sendcard) | `POST` | `/api/message/forward`<br/>`/api/group/forward` | Send a card to a User - Group |
| [`sendDeliveredEvent`](#senddeliveredevent) | `POST` | `/api/message/deliveredv2`<br/>`/api/group/deliveredv2` | Send message delivered event |
| [`sendLink`](#sendlink) | `POST` | `/api/message/link`<br/>`/api/group/sendlink` | Send link |
| [`sendMessage`](#sendmessage) | `POST` | `/api/message`<br/>`/api/group`<br/>`/api/message/`<br/>`/api/group/` | Send a message to a thread |
| [`sendReport`](#sendreport) | `POST` | `/api/report/abuse-v2`<br/>`/api/social/profile/reportabuse` | Send report to Zalo |
| [`sendSeenEvent`](#sendseenevent) | `POST` | `/api/message/seenv2`<br/>`/api/group/seenv2` | Send message seen event |
| [`sendSticker`](#sendsticker) | `POST` | `/api/message/sticker`<br/>`/api/group/sticker` | Send a sticker to a thread |
| [`sendTypingEvent`](#sendtypingevent) | `POST` | `/api/message/typing`<br/>`/api/group/typing` | Send typing event |
| [`sendVideo`](#sendvideo) | `POST` | `/api/message/forward`<br/>`/api/group/forward` | Send a video to a User - Group - **Standard Videos**: - 3840x2160 (4K UHD): Width 3840px, Height 2160px. - 1920x1080 (Full HD): Width 1920px, Height 1080px. - 1280x720 (HD): Width 1280px, Height 720px. - **Document-Oriented Videos** (Portrait): - 3840x2160 (4K UHD): Width 3840px, Height 2160px. - 720x1280 (HD): Width 720px, Height 1280px. - 1440x2560 (2K): Width 1440px, Height 2560px. |
| [`sendVoice`](#sendvoice) | `POST` | `/api/message/forward`<br/>`/api/group/forward` | Send a voice to a User - Group |
| [`setHiddenConversations`](#sethiddenconversations) | `POST` | `/api/hiddenconvers/add-remove` | Set hidden conversations |
| [`setMute`](#setmute) | `POST` | `/api/social/profile/setmute` | Set mute |
| [`setPinnedConversations`](#setpinnedconversations) | `POST` | `/api/pinconvers/updatev2` | Pin and unpin conversations of threads) |
| [`undo`](#undo) | `POST` | `/api/message/undo`<br/>`/api/group/undomsg` | Undo a message |
| [`undoMultiMessage`](#undomultimessage) | `POST` | `/api/group/multi_undomsg`<br/>`/api/message/multi_undo` | Thu hồi hàng loạt nhiều tin nhắn cùng lúc trong hội thoại cá nhân hoặc nhóm (command 12115 / 12116) |
| [`updateArchivedChatList`](#updatearchivedchatlist) | `POST` | `/api/archivedchat/update` | Archive conversations |
| [`updateAutoDeleteChat`](#updateautodeletechat) | `POST` | `/api/conv/autodelete/updateConvers` | Auto delete chat |
| [`updateHiddenConversPin`](#updatehiddenconverspin) | `GET` | `/api/hiddenconvers/update-pin` | Update hidden conversation pin |
| [`updatePinConversations`](#updatepinconversations) | `POST` | `/api/pinconvers/updatev2`<br/>`/api/pinconvers/update` | Cập nhật danh sách hội thoại ghim qua `/api/pinconvers/update` (command 12121) hoặc `/api/pinconvers/updatev2` (command 12122) |
| [`updateRecentSearch`](#updaterecentsearch) | `POST` | `/api/recentsearch/update` | Cập nhật danh sách lịch sử tìm kiếm gần đây trên Zalo (command 12126) |

---

## `addReaction`

Add reaction to a message

- **Endpoint**: `POST /api/message/reaction`, `POST /api/group/reaction`
- **Domain call**: `api.chat.addReaction(icon: Reactions | CustomReaction, dest: AddReactionDestination)`
- **Alias phẳng**: `api.addReaction(icon: Reactions | CustomReaction, dest: AddReactionDestination)`

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

Add unread mark to conversation

- **Endpoint**: `POST /api/conv/addUnreadMark`
- **Domain call**: `api.chat.addUnreadMark(threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.addUnreadMark(threadId: string, type: ThreadType = ThreadType.User)`

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

Delete chat

- **Endpoint**: `POST /api/message/deleteconver`, `POST /api/group/deleteconver`
- **Domain call**: `api.chat.deleteChat(lastMessage: DeleteChatLastMessage, threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.deleteChat(lastMessage: DeleteChatLastMessage, threadId: string, type: ThreadType = ThreadType.User,)`

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

Delete a message

- **Endpoint**: `POST /api/message/delete`, `POST /api/group/deletemsg`
- **Domain call**: `api.chat.deleteMessage(dest: DeleteMessageDestination, onlyMe = false)`
- **Alias phẳng**: `api.deleteMessage(dest: DeleteMessageDestination, onlyMe = false)`

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

## `forwardMessage`

Forward message to multiple threads

- **Endpoint**: `POST /api/message/mforward`, `POST /api/group/mforward`
- **Domain call**: `api.chat.forwardMessage(payload: ForwardMessagePayload, threadIds: string[], type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.forwardMessage(payload: ForwardMessagePayload, threadIds: string[], type: ThreadType = ThreadType.User,)`

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

Get arcnived chat list

- **Endpoint**: `GET /api/archivedchat/list`
- **Domain call**: `api.chat.getArchivedChatList()`
- **Alias phẳng**: `api.getArchivedChatList()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetArchivedChatListResponse = {
    items: unknown[]; // @TODO: check type
    version: number;
};
```

---

## `getAutoDeleteChat`

Get auto delete chat

- **Endpoint**: `GET /api/conv/autodelete/getConvers`
- **Domain call**: `api.chat.getAutoDeleteChat()`
- **Alias phẳng**: `api.getAutoDeleteChat()`

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

## `getDirectMessageStatus`

Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn trong các hội thoại cá nhân 1-1 (command 12016)

- **Endpoint**: `POST /api/message/getStatusMsg`
- **Domain call**: `api.chat.getDirectMessageStatus(data: Array<string | { tId: string; [key: string]: unknown }>)`
- **Alias phẳng**: `api.getDirectMessageStatus(data: Array<string | { tId: string; [key: string]: unknown }>)`

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

Get hidden conversations

- **Endpoint**: `GET /api/hiddenconvers/get-all`
- **Domain call**: `api.chat.getHiddenConversations()`
- **Alias phẳng**: `api.getHiddenConversations()`

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

- **Endpoint**: `GET /api/preloadconvers/get-last-seen`
- **Domain call**: `api.chat.getLastSeen(options: GetLastSeenOptions = {})`
- **Alias phẳng**: `api.getLastSeen(options: GetLastSeenOptions = {})`

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

- **Endpoint**: `GET /api/react/gLastSn`
- **Domain call**: `api.chat.getLastSeenReaction(options: GetLastSeenReactionOptions = {})`
- **Alias phẳng**: `api.getLastSeenReaction(options: GetLastSeenReactionOptions = {})`

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

Get mute

- **Endpoint**: `GET /api/social/profile/getmute`
- **Domain call**: `api.chat.getMute()`
- **Alias phẳng**: `api.getMute()`

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

Get pin conversations

- **Endpoint**: `GET /api/pinconvers/list`
- **Domain call**: `api.chat.getPinConversations()`
- **Alias phẳng**: `api.getPinConversations()`

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

- **Endpoint**: `GET /api/recentsearch/list`
- **Domain call**: `api.chat.getRecentSearchList(version: number = 0)`
- **Alias phẳng**: `api.getRecentSearchList(version: number = 0)`

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

- **Endpoint**: `GET /api/suggestconvers/list`
- **Domain call**: `api.chat.getSuggestedConversations(language?: string)`
- **Alias phẳng**: `api.getSuggestedConversations(language?: string)`

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

## `getUnreadMark`

Get unread mark

- **Endpoint**: `GET /api/conv/getUnreadMark`
- **Domain call**: `api.chat.getUnreadMark()`
- **Alias phẳng**: `api.getUnreadMark()`

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

## `parseLink`

Parse link

- **Endpoint**: `GET /api/message/parselink`
- **Domain call**: `api.chat.parseLink(link: string)`
- **Alias phẳng**: `api.parseLink(link: string)`

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

Preload last messages and unread-cleared states across active conversations. Useful for initial state loading and catching up missed messages after reconnect.

- **Endpoint**: `GET /api/preloadconvers/get-last-msgs`
- **Domain call**: `api.chat.preloadConversations(threadIdLocalMsgId: Record<string, string | number> = {})`
- **Alias phẳng**: `api.preloadConversations(threadIdLocalMsgId: Record<string, string | number> = {})`

### Tham số

- `threadIdLocalMsgId`: Optional map of `{ [threadId]: lastLocalMsgId }` (defaults to `{}`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PreloadConversationsRawResponse = {
    msgs?: TMessage[];
    groupMsgs?: TGroupMessage[];
    allmsgs?: Array<TMessage | (TGroupMessage & { isGroup?: boolean | number })>;
    eeMsgs?: unknown[];
    pageMsgs?: unknown[];
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
    unreadCleared: ClearUnread[];
};
```

---

## `removeUnreadMark`

Remove unread mark from conversation

- **Endpoint**: `POST /api/conv/removeUnreadMark`
- **Domain call**: `api.chat.removeUnreadMark(threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.removeUnreadMark(threadId: string, type: ThreadType = ThreadType.User)`

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

## `resetHiddenConversPin`

Reset hidden conversation pin

- **Endpoint**: `GET /api/hiddenconvers/reset`
- **Domain call**: `api.chat.resetHiddenConversPin()`
- **Alias phẳng**: `api.resetHiddenConversPin()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ResetHiddenConversPinResponse = "";
```

---

## `sendBankCard`

Send bank card

- **Endpoint**: `POST /api/transfer/card`
- **Domain call**: `api.chat.sendBankCard(payload: SendBankCardPayload, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendBankCard(payload: SendBankCardPayload, threadId: string, type: ThreadType = ThreadType.User)`

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

Send a card to a User - Group

- **Endpoint**: `POST /api/message/forward`, `POST /api/group/forward`
- **Domain call**: `api.chat.sendCard(options: SendCardOptions, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendCard(options: SendCardOptions, threadId: string, type: ThreadType = ThreadType.User)`

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

Send message delivered event

- **Endpoint**: `POST /api/message/deliveredv2`, `POST /api/group/deliveredv2`
- **Domain call**: `api.chat.sendDeliveredEvent(isSeen: boolean, messages: SendDeliveredEventMessageParams | SendDeliveredEventMessageParams[], type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.sendDeliveredEvent(isSeen: boolean, messages: SendDeliveredEventMessageParams | SendDeliveredEventMessageParams[], type: ThreadType = ThreadType.User,)`

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

Send link

- **Endpoint**: `POST /api/message/link`, `POST /api/group/sendlink`
- **Domain call**: `api.chat.sendLink(options: SendLinkOptions, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendLink(options: SendLinkOptions, threadId: string, type: ThreadType = ThreadType.User)`

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

Send a message to a thread

- **Endpoint**: `POST /api/message`, `POST /api/group`, `POST /api/message/`, `POST /api/group/`
- **Domain call**: `api.chat.sendMessage(message: MessageContent | string, threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.sendMessage(message: MessageContent | string, threadId: string, type: ThreadType = ThreadType.User,)`

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

Send report to Zalo

- **Endpoint**: `POST /api/report/abuse-v2`, `POST /api/social/profile/reportabuse`
- **Domain call**: `api.chat.sendReport(options: SendReportOptions, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendReport(options: SendReportOptions, threadId: string, type: ThreadType = ThreadType.User)`

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

Send message seen event

- **Endpoint**: `POST /api/message/seenv2`, `POST /api/group/seenv2`
- **Domain call**: `api.chat.sendSeenEvent(messages: SendSeenEventMessageParams | SendSeenEventMessageParams[], type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.sendSeenEvent(messages: SendSeenEventMessageParams | SendSeenEventMessageParams[], type: ThreadType = ThreadType.User,)`

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

Send a sticker to a thread

- **Endpoint**: `POST /api/message/sticker`, `POST /api/group/sticker`
- **Domain call**: `api.chat.sendSticker(sticker: SendStickerPayload, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendSticker(sticker: SendStickerPayload, threadId: string, type: ThreadType = ThreadType.User)`

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
}

export type SendStickerResponse = {
    msgId: number;
};
```

---

## `sendTypingEvent`

Send typing event

- **Endpoint**: `POST /api/message/typing`, `POST /api/group/typing`
- **Domain call**: `api.chat.sendTypingEvent(threadId: string, type: ThreadType = ThreadType.User, destType: DestType = DestType.User,)`
- **Alias phẳng**: `api.sendTypingEvent(threadId: string, type: ThreadType = ThreadType.User, destType: DestType = DestType.User,)`

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

Send a video to a User - Group - **Standard Videos**: - 3840x2160 (4K UHD): Width 3840px, Height 2160px. - 1920x1080 (Full HD): Width 1920px, Height 1080px. - 1280x720 (HD): Width 1280px, Height 720px. - **Document-Oriented Videos** (Portrait): - 3840x2160 (4K UHD): Width 3840px, Height 2160px. - 720x1280 (HD): Width 720px, Height 1280px. - 1440x2560 (2K): Width 1440px, Height 2560px.

- **Endpoint**: `POST /api/message/forward`, `POST /api/group/forward`
- **Domain call**: `api.chat.sendVideo(options: SendVideoOptions, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendVideo(options: SendVideoOptions, threadId: string, type: ThreadType = ThreadType.User)`

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

Send a voice to a User - Group

- **Endpoint**: `POST /api/message/forward`, `POST /api/group/forward`
- **Domain call**: `api.chat.sendVoice(options: SendVoiceOptions, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.sendVoice(options: SendVoiceOptions, threadId: string, type: ThreadType = ThreadType.User)`

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

Set hidden conversations

- **Endpoint**: `POST /api/hiddenconvers/add-remove`
- **Domain call**: `api.chat.setHiddenConversations(hidden: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.setHiddenConversations(hidden: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)`

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

Set mute

- **Endpoint**: `POST /api/social/profile/setmute`
- **Domain call**: `api.chat.setMute(params: SetMuteParams = {}, threadID: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.setMute(params: SetMuteParams = {}, threadID: string, type: ThreadType = ThreadType.User)`

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

Pin and unpin conversations of threads)

- **Endpoint**: `POST /api/pinconvers/updatev2`
- **Domain call**: `api.chat.setPinnedConversations(pinned: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.setPinnedConversations(pinned: boolean, threadId: string | string[], type: ThreadType = ThreadType.User,)`

### Tham số

- `pinned`: Should pin conversations
- `threadId`: The ID(s) of the thread
- `type`: Type of thread, default User

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SetPinnedConversationsResponse = "";
```

---

## `undo`

Undo a message

- **Endpoint**: `POST /api/message/undo`, `POST /api/group/undomsg`
- **Domain call**: `api.chat.undo(payload: UndoPayload, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.undo(payload: UndoPayload, threadId: string, type: ThreadType = ThreadType.User)`

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

- **Endpoint**: `POST /api/group/multi_undomsg`, `POST /api/message/multi_undo`
- **Domain call**: `api.chat.undoMultiMessage(msgs: UndoMultiMessageItem[], threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.undoMultiMessage(msgs: UndoMultiMessageItem[], threadId: string, type: ThreadType = ThreadType.User,)`

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

Archive conversations

- **Endpoint**: `POST /api/archivedchat/update`
- **Domain call**: `api.chat.updateArchivedChatList(isArchived: boolean, conversations: UpdateArchivedChatListTarget | UpdateArchivedChatListTarget[])`
- **Alias phẳng**: `api.updateArchivedChatList(isArchived: boolean, conversations: UpdateArchivedChatListTarget | UpdateArchivedChatListTarget[])`

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

Auto delete chat

- **Endpoint**: `POST /api/conv/autodelete/updateConvers`
- **Domain call**: `api.chat.updateAutoDeleteChat(ttl: ChatTTL, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.updateAutoDeleteChat(ttl: ChatTTL, threadId: string, type: ThreadType = ThreadType.User)`

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

## `updateHiddenConversPin`

Update hidden conversation pin

- **Endpoint**: `GET /api/hiddenconvers/update-pin`
- **Domain call**: `api.chat.updateHiddenConversPin(pin: string)`
- **Alias phẳng**: `api.updateHiddenConversPin(pin: string)`

### Tham số

- `pin`: The pin to update (must be a 4-digit number between 0000-9999)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateHiddenConversPinResponse = "";
```

---

## `updatePinConversations`

Cập nhật danh sách hội thoại ghim qua `/api/pinconvers/update` (command 12121) hoặc `/api/pinconvers/updatev2` (command 12122)

- **Endpoint**: `POST /api/pinconvers/updatev2`, `POST /api/pinconvers/update`
- **Domain call**: `api.chat.updatePinConversations(options: UpdatePinConversationsOptions)`
- **Alias phẳng**: `api.updatePinConversations(options: UpdatePinConversationsOptions)`

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

- **Endpoint**: `POST /api/recentsearch/update`
- **Domain call**: `api.chat.updateRecentSearch(options: UpdateRecentSearchOptions = {})`
- **Alias phẳng**: `api.updateRecentSearch(options: UpdateRecentSearchOptions = {})`

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
