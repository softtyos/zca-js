import type { ContextSession } from "../../context.js";
import { ClearUnread, type TClearUnreadItem } from "../../models/ClearUnread.js";
import { GroupDeliveredMessage, UserDeliveredMessage } from "../../models/DeliveredMessage.js";
import { GroupTyping, UserTyping } from "../../models/index.js";
import { GroupSeenMessage, UserSeenMessage } from "../../models/SeenMessage.js";
import { decodeEventData } from "../../utils.js";
import type { Listener } from "../listener.js";

export async function handleRealtimeStatusPacket(
    listener: Listener,
    ctx: ContextSession,
    selfListen: boolean,
    cmd: number,
    subCmd: number,
    parsed: Record<string, unknown>,
    cipherKey?: string,
) {
    if ((cmd == 504 || cmd == 524) && subCmd == 0) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data ?? decoded;
        const clearUnreads = (parsedData?.clearUnreads ?? []) as TClearUnreadItem[];
        if (Array.isArray(clearUnreads) && clearUnreads.length > 0) {
            const items = clearUnreads.map((item) => new ClearUnread(item));
            listener.emit("unread_cleared", items);
        }
        return true;
    }

    if (cmd == 602 && subCmd == 0) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { actions } = parsedData;

        for (const action of actions) {
            if (action.act_type == "typing") {
                const data = JSON.parse(`{${action.data}}`);
                if (action.act == "typing") {
                    const typingObject = new UserTyping(data);
                    listener.emit("typing", typingObject);
                } else if (action.act == "gtyping") {
                    const typingObject = new GroupTyping(data);
                    listener.emit("typing", typingObject);
                }
            }
        }
        return true;
    }

    if (cmd == 502 && subCmd == 0) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { delivereds: deliveredMsgs, seens: seenMsgs } = parsedData;

        if (Array.isArray(deliveredMsgs) && deliveredMsgs.length > 0) {
            const deliveredObjects = deliveredMsgs.map((delivered) => new UserDeliveredMessage(delivered));
            listener.emit("delivered_messages", deliveredObjects);
        }

        if (Array.isArray(seenMsgs) && seenMsgs.length > 0) {
            const seenObjects = seenMsgs.map((seen) => new UserSeenMessage(seen));
            listener.emit("seen_messages", seenObjects);
        }
        return true;
    }

    if (cmd == 522 && subCmd == 0) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { delivereds: deliveredMsgs, groupSeens: groupSeenMsgs } = parsedData;

        if (Array.isArray(deliveredMsgs) && deliveredMsgs.length > 0) {
            let deliveredObjects = deliveredMsgs.map((delivered) => new GroupDeliveredMessage(ctx.uid, delivered));
            if (!selfListen) deliveredObjects = deliveredObjects.filter((delivered) => !delivered.isSelf);
            listener.emit("delivered_messages", deliveredObjects);
        }

        if (Array.isArray(groupSeenMsgs) && groupSeenMsgs.length > 0) {
            let seenObjects = groupSeenMsgs.map((seen) => new GroupSeenMessage(ctx.uid, seen));
            if (!selfListen) seenObjects = seenObjects.filter((seen) => !seen.isSelf);
            listener.emit("seen_messages", seenObjects);
        }
        return true;
    }

    return false;
}
