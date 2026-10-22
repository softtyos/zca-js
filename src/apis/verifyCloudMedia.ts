import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory, decryptZCloudAES, encryptZCloudAES } from "../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type VerifyCloudMediaOptions = {
    lastNoiseId?: string;
    loadType?: number;
    listNoiseIds?: string[];
    trackingSource?: number;
};

export type VerifyCloudMediaResponse = {
    lastNoiseId: string;
    hasMore: number;
    mediaItems: Record<string, unknown>[];
    listVerifyNoiseIds: string[];
};

export const verifyCloudMediaFactory = apiFactory<VerifyCloudMediaResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.zcloud?.[0] || "https://zcld.chat.zalo.me";
    const serviceURL = utils.makeURL(`${baseDomain}/cloudmedia/queue/pc/verify`);

    /**
     * Kiểm tra và lấy danh sách mục Media lưu trữ trên ZCloud (command 12740 / 12761)
     *
     * @param options Tùy chọn truy vấn (`lastNoiseId`, `loadType`, `listNoiseIds`, `trackingSource`)
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`.
     * @throws {ZaloApiError}
     */
    return async function verifyCloudMedia(
        options: VerifyCloudMediaOptions = {},
        viewerKeyInfo?: GetCloudViewerKeyResponse,
    ) {
        const keyInfo = viewerKeyInfo ?? (await api.getCloudViewerKey());
        if (!keyInfo?.viewer_key || !keyInfo?.enk) {
            throw new ZaloApiError("Invalid CloudViewerKey");
        }

        const payload = {
            lastNoiseId: options.lastNoiseId ?? "",
            loadType: options.loadType ?? 0,
            listNoiseIds: options.listNoiseIds ?? [],
            tracking_source: options.trackingSource ?? 0,
        };

        const encryptedParams = encryptZCloudAES(JSON.stringify(payload), keyInfo.enk);
        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
            headers: {
                "cloud-viewer-key": keyInfo.viewer_key,
            },
        });

        const json = (await response.json()) as { error_code: number; error_message: string; data?: string };
        if (json.error_code !== 0 && json.error_code !== -904) {
            throw new ZaloApiError(json.error_message || "verifyCloudMedia failed", json.error_code);
        }
        if (!json.data) {
            throw new ZaloApiError("Empty verifyCloudMedia response", json.error_code);
        }

        const decrypted = decryptZCloudAES(json.data, keyInfo.enk);
        return JSON.parse(decrypted) as VerifyCloudMediaResponse;
    };
});
