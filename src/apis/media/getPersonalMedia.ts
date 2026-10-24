import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { GetConversationMediaResponse, MediaStoreType } from "./getConversationMedia.js";

export type GetPersonalMediaOptions = {
    mediaType?: MediaStoreType;
    limit?: number;
    lastId?: number | string;
    lastFetchId?: number;
};

export const getPersonalMediaFactory = apiFactory<GetConversationMediaResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.media_store_send2me[0]}/api/media/oneone/list`);

    /**
     * Lấy danh sách Kho Lưu Trữ Ảnh/Video (`"media"`), File (`"file"`), hoặc Link (`"link"`) trong Cloud của tôi (Send2Me) (command 12220)
     *
     * @param options Tùy chọn truy vấn (`mediaType`, `limit`, `lastId`, `lastFetchId`)
     * @throws {ZaloApiError}
     */
    return async function getPersonalMedia(options: GetPersonalMediaOptions = {}) {
        const params: Record<string, unknown> = {
            media_type: options.mediaType ?? "media",
            limit: options.limit ?? 20,
        };

        if (options.lastId !== undefined) {
            params.last_id = options.lastId;
        }
        if (options.lastFetchId !== undefined && !Number.isNaN(options.lastFetchId)) {
            params.lastFetchId = options.lastFetchId;
        }

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
