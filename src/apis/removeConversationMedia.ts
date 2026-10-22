import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";
import type { MediaStoreType } from "./getConversationMedia.js";

export type RemoveConversationMediaOptions = {
    groupId: string;
    mediaType: MediaStoreType;
    mediaId: string | number | (string | number)[];
};

export type RemoveConversationMediaResponse = unknown;

export const removeConversationMediaFactory = apiFactory<RemoveConversationMediaResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.media_store[0]}/api/mediastore/remove`);

    /**
     * Xóa mục Ảnh/Video, File hoặc Link khỏi Kho Lưu Trữ của nhóm (command 11842)
     *
     * @param options Thông tin mục cần xóa (`groupId`, `mediaType`, `mediaId`)
     * @throws {ZaloApiError}
     */
    return async function removeConversationMedia(options: RemoveConversationMediaOptions) {
        if (!options.groupId) {
            throw new ZaloApiError("Missing groupId");
        }

        const cleanGroupId = options.groupId.startsWith("g") ? options.groupId.slice(1) : options.groupId;
        const params = {
            media_type: options.mediaType,
            media_id: options.mediaId,
            group_id: cleanGroupId,
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
