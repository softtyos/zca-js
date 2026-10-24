import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { GroupMessage, type TGroupMessage } from "../../models/index.js";
import { apiFactory, preParseJsonIds } from "../../utils.js";

export type GetGroupCloudMessagePathOptions = {
    groupId: string;
    globalMsgId: string | number;
    count?: number;
    reverse?: number | boolean;
    rGlobalMsgId?: string | number;
    rOwnerId?: string;
    rClientMsgId?: string | number;
};

export type GetGroupCloudMessagePathResponse = {
    lastMsgId?: string | number;
    minMsgId?: string | number;
    maxMsgId?: string | number;
    hasMore?: boolean;
    groupMsgs: GroupMessage[];
    [key: string]: unknown;
};

export const getGroupCloudMessagePathFactory = apiFactory<GetGroupCloudMessagePathResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/getpath`);

    /**
     * Lấy chuỗi tin nhắn nhóm theo đường dẫn nhảy tới một tin nhắn cụ thể (`globalMsgId` / `rGlobalMsgId`) qua `/api/cm/getpath` (command 12504)
     *
     * @param options Cấu hình truy vấn đường dẫn tin nhắn nhóm
     * @throws {ZaloApiError}
     */
    return async function getGroupCloudMessagePath(options: GetGroupCloudMessagePathOptions) {
        if (!options?.groupId) {
            throw new ZaloApiError("Missing groupId");
        }

        const cleanGroupId = options.groupId.startsWith("g") ? options.groupId.slice(1) : options.groupId;
        const params: Record<string, unknown> = {
            groupId: cleanGroupId,
            globalMsgId: options.globalMsgId,
            count: options.count ?? 50,
            reverse: typeof options.reverse === "boolean" ? (options.reverse ? 1 : 0) : (options.reverse ?? 0),
        };

        if (options.rGlobalMsgId !== undefined && options.rOwnerId) {
            params.rGlobalMsgId = options.rGlobalMsgId;
            params.rOwnerId = options.rOwnerId;
            if (options.rClientMsgId !== undefined) {
                params.rClientMsgId = options.rClientMsgId;
            }
        }

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams, nretry: 0 }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            let data = result.data as unknown;
            if (typeof data === "string") {
                data = JSON.parse(preParseJsonIds(data));
            }
            const rawObj = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
            const rawMsgs = Array.isArray(rawObj.groupMsgs) ? (rawObj.groupMsgs as TGroupMessage[]) : [];
            const groupMsgs = rawMsgs.map((m) => new GroupMessage(ctx.uid, m));
            return {
                ...rawObj,
                groupMsgs,
            };
        });
    };
});
