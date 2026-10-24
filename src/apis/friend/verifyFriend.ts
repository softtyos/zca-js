import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type VerifyFriendOptions = {
    phonebookVersion?: number;
    avatarSize?: number;
    language?: string;
};

export type VerifyFriendResponse = {
    profiles?: Record<string, unknown>;
    unchangeds_profile?: string[];
    [key: string]: unknown;
};

export const verifyFriendFactory = apiFactory<VerifyFriendResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/verify`);

    /**
     * Kiểm tra và xác thực danh sách bạn bè qua `/api/social/friend/verify` (command 11138)
     *
     * @param friendIds Danh sách UID bạn bè cần xác thực
     * @param options Tùy chọn truy vấn
     * @throws {ZaloApiError}
     */
    return async function verifyFriend(friendIds: string | string[], options: VerifyFriendOptions = {}) {
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
