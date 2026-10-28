import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetDefaultGuggyGifsResponse = Record<string, unknown>;

export const getDefaultGuggyGifsFactory = apiFactory<GetDefaultGuggyGifsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/guggy/default`);

    /**
     * Lấy danh sách ảnh động Guggy GIF mặc định (command 11749)
     *
     * @param limit Số lượng kết quả tối đa (mặc định `10`)
     * @throws {ZaloApiError}
     */
    return async function getDefaultGuggyGifs(limit: number = 10) {
        const params = {
            limit,
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
