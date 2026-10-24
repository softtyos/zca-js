import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdatePinConversationsOptions = {
    /**
     * Danh sách ID hội thoại cần ghim / bỏ ghim (prefix `g` cho nhóm hoặc UID cho cá nhân).
     */
    conversations: string[];
    /**
     * Loại thao tác khi dùng V2 (`1`: ghim, `2`: bỏ ghim). Nếu truyền `actionType`, API sẽ gọi `/api/pinconvers/updatev2` (cmd 12122).
     */
    actionType?: number;
    /**
     * Tab hội thoại khi dùng V2 (tùy chọn).
     */
    tab?: number;
    /**
     * Phiên bản danh sách ghim khi dùng V1 (`/api/pinconvers/update`, cmd 12121, mặc định: `0`).
     */
    version?: number;
};

export type UpdatePinConversationsResponse = {
    version?: number;
    conversations?: string[];
    [key: string]: unknown;
};

export const updatePinConversationsFactory = apiFactory<UpdatePinConversationsResponse>()((api, _ctx, utils) => {
    const v1ServiceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/pinconvers/update`);
    const v2ServiceURL = utils.makeURL(`${api.zpwServiceMap.conversation[0]}/api/pinconvers/updatev2`);

    /**
     * Cập nhật danh sách hội thoại ghim qua `/api/pinconvers/update` (command 12121) hoặc `/api/pinconvers/updatev2` (command 12122)
     *
     * @param options Cấu hình danh sách hội thoại ghim
     * @throws {ZaloApiError}
     */
    return async function updatePinConversations(options: UpdatePinConversationsOptions) {
        if (!options || !Array.isArray(options.conversations)) {
            throw new ZaloApiError("Missing conversations");
        }

        const useV2 = options.actionType !== undefined;
        const targetURL = useV2 ? v2ServiceURL : v1ServiceURL;
        const params: Record<string, unknown> = useV2
            ? {
                  actionType: options.actionType,
                  conversations: options.conversations,
                  tab: options.tab,
              }
            : {
                  version: options.version ?? 0,
                  conversations: options.conversations,
              };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(targetURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
