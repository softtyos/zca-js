import { apiFactory, generateRSAKeyPair } from "../utils.js";

export type RequestSyncFromPhoneOptions = {
    pcName?: string;
    fromSeqId?: number;
    isRetry?: number;
    minSeqId?: number;
    tempKey?: string;
    publicKeyBase64?: string;
    privateKeyBase64?: string;
    publicKey?: string;
    privateKey?: string;
};

export type RequestSyncFromPhoneResponse = {
    success: boolean;
    pcName: string;
    publicKeyBase64: string;
    privateKeyBase64: string;
    publicKey: string;
    privateKey: string;
};

export const requestSyncFromPhoneFactory = apiFactory<RequestSyncFromPhoneResponse>()((api) => {
    /**
     * Phát tín hiệu yêu cầu đồng bộ tin nhắn từ ứng dụng Zalo trên điện thoại (`pull_mobile_msg`, command `12000`).
     *
     * Tự động sinh cặp khoá RSA 2048-bit (nếu chưa truyền vào) và gọi `api.pullMobile(...)`.
     * Điện thoại của người dùng sẽ hiển thị thông báo yêu cầu xác nhận đồng bộ (hoặc tự động đồng bộ nếu có `tempKey` từ `transfer_after_login`).
     * Lắng nghe sự kiện `api.listener.on("sync_event", ...)` để nhận tiến trình xác nhận (`user_confirm`) và thông tin file sao lưu (`syncmsg_info`).
     *
     * @param options Tuỳ chọn đồng bộ (`pcName`, `tempKey`, hoặc cặp khoá RSA tự quản lý)
     * @throws {ZaloApiError}
     */
    return async function requestSyncFromPhone(
        options: RequestSyncFromPhoneOptions = {},
    ): Promise<RequestSyncFromPhoneResponse> {
        const generated = options.publicKeyBase64 && options.privateKey
            ? {
                  publicKeyBase64: options.publicKeyBase64,
                  privateKeyBase64: options.privateKeyBase64 ?? "",
                  publicKey: options.publicKey ?? options.publicKeyBase64,
                  privateKey: options.privateKey,
              }
            : generateRSAKeyPair();

        const pcName = options.pcName ?? "Web";

        await api.pullMobile({
            pc_name: pcName,
            public_key: generated.publicKeyBase64,
            from_seq_id: options.fromSeqId ?? 0,
            is_retry: options.isRetry ?? 0,
            min_seq_id: options.minSeqId ?? 0,
            temp_key: options.tempKey ?? "",
        });

        return {
            success: true,
            pcName,
            publicKeyBase64: generated.publicKeyBase64,
            privateKeyBase64: generated.privateKeyBase64,
            publicKey: generated.publicKey,
            privateKey: generated.privateKey,
        };
    };
});
