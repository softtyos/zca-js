import { apiFactory } from "../../utils.js";

export type UploadBackupChunkResponse = Record<string, unknown>;

export const uploadBackupChunkFactory = apiFactory<UploadBackupChunkResponse>()((api, _ctx, utils) => {
    const baseDomain = api.zpwServiceMap.backuppcmobile?.[0] || "https://bkpc2mb.zaloapp.com";
    const serviceURL = utils.makeURL(`${baseDomain}/api/backuppc2mb/upload`);

    /**
     * Tải lên gói dữ liệu phân mảnh (chunk) sao lưu tin nhắn từ máy tính sang điện thoại (command 13538)
     *
     * @param formData Dữ liệu `FormData` hoặc `BodyInit` chứa phân mảnh sao lưu
     * @throws {ZaloApiError}
     */
    return async function uploadBackupChunk(formData: BodyInit | Buffer | Uint8Array) {
        const response = await utils.request(serviceURL, {
            method: "POST",
            body: formData,
        });

        return utils.resolve(response);
    };
});
