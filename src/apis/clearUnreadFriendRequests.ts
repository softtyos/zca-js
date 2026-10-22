import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type ClearUnreadFriendRequestsResponse = Record<string, unknown> | string;

export const clearUnreadFriendRequestsFactory = apiFactory<ClearUnreadFriendRequestsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommendsv2/read-requests`);

    /**
     * Đánh dấu đã xem danh sách lời mời kết bạn chưa đọc (command 12232)
     *
     * @param uidsSeen Danh sách UID đã xem lời mời kết bạn (mặc định `[]`)
     * @throws {ZaloApiError}
     */
    return async function clearUnreadFriendRequests(uidsSeen: string[] = []) {
        if (!uidsSeen || uidsSeen.length === 0) {
            return {};
        }
        const params = {
            uids_seen: uidsSeen,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
