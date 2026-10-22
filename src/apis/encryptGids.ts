import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type EncryptGidsResponse = {
    data: Record<string, string>;
};

export const encryptGidsFactory = apiFactory<EncryptGidsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/gid/encrypt`);

    /**
     * Mã hóa danh sách UID thật sang định danh ẩn danh Global Noise ID (`OTDAKO...`) (command 12053)
     *
     * @param uids Mảng chuỗi các UID cần mã hóa
     * @throws {ZaloApiError}
     */
    return async function encryptGids(uids: string[]) {
        if (!Array.isArray(uids) || uids.length === 0) {
            return { data: {} };
        }

        const encryptedParams = utils.encodeAES(JSON.stringify({ noiseUids: uids }));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
