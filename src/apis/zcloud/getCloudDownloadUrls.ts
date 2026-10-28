import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetCloudDownloadUrlsResponse = Record<string, unknown>;

export const getCloudDownloadUrlsFactory = apiFactory<GetCloudDownloadUrlsResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.DOWNLOAD_URLS}`);

    /**
     * Lấy danh sách đường dẫn tải xuống các tệp Media lưu trữ trên ZCloud theo `noiseIds` (command 12743)
     *
     * @param listNoiseIds Danh sách `noiseId` của các tệp trên ZCloud
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function getCloudDownloadUrls(
        listNoiseIds: string | string[],
        viewerKeyInfo?: GetCloudViewerKeyResponse,
    ) {
        const payload = {
            list_noise_ids: Array.isArray(listNoiseIds) ? listNoiseIds : [listNoiseIds],
        };

        return requestZCloudDecrypted<GetCloudDownloadUrlsResponse>(api, utils, {
            url: serviceURL,
            paramsPayload: payload,
            viewerKeyInfo,
        });
    };
});
