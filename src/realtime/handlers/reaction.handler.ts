import type { ContextSession } from "../../context.js";
import { Reaction, type TReaction } from "../../models/index.js";
import { decodeEventData } from "../../utils.js";
import type { Listener } from "../listener.js";

export async function handleRealtimeReactionPacket(
    listener: Listener,
    ctx: ContextSession,
    selfListen: boolean,
    cmd: number,
    parsed: Record<string, unknown>,
    cipherKey?: string,
) {
    if (cmd == 612) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { reacts, reactGroups } = parsedData;

        for (const react of reacts) {
            react.content = JSON.parse(react.content);
            const reactionObject = new Reaction(ctx.uid, react, false);
            if (reactionObject.isSelf && !selfListen) continue;

            listener.emit("reaction", reactionObject);
        }

        for (const reactGroup of reactGroups) {
            reactGroup.content = JSON.parse(reactGroup.content);
            const reactionObject = new Reaction(ctx.uid, reactGroup, true);
            if (reactionObject.isSelf && !selfListen) continue;

            listener.emit("reaction", reactionObject);
        }
        return true;
    }

    if (cmd == 610 || cmd == 611) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const isGroup = cmd == 611;

        const reacts = parsedData[isGroup ? "reactGroups" : "reacts"] as TReaction[];
        const reactionObjects = reacts.map((react) => new Reaction(ctx.uid, react, isGroup));

        listener.emit("old_reactions", reactionObjects, isGroup);
        return true;
    }

    return false;
}
