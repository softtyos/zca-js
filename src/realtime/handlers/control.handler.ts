import type { ContextSession } from "../../context.js";
import { initializeCallEvent, type TCallEventData } from "../../models/CallEvent.js";
import { initializeFriendEvent, type TFriendEvent } from "../../models/FriendEvent.js";
import { initializeGroupEvent, type TGroupEvent } from "../../models/GroupEvent.js";
import { initializeSyncEvent, type TSyncEvent } from "../../models/SyncEvent.js";
import { decodeEventData, getFriendEventType, getGroupEventType } from "../../utils.js";
import type { Listener } from "../listener.js";
import type { Voice2TextEventData } from "../types.js";

export async function handleRealtimeControlPacket(
    listener: Listener,
    ctx: ContextSession,
    selfListen: boolean,
    version: number,
    cmd: number,
    subCmd: number,
    parsed: Record<string, unknown>,
    cipherKey?: string,
) {
    if (version == 1 && cmd == 601 && subCmd == 0) {
        const parsedData = (await decodeEventData(parsed, cipherKey)).data;
        const { controls } = parsedData;
        for (const control of controls) {
            if (control.content.act_type == "file_done") {
                const data = {
                    fileUrl: control.content.data.url,
                    fileId: control.content.fileId,
                };

                const uploadCallback = ctx.uploadCallbacks.get(String(control.content.fileId));
                if (uploadCallback) uploadCallback(data);
                ctx.uploadCallbacks.delete(String(control.content.fileId));

                listener.emit("upload_attachment", data);
            } else if (control.content.act_type == "group") {
                if (control.content.act == "join_reject") continue;

                const groupEventData: TGroupEvent =
                    typeof control.content.data == "string"
                        ? JSON.parse(control.content.data)
                        : control.content.data;

                const groupEvent = initializeGroupEvent(
                    ctx.uid,
                    groupEventData,
                    getGroupEventType(control.content.act),
                    control.content.act,
                );
                if (groupEvent.isSelf && !selfListen) continue;
                listener.emit("group_event", groupEvent);
            } else if (control.content.act_type == "fr") {
                if (control.content.act == "req") continue;

                const friendEventData: TFriendEvent =
                    typeof control.content.data == "string"
                        ? JSON.parse(control.content.data)
                        : control.content.data;

                if (
                    typeof friendEventData == "object" &&
                    "topic" in friendEventData &&
                    typeof friendEventData.topic == "object" &&
                    "params" in friendEventData.topic
                ) {
                    friendEventData.topic.params = JSON.parse(`${friendEventData.topic.params}`);
                }

                const friendEvent = initializeFriendEvent(
                    ctx.uid,
                    typeof friendEventData == "number" ? control.content.data : friendEventData,
                    getFriendEventType(control.content.act),
                );
                if (friendEvent.isSelf && !selfListen) continue;
                listener.emit("friend_event", friendEvent);
            } else if (control.content.act_type == "syncmsgmb" || control.content.act_type == "transfer_msg") {
                const syncEventData: TSyncEvent =
                    typeof control.content.data == "string"
                        ? JSON.parse(control.content.data)
                        : control.content.data;
                const syncEvent = initializeSyncEvent(
                    syncEventData,
                    control.content.act,
                    control.content.act_type,
                );
                listener.emit("sync_event", syncEvent);
            } else if (control.content.act_type == "voip") {
                const callEventData: TCallEventData =
                    typeof control.content.data == "string"
                        ? JSON.parse(control.content.data)
                        : control.content.data;
                const callEvent = initializeCallEvent(
                    callEventData,
                    control.content.act,
                    control.content.act_type,
                );
                listener.emit("call_event", callEvent);
            } else if (control.content.act_type == "voice2text") {
                const v2tData: Voice2TextEventData =
                    typeof control.content.data == "string"
                        ? JSON.parse(control.content.data)
                        : control.content.data;
                listener.emit("voice2text_event", {
                    act: control.content.act,
                    act_type: "voice2text",
                    data: v2tData,
                });
            }
        }
        return true;
    }

    return false;
}
