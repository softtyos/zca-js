import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import { apiFactory, ZALO_DOMAINS, ZALO_ENDPOINTS } from "../../utils.js";

export type DownloadTransferSyncOptions =
    | string
    | {
          key: string;
          exp: number | string;
          sig: string;
      };

export const downloadTransferSyncFactory = apiFactory<Buffer>()((api, ctx, utils) => {
    /**
     * Tải khối dữ liệu snapshot đồng bộ tin nhắn từ máy chủ transfersync.zaloapp.com
     *
     * @param options URL đầy đủ hoặc object chứa { key, exp, sig }
     * @throws {ZaloApiError}
     */
    return async function downloadTransferSync(options: DownloadTransferSyncOptions): Promise<Buffer> {
        let downloadUrl = "";
        if (typeof options === "string") {
            let parsedUrl: URL;
            try {
                parsedUrl = new URL(options);
            } catch {
                throw new ZaloApiError("Invalid downloadTransferSync URL");
            }
            if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
                throw new ZaloApiError(`Unsupported protocol in downloadTransferSync URL: ${parsedUrl.protocol}`);
            }
            if (parsedUrl.hostname === "169.254.169.254" || parsedUrl.hostname === "metadata.google.internal") {
                throw new ZaloApiError("Blocked internal metadata hostname in downloadTransferSync URL");
            }
            downloadUrl = options;
        } else {
            if (!options.key || !options.exp || !options.sig) {
                throw new ZaloApiError("Missing key, exp or sig in options");
            }
            const qs = new URLSearchParams({
                key: String(options.key),
                exp: String(options.exp),
                sig: String(options.sig),
            });
            downloadUrl = `${ZALO_DOMAINS.TRANSFER_SYNC}${ZALO_ENDPOINTS.TRANSFER_SYNC.DOWNLOAD_V2}?${qs.toString()}`;
        }

        const response = await utils.request(downloadUrl, {
            method: "GET",
        });

        if (!response.ok) {
            throw new ZaloApiError(`Failed to download transfer snapshot: ${response.statusText} (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    };
});
