import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetLastSeenReactionOptions = {
    groupIds?: string[];
    userIds?: string[];
};

export type GetLastSeenReactionResponse = {
    clearUnreadInfo: Record<string, unknown>[];
    [key: string]: unknown;
};

export const getLastSeenReactionFactory = apiFactory<GetLastSeenReactionResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.reaction[0]}/api/react/gLastSn`);

    /**
     * Lấy trạng thái đã xem cảm xúc (Reaction) cuối cùng của danh sách nhóm và cá nhân (command 12450)
     *
     * @param options Danh sách ID nhóm (`groupIds`) và UID cá nhân (`userIds`)
     * @throws {ZaloApiError}
     */
    return async function getLastSeenReaction(options: GetLastSeenReactionOptions = {}) {
        const group = (options.groupIds ?? []).map((g) => (g.startsWith("g") ? g.slice(1) : g));
        const oneone = options.userIds ?? [];
        const params = {
            group,
            oneone,
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
