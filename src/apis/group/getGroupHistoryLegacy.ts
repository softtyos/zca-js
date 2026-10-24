import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { GroupMessage, type TGroupMessage } from "../../models/index.js";
import { apiFactory, preParseJsonIds } from "../../utils.js";

export type GetGroupHistoryLegacyResponse = {
    groupMsgs?: GroupMessage[];
    msgs?: GroupMessage[];
    [key: string]: unknown;
};

export const getGroupHistoryLegacyFactory = apiFactory<GetGroupHistoryLegacyResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/history`);

    /**
     * Lấy lịch sử tin nhắn nhóm qua endpoint `/api/group/history` trên miền `group` (command 11240)
     *
     * @param groupId ID của nhóm
     * @param count Số lượng tin nhắn cần tải (mặc định: `20`)
     * @throws {ZaloApiError}
     */
    return async function getGroupHistoryLegacy(groupId: string, count: number = 20) {
        if (!groupId) {
            throw new ZaloApiError("Missing groupId");
        }
        const cleanGroupId = groupId.startsWith("g") ? groupId.slice(1) : groupId;

        const params = {
            grid: cleanGroupId,
            count,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            let data = result.data as unknown;
            if (typeof data === "string") {
                try {
                    data = JSON.parse(preParseJsonIds(data));
                } catch {
                    data = {};
                }
            }

            if (Array.isArray(data)) {
                const groupMsgs = (data as TGroupMessage[]).map((m) => new GroupMessage(ctx.uid, m));
                return { groupMsgs };
            }

            if (data && typeof data === "object") {
                const obj = data as Record<string, unknown>;
                const rawList = Array.isArray(obj.groupMsgs)
                    ? (obj.groupMsgs as TGroupMessage[])
                    : Array.isArray(obj.msgs)
                      ? (obj.msgs as TGroupMessage[])
                      : null;
                if (rawList) {
                    const groupMsgs = rawList.map((m) => new GroupMessage(ctx.uid, m));
                    return {
                        ...obj,
                        groupMsgs,
                    };
                }
                return obj as GetGroupHistoryLegacyResponse;
            }

            return { groupMsgs: [] };
        });
    };
});
