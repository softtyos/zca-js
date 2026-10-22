import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { MediaStoreItem } from "./getConversationMedia.js";

export type GetMediaStorePreviewResponse = MediaStoreItem[];

export const getMediaStorePreviewFactory = apiFactory<GetMediaStorePreviewResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.media_store[0]}/api/mediastore/preview`);

    /**
     * Lấy danh sách xem trước nhanh Kho Lưu Trữ (Ảnh/Video, File, Link) của nhóm (command 11843)
     *
     * @param groupId ID của nhóm
     * @param limit Số lượng mục tối đa (mặc định: 50)
     * @throws {ZaloApiError}
     */
    return async function getMediaStorePreview(groupId: string, limit: number = 50) {
        if (!groupId) {
            throw new ZaloApiError("Missing groupId");
        }

        const cleanGroupId = groupId.startsWith("g") ? groupId.slice(1) : groupId;
        const params = {
            limit,
            group_id: cleanGroupId,
            imei: ctx.imei,
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
