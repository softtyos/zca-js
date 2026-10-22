import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type PullMobileResponse = {
    error_code?: number | string;
    error_message?: string;
    data?: string;
    [key: string]: unknown;
};

export type PullMobileParams = {
    public_key: string;
    pc_name?: string;
    from_seq_id?: number;
    is_retry?: number;
    min_seq_id?: number;
    temp_key?: string;
};

export const pullMobileFactory = apiFactory<PullMobileResponse>()((api, ctx, utils) => {
    const baseURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/pull_mobile_msg`);

    /**
     * Yêu cầu thiết bị di động Zalo đóng gói và tải lên bản sao lưu tin nhắn (`pull_mobile_msg`, command `12000`).
     * Sự kiện tiến trình (`user_confirm`, `syncmsg_info`, `transfer_error`) sẽ được đẩy về qua `api.listener.on("sync_event")`.
     *
     * @param params Tham số khởi tạo đồng bộ (bao gồm `public_key` RSA SPKI DER Base64)
     * @throws {ZaloApiError}
     */
    return async function pullMobile({
        public_key,
        pc_name = "Web",
        from_seq_id = 0,
        is_retry = 0,
        min_seq_id = 0,
        temp_key = "",
    }: PullMobileParams) {
        if (!public_key) throw new ZaloApiError("Missing public_key");

        const payload = {
            pc_name,
            public_key,
            from_seq_id,
            is_retry,
            min_seq_id,
            temp_key,
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
