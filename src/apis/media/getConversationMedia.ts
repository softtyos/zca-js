import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type MediaStoreType = "media" | "file" | "link";

export type GetConversationMediaOptions = {
    groupId?: string;
    threadId?: string;
    mediaType?: MediaStoreType;
    limit?: number;
    lastId?: number | string;
    lastFetchId?: number;
};

export type MediaStoreItem = {
    id: number | string;
    type: string;
    title?: string;
    src_url?: string;
    thumb_url?: string;
    previewThumb?: string | null;
    created_time?: number;
    [key: string]: unknown;
};

export type GetConversationMediaResponse = {
    items: MediaStoreItem[];
    isLimitPermission: boolean;
    last_id: number | string;
    has_more: number;
};

export const getConversationMediaFactory = apiFactory<GetConversationMediaResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.media_store[0]}/api/mediastore/list`);

    /**
     * Lấy danh sách Kho Lưu Trữ (Ảnh/Video `"media"`, File `"file"`, hoặc Link `"link"`) trong hội thoại nhóm (command 11841)
     *
     * @param options Tùy chọn truy vấn (`groupId`, `mediaType`, `limit`, `lastId`, `lastFetchId`)
     * @throws {ZaloApiError}
     */
    return async function getConversationMedia(options: GetConversationMediaOptions) {
        const rawGroupId = options.groupId || options.threadId;
        if (!rawGroupId) {
            throw new ZaloApiError("Missing groupId");
        }

        const groupId = rawGroupId.startsWith("g") ? rawGroupId.slice(1) : rawGroupId;
        const params: Record<string, unknown> = {
            media_type: options.mediaType ?? "media",
            group_id: groupId,
            limit: options.limit ?? 20,
            imei: ctx.imei,
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
