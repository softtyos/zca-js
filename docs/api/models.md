---
title: "Models, Enums & Errors Reference - Kiểu dữ liệu & Hằng số"
description: "Tra cứu đầy đủ toàn bộ các Enum (ThreadType, Reactions, GroupEventType, FriendEventType...) và các Model dữ liệu gốc trong @softtynet/zca-js."
---

# 📦 Models, Enums & Errors Reference

Trang này tổng hợp toàn bộ các **Hằng số (`Enum`)**, **Lớp dữ liệu (`Model`)** và **Lớp ngoại lệ (`ZaloApiError`)** được xuất trực tiếp từ gói `@softtynet/zca-js`:

```ts
import {
    ThreadType,
    DestType,
    Gender,
    Reactions,
    GroupEventType,
    FriendEventType,
    BoardType,
    CallType,
    CallEventType,
    SyncEventType,
    ZaloApiError,
} from "@softtynet/zca-js";
```

---

## ⚠️ Lớp Ngoại lệ & Xử lý lỗi (`Errors`)

### `ZaloApiError`
```ts
export class ZaloApiError extends Error {
    public code: number | null;

    constructor(message: string, code?: number) {
        super(message);

        this.name = "ZcaApiError";
        this.code = code || null;
    }
}
```

### `ZaloApiLoginQRAborted`
```ts
import { ZaloApiError } from "./ZaloApiError.js";

export class ZaloApiLoginQRAborted extends ZaloApiError {
    constructor(message: string = "Operation aborted") {
        super(message);
        this.name = "ZaloApiLoginQRAborted";
    }
}
```

### `ZaloApiLoginQRDeclined`
```ts
import { ZaloApiError } from "./ZaloApiError.js";

export class ZaloApiLoginQRDeclined extends ZaloApiError {
    constructor(message: string = "Login QR request declined") {
        super(message);
        this.name = "ZaloApiLoginQRDeclined";
    }
}
```

### `ZaloApiMissingImageMetadataGetter`
```ts
import { ZaloApiError } from "./ZaloApiError.js";

export class ZaloApiMissingImageMetadataGetter extends ZaloApiError {
    constructor() {
        super("Missing `imageMetadataGetter`. Please provide it in the Zalo object options.");
        this.name = "ZaloApiMissingImageMetadataGetter";
    }
}
```

---

## 📐 Các Hằng số (`Enums`) & Mô hình Dữ liệu (`Models`)

### `Attachment`
```ts
export type AttachmentSource =
    | string
    | {
          data: Buffer;
          filename: `${string}.${string}`;
          metadata: {
              totalSize: number;
              width?: number;
              height?: number;
          };
      };
```

### `AutoReply`
```ts
export type AutoReplyItem = {
    id: number;
    weight: number;
    enable: boolean;
    modifiedTime: number;
    startTime: number;
    endTime: number;
    content: string;
    scope: AutoReplyScope;
    uids: string[] | null;
    ownerId: number;
    recurrence: string[];
    createdTime: number;
};

export enum AutoReplyScope {
    Everyone = 0,
    Stranger = 1,
    SpecificFriends = 2,
    FriendsExcept = 3
}
```

