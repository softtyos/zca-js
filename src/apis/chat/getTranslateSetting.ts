import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type GetTranslateSettingResponse = {
    info?: unknown[];
    version?: number;
    [key: string]: unknown;
};

export const getTranslateSettingFactory = apiFactory<GetTranslateSettingResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.ai_features?.[0] || ZALO_DOMAINS.AI_FEATURES_FALLBACK;
    const serviceURL = utils.makeURL(`${baseDomain}/api/aifeatures/translate/v1/setting`);

    /**
     * Lấy cấu hình tính năng dịch tin nhắn tự động bằng Zalo AI (command 13395)
     *
     * @throws {ZaloApiError}
     */
    return async function getTranslateSetting() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        try {
            return await utils.resolve(response);
        } catch (err) {
            if (err instanceof ZaloApiError && err.code === 212) {
                return { info: [], version: 0 };
            }
            throw err;
        }
    };
});
