import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetProductDetailResponse = Record<string, unknown>;

export const getProductDetailFactory = apiFactory<GetProductDetailResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/view`);

    /**
     * Lấy thông tin chi tiết một sản phẩm trong danh mục Zalo Business (command 12057)
     *
     * @param productId ID sản phẩm cần xem
     * @throws {ZaloApiError}
     */
    return async function getProductDetail(productId: string) {
        const params = {
            product_id: productId,
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
