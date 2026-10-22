import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type ReadContactTabResponse = Record<string, unknown> | string;

export const readContactTabFactory = apiFactory<ReadContactTabResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/read-contact-tab`);

    /**
     * Đánh dấu đã đọc tab Danh bạ (command 12231)
     *
     * @param ts Dấu thời gian (mặc định: `Date.now()`)
     * @throws {ZaloApiError}
     */
    return async function readContactTab(ts: number = Date.now()) {
        const params = {
            ts,
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
