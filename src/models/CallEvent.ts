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
