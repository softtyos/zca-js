import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UpdateOneOneBoardTopicOptions = {
    toUid: string;
    reminderId: string;
    title?: string;
    emoji?: string;
    startTime?: number;
    repeat?: number;
    color?: number;
    [key: string]: unknown;
};

export type UpdateOneOneBoardTopicResponse = Record<string, unknown>;

export const updateOneOneBoardTopicFactory = apiFactory<UpdateOneOneBoardTopicResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/update`);

    /**
     * Cập nhật nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12430)
     *
     * @param objectData Dữ liệu chủ đề / nhắc hẹn 1-1 cần cập nhật
     * @throws {ZaloApiError}
     */
    return async function updateOneOneBoardTopic(objectData: UpdateOneOneBoardTopicOptions) {
        const params = {
            objectData: JSON.stringify(objectData),
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
