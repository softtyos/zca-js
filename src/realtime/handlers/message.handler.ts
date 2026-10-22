import type { ContextSession } from "../../context.js";
import type { TGroupMessage, TMessage, TUndo } from "../../models/index.js";
import { GroupMessage, ThreadType, Undo, UserMessage } from "../../models/index.js";
import { decodeEventData, hasOwn } from "../../utils.js";
import type { Listener } from "../listener.js";
import type { OnMessageCallback } from "../types.js";

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
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { msgs } = parsedData;
        for (const msg of msgs) {
            if (typeof msg.content == "object" && hasOwn(msg.content, "deleteMsg")) {
                const undoObject = new Undo(ctx.uid, msg, false);
                if (undoObject.isSelf && !selfListen) continue;
                listener.emit("undo", undoObject);
            } else {
                const messageObject = new UserMessage(ctx.uid, msg);
                if (messageObject.isSelf && !selfListen) continue;
                onMessageCallback(messageObject);
                listener.emit("message", messageObject);
            }
        }
        return true;
    }

    if (version == 1 && cmd == 521 && subCmd == 0) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { groupMsgs } = parsedData;
        for (const msg of groupMsgs) {
            if (typeof msg.content == "object" && hasOwn(msg.content, "deleteMsg")) {
                const undoObject = new Undo(ctx.uid, msg, true);
                if (undoObject.isSelf && !selfListen) continue;
                listener.emit("undo", undoObject);
            } else {
                const messageObject = new GroupMessage(ctx.uid, msg);
                if (messageObject.isSelf && !selfListen) continue;
                onMessageCallback(messageObject);
                listener.emit("message", messageObject);
            }
        }
        return true;
    }

    if (cmd == 510 && (subCmd == 0 || subCmd == 1)) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const msgs = (parsedData?.msgs ?? []) as TMessage[];
        const responseMsgs: UserMessage[] = [];
        for (const msg of msgs) {
            if (typeof msg.content == "object" && hasOwn(msg.content, "deleteMsg")) {
                const undoObject = new Undo(ctx.uid, msg as unknown as TUndo, false);
                if (undoObject.isSelf && !selfListen) continue;
                listener.emit("undo", undoObject);
            } else {
                responseMsgs.push(new UserMessage(ctx.uid, msg));
            }
        }
        if (responseMsgs.length > 0 || msgs.length === 0) {
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
