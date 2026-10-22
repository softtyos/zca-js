import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { ExtraContextInfo } from "../group/getExtraGroupInfo.js";

export type GetExtraFriendInfoResponse = Record<string, ExtraContextInfo>;

export const getExtraFriendInfoFactory = apiFactory<GetExtraFriendInfoResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/context/multiget`);

    /**
     * Lấy ngữ cảnh và vai trò mở rộng (ví dụ `role: ["boss"]`) của danh sách bạn bè (command 11442)
     *
     * @param friendIds Mảng UID cần truy vấn
     * @throws {ZaloApiError}
     */
    return async function getExtraFriendInfo(friendIds: string[]) {
        if (!Array.isArray(friendIds) || friendIds.length === 0) {
            return {};
        }

        const params = {
            fids: friendIds,
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
