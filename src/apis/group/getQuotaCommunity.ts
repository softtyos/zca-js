import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetQuotaCommunityResponse = {
    canUpgr: boolean;
    curComm: number;
    quotaComm: number;
    error_message_localize?: string;
    [key: string]: unknown;
};

export const getQuotaCommunityFactory = apiFactory<GetQuotaCommunityResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/quota/community`);

    /**
     * Kiểm tra hạn mức nâng cấp nhóm lên Cộng đồng của tài khoản (command 12181)
     *
     * @param groupId (Tùy chọn) ID của nhóm cần kiểm tra
     * @param language Ngôn ngữ thông báo (mặc định: `"vi"`)
     * @throws {ZaloApiError}
     */
    return async function getQuotaCommunity(groupId: string | null = null, language: string = "vi") {
        const cleanGroupId = groupId && groupId.startsWith("g") ? groupId.slice(1) : groupId;
        const params = {
            language,
            grId: cleanGroupId,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
