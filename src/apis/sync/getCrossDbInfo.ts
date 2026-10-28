import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type GetCrossDbInfoOptions = {
    syncSession?: string;
    pcName?: string;
    nretry?: number;
};

export type GetCrossDbInfoResponse = Record<string, unknown>;

export const getCrossDbInfoFactory = apiFactory<GetCrossDbInfoResponse>()((api, _ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/get_crossdb`);

    /**
     * Lấy thông tin cơ sở dữ liệu chéo (Cross-DB) phục vụ đồng bộ dữ liệu sang máy tính (command 12412)
     *
     * @param options Thông tin `syncSession` và `pcName`
     * @throws {ZaloApiError}
     */
    return async function getCrossDbInfo(options: GetCrossDbInfoOptions = {}) {
        const params = {
            pc_name: options.pcName ?? "Web",
            sync_session: options.syncSession ?? "",
        };

        const encryptedParams = utils.encodeAES(JSON.stringify(params));
        if (!encryptedParams) throw new ZaloApiError("Failed to encrypt params");

        const response = await utils.request(
            utils.makeURL(serviceURL, {
                params: encryptedParams,
            }),
            {
                method: "GET",
                headers: {
                    nretry: String(options.nretry ?? 0),
                },
            },
        );

        return utils.resolve(response);
    };
});
