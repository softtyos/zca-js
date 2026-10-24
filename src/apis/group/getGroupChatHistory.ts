import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, preParseJsonIds } from "../../utils.js";

import { GroupMessage, type TGroupMessage } from "../../models/index.js";

export type GetGroupChatHistoryOptions = {
    /**
     * Số lượng tin nhắn cần tải (mặc định: `50`).
     */
    count?: number;
    /**
     * Con trỏ `globalMsgId` (`lastMsgId` của trang trước) để phân trang lùi sâu về quá khứ (mặc định: `0`).
     */
    cursor?: number | string;
    /**
     * Số trang tối đa được phép gọi trong một lần thực thi.
     */
    maxPages?: number;
    /**
     * Sử dụng endpoint `/api/cm/getoldv2` (command 12507) thay vì `/api/cm/getrecentv2` (command 12506).
     */
    useOldEndpoint?: boolean;
    /**
     * Danh sách `msgIds` cục bộ bổ sung (mặc định: `[]`).
     */
    msgIds?: Array<string | number>;
    /**
     * Nguồn truy vấn (mặc định: `3`).
     */
    src?: number;
    /**
     * Cờ hội thoại OA (tùy chọn).
     */
    isOA?: boolean;
};

export type GetGroupChatHistoryResponse = {
    error?: number;
    lastMsgId?: number | string;
    nextCursor?: number | string;
    minMsgId?: number | string;
    maxMsgId?: number | string;
    msgJumpId?: number | string;
    hasMore?: boolean;
    isOld?: boolean;
    isFiltered?: boolean;
    rootMsgId?: number | string;
    isRootDel?: boolean;
    groupMsgs: GroupMessage[];
    tsJoinGroup?: number;
    isFilteredByPhase?: boolean;
    isFilteredByTimeJoin?: boolean;
};

export const getGroupChatHistoryFactory = apiFactory<GetGroupChatHistoryResponse>()((api, ctx, utils) => {
    const recentServiceURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getrecentv2`);
    const oldServiceURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getoldv2`);

    /**
     * Lấy lịch sử tin nhắn nhóm từ Zalo Cloud Message (hỗ trợ cả `/api/cm/getrecentv2` cmd 12506 và `/api/cm/getoldv2` cmd 12507)
     *
     * @param groupId ID nhóm
     * @param countOrOptions Số lượng tin nhắn cần tải (mặc định: `50`) hoặc đối tượng cấu hình phân trang `GetGroupChatHistoryOptions`
     *
     * @throws {ZaloApiError}
     */
    return async function getGroupChatHistory(
        groupId: string,
        countOrOptions: number | GetGroupChatHistoryOptions = 50,
    ) {
        if (!groupId) throw new ZaloApiError("Missing groupId");
        if (groupId.startsWith("g")) groupId = groupId.slice(1);

        const options: GetGroupChatHistoryOptions =
            typeof countOrOptions === "number" ? { count: countOrOptions } : countOrOptions || {};

        const requestedCount = Math.max(options.count ?? 50, 1);
        const maxPages =
            options.maxPages ?? Math.max(10, Math.ceil(requestedCount / 50) + 2);
        const targetServiceURL = options.useOldEndpoint ? oldServiceURL : recentServiceURL;
        const msgIds = options.msgIds ?? [];
        const src = options.src ?? 3;

        const messages: TGroupMessage[] = [];
        const seenMsgIds = new Set<string>();
        let cursor: number | string = options.cursor ?? 0;
        let lastPage: GetGroupChatHistoryResponse | null = null;
        let pageCount = 0;

        while (messages.length < requestedCount && pageCount < maxPages) {
            pageCount++;
            const params: Record<string, unknown> = {
                groupId,
                globalMsgId: cursor,
                count: Math.min(50, requestedCount - messages.length),
                msgIds,
                imei: ctx.imei,
                src,
            };
            if (options.isOA) {
                params.isOA = 1;
            }

            const encryptedParams = utils.encodeAES(JSON.stringify(params));
            if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

            const response = await utils.request(
                utils.makeURL(targetServiceURL, { params: encryptedParams, nretry: 0 }),
                {
                    method: "GET",
                },
            );

            lastPage = await utils.resolve(response, (result) => {
                let data = result.data as unknown as GetGroupChatHistoryResponse | string;

                if (typeof data === "string") {
                    data = JSON.parse(preParseJsonIds(data)) as GetGroupChatHistoryResponse;
                }

                return data;
            });

            if (!lastPage || !Array.isArray(lastPage.groupMsgs)) break;

            for (const rawMsg of lastPage.groupMsgs as unknown as TGroupMessage[]) {
                if (messages.length >= requestedCount) break;
                const msgIdKey = String(rawMsg.msgId ?? rawMsg.cliMsgId ?? "");
                if (msgIdKey && seenMsgIds.has(msgIdKey)) continue;
                if (msgIdKey) seenMsgIds.add(msgIdKey);
                messages.push(rawMsg);
            }

            const nextCursor = lastPage.lastMsgId;
            if (
                !lastPage.hasMore ||
                nextCursor === undefined ||
                nextCursor === null ||
                nextCursor === "" ||
                nextCursor === 0 ||
                String(nextCursor) === String(cursor)
            ) {
                break;
            }
            cursor = nextCursor;
        }

        const groupMsgs: GroupMessage[] = messages.map((data) => new GroupMessage(ctx.uid, data));
        return Object.assign({}, lastPage || {}, {
            groupMsgs,
            nextCursor: lastPage?.lastMsgId,
        }) as GetGroupChatHistoryResponse;
    };
});
