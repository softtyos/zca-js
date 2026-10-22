/**
 * Bảng định danh đường dẫn Endpoint (Endpoint Registry) theo từng miền dịch vụ của Zalo PC 26.7.10.
 * Giúp tra cứu nhanh và cập nhật tập trung khi Zalo thay đổi đường dẫn API.
 */
export const ZALO_ENDPOINTS = {
    WPA: {
        LOGIN_GET_LOGIN_INFO: "/api/login/getLoginInfo",
        LOGIN_GET_SERVER_INFO: "/api/login/getServerInfo",
        SETTING_ME: "/api/setting/me",
        SETTING_UPDATE: "/api/setting/update",
        GET_CLOUD_VIEWER_KEY: "/api/getCloudViewerKey",
        GET_FAMILY_VIEWER_KEY: "/api/getFamilyViewerKey",
    },
    ZWID: {
        ZNOISE: "/api/znoise",
    },
    TRANSFER_SYNC: {
        DOWNLOAD_V2: "/api/transfer-sync-v2/download",
    },
    AUTH: {
        LOGIN_GET_LOGIN_INFO: "/api/login/getLoginInfo",
        LOGIN_GET_SERVER_INFO: "/api/login/getServerInfo",
        KEEP_ALIVE: "/keepalive",
    },
    ZCLOUD: {
        GET_CLOUD_VIEWER_KEY: "/api/getCloudViewerKey",
        GET_FAMILY_VIEWER_KEY: "/api/getFamilyViewerKey",
        USAGE_V2: "/cloudmedia/info/pc/v2/usage",
        USAGE_MYCLOUD: "/cloudmedia/info/pc/v1/usage-mycloud",
        CLOUD_SETTINGS: "/cloudmedia/info/pc/v1/cloud-settings",
        CLOUD_INFO: "/zalocloud/cloudinfopcweb/v1/info",
        FAMILY_USAGE: "/cloudmedia/info/pc/v1/family-usage",
        VERIFY_QUEUE: "/cloudmedia/queue/pc/verify",
        FAMILY_PROFILE: "/zfamily/pc/family-profile/v1/family",
    },
    SYNC: {
        PRELOAD_CONVERSATIONS: "/api/preloadconvers/get-last-msgs",
        GET_LAST_SEEN: "/api/preloadconvers/get-last-seen",
        PULL_MOBILE_MSG: "/api/message/pull_mobile_msg",
        CANCEL_PULL_MOBILE_MSG: "/api/message/cancel_pull_mobile_msg",
        ZNOISE: "/api/znoise",
        ENCRYPT_GIDS: "/api/gid/encrypt",
        DECRYPT_GIDS: "/api/gid/decrypt",
    },
    CALL: {
        REQUEST_CALL: "/api/voicecall/requestcall",
        SEND_REQUEST: "/api/voicecall/request",
        CANCEL_CALL: "/api/voicecall/cancel",
        END_CALL: "/api/voicecall/endcall",
    },
    AI: {
        VOICE_TO_TEXT: "/api/aifeatures/voice2text",
    },
    EMOJI_STATUS: {
        RESOURCE_CONFIG: "/api/v1/emoji-status/resource-config",
        FRIENDS_LIST: "/api/v1/emoji-status/friends",
    },
    MEDIA_STORE: {
        LIST: "/api/mediastore/list",
        PREVIEW: "/api/mediastore/preview",
        REMOVE: "/api/mediastore/remove",
    },
    RECENT_SEARCH: {
        LIST: "/api/recentsearch/list",
        UPDATE: "/api/recentsearch/update",
    },
} as const;
