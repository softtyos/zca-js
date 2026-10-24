---
title: "Bạn bè & Danh bạ (Friend) (api.friend) - 33 APIs"
description: "Quản lý danh sách bạn bè, lời mời kết bạn, gợi ý kết bạn, biệt danh (alias), chặn và kiểm tra trạng thái hoạt động PC/Web. Tra cứu chi tiết 33 phương thức thuộc phân hệ api.friend trong bộ SDK @softtynet/zca-js."
---

# 🤝 Bạn bè & Danh bạ (Friend)

> Namespace: `api.friend` (hoặc gọi trực tiếp `api.<methodName>`) — **33 API nguyên bản**

Quản lý danh sách bạn bè, lời mời kết bạn, gợi ý kết bạn, biệt danh (alias), chặn và kiểm tra trạng thái hoạt động PC/Web.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`acceptFriendRequest`](#acceptfriendrequest) | `POST` | `/api/friend/accept` | Đồng ý lời mời kết bạn từ một người dùng. |
| [`blockUser`](#blockuser) | `POST` | `/api/friend/block` | Chặn tin nhắn từ một người dùng theo UID. |
| [`blockViewFeed`](#blockviewfeed) | `POST` | `/api/friend/feed/block` | Chặn hoặc mở chặn quyền xem Nhật ký (Timeline Feed) đối với một người bạn. |
| [`changeFriendAlias`](#changefriendalias) | `GET` | `/api/alias/update` | Đặt hoặc đổi tên gợi nhớ (Biệt danh / Alias) cho bạn bè. |
| [`clearUnreadFriendRequests`](#clearunreadfriendrequests) | `POST` | `/api/friend/recommendsv2/read-requests` | Đánh dấu đã xem danh sách lời mời kết bạn chưa đọc (command 12232) |
| [`findUser`](#finduser) | `GET` | `/api/friend/profile/get` | Tìm kiếm thông tin tài khoản Zalo thông qua số điện thoại. |
| [`findUserByUsername`](#finduserbyusername) | `GET` | `/api/friend/search/by-user-name` | Tìm kiếm thông tin tài khoản Zalo thông qua Username. |
| [`getAliasList`](#getaliaslist) | `GET` | `/api/alias/list` | Lấy danh sách toàn bộ tên gợi nhớ (Alias) đã đặt cho bạn bè. |
| [`getAliasListV2`](#getaliaslistv2) | `GET` | `/api/alias/list/v2` | Lấy danh sách tên gợi nhớ (Alias) của bạn bè chuẩn V2 có hỗ trợ phân trang (command 12205) |
| [`getAllFriends`](#getallfriends) | `GET` | `/api/social/friend/getfriends` | Lấy toàn bộ danh sách bạn bè trong danh bạ tài khoản hiện tại. |
| [`getBlockFriends`](#getblockfriends) | `GET` | `/api/friend/blocklistv2` | Lấy danh sách người dùng đang bị chặn chuẩn V2 (command 11429) |
| [`getCloseFriends`](#getclosefriends) | `GET` | `/api/social/friend/getclosedfriends` | Lấy danh sách bạn thân (Close Friends). |
| [`getExtraFriendInfo`](#getextrafriendinfo) | `POST` | `/api/friend/context/multiget` | Lấy ngữ cảnh và vai trò mở rộng (ví dụ `role: ["boss"]`) của danh sách bạn bè (command 11442) |
| [`getFriendBoardList`](#getfriendboardlist) | `GET` | `/api/friendboard/list` | Lấy thông tin bảng tin chung với một người bạn. |
| [`getFriendOnlines`](#getfriendonlines) | `GET` | `/api/social/friend/onlines` | Lấy danh sách bạn bè đang trực tuyến (Online) kèm trạng thái thiết bị. |
| [`getFriendProfilesV2`](#getfriendprofilesv2) | `POST` | `/api/social/friend/getprofiles/v2` | Lấy hàng loạt hồ sơ chi tiết của danh sách bạn bè kèm trạng thái online qua `/api/social/friend/getprofiles/v2` (command 11140) |
| [`getFriendRecommendations`](#getfriendrecommendations) | `GET` | `/api/friend/recommendsv2/list` | Lấy danh sách gợi ý kết bạn và lời mời kết bạn đã nhận. |
| [`getFriendRequestStatus`](#getfriendrequeststatus) | `GET` | `/api/friend/reqstatus` | Kiểm tra trạng thái quan hệ bạn bè và lời mời kết bạn với một UID. |
| [`getFriendsActivePCWeb`](#getfriendsactivepcweb) | `GET` | `/api/social/friend/active-pcweb` | Lấy danh sách bạn bè đang hoạt động trên Zalo PC / Web qua `/api/social/friend/active-pcweb` (command 12072) |
| [`getFriendsEmojiStatus`](#getfriendsemojistatus) | `GET` | `/api/v1/emoji-status/friends` | Lấy danh sách trạng thái Emoji (Emoji Status) hiện tại của bạn bè (command 16301) |
| [`getLastReadContactTab`](#getlastreadcontacttab) | `GET` | `/api/friend/last-read-contact-tab` | Lấy dấu thời gian lần cuối đọc tab Danh bạ (command 12230) |
| [`getMultiUsersByPhones`](#getmultiusersbyphones) | `GET` | `/api/friend/profile/multiget` | Tra cứu hàng loạt thông tin tài khoản Zalo từ danh sách nhiều số điện thoại cùng lúc. |
| [`getPhonebookV2`](#getphonebookv2) | `GET` | `/api/social/friend/phonebook/v2` | Lấy danh bạ bạn bè đồng bộ từ số điện thoại chuẩn V2 (command 12428) |
| [`getSentFriendRequest`](#getsentfriendrequest) | `GET` | `/api/friend/requested/list` | Lấy danh sách các lời mời kết bạn mà tài khoản hiện tại đã gửi đi nhưng chưa được phản hồi. |
| [`lastOnline`](#lastonline) | `GET` | `/api/social/profile/lastOnline` | Kiểm tra thời điểm truy cập (Online) gần nhất của một người dùng. |
| [`readContactTab`](#readcontacttab) | `POST` | `/api/friend/read-contact-tab` | Đánh dấu đã đọc tab Danh bạ (command 12231) |
| [`rejectFriendRequest`](#rejectfriendrequest) | `POST` | `/api/friend/reject` | Từ chối lời mời kết bạn từ một người dùng. |
| [`removeFriend`](#removefriend) | `POST` | `/api/friend/remove` | Hủy kết bạn (Xóa bạn) với một người dùng trong danh bạ. |
| [`removeFriendAlias`](#removefriendalias) | `GET` | `/api/alias/remove` | Xóa tên gợi nhớ (Biệt danh / Alias) đã đặt cho một người bạn. |
| [`sendFriendRequest`](#sendfriendrequest) | `POST` | `/api/friend/sendreq` | Gửi lời mời kết bạn kèm lời chào tới một người dùng theo UID. |
| [`unblockUser`](#unblockuser) | `POST` | `/api/friend/unblock` | Bỏ chặn tin nhắn đối với một người dùng. |
| [`undoFriendRequest`](#undofriendrequest) | `POST` | `/api/friend/undo` | Thu hồi (Hủy) lời mời kết bạn đã gửi trước đó. |
| [`verifyFriend`](#verifyfriend) | `POST` | `/api/social/friend/verify` | Kiểm tra và xác thực danh sách bạn bè qua `/api/social/friend/verify` (command 11138) |

---

## `acceptFriendRequest`

Đồng ý lời mời kết bạn từ một người dùng.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/accept</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.acceptFriendRequest(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.acceptFriendRequest(friendId: string)
```

### Tham số

- `friendId`: The friend ID to user request is accept

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AcceptFriendRequestResponse = "";
```

---

## `blockUser`

Chặn tin nhắn từ một người dùng theo UID.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/block</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.blockUser(userId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.blockUser(userId: string)
```

### Tham số

- `userId`: The ID of the User to block

### Kiểu dữ liệu (TypeScript Types)

```ts
export type BlockUserResponse = "";
```

---

## `blockViewFeed`

Chặn hoặc mở chặn quyền xem Nhật ký (Timeline Feed) đối với một người bạn.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/feed/block</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.blockViewFeed(isBlockFeed: boolean, userId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.blockViewFeed(isBlockFeed: boolean, userId: string)
```

### Tham số

- `isBlockFeed`: Boolean to block/unblock view feed
- `userId`: User ID to block/unblock view feed

### Kiểu dữ liệu (TypeScript Types)

```ts
export type BlockViewFeedResponse = "";
```

---

## `changeFriendAlias`

Đặt hoặc đổi tên gợi nhớ (Biệt danh / Alias) cho bạn bè.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/alias/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.changeFriendAlias(alias: string, friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.changeFriendAlias(alias: string, friendId: string)
```

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

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/recommendsv2/read-requests</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.clearUnreadFriendRequests(uidsSeen: string[] = [])
// Hoặc gọi phẳng (Flat Alias):
await api.clearUnreadFriendRequests(uidsSeen: string[] = [])
```

### Tham số

- `uidsSeen`: Danh sách UID đã xem lời mời kết bạn (mặc định `[]`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ClearUnreadFriendRequestsResponse = Record<string, unknown> | string;
```

---

## `findUser`

Tìm kiếm thông tin tài khoản Zalo thông qua số điện thoại.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/profile/get</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.findUser(phoneNumber: string, avatarSize: AvatarSize = AvatarSize.Large)
// Hoặc gọi phẳng (Flat Alias):
await api.findUser(phoneNumber: string, avatarSize: AvatarSize = AvatarSize.Large)
```

### Tham số

- `phoneNumber`: Phone number
- `avatarSize`: Avatar size (default: AvatarSize.Large)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FindUserResponse = UserBasic;
```

---

## `findUserByUsername`

Tìm kiếm thông tin tài khoản Zalo thông qua Username.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/search/by-user-name</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.findUserByUsername(username: string, avatarSize: AvatarSize = AvatarSize.Large)
// Hoặc gọi phẳng (Flat Alias):
await api.findUserByUsername(username: string, avatarSize: AvatarSize = AvatarSize.Large)
```

### Tham số

- `username`: username for find
- `avatarSize`: Avatar size (default: AvatarSize.Large)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FindUserByUsernameResponse = UserBasic;
```

---

## `getAliasList`

Lấy danh sách toàn bộ tên gợi nhớ (Alias) đã đặt cho bạn bè.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/alias/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getAliasList(count: number = 100, page: number = 1)
// Hoặc gọi phẳng (Flat Alias):
await api.getAliasList(count: number = 100, page: number = 1)
```

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/alias/list/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getAliasListV2(page: number = 1, count: number = 100)
// Hoặc gọi phẳng (Flat Alias):
await api.getAliasListV2(page: number = 1, count: number = 100)
```

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

Lấy toàn bộ danh sách bạn bè trong danh bạ tài khoản hiện tại.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/friend/getfriends</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getAllFriends(count: number = 20000, page: number = 1, avatarSize: AvatarSize = AvatarSize.Small)
// Hoặc gọi phẳng (Flat Alias):
await api.getAllFriends(count: number = 20000, page: number = 1, avatarSize: AvatarSize = AvatarSize.Small)
```

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/blocklistv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getBlockFriends(page: number = 1, count: number = 50, avatarSize: number = 120)
// Hoặc gọi phẳng (Flat Alias):
await api.getBlockFriends(page: number = 1, count: number = 50, avatarSize: number = 120)
```

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

Lấy danh sách bạn thân (Close Friends).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/friend/getclosedfriends</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getCloseFriends()
// Hoặc gọi phẳng (Flat Alias):
await api.getCloseFriends()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloseFriendsResponse = User[];
```

---

## `getExtraFriendInfo`

Lấy ngữ cảnh và vai trò mở rộng (ví dụ `role: ["boss"]`) của danh sách bạn bè (command 11442)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/context/multiget</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getExtraFriendInfo(friendIds: string[])
// Hoặc gọi phẳng (Flat Alias):
await api.getExtraFriendInfo(friendIds: string[])
```

### Tham số

- `friendIds`: Mảng UID cần truy vấn

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetExtraFriendInfoResponse = Record<string, ExtraContextInfo>;
```

---

## `getFriendBoardList`

Lấy thông tin bảng tin chung với một người bạn.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friendboard/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendBoardList(conversationId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendBoardList(conversationId: string)
```

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

Lấy danh sách bạn bè đang trực tuyến (Online) kèm trạng thái thiết bị.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/friend/onlines</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendOnlines()
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendOnlines()
```

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

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/social/friend/getprofiles/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendProfilesV2(friendIds: string | string[], options: GetFriendProfilesV2Options = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendProfilesV2(friendIds: string | string[], options: GetFriendProfilesV2Options = {},)
```

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

Lấy danh sách gợi ý kết bạn và lời mời kết bạn đã nhận.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/recommendsv2/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendRecommendations()
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendRecommendations()
```

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

Kiểm tra trạng thái quan hệ bạn bè và lời mời kết bạn với một UID.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/reqstatus</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendRequestStatus(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendRequestStatus(friendId: string)
```

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/friend/active-pcweb</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendsActivePCWeb()
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendsActivePCWeb()
```

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/v1/emoji-status/friends</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getFriendsEmojiStatus(options: GetFriendsEmojiStatusOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.getFriendsEmojiStatus(options: GetFriendsEmojiStatusOptions = {})
```

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/last-read-contact-tab</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getLastReadContactTab()
// Hoặc gọi phẳng (Flat Alias):
await api.getLastReadContactTab()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetLastReadContactTabResponse = {
    ts: number;
};
```

---

## `getMultiUsersByPhones`

Tra cứu hàng loạt thông tin tài khoản Zalo từ danh sách nhiều số điện thoại cùng lúc.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/profile/multiget</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getMultiUsersByPhones(phoneNumbers: string | string[], avatarSize: AvatarSize = AvatarSize.Large)
// Hoặc gọi phẳng (Flat Alias):
await api.getMultiUsersByPhones(phoneNumbers: string | string[], avatarSize: AvatarSize = AvatarSize.Large)
```

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/friend/phonebook/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getPhonebookV2(phonebookVersion: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.getPhonebookV2(phonebookVersion: number = 0)
```

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

Lấy danh sách các lời mời kết bạn mà tài khoản hiện tại đã gửi đi nhưng chưa được phản hồi.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/friend/requested/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.getSentFriendRequest()
// Hoặc gọi phẳng (Flat Alias):
await api.getSentFriendRequest()
```

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

Kiểm tra thời điểm truy cập (Online) gần nhất của một người dùng.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/profile/lastOnline</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.lastOnline(uid: string)
// Hoặc gọi phẳng (Flat Alias):
await api.lastOnline(uid: string)
```

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

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/read-contact-tab</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.readContactTab(ts: number = Date.now())
// Hoặc gọi phẳng (Flat Alias):
await api.readContactTab(ts: number = Date.now())
```

### Tham số

- `ts`: Dấu thời gian (mặc định: `Date.now()`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReadContactTabResponse = Record<string, unknown> | string;
```

---

## `rejectFriendRequest`

Từ chối lời mời kết bạn từ một người dùng.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/reject</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.rejectFriendRequest(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.rejectFriendRequest(friendId: string)
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RejectFriendRequestResponse = "";
```

---

## `removeFriend`

Hủy kết bạn (Xóa bạn) với một người dùng trong danh bạ.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.removeFriend(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeFriend(friendId: string)
```

### Tham số

- `friendId`: - ID of the friend to remove

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveFriendResponse = "";
```

---

## `removeFriendAlias`

Xóa tên gợi nhớ (Biệt danh / Alias) đã đặt cho một người bạn.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/alias/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.removeFriendAlias(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeFriendAlias(friendId: string)
```

### Tham số

- `friendId`: friend id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveFriendAliasResponse = "";
```

---

## `sendFriendRequest`

Gửi lời mời kết bạn kèm lời chào tới một người dùng theo UID.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/sendreq</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.sendFriendRequest(msg: string, userId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.sendFriendRequest(msg: string, userId: string)
```

### Tham số

- `msg`: message sent with friend request
- `userId`: User ID to send friend request to

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendFriendRequestResponse = "";
```

---

## `unblockUser`

Bỏ chặn tin nhắn đối với một người dùng.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/unblock</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.unblockUser(userId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.unblockUser(userId: string)
```

### Tham số

- `userId`: The ID of the User to unblock

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UnBlockUserResponse = "";
```

---

## `undoFriendRequest`

Thu hồi (Hủy) lời mời kết bạn đã gửi trước đó.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/undo</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.undoFriendRequest(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.undoFriendRequest(friendId: string)
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UndoFriendRequestResponse = "";
```

---

## `verifyFriend`

Kiểm tra và xác thực danh sách bạn bè qua `/api/social/friend/verify` (command 11138)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/social/friend/verify</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.friend.verifyFriend(friendIds: string | string[], options: VerifyFriendOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.verifyFriend(friendIds: string | string[], options: VerifyFriendOptions = {})
```

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
