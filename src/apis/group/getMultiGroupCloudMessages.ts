import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetMultiGroupCloudMessagesResponse = {
    groupMsgs?: Record<string, unknown[]>;
    [key: string]: unknown;
};

export const getMultiGroupCloudMessagesFactory = apiFactory<GetMultiGroupCloudMessagesResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_cloud_message[0]}/api/cm/mget`);

    /**
     * Đồng bộ nhanh tin nhắn Cloud của nhiều nhóm cùng lúc theo danh sách `groupIds` (command 12503 - `syncCloudMsgFirstLogin`)
     *
     * @param groupIds Danh sách ID nhóm cần tải tin nhắn Cloud
     * @param nretry Số lần thử lại (mặc định: `0`)
     * @throws {ZaloApiError}
     */
    return async function getMultiGroupCloudMessages(groupIds: string[], nretry: number = 0) {
        if (!Array.isArray(groupIds) || groupIds.length === 0) {
            throw new ZaloApiError("Missing groupIds");
        }

        const cleanGroupIds = groupIds.map((gid) => (gid.startsWith("g") ? gid.slice(1) : gid));
        const params = {
            groupIds: cleanGroupIds,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams, nretry }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
