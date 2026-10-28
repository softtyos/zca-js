---
title: "Bảng tin, Bình chọn, Lịch hẹn & Zalo To-Do (Board) (api.board) - 38 APIs"
description: "Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls), Lịch hẹn nhóm & 1-1 (Reminders), Bảng tin bạn bè và Giao việc Zalo To-Do. Tra cứu chi tiết 38 phương thức thuộc phân hệ api.board trong bộ SDK @softtynet/zca-js."
---

# 📌 Bảng tin, Bình chọn, Lịch hẹn & Zalo To-Do (Board)

> Namespace: `api.board` (hoặc gọi trực tiếp `api.<methodName>`) — **38 API nguyên bản**

Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls), Lịch hẹn nhóm & 1-1 (Reminders), Bảng tin bạn bè và Giao việc Zalo To-Do.

## Danh sách nhanh

| Phương thức                                         |  HTTP  | Endpoint Zalo                                              | Mô tả                                                                                                                      |
| :-------------------------------------------------- | :----: | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [`ackDingTodo`](#ackdingtodo)                       | `GET`  | `/api/board/personal/todo/dingack`                         | Xác nhận đã nhận nhắc nhở (Ding ACK) trong Zalo To-Do (command 12427)                                                      |
| [`addPollOptions`](#addpolloptions)                 | `GET`  | `/api/poll/option/add`                                     | Thêm phương án lựa chọn mới vào một cuộc Bình chọn (Poll) đang mở trong nhóm.                                              |
| [`createNote`](#createnote)                         | `POST` | `/api/board/topic/createv2`                                | Tạo một Ghi chú (Note) mới trên Bảng tin nhóm và tùy chọn ghim lên đầu.                                                    |
| [`createOneOneBoardTopic`](#createoneoneboardtopic) | `POST` | `/api/board/oneone/create`                                 | Tạo nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12429)                                                          |
| [`createPoll`](#createpoll)                         | `POST` | `/api/poll/create`                                         | Tạo một cuộc Bình chọn (Poll) mới trong nhóm với nhiều phương án và cấu hình ẩn danh/đa lựa chọn.                          |
| [`createReminder`](#createreminder)                 | `POST` | `/api/board/oneone/create`<br/>`/api/board/topic/createv2` | Tạo một Lịch hẹn (Reminder) mới trong hội thoại cá nhân hoặc nhóm.                                                         |
| [`createTodo`](#createtodo)                         | `POST` | `/api/board/personal/todo/create`                          | Tạo công việc mới trong Zalo To-Do (command 12413)                                                                         |
| [`deleteTodo`](#deletetodo)                         | `GET`  | `/api/board/personal/delete`                               | Xóa công việc trong Zalo To-Do (command 12415)                                                                             |
| [`dingTodo`](#dingtodo)                             | `GET`  | `/api/board/personal/todo/ding`                            | Gửi nhắc nhở (Ding) cho các công việc trong Zalo To-Do (command 12426)                                                     |
| [`editNote`](#editnote)                             | `POST` | `/api/board/topic/updatev2`                                | Chỉnh sửa nội dung ghi chú đã tạo trên Bảng tin nhóm.                                                                      |
| [`editReminder`](#editreminder)                     | `POST` | `/api/board/oneone/update`<br/>`/api/board/topic/updatev2` | Chỉnh sửa nội dung và thời gian của một Lịch hẹn (Reminder).                                                               |
| [`getListBoard`](#getlistboard)                     | `GET`  | `/api/board/list`                                          | Lấy danh sách các mục trên Bảng tin nhóm (bao gồm Ghi chú, Bình chọn và Tin nhắn ghim) qua /api/board/list.                |
| [`getListOneOneBoard`](#getlistoneoneboard)         | `GET`  | `/api/board/oneone/list`                                   | Lấy danh sách nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12432)                                                |
| [`getListPinTopics`](#getlistpintopics)             | `GET`  | `/api/board/pin/list`                                      | Lấy danh sách chủ đề / tin nhắn đã ghim trong bảng tin nhóm (command 12001)                                                |
| [`getListReminder`](#getlistreminder)               | `GET`  | `/api/board/oneone/list`<br/>`/api/board/listReminder`     | Lấy danh sách các Lịch hẹn (Reminders) trong hội thoại cá nhân hoặc nhóm.                                                  |
| [`getPollDetail`](#getpolldetail)                   | `POST` | `/api/poll/detail`                                         | Lấy thông tin chi tiết và toàn bộ danh sách UID thành viên đã bỏ phiếu (voters) trong cuộc Bình chọn qua /api/poll/detail. |
| [`getReminder`](#getreminder)                       | `GET`  | `/api/board/topic/getReminder`                             | Lấy thông tin chi tiết của một Lịch hẹn (Reminder) trong nhóm.                                                             |
| [`getReminderResponses`](#getreminderresponses)     | `GET`  | `/api/board/topic/listResponseEvent`                       | Lấy danh sách UID các thành viên đã bấm Tham gia (acceptMember) hoặc Từ chối (rejectMember) một Lịch hẹn.                  |
| [`getTodoDetail`](#gettododetail)                   | `GET`  | `/api/board/personal/get`                                  | Lấy chi tiết công việc trong Zalo To-Do (command 12417)                                                                    |
| [`getTodoList`](#gettodolist)                       | `GET`  | `/api/board/personal/list`                                 | Lấy danh sách công việc trong Zalo To-Do (command 12416)                                                                   |
| [`lockPoll`](#lockpoll)                             | `POST` | `/api/poll/end`                                            | Khóa (Kết thúc) một cuộc Bình chọn trong nhóm.                                                                             |
| [`multiUnpinBoardTopics`](#multiunpinboardtopics)   | `GET`  | `/api/board/multi_unpin`                                   | Bỏ ghim đồng thời nhiều chủ đề khỏi bảng tin nhóm (command 12010)                                                          |
| [`pinBoardTopic`](#pinboardtopic)                   | `GET`  | `/api/board/pinv2`                                         | Ghim một chủ đề / bài đăng lên bảng tin nhóm (command 12004)                                                               |
| [`pinFriendMessage`](#pinfriendmessage)             | `GET`  | `/api/friendboard/create`                                  | Ghim tin nhắn / chủ đề trong hội thoại cá nhân 1-1 (command 12067)                                                         |
| [`removeBoardTopic`](#removeboardtopic)             | `POST` | `/api/board/topic/remove`                                  | Xóa chủ đề / ghi chú trên bảng tin nhóm (command 12143)                                                                    |
| [`removeOneOneBoardTopic`](#removeoneoneboardtopic) | `POST` | `/api/board/oneone/remove`                                 | Xóa nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12431)                                                          |
| [`removeReminder`](#removereminder)                 | `POST` | `/api/board/oneone/remove`<br/>`/api/board/topic/remove`   | Xóa một Lịch hẹn trong hội thoại cá nhân hoặc nhóm.                                                                        |
| [`reorderFriendBoard`](#reorderfriendboard)         | `GET`  | `/api/friendboard/reorder`                                 | Sắp xếp lại thứ tự các tin nhắn đã ghim trong hội thoại 1-1 (command 12068)                                                |
| [`reorderPinTopics`](#reorderpintopics)             | `POST` | `/api/board/pin/update`                                    | Sắp xếp lại thứ tự các chủ đề đã ghim trên bảng tin nhóm (command 12002)                                                   |
| [`respondReminder`](#respondreminder)               | `POST` | `/api/board/topic/updateEventResponse`                     | Phản hồi tham gia hoặc từ chối lịch nhắc hẹn trong nhóm (command 12087)                                                    |
| [`sharePoll`](#sharepoll)                           | `POST` | `/api/poll/share`                                          | Chia sẻ lại cuộc Bình chọn vào luồng tin nhắn nhóm.                                                                        |
| [`unpinBoardTopic`](#unpinboardtopic)               | `GET`  | `/api/board/unpinv2`                                       | Bỏ ghim một chủ đề khỏi bảng tin nhóm (command 12005)                                                                      |
| [`unpinFriendMessages`](#unpinfriendmessages)       | `GET`  | `/api/friendboard/multi_unpin`                             | Bỏ ghim một hoặc nhiều tin nhắn trong hội thoại 1-1 (command 12069)                                                        |
| [`updateOneOneBoardTopic`](#updateoneoneboardtopic) | `POST` | `/api/board/oneone/update`                                 | Cập nhật nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12430)                                                     |
| [`updateTodo`](#updatetodo)                         | `POST` | `/api/board/personal/todo/update`                          | Cập nhật nội dung công việc trong Zalo To-Do (command 12414)                                                               |
| [`updateTodoStatus`](#updatetodostatus)             | `GET`  | `/api/board/personal/todo/status`                          | Cập nhật trạng thái công việc trong Zalo To-Do (command 12418)                                                             |
| [`verifyTodo`](#verifytodo)                         | `GET`  | `/api/board/personal/todo/verify`                          | Kiểm tra tính đồng bộ của danh sách công việc trong Zalo To-Do (command 12603)                                             |
| [`votePoll`](#votepoll)                             | `GET`  | `/api/poll/vote`                                           | Bỏ phiếu bình chọn cho một hoặc nhiều phương án trong cuộc Bình chọn nhóm.                                                 |

---

## `ackDingTodo`

Xác nhận đã nhận nhắc nhở (Ding ACK) trong Zalo To-Do (command 12427)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/todo/dingack</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.ackDingTodo(taskIds: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.ackDingTodo(taskIds: string | string[])
```

### Tham số

- `taskIds`: Danh sách ID công việc xác nhận

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AckDingTodoResponse = Record<string, unknown>;
```

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

## `createOneOneBoardTopic`

Tạo nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12429)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.createOneOneBoardTopic(objectData: CreateOneOneBoardTopicOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.createOneOneBoardTopic(objectData: CreateOneOneBoardTopicOptions)
```

### Tham số

- `objectData`: Dữ liệu chủ đề / nhắc hẹn 1-1 cần tạo

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateOneOneBoardTopicOptions = {
    toUid: string;
    title: string;
    emoji?: string;
    startTime?: number;
    repeat?: number;
    color?: number;
    [key: string]: unknown;
};

export type CreateOneOneBoardTopicResponse = Record<string, unknown>;
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

## `createTodo`

Tạo công việc mới trong Zalo To-Do (command 12413)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/todo/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.createTodo(options: CreateTodoOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.createTodo(options: CreateTodoOptions)
```

### Tham số

- `options`: Thông tin công việc cần tạo

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateTodoOptions = {
    title?: string;
    content?: string;
    assignees?: string[];
    watchers?: string[];
    dueDate?: number;
    dateDefaultType?: number;
    status?: number;
    schedule?: unknown;
    src?: number;
    [key: string]: unknown;
};

export type CreateTodoResponse = {
    id?: string;
    [key: string]: unknown;
};
```

---

## `deleteTodo`

Xóa công việc trong Zalo To-Do (command 12415)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/delete</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.deleteTodo(todoId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteTodo(todoId: string)
```

### Tham số

- `todoId`: ID công việc cần xóa

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteTodoResponse = Record<string, unknown>;
```

---

## `dingTodo`

Gửi nhắc nhở (Ding) cho các công việc trong Zalo To-Do (command 12426)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/todo/ding</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.dingTodo(taskIds: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.dingTodo(taskIds: string | string[])
```

### Tham số

- `taskIds`: Danh sách ID công việc cần nhắc nhở

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DingTodoResponse = Record<string, unknown>;
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

## `getListOneOneBoard`

Lấy danh sách nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12432)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getListOneOneBoard(options: GetListOneOneBoardOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.getListOneOneBoard(options: GetListOneOneBoardOptions)
```

### Tham số

- `options`: Tùy chọn truy vấn danh sách bảng tin 1-1

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetListOneOneBoardOptions = {
    uid?: string;
    conversationId?: string;
    boardType?: number;
    page?: number;
    count?: number;
    lastId?: number;
    lastType?: number;
};

export type GetListOneOneBoardResponse = Record<string, unknown> | unknown[];
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

## `getTodoDetail`

Lấy chi tiết công việc trong Zalo To-Do (command 12417)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/get</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getTodoDetail(todoId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getTodoDetail(todoId: string)
```

### Tham số

- `todoId`: ID công việc

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetTodoDetailResponse = Record<string, unknown>;
```

---

## `getTodoList`

Lấy danh sách công việc trong Zalo To-Do (command 12416)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.getTodoList(options: GetTodoListOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.getTodoList(options: GetTodoListOptions = {})
```

### Tham số

- `options`: Tùy chọn lọc và phân trang danh sách công việc

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetTodoListOptions = {
    scrollId?: string;
    queries?: Record<string, unknown> | string;
    offset?: number;
    limit?: number;
    type?: number;
};

export type GetTodoListResponse = Record<string, unknown>;
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

## `multiUnpinBoardTopics`

Bỏ ghim đồng thời nhiều chủ đề khỏi bảng tin nhóm (command 12010)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/multi_unpin</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.multiUnpinBoardTopics(groupId: string, topics: unknown[], boardVersion: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.multiUnpinBoardTopics(groupId: string, topics: unknown[], boardVersion: number = 0)
```

### Tham số

- `groupId`: ID nhóm
- `topics`: Danh sách chủ đề cần bỏ ghim
- `boardVersion`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type MultiUnpinBoardTopicsResponse = Record<string, unknown>;
```

---

## `pinBoardTopic`

Ghim một chủ đề / bài đăng lên bảng tin nhóm (command 12004)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/pinv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.pinBoardTopic(groupId: string, topicId: string, type: number)
// Hoặc gọi phẳng (Flat Alias):
await api.pinBoardTopic(groupId: string, topicId: string, type: number)
```

### Tham số

- `groupId`: ID nhóm
- `topicId`: ID chủ đề cần ghim
- `type`: Loại chủ đề (ví dụ: ghi chú, bình chọn, nhắc hẹn)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PinBoardTopicResponse = Record<string, unknown>;
```

---

## `pinFriendMessage`

Ghim tin nhắn / chủ đề trong hội thoại cá nhân 1-1 (command 12067)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/friendboard/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.pinFriendMessage(conversationId: string, topic: unknown, version: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.pinFriendMessage(conversationId: string, topic: unknown, version: number = 0)
```

### Tham số

- `conversationId`: ID hội thoại 1-1
- `topic`: Thông tin tin nhắn / chủ đề cần ghim
- `version`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PinFriendMessageResponse = Record<string, unknown>;
```

---

## `removeBoardTopic`

Xóa chủ đề / ghi chú trên bảng tin nhóm (command 12143)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/topic/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.removeBoardTopic(groupId: string, topicId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeBoardTopic(groupId: string, topicId: string)
```

### Tham số

- `groupId`: ID nhóm
- `topicId`: ID chủ đề cần xóa

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveBoardTopicResponse = Record<string, unknown>;
```

---

## `removeOneOneBoardTopic`

Xóa nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12431)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.removeOneOneBoardTopic(uid: string, reminderId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeOneOneBoardTopic(uid: string, reminderId: string)
```

### Tham số

- `uid`: ID người dùng đối phương
- `reminderId`: ID nhắc hẹn cần xóa

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveOneOneBoardTopicResponse = Record<string, unknown>;
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

## `reorderFriendBoard`

Sắp xếp lại thứ tự các tin nhắn đã ghim trong hội thoại 1-1 (command 12068)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/friendboard/reorder</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.reorderFriendBoard(conversationId: string, topics: unknown[], version: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.reorderFriendBoard(conversationId: string, topics: unknown[], version: number = 0)
```

### Tham số

- `conversationId`: ID hội thoại 1-1
- `topics`: Danh sách tin nhắn đã ghim theo thứ tự mới
- `version`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReorderFriendBoardResponse = Record<string, unknown>;
```

---

## `reorderPinTopics`

Sắp xếp lại thứ tự các chủ đề đã ghim trên bảng tin nhóm (command 12002)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/pin/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.reorderPinTopics(groupId: string, topics: unknown[], boardVersion: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.reorderPinTopics(groupId: string, topics: unknown[], boardVersion: number = 0)
```

### Tham số

- `groupId`: ID nhóm
- `topics`: Danh sách chủ đề đã ghim theo thứ tự mới
- `boardVersion`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReorderPinTopicsResponse = Record<string, unknown>;
```

---

## `respondReminder`

Phản hồi tham gia hoặc từ chối lịch nhắc hẹn trong nhóm (command 12087)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/topic/updateEventResponse</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.respondReminder(groupId: string, eventId: string, type: number)
// Hoặc gọi phẳng (Flat Alias):
await api.respondReminder(groupId: string, eventId: string, type: number)
```

### Tham số

- `groupId`: ID nhóm
- `eventId`: ID sự kiện nhắc hẹn
- `type`: Loại phản hồi (`1` = Tham gia, `2` = Từ chối)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RespondReminderResponse = Record<string, unknown>;
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

## `unpinBoardTopic`

Bỏ ghim một chủ đề khỏi bảng tin nhóm (command 12005)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/unpinv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.unpinBoardTopic(groupId: string, topic: unknown, boardVersion: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.unpinBoardTopic(groupId: string, topic: unknown, boardVersion: number = 0)
```

### Tham số

- `groupId`: ID nhóm
- `topic`: Thông tin chủ đề cần bỏ ghim (hoặc `{ id, type }`)
- `boardVersion`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UnpinBoardTopicResponse = Record<string, unknown>;
```

---

## `unpinFriendMessages`

Bỏ ghim một hoặc nhiều tin nhắn trong hội thoại 1-1 (command 12069)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/friendboard/multi_unpin</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.unpinFriendMessages(conversationId: string, topics: unknown[], version: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.unpinFriendMessages(conversationId: string, topics: unknown[], version: number = 0)
```

### Tham số

- `conversationId`: ID hội thoại 1-1
- `topics`: Danh sách tin nhắn / chủ đề cần bỏ ghim
- `version`: Phiên bản bảng ghim hiện tại (mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UnpinFriendMessagesResponse = Record<string, unknown>;
```

---

## `updateOneOneBoardTopic`

Cập nhật nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12430)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/oneone/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.updateOneOneBoardTopic(objectData: UpdateOneOneBoardTopicOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.updateOneOneBoardTopic(objectData: UpdateOneOneBoardTopicOptions)
```

### Tham số

- `objectData`: Dữ liệu chủ đề / nhắc hẹn 1-1 cần cập nhật

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateOneOneBoardTopicOptions = {
    toUid: string;
    reminderId: string;
    title?: string;
    emoji?: string;
    startTime?: number;
    repeat?: number;
    color?: number;
    [key: string]: unknown;
};

export type UpdateOneOneBoardTopicResponse = Record<string, unknown>;
```

---

## `updateTodo`

Cập nhật nội dung công việc trong Zalo To-Do (command 12414)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/todo/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.updateTodo(options: UpdateTodoOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.updateTodo(options: UpdateTodoOptions)
```

### Tham số

- `options`: Thông tin công việc cần cập nhật

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateTodoOptions = {
    id: string;
    title?: string;
    content?: string;
    assignees?: string[];
    watchers?: string[];
    dueDate?: number;
    dateDefaultType?: number;
    status?: number;
    schedule?: unknown;
    [key: string]: unknown;
};

export type UpdateTodoResponse = Record<string, unknown>;
```

---

## `updateTodoStatus`

Cập nhật trạng thái công việc trong Zalo To-Do (command 12418)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/todo/status</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.updateTodoStatus(todoId: string, status: number)
// Hoặc gọi phẳng (Flat Alias):
await api.updateTodoStatus(todoId: string, status: number)
```

### Tham số

- `todoId`: ID công việc
- `status`: Trạng thái mới (ví dụ: đang thực hiện, hoàn thành)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateTodoStatusResponse = Record<string, unknown>;
```

---

## `verifyTodo`

Kiểm tra tính đồng bộ của danh sách công việc trong Zalo To-Do (command 12603)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.board</span><span class="zca-endpoint-pill">/api/board/personal/todo/verify</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.board.verifyTodo(scrollId: string = "", lastUpdatedTime: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.verifyTodo(scrollId: string = "", lastUpdatedTime: number = 0)
```

### Tham số

- `scrollId`: Mã cuộn hiện tại
- `lastUpdatedTime`: Thời điểm cập nhật cuối cùng

### Kiểu dữ liệu (TypeScript Types)

```ts
export type VerifyTodoResponse = Record<string, unknown>;
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
