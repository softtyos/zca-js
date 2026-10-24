import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, preParseJsonIds } from "../../utils.js";

export type GroupMessageStatusMemberItem = {
    id: string;
    seen?: string | number;
    deliver?: string | number;
    [key: string]: unknown;
};

export type GroupMessageStatusThreadInfo = {
    tId?: string;
    ids: GroupMessageStatusMemberItem[];
    [key: string]: unknown;
};

export type GetGroupMessageStatusQueryItem = {
    /**
     * ID nhóm (không có tiền tố `g`).
     */
    tId: string;
    /**
     * Danh sách UID thành viên cần truy vấn trạng thái `seen` / `deliver` trong nhóm.
     */
    ids: string[];
};

export type GetGroupMessageStatusResponse = {
    statusInfos: GroupMessageStatusThreadInfo[];
    [key: string]: unknown;
};

export const getGroupMessageStatusFactory = apiFactory<GetGroupMessageStatusResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getStatusMsg`);

    /**
     * Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn của danh sách thành viên trong nhóm (command 12017)
     *
     * @param groupIdOrItems ID nhóm (hoặc mảng cấu hình `{ tId, ids }`)
     * @param memberIds Danh sách UID thành viên cần kiểm tra (khi tham số đầu là `groupId`)
     * @throws {ZaloApiError}
     */
    return async function getGroupMessageStatus(
        groupIdOrItems: string | GetGroupMessageStatusQueryItem[],
        memberIds: string[] = [],
    ) {
        let queryData: GetGroupMessageStatusQueryItem[];

        if (Array.isArray(groupIdOrItems)) {
            queryData = groupIdOrItems.map((item) => ({
                tId: item.tId.startsWith("g") ? item.tId.slice(1) : item.tId,
                ids: item.ids.map(String),
            }));
        } else {
            if (!groupIdOrItems) {
                throw new ZaloApiError("Missing groupId");
            }
            const cleanGroupId = groupIdOrItems.startsWith("g") ? groupIdOrItems.slice(1) : groupIdOrItems;
            queryData = [
                {
                    tId: cleanGroupId,
                    ids: memberIds.map(String),
                },
            ];
        }

        const params = {
            param: JSON.stringify({
                data: queryData,
            }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response, (result) => {
            let rawData = result.data as unknown;
            if (typeof rawData === "string" && rawData.length > 0) {
                try {
                    const parsed = JSON.parse(preParseJsonIds(rawData)) as Record<string, unknown>;
                    if (parsed && typeof parsed === "object" && "data" in parsed && parsed.data) {
                        rawData = parsed.data;
                    } else {
                        rawData = parsed;
                    }
                } catch {
                    // Giữ nguyên nếu không phải chuỗi JSON lồng
                }
            }

            if (rawData && typeof rawData === "object") {
                const obj = rawData as Record<string, unknown>;
                if (Array.isArray(obj.statusInfos)) {
                    return obj as GetGroupMessageStatusResponse;
                }
                if (obj.data && typeof obj.data === "object" && Array.isArray((obj.data as Record<string, unknown>).statusInfos)) {
                    return obj.data as GetGroupMessageStatusResponse;
                }
            }

            return {
                statusInfos: Array.isArray(rawData) ? (rawData as GroupMessageStatusThreadInfo[]) : [],
            };
        });
    };
});
