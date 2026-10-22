import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetCloudViewerKeyResponse = {
    viewer_key: string;
    enk: string;
};

export const getCloudViewerKeyFactory = apiFactory<GetCloudViewerKeyResponse>()((_api, _ctx, utils) => {
    const serviceURL = utils.makeURL("https://wpa.chat.zalo.me/api/getCloudViewerKey");

    /**
     * Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho hệ thống ZCloud / MyCloud (command 12741)
     *
     * @throws {ZaloApiError}
     */
    return async function getCloudViewerKey() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        const res = await utils.resolve(response);
        if (typeof res === "string") {
            try {
                return JSON.parse(res) as GetCloudViewerKeyResponse;
            } catch {
                throw new ZaloApiError("Failed to parse CloudViewerKey response");
            }
        }
        return res;
    };
});
