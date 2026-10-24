import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { MediaStoreItem } from "./getConversationMedia.js";

export type GetPersonalMediaPreviewResponse = MediaStoreItem[];

export const getPersonalMediaPreviewFactory = apiFactory<GetPersonalMediaPreviewResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.media_store_send2me[0]}/api/media/oneone/preview`);

    /**
     * Lấy danh sách xem trước nhanh Kho Lưu Trữ trong Cloud của tôi (Send2Me) (command 12221)
     *
     * @param limit Số lượng mục tối đa (mặc định: `50`)
     * @throws {ZaloApiError}
     */
    return async function getPersonalMediaPreview(limit: number = 50) {
        const params = {
            limit,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "POST",
        });

        return utils.resolve(response);
    };
});
