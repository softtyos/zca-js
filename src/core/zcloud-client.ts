import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { decryptZCloudAES, encryptZCloudAES } from "../crypto/index.js";
import type { FactoryUtils } from "../utils.js";
import type { API } from "../apis.js";
import type { GetCloudViewerKeyResponse } from "../apis/zcloud/getCloudViewerKey.js";
import type { GetFamilyViewerKeyResponse } from "../apis/zcloud/getFamilyViewerKey.js";

export type ZCloudRequestOptions = {
    url: string;
    method?: "GET" | "POST";
    body?: URLSearchParams | string;
    paramsPayload?: Record<string, unknown>;
    viewerKeyInfo?: GetCloudViewerKeyResponse;
    allowEmptyDataOn904?: boolean;
};

/**
 * Thực thi request tới hệ sinh thái ZCloud (`zcld.chat.zalo.me`) kèm cơ chế:
 * 1. Tự động lấy `viewer_key` & `enk` từ bộ nhớ đệm (`ctx.zcloudViewerKeyCache`) nếu người dùng không truyền.
 * 2. Tự động thử lại (Auto-Retry 1 lần với `forceRefresh = true`) nếu khóa `viewer_key` trong cache bị máy chủ từ chối do hết hạn sớm.
 * 3. Tự động giải mã payload AES-256-CBC (Random 16-byte IV - module `98yS`).
 */
export async function requestZCloudDecrypted<T>(
    api: API,
    utils: Pick<FactoryUtils<T>, "makeURL" | "request">,
    options: ZCloudRequestOptions,
): Promise<T> {
    const executeOnce = async (keyInfo: GetCloudViewerKeyResponse) => {
        if (!keyInfo?.viewer_key || !keyInfo?.enk) {
            throw new ZaloApiError("Invalid CloudViewerKey");
        }
        const isPost = (options.method ?? "GET") === "POST";
        const encryptedPayload = options.paramsPayload
            ? encryptZCloudAES(JSON.stringify(options.paramsPayload), keyInfo.enk)
            : undefined;
        const targetUrl =
            encryptedPayload && !isPost
                ? utils.makeURL(options.url, {
                      params: encryptedPayload,
                  })
                : options.url;
        const resolvedBody =
            options.body ??
            (encryptedPayload && isPost ? new URLSearchParams({ params: encryptedPayload }) : undefined);

        const response = await utils.request(targetUrl, {
            method: options.method ?? "GET",
            headers: {
                "cloud-viewer-key": keyInfo.viewer_key,
            },
            ...(resolvedBody ? { body: resolvedBody } : {}),
        });
        const json = (await response.json()) as { error_code: number; error_message: string; data?: string };
        return { json, keyInfo };
    };

    const initialKey = options.viewerKeyInfo ?? (await api.getCloudViewerKey(false));
    let { json, keyInfo } = await executeOnce(initialKey);

    if (!options.viewerKeyInfo && json.error_code !== 0 && json.error_code !== -904) {
        const refreshedKey = await api.getCloudViewerKey(true);
        ({ json, keyInfo } = await executeOnce(refreshedKey));
    }

    if (json.error_code !== 0 && json.error_code !== -904) {
        throw new ZaloApiError(json.error_message || "ZCloud request failed", json.error_code);
    }

    if (!json.data) {
        if (options.allowEmptyDataOn904) {
            return {} as T;
        }
        throw new ZaloApiError("Empty ZCloud response data", json.error_code);
    }

    const decrypted = decryptZCloudAES(json.data, keyInfo.enk);
    return JSON.parse(decrypted) as T;
}

export type ZFamilyRequestOptions = {
    url: string;
    method?: "GET" | "POST";
    body?: URLSearchParams | string;
    viewerKeyInfo?: GetFamilyViewerKeyResponse;
    allowEmptyDataOn904?: boolean;
};

/**
 * Thực thi request tới hệ sinh thái ZFamily (`zfml.chat.zalo.me`) kèm cơ chế tự động quản lý khóa,
 * tự động làm mới khi khóa hết hạn và giải mã AES-256-CBC (Random 16-byte IV - module `98yS`).
 */
export async function requestZFamilyDecrypted<T>(
    api: API,
    utils: Pick<FactoryUtils<T>, "makeURL" | "request">,
    options: ZFamilyRequestOptions,
): Promise<T> {
    const executeOnce = async (keyInfo: GetFamilyViewerKeyResponse) => {
        if (!keyInfo?.viewer_key || !keyInfo?.enk) {
            throw new ZaloApiError("Invalid FamilyViewerKey");
        }
        const response = await utils.request(options.url, {
            method: options.method ?? "GET",
            headers: {
                "zfamily-viewer-key": keyInfo.viewer_key,
            },
            ...(options.body ? { body: options.body } : {}),
        });
        const json = (await response.json()) as { error_code: number; error_message: string; data?: string };
        return { json, keyInfo };
    };

    const initialKey = options.viewerKeyInfo ?? (await api.getFamilyViewerKey(false));
    let { json, keyInfo } = await executeOnce(initialKey);

    if (!options.viewerKeyInfo && json.error_code !== 0 && json.error_code !== -904) {
        const refreshedKey = await api.getFamilyViewerKey(true);
        ({ json, keyInfo } = await executeOnce(refreshedKey));
    }

    if (json.error_code !== 0 && json.error_code !== -904) {
        throw new ZaloApiError(json.error_message || "ZFamily request failed", json.error_code);
    }

    if (!json.data) {
        if (options.allowEmptyDataOn904) {
            return {} as T;
        }
        throw new ZaloApiError("Empty ZFamily response data", json.error_code);
    }

    const decrypted = decryptZCloudAES(json.data, keyInfo.enk);
    return JSON.parse(decrypted) as T;
}
