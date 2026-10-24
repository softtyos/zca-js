---
title: "Hồ sơ cá nhân (Profile) (api.profile) - 16 APIs"
description: "Thông tin tài khoản, đổi ảnh đại diện, cài đặt quyền riêng tư, trạng thái cảm xúc (Emoji Status) và xác thực EKYC. Tra cứu chi tiết 16 phương thức thuộc phân hệ api.profile trong bộ SDK @softtynet/zca-js."
---

# 🪪 Hồ sơ cá nhân (Profile)

> Namespace: `api.profile` (hoặc gọi trực tiếp `api.<methodName>`) — **16 API nguyên bản**

Thông tin tài khoản, đổi ảnh đại diện, cài đặt quyền riêng tư, trạng thái cảm xúc (Emoji Status) và xác thực EKYC.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`changeAccountAvatar`](#changeaccountavatar) | `POST` | `/api/profile/upavatar` | Thay đổi ảnh đại diện (Avatar) cho tài khoản cá nhân. |
| [`deleteAvatar`](#deleteavatar) | `GET` | `/api/social/del-avatars` | Xóa một hoặc nhiều ảnh đại diện cũ trong kho ảnh đại diện. |
| [`fetchAccountInfo`](#fetchaccountinfo) | `GET` | `/api/social/profile/me-v2` | API `fetchAccountInfo` thuộc phân hệ `profile`. |
| [`getAvatarList`](#getavatarlist) | `GET` | `/api/social/avatar-list` | Lấy danh sách lịch sử các ảnh đại diện đã từng sử dụng của tài khoản. |
| [`getAvatarUrlProfile`](#getavatarurlprofile) | `GET` | `/api/social/profile/avatar-url` | Lấy đường dẫn ảnh đại diện của danh sách hồ sơ người dùng. |
| [`getEmojiStatusConfig`](#getemojistatusconfig) | `GET` | `/api/v1/emoji-status/resource-config` | Lấy cấu hình và danh sách bộ biểu tượng Trạng thái Emoji (Emoji Status - command 16300) |
| [`getFullAvatar`](#getfullavatar) | `GET` | `/api/social/profile/avatar` | Lấy ảnh đại diện kích thước gốc (Full HD) của một người dùng theo UID. |
| [`getMiniProfile`](#getminiprofile) | `POST` | `/api/social/friend/getminiprofiles` | Lấy nhanh thông tin hồ sơ rút gọn (Avatar, Global ID, gói Biz) của danh sách người dùng (command 12134) |
| [`getProfileRank`](#getprofilerank) | `GET` | `/api/social/profile/getrank` | Lấy hạng tài khoản Zalo của một người dùng (ví dụ `"WHITE"`, `"GOLD"` - command 12012) |
| [`getProfileVerificationStatus`](#getprofileverificationstatus) | `GET` | `/api/social/profile/verification/status` | Kiểm tra trạng thái xác thực định danh (eKYC) của tài khoản Zalo (command 12150) |
| [`getSettings`](#getsettings) | `GET` | `Internal` | Lấy toàn bộ cấu hình quyền riêng tư và cài đặt của tài khoản hiện tại. |
| [`getUserInfo`](#getuserinfo) | `POST` | `/api/social/friend/getprofiles/v2` | Lấy thông tin hồ sơ chi tiết (Tên, Ảnh bìa, Ngày sinh, Giới tính, Bio, Zalo Business) của một hoặc nhiều UID. |
| [`reuseAvatar`](#reuseavatar) | `GET` | `/api/social/reuse-avatar` | Sử dụng lại một ảnh đại diện cũ từ kho lịch sử ảnh đại diện. |
| [`updateProfile`](#updateprofile) | `POST` | `/api/social/profile/update` | Cập nhật thông tin cá nhân (Tên hiển thị, Ngày sinh, Giới tính) và thông tin Zalo Business. |
| [`updateProfileBio`](#updateprofilebio) | `POST` | `/api/social/profile/status` | Cập nhật dòng tiểu sử (Status / Bio) trên trang cá nhân. |
| [`updateSettings`](#updatesettings) | `GET` | `Internal` | Cập nhật cài đặt quyền riêng tư (Hiển thị ngày sinh, Trạng thái Online, Đã xem, Nguồn nhận tin nhắn/cuộc gọi, Nguồn kết bạn). |

---

## `changeAccountAvatar`

Thay đổi ảnh đại diện (Avatar) cho tài khoản cá nhân.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/profile/upavatar</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.changeAccountAvatar(avatarSource: AttachmentSource)
// Hoặc gọi phẳng (Flat Alias):
await api.changeAccountAvatar(avatarSource: AttachmentSource)
```

### Tham số

- `avatarSource`: Attachment source, can be a file path or an Attachment object

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeAccountAvatarResponse = "";
```

---

## `deleteAvatar`

Xóa một hoặc nhiều ảnh đại diện cũ trong kho ảnh đại diện.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/del-avatars</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.deleteAvatar(photoId: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.deleteAvatar(photoId: string | string[])
```

### Tham số

- `photoId`: avatar photo ID(s) to delete - can be a single string or array of strings

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteAvatarResponse = {
    delPhotoIds: string[];
    errMap: {
        [key: string]: {
            err: number;
        };
    };
};
```

---

## `fetchAccountInfo`

API `fetchAccountInfo` thuộc phân hệ `profile`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/me-v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.fetchAccountInfo()
// Hoặc gọi phẳng (Flat Alias):
await api.fetchAccountInfo()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FetchAccountInfoResponse = { profile: User };
```

---

## `getAvatarList`

Lấy danh sách lịch sử các ảnh đại diện đã từng sử dụng của tài khoản.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/avatar-list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getAvatarList(count: number = 50, page: number = 1)
// Hoặc gọi phẳng (Flat Alias):
await api.getAvatarList(count: number = 50, page: number = 1)
```

### Tham số

- `count`: The number of avatars to fetch (default: 50)
- `page`: The page number to fetch (default: 1)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAvatarListResponse = {
    albumId: string;
    nextPhotoId: string;
    hasMore: number;
    photos: {
        photoId: string;
        thumbnail: string;
        url: string;
        bkUrl: string;
    }[];
};
```

---

## `getAvatarUrlProfile`

Lấy đường dẫn ảnh đại diện của danh sách hồ sơ người dùng.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/avatar-url</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getAvatarUrlProfile(friendIds: string | string[], avatarSize: AvatarSize = AvatarSize.Large)
// Hoặc gọi phẳng (Flat Alias):
await api.getAvatarUrlProfile(friendIds: string | string[], avatarSize: AvatarSize = AvatarSize.Large)
```

### Tham số

- `friendId`: friend id(s)
- `avatarSize`: Avatar size (default: AvatarSize.Large)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAvatarUrlProfileResponse = {
    [userId: string]: {
        avatar: string;
    };
};
```

---

## `getEmojiStatusConfig`

Lấy cấu hình và danh sách bộ biểu tượng Trạng thái Emoji (Emoji Status - command 16300)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/v1/emoji-status/resource-config</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getEmojiStatusConfig(version: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.getEmojiStatusConfig(version: number = 0)
```

### Tham số

- `version`: Phiên bản bộ nhớ đệm (mặc định: 0 để lấy đầy đủ danh sách)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EmojiStatusItem = {
    id: number;
    caption: {
        vi: string;
        en: string;
    };
    thumb: string;
    full: string;
};

export type GetEmojiStatusConfigResponse = {
    expireTime: number;
    config: {
        emojis: EmojiStatusItem[];
        [key: string]: unknown;
    };
};
```

---

## `getFullAvatar`

Lấy ảnh đại diện kích thước gốc (Full HD) của một người dùng theo UID.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/avatar</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getFullAvatar(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getFullAvatar(friendId: string)
```

### Tham số

- `friendId`: friend id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFullAvatarResponse = {
    bk_full_avatar: string;
    full_avatar: string;
};
```

---

## `getMiniProfile`

Lấy nhanh thông tin hồ sơ rút gọn (Avatar, Global ID, gói Biz) của danh sách người dùng (command 12134)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/friend/getminiprofiles</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getMiniProfile(friendIds: string[], avatarSize: number = 120)
// Hoặc gọi phẳng (Flat Alias):
await api.getMiniProfile(friendIds: string[], avatarSize: number = 120)
```

### Tham số

- `friendIds`: Mảng UID cần lấy thông tin
- `avatarSize`: Kích thước ảnh đại diện (mặc định: 120)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type MiniProfileItem = {
    userId: string;
    avatar: string;
    globalId: string;
    type: number;
    bizPkg?: {
        label: string | null;
        pkgId: number;
    };
    [key: string]: unknown;
};

export type GetMiniProfileResponse = Record<string, MiniProfileItem>;
```

---

## `getProfileRank`

Lấy hạng tài khoản Zalo của một người dùng (ví dụ `"WHITE"`, `"GOLD"` - command 12012)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/getrank</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getProfileRank(profileId?: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getProfileRank(profileId?: string)
```

### Tham số

- `profileId`: UID của người dùng cần kiểm tra (mặc định: UID của tài khoản đang đăng nhập)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetProfileRankResponse = {
    userRank: string;
    [key: string]: unknown;
};
```

---

## `getProfileVerificationStatus`

Kiểm tra trạng thái xác thực định danh (eKYC) của tài khoản Zalo (command 12150)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/verification/status</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getProfileVerificationStatus()
// Hoặc gọi phẳng (Flat Alias):
await api.getProfileVerificationStatus()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetProfileVerificationStatusResponse = {
    status: number;
    [key: string]: unknown;
};
```

---

## `getSettings`

Lấy toàn bộ cấu hình quyền riêng tư và cài đặt của tài khoản hiện tại.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getSettings()
// Hoặc gọi phẳng (Flat Alias):
await api.getSettings()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetSettingsResponse = UserSetting;
```

---

## `getUserInfo`

Lấy thông tin hồ sơ chi tiết (Tên, Ảnh bìa, Ngày sinh, Giới tính, Bio, Zalo Business) của một hoặc nhiều UID.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/friend/getprofiles/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.getUserInfo(userId: string | string[], avatarSize: AvatarSize = AvatarSize.Small)
// Hoặc gọi phẳng (Flat Alias):
await api.getUserInfo(userId: string | string[], avatarSize: AvatarSize = AvatarSize.Small)
```

### Tham số

- `userId`: User id(s)
- `avatarSize`: Avatar size (default: AvatarSize.Small)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ProfileInfo = User;

export type UserInfoResponse = {
    unchanged_profiles: Record<string, Partial<UnchangedProfileInfo>>;
    phonebook_version: number;
    changed_profiles: Record<string, ProfileInfo>;
};
```

---

## `reuseAvatar`

Sử dụng lại một ảnh đại diện cũ từ kho lịch sử ảnh đại diện.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/reuse-avatar</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.reuseAvatar(photoId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.reuseAvatar(photoId: string)
```

### Tham số

- `photoId`: photo id from getAvatarList api

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReuseAvatarResponse = null;
```

---

## `updateProfile`

Cập nhật thông tin cá nhân (Tên hiển thị, Ngày sinh, Giới tính) và thông tin Zalo Business.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.updateProfile(payload: UpdateProfilePayload)
// Hoặc gọi phẳng (Flat Alias):
await api.updateProfile(payload: UpdateProfilePayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateProfilePayload = {
    profile: {
        name: string;
        /**
         * Date of birth in the format YYYY-MM-DD
         */
        dob: `${string}-${string}-${string}`;
        gender: Gender;
    };
    biz?: Partial<{
        cate: BusinessCategory;
        description: string;
        address: string;
        website: string;
        email: string;
    }>;
};

export type UpdateProfileResponse = "";
```

---

## `updateProfileBio`

Cập nhật dòng tiểu sử (Status / Bio) trên trang cá nhân.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">/api/social/profile/status</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.updateProfileBio(status: string)
// Hoặc gọi phẳng (Flat Alias):
await api.updateProfileBio(status: string)
```

### Tham số

- `status`: status for update bio

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateProfileBioResponse = "";
```

---

## `updateSettings`

Cập nhật cài đặt quyền riêng tư (Hiển thị ngày sinh, Trạng thái Online, Đã xem, Nguồn nhận tin nhắn/cuộc gọi, Nguồn kết bạn).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.profile</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.profile.updateSettings(type: UpdateSettingsType, value: number)
// Hoặc gọi phẳng (Flat Alias):
await api.updateSettings(type: UpdateSettingsType, value: number)
```

### Tham số

- `type`: The type of setting to update

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateSettingsResponse = "";

export enum UpdateSettingsType {
    ViewBirthday = "view_birthday",
    ShowOnlineStatus = "show_online_status",
    DisplaySeenStatus = "display_seen_status",
    ReceiveMessage = "receive_message",
    AcceptCall = "accept_stranger_call",
    AddFriendViaPhone = "add_friend_via_phone",
    AddFriendViaQR = "add_friend_via_qr",
    AddFriendViaGroup = "add_friend_via_group",
    AddFriendViaContact = "add_friend_via_contact",
    DisplayOnRecommendFriend = "display_on_recommend_friend",
    ArchivedChat = "archivedChatStatus",
    QuickMessage = "quickMessageStatus",
}
```

---
