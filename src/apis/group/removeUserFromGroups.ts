import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RemoveUserFromGroupsResponse = Record<string, unknown>;

export const removeUserFromGroupsFactory = apiFactory<RemoveUserFromGroupsResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/kickout/multi`);

    /**
     * Xóa một thành viên khỏi nhiều nhóm cùng lúc (command 12606)
     *
     * @param groupIds Danh sách ID nhóm
     * @param memberId ID thành viên cần xóa khỏi các nhóm
     * @param srcInteraction Nguồn tương tác (mặc định `2`)
     * @throws {ZaloApiError}
     */
    return async function removeUserFromGroups(
        groupIds: string | string[],
        memberId: string,
        srcInteraction: number = 2,
    ) {
        const grids = (Array.isArray(groupIds) ? groupIds : [groupIds]).map((id) => id.replace(/^g/, ""));
        const params = {
            grids,
            member: memberId,
            srcInteraction,
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
            },
        );

        return utils.resolve(response);
    };
});
