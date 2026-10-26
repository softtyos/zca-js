import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
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
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.VERIFY_QUEUE}`);

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
        const payload = {
            lastNoiseId: options.lastNoiseId ?? "",
            loadType: options.loadType ?? 0,
            listNoiseIds: options.listNoiseIds ?? [],
            tracking_source: options.trackingSource ?? 0,
        };

        return requestZCloudDecrypted<VerifyCloudMediaResponse>(api, utils, {
            url: serviceURL,
            paramsPayload: payload,
            viewerKeyInfo,
        });
    };
});