### `Bank`
```ts
export type BankInfo = {
    bin: number;
    logo: string;
    name: string;
    name_eng: string;
    short_name: string;
    search_key_word: string;
};

export type BankAccount = {
    id: string;
    bin: number;
    default: boolean;
    bank_number: string;
    /**
     * Not returned by:
     * - getBankAccounts
     * - createBankAccount
     */
    bank_logo?: string;
    holder_name: string;
    created_at: number;
    updated_at: number;
    account_id: number;
    /**
     * Not returned by:
     * - getBankAccounts
     * - createBankAccount
     */
    bank_name?: string;
    is_default: boolean;
};

/**
 * @note Bank codes list after Mitm on Mobile, WEB and Bank's supported by Zalo
 * @documents https://developers.zalo.me/docs/zalo-notification-service/phu-luc/danh-sach-bin-code - docs missing bin code and short_name bank
 */
export enum BinBankCard {
    /**
     * NH TMCP An Bình
     */
    ABBank = 970425,
    /**
     * NH TMCP Á Châu
     */
    ACB = 970416,
    /**
     * NH Nông nghiệp và Phát triển Nông thôn Việt Nam
     */
    Agribank = 970405,
    /**
     * NH TMCP Đầu tư và Phát triển Việt Nam
     */
    BIDV = 970418,
    /**
     * Ngân hàng BNP Paribas - CN TP. Hồ Chí Minh
     */
    BNP_Paribas_HCM = 963666,
    /**
     * Ngân hàng BNP Paribas - CN Hà Nội
     */
    BNP_Paribas_HN = 963668,
    /**
     * NH TMCP Bản Việt
     */
    BVBank = 970454,
    /**
     * NH TMCP Bắc Á
     */
    BacA_Bank = 970409,
    /**
     * NH TMCP Bảo Việt
     */
    BaoViet_Bank = 970438,
    /**
     * NH số CAKE by VPBank - TMCP Việt Nam Thịnh Vượng
     */
    CAKE = 546034,
    /**
     * Ngân hàng Cathay United - CN TP. Hồ Chí Minh
     */
    Cathay_United_HCM = 168999,
    /**
     * NH Thương mại TNHH MTV Xây dựng Việt Nam
     *
     * @note Also observed as "VCBNeo" in supported banks list (same bin) - Old is bank: CB_Bank
     */
    VCBNeo = 970444,
    /**
     * NH TNHH MTV CIMB Việt Nam
     */
    CIMB_Bank = 422589,
    /**
     * NH Hợp tác xã Việt Nam
     */
    Coop_Bank = 970446,
    /**
     * NH TNHH MTV Phát triển Singapore - CN TP. Hồ Chí Minh
     */
    DBS_Bank = 796500,
    /**
     * NH TMCP Đông Á
     */
    DongA_Bank = 970406,
    /**
     * NH TMCP Xuất Nhập khẩu Việt Nam
     */
    Eximbank = 970431,
    /**
     * Ngân hàng Citibank Việt Nam
     */
    Citibank = 533948,
    /**
     * NH TMCP Dầu khí Toàn cầu
     */
    GPBank = 970408,
    /**
     * NH TMCP Phát triển TP. Hồ Chí Minh
     */
    HDBank = 970437,
    /**
     * NH TNHH MTV HSBC (Việt Nam)
     */
    HSBC = 458761,
    /**
     * NH TNHH MTV Hong Leong Việt Nam
     */
    HongLeong_Bank = 970442,
    /**
     * NH Công nghiệp Hàn Quốc - CN TP. Hồ Chí Minh
     */
    IBK_HCM = 970456,
    /**
     * NH Công nghiệp Hàn Quốc - CN Hà Nội
     */
    IBK_HN = 970455,
    /**
     * NH TNHH Indovina
     */
    Indovina_Bank = 970434,
    /**
     * NH Đại chúng TNHH Kasikornbank - CN TP. Hồ Chí Minh
     */
    KBank = 668888,
    /**
     * NH TMCP Kiên Long
     */
    KienlongBank = 970452,
    /**
     * NH Kookmin - CN TP. Hồ Chí Minh
     */
    Kookmin_Bank_HCM = 970463,
    /**
     * NH Kookmin - CN Hà Nội
     */
    Kookmin_Bank_HN = 970462,
    /**
     * Liobank by OCB
     */
    Liobank = 963369,
    /**
     * NH TMCP Lộc Phát Việt Nam
     */
    LPBank = 970449,
    /**
     * NH TMCP Quân đội
     */
    MB_Bank = 970422,
    /**
     * NH TMCP Hàng Hải
     */
    MSB = 970426,
    /**
     * MoMo
     */
    MoMo = 971025,
    /**
     * NH TMCP Quốc Dân
     */
    NCB = 970419,
    /**
     * NH TMCP Nam Á
     */
    Nam_A_Bank = 970428,
    /**
     * NH Nonghyup - CN Hà Nội
     */
    NongHyup_Bank = 801011,
    /**
     * NH TMCP Phương Đông
     */
    OCB = 970448,
    /**
     * NH Thương mại TNHH MTV Đại Dương
     */
    Ocean_Bank = 970414,
    /**
     * NH TMCP Thịnh vượng và Phát triển
     */
    PGBank = 970430,
    /**
     * NH TMCP Đại Chúng Việt Nam
     */
    PVcomBank = 970412,
    /**
     * NH TNHH MTV Public Việt Nam
     */
    Public_Bank_Vietnam = 970439,
    /**
     * NH TMCP Sài Gòn
     */
    SCB = 970429,
    /**
     * NH TMCP Sài Gòn - Hà Nội
     */
    SHB = 970443,
    /**
     * NH TMCP Sài Gòn Thương Tín
     */
    Sacombank = 970403,
    /**
     * NH TMCP Sài Gòn Công Thương
     */
    Saigon_Bank = 970400,
    /**
     * NH TMCP Đông Nam Á
     */
    SeABank = 970440,
    /**
     * NH TNHH MTV Shinhan Việt Nam
     */
    Shinhan_Bank = 970424,
    /**
     * NH TNHH MTV Standard Chartered Bank Việt Nam
     */
    Standard_Chartered_Vietnam = 970410,
    /**
     * NH số TNEX
     */
    TNEX = 963326,
    /**
     * NH TMCP Tiên Phong
     */
    TPBank = 970423,
    /**
     * NH TMCP Kỹ thương Việt Nam
     */
    Techcombank = 970407,
    /**
     * NH số Timo by Bản Việt Bank
     */
    Timo = 963388,
    /**
     * NH số UBank by VPBank
     */
    UBank = 546035,
    /**
     * NH United Overseas Bank Việt Nam
     */
    United_Overseas_Bank_Vietnam = 970458,
    /**
     * NH TMCP Quốc tế Việt Nam
     */
    VIB = 970441,
    /**
     * NH TMCP Việt Nam Thịnh Vượng
     */
    VPBank = 970432,
    /**
     * NH Liên doanh Việt - Nga
     */
    VRB = 970421,
    /**
     * NH TMCP Việt Á
     */
    VietABank = 970427,
    /**
     * NH TMCP Việt Nam Thương Tín
     */
    VietBank = 970433,
    /**
     * NH TMCP Ngoại Thương Việt Nam
     */
    Vietcombank = 970436,
    /**
     * NH TMCP Công thương Việt Nam
     */
    VietinBank = 970415,
    /**
     * NH TNHH MTV Woori Việt Nam
     */
    Woori_Bank = 970457,
};
```

### `Board`
```ts
export enum BoardType {
    Note = 1,
    PinnedMessage = 2,
    Poll = 3,
}

export type PollDetail = {
    creator: string;
    question: string;
    options: PollOptions[];
    joined: boolean;
    closed: boolean;
    poll_id: number;
    allow_multi_choices: boolean;
    allow_add_new_option: boolean;
    is_anonymous: boolean;
    poll_type: number;
    created_time: number;
    updated_time: number;
    expired_time: number;
    is_hide_vote_preview: boolean;
    num_vote: number;
};

export type PollOptions = {
    content: string;
    votes: number;
    voted: boolean;
    voters: string[];
    option_id: number;
};

export type NoteDetail = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: {
        title: string;
        extra?: string;
    };
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};

export type PinnedMessageDetail = {
    id: string;
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: Record<string, unknown>; // @TODO: Define a more specific type
    creatorId: string;
    editorId: string;
    createTime: number;
    editTime: number;
    repeat: number;
};
```

