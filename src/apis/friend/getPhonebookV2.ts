import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetPhonebookV2Response = {
    phonebook: Record<string, string>;
    version?: number;
    [key: string]: unknown;
};

export const getPhonebookV2Factory = apiFactory<GetPhonebookV2Response>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/phonebook/v2`);

    /**
     * Lấy danh bạ bạn bè đồng bộ từ số điện thoại chuẩn V2 (command 12428)
     *
     * @param phonebookVersion Phiên bản danh bạ (mặc định: 0 để lấy toàn bộ)
     * @throws {ZaloApiError}
     */
    return async function getPhonebookV2(phonebookVersion: number = 0) {
        const encryptedParams = utils.encodeAES(JSON.stringify({ phonebook_version: phonebookVersion }));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
