import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type StickerHelloItem = {
    id: number;
    cateId: number;
    type: number;
    text: string;
    uri: string;
    fkey: number;
    status: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl?: string | null;
    totalFrames: number;
    duration: number;
};

export type GetStickerHelloResponse = Record<string, unknown> | StickerHelloItem[];

export const getStickerHelloFactory = apiFactory<GetStickerHelloResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.sticker[0]}/api/message/sticker/suggestion`);

    /**
     * Lấy danh sách Sticker chào hỏi gợi ý khi bắt đầu trò chuyện mới (command 11751)
     *
     * @throws {ZaloApiError}
     */
    return async function getStickerHello() {
        const params = {
            imei: ctx.imei,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response, (result) => {
            if (typeof result.data === "string") {
                try {
                    return JSON.parse(result.data) as GetStickerHelloResponse;
                } catch {
                    return result.data as unknown as GetStickerHelloResponse;
                }
            }
            return result.data as GetStickerHelloResponse;
        });
    };
});