### `CallEvent`
```ts
export enum CallEventType {
    REQUEST = "request",
    ANSWER = "answer",
    CANCEL = "cancel",
    END = "end",
    RINGRING = "ringring",
    GROUP_REQUEST = "group_request",
    GROUP_ANSWER = "group_answer",
    UNKNOWN = "unknown",
}

export type TCallEventData = {
    callId?: number;
    call_id?: number;
    uidN?: string | number;
    callerId?: string | number;
    calleeId?: string | number;
    session?: string;
    sessId?: string;
    status?: number;
    callType?: number;
    ts?: number | string;
    [key: string]: unknown;
};

export type CallEvent = {
    type: CallEventType;
    act: string;
    act_type: string;
    data: TCallEventData;
};

export function initializeCallEvent(data: TCallEventData, act: string, act_type: string): CallEvent {
    let type = CallEventType.UNKNOWN;
    switch (act) {
        case "request":
            type = CallEventType.REQUEST;
            break;
        case "answer":
            type = CallEventType.ANSWER;
            break;
        case "cancel":
            type = CallEventType.CANCEL;
            break;
        case "end":
        case "endcall":
            type = CallEventType.END;
            break;
        case "ringring":
            type = CallEventType.RINGRING;
            break;
        case "group_request":
            type = CallEventType.GROUP_REQUEST;
            break;
        case "group_answer":
            type = CallEventType.GROUP_ANSWER;
            break;
        default:
            type = CallEventType.UNKNOWN;
            break;
    }

    return {
        type,
        act,
        act_type,
        data,
    };
}
```

### `Catalog`
```ts
export type CatalogItem = {
    id: string;
    name: string;
    version: number;
    ownerId: string;
    isDefault: boolean;
    /**
     * Relative path used to build the catalog URL.
     *
     * Example: `https://catalog.zalo.me/${path}`
     */
    path: string;
    catalogPhoto: string | null;
    totalProduct: number;
    created_time: number;
};
```

### `ClearUnread`
```ts
import { ThreadType } from "./Enum.js";

export type TClearUnreadItem = {
    idTo: string;
    userName?: string;
    lastMsgId: string;
    isGroup: number;
    ts?: number;
    type?: number;
};

export type TClearUnreads = {
    clearUnreads: TClearUnreadItem[];
};

export class ClearUnread {
    idTo: string;
    userName?: string;
    lastMsgId: string;
    isGroup: boolean;
    threadType: ThreadType;
    ts?: number;
    type?: number;

    constructor(data: TClearUnreadItem) {
        this.idTo = data.idTo;
        this.userName = data.userName;
        this.lastMsgId = data.lastMsgId;
        this.isGroup = data.isGroup === 1;
        this.threadType = data.isGroup === 1 ? ThreadType.Group : ThreadType.User;
        this.ts = data.ts;
        this.type = data.type;
    }
}
```

### `DeliveredMessage`
```ts
import { ThreadType } from "./Enum.js";

export type TDeliveredMessage = {
    msgId: string;
    seen: number;
    deliveredUids: string[];
    seenUids: string[];
    realMsgId: string;
    mSTs: number;
};

export type TGroupDeliveredMessage = TDeliveredMessage & {
    groupId: string;
};

export class UserDeliveredMessage {
    type: ThreadType.User = ThreadType.User;

    data: TDeliveredMessage;
    threadId: string;
    isSelf: false;

    constructor(data: TDeliveredMessage) {
        this.data = data;
        this.threadId = data.deliveredUids[0];
        this.isSelf = false;
    }
}

export class GroupDeliveredMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupDeliveredMessage;
    threadId: string;
    isSelf: boolean;

    constructor(uid: string, data: TGroupDeliveredMessage) {
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.deliveredUids.includes(uid);
    }
}

export type DeliveredMessage = UserDeliveredMessage | GroupDeliveredMessage;
```

### `Enum`
```ts
export enum ThreadType {
    User,
    Group,
}

export enum DestType {
    Group = 1,
    User = 3,
    Page = 5,
}

export enum Gender {
    Male = 0,
    Female = 1,
}

export enum AvatarSize {
    Small = 120,
    /** @experimental Use only if you know what you're doing. */
    Medium = 180,
    Large = 240,
    /** @experimental Use only if you know what you're doing. */
    ExtraLarge = 360,
}
```

### `FriendEvent`
```ts
export enum FriendEventType {
    ADD,
    REMOVE,

    REQUEST,
    UNDO_REQUEST,
    REJECT_REQUEST,

    SEEN_FRIEND_REQUEST,

    BLOCK,
    UNBLOCK,
    BLOCK_CALL,
    UNBLOCK_CALL,

    PIN_UNPIN,
    PIN_CREATE,

    UNKNOWN,
}

export type TFriendEventBase = string;

export type TFriendEventRejectUndo = {
    toUid: string;
    fromUid: string;
};

export type TFriendEventRequest = {
    toUid: string;
    fromUid: string;
    src: number;
    message: string;
};

export type TFriendEventSeenRequest = string[];

export type TFriendEventPinCreateTopicParams = {
    senderUid: string;
    senderName: string;
    client_msg_id: string;
    global_msg_id: string;
    msg_type: number;
    title: string;
};

export type TFriendEventPinTopic = {
    topicId: string;
    topicType: number;
};

export type TFriendEventPinCreateTopic = {
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: TFriendEventPinCreateTopicParams;
    id: string;
    creatorId: string;
    createTime: number;
    editorId: string;
    editTime: number;
    repeat: number;
    action: number;
};

export type TFriendEventPinCreate = {
    oldTopic?: TFriendEventPinTopic;
    topic: TFriendEventPinCreateTopic;
    actorId: string;
    oldVersion: number;
    version: number;
    conversationId: string;
};

export type TFriendEventPinUnpin = {
    topic: TFriendEventPinTopic;
    actorId: string;
    oldVersion: number;
    version: number;
    conversationId: string;
};

export type TFriendEvent =
    | TFriendEventBase
    | TFriendEventRequest
    | TFriendEventRejectUndo
    | TFriendEventSeenRequest
    | TFriendEventPinUnpin
    | TFriendEventPinCreate;

export type FriendEvent =
    | {
          type:
              | FriendEventType.ADD
              | FriendEventType.REMOVE
              | FriendEventType.BLOCK
              | FriendEventType.UNBLOCK
              | FriendEventType.BLOCK_CALL
              | FriendEventType.UNBLOCK_CALL;
          data: TFriendEventBase;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.REJECT_REQUEST | FriendEventType.UNDO_REQUEST;
          data: TFriendEventRejectUndo;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.REQUEST;
          data: TFriendEventRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.SEEN_FRIEND_REQUEST;
          data: TFriendEventSeenRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.PIN_CREATE;
          data: TFriendEventPinCreate;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.PIN_UNPIN;
          data: TFriendEventPinUnpin;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: FriendEventType.UNKNOWN;
          data: string;
          threadId: string;
          isSelf: boolean;
      };

