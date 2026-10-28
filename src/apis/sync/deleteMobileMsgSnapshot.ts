import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory } from "../../utils.js";

export type DeleteMobileMsgSnapshotResponse = Record<string, unknown>;

export const deleteMobileMsgSnapshotFactory = apiFactory<DeleteMobileMsgSnapshotResponse>()((api, ctx, utils) => {
    const serviceURL = utils.makeURL(`${api.zpwServiceMap.file[0]}/api/message/delete_snapshot_mobile_msg`);

    /**
     * Xóa bản chụp nhanh (snapshot) dữ liệu đồng bộ tin nhắn từ thiết bị di động sau khi hoàn tất (command 12003)
     *
     * @param publicKey Khóa công khai RSA SPKI DER Base64 của phiên đồng bộ
     * @throws {ZaloApiError}
     */
    return async function deleteMobileMsgSnapshot(publicKey: string) {
        if (!publicKey) throw new ZaloApiError("Missing publicKey");

        const params = {
            public_key: publicKey,
            imei: ctx.imei,
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
