import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { GroupMemberProfile } from "../group/getGroupMembersInfo.js";

export type GetFriendProfilesV2Options = {
    /**
     * Phiên bản danh bạ (mặc định: `0`).
     */
    phonebookVersion?: number;
    /**
     * Kích thước ảnh đại diện (mặc định: `120`).
     */
    avatarSize?: number;
    /**
     * Ngôn ngữ (mặc định: `"vi"`).
     */
    language?: string;
    /**
     * Trả kèm trạng thái online của bạn bè (mặc định: `true`).
     */
    showOnlineStatus?: boolean;
};

export type GetFriendProfilesV2Response = {
    profiles: Record<string, GroupMemberProfile>;
    unchangeds_profile?: string[];
    phonebook_version?: number;
    [key: string]: unknown;
};

export const getFriendProfilesV2Factory = apiFactory<GetFriendProfilesV2Response>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getprofiles/v2`);

    /**
     * Lấy hàng loạt hồ sơ chi tiết của danh sách bạn bè kèm trạng thái online qua `/api/social/friend/getprofiles/v2` (command 11140)
     *
     * @param friendIds Mảng UID cần lấy hồ sơ (có thể kèm hậu tố `_version` hoặc truyền UID thuần)
     * @param options Tùy chọn truy vấn
     * @throws {ZaloApiError}
     */
    return async function getFriendProfilesV2(
        friendIds: string | string[],
        options: GetFriendProfilesV2Options = {},
    ) {
        const rawIds = Array.isArray(friendIds) ? friendIds : [friendIds];
        if (rawIds.length === 0) {
            throw new ZaloApiError("Missing friendIds");
        }

        const friendPversionMap = rawIds.map((id) => (id.includes("_") ? id : `${id}_0`));
        const params = {
            phonebook_version: options.phonebookVersion ?? 0,
            friend_pversion_map: friendPversionMap,
            avatar_size: options.avatarSize ?? 120,
            language: options.language ?? ctx.language ?? "vi",
            show_online_status: options.showOnlineStatus !== false ? 1 : 0,
            imei: ctx.imei,
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
