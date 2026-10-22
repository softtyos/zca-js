import { apiFactory } from "../../utils.js";

export type GetLastReadContactTabResponse = {
    ts: number;
};

export const getLastReadContactTabFactory = apiFactory<GetLastReadContactTabResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.friend[0]}/api/friend/last-read-contact-tab`);

    /**
     * Lấy dấu thời gian lần cuối đọc tab Danh bạ (command 12230)
     *
     * @throws {ZaloApiError}
     */
    return async function getLastReadContactTab() {
        const response = await utils.request(serviceURL, {
            method: "GET",
        });

        return utils.resolve(response);
    };
});
