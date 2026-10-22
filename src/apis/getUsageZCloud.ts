import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, decryptZCloudAES } from "../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetUsageZCloudResponse = {
    service_usage: {
        my_cloud: number;
        message_backup: number;
    };
    usage: number;
    quota: number;
    plan: number;
};

export const getUsageZCloudFactory = apiFactory<GetUsageZCloudResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.zcloud?.[0] || "https://zcld.chat.zalo.me";
    const serviceURL = utils.makeURL(`${baseDomain}/cloudmedia/info/pc/v2/usage`);

    /**
     * Kiểm tra dung lượng sử dụng ZCloud V2 (bao gồm MyCloud và Sao lưu tin nhắn - command 12749)
     *
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy mới.
     * @throws {ZaloApiError}
     */
    return async function getUsageZCloud(viewerKeyInfo?: GetCloudViewerKeyResponse) {
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
            throw new ZaloApiError(json.error_message || "getUsageZCloud failed", json.error_code);
        }
        if (!json.data) {
            throw new ZaloApiError("Empty ZCloud usage data", json.error_code);
        }

        const decrypted = decryptZCloudAES(json.data, keyInfo.enk);
        return JSON.parse(decrypted) as GetUsageZCloudResponse;
    };
});
