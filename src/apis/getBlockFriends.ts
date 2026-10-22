import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetBlockFriendsResponse = {
    profiles: Record<string, unknown>[];
    version: number;
    hasMore: number;
};

export const getBlockFriendsFactory = apiFactory<GetBlockFriendsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/blocklistv2`);

    /**
     * Lấy danh sách người dùng đang bị chặn chuẩn V2 (command 11429)
     *
     * @param page Trang cần lấy (mặc định: 1)
     * @param count Số lượng mỗi trang (mặc định: 50)
     * @param avatarSize Kích thước ảnh đại diện (mặc định: 120)
     * @throws {ZaloApiError}
     */
    return async function getBlockFriends(page: number = 1, count: number = 50, avatarSize: number = 120) {
        const params = {
            page,
            count,
            avatar: avatarSize,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
