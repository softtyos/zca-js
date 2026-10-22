import type { FriendEvent } from "../models/FriendEvent.js";
import type { GroupEvent } from "../models/GroupEvent.js";
import type { Message, Reaction, Undo, Typing, ThreadType } from "../models/index.js";
import type { SeenMessage } from "../models/SeenMessage.js";
import type { DeliveredMessage } from "../models/DeliveredMessage.js";
import type { ClearUnread } from "../models/ClearUnread.js";
import type { SyncEvent } from "../models/SyncEvent.js";
import type { CallEvent } from "../models/CallEvent.js";

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
    voice2text_event: [data: Voice2TextEvent];
    cipher_key: [key: string];
    ping: [];
    pong: [];
}
