# Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board)

> Namespace: `api.board` (hoặc gọi trực tiếp `api.<methodName>`) — **16 API**

Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls) và Lịch hẹn (Reminders).

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`addPollOptions`](#addpolloptions) | `GET` | `/api/poll/option/add` | Add new option to poll |
| [`createNote`](#createnote) | `POST` | `/api/board/topic/createv2` | Create a note in a group |
| [`createPoll`](#createpoll) | `POST` | `/api/poll/create` | Create a poll in a group. |
| [`createReminder`](#createreminder) | `POST` | `/api/board/oneone/create`<br/>`/api/board/topic/createv2` | Create a reminder in a group |
| [`editNote`](#editnote) | `POST` | `/api/board/topic/updatev2` | Edit an existing note in a group |
| [`editReminder`](#editreminder) | `POST` | `/api/board/oneone/update`<br/>`/api/board/topic/updatev2` | Edit an existing reminder |
| [`getListBoard`](#getlistboard) | `GET` | `/api/board/list` | Get list board items in a group |
| [`getListPinTopics`](#getlistpintopics) | `GET` | `/api/board/pin/list` | Lấy danh sách chủ đề / tin nhắn đã ghim trong bảng tin nhóm (command 12001) |
| [`getListReminder`](#getlistreminder) | `GET` | `/api/board/oneone/list`<br/>`/api/board/listReminder` | Get list reminder |
| [`getPollDetail`](#getpolldetail) | `POST` | `/api/poll/detail` | Get poll detail |
| [`getReminder`](#getreminder) | `GET` | `/api/board/topic/getReminder` | Get reminder details from a group |
| [`getReminderResponses`](#getreminderresponses) | `GET` | `/api/board/topic/listResponseEvent` | Get reminder responses |
| [`lockPoll`](#lockpoll) | `POST` | `/api/poll/end` | Lock a poll, preventing further votes. |
| [`removeReminder`](#removereminder) | `POST` | `/api/board/oneone/remove`<br/>`/api/board/topic/remove` | Remove a reminder in a (user/group) |
| [`sharePoll`](#sharepoll) | `POST` | `/api/poll/share` | Share a poll |
| [`votePoll`](#votepoll) | `GET` | `/api/poll/vote` | Vote on a poll |

---

## `addPollOptions`

Add new option to poll

- **Endpoint**: `GET /api/poll/option/add`
- **Domain call**: `api.board.addPollOptions(payload: AddPollOptionsPayload)`
- **Alias phẳng**: `api.addPollOptions(payload: AddPollOptionsPayload)`

### Tham số

- `payload`: 

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

Create a note in a group

- **Endpoint**: `POST /api/board/topic/createv2`
- **Domain call**: `api.board.createNote(options: CreateNoteOptions, groupId: string)`
- **Alias phẳng**: `api.createNote(options: CreateNoteOptions, groupId: string)`

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

Create a poll in a group.

- **Endpoint**: `POST /api/poll/create`
- **Domain call**: `api.board.createPoll(options: CreatePollOptions, groupId: string)`
- **Alias phẳng**: `api.createPoll(options: CreatePollOptions, groupId: string)`

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

Create a reminder in a group

- **Endpoint**: `POST /api/board/oneone/create`, `POST /api/board/topic/createv2`
- **Domain call**: `api.board.createReminder(options: CreateReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.createReminder(options: CreateReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)`

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

Edit an existing note in a group

- **Endpoint**: `POST /api/board/topic/updatev2`
- **Domain call**: `api.board.editNote(options: EditNoteOptions, groupId: string)`
- **Alias phẳng**: `api.editNote(options: EditNoteOptions, groupId: string)`

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

Edit an existing reminder

- **Endpoint**: `POST /api/board/oneone/update`, `POST /api/board/topic/updatev2`
- **Domain call**: `api.board.editReminder(options: EditReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.editReminder(options: EditReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)`

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

Get list board items in a group

- **Endpoint**: `GET /api/board/list`
- **Domain call**: `api.board.getListBoard(options: ListBoardOptions, groupId: string)`
- **Alias phẳng**: `api.getListBoard(options: ListBoardOptions, groupId: string)`

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

- **Endpoint**: `GET /api/board/pin/list`
- **Domain call**: `api.board.getListPinTopics(groupId: string, boardVersion: number = 0)`
- **Alias phẳng**: `api.getListPinTopics(groupId: string, boardVersion: number = 0)`

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

Get list reminder

- **Endpoint**: `GET /api/board/oneone/list`, `GET /api/board/listReminder`
- **Domain call**: `api.board.getListReminder(options: ListReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.getListReminder(options: ListReminderOptions, threadId: string, type: ThreadType = ThreadType.User,)`

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

Get poll detail

- **Endpoint**: `POST /api/poll/detail`
- **Domain call**: `api.board.getPollDetail(pollId: number)`
- **Alias phẳng**: `api.getPollDetail(pollId: number)`

### Tham số

- `pollId`: Poll ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PollDetailResponse = PollDetail;
```

---

## `getReminder`

Get reminder details from a group

- **Endpoint**: `GET /api/board/topic/getReminder`
- **Domain call**: `api.board.getReminder(reminderId: string)`
- **Alias phẳng**: `api.getReminder(reminderId: string)`

### Tham số

- `reminderId`: Reminder ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetReminderResponse = ReminderGroup;
```

---

## `getReminderResponses`

Get reminder responses

- **Endpoint**: `GET /api/board/topic/listResponseEvent`
- **Domain call**: `api.board.getReminderResponses(reminderId: string)`
- **Alias phẳng**: `api.getReminderResponses(reminderId: string)`

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

Lock a poll, preventing further votes.

- **Endpoint**: `POST /api/poll/end`
- **Domain call**: `api.board.lockPoll(pollId: number)`
- **Alias phẳng**: `api.lockPoll(pollId: number)`

### Tham số

- `pollId`: Poll id to lock

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LockPollResponse = "";
```

---

## `removeReminder`

Remove a reminder in a (user/group)

- **Endpoint**: `POST /api/board/oneone/remove`, `POST /api/board/topic/remove`
- **Domain call**: `api.board.removeReminder(reminderId: string, threadId: string, type: ThreadType = ThreadType.User)`
- **Alias phẳng**: `api.removeReminder(reminderId: string, threadId: string, type: ThreadType = ThreadType.User)`

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

Share a poll

- **Endpoint**: `POST /api/poll/share`
- **Domain call**: `api.board.sharePoll(pollId: number)`
- **Alias phẳng**: `api.sharePoll(pollId: number)`

### Tham số

- `pollId`: poll id to share

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SharePollResponse = "";
```

---

## `votePoll`

Vote on a poll

- **Endpoint**: `GET /api/poll/vote`
- **Domain call**: `api.board.votePoll(pollId: number, optionId: number | number[])`
- **Alias phẳng**: `api.votePoll(pollId: number, optionId: number | number[])`

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
