import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import type { GroupCurrentMem, GroupInfo } from "../../models/index.js";
import { apiFactory } from "../../utils.js";
import type { GroupInfoPendingApprove } from "./getGroupInfo.js";

export type GetGroupInfoV2Options = {
    /**
     * Trang thành viên cần lấy (mặc định: `1`).
     */
    mpage?: number;
    /**
     * Số lượng thành viên mỗi trang (mặc định: `100`).
     */
    mcount?: number;
    /**
     * Kích thước ảnh đại diện nhóm (mặc định: `120`).
     */
    avatarSize?: number;
    /**
     * Kích thước ảnh đại diện thành viên (mặc định: `120`).
     */
    memberAvatarSize?: number;
    /**
     * Sử dụng endpoint `/api/group/getgi` (bản V1) thay vì `/api/group/getgi/v2` (mặc định: `false`).
     */
    useV1Endpoint?: boolean;
};

export type GetGroupInfoV2Response = GroupInfo & {
    admins?: GroupCurrentMem[];
    pendingApprove?: GroupInfoPendingApprove;
    [key: string]: unknown;
};

export const getGroupInfoV2Factory = apiFactory<GetGroupInfoV2Response>()((api, ctx, utils) => {
    const v2ServiceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getgi/v2`);
    const v1ServiceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getgi`);

    /**
     * Lấy thông tin nhóm và danh sách thành viên theo trang qua `/api/group/getgi/v2` hoặc `/api/group/getgi` (command 11162)
     *
     * @param groupId ID của nhóm
     * @param pageOrOptions Số trang `mpage` (mặc định: `1`) hoặc cấu hình `GetGroupInfoV2Options`
     * @throws {ZaloApiError}
     */
    return async function getGroupInfoV2(
        groupId: string,
        pageOrOptions: number | GetGroupInfoV2Options = 1,
    ) {
        if (!groupId) {
            throw new ZaloApiError("Missing groupId");
        }
        const cleanGroupId = groupId.startsWith("g") ? groupId.slice(1) : groupId;

        const options: GetGroupInfoV2Options =
            typeof pageOrOptions === "number" ? { mpage: pageOrOptions } : pageOrOptions || {};

        const mpage = options.mpage ?? 1;
        const mcount = options.mcount ?? 100;
        const avatarSize = options.avatarSize ?? 120;
        const memberAvatarSize = options.memberAvatarSize ?? 120;
        const useV1 = Boolean(options.useV1Endpoint);
        const targetURL = useV1 ? v1ServiceURL : v2ServiceURL;

        const params: Record<string, unknown> = useV1
            ? {
                  grid: cleanGroupId,
                  avatar_size: avatarSize,
                  member_avatar_size: memberAvatarSize,
              }
            : {
                  grid: cleanGroupId,
                  avatar_size: avatarSize,
                  member_avatar_size: memberAvatarSize,
                  mpage,
                  mcount,
                  imei: ctx.imei,
              };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) {
            throw new ZaloApiError("Failed to encrypt params");
        }

        const response = await utils.request(utils.makeURL(targetURL, { params: encryptedParams }), {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
