import { ZaloApiError } from "../Errors/ZaloApiError.js";
import {
    ClearUnread,
    GroupMessage,
    UserMessage,
    type Message,
    type TClearUnreadItem,
    type TGroupMessage,
    type TMessage,
} from "../models/index.js";
import { apiFactory } from "../utils.js";

export type PreloadConversationsRawResponse = {
    msgs?: TMessage[];
    groupMsgs?: TGroupMessage[];
    allmsgs?: Array<TMessage | (TGroupMessage & { isGroup?: boolean | number })>;
    eeMsgs?: unknown[];
    pageMsgs?: unknown[];
    clearUnreads?: TClearUnreadItem[];
    clearUnreadsReact?: TClearUnreadItem[];
    seens?: unknown[];
    lastActionId?: string;
    lastActionIdOther?: string;
    more?: number;
    conversations?: Array<{
        conv_id: string;
        last_msgs?: unknown[];
        unread_count?: number;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
};

export type PreloadConversationsResponse = PreloadConversationsRawResponse & {
    messages: Message[];
    unreadCleared: ClearUnread[];
};

export const preloadConversationsFactory = apiFactory<PreloadConversationsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/preloadconvers/get-last-msgs`);

    /**
     * Preload last messages and unread-cleared states across active conversations.
     * Useful for initial state loading and catching up missed messages after reconnect.
     *
     * @param threadIdLocalMsgId Optional map of `{ [threadId]: lastLocalMsgId }` (defaults to `{}`)
     * @throws {ZaloApiError}
     */
    return async function preloadConversations(threadIdLocalMsgId: Record<string, string | number> = {}) {
        const params = {
            threadIdLocalMsgId: JSON.stringify(threadIdLocalMsgId ?? {}),
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            let data = (result.data ?? {}) as PreloadConversationsRawResponse | string;
            if (typeof data === "string") {
                data = JSON.parse(data) as PreloadConversationsRawResponse;
            }

            const messages: Message[] = [];
            const seenMsgIds = new Set<string>();

            if (Array.isArray(data.msgs)) {
                for (const msg of data.msgs) {
                    const id = String(msg.msgId ?? "");
                    if (id && seenMsgIds.has(id)) continue;
                    if (id) seenMsgIds.add(id);
                    messages.push(new UserMessage(ctx.uid, msg));
                }
            }

            if (Array.isArray(data.groupMsgs)) {
                for (const msg of data.groupMsgs) {
                    const id = String(msg.msgId ?? "");
                    if (id && seenMsgIds.has(id)) continue;
                    if (id) seenMsgIds.add(id);
                    messages.push(new GroupMessage(ctx.uid, msg));
                }
            }

            if (Array.isArray(data.allmsgs)) {
                for (const msg of data.allmsgs) {
                    const id = String(msg.msgId ?? "");
                    if (id && seenMsgIds.has(id)) continue;
                    if (id) seenMsgIds.add(id);
                    const isGroup =
                        ("isGroup" in msg && Boolean(msg.isGroup)) ||
                        (typeof msg.idTo === "string" && msg.idTo.startsWith("g"));
                    if (isGroup) {
                        messages.push(new GroupMessage(ctx.uid, msg as TGroupMessage));
                    } else {
                        messages.push(new UserMessage(ctx.uid, msg as TMessage));
                    }
                }
            }

            const unreadCleared: ClearUnread[] = Array.isArray(data.clearUnreads)
                ? data.clearUnreads.map((item) => new ClearUnread(item))
                : [];

            return {
                ...data,
                messages,
                unreadCleared,
            };
        });
    };
});
