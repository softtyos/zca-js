import { ZaloApiError } from "../Errors/ZaloApiError.js";
import { apiFactory } from "../utils.js";

export type GetNoisedIdsParams = {
    fids?: Array<string | number>;
    gids?: Array<string | number>;
};

export type GetNoisedIdsResponse = {
    fids: string[];
    gids: string[];
};

const ZWID_ZNOISE_URL = "https://zwid.api.zalo.me/api/znoise";

function toNumericIds(ids: Array<string | number>): number[] {
    return ids.map((id) => Number.parseInt(String(id), 10));
}

function normalizeNoised(list: unknown, expected: number, stripGroupPrefix: boolean): string[] {
    const out: string[] = [];
    const arr = Array.isArray(list) ? list : [];
    for (let i = 0; i < expected; i++) {
        let v = arr[i] == null ? "" : String(arr[i]);
        if (stripGroupPrefix && v.startsWith("g")) v = v.slice(1);
        out.push(v === "0" ? "" : v);
    }
    return out;
}

export const getNoisedIdsFactory = apiFactory<GetNoisedIdsResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/znoise`);

    /**
     * Chuyển đổi danh sách UID cá nhân (`fids`) và GID nhóm (`gids`) dạng số thuần (từ SQLite ZDB4.0 mobile)
     * sang định dạng Noised ID 19 chữ số dùng trên Zalo Web/PC (`getNoisedUids`, command `12390`).
     * Tự động fallback sang `https://zwid.api.zalo.me/api/znoise` nếu profile domain trả về lỗi.
     *
     * @param params Danh sách `fids` và `gids`
     * @throws {ZaloApiError}
     */
    return async function getNoisedIds({ fids = [], gids = [] }: GetNoisedIdsParams): Promise<GetNoisedIdsResponse> {
        const payload = {
            fids: toNumericIds(fids),
            gids: toNumericIds(gids),
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(payload));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        try {
            const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
                method: "GET",
            });
            const data = await utils.resolve(response);
            const raw = (data ?? {}) as { fids?: unknown; gids?: unknown };
            return {
                fids: normalizeNoised(raw.fids, fids.length, false),
                gids: normalizeNoised(raw.gids, gids.length, true),
            };
        } catch (primaryErr) {
            try {
                const body = new URLSearchParams({ params: encryptedParams }).toString();
                const fallbackUrl = utils.makeURL(ZWID_ZNOISE_URL);
                const response = await utils.request(fallbackUrl, {
                    method: "POST",
                    body,
                });
                const data = await utils.resolve(response);
                const raw = (data ?? {}) as { fids?: unknown; gids?: unknown };
                return {
                    fids: normalizeNoised(raw.fids, fids.length, false),
                    gids: normalizeNoised(raw.gids, gids.length, true),
                };
            } catch {
                throw primaryErr;
            }
        }
    };
});
