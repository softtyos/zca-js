import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RemoveFriendRecommendationResponse = Record<string, unknown>;

export const removeFriendRecommendationFactory = apiFactory<RemoveFriendRecommendationResponse>()((
    api,
    _ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/recommends/remove`);

    /**
     * Xóa một gợi ý kết bạn khỏi danh sách đề xuất (command 11432)
     *
     * @param uid ID người dùng cần ẩn khỏi gợi ý
     * @param src Nguồn gợi ý (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function removeFriendRecommendation(uid: string, src: number = 0) {
        const params = {
            uid,
            src,
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
