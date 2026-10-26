import type { ContextSession } from "../../context.js";
import type { TGroupMessage, TMessage, TUndo } from "../../models/index.js";
import { GroupMessage, ThreadType, Undo, UserMessage } from "../../models/index.js";
import { decodeEventData, hasOwn } from "../../utils.js";
import type { Listener } from "../listener.js";
import type { HasMsgIdItem, HasMsgQueueId, OnMessageCallback } from "../types.js";

function processIncomingUserMessages(
    listener: Listener,
    ctx: ContextSession,
    selfListen: boolean,
    onMessageCallback: OnMessageCallback,
    messages: TMessage[],
    isPageMsg: boolean = false,
) {
    for (const msg of messages) {
        if (!msg) continue;
        if (typeof msg.content == "object" && msg.content !== null && hasOwn(msg.content, "deleteMsg")) {
            const undoObject = new Undo(ctx.uid, msg as unknown as TUndo, false);
            if (undoObject.isSelf && !selfListen) continue;
            listener.emit("undo", undoObject);
        } else {
            const messageObject = new UserMessage(ctx.uid, msg, isPageMsg);
            if (messageObject.isSelf && !selfListen) continue;
            onMessageCallback(messageObject);
            listener.emit("message", messageObject);
            if (messageObject.isOAMessage()) {
                listener.emit("oa_message", messageObject);
            }
        }
    }
}

function processIncomingGroupMessages(
    listener: Listener,
    ctx: ContextSession,
    selfListen: boolean,
    onMessageCallback: OnMessageCallback,
    groupMessages: TGroupMessage[],
) {
    for (const msg of groupMessages) {
        if (!msg) continue;
        if (typeof msg.content == "object" && msg.content !== null && hasOwn(msg.content, "deleteMsg")) {
            const undoObject = new Undo(ctx.uid, msg as unknown as TUndo, true);
            if (undoObject.isSelf && !selfListen) continue;
            listener.emit("undo", undoObject);
        } else {
            const messageObject = new GroupMessage(ctx.uid, msg);
            if (messageObject.isSelf && !selfListen) continue;
            onMessageCallback(messageObject);
            listener.emit("message", messageObject);
        }
    }
}

