import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetLastSeenOptions = {
    groupIds?: string[];
    userIds?: string[];
};

export type GetLastSeenResponse = {
    clearUnreadInfo?: Record<string, unknown>[];
    data?: string;
    status?: number;
    [key: string]: unknown;
};

export const getLastSeenFactory = apiFactory<GetLastSeenResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/preloadconvers/get-last-seen`);

    /**
     * Lấy thông tin trạng thái đã xem cuối cùng của danh sách nhóm và cá nhân (command 12009)
     *
     * @param options Danh sách ID nhóm (`groupIds`) và UID cá nhân (`userIds`)
     * @throws {ZaloApiError}
     */
    return async function getLastSeen(options: GetLastSeenOptions = {}) {
        const group = (options.groupIds ?? []).map((g) => (g.startsWith("g") ? g.slice(1) : g));
        const oneone = options.userIds ?? [];
        const params = {
            param: JSON.stringify({ group, oneone }),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response, (result) => {
            const raw = result.data as GetLastSeenResponse;
            if (raw && typeof raw.data === "string") {
                try {
                    const inner = JSON.parse(raw.data) as { data?: Record<string, unknown> };
                    return (inner?.data ?? inner) as GetLastSeenResponse;
                } catch {
                    return raw;
                }
            }
            return raw;
        });
    };
});
