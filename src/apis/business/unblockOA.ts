import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type UnblockOAResponse = "" | Record<string, unknown>;

export const unblockOAFactory = apiFactory<UnblockOAResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/oa/unblock`);

    /**
     * Bỏ chặn một Zalo Official Account (OA) để tiếp tục nhận tin nhắn / ZNS.
     * Tương ứng với hàm `setBlockOA` (`commandId = 12682`) trên Zalo Desktop.
     *
     * @param oaId UID hoặc OA ID của Official Account cần bỏ chặn
     *
     * @throws {ZaloApiError}
     */
    return async function unblockOA(oaId: string) {
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
