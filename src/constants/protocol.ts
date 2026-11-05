/**
 * Chuẩn tham số giao thức cốt lõi của Zalo Web / Zalo PC (Single Source of Truth)
 * Khi Zalo nâng cấp phiên bản giao thức mới, chỉ cần cập nhật tại file này.
 */
export const ZALO_PROTOCOL = {
    /** Loại thiết bị mặc định (30 = Zalo Web / PC) */
    API_TYPE: 30,
    DEFAULT_API_TYPE: 30,
    /** Phiên bản giao thức mặc định (689 = Zalo PC 26.7.10) */
    API_VERSION: 689,
    DEFAULT_API_VERSION: 689,
    /** Phiên bản SDK hiện tại */
    SDK_VERSION: "2.3.13",
    /** Mã zpw_type đặc thù dành riêng cho phân hệ Gọi Thoại & Video (binary C++ ZaloCall) */
    VOICECALL_API_TYPE: 24,
    /** Phiên bản mã hóa ZCID (ParamDecryptor) */
    ENCRYPT_VERSION: "v2",
    /** Tiền tố khóa ký MD5 cho tham số đăng nhập */
    SIGN_KEY_PREFIX: "zsecure",
    /** Khóa tĩnh dùng để mã hóa ZCID trong ParamCipher của Zalo PC */
    PARAM_CIPHER_KEY: "3FC4F0D2AB50057BCE0D90D9187A22B1",
    /** Chữ ký nhận diện định dạng container sao lưu từ điện thoại */
    ZDB_MAGIC_HEADER: "ZDB4.0",
    /** Kích thước mỗi khối (chunk) giải mã AES-256-CBC của file sao lưu .db.crypt (64KB) */
    ZDB_CHUNK_SIZE: 0x10000,
    /** Độ dài Vector khởi tạo ngẫu nhiên (IV) ghép ở đầu bản mã ZCloud / ZFamily (module 98yS) */
    ZCLOUD_IV_BYTE_LENGTH: 16,
    /** Độ dài khóa AES-256 tính theo byte */
    AES_256_KEY_BYTE_LENGTH: 32,
} as const;
