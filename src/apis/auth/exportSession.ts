import type toughCookie from "tough-cookie";
import { apiFactory } from "../../utils.js";
import type { Credentials } from "../../zalo.js";

export type ExportedSession = Credentials & {
    uid: string;
    cookie: toughCookie.SerializedCookie[];
};

export const exportSessionFactory = apiFactory<ExportedSession>()((_api, ctx) => {
    /**
     * Xuất toàn bộ thông tin phiên đăng nhập hiện tại (`uid`, `imei`, `userAgent`, `language`, `cookie`)
     * dưới định dạng chuẩn `Credentials` để lưu trữ (JSON/Database) và truyền trực tiếp vào `zalo.login(session)`.
     */
    return function exportSession(): ExportedSession {
        const serializedJar = ctx.cookie?.toJSON();
        return {
            uid: ctx.uid,
            imei: ctx.imei,
            userAgent: ctx.userAgent,
            language: ctx.language || "vi",
            cookie: serializedJar?.cookies ?? [],
        };
    };
});
