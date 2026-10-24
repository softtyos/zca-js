# Hồ sơ cá nhân (Profile)

> Namespace: `api.profile` (hoặc gọi trực tiếp `api.<methodName>`) — **16 API**

Thông tin tài khoản, đổi ảnh đại diện, cài đặt quyền riêng tư, trạng thái cảm xúc (Emoji Status) và xác thực EKYC.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`changeAccountAvatar`](#changeaccountavatar) | `POST` | `/api/profile/upavatar` | Change account avatar |
| [`deleteAvatar`](#deleteavatar) | `GET` | `/api/social/del-avatars` | Delete avatar from avatar list |
| [`fetchAccountInfo`](#fetchaccountinfo) | `GET` | `/api/social/profile/me-v2` | API `fetchAccountInfo` thuộc phân hệ `profile`. |
| [`getAvatarList`](#getavatarlist) | `GET` | `/api/social/avatar-list` | Get avatar list |
| [`getAvatarUrlProfile`](#getavatarurlprofile) | `GET` | `/api/social/profile/avatar-url` | Get avatar url profile |
| [`getEmojiStatusConfig`](#getemojistatusconfig) | `GET` | `/api/v1/emoji-status/resource-config` | Lấy cấu hình và danh sách bộ biểu tượng Trạng thái Emoji (Emoji Status - command 16300) |
| [`getFullAvatar`](#getfullavatar) | `GET` | `/api/social/profile/avatar` | Get full avatar |
| [`getMiniProfile`](#getminiprofile) | `POST` | `/api/social/friend/getminiprofiles` | Lấy nhanh thông tin hồ sơ rút gọn (Avatar, Global ID, gói Biz) của danh sách người dùng (command 12134) |
| [`getProfileRank`](#getprofilerank) | `GET` | `/api/social/profile/getrank` | Lấy hạng tài khoản Zalo của một người dùng (ví dụ `"WHITE"`, `"GOLD"` - command 12012) |
| [`getProfileVerificationStatus`](#getprofileverificationstatus) | `GET` | `/api/social/profile/verification/status` | Kiểm tra trạng thái xác thực định danh (eKYC) của tài khoản Zalo (command 12150) |
| [`getSettings`](#getsettings) | `GET` | `N/A` | Get my account settings |
| [`getUserInfo`](#getuserinfo) | `POST` | `/api/social/friend/getprofiles/v2` | Get user info using user id |
| [`reuseAvatar`](#reuseavatar) | `GET` | `/api/social/reuse-avatar` | Reuse avatar |
| [`updateProfile`](#updateprofile) | `POST` | `/api/social/profile/update` | Change account setting information You may leave the other biz fields empty if you don’t want to change them. |
| [`updateProfileBio`](#updateprofilebio) | `POST` | `/api/social/profile/status` | Update profile bio |
| [`updateSettings`](#updatesettings) | `GET` | `N/A` | Set account settings ViewBirthday * 0: hide * 1: show full day/month/year * 2: show day/month ShowOnlineStatus * 0: hide * 1: show DisplaySeenStatus * 0: hide * 1: show ReceiveMessage * 1: everyone * 2: only friends AcceptCall * 2: only friends * 3: everyone * 4: friends and person who contacted AddFriendViaPhone * 0: disable * 1: enable AddFriendViaQR * 0: disable * 1: enable AddFriendViaGroup * 0: disable * 1: enable AddFriendViaContact * 0: disable * 1: enable DisplayOnRecommendFriend * 0: disable * 1: enable ArchivedChat * 0: disable * 1: enable QuickMessage * 0: disable * 1: enable |

---

## `changeAccountAvatar`

Change account avatar

- **Endpoint**: `POST /api/profile/upavatar`
- **Domain call**: `api.profile.changeAccountAvatar(avatarSource: AttachmentSource)`
- **Alias phẳng**: `api.changeAccountAvatar(avatarSource: AttachmentSource)`

### Tham số

- `avatarSource`: Attachment source, can be a file path or an Attachment object

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeAccountAvatarResponse = "";
```

---

## `deleteAvatar`

Delete avatar from avatar list

- **Endpoint**: `GET /api/social/del-avatars`
- **Domain call**: `api.profile.deleteAvatar(photoId: string | string[])`
- **Alias phẳng**: `api.deleteAvatar(photoId: string | string[])`

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

- **Endpoint**: `GET /api/social/profile/me-v2`
- **Domain call**: `api.profile.fetchAccountInfo()`
- **Alias phẳng**: `api.fetchAccountInfo()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FetchAccountInfoResponse = { profile: User };
```

---

## `getAvatarList`

Get avatar list

- **Endpoint**: `GET /api/social/avatar-list`
- **Domain call**: `api.profile.getAvatarList(count: number = 50, page: number = 1)`
- **Alias phẳng**: `api.getAvatarList(count: number = 50, page: number = 1)`

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

Get avatar url profile

- **Endpoint**: `GET /api/social/profile/avatar-url`
- **Domain call**: `api.profile.getAvatarUrlProfile(friendIds: string | string[], avatarSize: AvatarSize = AvatarSize.Large)`
- **Alias phẳng**: `api.getAvatarUrlProfile(friendIds: string | string[], avatarSize: AvatarSize = AvatarSize.Large)`

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

- **Endpoint**: `GET /api/v1/emoji-status/resource-config`
- **Domain call**: `api.profile.getEmojiStatusConfig(version: number = 0)`
- **Alias phẳng**: `api.getEmojiStatusConfig(version: number = 0)`

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

Get full avatar

- **Endpoint**: `GET /api/social/profile/avatar`
- **Domain call**: `api.profile.getFullAvatar(friendId: string)`
- **Alias phẳng**: `api.getFullAvatar(friendId: string)`

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

- **Endpoint**: `POST /api/social/friend/getminiprofiles`
- **Domain call**: `api.profile.getMiniProfile(friendIds: string[], avatarSize: number = 120)`
- **Alias phẳng**: `api.getMiniProfile(friendIds: string[], avatarSize: number = 120)`

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

- **Endpoint**: `GET /api/social/profile/getrank`
- **Domain call**: `api.profile.getProfileRank(profileId?: string)`
- **Alias phẳng**: `api.getProfileRank(profileId?: string)`

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

- **Endpoint**: `GET /api/social/profile/verification/status`
- **Domain call**: `api.profile.getProfileVerificationStatus()`
- **Alias phẳng**: `api.getProfileVerificationStatus()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetProfileVerificationStatusResponse = {
    status: number;
    [key: string]: unknown;
};
```

---

## `getSettings`

Get my account settings

- **Domain call**: `api.profile.getSettings()`
- **Alias phẳng**: `api.getSettings()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetSettingsResponse = UserSetting;
```

---

## `getUserInfo`

Get user info using user id

- **Endpoint**: `POST /api/social/friend/getprofiles/v2`
- **Domain call**: `api.profile.getUserInfo(userId: string | string[], avatarSize: AvatarSize = AvatarSize.Small)`
- **Alias phẳng**: `api.getUserInfo(userId: string | string[], avatarSize: AvatarSize = AvatarSize.Small)`

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

Reuse avatar

- **Endpoint**: `GET /api/social/reuse-avatar`
- **Domain call**: `api.profile.reuseAvatar(photoId: string)`
- **Alias phẳng**: `api.reuseAvatar(photoId: string)`

### Tham số

- `photoId`: photo id from getAvatarList api

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReuseAvatarResponse = null;
```

---

## `updateProfile`

Change account setting information You may leave the other biz fields empty if you don’t want to change them.

- **Endpoint**: `POST /api/social/profile/update`
- **Domain call**: `api.profile.updateProfile(payload: UpdateProfilePayload)`
- **Alias phẳng**: `api.updateProfile(payload: UpdateProfilePayload)`

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

Update profile bio

- **Endpoint**: `POST /api/social/profile/status`
- **Domain call**: `api.profile.updateProfileBio(status: string)`
- **Alias phẳng**: `api.updateProfileBio(status: string)`

### Tham số

- `status`: status for update bio

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateProfileBioResponse = "";
```

---

## `updateSettings`

Set account settings ViewBirthday * 0: hide * 1: show full day/month/year * 2: show day/month ShowOnlineStatus * 0: hide * 1: show DisplaySeenStatus * 0: hide * 1: show ReceiveMessage * 1: everyone * 2: only friends AcceptCall * 2: only friends * 3: everyone * 4: friends and person who contacted AddFriendViaPhone * 0: disable * 1: enable AddFriendViaQR * 0: disable * 1: enable AddFriendViaGroup * 0: disable * 1: enable AddFriendViaContact * 0: disable * 1: enable DisplayOnRecommendFriend * 0: disable * 1: enable ArchivedChat * 0: disable * 1: enable QuickMessage * 0: disable * 1: enable

- **Domain call**: `api.profile.updateSettings(type: UpdateSettingsType, value: number)`
- **Alias phẳng**: `api.updateSettings(type: UpdateSettingsType, value: number)`

### Tham số

- `type`: The type of setting to update
- `value`: 

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
