import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetEnterpriseProfilesResponse = Record<string, unknown>;

export const getEnterpriseProfilesFactory = apiFactory<GetEnterpriseProfilesResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/enterprise/profiles`);

    /**
     * Lấy thông tin hồ sơ doanh nghiệp (Zalo Enterprise) của một hoặc nhiều tài khoản (command 12193)
     *
     * @param uids ID hoặc danh sách ID người dùng
     * @throws {ZaloApiError}
     */
    return async function getEnterpriseProfiles(uids: string | string[]) {
        const params = {
            uids: Array.isArray(uids) ? uids : [uids],
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(serviceURL, {
            method: "POST",
            body: new URLSearchParams({
                params: encryptedParams,
            }),
        });

        return utils.resolve(response);
    };
});
