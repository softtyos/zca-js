import type { FriendEvent } from "../models/FriendEvent.js";
import type { GroupEvent } from "../models/GroupEvent.js";
import type { Message, Reaction, Undo, Typing, ThreadType, UserMessage } from "../models/index.js";
import type { SeenMessage } from "../models/SeenMessage.js";
import type { DeliveredMessage } from "../models/DeliveredMessage.js";
import type { ClearUnread } from "../models/ClearUnread.js";
import type { SyncEvent } from "../models/SyncEvent.js";
import type { CallEvent } from "../models/CallEvent.js";
import type { OAEvent } from "../models/OAMessage.js";

export type HasMsgQueueId = {
    cmd: number;
    subCmd: number;
    queueName?: string;
    [key: string]: unknown;
};

export type HasMsgIdItem = {
    actionId: string;
    msgId?: string;
    [key: string]: unknown;
};

export type UploadEventData = {
    fileUrl: string;
    fileId: string;
};

export type Voice2TextEventData = {
    req_id: string;
    err?: number;
    text?: string;
    content?: string;
    [key: string]: unknown;
};

export type Voice2TextEvent = {
    act: string;
    act_type: "voice2text";
    data: Voice2TextEventData;
};

export type TodoEvent = {
    act: string;
    act_type: "personal_board";
    data: unknown;
};

export type PollEvent = {
    act: string;
    act_type: "poll";
    data: unknown;
};

export type EmojiStatusEvent = {
    act: string;
    act_type: "emoji_status";
    data: unknown;
};

export type TranslateEvent = {
    act: string;
    act_type: "translate";
    data: unknown;
};

export type OnlineStatusEvent = {
    act: string;
    act_type: "profile";
    data: unknown;
};

export type ControlSyncEvent = {
    act: string;
    act_type: string;
    data: unknown;
};

export type ZCloudEvent = {
    cmd: 620 | 621 | 623;
    type: "push" | "need_verify" | "done_migrate";
    data: unknown;
};

export type WsPayload<T = Record<string, unknown>> = {
    version: number;
    cmd: number;
    subCmd: number;
    data: T;
};

export type OnMessageCallback = (message: Message) => unknown;
export type OnClosedCallback = (code: CloseReason, reason: string) => unknown;
export type OnErrorCallback = (error: unknown) => unknown;

export enum CloseReason {
    ManualClosure = 1000,
    AbnormalClosure = 1006,
    DuplicateConnection = 3000,
    KickConnection = 3003,
}

export interface ListenerEvents {
    connected: [];
    disconnected: [code: CloseReason, reason: string];
    reconnecting: [code: CloseReason];
    closed: [code: CloseReason, reason: string];
    error: [error: unknown];
    typing: [typing: Typing];
    message: [message: Message];
    oa_message: [message: UserMessage];
    old_messages: [messages: Message[], type: ThreadType, hasMore?: boolean];
    seen_messages: [messages: SeenMessage[]];
    delivered_messages: [messages: DeliveredMessage[]];
    unread_cleared: [items: ClearUnread[]];
    reaction: [reaction: Reaction];
    old_reactions: [reactions: Reaction[], isGroup: boolean];
    upload_attachment: [data: UploadEventData];
    undo: [data: Undo];
    friend_event: [data: FriendEvent];
    group_event: [data: GroupEvent];
    sync_event: [data: SyncEvent];
    call_event: [data: CallEvent];
    oa_event: [data: OAEvent];
    voice2text_event: [data: Voice2TextEvent];
    todo_event: [data: TodoEvent];
    poll_event: [data: PollEvent];
    emoji_status_event: [data: EmojiStatusEvent];
    translate_event: [data: TranslateEvent];
    online_status_event: [data: OnlineStatusEvent];
    control_sync_event: [data: ControlSyncEvent];
    zcloud_event: [data: ZCloudEvent];
    cipher_key: [key: string];
    ping: [];
    pong: [];
}
