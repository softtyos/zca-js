import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { ThreadType } from "../../models/index.js";
import { apiFactory } from "../../utils.js";

export type UndoMultiMessageItem = {
    globalMsgId: string | number;
    cliMsgId: string | number;
    cliMsgIdUndo?: string | number;
    destId?: string;
};

export type UndoMultiMessageResponse = Record<string, unknown>;

export const undoMultiMessageFactory = apiFactory<UndoMultiMessageResponse>()((api, _ctx, utils) => {
    /**
     * Thu hồi hàng loạt nhiều tin nhắn cùng lúc trong hội thoại cá nhân hoặc nhóm (command 12115 / 12116)
     *
     * @param msgs Danh sách tin nhắn cần thu hồi (`globalMsgId`, `cliMsgId` của tin nhắn gốc)
     * @param threadId ID người nhận hoặc ID nhóm
     * @param type Loại hội thoại (`ThreadType.User` hoặc `ThreadType.Group`)
     * @throws {ZaloApiError}
     */
    return async function undoMultiMessage(
        msgs: UndoMultiMessageItem[],
        threadId: string,
        type: ThreadType = ThreadType.User,
    ) {
        if (!Array.isArray(msgs) || msgs.length === 0) {
            throw new ZaloApiError("Missing messages to undo");
        }
        if (!threadId) {
            throw new ZaloApiError("Missing threadId");
        }

        const isGroup = type === ThreadType.Group || threadId.startsWith("g");
        const cleanThreadId = threadId.startsWith("g") ? threadId.slice(1) : threadId;
        const serviceURL = isGroup
            ? utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/multi_undomsg`)
            : utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/multi_undo`);

        const now = Date.now();
        const normalizedMsgs = msgs.map((m, idx) => ({
            cliMsgId: m.cliMsgIdUndo !== undefined ? m.cliMsgId : now + idx,
            cliMsgIdUndo: m.cliMsgIdUndo !== undefined ? m.cliMsgIdUndo : m.cliMsgId,
            globalMsgId: String(m.globalMsgId),
        }));

        const payload = isGroup
            ? { grid: cleanThreadId, msgs: normalizedMsgs }
            : { toid: cleanThreadId, msgs: normalizedMsgs };

        const encryptedParams = utils.encodeAES(JSON.stringify(payload));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