export function initializeFriendEvent(uid: string, data: TFriendEvent, type: FriendEventType): FriendEvent {
    if (
        type == FriendEventType.ADD ||
        type == FriendEventType.REMOVE ||
        type == FriendEventType.BLOCK ||
        type == FriendEventType.UNBLOCK ||
        type == FriendEventType.BLOCK_CALL ||
        type == FriendEventType.UNBLOCK_CALL
    ) {
        return {
            type,
            data: data as TFriendEventBase,
            threadId: data as string,
            isSelf: ![FriendEventType.ADD, FriendEventType.REMOVE].includes(type),
        };
    } else if (type == FriendEventType.REJECT_REQUEST || type == FriendEventType.UNDO_REQUEST) {
        const threadId = (data as TFriendEventRejectUndo).toUid;
        return {
            type,
            data: data as TFriendEventRejectUndo,
            threadId,
            isSelf: (data as TFriendEventRequest).fromUid == uid,
        };
    } else if (type == FriendEventType.REQUEST) {
        const threadId = (data as TFriendEventRequest).toUid;
        return {
            type,
            data: data as TFriendEventRequest,
            threadId,
            isSelf: (data as TFriendEventRequest).fromUid == uid,
        };
    } else if (type == FriendEventType.SEEN_FRIEND_REQUEST) {
        return {
            type,
            data: data as TFriendEventSeenRequest,
            threadId: uid,
            isSelf: true,
        };
    } else if (type == FriendEventType.PIN_CREATE) {
        const threadId = (data as TFriendEventPinCreate).conversationId;
        return {
            type,
            data: data as TFriendEventPinCreate,
            threadId,
            isSelf: (data as TFriendEventPinCreate).actorId == uid,
        };
    } else if (type == FriendEventType.PIN_UNPIN) {
        const threadId = (data as TFriendEventPinUnpin).conversationId;
        return {
            type,
            data: data as TFriendEventPinUnpin,
            threadId,
            isSelf: (data as TFriendEventPinUnpin).actorId == uid,
        };
    } else {
        return {
            type: FriendEventType.UNKNOWN,
            data: JSON.stringify(data),
            threadId: "",
            isSelf: false,
        };
    }
}
```

### `Group`
```ts
export type GroupSetting = {
    blockName: number;
    signAdminMsg: number;
    addMemberOnly: number;
    setTopicOnly: number;
    enableMsgHistory: number;
    joinAppr: number;
    lockCreatePost: number;
    lockCreatePoll: number;
    lockSendMsg: number;
    lockViewMember: number;
    bannFeature: number;
    dirtyMedia: number;
    banDuration: number;
};

export enum GroupTopicType {
    Note = 0,
    Message = 2,
    Poll = 3,
}

export type GroupTopicNoteParams = {
    client_msg_id: string;
    global_msg_id: string;
    title: string;
};

export type GroupTopicTextMessageParams = {
    senderUid: string;
    senderName: string;
    client_msg_id: string;
    global_msg_id: string;
    msg_type: 1;
    title: string;
};

export type GroupTopicVoiceMessageParams = GroupTopicImageMessageParams & {
    msg_type: 31;
};

export type GroupTopicImageMessageParams = GroupTopicTextMessageParams & {
    msg_type: 32;
    thumb: string;
};

export type GroupTopicVideoMessageParams = GroupTopicTextMessageParams & {
    msg_type: 44;
    thumb: string;
};

export type GroupTopicFileMessageParams = GroupTopicTextMessageParams & {
    msg_type: 46;
    extra: {
        fileSize: string;
        checksum: string;
        checksumSha: unknown;
        fileExt: string;
        fdata: string;
        fType: number;
    };
};

export type GroupTopicGifMessageParams = GroupTopicTextMessageParams & {
    msg_type: 49;
    thumb: string;
};

export type GroupTopicMessageParams =
    | GroupTopicTextMessageParams
    | GroupTopicVoiceMessageParams
    | GroupTopicImageMessageParams
    | GroupTopicVideoMessageParams
    | GroupTopicFileMessageParams
    | GroupTopicGifMessageParams;

export type GroupTopicPollParams = {
    pollId: number;
    title: string;
};

export type GroupTopicOtherParams = {
    [key: string]: unknown;
};

export type GroupTopic = {
    type: GroupTopicType;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: GroupTopicNoteParams | GroupTopicMessageParams | GroupTopicPollParams | GroupTopicOtherParams;
    id: string;
    creatorId: string;
    createTime: number;
    editorId: string;
    editTime: number;
    repeat: number;
    action: number;
};

export enum GroupType {
    Group = 1,
    Community = 2,
}

export type GroupCurrentMem = {
    id: string;
    dName: string;
    zaloName: string;
    avatar: string;
    avatar_25: string;
    accountStatus: number;
    type: number;
};

export type GroupInfo = {
    groupId: string;
    name: string;
    desc: string;
    type: GroupType;
    creatorId: string;
    version: string;
    avt: string;
    fullAvt: string;
    memberIds: string[];
    adminIds: string[];
    currentMems: GroupCurrentMem[];
    updateMems: unknown[];
    admins: unknown[];
    hasMoreMember: number;
    subType: number;
    totalMember: number;
    maxMember: number;
    setting: GroupSetting;
    createdTime: number;
    visibility: number;
    globalId: string;
    /**
     * 1: True, 0: False
     */
    e2ee: number;
    extraInfo: {
        enable_media_store: number;
    };
};
```

### `GroupEvent`
```ts
import type { GroupSetting, GroupTopic } from "./Group.js";
import type { ReminderGroup } from "./Reminder.js";

export enum GroupEventType {
    JOIN_REQUEST = "join_request",
    JOIN = "join",
    LEAVE = "leave",
    REMOVE_MEMBER = "remove_member",
    BLOCK_MEMBER = "block_member",

    UPDATE_SETTING = "update_setting",
    UPDATE = "update",
    NEW_LINK = "new_link",

