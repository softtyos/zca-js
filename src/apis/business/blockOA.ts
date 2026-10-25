import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type BlockOAResponse = "" | Record<string, unknown>;

export const blockOAFactory = apiFactory<BlockOAResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/block`);

    /**
     * Chặn nhận tin nhắn / thông báo từ một Zalo Official Account (OA).
     * Tương ứng với hàm `setBlockOA` (`commandId = 12681`) trên Zalo Desktop.
     *
     * @param oaId UID hoặc OA ID của Official Account cần chặn
     *
     * @throws {ZaloApiError}
     */
    return async function blockOA(oaId: string) {
        const params = {
            oaid: String(oaId),
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
