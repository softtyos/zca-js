import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type CancelPullMobileResponse = {
    error_code?: number | string;
    error_message?: string;
    data?: string;
    [key: string]: unknown;
};

export type CancelPullMobileParams = {
    public_key: string;
    pc_name?: string;
};

export const cancelPullMobileFactory = apiFactory<CancelPullMobileResponse>()((api, ctx, utils) => {
    const baseURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/cancel_pull_mobile_msg`);

    /**
     * Huỷ yêu cầu đồng bộ tin nhắn từ điện thoại đang chờ (`cancel_pull_mobile_msg`, command `12700`).
     *
     * @param params Tham số huỷ đồng bộ (`public_key`, `pc_name`)
     * @throws {ZaloApiError}
     */
    return async function cancelPullMobile({ public_key, pc_name = "Web" }: CancelPullMobileParams) {
        if (!public_key) throw new ZaloApiError("Missing public_key");

        const payload = {
            pc_name,
            public_key,
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(payload));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const serviceURL = utils.makeURL(
            baseURL,
            {
                zpw_ver: ctx.API_VERSION,
                zpw_type: ctx.API_TYPE,
                params: encryptedParams,
                nretry: 0,
            },
            false,
        );

        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
