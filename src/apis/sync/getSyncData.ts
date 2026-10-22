import fs from "node:fs";
import path from "node:path";
import toughCookie from "tough-cookie";
import { ZaloApiError } from "../../Errors/ZaloApiError.js";
import type { SyncData, SyncDataResponse, SyncDataStream } from "../../models/index.js";
import { apiFactory, ZALO_DOMAINS } from "../../utils.js";

export type GetSyncDataParams = {
    url: string;
    encrypted_key: string;
    file_name: string;
    file_size: number;
    checksum_code: string;
    from_seq_id: number;
    is_full_transfer: number;
    returnStream?: boolean;
    savePath?: string;
};

export const getSyncDataFactory = apiFactory<SyncDataResponse>()((api, ctx, utils) => {
    async function downloadFileStream(url: string): Promise<Response> {
        if (!ctx.cookie) ctx.cookie = new toughCookie.CookieJar();
        const cookie = ctx.cookie;

        const manualHeaders: Record<string, string> = {
            "Cache-Control": "no-store, must-revalidate",
            Pragma: "no-cache",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US",
            "User-Agent": ctx.userAgent || "",
            cookie: await cookie.getCookieString(`${ZALO_DOMAINS.CHAT_WEB}/`),
            Expires: "0",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "none",
            Connection: "keep-alive",
        };

        const response = await utils.request(
            url,
            {
                method: "GET",
                headers: manualHeaders,
            },
            true,
        );

        if (!response.ok) {
            throw new ZaloApiError(`Failed to download sync file: HTTP ${response.status}`);
        }

        return response;
    }

    async function downloadFile(url: string): Promise<Buffer> {
        const response = await downloadFileStream(url);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Tải xuống file sao lưu tin nhắn từ sự kiện `syncmsg_info` (`.db.crypt`, định dạng `ZDB4.0`)
     * và lưu ra ổ đĩa hoặc trả về `ReadableStream`.
     *
     * @param params Thông tin file sao lưu nhận được từ `SyncEventType.SYNCMSG_INFO`
     * @returns `Promise<SyncDataResponse>`
     */
    return async function getSyncData({
        url,
        encrypted_key,
        file_name,
        file_size,
        checksum_code,
        from_seq_id,
        is_full_transfer,
        returnStream = false,
        savePath = "./",
    }: GetSyncDataParams): Promise<SyncDataResponse> {
        try {
            if (returnStream) {
                const response = await downloadFileStream(url);

                const syncDataStream: SyncDataStream = {
                    stream: response.body,
                    metadata: {
                        file_name,
                        file_size,
                        checksum_code,
                        from_seq_id,
                        is_full_transfer,
                        encrypted_key,
                    },
                    response: {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        contentType: response.headers.get("content-type"),
                        contentLength: response.headers.get("content-length"),
                    },
                };

                return {
                    success: true,
                    stream: syncDataStream,
                };
            }

            const encryptedFileData = await downloadFile(url);

            const fileName = file_name.endsWith(".db.crypt") ? file_name : `${file_name}.db.crypt`;
            const fullPath = path.join(savePath, fileName);

            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(fullPath, encryptedFileData as unknown as Uint8Array);

            const syncData: SyncData = {
                file_path: fullPath,
                encrypted_key,
                metadata: {
                    file_name: fileName,
                    file_size,
                    checksum_code,
                    from_seq_id,
                    is_full_transfer,
                },
            };

            return {
                success: true,
                data: syncData,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    };
});