    ADD_ADMIN = "add_admin",
    REMOVE_ADMIN = "remove_admin",

    NEW_PIN_TOPIC = "new_pin_topic",
    UPDATE_PIN_TOPIC = "update_pin_topic",
    REORDER_PIN_TOPIC = "reorder_pin_topic",

    UPDATE_BOARD = "update_board",
    REMOVE_BOARD = "remove_board",

    UPDATE_TOPIC = "update_topic",
    UNPIN_TOPIC = "unpin_topic",
    REMOVE_TOPIC = "remove_topic",

    ACCEPT_REMIND = "accept_remind",
    REJECT_REMIND = "reject_remind",
    REMIND_TOPIC = "remind_topic",

    UPDATE_AVATAR = "update_avatar",

    UNKNOWN = "unknown",
}

export type GroupEventUpdateMember = {
    id: string;
    dName: string;
    avatar: string;
    type: number;
    avatar_25: string;
};

export type GroupEventGroupInfo = {
    group_link?: string;
    link_expired_time?: number;
    [key: string]: unknown;
};

export type GroupEventExtraData = {
    featureId?: number;
    field?: string;
    [key: string]: unknown;
};

export type TGroupEventBase = {
    subType: number;
    groupId: string;
    creatorId: string;
    groupName: string;
    sourceId: string;
    updateMembers: GroupEventUpdateMember[];
    groupSetting: GroupSetting | null;
    groupTopic: GroupTopic | null;
    info: GroupEventGroupInfo | null;
    extraData: GroupEventExtraData | null;
    time: string;
    avt: string | null;
    fullAvt: string | null;
    isAdd: number;
    hideGroupInfo: number;
    version: string;
    groupType: number;
    clientId?: number;
    errorMap?: Record<string, unknown>;
    e2ee?: number;
};

export type TGroupEventJoinRequest = {
    uids: string[];
    totalPending: number;
    groupId: string;
    time: string;
};

export type TGroupEventPinTopic = {
    oldBoardVersion: number;
    boardVersion: number;
    topic: GroupTopic;
    actorId: string;
    groupId: string;
};

export type TGroupEventReorderPinTopic = {
    oldBoardVersion: number;
    actorId: string;
    topics: {
        topicId: string;
        topicType: number;
    }[];
    groupId: string;
    boardVersion: number;
    topic: null;
};

export type TGroupEventBoard = {
    sourceId: string;
    groupName: string;
    groupTopic: (GroupTopic | ReminderGroup) & { params: string };
    groupId: string;
    creatorId: string;

    subType?: number;
    updateMembers?: GroupEventUpdateMember[];
    groupSetting?: GroupSetting;
    info?: GroupEventGroupInfo;
    extraData?: GroupEventExtraData;
    time?: string;
    avt?: null;
    fullAvt?: null;
    isAdd?: number;
    hideGroupInfo?: number;
    version?: string;
    groupType?: number;
};

export type TGroupEventRemindRespond = {
    topicId: string;
    updateMembers: string[];
    groupId: string;
    time: string;
};

export type TGroupEventRemindTopic = {
    msg: string;
    editorId: string;
    color: string;
    emoji: string;
    creatorId: string;
    editTime: number;
    type: number;
    duration: number;
    group_id: string;
    createTime: number;
    repeat: number;
    startTime: number;
    time: number;
    remindType: number;
};

export type TGroupEvent =
    | TGroupEventBase
    | TGroupEventJoinRequest
    | TGroupEventPinTopic
    | TGroupEventReorderPinTopic
    | TGroupEventBoard
    | TGroupEventRemindRespond
    | TGroupEventRemindTopic;

export type GroupEvent =
    | {
          type: GroupEventType.JOIN_REQUEST;
          data: TGroupEventJoinRequest;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.NEW_PIN_TOPIC | GroupEventType.UNPIN_TOPIC | GroupEventType.UPDATE_PIN_TOPIC;
          data: TGroupEventPinTopic;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.REORDER_PIN_TOPIC;
          data: TGroupEventReorderPinTopic;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.UPDATE_BOARD | GroupEventType.REMOVE_BOARD;
          data: TGroupEventBoard;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.ACCEPT_REMIND | GroupEventType.REJECT_REMIND;
          data: TGroupEventRemindRespond;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.REMIND_TOPIC;
          data: TGroupEventRemindTopic;
          act: string;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: Exclude<
              GroupEventType,
              | GroupEventType.JOIN_REQUEST
              | GroupEventType.NEW_PIN_TOPIC
              | GroupEventType.UNPIN_TOPIC
              | GroupEventType.UPDATE_PIN_TOPIC
              | GroupEventType.REORDER_PIN_TOPIC
              | GroupEventType.UPDATE_BOARD
              | GroupEventType.REMOVE_BOARD
              | GroupEventType.ACCEPT_REMIND
              | GroupEventType.REJECT_REMIND
              | GroupEventType.REMIND_TOPIC
          >;
          data: TGroupEventBase;
          act: string;
          threadId: string;
          isSelf: boolean;
      };

