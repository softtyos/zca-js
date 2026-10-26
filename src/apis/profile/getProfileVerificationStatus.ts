import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetProfileVerificationStatusResponse = {
    status: number;
    [key: string]: unknown;
};

export const getProfileVerificationStatusFactory = apiFactory<GetProfileVerificationStatusResponse>()((
    api,
    ctx,
    utils,
) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/profile/verification/status`);

    /**
     * Kiểm tra trạng thái xác thực định danh (eKYC) của tài khoản Zalo (command 12150)
     *
     * @throws {ZaloApiError}
     */
    return async function getProfileVerificationStatus() {
        const encryptedParams = utils.encodeAES(JSON.stringify({ imei: ctx.imei }));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(serviceURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
