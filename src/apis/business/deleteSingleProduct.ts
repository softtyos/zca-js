import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type DeleteSingleProductOptions = {
    productId: string;
    catalogId: string;
};

export type DeleteSingleProductResponse = Record<string, unknown>;

export const deleteSingleProductFactory = apiFactory<DeleteSingleProductResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.catalog[0]}/api/prodcatalog/product/delete`);

    /**
     * Xóa một sản phẩm đơn lẻ khỏi danh mục Zalo Business (command 12042)
     *
     * @param options Thông tin `productId` và `catalogId`
     * @throws {ZaloApiError}
     */
    return async function deleteSingleProduct(options: DeleteSingleProductOptions) {
        const params = {
            product_id: options.productId,
            catalog_id: options.catalogId,
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
