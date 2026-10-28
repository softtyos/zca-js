import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type RenewMessageLinkOptions = {
    toId: string;
    msgType: number;
    msgInfo: Record<string, unknown>;
    clientId?: string | number;
    isGroup?: boolean;
};

export type RenewMessageLinkResponse = Record<string, unknown>;

export const renewMessageLinkFactory = apiFactory<RenewMessageLinkResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/renewlink`);

    /**
     * Gia hạn đường dẫn tải tệp đính kèm / đa phương tiện đã hết hạn trong tin nhắn (command 12094)
     *
     * @param options Thông tin tin nhắn và đường dẫn cần gia hạn
     * @throws {ZaloApiError}
     */
    return async function renewMessageLink(options: RenewMessageLinkOptions) {
        const params = {
            toId: options.toId.replace(/^g/, ""),
            msgType: options.msgType,
            msgInfo: JSON.stringify(options.msgInfo),
            clientId: options.clientId ?? Date.now(),
            imei: ctx.imei,
            isGroup: options.isGroup ? 1 : 0,
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
