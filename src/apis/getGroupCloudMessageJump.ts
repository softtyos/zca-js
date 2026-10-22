import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { GroupMessage, type TGroupMessage } from "../models/index.js";
import { apiFactory } from "../utils.js";
import type { GetGroupChatHistoryResponse } from "./getGroupChatHistory.js";

export type GetGroupCloudMessageJumpResponse = GetGroupChatHistoryResponse;

export const getGroupCloudMessageJumpFactory = apiFactory<GetGroupCloudMessageJumpResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/rgetv2`);

    /**
     * Nhảy tới vị trí một tin nhắn nhóm cụ thể trên Zalo Cloud Message và lấy ngữ cảnh xung quanh (command 12508)
     *
     * @param groupId ID nhóm
     * @param globalMsgId ID tin nhắn toàn cục cần nhảy tới
     * @param count Số lượng tin nhắn ngữ cảnh cần tải (mặc định `20`)
     * @param msgJump Cờ nhảy tin nhắn (mặc định `1`)
     * @param msgIds Danh sách msgId bổ sung (mặc định `[]`)
     * @throws {ZaloApiError}
     */
    return async function getGroupCloudMessageJump(
        groupId: string,
        globalMsgId: string | number,
        count: number = 20,
        msgJump: number = 1,
        msgIds: Array<string | number> = [],
    ) {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        if (groupId.startsWith("g")) groupId = groupId.slice(1);

        const params = {
            groupId,
            globalMsgId: String(globalMsgId),
            count: Math.min(Math.max(count, 1), 50),
            msgJump,
            msgIds,
            src: 3,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams, nretry: 0 }), {
            method: "GET",
        });

        const page = await utils.resolve(response, (result) => {
            let data = result.data as unknown as GetGroupCloudMessageJumpResponse | string;
            if (typeof data === "string") {
                data = JSON.parse(data) as GetGroupCloudMessageJumpResponse;
            }
            return data;
        });

        const rawMsgs = Array.isArray(page?.groupMsgs) ? (page.groupMsgs as unknown as TGroupMessage[]) : [];
        const groupMsgs: GroupMessage[] = rawMsgs.map((data) => new GroupMessage(ctx.uid, data));
        return Object.assign({}, page || {}, { groupMsgs }) as GetGroupCloudMessageJumpResponse;
    };
});
