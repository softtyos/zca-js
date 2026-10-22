import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type MiniProfileItem = {
    userId: string;
    avatar: string;
    globalId: string;
    type: number;
    bizPkg?: {
        label: string | null;
        pkgId: number;
    };
    [key: string]: unknown;
};

export type GetMiniProfileResponse = Record<string, MiniProfileItem>;

export const getMiniProfileFactory = apiFactory<GetMiniProfileResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getminiprofiles`);

    /**
     * Lấy nhanh thông tin hồ sơ rút gọn (Avatar, Global ID, gói Biz) của danh sách người dùng (command 12134)
     *
     * @param friendIds Mảng UID cần lấy thông tin
     * @param avatarSize Kích thước ảnh đại diện (mặc định: 120)
     * @throws {ZaloApiError}
     */
    return async function getMiniProfile(friendIds: string[], avatarSize: number = 120) {
        if (!Array.isArray(friendIds) || friendIds.length === 0) {
            return {};
        }

        const params = {
            friend_ids: friendIds,
            avatar_size: avatarSize,
            incInvalid: 1,
            srcReq: -1,
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

        return utils.resolve(response);
    };
});
