import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RespondReminderResponse = Record<string, unknown>;

export const respondReminderFactory = apiFactory<RespondReminderResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.group_board[0]}/api/board/topic/updateEventResponse`);

    /**
     * Phản hồi tham gia hoặc từ chối lịch nhắc hẹn trong nhóm (command 12087)
     *
     * @param groupId ID nhóm
     * @param eventId ID sự kiện nhắc hẹn
     * @param type Loại phản hồi (`1` = Tham gia, `2` = Từ chối)
     * @throws {ZaloApiError}
     */
    return async function respondReminder(groupId: string, eventId: string, type: number) {
        const params = {
            grid: groupId.replace(/^g/, ""),
            type,
            eventId,
            imei: ctx.imei,
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
