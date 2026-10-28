import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RemoveFriendRecommendationV2Response = Record<string, unknown>;

export const removeFriendRecommendationV2Factory = apiFactory<RemoveFriendRecommendationV2Response>()((
    api,
    _ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommendsv2/remove`);

    /**
     * Xóa một gợi ý kết bạn khỏi danh sách đề xuất V2 (command 11438)
     *
     * @param uid ID người dùng cần ẩn khỏi gợi ý
     * @param src Nguồn gợi ý (mặc định `0`)
     * @param type Loại gợi ý (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function removeFriendRecommendationV2(uid: string, src: number = 0, type: number = 0) {
        const params = {
            uid,
            src,
            type,
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
