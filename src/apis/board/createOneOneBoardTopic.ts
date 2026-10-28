import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type CreateOneOneBoardTopicOptions = {
    toUid: string;
    title: string;
    emoji?: string;
    startTime?: number;
    repeat?: number;
    color?: number;
    [key: string]: unknown;
};

export type CreateOneOneBoardTopicResponse = Record<string, unknown>;

export const createOneOneBoardTopicFactory = apiFactory<CreateOneOneBoardTopicResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/oneone/create`);

    /**
     * Tạo nhắc hẹn / chủ đề trong hội thoại cá nhân 1-1 (command 12429)
     *
     * @param objectData Dữ liệu chủ đề / nhắc hẹn 1-1 cần tạo
     * @throws {ZaloApiError}
     */
    return async function createOneOneBoardTopic(objectData: CreateOneOneBoardTopicOptions) {
        const params = {
            objectData: JSON.stringify(objectData),
            imei: ctx.imei,
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
