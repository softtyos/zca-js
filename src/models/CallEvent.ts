export enum CallEventType {
    REQUEST = "request",
    ANSWER = "answer",
    ANSWER_ACK = "answer_ack",
    CANCEL = "cancel",
    END = "end",
    RINGRING = "ringring",
    ONOFF_CAMERA = "onoff_camera",
    MUTE_AUDIO = "mute_audio",
    AUDIO_TO_VIDEO = "audio_to_video",
    SHARE_SCREEN = "share_screen",
    GROUP_REQUEST = "group_request",
    GROUP_RINGRING = "group_ring_ring",
    GROUP_ANSWER = "group_answer",
    GROUP_ANSWER_ACK = "group_answer_ack",
    GROUP_CANCEL = "group_cancel",
    GROUP_END = "group_end_call",
    GROUP_ADD_USER = "group_add_user",
    GROUP_NOTIFY = "group_notify",
    GROUP_BROADCAST = "group_broadcast",
    GROUP_BROADCAST_CONFIG = "group_broadcast_config",
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
    codec?: string;
    params?: string | Record<string, unknown>;
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
        case "answer_ack":
        case "answerack":
            type = CallEventType.ANSWER_ACK;
            break;
        case "cancel":
            type = CallEventType.CANCEL;
            break;
        case "end":
        case "endcall":
        case "end_call":
            type = CallEventType.END;
            break;
        case "ringring":
        case "ring_ring":
            type = CallEventType.RINGRING;
            break;
        case "onoff_camera":
            type = CallEventType.ONOFF_CAMERA;
            break;
        case "mute_audio":
            type = CallEventType.MUTE_AUDIO;
            break;
        case "audio_to_video":
            type = CallEventType.AUDIO_TO_VIDEO;
            break;
        case "share_screen":
            type = CallEventType.SHARE_SCREEN;
            break;
        case "group_request":
            type = CallEventType.GROUP_REQUEST;
            break;
        case "group_ring_ring":
        case "group_ringring":
            type = CallEventType.GROUP_RINGRING;
            break;
        case "group_answer":
            type = CallEventType.GROUP_ANSWER;
            break;
        case "group_answer_ack":
            type = CallEventType.GROUP_ANSWER_ACK;
            break;
        case "group_cancel":
            type = CallEventType.GROUP_CANCEL;
            break;
        case "group_end_call":
        case "group_endcall":
        case "group_end":
            type = CallEventType.GROUP_END;
            break;
        case "group_add_user":
            type = CallEventType.GROUP_ADD_USER;
            break;
        case "group_notify":
            type = CallEventType.GROUP_NOTIFY;
            break;
        case "group_broadcast":
            type = CallEventType.GROUP_BROADCAST;
            break;
        case "group_broadcast_config":
            type = CallEventType.GROUP_BROADCAST_CONFIG;
            break;
        default:
            type = CallEventType.UNKNOWN;
            break;
    }

    const enrichedData: TCallEventData = { ...data };
    let parsedParams: Record<string, unknown> | undefined;
    if (typeof enrichedData.params === "string") {
        try {
            const p = JSON.parse(enrichedData.params);
            if (p && typeof p === "object") parsedParams = p as Record<string, unknown>;
        } catch {
            // Ignore invalid JSON
        }
    } else if (enrichedData.params && typeof enrichedData.params === "object") {
        parsedParams = enrichedData.params as Record<string, unknown>;
    }

    if (enrichedData.callId === undefined) {
        const extractedCallId = Number(
            enrichedData.call_id ??
                enrichedData.id ??
                parsedParams?.callId ??
                parsedParams?.call_id ??
                parsedParams?.id ??
                0,
        );
        if (extractedCallId > 0) {
            enrichedData.callId = extractedCallId;
        }
    }

    if (enrichedData.callerId === undefined) {
        const extractedCallerId =
            enrichedData.uidN ??
            parsedParams?.uidN ??
            enrichedData.uidFrom ??
            enrichedData.fromId ??
            parsedParams?.uidFrom;
        if (extractedCallerId !== undefined) {
            enrichedData.callerId = String(extractedCallerId);
        }
    }

    return {
        type,
        act,
        act_type,
        data: enrichedData,
    };
}
