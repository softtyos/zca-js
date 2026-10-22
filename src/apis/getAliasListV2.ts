import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type AliasItemV2 = {
    userId: string;
    alias: string;
};

export type GetAliasListV2Response = {
    items: AliasItemV2[];
    updateTime?: string;
    [key: string]: unknown;
};

export const getAliasListV2Factory = apiFactory<GetAliasListV2Response>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.alias[0]}/api/alias/list/v2`);

    /**
     * Lấy danh sách tên gợi nhớ (Alias) của bạn bè chuẩn V2 có hỗ trợ phân trang (command 12205)
     *
     * @param page Trang cần lấy (mặc định: 1)
     * @param count Số lượng mục mỗi trang (mặc định: 100)
     * @throws {ZaloApiError}
     */
    return async function getAliasListV2(page: number = 1, count: number = 100) {
        const params = {
            page,
            count,
            src: -1,
            imei: ctx.imei,
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
