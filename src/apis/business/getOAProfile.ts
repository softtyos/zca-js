import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { normalizeOAProfile, type OAProfileInfo } from "../../models/OAMessage.js";
import { apiFactory } from "../../utils.js";

export type GetOAProfileOptions = {
    /**
     * Kích thước ảnh đại diện (mặc định: `240`).
     */
    avatarSize?: number;
    /**
     * Có lấy kèm thông tin tài khoản Business (`/api/social/friend/get-bizacc`) hay không (mặc định: `true`).
     */
    includeBizAccount?: boolean;
};

export type GetOAProfileResponse = OAProfileInfo;

export const getOAProfileFactory = apiFactory<GetOAProfileResponse>()((api, ctx, utils) => {
    const profileServiceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/getprofiles/v2`);
    const bizServiceURL = utils.makeURL(`${api.zpwServiceMap.profile[0]}/api/social/friend/get-bizacc`);

    /**
     * Lấy hồ sơ đầy đủ của một Zalo Official Account (OA) theo `oaId`
     * (bao gồm `oaInfo`, trạng thái tích vàng `isVerified`, `isZaloBot`, `isGroupedMsg`, trạng thái chặn/DNR `dnrStatus`, hotline, website, giờ mở cửa, địa chỉ, danh mục...).
     *
     * @param oaId UID của Zalo Official Account
     * @param options Tùy chọn truy vấn
     * @throws {ZaloApiError}
     */
    return async function getOAProfile(oaId: string, options: GetOAProfileOptions = {}): Promise<GetOAProfileResponse> {
        const cleanId = String(oaId ?? "")
            .trim()
            .split("_")[0];
        if (!cleanId) {
            throw new ZaloApiError("Missing oaId");
        }

        const profileParams = {
            phonebook_version: 0,
            friend_pversion_map: [`${cleanId}_0`],
            avatar_size: options.avatarSize ?? 240,
            language: ctx.language ?? "vi",
            show_online_status: 1,
            isReqOAInfo: 1,
            imei: ctx.imei,
        };

        const encryptedProfileParams = utils.encodeAES(JSON.stringify(profileParams));
        if (!encryptedProfileParams) {
            throw new ZaloApiError("Failed to encrypt OA profile params");
        }

        const fetchProfilePromise = utils
            .request(profileServiceURL, {
                method: "POST",
                body: new URLSearchParams({
                    params: encryptedProfileParams,
                }),
            })
            .then((res) => utils.resolve(res));

        const fetchBizPromise =
            options.includeBizAccount !== false
                ? (async () => {
                      const encryptedBizParams = utils.encodeAES(JSON.stringify({ fid: cleanId }));
                      if (!encryptedBizParams) return null;
                      const res = await utils.request(bizServiceURL, {
                          method: "POST",
                          body: new URLSearchParams({
                              params: encryptedBizParams,
                          }),
                      });
                      return utils.resolve(res);
                  })().catch(() => null)
                : Promise.resolve(null);

        const [profileRes, bizRes] = await Promise.all([fetchProfilePromise, fetchBizPromise]);
        const profileData = (profileRes ?? {}) as Record<string, unknown>;
        const changedProfiles = (profileData.changed_profiles ?? profileData.profiles ?? {}) as Record<
            string,
            Record<string, unknown>
        >;
        const rawProfile =
            changedProfiles[cleanId] ?? changedProfiles[`${cleanId}_0`] ?? Object.values(changedProfiles)[0] ?? null;

        return normalizeOAProfile(
            cleanId,
            rawProfile,
            bizRes && typeof bizRes === "object" ? (bizRes as Record<string, unknown>) : null,
        );
    };
});
