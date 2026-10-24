import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, preParseJsonIds } from "../../utils.js";

export type DirectMessageStatusItem = {
    tId: string;
    seen?: string | number;
    deliver?: string | number;
    [key: string]: unknown;
};

export type GetDirectMessageStatusResponse = {
    statusInfos: DirectMessageStatusItem[];
    [key: string]: unknown;
};

export const getDirectMessageStatusFactory = apiFactory<GetDirectMessageStatusResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/message/getStatusMsg`);

    /**
     * Truy vấn trạng thái Đã nhận (`deliver`) và Đã xem (`seen`) tin nhắn trong các hội thoại cá nhân 1-1 (command 12016)
     *
     * @param data Danh sách UID hoặc đối tượng truy vấn `{ tId }`
     * @throws {ZaloApiError}
     */
    return async function getDirectMessageStatus(data: Array<string | { tId: string; [key: string]: unknown }>) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new ZaloApiError("Missing data");
        }

        const formattedData = data.map((item) => (typeof item === "string" ? { tId: item } : item));
        const params = {
            param: JSON.stringify({
                data: formattedData,
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
                    rawData = "data" in parsed && parsed.data ? parsed.data : parsed;
                } catch {
                    // Giữ nguyên nếu không phải chuỗi JSON lồng
                }
            }
            if (rawData && typeof rawData === "object") {
                const obj = rawData as Record<string, unknown>;
                return {
                    ...obj,
                    statusInfos: Array.isArray(obj.statusInfos) ? (obj.statusInfos as DirectMessageStatusItem[]) : [],
                };
            }
            return { statusInfos: [] };
        });
    };
});
