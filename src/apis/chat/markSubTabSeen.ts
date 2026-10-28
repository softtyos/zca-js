import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type MarkSubTabSeenResponse = {
    status?: number;
    [key: string]: unknown;
};

export const markSubTabSeenFactory = apiFactory<MarkSubTabSeenResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.chat[0]}/api/subtab/seen`);

    /**
     * Đánh dấu đã xem các tab phụ của danh sách hội thoại (command 16214)
     *
     * @param seens Danh sách thông tin tab phụ đã xem
     * @throws {ZaloApiError}
     */
    return async function markSubTabSeen(seens: unknown[]) {
        const params = {
            msgInfos: JSON.stringify({ seens }),
            imei: ctx.imei,
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
