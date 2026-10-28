import type { ContextSession } from "../../context.js";
import { initializeCallEvent, type TCallEventData } from "../../models/CallEvent.js";
import { initializeFriendEvent, type TFriendEvent } from "../../models/FriendEvent.js";
import { initializeGroupEvent, type TGroupEvent } from "../../models/GroupEvent.js";
import { initializeOAEvent, type TOAEventData } from "../../models/OAMessage.js";
import { initializeSyncEvent, type TSyncEvent } from "../../models/SyncEvent.js";
import { decodeEventData, getFriendEventType, getGroupEventType } from "../../utils.js";
import type { Listener } from "../listener.js";
import type { Voice2TextEventData } from "../types.js";

const GROUP_VOIP_ACTIONS = new Set([
    "group_request",
    "group_ring_ring",
    "group_ringring",
    "group_answer",
    "group_answer_ack",
    "group_answerack",
    "group_end_call",
    "group_endcall",
    "group_end",
    "group_cancel",
    "group_add_user",
    "group_join_call",
    "group_join",
    "group_notify",
    "group_broadcast",
    "group_broadcast_config",
    "group_sharescreen",
]);

const CONTROL_SYNC_ACT_TYPES = new Set([
    "pinned_convers",
    "label_convers",
    "mute",
    "hidden_chat",
    "archived_chat",
    "mark_unread",
    "conv_settings",
    "quick_message",
    "auto_reply",
    "prod_catalog",
    "user_devices",
    "contact_tab",
    "media_send2me",
    "oneone",
    "sticker",
    "alias",
    "profile",
    "subtab",
    "block_sharing",
]);

function safeParseControlData(raw: unknown): unknown {
    if (typeof raw !== "string") return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

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
    if (version == 1 && (cmd == 620 || cmd == 621 || cmd == 623)) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = safeParseControlData(decoded?.data ?? decoded);
        listener.emit("zcloud_event", {
            cmd,
            type: cmd === 620 ? "push" : cmd === 621 ? "need_verify" : "done_migrate",
            data: parsedData,
        });
        return true;
    }

    if (version == 1 && (cmd == 601 || cmd == 602 || cmd == 603 || cmd == 604)) {
        const decoded = await decodeEventData(parsed, cipherKey);
        const parsedData = decoded?.data;
        const controls = parsedData?.controls;
        if (!Array.isArray(controls)) return false;
        for (const control of controls) {
            if (!control?.content) continue;
            const actType = String(control.content.act_type ?? "");
            const act = String(control.content.act ?? "");

            if (actType == "file_done" || actType == "video_done" || actType == "voice_aac_success") {
                const contentData = safeParseControlData(control.content.data) as Record<string, unknown> | undefined;
                const fileId = String(control.content.fileId ?? contentData?.fileId ?? "");
                const data = {
                    fileUrl: String(contentData?.url ?? contentData?.hd ?? contentData?.aac ?? ""),
                    fileId,
                };

                const uploadCallback = ctx.uploadCallbacks.get(fileId);
                if (uploadCallback) uploadCallback(data);
                ctx.uploadCallbacks.delete(fileId);

                listener.emit("upload_attachment", data);
            } else if (actType == "voip" || (actType == "group" && GROUP_VOIP_ACTIONS.has(act))) {
                const callEventData: TCallEventData =
                    typeof control.content.data == "string" ? JSON.parse(control.content.data) : control.content.data;
                // Chỉ bỏ qua các gói mời gọi cũ (> 60s) nằm trong hàng đợi offline (cmd 603),
                // tuyệt đối KHÔNG lọc các gói push realtime (cmd 601, 602, 604).
                // Đồng thời chuẩn hoá timestamp (10 chữ số giây -> 13 chữ số mili-giây).
                if (cmd == 603 && (act == "request" || act == "group_request") && callEventData?.ts) {
                    const rawTs = Number.parseInt(String(callEventData.ts), 10);
                    if (Number.isFinite(rawTs) && rawTs > 0) {
                        const eventTsMs = rawTs < 1e12 ? rawTs * 1000 : rawTs;
                        if (Date.now() - eventTsMs > 60_000) {
                            continue;
                        }
                    }
                }
                const callEvent = initializeCallEvent(callEventData, act, actType);
                listener.emit("call_event", callEvent);
            } else if (actType == "group") {
                if (act == "join_reject") continue;

                const groupEventData: TGroupEvent =
                    typeof control.content.data == "string" ? JSON.parse(control.content.data) : control.content.data;

                const groupEvent = initializeGroupEvent(ctx.uid, groupEventData, getGroupEventType(act), act);
                if (groupEvent.isSelf && !selfListen) continue;
                listener.emit("group_event", groupEvent);
            } else if (actType == "fr") {
                if (act == "req") continue;

                const friendEventData: TFriendEvent =
                    typeof control.content.data == "string" ? JSON.parse(control.content.data) : control.content.data;

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
                    getFriendEventType(act),
                );
                if (friendEvent.isSelf && !selfListen) continue;
                listener.emit("friend_event", friendEvent);
            } else if (actType == "syncmsgmb" || actType == "transfer_msg") {
                const syncEventData: TSyncEvent =
                    typeof control.content.data == "string" ? JSON.parse(control.content.data) : control.content.data;
                const syncEvent = initializeSyncEvent(syncEventData, act, actType);
                listener.emit("sync_event", syncEvent);
            } else if (actType == "voice2text") {
                const v2tData: Voice2TextEventData =
                    typeof control.content.data == "string" ? JSON.parse(control.content.data) : control.content.data;
                listener.emit("voice2text_event", {
                    act,
                    act_type: "voice2text",
                    data: v2tData,
                });
            } else if (actType == "oa") {
                const oaData: TOAEventData =
                    typeof control.content.data == "string" ? JSON.parse(control.content.data) : control.content.data;
                const oaEvent = initializeOAEvent(oaData, act);
                listener.emit("oa_event", oaEvent);
            } else if (actType == "personal_board" || actType == "act_todo") {
                listener.emit("todo_event", {
                    act,
                    act_type: "personal_board",
                    data: safeParseControlData(control.content.data),
                });
            } else if (actType == "poll" || actType == "act_poll") {
                listener.emit("poll_event", {
                    act,
                    act_type: "poll",
                    data: safeParseControlData(control.content.data),
                });
            } else if (actType == "emoji_status") {
                listener.emit("emoji_status_event", {
                    act,
                    act_type: "emoji_status",
                    data: safeParseControlData(control.content.data),
                });
            } else if (actType == "translate") {
                listener.emit("translate_event", {
                    act,
                    act_type: "translate",
                    data: safeParseControlData(control.content.data),
                });
            } else if (CONTROL_SYNC_ACT_TYPES.has(actType)) {
                listener.emit("control_sync_event", {
                    act,
                    act_type: actType,
                    data: safeParseControlData(control.content.data),
                });
            }
        }

        if (cmd == 603 && parsedData?.more == 1 && parsedData?.lastActionId) {
            listener.requestOfflineVoipControls(String(parsedData.lastActionId), subCmd);
        }

        return true;
    }

    return false;
}
