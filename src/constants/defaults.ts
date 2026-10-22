/**
 * Tập trung toàn bộ các hằng số vận hành, giới hạn phân trang, thời gian chờ (Timeouts)
 * và cấu hình Codec mặc định cho Gọi Thoại / Video.
 */
export const ZALO_DEFAULTS = {
    OPTIONS: {
        SELF_LISTEN: false,
        CHECK_UPDATE: true,
        LOGGING: true,
    },
    BROWSER: {
        DEFAULT_LANGUAGE: "vi",
        DEFAULT_PLATFORM: "Windows",
        DEFAULT_CHROME_VERSION: "133",
        COMPUTER_NAME: "Web",
        DEFAULT_USER_AGENT:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        ACCEPT_LANGUAGE_VI: "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        ACCEPT_LANGUAGE_EN: "en-US,en;q=0.9,vi;q=0.8",
    },
    CHAT: {
        MAX_MESSAGES_PER_SEND: 50,
    },
    SOCKET: {
        /** Khoảng thời gian tối thiểu gửi gói tin Ping (ms) */
        MIN_PING_INTERVAL_MS: 10_000,
        PING_INTERVAL_MIN_MS: 10_000,
        /** Khoảng thời gian tối đa gửi gói tin Ping (ms) */
        MAX_PING_INTERVAL_MS: 25_000,
        PING_INTERVAL_MAX_MS: 25_000,
        DEFAULT_PING_INTERVAL_MS: 25_000,
        /** Thời gian Watchdog tự động ép kết nối lại nếu không nhận được gói tin nào (ms) */
        WATCHDOG_TIMEOUT_MS: 50_000,
        /** Thời gian chờ tối đa khi xoay vòng thử lại kết nối (ms) */
        MAX_RETRY_BACKOFF_MS: 30_000,
        /** Số lần lỗi 1006 liên tiếp trước khi xoay sang WebSocket endpoint tiếp theo */
        CONSECUTIVE_1006_ROTATE_THRESHOLD: 2,
        /** Con trỏ mặc định khi bắt đầu kéo hàng đợi tin nhắn cũ (cmd 510 / 511) */
        OLD_MSG_INITIAL_CURSOR: "10000000000000000",
        INITIAL_OLD_MESSAGES_CURSOR: "10000000000000000",
    },
    UPLOAD: {
        /** Thời gian sống tối đa của uploadCallback trong bộ nhớ trước khi tự hủy (5 phút) */
        CALLBACK_TTL_MS: 5 * 60 * 1000,
        /** Kích thước mỗi khối tính MD5 cho file lớn (2MB) */
        MD5_CHUNK_SIZE_BYTES: 2 * 1024 * 1024,
    },
    ZCLOUD: {
        /** Thời gian cache cặp khóa { viewer_key, enk } trong phiên (15 phút) */
        VIEWER_KEY_CACHE_TTL_MS: 15 * 60 * 1000,
    },
    PAGINATION: {
        /** Kích thước ảnh đại diện mặc định (px) */
        DEFAULT_AVATAR_SIZE: 120,
        /** Số lượng tin nhắn lịch sử nhóm mặc định mỗi lần tải */
        DEFAULT_GROUP_HISTORY_COUNT: 50,
        /** Giới hạn an toàn tối đa khi tải lịch sử tin nhắn nhóm */
        MAX_GROUP_HISTORY_COUNT: 200,
        /** Số lượng tin nhắn tối đa mỗi trang của Zalo Cloud Message */
        GROUP_CLOUD_PAGE_SIZE: 50,
    },
    VOICECALL: {
        /** Danh sách Audio Codec chuẩn của binary C++ ZaloCall */
        AUDIO_CODECS: [
            { channels: 1, clockrate: 16000, name: "speex", payload: 99 },
            { channels: 1, clockrate: 8000, name: "speex", payload: 98 },
            { channels: 1, clockrate: 8000, name: "opus", payload: 109 },
            { channels: 1, clockrate: 8000, name: "AMR-NB", payload: 106 },
            { channels: 1, clockrate: 16000, name: "opus", payload: 112 },
        ],
        /** Danh sách Video Codec H.264 chuẩn của binary C++ ZaloCall */
        VIDEO_CODECS: [{ clockrate: 90000, name: "h264", payload: 97 }],
    },
} as const;
