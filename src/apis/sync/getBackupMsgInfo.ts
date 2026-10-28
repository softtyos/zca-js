import { apiFactory } from "../../utils.js";

export type GetBackupMsgInfoResponse = Record<string, unknown>;

export const getBackupMsgInfoFactory = apiFactory<GetBackupMsgInfoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/get_backupmsginfo`);

    /**
     * Lấy thông tin bản sao lưu tin nhắn hiện có trên máy chủ (command 12096)
     *
     * @param nretry Số lần thử lại (mặc định `0`)
     * @throws {ZaloApiError}
     */
    return async function getBackupMsgInfo(nretry: number = 0) {
        const response = await utils.request(serviceURL, {
            method: "GET",
            headers: {
                nretry: String(nretry),
            },
        });

        return utils.resolve(response);
    };
});
