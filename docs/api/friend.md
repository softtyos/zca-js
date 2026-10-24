# Bạn bè & Danh bạ (Friend)

> Namespace: `api.friend` (hoặc gọi trực tiếp `api.<methodName>`) — **33 API**

Quản lý danh sách bạn bè, lời mời kết bạn, gợi ý kết bạn, biệt danh (alias), chặn và kiểm tra trạng thái hoạt động PC/Web.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`acceptFriendRequest`](#acceptfriendrequest) | `POST` | `/api/friend/accept` | Accept a friend request from a User |
| [`blockUser`](#blockuser) | `POST` | `/api/friend/block` | Block a User |
| [`blockViewFeed`](#blockviewfeed) | `POST` | `/api/friend/feed/block` | Block/Unblock friend view feed by ID |
| [`changeFriendAlias`](#changefriendalias) | `GET` | `/api/alias/update` | Change friend's alias |
| [`clearUnreadFriendRequests`](#clearunreadfriendrequests) | `POST` | `/api/friend/recommendsv2/read-requests` | Đánh dấu đã xem danh sách lời mời kết bạn chưa đọc (command 12232) |
| [`findUser`](#finduser) | `GET` | `/api/friend/profile/get` | Find user by phone number |
| [`findUserByUsername`](#finduserbyusername) | `GET` | `/api/friend/search/by-user-name` | Find user by username |
| [`getAliasList`](#getaliaslist) | `GET` | `/api/alias/list` | Get alias list |
| [`getAliasListV2`](#getaliaslistv2) | `GET` | `/api/alias/list/v2` | Lấy danh sách tên gợi nhớ (Alias) của bạn bè chuẩn V2 có hỗ trợ phân trang (command 12205) |
| [`getAllFriends`](#getallfriends) | `GET` | `/api/social/friend/getfriends` | Get all friends |
| [`getBlockFriends`](#getblockfriends) | `GET` | `/api/friend/blocklistv2` | Lấy danh sách người dùng đang bị chặn chuẩn V2 (command 11429) |
| [`getCloseFriends`](#getclosefriends) | `GET` | `/api/social/friend/getclosedfriends` | Get close friends |
| [`getExtraFriendInfo`](#getextrafriendinfo) | `POST` | `/api/friend/context/multiget` | Lấy ngữ cảnh và vai trò mở rộng (ví dụ `role: ["boss"]`) của danh sách bạn bè (command 11442) |
| [`getFriendBoardList`](#getfriendboardlist) | `GET` | `/api/friendboard/list` | Get friend board list |
| [`getFriendOnlines`](#getfriendonlines) | `GET` | `/api/social/friend/onlines` | Get friend onlines? |
| [`getFriendProfilesV2`](#getfriendprofilesv2) | `POST` | `/api/social/friend/getprofiles/v2` | Lấy hàng loạt hồ sơ chi tiết của danh sách bạn bè kèm trạng thái online qua `/api/social/friend/getprofiles/v2` (command 11140) |
| [`getFriendRecommendations`](#getfriendrecommendations) | `GET` | `/api/friend/recommendsv2/list` | Get friend recommendations/received friend requests |
| [`getFriendRequestStatus`](#getfriendrequeststatus) | `GET` | `/api/friend/reqstatus` | Get friend request status |
| [`getFriendsActivePCWeb`](#getfriendsactivepcweb) | `GET` | `/api/social/friend/active-pcweb` | Lấy danh sách bạn bè đang hoạt động trên Zalo PC / Web qua `/api/social/friend/active-pcweb` (command 12072) |
| [`getFriendsEmojiStatus`](#getfriendsemojistatus) | `GET` | `/api/v1/emoji-status/friends` | Lấy danh sách trạng thái Emoji (Emoji Status) hiện tại của bạn bè (command 16301) |
| [`getLastReadContactTab`](#getlastreadcontacttab) | `GET` | `/api/friend/last-read-contact-tab` | Lấy dấu thời gian lần cuối đọc tab Danh bạ (command 12230) |
| [`getMultiUsersByPhones`](#getmultiusersbyphones) | `GET` | `/api/friend/profile/multiget` | Get multiple user(s) by their phone numbers. |
| [`getPhonebookV2`](#getphonebookv2) | `GET` | `/api/social/friend/phonebook/v2` | Lấy danh bạ bạn bè đồng bộ từ số điện thoại chuẩn V2 (command 12428) |
| [`getSentFriendRequest`](#getsentfriendrequest) | `GET` | `/api/friend/requested/list` | Get friend requested |
| [`lastOnline`](#lastonline) | `GET` | `/api/social/profile/lastOnline` | Get last online |
| [`readContactTab`](#readcontacttab) | `POST` | `/api/friend/read-contact-tab` | Đánh dấu đã đọc tab Danh bạ (command 12231) |
| [`rejectFriendRequest`](#rejectfriendrequest) | `POST` | `/api/friend/reject` | Reject a friend request from a User |
| [`removeFriend`](#removefriend) | `POST` | `/api/friend/remove` | Remove friend |
| [`removeFriendAlias`](#removefriendalias) | `GET` | `/api/alias/remove` | Remove friend's alias |
| [`sendFriendRequest`](#sendfriendrequest) | `POST` | `/api/friend/sendreq` | Send a friend request to a user. 215 if the user might have blocked you, 222 if user has already sent you a friend request, your request will be treated as acceptance instead. |
| [`unblockUser`](#unblockuser) | `POST` | `/api/friend/unblock` | Unblock a User |
| [`undoFriendRequest`](#undofriendrequest) | `POST` | `/api/friend/undo` | Undo send a friend request to a user. |
| [`verifyFriend`](#verifyfriend) | `POST` | `/api/social/friend/verify` | Kiểm tra và xác thực danh sách bạn bè qua `/api/social/friend/verify` (command 11138) |

---

## `acceptFriendRequest`

Accept a friend request from a User

- **Endpoint**: `POST /api/friend/accept`
- **Domain call**: `api.friend.acceptFriendRequest(friendId: string)`
- **Alias phẳng**: `api.acceptFriendRequest(friendId: string)`

### Tham số

- `friendId`: The friend ID to user request is accept

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AcceptFriendRequestResponse = "";
```

---

## `blockUser`

Block a User

- **Endpoint**: `POST /api/friend/block`
- **Domain call**: `api.friend.blockUser(userId: string)`
- **Alias phẳng**: `api.blockUser(userId: string)`

### Tham số

- `userId`: The ID of the User to block

### Kiểu dữ liệu (TypeScript Types)

```ts
export type BlockUserResponse = "";
```

---

## `blockViewFeed`

Block/Unblock friend view feed by ID

- **Endpoint**: `POST /api/friend/feed/block`
- **Domain call**: `api.friend.blockViewFeed(isBlockFeed: boolean, userId: string)`
- **Alias phẳng**: `api.blockViewFeed(isBlockFeed: boolean, userId: string)`

### Tham số

- `isBlockFeed`: Boolean to block/unblock view feed
- `userId`: User ID to block/unblock view feed

### Kiểu dữ liệu (TypeScript Types)

```ts
export type BlockViewFeedResponse = "";
```

---

## `changeFriendAlias`

Change friend's alias

- **Endpoint**: `GET /api/alias/update`
- **Domain call**: `api.friend.changeFriendAlias(alias: string, friendId: string)`
- **Alias phẳng**: `api.changeFriendAlias(alias: string, friendId: string)`

### Tham số

- `alias`: new alias (nickname - bietdanh)
- `friendId`: friend id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeFriendAliasResponse = "";
```

---

## `clearUnreadFriendRequests`

Đánh dấu đã xem danh sách lời mời kết bạn chưa đọc (command 12232)

- **Endpoint**: `POST /api/friend/recommendsv2/read-requests`
- **Domain call**: `api.friend.clearUnreadFriendRequests(uidsSeen: string[] = [])`
- **Alias phẳng**: `api.clearUnreadFriendRequests(uidsSeen: string[] = [])`

### Tham số

- `uidsSeen`: Danh sách UID đã xem lời mời kết bạn (mặc định `[]`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ClearUnreadFriendRequestsResponse = Record<string, unknown> | string;
```

---

## `findUser`

Find user by phone number

- **Endpoint**: `GET /api/friend/profile/get`
- **Domain call**: `api.friend.findUser(phoneNumber: string, avatarSize: AvatarSize = AvatarSize.Large)`
- **Alias phẳng**: `api.findUser(phoneNumber: string, avatarSize: AvatarSize = AvatarSize.Large)`

### Tham số

- `phoneNumber`: Phone number
- `avatarSize`: Avatar size (default: AvatarSize.Large)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FindUserResponse = UserBasic;
```

---

## `findUserByUsername`

Find user by username

- **Endpoint**: `GET /api/friend/search/by-user-name`
- **Domain call**: `api.friend.findUserByUsername(username: string, avatarSize: AvatarSize = AvatarSize.Large)`
- **Alias phẳng**: `api.findUserByUsername(username: string, avatarSize: AvatarSize = AvatarSize.Large)`

### Tham số

- `username`: username for find
- `avatarSize`: Avatar size (default: AvatarSize.Large)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FindUserByUsernameResponse = UserBasic;
```

---

## `getAliasList`

Get alias list

- **Endpoint**: `GET /api/alias/list`
- **Domain call**: `api.friend.getAliasList(count: number = 100, page: number = 1)`
- **Alias phẳng**: `api.getAliasList(count: number = 100, page: number = 1)`

### Tham số

- `count`: Page size (default: 100)
- `page`: Page number (default: 1)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAliasListResponse = {
    items: {
        userId: string;
        alias: string;
    }[];
    updateTime: string;
};
```

---

## `getAliasListV2`

Lấy danh sách tên gợi nhớ (Alias) của bạn bè chuẩn V2 có hỗ trợ phân trang (command 12205)

- **Endpoint**: `GET /api/alias/list/v2`
- **Domain call**: `api.friend.getAliasListV2(page: number = 1, count: number = 100)`
- **Alias phẳng**: `api.getAliasListV2(page: number = 1, count: number = 100)`

### Tham số

- `page`: Trang cần lấy (mặc định: 1)
- `count`: Số lượng mục mỗi trang (mặc định: 100)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AliasItemV2 = {
    userId: string;
    alias: string;
};

export type GetAliasListV2Response = {
    items: AliasItemV2[];
    updateTime?: string;
    [key: string]: unknown;
};
```

---

## `getAllFriends`

Get all friends

- **Endpoint**: `GET /api/social/friend/getfriends`
- **Domain call**: `api.friend.getAllFriends(count: number = 20000, page: number = 1, avatarSize: AvatarSize = AvatarSize.Small)`
- **Alias phẳng**: `api.getAllFriends(count: number = 20000, page: number = 1, avatarSize: AvatarSize = AvatarSize.Small)`

### Tham số

- `count`: Page size (default: 20000)
- `page`: Page number (default: 1)
- `avatarSize`: Avatar size (default: AvatarSize.Small)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAllFriendsResponse = User[];
```

---

## `getBlockFriends`

Lấy danh sách người dùng đang bị chặn chuẩn V2 (command 11429)

- **Endpoint**: `GET /api/friend/blocklistv2`
- **Domain call**: `api.friend.getBlockFriends(page: number = 1, count: number = 50, avatarSize: number = 120)`
- **Alias phẳng**: `api.getBlockFriends(page: number = 1, count: number = 50, avatarSize: number = 120)`

### Tham số

- `page`: Trang cần lấy (mặc định: 1)
- `count`: Số lượng mỗi trang (mặc định: 50)
- `avatarSize`: Kích thước ảnh đại diện (mặc định: 120)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetBlockFriendsResponse = {
    profiles: Record<string, unknown>[];
    version: number;
    hasMore: number;
};
```

---

## `getCloseFriends`

Get close friends

- **Endpoint**: `GET /api/social/friend/getclosedfriends`
- **Domain call**: `api.friend.getCloseFriends()`
- **Alias phẳng**: `api.getCloseFriends()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloseFriendsResponse = User[];
```

---

## `getExtraFriendInfo`

Lấy ngữ cảnh và vai trò mở rộng (ví dụ `role: ["boss"]`) của danh sách bạn bè (command 11442)

- **Endpoint**: `POST /api/friend/context/multiget`
- **Domain call**: `api.friend.getExtraFriendInfo(friendIds: string[])`
- **Alias phẳng**: `api.getExtraFriendInfo(friendIds: string[])`

### Tham số

- `friendIds`: Mảng UID cần truy vấn

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetExtraFriendInfoResponse = Record<string, ExtraContextInfo>;
```

---

## `getFriendBoardList`

Get friend board list

- **Endpoint**: `GET /api/friendboard/list`
- **Domain call**: `api.friend.getFriendBoardList(conversationId: string)`
- **Alias phẳng**: `api.getFriendBoardList(conversationId: string)`

### Tham số

- `conversationId`: conversation id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFriendBoardListResponse = {
    data: string[];
    version: number;
};
```

---

## `getFriendOnlines`

Get friend onlines?

- **Endpoint**: `GET /api/social/friend/onlines`
- **Domain call**: `api.friend.getFriendOnlines()`
- **Alias phẳng**: `api.getFriendOnlines()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFriendOnlinesStatus = {
    userId: string;
    status: string;
};

export type GetFriendOnlinesResponse = {
    predefine: string[];
    ownerStatus: string;
    onlines: GetFriendOnlinesStatus[];
};
```

---

## `getFriendProfilesV2`

Lấy hàng loạt hồ sơ chi tiết của danh sách bạn bè kèm trạng thái online qua `/api/social/friend/getprofiles/v2` (command 11140)

- **Endpoint**: `POST /api/social/friend/getprofiles/v2`
- **Domain call**: `api.friend.getFriendProfilesV2(friendIds: string | string[], options: GetFriendProfilesV2Options = {},)`
- **Alias phẳng**: `api.getFriendProfilesV2(friendIds: string | string[], options: GetFriendProfilesV2Options = {},)`

### Tham số

- `friendIds`: Mảng UID cần lấy hồ sơ (có thể kèm hậu tố `_version` hoặc truyền UID thuần)
- `options`: Tùy chọn truy vấn

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFriendProfilesV2Options = {
    /**
     * Phiên bản danh bạ (mặc định: `0`).
     */
    phonebookVersion?: number;
    /**
     * Kích thước ảnh đại diện (mặc định: `120`).
     */
    avatarSize?: number;
    /**
     * Ngôn ngữ (mặc định: `"vi"`).
     */
    language?: string;
    /**
     * Trả kèm trạng thái online của bạn bè (mặc định: `true`).
     */
    showOnlineStatus?: boolean;
};

export type GetFriendProfilesV2Response = {
    profiles: Record<string, GroupMemberProfile>;
    unchangeds_profile?: string[];
    phonebook_version?: number;
    [key: string]: unknown;
};
```

---

## `getFriendRecommendations`

Get friend recommendations/received friend requests

- **Endpoint**: `GET /api/friend/recommendsv2/list`
- **Domain call**: `api.friend.getFriendRecommendations()`
- **Alias phẳng**: `api.getFriendRecommendations()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export enum FriendRecommendationsType {
    RecommendedFriend = 1,
    ReceivedFriendRequest = 2,
}

export type FriendRecommendationsCollapseMsgListConfig = {
    collapseId: number;
    collapseXItem: number;
    collapseYItem: number;
};

export type FriendRecommendationsDataInfo = {
    userId: string;
    zaloName: string;
    displayName: string;
    avatar: string;
    phoneNumber: string;
    status: string;
    gender: Gender;
    dob: number;
    type: number;
    recommType: FriendRecommendationsType;
    recommSrc: number;
    recommTime: number;
    recommInfo: {
        suggestWay: number;
        source: number;
        message: string;
        customText: string | null;
    };
    bizPkg: ZBusinessPackage;
    isSeenFriendReq: boolean;
};

export type FriendRecommendationsRecommItem = {
    recommItemType: number;
    dataInfo: FriendRecommendationsDataInfo;
};

export type GetFriendRecommendationsResponse = {
    expiredDuration: number;
    collapseMsgListConfig: FriendRecommendationsCollapseMsgListConfig;
    recommItems: FriendRecommendationsRecommItem[];
};
```

---

## `getFriendRequestStatus`

Get friend request status

- **Endpoint**: `GET /api/friend/reqstatus`
- **Domain call**: `api.friend.getFriendRequestStatus(friendId: string)`
- **Alias phẳng**: `api.getFriendRequestStatus(friendId: string)`

### Tham số

- `friendId`: friend id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFriendRequestStatusResponse = {
    addFriendPrivacy: number;
    isSeenFriendReq: boolean;
    is_friend: number;
    is_requested: number;
    is_requesting: number;
};
```

---

## `getFriendsActivePCWeb`

Lấy danh sách bạn bè đang hoạt động trên Zalo PC / Web qua `/api/social/friend/active-pcweb` (command 12072)

- **Endpoint**: `GET /api/social/friend/active-pcweb`
- **Domain call**: `api.friend.getFriendsActivePCWeb()`
- **Alias phẳng**: `api.getFriendsActivePCWeb()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFriendsActivePCWebResponse = {
    uids?: string[];
    activeUsers?: unknown[];
    [key: string]: unknown;
};
```

---

## `getFriendsEmojiStatus`

Lấy danh sách trạng thái Emoji (Emoji Status) hiện tại của bạn bè (command 16301)

- **Endpoint**: `GET /api/v1/emoji-status/friends`
- **Domain call**: `api.friend.getFriendsEmojiStatus(options: GetFriendsEmojiStatusOptions = {})`
- **Alias phẳng**: `api.getFriendsEmojiStatus(options: GetFriendsEmojiStatusOptions = {})`

### Tham số

- `options`: Tùy chọn phân trang (`version`, `fromUid`, `maxEmojiStatusId`, `page`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFriendsEmojiStatusOptions = {
    version?: number;
    fromUid?: string;
    maxEmojiStatusId?: string | number;
    page?: number;
};

export type GetFriendsEmojiStatusResponse = {
    expireTime: number;
    emojiStatuses: Record<string, unknown>[];
    version: number;
    type: number;
    maxEmojiStatusId: number;
    loadMore: boolean;
    lastUid: string;
    page: number;
};
```

---

## `getLastReadContactTab`

Lấy dấu thời gian lần cuối đọc tab Danh bạ (command 12230)

- **Endpoint**: `GET /api/friend/last-read-contact-tab`
- **Domain call**: `api.friend.getLastReadContactTab()`
- **Alias phẳng**: `api.getLastReadContactTab()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetLastReadContactTabResponse = {
    ts: number;
};
```

---

## `getMultiUsersByPhones`

Get multiple user(s) by their phone numbers.

- **Endpoint**: `GET /api/friend/profile/multiget`
- **Domain call**: `api.friend.getMultiUsersByPhones(phoneNumbers: string | string[], avatarSize: AvatarSize = AvatarSize.Large)`
- **Alias phẳng**: `api.getMultiUsersByPhones(phoneNumbers: string | string[], avatarSize: AvatarSize = AvatarSize.Large)`

### Tham số

- `phoneNumbers`: Phone number(s)
- `avatarSize`: Avatar size (default: AvatarSize.Large)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetMultiUsersByPhonesResponse = {
    [phoneNumber: string]: UserBasic;
};
```

---

## `getPhonebookV2`

Lấy danh bạ bạn bè đồng bộ từ số điện thoại chuẩn V2 (command 12428)

- **Endpoint**: `GET /api/social/friend/phonebook/v2`
- **Domain call**: `api.friend.getPhonebookV2(phonebookVersion: number = 0)`
- **Alias phẳng**: `api.getPhonebookV2(phonebookVersion: number = 0)`

### Tham số

- `phonebookVersion`: Phiên bản danh bạ (mặc định: 0 để lấy toàn bộ)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetPhonebookV2Response = {
    phonebook: Record<string, string>;
    version?: number;
    [key: string]: unknown;
};
```

---

## `getSentFriendRequest`

Get friend requested

- **Endpoint**: `GET /api/friend/requested/list`
- **Domain call**: `api.friend.getSentFriendRequest()`
- **Alias phẳng**: `api.getSentFriendRequest()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SentFriendRequestInfo = {
    userId: string;
    zaloName: string;
    displayName: string;
    avatar: string;
    globalId: string;
    bizPkg: ZBusinessPackage;
    fReqInfo: {
        message: string;
        src: number;
        time: number;
    };
};

export type GetSentFriendRequestResponse = {
    [userId: string]: SentFriendRequestInfo;
};
```

---

## `lastOnline`

Get last online

- **Endpoint**: `GET /api/social/profile/lastOnline`
- **Domain call**: `api.friend.lastOnline(uid: string)`
- **Alias phẳng**: `api.lastOnline(uid: string)`

### Tham số

- `uid`: User ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LastOnlineResponse = {
    settings: {
        show_online_status: boolean;
    };
    lastOnline: number;
};
```

---

## `readContactTab`

Đánh dấu đã đọc tab Danh bạ (command 12231)

- **Endpoint**: `POST /api/friend/read-contact-tab`
- **Domain call**: `api.friend.readContactTab(ts: number = Date.now())`
- **Alias phẳng**: `api.readContactTab(ts: number = Date.now())`

### Tham số

- `ts`: Dấu thời gian (mặc định: `Date.now()`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReadContactTabResponse = Record<string, unknown> | string;
```

---

## `rejectFriendRequest`

Reject a friend request from a User

- **Endpoint**: `POST /api/friend/reject`
- **Domain call**: `api.friend.rejectFriendRequest(friendId: string)`
- **Alias phẳng**: `api.rejectFriendRequest(friendId: string)`

### Tham số

- `friendId`: 

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RejectFriendRequestResponse = "";
```

---

## `removeFriend`

Remove friend

- **Endpoint**: `POST /api/friend/remove`
- **Domain call**: `api.friend.removeFriend(friendId: string)`
- **Alias phẳng**: `api.removeFriend(friendId: string)`

### Tham số

- `friendId`: - ID of the friend to remove

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveFriendResponse = "";
```

---

## `removeFriendAlias`

Remove friend's alias

- **Endpoint**: `GET /api/alias/remove`
- **Domain call**: `api.friend.removeFriendAlias(friendId: string)`
- **Alias phẳng**: `api.removeFriendAlias(friendId: string)`

### Tham số

- `friendId`: friend id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveFriendAliasResponse = "";
```

---

## `sendFriendRequest`

Send a friend request to a user. 215 if the user might have blocked you, 222 if user has already sent you a friend request, your request will be treated as acceptance instead.

- **Endpoint**: `POST /api/friend/sendreq`
- **Domain call**: `api.friend.sendFriendRequest(msg: string, userId: string)`
- **Alias phẳng**: `api.sendFriendRequest(msg: string, userId: string)`

### Tham số

- `msg`: message sent with friend request
- `userId`: User ID to send friend request to

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendFriendRequestResponse = "";
```

---

## `unblockUser`

Unblock a User

- **Endpoint**: `POST /api/friend/unblock`
- **Domain call**: `api.friend.unblockUser(userId: string)`
- **Alias phẳng**: `api.unblockUser(userId: string)`

### Tham số

- `userId`: The ID of the User to unblock

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UnBlockUserResponse = "";
```

---

## `undoFriendRequest`

Undo send a friend request to a user.

- **Endpoint**: `POST /api/friend/undo`
- **Domain call**: `api.friend.undoFriendRequest(friendId: string)`
- **Alias phẳng**: `api.undoFriendRequest(friendId: string)`

### Tham số

- `options`: 

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UndoFriendRequestResponse = "";
```

---

## `verifyFriend`

Kiểm tra và xác thực danh sách bạn bè qua `/api/social/friend/verify` (command 11138)

- **Endpoint**: `POST /api/social/friend/verify`
- **Domain call**: `api.friend.verifyFriend(friendIds: string | string[], options: VerifyFriendOptions = {})`
- **Alias phẳng**: `api.verifyFriend(friendIds: string | string[], options: VerifyFriendOptions = {})`

### Tham số

- `friendIds`: Danh sách UID bạn bè cần xác thực
- `options`: Tùy chọn truy vấn

### Kiểu dữ liệu (TypeScript Types)

```ts
export type VerifyFriendOptions = {
    phonebookVersion?: number;
    avatarSize?: number;
    language?: string;
};

export type VerifyFriendResponse = {
    profiles?: Record<string, unknown>;
    unchangeds_profile?: string[];
    [key: string]: unknown;
};
```

---