export function initializeGroupEvent(uid: string, data: TGroupEvent, type: GroupEventType, act: string): GroupEvent {
    const threadId = "group_id" in data ? data.group_id : data.groupId;

    if (type == GroupEventType.JOIN_REQUEST) {
        return { type, act, data: data as TGroupEventJoinRequest, threadId, isSelf: false };
    } else if (
        type == GroupEventType.NEW_PIN_TOPIC ||
        type == GroupEventType.UNPIN_TOPIC ||
        type == GroupEventType.UPDATE_PIN_TOPIC
    ) {
        return {
            type,
            act,
            data: data as TGroupEventPinTopic,
            threadId,
            isSelf: (data as TGroupEventPinTopic).actorId == uid,
        };
    } else if (type == GroupEventType.REORDER_PIN_TOPIC) {
        return {
            type,
            act,
            data: data as TGroupEventReorderPinTopic,
            threadId,
            isSelf: (data as TGroupEventPinTopic).actorId == uid,
        };
    } else if (type == GroupEventType.UPDATE_BOARD || type == GroupEventType.REMOVE_BOARD) {
        return {
            type,
            act,
            data: data as TGroupEventBoard,
            threadId,
            isSelf: (data as TGroupEventBoard).sourceId == uid,
        };
    } else if (type == GroupEventType.ACCEPT_REMIND || type == GroupEventType.REJECT_REMIND) {
        return {
            type,
            act,
            data: data as TGroupEventRemindRespond,
            threadId,
            isSelf: (data as TGroupEventRemindRespond).updateMembers.some((memberId) => memberId == uid),
        };
    } else if (type == GroupEventType.REMIND_TOPIC) {
        return {
            type,
            act,
            data: data as TGroupEventRemindTopic,
            threadId,
            isSelf: (data as TGroupEventRemindTopic).creatorId == uid,
        };
    } else {
        const baseData = data as TGroupEventBase;

        return {
            type,
            act,
            data: baseData,
            threadId,
            isSelf: baseData.updateMembers?.some((member) => member.id == uid) || baseData.sourceId == uid,
        };
    }
}
```

### `Label`
```ts
export type LabelData = {
    id: number;
    text: string;
    textKey: string;
    conversations: string[];
    color: string;
    offset: number;
    emoji: string;
    createTime: number;
};
```

### `Message`
```ts
import { ThreadType } from "./Enum.js";

export type TAttachmentContent = {
    title: string;
    description: string;
    href: string;
    thumb: string;
    childnumber: number;
    action: string;
    params: string;
    type: string;
};

export type TOtherContent = {
    [key: string]: unknown;
};

export type TMessage = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName: string;
    ts: string;
    status: number;
    content: string | TAttachmentContent | TOtherContent;
    notify: string;
    ttl: number;
    userId: string;
    uin: string;
    topOut: string;
    topOutTimeOut: string;
    topOutImprTimeOut: string;
    propertyExt:
        | {
              color: number;
              size: number;
              type: number;
              subType: number;
              ext: string;
          }
        | undefined;
    paramsExt: {
        countUnread: number;
        containType: number;
        platformType: number;
    };
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
    quote: TQuote | undefined;
};

export type TGroupMessage = TMessage & {
    mentions: TMention[] | undefined;
};

export type TQuote = {
    ownerId: string;
    cliMsgId: number;
    globalMsgId: number;
    cliMsgType: number;
    ts: number;
    msg: string;
    attach: string;
    fromD: string;
    ttl: number;
};

export type TMention = {
    uid: string;
    pos: number;
    len: number;
    type: 0 | 1;
};

export class UserMessage {
    type: ThreadType.User = ThreadType.User;

    data: TMessage;
    threadId: string;
    /**
     * true if the message is sent by the logged in account
     */
    isSelf: boolean;

    constructor(uid: string, data: TMessage) {
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";

        if (data.idTo == "0") data.idTo = uid;
        if (data.uidFrom == "0") data.uidFrom = uid;
        if (data.quote) {
            data.quote.ownerId = String(data.quote.ownerId);
        }
    }
}

export class GroupMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupMessage;
    threadId: string;
    /**
     * true if the message is sent by the logged in account
     */
    isSelf: boolean;

    constructor(uid: string, data: TGroupMessage) {
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = data.uidFrom == "0";

        if (data.uidFrom == "0") data.uidFrom = uid;
        if (data.quote) {
            data.quote.ownerId = String(data.quote.ownerId);
        }
    }
}

export type Message = UserMessage | GroupMessage;
```

### `ProductCatalog`
```ts
export type ProductCatalogItem = {
    price: string;
    description: string;
    /**
     * Relative path used to build the product URL.
     *
     * Example: https://catalog.zalo.me/${path}
     */
    path: string;
    product_id: string;
    product_name: string;
    currency_unit: string;
    product_photos: string[];
    create_time: number;
    catalog_id: string;
    owner_id: string;
};
```

### `QuickMessage`
```ts
export type QuickMessage = {
    id: number;
    keyword: string;
    type: number;
    createdTime: number;
    lastModified: number;
    message: {
        title: string;
        params: string | null;
    };
    media: {
        items: {
            type: number;
            photoId: number;
            title: string;
            width: number;
            height: number;
            previewThumb: string;
            rawUrl: string;
            thumbUrl: string;
            normalUrl: string;
            hdUrl: string;
        }[];
    } | null;
};
```

### `Reaction`
```ts
export enum Reactions {
    HEART = "/-heart",
    LIKE = "/-strong",
    HAHA = ":>",
    WOW = ":o",
    CRY = ":-((",
    ANGRY = ":-h",
    KISS = ":-*",
    TEARS_OF_JOY = ":')",
    SHIT = "/-shit",
    ROSE = "/-rose",
    BROKEN_HEART = "/-break",
    DISLIKE = "/-weak",
    LOVE = ";xx",
    CONFUSED = ";-/",
    WINK = ";-)",
    FADE = "/-fade",
    SUN = "/-li",
    BIRTHDAY = "/-bd",
    BOMB = "/-bome",
    OK = "/-ok",
    PEACE = "/-v",
    THANKS = "/-thanks",
    PUNCH = "/-punch",
    SHARE = "/-share",
    PRAY = "_()_",
    NO = "/-no",
    BAD = "/-bad",
    LOVE_YOU = "/-loveu",
    SAD = "--b",
    VERY_SAD = ":((",
    COOL = "x-)",
    NERD = "8-)",
    BIG_SMILE = ";-d",
    SUNGLASSES = "b-)",
    NEUTRAL = ":--|",
    SAD_FACE = "p-(",
    BYE = ":-bye",
    SLEEPY = "|-)",
    WIPE = ":wipe",
    DIG = ":-dig",
    ANGUISH = "&-(",
    HANDCLAP = ":handclap",
    ANGRY_FACE = ">-|",
    F_CHAIR = ":-f",
    L_CHAIR = ":-l",
    R_CHAIR = ":-r",
    SILENT = ";-x",
    SURPRISE = ":-o",
    EMBARRASSED = ";-s",
    AFRAID = ";-a",
    SAD2 = ":-<",
    BIG_LAUGH = ":))",
    RICH = "$-)",
    BEER = "/-beer",
    NONE = "", // more...
}

