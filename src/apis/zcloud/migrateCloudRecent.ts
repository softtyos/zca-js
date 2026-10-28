import { apiFactory, getServiceEndpoint, requestZCloudDecrypted, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";
import type { GetCloudViewerKeyResponse } from "./getCloudViewerKey.js";

export type MigrateCloudRecentResponse = Record<string, unknown>;

export const migrateCloudRecentFactory = apiFactory<MigrateCloudRecentResponse>()((api, _ctx, utils) => {
    const baseDomain = getServiceEndpoint(api.zpwServiceMap, "zcloud", ZALO_DOMAINS.ZCLOUD_FALLBACK);
    const serviceURL = utils.makeURL(`${baseDomain}${ZALO_ENDPOINTS.ZCLOUD.MIGRATE_RECENT}`);

    /**
     * Thực hiện di trú dữ liệu tệp tin gần đây lên ZCloud (command 12753)
     *
     * @param payload Thông tin tệp cần di trú lên ZCloud
     * @param viewerKeyInfo (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`
     * @throws {ZaloApiError}
     */
    return async function migrateCloudRecent(
        payload: Record<string, unknown>,
        viewerKeyInfo?: GetCloudViewerKeyResponse,
    ) {
        return requestZCloudDecrypted<MigrateCloudRecentResponse>(api, utils, {
            url: serviceURL,
            method: "POST",
            paramsPayload: payload,
            viewerKeyInfo,
        });
    };
});
