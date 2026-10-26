---
title: "Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board) (api.board) - 16 APIs"
description: "Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls) và Lịch hẹn (Reminders). Tra cứu chi tiết 16 phương thức thuộc phân hệ api.board trong bộ SDK @softtynet/zca-js."
---

# 📌 Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board)

> Namespace: `api.board` (hoặc gọi trực tiếp `api.<methodName>`) — **16 API nguyên bản**

Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls) và Lịch hẹn (Reminders).

## Danh sách nhanh

| Phương thức                                     |  HTTP  | Endpoint Zalo                                              | Mô tả                                                                                                                      |
| :---------------------------------------------- | :----: | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [`addPollOptions`](#addpolloptions)             | `GET`  | `/api/poll/option/add`                                     | Thêm phương án lựa chọn mới vào một cuộc Bình chọn (Poll) đang mở trong nhóm.                                              |
| [`createNote`](#createnote)                     | `POST` | `/api/board/topic/createv2`                                | Tạo một Ghi chú (Note) mới trên Bảng tin nhóm và tùy chọn ghim lên đầu.                                                    |
| [`createPoll`](#createpoll)                     | `POST` | `/api/poll/create`                                         | Tạo một cuộc Bình chọn (Poll) mới trong nhóm với nhiều phương án và cấu hình ẩn danh/đa lựa chọn.                          |
| [`createReminder`](#createreminder)             | `POST` | `/api/board/oneone/create`<br/>`/api/board/topic/createv2` | Tạo một Lịch hẹn (Reminder) mới trong hội thoại cá nhân hoặc nhóm.                                                         |
| [`editNote`](#editnote)                         | `POST` | `/api/board/topic/updatev2`                                | Chỉnh sửa nội dung ghi chú đã tạo trên Bảng tin nhóm.                                                                      |
| [`editReminder`](#editreminder)                 | `POST` | `/api/board/oneone/update`<br/>`/api/board/topic/updatev2` | Chỉnh sửa nội dung và thời gian của một Lịch hẹn (Reminder).                                                               |
| [`getListBoard`](#getlistboard)                 | `GET`  | `/api/board/list`                                          | Lấy danh sách các mục trên Bảng tin nhóm (bao gồm Ghi chú, Bình chọn và Tin nhắn ghim) qua /api/board/list.                |
| [`getListPinTopics`](#getlistpintopics)         | `GET`  | `/api/board/pin/list`                                      | Lấy danh sách chủ đề / tin nhắn đã ghim trong bảng tin nhóm (command 12001)                                                |
| [`getListReminder`](#getlistreminder)           | `GET`  | `/api/board/oneone/list`<br/>`/api/board/listReminder`     | Lấy danh sách các Lịch hẹn (Reminders) trong hội thoại cá nhân hoặc nhóm.                                                  |
| [`getPollDetail`](#getpolldetail)               | `POST` | `/api/poll/detail`                                         | Lấy thông tin chi tiết và toàn bộ danh sách UID thành viên đã bỏ phiếu (voters) trong cuộc Bình chọn qua /api/poll/detail. |
| [`getReminder`](#getreminder)                   | `GET`  | `/api/board/topic/getReminder`                             | Lấy thông tin chi tiết của một Lịch hẹn (Reminder) trong nhóm.                                                             |
| [`getReminderResponses`](#getreminderresponses) | `GET`  | `/api/board/topic/listResponseEvent`                       | Lấy danh sách UID các thành viên đã bấm Tham gia (acceptMember) hoặc Từ chối (rejectMember) một Lịch hẹn.                  |
| [`lockPoll`](#lockpoll)                         | `POST` | `/api/poll/end`                                            | Khóa (Kết thúc) một cuộc Bình chọn trong nhóm.                                                                             |
| [`removeReminder`](#removereminder)             | `POST` | `/api/board/oneone/remove`<br/>`/api/board/topic/remove`   | Xóa một Lịch hẹn trong hội thoại cá nhân hoặc nhóm.                                                                        |
| [`sharePoll`](#sharepoll)                       | `POST` | `/api/poll/share`                                          | Chia sẻ lại cuộc Bình chọn vào luồng tin nhắn nhóm.                                                                        |
| [`votePoll`](#votepoll)                         | `GET`  | `/api/poll/vote`                                           | Bỏ phiếu bình chọn cho một hoặc nhiều phương án trong cuộc Bình chọn nhóm.                                                 |

---

## `addPollOptions`

Thêm phương án lựa chọn mới vào một cuộc Bình chọn (Poll) đang mở trong nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/poll/option/add</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.addPollOptions(payload: AddPollOptionsPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.addPollOptions(payload: AddPollOptionsPayload)
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddPollOptionsOption = {
    voted: boolean;
    content: string;
};

export type AddPollOptionsPayload = {
    pollId: number;
    options: AddPollOptionsOption[];
    votedOptionIds: number[];
};

export type AddPollOptionsResponse = {
    options: PollOptions[];
};
```

---

## `createNote`

Tạo một Ghi chú (Note) mới trên Bảng tin nhóm và tùy chọn ghim lên đầu.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/topic/createv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.createNote(options: CreateNoteOptions, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.createNote(options: CreateNoteOptions, groupId: string)
```

### Tham số

- `options`: note options
- `options.title`: note title
- `options.pinAct`: pin action (pin note)
- `groupId`: group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateNoteOptions = {
    title: string;
    pinAct?: boolean;
};

export type CreateNoteResponse = NoteDetail;
```

---

## `createPoll`

Tạo một cuộc Bình chọn (Poll) mới trong nhóm với nhiều phương án và cấu hình ẩn danh/đa lựa chọn.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/poll/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.createPoll(options: CreatePollOptions, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.createPoll(options: CreatePollOptions, groupId: string)
```

### Tham số

- `options`: Poll options
- `groupId`: Group ID to create poll from

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreatePollOptions = {
    /**
     * Question for the poll.
     */
    question: string;

    /**
     * List of options for the poll.
     */
    options: string[];

    /**
     * Poll expiration time in milliseconds (0 = no expiration).
     */
    expiredTime?: number;

    /**
     * Allows multiple choices in the poll.
     */
    allowMultiChoices?: boolean;

    /**
     * Allows members to add new options to the poll.
     */
    allowAddNewOption?: boolean;

    /**
     * Hides voting results until the user has voted.
     */
    hideVotePreview?: boolean;

    /**
     * Hides poll voters (anonymous poll).
     */
    isAnonymous?: boolean;
};

export type CreatePollResponse = PollDetail;
```

---

## `createReminder`

Tạo một Lịch hẹn (Reminder) mới trong hội thoại cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/create</span> <span class="zca-endpoint-pill">/api/board/topic/createv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.createReminder(options: CreateReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.createReminder(options: CreateReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `options`: reminder options
- `threadId`: Group ID to create note from
- `type`: Thread type (User or Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateReminderOptions = {
    title: string;
    emoji?: string;
    startTime?: number;
    repeat?: ReminderRepeatMode;
};

export type CreateReminderUser = ReminderUser;

export type CreateReminderGroup = Omit<ReminderGroup, "responseMem">;

export type CreateReminderResponse = CreateReminderUser | CreateReminderGroup;
```

---

## `editNote`

Chỉnh sửa nội dung ghi chú đã tạo trên Bảng tin nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/topic/updatev2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.editNote(options: EditNoteOptions, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.editNote(options: EditNoteOptions, groupId: string)
```

### Tham số

- `options`: Options for editing the note
- `groupId`: Group ID to create note from

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EditNoteOptions = {
    /**
     * New note title
     */
    title: string;
    /**
     * Topic ID to edit note from
     */
    topicId: string;
    /**
     * Should the note be pinned?
     */
    pinAct?: boolean;
};

export type EditNoteResponse = NoteDetail;
```

---

## `editReminder`

Chỉnh sửa nội dung và thời gian của một Lịch hẹn (Reminder).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/update</span> <span class="zca-endpoint-pill">/api/board/topic/updatev2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.editReminder(options: EditReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.editReminder(options: EditReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `options`: Reminder parameters
- `threadId`: Thread ID
- `type`: Thread type (User/Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EditReminderOptions = {
    title: string;
    topicId: string;
    emoji?: string;
    startTime?: number;
    repeat?: ReminderRepeatMode;
};

export type EditReminderUser = ReminderUser;

export type EditReminderGroup = Omit<ReminderGroup, "responseMem">;

export type EditReminderResponse = EditReminderUser | EditReminderGroup;
```

---

## `getListBoard`

Lấy danh sách các mục trên Bảng tin nhóm (bao gồm Ghi chú, Bình chọn và Tin nhắn ghim) qua /api/board/list.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getListBoard(options: ListBoardOptions, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getListBoard(options: ListBoardOptions, groupId: string)
```

### Tham số

- `options`: - The options for the request
- `groupId`: - The ID of the group

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ListBoardOptions = {
    /**
     * Page number (default: 1)
     */
    page?: number;
    /**
     * Number of items to retrieve (default: 20)
     */
    count?: number;
};

export type BoardItem = {
    boardType: BoardType;
    data: PollDetail | NoteDetail | PinnedMessageDetail;
};

export type GetListBoardResponse = {
    items: BoardItem[];
    count: number;
};

type RawListBoard = {
    items: {
        boardType: BoardType;
        data: Record<string, unknown>;
    }[];
    count: number;
};
```

---

## `getListPinTopics`

Lấy danh sách chủ đề / tin nhắn đã ghim trong bảng tin nhóm (command 12001)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/pin/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getListPinTopics(groupId: string, boardVersion: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.getListPinTopics(groupId: string, boardVersion: number = 0)
```

### Tham số

- `groupId`: ID nhóm
- `boardVersion`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetListPinTopicsResponse = {
    items: unknown[];
    version: number;
};
```

---

## `getListReminder`

Lấy danh sách các Lịch hẹn (Reminders) trong hội thoại cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/list</span> <span class="zca-endpoint-pill">/api/board/listReminder</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getListReminder(options: ListReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)
// Hoặc gọi phẳng (Flat Alias):
await api.getListReminder(options: ListReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)
```

### Tham số

- `options`: - The options for the request
- `threadId`: - The ID of the thread
- `type`: - The type of the thread (User or Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ListReminderOptions = {
    /**
     * Page number (default: 1)
     */
    page?: number;
    /**
     * Number of items to retrieve (default: 20)
     */
    count?: number;
};

export type ReminderListUser = ReminderUser;

export type ReminderListGroup = ReminderGroup & {
    groupId: string;
    eventType: number;
    responseMem: {
        rejectMember: number;
        myResp: number;
        acceptMember: number;
    };
    repeatInfo: {
        list_ts: unknown[];
    };
    repeatData: unknown[];
};

export type GetListReminderResponse = (ReminderListUser & ReminderListGroup)[];
```

---

## `getPollDetail`

Lấy thông tin chi tiết và toàn bộ danh sách UID thành viên đã bỏ phiếu (voters) trong cuộc Bình chọn qua /api/poll/detail.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/poll/detail</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getPollDetail(pollId: number)
// Hoặc gọi phẳng (Flat Alias):
await api.getPollDetail(pollId: number)
```

### Tham số

- `pollId`: Poll ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PollDetailResponse = PollDetail;
```

---

## `getReminder`

Lấy thông tin chi tiết của một Lịch hẹn (Reminder) trong nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/topic/getReminder</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getReminder(reminderId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getReminder(reminderId: string)
```

### Tham số

- `reminderId`: Reminder ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetReminderResponse = ReminderGroup;
```

---

## `getReminderResponses`

Lấy danh sách UID các thành viên đã bấm Tham gia (acceptMember) hoặc Từ chối (rejectMember) một Lịch hẹn.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/topic/listResponseEvent</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getReminderResponses(reminderId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getReminderResponses(reminderId: string)
```

### Tham số

- `reminderId`: reminder id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetReminderResponsesResponse = {
    rejectMember: string[];
    acceptMember: string[];
};
```

---

## `lockPoll`

Khóa (Kết thúc) một cuộc Bình chọn trong nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/poll/end</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.lockPoll(pollId: number)
// Hoặc gọi phẳng (Flat Alias):
await api.lockPoll(pollId: number)
```

### Tham số

- `pollId`: Poll id to lock

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LockPollResponse = "";
```

---

## `removeReminder`

Xóa một Lịch hẹn trong hội thoại cá nhân hoặc nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/remove</span> <span class="zca-endpoint-pill">/api/board/topic/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.removeReminder(reminderId: string, threadId: string, type: ThreadType = ThreadType.User)
// Hoặc gọi phẳng (Flat Alias):
await api.removeReminder(reminderId: string, threadId: string, type: ThreadType = ThreadType.User)
```

### Tham số

- `reminderId`: Reminder ID to remove reminder from
- `threadId`: (User/Group) ID to remove reminder from
- `type`: Thread type (User or Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveReminderResponse = "" | number;
```

---

## `sharePoll`

Chia sẻ lại cuộc Bình chọn vào luồng tin nhắn nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/poll/share</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.sharePoll(pollId: number)
// Hoặc gọi phẳng (Flat Alias):
await api.sharePoll(pollId: number)
```

### Tham số

- `pollId`: poll id to share

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SharePollResponse = "";
```

---

## `votePoll`

Bỏ phiếu bình chọn cho một hoặc nhiều phương án trong cuộc Bình chọn nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/poll/vote</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.votePoll(pollId: number, optionId: number | number[])
// Hoặc gọi phẳng (Flat Alias):
await api.votePoll(pollId: number, optionId: number | number[])
```

### Tham số

- `pollId`: The ID of the poll to vote on
- `optionId`: The ID(s) of the option to vote on

### Kiểu dữ liệu (TypeScript Types)

```ts
export type VotePollResponse = {
    options: PollOptions[];
};
```

---
