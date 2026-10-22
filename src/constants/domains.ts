/**
 * Danh mục tập trung toàn bộ các Domain gốc & Domain dự phòng (Fallback) của Zalo.
 * Thay vì viết cứng rải rác trong hàng trăm file API, toàn bộ hệ thống tham chiếu từ đây.
 */
export const ZALO_DOMAINS = {
    /** Domain gốc của Zalo Chat Web (dùng cho Cookie, Origin, Referer) */
    CHAT_WEB: "https://chat.zalo.me",
    DEFAULT_COOKIE_DOMAIN: "chat.zalo.me",
    /** Domain xác thực tài khoản và đăng nhập QR */
    AUTH_ID: "https://id.zalo.me",
    ID_ZALO: "https://id.zalo.me",
    /** Domain WPA mặc định (dùng cho login, getServerInfo, getCloudViewerKey, getFamilyViewerKey) */
    WPA_CHAT: "https://wpa.chat.zalo.me",
    /** Domain dự phòng (Fallback) cho dịch vụ ánh xạ ZNoise ID (command 12390) */
    ZWID_API: "https://zwid.api.zalo.me",
    ZNOISE_FALLBACK: "https://zwid.api.zalo.me",
    /** Domain mặc định cho hệ sinh thái ZCloud (nếu zpwServiceMap.zcloud chưa trả về) */
    ZCLOUD_FALLBACK: "https://zcld.chat.zalo.me",
    ZCLOUD_DEFAULT: "https://zcld.chat.zalo.me",
    /** Domain mặc định cho hệ sinh thái ZFamily (nếu zpwServiceMap.zfamily chưa trả về) */
    ZFAMILY_FALLBACK: "https://zfml.chat.zalo.me",
    ZFAMILY_DEFAULT: "https://zfml.chat.zalo.me",
    /** Domain mặc định cho tính năng AI (Voice-to-Text command 13394) */
    AI_FEATURES_FALLBACK: "https://tt-ai-features-wpa.chat.zalo.me",
    AI_FEATURES_DEFAULT: "https://tt-ai-features-wpa.chat.zalo.me",
    /** Domain mặc định cho dịch vụ Emoji Status (command 16300 / 16301) */
    EMOJI_STATUS_FALLBACK: "https://emoji-status.chat.zalo.me",
    EMOJI_STATUS_DEFAULT: "https://emoji-status.chat.zalo.me",
    /** Domain TransferSync tải file sao lưu .db.crypt từ điện thoại */
    TRANSFER_SYNC: "https://transfersync.zaloapp.com",
    /** Domain kiểm tra phiên bản NPM */
    NPM_REGISTRY: "https://registry.npmjs.org/@softtynet/zca-js",
    NPM_REGISTRY_PACKAGE: "https://registry.npmjs.org/@softtynet/zca-js",
} as const;
