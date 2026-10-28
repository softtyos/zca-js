import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type SubmitSyncMediaActionsResponse = Record<string, unknown>;

export const submitSyncMediaActionsFactory = apiFactory<SubmitSyncMediaActionsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sync_action[0]}/api/sync_action/media`);

    /**
     * Gửi danh sách hành động đồng bộ hóa tệp đa phương tiện lên máy chủ (command 16213)
     *
     * @param syncList Danh sách hành động đồng bộ Media
     * @throws {ZaloApiError}
     */
    return async function submitSyncMediaActions(syncList: unknown[]) {
        const params = {
            syncList: JSON.stringify(syncList),
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
