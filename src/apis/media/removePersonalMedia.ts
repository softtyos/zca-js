import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";
import type { MediaStoreType } from "./getConversationMedia.js";

export type RemovePersonalMediaOptions = {
    mediaType: MediaStoreType;
    mediaId: number | string | Array<number | string>;
};

export type RemovePersonalMediaResponse = {
    [key: string]: unknown;
};

export const removePersonalMediaFactory = apiFactory<RemovePersonalMediaResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.media_store_send2me[0]}/api/media/oneone/remove`);

    /**
     * Xóa mục lưu trữ trong Kho Lưu Trữ Cloud của tôi (Send2Me) (command 12222)
     *
     * @param options Thông tin mục cần xóa (`mediaType`, `mediaId`)
     * @throws {ZaloApiError}
     */
    return async function removePersonalMedia(options: RemovePersonalMediaOptions) {
        if (!options?.mediaType || options.mediaId === undefined) {
            throw new ZaloApiError("Missing mediaType or mediaId");
        }

        const params = {
            media_type: options.mediaType,
            media_id: options.mediaId,
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
