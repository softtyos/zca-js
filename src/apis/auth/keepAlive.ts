import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type KeepAliveResponse = {
    config_vesion?: number;
    [key: string]: unknown;
};

export const keepAliveFactory = apiFactory<KeepAliveResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.chat[0]}/keepalive`);

    /**
     * Gửi tín hiệu duy trì phiên kết nối HTTP tới máy chủ Chat (KeepAlive - command 11770)
     *
     * @throws {ZaloApiError}
     */
    return async function keepAlive() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response);
    };
});
