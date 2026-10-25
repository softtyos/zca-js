import { ThreadType } from "./Enum.js";
import { parseOAMessage, type ParsedOAMessage } from "./OAMessage.js";

export type TAttachmentContent = {
    title: string;
    description: string;
    href: string;
    thumb: string;
    childnumber: number;
    action: string;
    params: string;
    type: string;
};

export type TOtherContent = {
    [key: string]: unknown;
};

export type TMessage = {
    actionId: string;
    msgId: string;
    cliMsgId: string;
    msgType: string;
    uidFrom: string;
    idTo: string;
    dName: string;
    ts: string;
    status: number;
    content: string | TAttachmentContent | TOtherContent;
    notify: string;
    ttl: number;
    userId: string;
    uin: string;
    topOut: string;
    topOutTimeOut: string;
    topOutImprTimeOut: string;
    propertyExt:
        | {
              color: number;
              size: number;
              type: number;
              subType: number;
              ext: string;
          }
        | undefined;
    paramsExt: {
        countUnread: number;
        containType: number;
        platformType: number;
    };
    cmd: number;
    st: number;
    at: number;
    realMsgId: string;
    quote: TQuote | undefined;
};

export type TGroupMessage = TMessage & {
    mentions: TMention[] | undefined;
};

export type TQuote = {
    ownerId: string;
    cliMsgId: number;
    globalMsgId: number;
    cliMsgType: number;
    ts: number;
    msg: string;
    attach: string;
    fromD: string;
    ttl: number;
};

export type TMention = {
    uid: string;
    pos: number;
    len: number;
    type: 0 | 1;
};

export class UserMessage {
    type: ThreadType.User = ThreadType.User;

    data: TMessage;
    threadId: string;
    /**
     * true if the message is sent by the logged in account
     */
    isSelf: boolean;
    /**
     * Dữ liệu đã giải mã nếu đây là tin nhắn từ Zalo Official Account (OA) (`pageMsgs`, `footerv2`, `chat.list.action`, `msginfo.actionlist`, hoặc `chat.ecard`).
     */
    oaData?: ParsedOAMessage;

    constructor(uid: string, data: TMessage, isPageMsg: boolean = false) {
        this.data = data;
        this.threadId = data.uidFrom == "0" ? data.idTo : data.uidFrom;
        this.isSelf = data.uidFrom == "0";

        if (data.idTo == "0") data.idTo = uid;
        if (data.uidFrom == "0") data.uidFrom = uid;
        if (data.quote) {
            data.quote.ownerId = String(data.quote.ownerId);
        }

        const parsedOA = parseOAMessage(data, { isPageMsg });
        if (parsedOA) {
            this.oaData = parsedOA;
        }
    }

    /**
     * Kiểm tra xem tin nhắn có phải là tin nhắn Zalo Official Account (OA) hay không.
     */
    public isOAMessage(): this is UserMessage & { oaData: ParsedOAMessage } {
        return this.oaData !== undefined;
    }
}

export class GroupMessage {
    type: ThreadType.Group = ThreadType.Group;

    data: TGroupMessage;
    threadId: string;
    /**
     * true if the message is sent by the logged in account
     */
    isSelf: boolean;

    constructor(uid: string, data: TGroupMessage) {
        this.data = data;
        this.threadId = data.idTo;
        this.isSelf = data.uidFrom == "0";

        if (data.uidFrom == "0") data.uidFrom = uid;
        if (data.quote) {
            data.quote.ownerId = String(data.quote.ownerId);
        }
    }
}

export type Message = UserMessage | GroupMessage;
