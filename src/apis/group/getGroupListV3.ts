import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import type { GroupInfo } from "../../models/index.js";
import { apiFactory } from "../../utils.js";

export type GetGroupListV3Options = {
    /**
     * Số trang cần lấy (mặc định: `1`).
     */
    page?: number;
    /**
     * Số lượng nhóm mỗi trang (mặc định: `100`).
     */
    count?: number;
};

export type GetGroupListV3Response = {
    groups: GroupInfo[];
    hasMore?: number | boolean;
    total?: number;
    suggestGroup?: unknown;
    [key: string]: unknown;
};

export const getGroupListV3Factory = apiFactory<GetGroupListV3Response>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getlg/v3`);

    /**
     * Lấy danh sách nhóm theo trang kèm thông tin thành viên đại diện (`currentMems`) và gợi ý nhóm (`suggestGroup`) qua `/api/group/getlg/v3` (command 11161)
     *
     * @param pageOrOptions Số trang (mặc định: `1`) hoặc cấu hình `GetGroupListV3Options`
     * @throws {ZaloApiError}
     */
    return async function getGroupListV3(pageOrOptions: number | GetGroupListV3Options = 1) {
        const options: GetGroupListV3Options =
            typeof pageOrOptions === "number" ? { page: pageOrOptions } : pageOrOptions || {};

        const params = {
            page: options.page ?? 1,
            count: options.count ?? 100,
            avatar_size: 120,
            member_avatar_size: 120,
            imei: ctx.imei,
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
