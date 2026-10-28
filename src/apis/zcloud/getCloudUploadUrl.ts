import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type GetCloudUploadUrlResponse = Record<string, unknown>;

export const getCloudUploadUrlFactory = apiFactory<GetCloudUploadUrlResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.GET_UPLOAD_URL}`);

    /**
     * Lấy đường dẫn tải lên tệp di trú lên ZCloud (command 12752)
     *
     * @param numberOfFiles Số lượng tệp cần tải lên (mặc định `1`)
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function getCloudUploadUrl(numberOfFiles: number = 1, viewerKeyInfo?: GetCloudViewerKeyResponse) {
        return requestZCloudDecrypted<GetCloudUploadUrlResponse>(api, utils, {
            url: serviceURL,
            paramsPayload: { number_of_files: numberOfFiles },
            viewerKeyInfo,
        });
    };
});
