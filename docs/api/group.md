---
title: "Nhóm & Cộng đồng (Group) (api.group) - 44 APIs"
description: "Quản lý nhóm & Cộng đồng, lấy thông tin nhóm (V1/V2/V3/V4), lịch sử tin nhắn Cloud, trạng thái tin nhắn thành viên và phân quyền. Tra cứu chi tiết 44 phương thức thuộc phân hệ api.group trong bộ SDK @softtynet/zca-js."
---

# 👥 Nhóm & Cộng đồng (Group)

> Namespace: `api.group` (hoặc gọi trực tiếp `api.<methodName>`) — **44 API nguyên bản**

Quản lý nhóm & Cộng đồng, lấy thông tin nhóm (V1/V2/V3/V4), lịch sử tin nhắn Cloud, trạng thái tin nhắn thành viên và phân quyền.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`addGroupBlockedMember`](#addgroupblockedmember) | `GET` | `/api/group/blockedmems/add` | Chặn một hoặc nhiều thành viên khỏi nhóm (không cho tham gia lại). |
| [`addGroupDeputy`](#addgroupdeputy) | `GET` | `/api/group/admins/add` | Bổ nhiệm thành viên làm Phó nhóm (Quản trị viên). |
| [`addUserToGroup`](#addusertogroup) | `POST` | `/api/group/invite/v2` | Thêm trực tiếp một hoặc nhiều người dùng vào nhóm. |
| [`analyseGroup`](#analysegroup) | `GET` | `/api/group/analyse` | Lấy dữ liệu phân tích/thống kê của nhóm qua `/api/group/analyse` (command 12407) |
| [`changeGroupAvatar`](#changegroupavatar) | `POST` | `/api/group/upavatar` | Thay đổi ảnh đại diện (Avatar) của nhóm. |
| [`changeGroupName`](#changegroupname) | `POST` | `/api/group/updateinfo` | Đổi tên hiển thị của nhóm chat hoặc Cộng đồng. |
| [`changeGroupOwner`](#changegroupowner) | `GET` | `/api/group/change-owner` | Chuyển nhượng quyền Trưởng nhóm (Owner) cho một thành viên khác trong nhóm. |
| [`checkQuotaCommunityMember`](#checkquotacommunitymember) | `GET` | `/api/group/quota/members-comm` | Kiểm tra điều kiện/hạn mức thành viên Cộng đồng đối với một thành viên cụ thể trong nhóm (command 12182) |
| [`createGroup`](#creategroup) | `POST` | `/api/group/create/v2` | Tạo một nhóm chat mới kèm tên nhóm, danh sách thành viên ban đầu và ảnh đại diện. |
| [`deleteGroupInviteBox`](#deletegroupinvitebox) | `GET` | `/api/group/inv-box/mdel-inv` | Xóa lời mời tham gia nhóm trong hộp thư lời mời nhóm. |
| [`disableGroupLink`](#disablegrouplink) | `GET` | `/api/group/link/disable` | Vô hiệu hóa (Tắt) đường dẫn tham gia nhóm bằng liên kết (Invite Link). |
| [`disperseGroup`](#dispersegroup) | `POST` | `/api/group/disperse` | Giải tán nhóm chat vĩnh viễn (yêu cầu quyền Trưởng nhóm). |
| [`enableGroupLink`](#enablegrouplink) | `GET` | `/api/group/link/new` | Kích hoạt hoặc tạo mới đường dẫn liên kết mời tham gia nhóm. |
| [`getAllGroups`](#getallgroups) | `GET` | `/api/group/getlg/v4` | API `getAllGroups` thuộc phân hệ `group`. |
| [`getE2eeGroupList`](#gete2eegrouplist) | `GET` | `/api/group/getlg/e2ee` | Lấy danh sách các nhóm đang bật mã hóa đầu cuối E2EE (command 12146) |
| [`getExtraGroupInfo`](#getextragroupinfo) | `POST` | `/api/group/userctx/multiget` | Lấy ngữ cảnh và vai trò mở rộng của người dùng đối với nhiều nhóm (command 12607) |
| [`getGroupBlockedMember`](#getgroupblockedmember) | `GET` | `/api/group/blockedmems/list` | Lấy danh sách các tài khoản đang bị chặn khỏi nhóm. |
| [`getGroupChatHistory`](#getgroupchathistory) | `GET` | `/api/cm/getoldv2`<br/>`/api/cm/getrecentv2` | Lấy lịch sử tin nhắn nhóm từ Zalo Cloud Message (hỗ trợ cả `/api/cm/getrecentv2` cmd 12506 và `/api/cm/getoldv2` cmd 12507) |
| [`getGroupCloudMessageJump`](#getgroupcloudmessagejump) | `GET` | `/api/cm/rgetv2` | Nhảy tới vị trí một tin nhắn nhóm cụ thể trên Zalo Cloud Message và lấy ngữ cảnh xung quanh (command 12508) |
| [`getGroupCloudMessagePath`](#getgroupcloudmessagepath) | `GET` | `/api/cm/getpath` | Lấy chuỗi tin nhắn nhóm theo đường dẫn nhảy tới một tin nhắn cụ thể (`globalMsgId` / `rGlobalMsgId`) qua `/api/cm/getpath` (command 12504) |
| [`getGroupHistoryLegacy`](#getgrouphistorylegacy) | `GET` | `/api/group/history` | Lấy lịch sử tin nhắn nhóm qua endpoint `/api/group/history` trên miền `group` (command 11240) |
| [`getGroupInfo`](#getgroupinfo) | `POST` | `/api/group/getmg-v2` | Lấy thông tin chi tiết của một hoặc nhiều nhóm (tên nhóm, cài đặt lockViewMember, creatorId, adminIds, memVerList) qua /api/group/getmg-v2. |
| [`getGroupInfoV2`](#getgroupinfov2) | `GET` | `/api/group/getgi`<br/>`/api/group/getgi/v2` | Lấy thông tin nhóm và danh sách thành viên theo trang qua `/api/group/getgi/v2` hoặc `/api/group/getgi` (command 11162) |
| [`getGroupInviteBoxInfo`](#getgroupinviteboxinfo) | `GET` | `/api/group/inv-box/inv-info` | Lấy thông tin chi tiết của một lời mời vào nhóm cụ thể. |
| [`getGroupInviteBoxList`](#getgroupinviteboxlist) | `GET` | `/api/group/inv-box/list` | Lấy danh sách tất cả lời mời tham gia nhóm đang chờ trong hộp thư. |
| [`getGroupLinkDetail`](#getgrouplinkdetail) | `GET` | `/api/group/link/detail` | Lấy chi tiết đường dẫn mời tham gia nhóm (Link邀請) của một nhóm mà bạn đang tham gia. |
| [`getGroupLinkInfo`](#getgrouplinkinfo) | `GET` | `/api/group/link/ginfo` | Tra cứu thông tin nhóm và danh sách thành viên theo trang từ đường dẫn nhóm công khai (https://zalo.me/g/...). |
| [`getGroupListV3`](#getgrouplistv3) | `GET` | `/api/group/getlg/v3` | Lấy danh sách nhóm theo trang kèm thông tin thành viên đại diện (`currentMems`) và gợi ý nhóm (`suggestGroup`) qua `/api/group/getlg/v3` (command 11161) |
| [`getGroupMembersInfo`](#getgroupmembersinfo) | `GET` | `/api/social/group/members` | Giải mã hàng loạt thông tin hồ sơ thành viên (displayName, zaloName, avatar, globalId) từ danh sách UID qua /api/social/group/members. |
| [`getGroupMessageStatus`](#getgroupmessagestatus) | `POST` | `/api/group/getStatusMsg` | Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn của danh sách thành viên trong nhóm (command 12017) |
| [`getMultiGroupCloudMessages`](#getmultigroupcloudmessages) | `GET` | `/api/cm/mget` | Đồng bộ nhanh tin nhắn Cloud của nhiều nhóm cùng lúc theo danh sách `groupIds` (command 12503 - `syncCloudMsgFirstLogin`) |
| [`getPendingGroupMembers`](#getpendinggroupmembers) | `GET` | `/api/group/pending-mems/list` | Lấy danh sách các yêu cầu xin vào nhóm đang chờ Quản trị viên phê duyệt. |
| [`getQuotaCommunity`](#getquotacommunity) | `GET` | `/api/group/quota/community` | Kiểm tra hạn mức nâng cấp nhóm lên Cộng đồng của tài khoản (command 12181) |
| [`getRelatedFriendGroup`](#getrelatedfriendgroup) | `POST` | `/api/friend/group/related` | Kiểm tra danh sách các nhóm chung giữa tài khoản hiện tại và danh sách UID truyền vào qua /api/friend/group/related. |
| [`inviteUserToGroups`](#inviteusertogroups) | `GET` | `/api/group/invite/multi` | Gửi lời mời tham gia một hoặc nhiều nhóm tới người dùng. |
| [`joinGroupInviteBox`](#joingroupinvitebox) | `GET` | `/api/group/inv-box/join` | Chấp nhận lời mời tham gia nhóm từ hộp thư lời mời. |
| [`joinGroupLink`](#joingrouplink) | `GET` | `/api/group/link/join` | Tham gia vào nhóm thông qua đường dẫn liên kết mời (Group Link). |
| [`leaveGroup`](#leavegroup) | `POST` | `/api/group/leave` | Rời khỏi một hoặc nhiều nhóm chat (hỗ trợ rời nhóm im lặng silent). |
| [`removeGroupBlockedMember`](#removegroupblockedmember) | `GET` | `/api/group/blockedmems/remove` | Gỡ chặn (Unblock) cho người dùng khỏi danh sách chặn của nhóm. |
| [`removeGroupDeputy`](#removegroupdeputy) | `GET` | `/api/group/admins/remove` | Cách chức Phó nhóm (thu hồi quyền Quản trị viên) của thành viên. |
| [`removeUserFromGroup`](#removeuserfromgroup) | `POST` | `/api/group/kickout` | Mời ra khỏi nhóm (Kick) một hoặc nhiều thành viên. |
| [`reviewPendingMemberRequest`](#reviewpendingmemberrequest) | `GET` | `/api/group/pending-mems/review` | Phê duyệt (Chấp nhận hoặc Từ chối) yêu cầu xin tham gia nhóm của thành viên mới. |
| [`updateGroupSettings`](#updategroupsettings) | `GET` | `/api/group/setting/update` | Cập nhật các thiết lập quyền hạn của nhóm (ẩn thành viên lockViewMember, duyệt thành viên joinAppr, khóa nhắn tin lockSendMsg...). |
| [`upgradeGroupToCommunity`](#upgradegrouptocommunity) | `GET` | `/api/group/upgrade/community` | Nâng cấp nhóm thường lên Cộng đồng (Community - tối đa 1000 thành viên). |

---

## `addGroupBlockedMember`

Chặn một hoặc nhiều thành viên khỏi nhóm (không cho tham gia lại).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/blockedmems/add</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.addGroupBlockedMember(memberId: string | string[], groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.addGroupBlockedMember(memberId: string | string[], groupId: string)
```

### Tham số

- `memberId`: member id(s)
- `groupId`: group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddGroupBlockedMemberResponse = "";
```

---

## `addGroupDeputy`

Bổ nhiệm thành viên làm Phó nhóm (Quản trị viên).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/admins/add</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.addGroupDeputy(memberId: string | string[], groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.addGroupDeputy(memberId: string | string[], groupId: string)
```

### Tham số

- `memberId`: user Id or list of user Ids
- `groupId`: group Id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddGroupDeputyResponse = "";
```

---

## `addUserToGroup`

Thêm trực tiếp một hoặc nhiều người dùng vào nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/invite/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.addUserToGroup(memberId: string | string[], groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.addUserToGroup(memberId: string | string[], groupId: string)
```

### Tham số

- `memberId`: User ID or list of user IDs to add
- `groupId`: Group ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddUserToGroupResponse = {
    errorMembers: string[];
    error_data: Record<string, string[]>;
};
```

---

## `analyseGroup`

Lấy dữ liệu phân tích/thống kê của nhóm qua `/api/group/analyse` (command 12407)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/analyse</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.analyseGroup(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.analyseGroup(groupId: string)
```

### Tham số

- `groupId`: ID của nhóm

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AnalyseGroupResponse = {
    [key: string]: unknown;
};
```

---

## `changeGroupAvatar`

Thay đổi ảnh đại diện (Avatar) của nhóm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/upavatar</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.changeGroupAvatar(avatarSource: AttachmentSource, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.changeGroupAvatar(avatarSource: AttachmentSource, groupId: string)
```

### Tham số

- `avatarSource`: Attachment source, can be a file path or an Attachment object
- `groupId`: Group ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeGroupAvatarResponse = "";
```

---

## `changeGroupName`

Đổi tên hiển thị của nhóm chat hoặc Cộng đồng.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/updateinfo</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.changeGroupName(name: string, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.changeGroupName(name: string, groupId: string)
```

### Tham số

- `name`: New group name
- `groupId`: Group ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeGroupNameResponse = {
    status: number;
};
```

---

## `changeGroupOwner`

Chuyển nhượng quyền Trưởng nhóm (Owner) cho một thành viên khác trong nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/change-owner</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.changeGroupOwner(memberId: string, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.changeGroupOwner(memberId: string, groupId: string)
```

### Tham số

- `memberId`: User Id of new group owner
- `groupId`: Group Id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeGroupOwnerResponse = {
    time: number;
};
```

---

## `checkQuotaCommunityMember`

Kiểm tra điều kiện/hạn mức thành viên Cộng đồng đối với một thành viên cụ thể trong nhóm (command 12182)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/quota/members-comm</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.checkQuotaCommunityMember(groupId: string, uid: string)
// Hoặc gọi phẳng (Flat Alias):
await api.checkQuotaCommunityMember(groupId: string, uid: string)
```

### Tham số

- `groupId`: ID của nhóm
- `uid`: UID của thành viên cần kiểm tra

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CheckQuotaCommunityMemberResponse = {
    status?: number;
    canUpgrade?: boolean | number;
    [key: string]: unknown;
};
```

---

## `createGroup`

Tạo một nhóm chat mới kèm tên nhóm, danh sách thành viên ban đầu và ảnh đại diện.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/create/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.createGroup(options: CreateGroupOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.createGroup(options: CreateGroupOptions)
```

### Tham số

- `options`: Group options

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateGroupResponse = {
    groupType: number;
    sucessMembers: string[];
    groupId: string;
    errorMembers: string[];
    error_data: Record<string, unknown>;
};

export type CreateGroupOptions = {
    /**
     * Group name
     */
    name?: string;
    /**
     * List of member IDs to add to the group
     */
    members: string[];
    /**
     * Avatar source, can be a file path or an Attachment object
     */
    avatarSource?: AttachmentSource;
    /**
     * Path to the avatar image file
     * @deprecated Use `avatarSource` instead
     */
    avatarPath?: string;
};
```

---

## `deleteGroupInviteBox`

Xóa lời mời tham gia nhóm trong hộp thư lời mời nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/inv-box/mdel-inv</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.deleteGroupInviteBox(groupId: string | string[], blockFutureInvite: boolean = false)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteGroupInviteBox(groupId: string | string[], blockFutureInvite: boolean = false)
```

### Tham số

- `groupId`: - The group id
- `blockFutureInvite`: - Whether to block future invites from this group

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteGroupInviteBoxResponse = {
    delInvitaionIds: string[];
    errMap: {
        [groupId: string]: {
            err: number;
        };
    };
};
```

---

## `disableGroupLink`

Vô hiệu hóa (Tắt) đường dẫn tham gia nhóm bằng liên kết (Invite Link).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/link/disable</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.disableGroupLink(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.disableGroupLink(groupId: string)
```

### Tham số

- `groupId`: The group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DisableGroupLinkResponse = "";
```

---

## `disperseGroup`

Giải tán nhóm chat vĩnh viễn (yêu cầu quyền Trưởng nhóm).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/disperse</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.disperseGroup(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.disperseGroup(groupId: string)
```

### Tham số

- `groupId`: Group ID to disperse Group from

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DisperseGroupResponse = "";
```

---

## `enableGroupLink`

Kích hoạt hoặc tạo mới đường dẫn liên kết mời tham gia nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/link/new</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.enableGroupLink(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.enableGroupLink(groupId: string)
```

### Tham số

- `groupId`: The group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EnableGroupLinkResponse = {
    link: string;
    expiration_date: number;
    enabled: number;
};
```

---

## `getAllGroups`

API `getAllGroups` thuộc phân hệ `group`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/getlg/v4</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getAllGroups()
// Hoặc gọi phẳng (Flat Alias):
await api.getAllGroups()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAllGroupsResponse = {
    version: string;
    gridVerMap: {
        [groupId: string]: string;
    };
};
```

---

## `getE2eeGroupList`

Lấy danh sách các nhóm đang bật mã hóa đầu cuối E2EE (command 12146)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/getlg/e2ee</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getE2eeGroupList()
// Hoặc gọi phẳng (Flat Alias):
await api.getE2eeGroupList()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetE2eeGroupListResponse = {
    version?: number;
    gridVerMap?: Record<string, string>;
    e2eeGroups?: string[];
    [key: string]: unknown;
};
```

---

## `getExtraGroupInfo`

Lấy ngữ cảnh và vai trò mở rộng của người dùng đối với nhiều nhóm (command 12607)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/userctx/multiget</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getExtraGroupInfo(groupIds: string[])
// Hoặc gọi phẳng (Flat Alias):
await api.getExtraGroupInfo(groupIds: string[])
```

### Tham số

- `groupIds`: Mảng ID các nhóm cần truy vấn

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ExtraContextInfo = {
    purpose: string;
    role: string[];
    [key: string]: unknown;
};

export type GetExtraGroupInfoResponse = Record<string, ExtraContextInfo>;
```

---

## `getGroupBlockedMember`

Lấy danh sách các tài khoản đang bị chặn khỏi nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/blockedmems/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupBlockedMember(payload: GetGroupBlockedMemberPayload, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupBlockedMember(payload: GetGroupBlockedMemberPayload, groupId: string)
```

### Tham số

- `payload`: payload
- `groupId`: group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupBlockedMemberPayload = {
    /**
     * Page number (default: 1)
     */
    page?: number;
    /**
     * Number of items to retrieve (default: 50)
     */
    count?: number;
};

export type GetGroupBlockedMemberResponse = {
    blocked_members: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    }[];
    has_more: number;
};
```

---

## `getGroupChatHistory`

Lấy lịch sử tin nhắn nhóm từ Zalo Cloud Message (hỗ trợ cả `/api/cm/getrecentv2` cmd 12506 và `/api/cm/getoldv2` cmd 12507)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/cm/getoldv2</span> <span class="zca-endpoint-pill">/api/cm/getrecentv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupChatHistory(groupId: string, countOrOptions: number | GetGroupChatHistoryOptions = 50,)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupChatHistory(groupId: string, countOrOptions: number | GetGroupChatHistoryOptions = 50,)
```

### Tham số

- `groupId`: ID nhóm
- `countOrOptions`: Số lượng tin nhắn cần tải (mặc định: `50`) hoặc đối tượng cấu hình phân trang `GetGroupChatHistoryOptions`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupChatHistoryOptions = {
    /**
     * Số lượng tin nhắn cần tải (mặc định: `50`).
     */
    count?: number;
    /**
     * Con trỏ `globalMsgId` (`lastMsgId` của trang trước) để phân trang lùi sâu về quá khứ (mặc định: `0`).
     */
    cursor?: number | string;
    /**
     * Số trang tối đa được phép gọi trong một lần thực thi.
     */
    maxPages?: number;
    /**
     * Sử dụng endpoint `/api/cm/getoldv2` (command 12507) thay vì `/api/cm/getrecentv2` (command 12506).
     */
    useOldEndpoint?: boolean;
    /**
     * Danh sách `msgIds` cục bộ bổ sung (mặc định: `[]`).
     */
    msgIds?: Array<string | number>;
    /**
     * Nguồn truy vấn (mặc định: `3`).
     */
    src?: number;
    /**
     * Cờ hội thoại OA (tùy chọn).
     */
    isOA?: boolean;
};

export type GetGroupChatHistoryResponse = {
    error?: number;
    lastMsgId?: number | string;
    nextCursor?: number | string;
    minMsgId?: number | string;
    maxMsgId?: number | string;
    msgJumpId?: number | string;
    hasMore?: boolean;
    isOld?: boolean;
    isFiltered?: boolean;
    rootMsgId?: number | string;
    isRootDel?: boolean;
    groupMsgs: GroupMessage[];
    tsJoinGroup?: number;
    isFilteredByPhase?: boolean;
    isFilteredByTimeJoin?: boolean;
};
```

---

## `getGroupCloudMessageJump`

Nhảy tới vị trí một tin nhắn nhóm cụ thể trên Zalo Cloud Message và lấy ngữ cảnh xung quanh (command 12508)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/cm/rgetv2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupCloudMessageJump(groupId: string, globalMsgId: string | number, count: number = 20, msgJump: number = 1, msgIds: Array<string | number> = [],)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupCloudMessageJump(groupId: string, globalMsgId: string | number, count: number = 20, msgJump: number = 1, msgIds: Array<string | number> = [],)
```

### Tham số

- `groupId`: ID nhóm
- `globalMsgId`: ID tin nhắn toàn cục cần nhảy tới
- `count`: Số lượng tin nhắn ngữ cảnh cần tải (mặc định `20`)
- `msgJump`: Cờ nhảy tin nhắn (mặc định `1`)
- `msgIds`: Danh sách msgId bổ sung (mặc định `[]`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupCloudMessageJumpResponse = GetGroupChatHistoryResponse;
```

---

## `getGroupCloudMessagePath`

Lấy chuỗi tin nhắn nhóm theo đường dẫn nhảy tới một tin nhắn cụ thể (`globalMsgId` / `rGlobalMsgId`) qua `/api/cm/getpath` (command 12504)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/cm/getpath</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupCloudMessagePath(options: GetGroupCloudMessagePathOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupCloudMessagePath(options: GetGroupCloudMessagePathOptions)
```

### Tham số

- `options`: Cấu hình truy vấn đường dẫn tin nhắn nhóm

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupCloudMessagePathOptions = {
    groupId: string;
    globalMsgId: string | number;
    count?: number;
    reverse?: number | boolean;
    rGlobalMsgId?: string | number;
    rOwnerId?: string;
    rClientMsgId?: string | number;
};

export type GetGroupCloudMessagePathResponse = {
    lastMsgId?: string | number;
    minMsgId?: string | number;
    maxMsgId?: string | number;
    hasMore?: boolean;
    groupMsgs: GroupMessage[];
    [key: string]: unknown;
};
```

---

## `getGroupHistoryLegacy`

Lấy lịch sử tin nhắn nhóm qua endpoint `/api/group/history` trên miền `group` (command 11240)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/history</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupHistoryLegacy(groupId: string, count: number = 20)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupHistoryLegacy(groupId: string, count: number = 20)
```

### Tham số

- `groupId`: ID của nhóm
- `count`: Số lượng tin nhắn cần tải (mặc định: `20`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupHistoryLegacyResponse = {
    groupMsgs?: GroupMessage[];
    msgs?: GroupMessage[];
    [key: string]: unknown;
};
```

---

## `getGroupInfo`

Lấy thông tin chi tiết của một hoặc nhiều nhóm (tên nhóm, cài đặt lockViewMember, creatorId, adminIds, memVerList) qua /api/group/getmg-v2.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/getmg-v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupInfo(groupId: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupInfo(groupId: string | string[])
```

### Tham số

- `groupId`: Group ID or list of group IDs

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GroupInfoResponse = {
    removedsGroup: string[];
    unchangedsGroup: string[];
    gridInfoMap: {
        [groupId: string]: GroupInfo & {
            memVerList: string[];
            pendingApprove: GroupInfoPendingApprove;
        };
    };
};

export type GroupInfoPendingApprove = {
    time: number;
    uids: string[] | null;
};
```

---

## `getGroupInfoV2`

Lấy thông tin nhóm và danh sách thành viên theo trang qua `/api/group/getgi/v2` hoặc `/api/group/getgi` (command 11162)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/getgi</span> <span class="zca-endpoint-pill">/api/group/getgi/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupInfoV2(groupId: string, pageOrOptions: number | GetGroupInfoV2Options = 1,)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupInfoV2(groupId: string, pageOrOptions: number | GetGroupInfoV2Options = 1,)
```

### Tham số

- `groupId`: ID của nhóm
- `pageOrOptions`: Số trang `mpage` (mặc định: `1`) hoặc cấu hình `GetGroupInfoV2Options`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupInfoV2Options = {
    /**
     * Trang thành viên cần lấy (mặc định: `1`).
     */
    mpage?: number;
    /**
     * Số lượng thành viên mỗi trang (mặc định: `100`).
     */
    mcount?: number;
    /**
     * Kích thước ảnh đại diện nhóm (mặc định: `120`).
     */
    avatarSize?: number;
    /**
     * Kích thước ảnh đại diện thành viên (mặc định: `120`).
     */
    memberAvatarSize?: number;
    /**
     * Sử dụng endpoint `/api/group/getgi` (bản V1) thay vì `/api/group/getgi/v2` (mặc định: `false`).
     */
    useV1Endpoint?: boolean;
};

export type GetGroupInfoV2Response = GroupInfo & {
    admins?: GroupCurrentMem[];
    pendingApprove?: GroupInfoPendingApprove;
    [key: string]: unknown;
};
```

---

## `getGroupInviteBoxInfo`

Lấy thông tin chi tiết của một lời mời vào nhóm cụ thể.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/inv-box/inv-info</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupInviteBoxInfo(payload: GetGroupInviteBoxInfoPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupInviteBoxInfo(payload: GetGroupInviteBoxInfoPayload)
```

### Tham số

- `payload`: - The payload of the request

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupInviteBoxInfoPayload = {
    groupId: string;
    mpage?: number;
    mcount?: number;
};

export type GetGroupInviteBoxInfoResponse = {
    groupInfo: GroupInfo & {
        topic?: Omit<GroupTopic, "action">;
    };
    inviterInfo: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    };
    grCreatorInfo: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    };
    expiredTs: string;
    type: number;
};
```

---

## `getGroupInviteBoxList`

Lấy danh sách tất cả lời mời tham gia nhóm đang chờ trong hộp thư.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/inv-box/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupInviteBoxList(payload?: GetGroupInviteBoxListPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupInviteBoxList(payload?: GetGroupInviteBoxListPayload)
```

### Tham số

- `payload`: - The payload of the request

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupInviteBoxListPayload = {
    mpage?: number;
    page?: number;
    invPerPage?: number;
    mcount?: number;
};

export type GetGroupInviteBoxListResponse = {
    invitations: {
        groupInfo: GroupInfo;
        inviterInfo: {
            id: string;
            dName: string;
            zaloName: string;
            avatar: string;
            avatar_25: string;
            accountStatus: number;
            type: number;
        };
        grCreatorInfo: {
            id: string;
            dName: string;
            zaloName: string;
            avatar: string;
            avatar_25: string;
            accountStatus: number;
            type: number;
        };
        /**
         * Expired timestamp max 7 days
         */
        expiredTs: string;
        type: number;
    }[];
    total: number;
    hasMore: boolean;
};
```

---

## `getGroupLinkDetail`

Lấy chi tiết đường dẫn mời tham gia nhóm (Link邀請) của một nhóm mà bạn đang tham gia.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/link/detail</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupLinkDetail(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupLinkDetail(groupId: string)
```

### Tham số

- `groupId`: The group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupLinkDetailResponse = {
    link?: string;
    expiration_date?: number;
    /**
     * 1: enabled, 0: disabled
     */
    enabled: number;
};
```

---

## `getGroupLinkInfo`

Tra cứu thông tin nhóm và danh sách thành viên theo trang từ đường dẫn nhóm công khai (https://zalo.me/g/...).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/link/ginfo</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupLinkInfo(payload: GetGroupLinkInfoPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupLinkInfo(payload: GetGroupLinkInfoPayload)
```

### Tham số

- `payload`: - The payload of the request

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupLinkInfoPayload = {
    link: string;
    /**
     * Default: 1
     */
    memberPage?: number;
};

export type GetGroupLinkInfoResponse = {
    groupId: string;
    name: string;
    desc: string;
    type: GroupType;
    creatorId: string;
    avt: string;
    fullAvt: string;
    adminIds: string[];
    currentMems: {
        id: string;
        dName: string;
        zaloName: string;
        avatar: string;
        avatar_25: string;
        accountStatus: number;
        type: number;
    }[];
    admins: unknown[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    setting: GroupSetting;
    globalId: string;
};
```

---

## `getGroupListV3`

Lấy danh sách nhóm theo trang kèm thông tin thành viên đại diện (`currentMems`) và gợi ý nhóm (`suggestGroup`) qua `/api/group/getlg/v3` (command 11161)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/getlg/v3</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupListV3(pageOrOptions: number | GetGroupListV3Options = 1)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupListV3(pageOrOptions: number | GetGroupListV3Options = 1)
```

### Tham số

- `pageOrOptions`: Số trang (mặc định: `1`) hoặc cấu hình `GetGroupListV3Options`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupListV3Options = {
    /**
     * Số trang cần lấy (mặc định: `1`).
     */
    page?: number;
    /**
     * Số lượng nhóm mỗi trang (mặc định: `100`).
     */
    count?: number;
};

export type GetGroupListV3Response = {
    groups: GroupInfo[];
    hasMore?: number | boolean;
    total?: number;
    suggestGroup?: unknown;
    [key: string]: unknown;
};
```

---

## `getGroupMembersInfo`

Giải mã hàng loạt thông tin hồ sơ thành viên (displayName, zaloName, avatar, globalId) từ danh sách UID qua /api/social/group/members.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/social/group/members</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupMembersInfo(memberId: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupMembersInfo(memberId: string | string[])
```

### Tham số

- `memberId`: member id or array of member ids

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GroupMemberProfile = {
    displayName: string;
    zaloName: string;
    avatar: string;
    accountStatus: number;
    type: number;
    lastUpdateTime: number;
    globalId: string;
    id: string;
};

export type GetGroupMembersInfoResponse = {
    profiles: {
        [memberId: string]: GroupMemberProfile;
    };
    unchangeds_profile: unknown[];
};
```

---

## `getGroupMessageStatus`

Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn của danh sách thành viên trong nhóm (command 12017)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/getStatusMsg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getGroupMessageStatus(groupIdOrItems: string | GetGroupMessageStatusQueryItem[], memberIds: string[] = [],)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupMessageStatus(groupIdOrItems: string | GetGroupMessageStatusQueryItem[], memberIds: string[] = [],)
```

### Tham số

- `groupIdOrItems`: ID nhóm (hoặc mảng cấu hình `{ tId, ids }`)
- `memberIds`: Danh sách UID thành viên cần kiểm tra (khi tham số đầu là `groupId`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GroupMessageStatusMemberItem = {
    id: string;
    seen?: string | number;
    deliver?: string | number;
    [key: string]: unknown;
};

export type GroupMessageStatusThreadInfo = {
    tId?: string;
    ids: GroupMessageStatusMemberItem[];
    [key: string]: unknown;
};

export type GetGroupMessageStatusQueryItem = {
    /**
     * ID nhóm (không có tiền tố `g`).
     */
    tId: string;
    /**
     * Danh sách UID thành viên cần truy vấn trạng thái `seen` / `deliver` trong nhóm.
     */
    ids: string[];
};

export type GetGroupMessageStatusResponse = {
    statusInfos: GroupMessageStatusThreadInfo[];
    [key: string]: unknown;
};
```

---

## `getMultiGroupCloudMessages`

Đồng bộ nhanh tin nhắn Cloud của nhiều nhóm cùng lúc theo danh sách `groupIds` (command 12503 - `syncCloudMsgFirstLogin`)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/cm/mget</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getMultiGroupCloudMessages(groupIds: string[], nretry: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.getMultiGroupCloudMessages(groupIds: string[], nretry: number = 0)
```

### Tham số

- `groupIds`: Danh sách ID nhóm cần tải tin nhắn Cloud
- `nretry`: Số lần thử lại (mặc định: `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetMultiGroupCloudMessagesResponse = {
    groupMsgs?: Record<string, unknown[]>;
    [key: string]: unknown;
};
```

---

## `getPendingGroupMembers`

Lấy danh sách các yêu cầu xin vào nhóm đang chờ Quản trị viên phê duyệt.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/pending-mems/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getPendingGroupMembers(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getPendingGroupMembers(groupId: string)
```

### Tham số

- `groupId`: - The id of the group to get the pending members

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetPendingGroupMembersUserInfo = {
    uid: string;
    dpn: string;
    avatar: string;
    user_submit: null;
};

export type GetPendingGroupMembersResponse = {
    time: number;
    users: GetPendingGroupMembersUserInfo[];
};
```

---

## `getQuotaCommunity`

Kiểm tra hạn mức nâng cấp nhóm lên Cộng đồng của tài khoản (command 12181)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/quota/community</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getQuotaCommunity(groupId: string | null = null, language: string = "vi")
// Hoặc gọi phẳng (Flat Alias):
await api.getQuotaCommunity(groupId: string | null = null, language: string = "vi")
```

### Tham số

- `groupId`: (Tùy chọn) ID của nhóm cần kiểm tra
- `language`: Ngôn ngữ thông báo (mặc định: `"vi"`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetQuotaCommunityResponse = {
    canUpgr: boolean;
    curComm: number;
    quotaComm: number;
    error_message_localize?: string;
    [key: string]: unknown;
};
```

---

## `getRelatedFriendGroup`

Kiểm tra danh sách các nhóm chung giữa tài khoản hiện tại và danh sách UID truyền vào qua /api/friend/group/related.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/friend/group/related</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.getRelatedFriendGroup(friendId: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.getRelatedFriendGroup(friendId: string | string[])
```

### Tham số

- `friendId`: friend ids

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetRelatedFriendGroupResponse = {
    groupRelateds: {
        [friendId: string]: string[];
    };
};
```

---

## `inviteUserToGroups`

Gửi lời mời tham gia một hoặc nhiều nhóm tới người dùng.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/invite/multi</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.inviteUserToGroups(userId: string, groupId: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.inviteUserToGroups(userId: string, groupId: string | string[])
```

### Tham số

- `groupId`: group ID(s)
- `memberId`: member ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type InviteUserToGroupsResponse = {
    grid_message_map: {
        [groupId: string]: {
            error_code: number;
            error_message: string;
            data: string | null;
        };
    };
};
```

---

## `joinGroupInviteBox`

Chấp nhận lời mời tham gia nhóm từ hộp thư lời mời.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/inv-box/join</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.joinGroupInviteBox(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.joinGroupInviteBox(groupId: string)
```

### Tham số

- `groupId`: - The group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type JoinGroupInviteBoxResponse = "";
```

---

## `joinGroupLink`

Tham gia vào nhóm thông qua đường dẫn liên kết mời (Group Link).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/link/join</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.joinGroupLink(link: string)
// Hoặc gọi phẳng (Flat Alias):
await api.joinGroupLink(link: string)
```

### Tham số

- `link`: - The link join group

### Kiểu dữ liệu (TypeScript Types)

```ts
export type JoinGroupLinkResponse = "";
```

---

## `leaveGroup`

Rời khỏi một hoặc nhiều nhóm chat (hỗ trợ rời nhóm im lặng silent).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/leave</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.leaveGroup(groupId: string, silent: boolean = false)
// Hoặc gọi phẳng (Flat Alias):
await api.leaveGroup(groupId: string, silent: boolean = false)
```

### Tham số

- `groupId`: - groupId to leave
- `silent`: - Turn on/off silent leave group

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LeaveGroupResponse = {
    memberError: unknown[];
};
```

---

## `removeGroupBlockedMember`

Gỡ chặn (Unblock) cho người dùng khỏi danh sách chặn của nhóm.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/blockedmems/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.removeGroupBlockedMember(memberId: string | string[], groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeGroupBlockedMember(memberId: string | string[], groupId: string)
```

### Tham số

- `memberId`: member id(s)
- `groupId`: group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveGroupBlockedMemberResponse = "";
```

---

## `removeGroupDeputy`

Cách chức Phó nhóm (thu hồi quyền Quản trị viên) của thành viên.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/admins/remove</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.removeGroupDeputy(memberId: string | string[], groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeGroupDeputy(memberId: string | string[], groupId: string)
```

### Tham số

- `memberId`: user Id or list of user Ids
- `groupId`: group Id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveGroupDeputyResponse = "";
```

---

## `removeUserFromGroup`

Mời ra khỏi nhóm (Kick) một hoặc nhiều thành viên.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/group/kickout</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.removeUserFromGroup(memberId: string | string[], groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.removeUserFromGroup(memberId: string | string[], groupId: string)
```

### Tham số

- `memberId`: User ID or list of user IDs to remove
- `groupId`: Group ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveUserFromGroupResponse = {
    errorMembers: string[];
};
```

---

## `reviewPendingMemberRequest`

Phê duyệt (Chấp nhận hoặc Từ chối) yêu cầu xin tham gia nhóm của thành viên mới.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/pending-mems/review</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.reviewPendingMemberRequest(payload: ReviewPendingMemberRequestPayload, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.reviewPendingMemberRequest(payload: ReviewPendingMemberRequestPayload, groupId: string)
```

### Tham số

- `payload`: - The payload containing data to review the pending member(s) request
- `groupId`: - The id of the group to review the pending member(s) request

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ReviewPendingMemberRequestPayload = {
    members: string | string[];
    isApprove: boolean;
};

export enum ReviewPendingMemberRequestStatus {
    SUCCESS = 0,
    NOT_IN_PENDING_LIST = 170,
    ALREADY_IN_GROUP = 178,
    INSUFFICIENT_PERMISSION = 166,
}

export type ReviewPendingMemberRequestResponse = {
    [memberId: string]: ReviewPendingMemberRequestStatus;
};
```

---

## `updateGroupSettings`

Cập nhật các thiết lập quyền hạn của nhóm (ẩn thành viên lockViewMember, duyệt thành viên joinAppr, khóa nhắn tin lockSendMsg...).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/setting/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.updateGroupSettings(options: UpdateGroupSettingsOptions, groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.updateGroupSettings(options: UpdateGroupSettingsOptions, groupId: string)
```

### Tham số

- `options`: Options
- `groupId`: Group ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateGroupSettingsOptions = {
    /**
     * Disallow group members to change the group name and avatar
     */
    blockName?: boolean;
    /**
     * Highlight messages from owner/admins
     */
    signAdminMsg?: boolean;
    /**
     * Don't pin messages, notes, and polls to the top of a conversation
     */
    setTopicOnly?: boolean;
    /**
     * Allow new members to read most recent messages
     */
    enableMsgHistory?: boolean;
    /**
     * Membership approval
     */
    joinAppr?: boolean;
    /**
     * Disallow group members to create notes & reminders
     */
    lockCreatePost?: boolean;
    /**
     * Disallow group members to create polls
     */
    lockCreatePoll?: boolean;
    /**
     * Disallow group members to send messages
     */
    lockSendMsg?: boolean;
    /**
     * Disallow group members to view full member list (community only)
     */
    lockViewMember?: boolean;

    // bannFeature?: boolean; // not see in UI, not implemented
    // addMemberOnly?: boolean; // not see in UI, not implemented
    // dirtyMedia?: boolean; // not see in UI, not implemented
    // banDuration?: boolean | number; // not see in UI, not implemented
};

export type UpdateGroupSettingsResponse = "";
```

---

## `upgradeGroupToCommunity`

Nâng cấp nhóm thường lên Cộng đồng (Community - tối đa 1000 thành viên).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/group/upgrade/community</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.group.upgradeGroupToCommunity(groupId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.upgradeGroupToCommunity(groupId: string)
```

### Tham số

- `groupId`: Group ID upgrade

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpgradeGroupToCommunityResponse = "";
```

---
