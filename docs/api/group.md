# Nhóm & Cộng đồng (Group)

> Namespace: `api.group` (hoặc gọi trực tiếp `api.<methodName>`) — **44 API**

Quản lý nhóm & Cộng đồng, lấy thông tin nhóm (V1/V2/V3/V4), lịch sử tin nhắn Cloud, trạng thái tin nhắn thành viên và phân quyền.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`addGroupBlockedMember`](#addgroupblockedmember) | `GET` | `/api/group/blockedmems/add` | Add group blocked member |
| [`addGroupDeputy`](#addgroupdeputy) | `GET` | `/api/group/admins/add` | Add group deputy |
| [`addUserToGroup`](#addusertogroup) | `POST` | `/api/group/invite/v2` | Add user to existing group |
| [`analyseGroup`](#analysegroup) | `GET` | `/api/group/analyse` | Lấy dữ liệu phân tích/thống kê của nhóm qua `/api/group/analyse` (command 12407) |
| [`changeGroupAvatar`](#changegroupavatar) | `POST` | `/api/group/upavatar` | Change group avatar |
| [`changeGroupName`](#changegroupname) | `POST` | `/api/group/updateinfo` | Change group name |
| [`changeGroupOwner`](#changegroupowner) | `GET` | `/api/group/change-owner` | Change group owner |
| [`checkQuotaCommunityMember`](#checkquotacommunitymember) | `GET` | `/api/group/quota/members-comm` | Kiểm tra điều kiện/hạn mức thành viên Cộng đồng đối với một thành viên cụ thể trong nhóm (command 12182) |
| [`createGroup`](#creategroup) | `POST` | `/api/group/create/v2` | Create a new group |
| [`deleteGroupInviteBox`](#deletegroupinvitebox) | `GET` | `/api/group/inv-box/mdel-inv` | Delete group invite box |
| [`disableGroupLink`](#disablegrouplink) | `GET` | `/api/group/link/disable` | Disable group link |
| [`disperseGroup`](#dispersegroup) | `POST` | `/api/group/disperse` | Disperse Group |
| [`enableGroupLink`](#enablegrouplink) | `GET` | `/api/group/link/new` | Enable and create new group link |
| [`getAllGroups`](#getallgroups) | `GET` | `/api/group/getlg/v4` | API `getAllGroups` thuộc phân hệ `group`. |
| [`getE2eeGroupList`](#gete2eegrouplist) | `GET` | `/api/group/getlg/e2ee` | Lấy danh sách các nhóm đang bật mã hóa đầu cuối E2EE (command 12146) |
| [`getExtraGroupInfo`](#getextragroupinfo) | `POST` | `/api/group/userctx/multiget` | Lấy ngữ cảnh và vai trò mở rộng của người dùng đối với nhiều nhóm (command 12607) |
| [`getGroupBlockedMember`](#getgroupblockedmember) | `GET` | `/api/group/blockedmems/list` | Get group blocked member |
| [`getGroupChatHistory`](#getgroupchathistory) | `GET` | `/api/cm/getoldv2`<br/>`/api/cm/getrecentv2` | Lấy lịch sử tin nhắn nhóm từ Zalo Cloud Message (hỗ trợ cả `/api/cm/getrecentv2` cmd 12506 và `/api/cm/getoldv2` cmd 12507) |
| [`getGroupCloudMessageJump`](#getgroupcloudmessagejump) | `GET` | `/api/cm/rgetv2` | Nhảy tới vị trí một tin nhắn nhóm cụ thể trên Zalo Cloud Message và lấy ngữ cảnh xung quanh (command 12508) |
| [`getGroupCloudMessagePath`](#getgroupcloudmessagepath) | `GET` | `/api/cm/getpath` | Lấy chuỗi tin nhắn nhóm theo đường dẫn nhảy tới một tin nhắn cụ thể (`globalMsgId` / `rGlobalMsgId`) qua `/api/cm/getpath` (command 12504) |
| [`getGroupHistoryLegacy`](#getgrouphistorylegacy) | `GET` | `/api/group/history` | Lấy lịch sử tin nhắn nhóm qua endpoint `/api/group/history` trên miền `group` (command 11240) |
| [`getGroupInfo`](#getgroupinfo) | `POST` | `/api/group/getmg-v2` | Get group information |
| [`getGroupInfoV2`](#getgroupinfov2) | `GET` | `/api/group/getgi`<br/>`/api/group/getgi/v2` | Lấy thông tin nhóm và danh sách thành viên theo trang qua `/api/group/getgi/v2` hoặc `/api/group/getgi` (command 11162) |
| [`getGroupInviteBoxInfo`](#getgroupinviteboxinfo) | `GET` | `/api/group/inv-box/inv-info` | Get group invite box info |
| [`getGroupInviteBoxList`](#getgroupinviteboxlist) | `GET` | `/api/group/inv-box/list` | Get group invite box list |
| [`getGroupLinkDetail`](#getgrouplinkdetail) | `GET` | `/api/group/link/detail` | Get group link detail |
| [`getGroupLinkInfo`](#getgrouplinkinfo) | `GET` | `/api/group/link/ginfo` | Get group link info |
| [`getGroupListV3`](#getgrouplistv3) | `GET` | `/api/group/getlg/v3` | Lấy danh sách nhóm theo trang kèm thông tin thành viên đại diện (`currentMems`) và gợi ý nhóm (`suggestGroup`) qua `/api/group/getlg/v3` (command 11161) |
| [`getGroupMembersInfo`](#getgroupmembersinfo) | `GET` | `/api/social/group/members` | Get group information |
| [`getGroupMessageStatus`](#getgroupmessagestatus) | `POST` | `/api/group/getStatusMsg` | Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn của danh sách thành viên trong nhóm (command 12017) |
| [`getMultiGroupCloudMessages`](#getmultigroupcloudmessages) | `GET` | `/api/cm/mget` | Đồng bộ nhanh tin nhắn Cloud của nhiều nhóm cùng lúc theo danh sách `groupIds` (command 12503 - `syncCloudMsgFirstLogin`) |
| [`getPendingGroupMembers`](#getpendinggroupmembers) | `GET` | `/api/group/pending-mems/list` | Get pending group members |
| [`getQuotaCommunity`](#getquotacommunity) | `GET` | `/api/group/quota/community` | Kiểm tra hạn mức nâng cấp nhóm lên Cộng đồng của tài khoản (command 12181) |
| [`getRelatedFriendGroup`](#getrelatedfriendgroup) | `POST` | `/api/friend/group/related` | Get related friend group |
| [`inviteUserToGroups`](#inviteusertogroups) | `GET` | `/api/group/invite/multi` | Invite user to group |
| [`joinGroupInviteBox`](#joingroupinvitebox) | `GET` | `/api/group/inv-box/join` | Join group invite box |
| [`joinGroupLink`](#joingrouplink) | `GET` | `/api/group/link/join` | Join group via invite link |
| [`leaveGroup`](#leavegroup) | `POST` | `/api/group/leave` | Leave group |
| [`removeGroupBlockedMember`](#removegroupblockedmember) | `GET` | `/api/group/blockedmems/remove` | Remove group blocked member |
| [`removeGroupDeputy`](#removegroupdeputy) | `GET` | `/api/group/admins/remove` | Remove group deputy |
| [`removeUserFromGroup`](#removeuserfromgroup) | `POST` | `/api/group/kickout` | Remove user from existing group |
| [`reviewPendingMemberRequest`](#reviewpendingmemberrequest) | `GET` | `/api/group/pending-mems/review` | Review pending member(s) request |
| [`updateGroupSettings`](#updategroupsettings) | `GET` | `/api/group/setting/update` | Update group settings |
| [`upgradeGroupToCommunity`](#upgradegrouptocommunity) | `GET` | `/api/group/upgrade/community` | Upgrade group to community |

---

## `addGroupBlockedMember`

Add group blocked member

- **Endpoint**: `GET /api/group/blockedmems/add`
- **Domain call**: `api.group.addGroupBlockedMember(memberId: string | string[], groupId: string)`
- **Alias phẳng**: `api.addGroupBlockedMember(memberId: string | string[], groupId: string)`

### Tham số

- `memberId`: member id(s)
- `groupId`: group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddGroupBlockedMemberResponse = "";
```

---

## `addGroupDeputy`

Add group deputy

- **Endpoint**: `GET /api/group/admins/add`
- **Domain call**: `api.group.addGroupDeputy(memberId: string | string[], groupId: string)`
- **Alias phẳng**: `api.addGroupDeputy(memberId: string | string[], groupId: string)`

### Tham số

- `memberId`: user Id or list of user Ids
- `groupId`: group Id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddGroupDeputyResponse = "";
```

---

## `addUserToGroup`

Add user to existing group

- **Endpoint**: `POST /api/group/invite/v2`
- **Domain call**: `api.group.addUserToGroup(memberId: string | string[], groupId: string)`
- **Alias phẳng**: `api.addUserToGroup(memberId: string | string[], groupId: string)`

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

- **Endpoint**: `GET /api/group/analyse`
- **Domain call**: `api.group.analyseGroup(groupId: string)`
- **Alias phẳng**: `api.analyseGroup(groupId: string)`

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

Change group avatar

- **Endpoint**: `POST /api/group/upavatar`
- **Domain call**: `api.group.changeGroupAvatar(avatarSource: AttachmentSource, groupId: string)`
- **Alias phẳng**: `api.changeGroupAvatar(avatarSource: AttachmentSource, groupId: string)`

### Tham số

- `avatarSource`: Attachment source, can be a file path or an Attachment object
- `groupId`: Group ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ChangeGroupAvatarResponse = "";
```

---

## `changeGroupName`

Change group name

- **Endpoint**: `POST /api/group/updateinfo`
- **Domain call**: `api.group.changeGroupName(name: string, groupId: string)`
- **Alias phẳng**: `api.changeGroupName(name: string, groupId: string)`

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

Change group owner

- **Endpoint**: `GET /api/group/change-owner`
- **Domain call**: `api.group.changeGroupOwner(memberId: string, groupId: string)`
- **Alias phẳng**: `api.changeGroupOwner(memberId: string, groupId: string)`

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

- **Endpoint**: `GET /api/group/quota/members-comm`
- **Domain call**: `api.group.checkQuotaCommunityMember(groupId: string, uid: string)`
- **Alias phẳng**: `api.checkQuotaCommunityMember(groupId: string, uid: string)`

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

Create a new group

- **Endpoint**: `POST /api/group/create/v2`
- **Domain call**: `api.group.createGroup(options: CreateGroupOptions)`
- **Alias phẳng**: `api.createGroup(options: CreateGroupOptions)`

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

Delete group invite box

- **Endpoint**: `GET /api/group/inv-box/mdel-inv`
- **Domain call**: `api.group.deleteGroupInviteBox(groupId: string | string[], blockFutureInvite: boolean = false)`
- **Alias phẳng**: `api.deleteGroupInviteBox(groupId: string | string[], blockFutureInvite: boolean = false)`

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

Disable group link

- **Endpoint**: `GET /api/group/link/disable`
- **Domain call**: `api.group.disableGroupLink(groupId: string)`
- **Alias phẳng**: `api.disableGroupLink(groupId: string)`

### Tham số

- `groupId`: The group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DisableGroupLinkResponse = "";
```

---

## `disperseGroup`

Disperse Group

- **Endpoint**: `POST /api/group/disperse`
- **Domain call**: `api.group.disperseGroup(groupId: string)`
- **Alias phẳng**: `api.disperseGroup(groupId: string)`

### Tham số

- `groupId`: Group ID to disperse Group from

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DisperseGroupResponse = "";
```

---

## `enableGroupLink`

Enable and create new group link

- **Endpoint**: `GET /api/group/link/new`
- **Domain call**: `api.group.enableGroupLink(groupId: string)`
- **Alias phẳng**: `api.enableGroupLink(groupId: string)`

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

- **Endpoint**: `GET /api/group/getlg/v4`
- **Domain call**: `api.group.getAllGroups()`
- **Alias phẳng**: `api.getAllGroups()`

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

- **Endpoint**: `GET /api/group/getlg/e2ee`
- **Domain call**: `api.group.getE2eeGroupList()`
- **Alias phẳng**: `api.getE2eeGroupList()`

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

- **Endpoint**: `POST /api/group/userctx/multiget`
- **Domain call**: `api.group.getExtraGroupInfo(groupIds: string[])`
- **Alias phẳng**: `api.getExtraGroupInfo(groupIds: string[])`

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

Get group blocked member

- **Endpoint**: `GET /api/group/blockedmems/list`
- **Domain call**: `api.group.getGroupBlockedMember(payload: GetGroupBlockedMemberPayload, groupId: string)`
- **Alias phẳng**: `api.getGroupBlockedMember(payload: GetGroupBlockedMemberPayload, groupId: string)`

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

- **Endpoint**: `GET /api/cm/getoldv2`, `GET /api/cm/getrecentv2`
- **Domain call**: `api.group.getGroupChatHistory(groupId: string, countOrOptions: number | GetGroupChatHistoryOptions = 50,)`
- **Alias phẳng**: `api.getGroupChatHistory(groupId: string, countOrOptions: number | GetGroupChatHistoryOptions = 50,)`

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

- **Endpoint**: `GET /api/cm/rgetv2`
- **Domain call**: `api.group.getGroupCloudMessageJump(groupId: string, globalMsgId: string | number, count: number = 20, msgJump: number = 1, msgIds: Array<string | number> = [],)`
- **Alias phẳng**: `api.getGroupCloudMessageJump(groupId: string, globalMsgId: string | number, count: number = 20, msgJump: number = 1, msgIds: Array<string | number> = [],)`

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

- **Endpoint**: `GET /api/cm/getpath`
- **Domain call**: `api.group.getGroupCloudMessagePath(options: GetGroupCloudMessagePathOptions)`
- **Alias phẳng**: `api.getGroupCloudMessagePath(options: GetGroupCloudMessagePathOptions)`

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

- **Endpoint**: `GET /api/group/history`
- **Domain call**: `api.group.getGroupHistoryLegacy(groupId: string, count: number = 20)`
- **Alias phẳng**: `api.getGroupHistoryLegacy(groupId: string, count: number = 20)`

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

Get group information

- **Endpoint**: `POST /api/group/getmg-v2`
- **Domain call**: `api.group.getGroupInfo(groupId: string | string[])`
- **Alias phẳng**: `api.getGroupInfo(groupId: string | string[])`

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

- **Endpoint**: `GET /api/group/getgi`, `GET /api/group/getgi/v2`
- **Domain call**: `api.group.getGroupInfoV2(groupId: string, pageOrOptions: number | GetGroupInfoV2Options = 1,)`
- **Alias phẳng**: `api.getGroupInfoV2(groupId: string, pageOrOptions: number | GetGroupInfoV2Options = 1,)`

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

Get group invite box info

- **Endpoint**: `GET /api/group/inv-box/inv-info`
- **Domain call**: `api.group.getGroupInviteBoxInfo(payload: GetGroupInviteBoxInfoPayload)`
- **Alias phẳng**: `api.getGroupInviteBoxInfo(payload: GetGroupInviteBoxInfoPayload)`

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

Get group invite box list

- **Endpoint**: `GET /api/group/inv-box/list`
- **Domain call**: `api.group.getGroupInviteBoxList(payload?: GetGroupInviteBoxListPayload)`
- **Alias phẳng**: `api.getGroupInviteBoxList(payload?: GetGroupInviteBoxListPayload)`

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

Get group link detail

- **Endpoint**: `GET /api/group/link/detail`
- **Domain call**: `api.group.getGroupLinkDetail(groupId: string)`
- **Alias phẳng**: `api.getGroupLinkDetail(groupId: string)`

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

Get group link info

- **Endpoint**: `GET /api/group/link/ginfo`
- **Domain call**: `api.group.getGroupLinkInfo(payload: GetGroupLinkInfoPayload)`
- **Alias phẳng**: `api.getGroupLinkInfo(payload: GetGroupLinkInfoPayload)`

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

- **Endpoint**: `GET /api/group/getlg/v3`
- **Domain call**: `api.group.getGroupListV3(pageOrOptions: number | GetGroupListV3Options = 1)`
- **Alias phẳng**: `api.getGroupListV3(pageOrOptions: number | GetGroupListV3Options = 1)`

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

Get group information

- **Endpoint**: `GET /api/social/group/members`
- **Domain call**: `api.group.getGroupMembersInfo(memberId: string | string[])`
- **Alias phẳng**: `api.getGroupMembersInfo(memberId: string | string[])`

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

- **Endpoint**: `POST /api/group/getStatusMsg`
- **Domain call**: `api.group.getGroupMessageStatus(groupIdOrItems: string | GetGroupMessageStatusQueryItem[], memberIds: string[] = [],)`
- **Alias phẳng**: `api.getGroupMessageStatus(groupIdOrItems: string | GetGroupMessageStatusQueryItem[], memberIds: string[] = [],)`

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

- **Endpoint**: `GET /api/cm/mget`
- **Domain call**: `api.group.getMultiGroupCloudMessages(groupIds: string[], nretry: number = 0)`
- **Alias phẳng**: `api.getMultiGroupCloudMessages(groupIds: string[], nretry: number = 0)`

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

Get pending group members

- **Endpoint**: `GET /api/group/pending-mems/list`
- **Domain call**: `api.group.getPendingGroupMembers(groupId: string)`
- **Alias phẳng**: `api.getPendingGroupMembers(groupId: string)`

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

- **Endpoint**: `GET /api/group/quota/community`
- **Domain call**: `api.group.getQuotaCommunity(groupId: string | null = null, language: string = "vi")`
- **Alias phẳng**: `api.getQuotaCommunity(groupId: string | null = null, language: string = "vi")`

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

Get related friend group

- **Endpoint**: `POST /api/friend/group/related`
- **Domain call**: `api.group.getRelatedFriendGroup(friendId: string | string[])`
- **Alias phẳng**: `api.getRelatedFriendGroup(friendId: string | string[])`

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

Invite user to group

- **Endpoint**: `GET /api/group/invite/multi`
- **Domain call**: `api.group.inviteUserToGroups(userId: string, groupId: string | string[])`
- **Alias phẳng**: `api.inviteUserToGroups(userId: string, groupId: string | string[])`

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

Join group invite box

- **Endpoint**: `GET /api/group/inv-box/join`
- **Domain call**: `api.group.joinGroupInviteBox(groupId: string)`
- **Alias phẳng**: `api.joinGroupInviteBox(groupId: string)`

### Tham số

- `groupId`: - The group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type JoinGroupInviteBoxResponse = "";
```

---

## `joinGroupLink`

Join group via invite link

- **Endpoint**: `GET /api/group/link/join`
- **Domain call**: `api.group.joinGroupLink(link: string)`
- **Alias phẳng**: `api.joinGroupLink(link: string)`

### Tham số

- `link`: - The link join group

### Kiểu dữ liệu (TypeScript Types)

```ts
export type JoinGroupLinkResponse = "";
```

---

## `leaveGroup`

Leave group

- **Endpoint**: `POST /api/group/leave`
- **Domain call**: `api.group.leaveGroup(groupId: string, silent: boolean = false)`
- **Alias phẳng**: `api.leaveGroup(groupId: string, silent: boolean = false)`

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

Remove group blocked member

- **Endpoint**: `GET /api/group/blockedmems/remove`
- **Domain call**: `api.group.removeGroupBlockedMember(memberId: string | string[], groupId: string)`
- **Alias phẳng**: `api.removeGroupBlockedMember(memberId: string | string[], groupId: string)`

### Tham số

- `memberId`: member id(s)
- `groupId`: group id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveGroupBlockedMemberResponse = "";
```

---

## `removeGroupDeputy`

Remove group deputy

- **Endpoint**: `GET /api/group/admins/remove`
- **Domain call**: `api.group.removeGroupDeputy(memberId: string | string[], groupId: string)`
- **Alias phẳng**: `api.removeGroupDeputy(memberId: string | string[], groupId: string)`

### Tham số

- `memberId`: user Id or list of user Ids
- `groupId`: group Id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveGroupDeputyResponse = "";
```

---

## `removeUserFromGroup`

Remove user from existing group

- **Endpoint**: `POST /api/group/kickout`
- **Domain call**: `api.group.removeUserFromGroup(memberId: string | string[], groupId: string)`
- **Alias phẳng**: `api.removeUserFromGroup(memberId: string | string[], groupId: string)`

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

Review pending member(s) request

- **Endpoint**: `GET /api/group/pending-mems/review`
- **Domain call**: `api.group.reviewPendingMemberRequest(payload: ReviewPendingMemberRequestPayload, groupId: string)`
- **Alias phẳng**: `api.reviewPendingMemberRequest(payload: ReviewPendingMemberRequestPayload, groupId: string)`

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

Update group settings

- **Endpoint**: `GET /api/group/setting/update`
- **Domain call**: `api.group.updateGroupSettings(options: UpdateGroupSettingsOptions, groupId: string)`
- **Alias phẳng**: `api.updateGroupSettings(options: UpdateGroupSettingsOptions, groupId: string)`

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

Upgrade group to community

- **Endpoint**: `GET /api/group/upgrade/community`
- **Domain call**: `api.group.upgradeGroupToCommunity(groupId: string)`
- **Alias phẳng**: `api.upgradeGroupToCommunity(groupId: string)`

### Tham số

- `groupId`: Group ID upgrade

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpgradeGroupToCommunityResponse = "";
```

---
