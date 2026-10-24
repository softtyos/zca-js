import { apiFactory } from "../../utils.js";

export type GetE2eeGroupListResponse = {
    version?: number;
    gridVerMap?: Record<string, string>;
    e2eeGroups?: string[];
    [key: string]: unknown;
};

export const getE2eeGroupListFactory = apiFactory<GetE2eeGroupListResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group[0]}/api/group/getlg/e2ee`);

    /**
     * Lấy danh sách các nhóm đang bật mã hóa đầu cuối E2EE (command 12146)
     *
     * @throws {ZaloApiError}
     */
    return async function getE2eeGroupList() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
