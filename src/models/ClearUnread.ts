import { ThreadType } from "./Enum.js";

export type TClearUnreadItem = {
    idTo: string;
    userName?: string;
    lastMsgId: string;
    isGroup: number;
    ts?: number;
    type?: number;
};

export type TClearUnreads = {
    clearUnreads: TClearUnreadItem[];
};

export class ClearUnread {
    idTo: string;
    userName?: string;
    lastMsgId: string;
    isGroup: boolean;
    threadType: ThreadType;
    ts?: number;
    type?: number;

    constructor(data: TClearUnreadItem) {
        this.idTo = data.idTo;
        this.userName = data.userName;
        this.lastMsgId = data.lastMsgId;
        this.isGroup = data.isGroup === 1;
        this.threadType = data.isGroup === 1 ? ThreadType.Group : ThreadType.User;
        this.ts = data.ts;
        this.type = data.type;
    }
}