export async function handleRealtimeMessagePacket(
    listener: Listener,
    ctx: ContextSession,
    selfListen: boolean,
    onMessageCallback: OnMessageCallback,
    version: number,
    cmd: number,
    subCmd: number,
    parsed: Record<string, unknown>,
    cipherKey?: string,
) {
    if (version == 1 && [501, 551].includes(cmd) && subCmd == 0) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const msgs = (Array.isArray(parsedData?.msgs) ? parsedData.msgs : []) as TMessage[];
        const pageMsgs = (Array.isArray(parsedData?.pageMsgs) ? parsedData.pageMsgs : []) as TMessage[];
        if (msgs.length > 0) processIncomingUserMessages(listener, ctx, selfListen, onMessageCallback, msgs, false);
        if (pageMsgs.length > 0)
            processIncomingUserMessages(listener, ctx, selfListen, onMessageCallback, pageMsgs, true);
        return true;
    }

    if (version == 1 && cmd == 521 && subCmd == 0) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const groupMsgs = (Array.isArray(parsedData?.groupMsgs) ? parsedData.groupMsgs : []) as TGroupMessage[];
        processIncomingGroupMessages(listener, ctx, selfListen, onMessageCallback, groupMsgs);
        return true;
    }

    // HAS_MSG (cmd = 533): Server báo có tin nhắn đang chờ (thường gặp với OA / Missed Queue) -> kéo ngay qua cmd = 570 (GET_MSG)
    if (cmd == 533 && subCmd == 0) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = (decoded?.data ?? decoded) as {
            queueId?: HasMsgQueueId;
            ids?: HasMsgIdItem[];
        };
        if (parsedData?.queueId && Array.isArray(parsedData.ids) && parsedData.ids.length > 0) {
            listener.requestMessagesByIds(parsedData.queueId, parsedData.ids);
        }
        return true;
    }

    // PUSH_MISS_MSG (cmd = 534) & GET_MSG (cmd = 570): Gói tin trả về các tin nhắn OA (`pageMsgs`), User (`msgs`) và Group (`groupMsgs`)
    if ((cmd == 534 || cmd == 570) && subCmd == 0) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const msgs = (Array.isArray(parsedData?.msgs) ? parsedData.msgs : []) as TMessage[];
        const pageMsgs = (Array.isArray(parsedData?.pageMsgs) ? parsedData.pageMsgs : []) as TMessage[];
        const groupMsgs = (Array.isArray(parsedData?.groupMsgs) ? parsedData.groupMsgs : []) as TGroupMessage[];

        if (msgs.length > 0) {
            processIncomingUserMessages(listener, ctx, selfListen, onMessageCallback, msgs, false);
        }
        if (pageMsgs.length > 0) {
            processIncomingUserMessages(listener, ctx, selfListen, onMessageCallback, pageMsgs, true);
        }
        if (groupMsgs.length > 0) {
            processIncomingGroupMessages(listener, ctx, selfListen, onMessageCallback, groupMsgs);
        }
        return true;
    }

    if (cmd == 510 && (subCmd == 0 || subCmd == 1)) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const msgs = (Array.isArray(parsedData?.msgs) ? parsedData.msgs : []) as TMessage[];
        const pageMsgs = (Array.isArray(parsedData?.pageMsgs) ? parsedData.pageMsgs : []) as TMessage[];
        const responseMsgs: UserMessage[] = [];
        for (const msg of msgs) {
            if (typeof msg.content == "object" && msg.content !== null && hasOwn(msg.content, "deleteMsg")) {
                const undoObject = new Undo(ctx.uid, msg as unknown as TUndo, false);
                if (undoObject.isSelf && !selfListen) continue;
                listener.emit("undo", undoObject);
            } else {
                const userMsg = new UserMessage(ctx.uid, msg, false);
                responseMsgs.push(userMsg);
                if (userMsg.isOAMessage() && (!userMsg.isSelf || selfListen)) {
                    listener.emit("oa_message", userMsg);
                }
            }
        }
        for (const msg of pageMsgs) {
            if (typeof msg.content == "object" && msg.content !== null && hasOwn(msg.content, "deleteMsg")) {
                const undoObject = new Undo(ctx.uid, msg as unknown as TUndo, false);
                if (undoObject.isSelf && !selfListen) continue;
                listener.emit("undo", undoObject);
            } else {
                const oaUserMsg = new UserMessage(ctx.uid, msg, true);
                responseMsgs.push(oaUserMsg);
                if (oaUserMsg.isOAMessage() && (!oaUserMsg.isSelf || selfListen)) {
                    listener.emit("oa_message", oaUserMsg);
                }
            }
        }
        if (responseMsgs.length > 0 || (msgs.length === 0 && pageMsgs.length === 0)) {
            listener.emit("old_messages", responseMsgs, ThreadType.User, parsedData?.more === 1);
        }
        return true;
    }

    if (cmd == 511 && (subCmd == 0 || subCmd == 1)) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const groupMsgs = (parsedData?.groupMsgs ?? []) as TGroupMessage[];
        const responseMsgs: GroupMessage[] = [];
        for (const msg of groupMsgs) {
            if (typeof msg.content == "object" && hasOwn(msg.content, "deleteMsg")) {
                const undoObject = new Undo(ctx.uid, msg as unknown as TUndo, true);
                if (undoObject.isSelf && !selfListen) continue;
                listener.emit("undo", undoObject);
            } else {
                responseMsgs.push(new GroupMessage(ctx.uid, msg));
            }
        }
        if (responseMsgs.length > 0 || groupMsgs.length === 0) {
            listener.emit("old_messages", responseMsgs, ThreadType.Group, parsedData?.more === 1);
        }
        return true;
    }

    return false;
}
