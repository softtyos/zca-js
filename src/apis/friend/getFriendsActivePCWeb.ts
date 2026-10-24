import { apiFactory } from "../../utils.js";

export type GetFriendsActivePCWebResponse = {
    uids?: string[];
    activeUsers?: unknown[];
    [key: string]: unknown;
};

export const getFriendsActivePCWebFactory = apiFactory<GetFriendsActivePCWebResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/active-pcweb`);

    /**
     * Lấy danh sách bạn bè đang hoạt động trên Zalo PC / Web qua `/api/social/friend/active-pcweb` (command 12072)
     *
     * @throws {ZaloApiError}
     */
    return async function getFriendsActivePCWeb() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
