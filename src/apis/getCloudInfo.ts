import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, decryptZCloudAES } from "../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetCloudInfoResponse = Record<string, unknown>;

export const getCloudInfoFactory = apiFactory<GetCloudInfoResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.zcloud?.[0] || "https://zcld.chat.zalo.me";
    const serviceURL = utils.makeURL(`${baseDomain}/zalocloud/cloudinfopcweb/v1/info`);

    /**
     * Lấy thông tin gói thuê bao Zalo Cloud (command 12754)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`.
     * @throws {ZaloApiError}
     */
    return async function getCloudInfo(viewerKeyInfo?: GetCloudViewerKeyResponse) {
        const keyInfo = viewerKeyInfo ?? (await api.getCloudViewerKey());
        if (!keyInfo?.viewer_key || !keyInfo?.enk) {
            throw new ZaloApiError("Invalid CloudViewerKey");
        }

        const response = await utils.request(serviceURL, {
            method: "GET",
            headers: {
                "cloud-viewer-key": keyInfo.viewer_key,
            },
        });

        const json = (await response.json()) as { error_code: number; error_message: string; data?: string };
        if (json.error_code !== 0 && json.error_code !== -904) {
            throw new ZaloApiError(json.error_message || "getCloudInfo failed", json.error_code);
        }
        if (!json.data) {
            return {};
        }

        const decrypted = decryptZCloudAES(json.data, keyInfo.enk);
        return JSON.parse(decrypted) as GetCloudInfoResponse;
    };
});