export type TReaction = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName?: string;
    content: {
        rMsg: { gMsgID: string; cMsgID: string; msgType: number }[];
        rIcon: Reactions;
        rType: number;
        source: number;
    };
    ts: string;
    ttl: number;
};

export class Reaction {
    data: TReaction;
    threadId: string;
    isSelf: boolean;
    isGroup: boolean;

    constructor(uid: string, data: TReaction, isGroup: boolean) {
        this.data = data;
        this.threadId = isGroup || data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        this.isGroup = isGroup;

        if (data.idTo == "0") data.idTo = uid;
        if (data.uidFrom == "0") data.uidFrom = uid;
    }
}
```

### `Reminder`
```ts
export enum ReminderRepeatMode {
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
}

export type ReminderUser = {
    creatorUid: string;
    toUid: string;
    emoji: string;
    color: number;
    reminderId: string;
    createTime: number;
    repeat: ReminderRepeatMode;
    startTime: number;
    editTime: number;
    endTime: number;
    params: {
        title: string;
        setTitle: boolean;
    };
    type: number;
};

export type ReminderGroup = {
    editorId: string;
    emoji: string;
    color: number;
    groupId: string;
    creatorId: string;
    editTime: number;
    eventType: number;
    responseMem: {
        rejectMember: number;
        myResp: number;
        acceptMember: number;
    };
    params: {
        title: string;
        setTitle?: boolean;
    };
    type: number;
    duration: number;
    repeatInfo: {
        list_ts: unknown[];
    } | null;
    repeatData: unknown[];
    createTime: number;
    repeat: ReminderRepeatMode;
    startTime: number;
    id: string;
};
```

### `SeenMessage`
```ts
import { ThreadType } from "./Enum.js";

export type TUserSeenMessage = {
    idTo: string;
    msgId: string;
    realMsgId: string;
};

export type TGroupSeenMessage = {
    msgId: string;
    groupId: string;
    seenUids: string[];
};

export class UserSeenMessage {
    type: ThreadType.User = ThreadType.User;

    data: TUserSeenMessage;
    threadId: string;
    isSelf: false;

    constructor(data: TUserSeenMessage) {
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = false;
    }
}

export class GroupSeenMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupSeenMessage;
    threadId: string;
    isSelf: boolean;

    constructor(uid: string, data: TGroupSeenMessage) {
        this.data = data;
        this.threadId = data.groupId;
        this.isSelf = data.seenUids.includes(uid);
    }
}

export type SeenMessage = UserSeenMessage | GroupSeenMessage;
```

### `Sticker`
```ts
export type StickerDetail = {
    id: number;
    cateId: number;
    type: number;
    text: string;
    uri: string;
    fkey: number;
    status: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl: string | null;
    totalFrames: number;
    duration: number;
    effectId: number;
    checksum: string;
    ext: number;
    source: number;
    fss: unknown;
    fssInfo: unknown;
    version: number;
    extInfo: unknown;
};

export type StickerBasic = {
    type: number;
    cate_id: number;
    sticker_id: number;
};
```

### `SyncData`
```ts
export type SyncData = {
    file_path: string;
    encrypted_key: string;
    metadata: {
        file_name: string;
        file_size: number;
        checksum_code: string;
        from_seq_id: number;
        is_full_transfer: number;
    };
};

export type SyncDataStream = {
    stream: ReadableStream<Uint8Array> | null;
    metadata: {
        file_name: string;
        file_size: number;
        checksum_code: string;
        from_seq_id: number;
        is_full_transfer: number;
        encrypted_key: string;
    };
    response?: {
        status: number;
        statusText: string;
        url: string;
        contentType: string | null;
        contentLength: string | null;
    };
};

export type SyncDataResponse = {
    success: boolean;
    data?: SyncData;
    stream?: SyncDataStream;
    error?: string;
};
```

### `SyncEvent`
```ts
export enum SyncEventType {
    USER_CONFIRM = "user_confirm",
    SYNCMSG_INFO = "syncmsg_info",
    TRANSFER_ERROR = "transfer_error",
    TRANSFER_AFTER_LOGIN = "transfer_after_login",
    UNKNOWN = "unknown",
}

export type DatabaseBackupInfo = {
    backup_db?: {
        msg_total: number;
        msg_thread: number;
    };
    origin_db?: {
        msg_total: number;
        msg_thread: number;
    };
    db_format?: number;
};

export type TSyncEventUserConfirm = {
    user_action: number;
    public_key: string;
    pc_name: string;
};

export type TSyncEventSyncMsgInfo = {
    uid: number;
    url: string;
    time: number;
    device_type: number;
    device_name: string;
    client_version: number;
    file_name: string;
    checksum_code: string;
    checksum?: string;
    file_size: number;
    client_time: number;
    from_seq_id: number;
    public_key: string;
    encrypted_key: string;
    trigger_reason: number;
    is_full_transfer: number;
    db_info: string | DatabaseBackupInfo;
};

export type TSyncEventTransferError = {
    public_key: string;
    pc_name: string;
    can_retry?: number;
    status?: number;
    error_msg?: string;
    error_code?: number;
};

export type TSyncEventTransferAfterLogin = {
    temp_key: string;
    imei: string;
    [key: string]: unknown;
};

export type TSyncEvent =
    | TSyncEventUserConfirm
    | TSyncEventSyncMsgInfo
    | TSyncEventTransferError
    | TSyncEventTransferAfterLogin;

export type SyncEvent =
    | {
          type: SyncEventType.USER_CONFIRM;
          data: TSyncEventUserConfirm;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.SYNCMSG_INFO;
          data: TSyncEventSyncMsgInfo;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.TRANSFER_ERROR;
          data: TSyncEventTransferError;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.TRANSFER_AFTER_LOGIN;
          data: TSyncEventTransferAfterLogin;
          act: string;
          act_type: string;
      }
    | {
          type: SyncEventType.UNKNOWN;
          data: unknown;
          act: string;
          act_type: string;
      };

export function initializeSyncEvent(data: TSyncEvent, act: string, act_type: string): SyncEvent {
    if (act === "user_confirm") {
        return {
            type: SyncEventType.USER_CONFIRM,
            data: data as TSyncEventUserConfirm,
            act,
            act_type,
        };
    } else if (act === "syncmsg_info") {
        return {
            type: SyncEventType.SYNCMSG_INFO,
            data: data as TSyncEventSyncMsgInfo,
            act,
            act_type,
        };
    } else if (act === "transfer_error") {
        return {
            type: SyncEventType.TRANSFER_ERROR,
            data: data as TSyncEventTransferError,
            act,
            act_type,
        };
    } else if (act === "transfer_after_login") {
        return {
            type: SyncEventType.TRANSFER_AFTER_LOGIN,
            data: data as TSyncEventTransferAfterLogin,
            act,
            act_type,
        };
    } else {
        return {
            type: SyncEventType.UNKNOWN,
            data,
            act,
            act_type,
        };
    }
}
```

### `Typing`
```ts
import { ThreadType } from "./Enum.js";

export type TTyping = {
    uid: string;
    ts: string;
    isPC: 0 | 1;
};

export type TGroupTyping = TTyping & {
    gid: string;
};

export class UserTyping {
    type: ThreadType.User = ThreadType.User;

    data: TTyping;
    threadId: string;
    isSelf: false;

    constructor(data: TTyping) {
        this.data = data;
        this.threadId = data.uid;
        this.isSelf = false;
    }
}

export class GroupTyping {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupTyping;
    threadId: string;
    isSelf: false;

    constructor(data: TGroupTyping) {
        this.data = data;
        this.threadId = data.gid;
        this.isSelf = false;
    }
}

export type Typing = UserTyping | GroupTyping;
```

### `Undo`
```ts
export type TUndoContent = {
    globalMsgId: number;
    cliMsgId: number;
    deleteMsg: number;
    srcId: number;
    destId: number;
};

export type TUndo = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName: string;
    ts: string;
    status: number;
    content: TUndoContent;
    notify: string;
    ttl: number;
    userId: string;
    uin: string;
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
};

export class Undo {
    data: TUndo;
    threadId: string;
    isSelf: boolean;
    isGroup: boolean;

    constructor(uid: string, data: TUndo, isGroup: boolean) {
        this.data = data;
        this.threadId = isGroup || data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";
        this.isGroup = isGroup;

        if (data.idTo == "0") data.idTo = uid;
        if (data.uidFrom == "0") data.uidFrom = uid;
    }
}
```

### `User`
```ts
import type { Gender } from "./Enum.js";
import type { ZBusinessPackage } from "./ZBusiness.js";

export type User = {
    userId: string;
    username: string;
    displayName: string;
    zaloName: string;
    avatar: string;
    bgavatar: string;
    cover: string;
    gender: Gender;
    dob: number;
    sdob: string;
    status: string;
    phoneNumber: string;
    isFr: number;
    isBlocked: number;
    lastActionTime: number;
    lastUpdateTime: number;
    isActive: number;
    key: number;
    type: number;
    isActivePC: number;
    isActiveWeb: number;
    isValid: number;
    userKey: string;
    accountStatus: number;
    oaInfo: unknown;
    user_mode: number;
    globalId: string;
    bizPkg: ZBusinessPackage;
    createdTs: number;
    oa_status: unknown;
};

export type UserBasic = {
    avatar: string;
    cover: string;
    status: string;
    gender: Gender;
    dob: number;
    sdob: string;
    globalId: string;
    bizPkg: ZBusinessPackage;
    uid: string;
    zalo_name: string;
    display_name: string;
};

export type UserSetting = {
    add_friend_via_contact: number;
    display_on_recommend_friend: number;
    add_friend_via_group: number;
    add_friend_via_qr: number;
    quick_message_status: number;
    show_online_status: boolean;
    accept_stranger_call: number;
    archived_chat_status: number;
    receive_message: number;
    add_friend_via_phone: number;
    display_seen_status: number;
    view_birthday: number;
    setting_2FA_status: number;
};

export type UnchangedProfileInfo = {
    oa_status: {
        blocked: number;
    };
    isFr: number;
    isBlocked: boolean;
    lastActionTime: number;
};
```

### `ZBusiness`
```ts
export type ZBusinessPackage = {
    label?: Record<string, string> | null;
    pkgId: number; // @TODO: what is this?
};

export enum BusinessCategory {
    Other = 0,
    RealEstate = 1,
    TechnologyAndDevices = 2,
    TravelAndHospitality = 3,
    EducationAndTraining = 4,
    ShoppingAndRetail = 5,
    CosmeticsAndBeauty = 6,
    RestaurantAndCafe = 7,
    AutoAndMotorbike = 8,
    FashionAndApparel = 9,
    FoodAndBeverage = 10,
    MediaAndEntertainment = 11,
    InternalCommunications = 12,
    Transportation = 13,
    Telecommunications = 14,
}

export const BusinessCategoryName: Record<BusinessCategory, string> = {
    [BusinessCategory.Other]: "Dịch vụ khác (Không hiển thị)",
    [BusinessCategory.RealEstate]: "Bất động sản",
    [BusinessCategory.TechnologyAndDevices]: "Công nghệ & Thiết bị",
    [BusinessCategory.TravelAndHospitality]: "Du lịch & Lưu trú",
    [BusinessCategory.EducationAndTraining]: "Giáo dục & Đào tạo",
    [BusinessCategory.ShoppingAndRetail]: "Mua sắm & Bán lẻ",
    [BusinessCategory.CosmeticsAndBeauty]: "Mỹ phẩm & Làm đẹp",
    [BusinessCategory.RestaurantAndCafe]: "Nhà hàng & Quán",
    [BusinessCategory.AutoAndMotorbike]: "Ô tô & Xe máy",
    [BusinessCategory.FashionAndApparel]: "Thời trang & May mặc",
    [BusinessCategory.FoodAndBeverage]: "Thực phẩm & Đồ uống",
    [BusinessCategory.MediaAndEntertainment]: "Truyền thông & Giải trí",
    [BusinessCategory.InternalCommunications]: "Truyền thông nội bộ",
    [BusinessCategory.Transportation]: "Vận tải",
    [BusinessCategory.Telecommunications]: "Viễn thông",
};
```
