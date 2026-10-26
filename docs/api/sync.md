---
title: "Đồng bộ Mobile ZDB 4.0 (Sync) (api.sync) - 5 APIs"
description: "Đồng bộ toàn bộ lịch sử tin nhắn từ điện thoại sang PC qua giao thức RSA-2048 & ZDB 4.0 AES-256-CBC multi-chunk. Tra cứu chi tiết 5 phương thức thuộc phân hệ api.sync trong bộ SDK @softtynet/zca-js."
---

# 🔄 Đồng bộ Mobile ZDB 4.0 (Sync)

> Namespace: `api.sync` (hoặc gọi trực tiếp `api.<methodName>`) — **5 API nguyên bản**

Đồng bộ toàn bộ lịch sử tin nhắn từ điện thoại sang PC qua giao thức RSA-2048 & ZDB 4.0 AES-256-CBC multi-chunk.

## Danh sách nhanh

| Phương thức                                     | HTTP  | Endpoint Zalo                         | Mô tả                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :---------------------------------------------- | :---: | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`cancelPullMobile`](#cancelpullmobile)         | `GET` | `/api/message/cancel_pull_mobile_msg` | Huỷ yêu cầu đồng bộ tin nhắn từ điện thoại đang chờ (`cancel_pull_mobile_msg`, command `12700`).                                                                                                                                                                                                                                                                                                                                                                                                 |
| [`downloadTransferSync`](#downloadtransfersync) | `GET` | `Internal`                            | Tải khối dữ liệu snapshot đồng bộ tin nhắn từ máy chủ transfersync.zaloapp.com                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [`getSyncData`](#getsyncdata)                   | `GET` | `Internal`                            | Tải xuống file sao lưu tin nhắn từ sự kiện `syncmsg_info` (`.db.crypt`, định dạng `ZDB4.0`) và lưu ra ổ đĩa hoặc trả về `ReadableStream`.                                                                                                                                                                                                                                                                                                                                                        |
| [`pullMobile`](#pullmobile)                     | `GET` | `/api/message/pull_mobile_msg`        | Yêu cầu thiết bị di động Zalo đóng gói và tải lên bản sao lưu tin nhắn (`pull_mobile_msg`, command `12000`). Sự kiện tiến trình (`user_confirm`, `syncmsg_info`, `transfer_error`) sẽ được đẩy về qua `api.listener.on("sync_event")`.                                                                                                                                                                                                                                                           |
| [`requestSyncFromPhone`](#requestsyncfromphone) | `GET` | `Internal`                            | Phát tín hiệu yêu cầu đồng bộ tin nhắn từ ứng dụng Zalo trên điện thoại (`pull_mobile_msg`, command `12000`). Tự động sinh cặp khoá RSA 2048-bit (nếu chưa truyền vào) và gọi `api.pullMobile(...)`. Điện thoại của người dùng sẽ hiển thị thông báo yêu cầu xác nhận đồng bộ (hoặc tự động đồng bộ nếu có `tempKey` từ `transfer_after_login`). Lắng nghe sự kiện `api.listener.on("sync_event", ...)` để nhận tiến trình xác nhận (`user_confirm`) và thông tin file sao lưu (`syncmsg_info`). |

---

## `cancelPullMobile`

Huỷ yêu cầu đồng bộ tin nhắn từ điện thoại đang chờ (`cancel_pull_mobile_msg`, command `12700`).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sync</span><span class="zca-endpoint-pill">/api/message/cancel_pull_mobile_msg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sync.cancelPullMobile({ public_key, pc_name = "Web" }: CancelPullMobileParams)
// Hoặc gọi phẳng (Flat Alias):
await api.cancelPullMobile({ public_key, pc_name = "Web" }: CancelPullMobileParams)
```

### Tham số

- `params`: Tham số huỷ đồng bộ (`public_key`, `pc_name`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CancelPullMobileResponse = {
    error_code?: number | string;
    error_message?: string;
    data?: string;
    [key: string]: unknown;
};

export type CancelPullMobileParams = {
    public_key: string;
    pc_name?: string;
};
```

---

## `downloadTransferSync`

Tải khối dữ liệu snapshot đồng bộ tin nhắn từ máy chủ transfersync.zaloapp.com

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sync</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sync.downloadTransferSync(options: DownloadTransferSyncOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.downloadTransferSync(options: DownloadTransferSyncOptions)
```

### Tham số

- `options`: URL đầy đủ hoặc object chứa { key, exp, sig }

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DownloadTransferSyncOptions =
    | string
    | {
          key: string;
          exp: number | string;
          sig: string;
      };
```

---

## `getSyncData`

Tải xuống file sao lưu tin nhắn từ sự kiện `syncmsg_info` (`.db.crypt`, định dạng `ZDB4.0`) và lưu ra ổ đĩa hoặc trả về `ReadableStream`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sync</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sync.getSyncData({ url, encrypted_key, file_name, file_size, checksum_code, from_seq_id, is_full_transfer, returnStream = false, savePath = "./", }: GetSyncDataParams)
// Hoặc gọi phẳng (Flat Alias):
await api.getSyncData({ url, encrypted_key, file_name, file_size, checksum_code, from_seq_id, is_full_transfer, returnStream = false, savePath = "./", }: GetSyncDataParams)
```

### Tham số

- `params`: Thông tin file sao lưu nhận được từ `SyncEventType.SYNCMSG_INFO`

### Kiểu dữ liệu (TypeScript Types)

```ts
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
```

---

## `pullMobile`

Yêu cầu thiết bị di động Zalo đóng gói và tải lên bản sao lưu tin nhắn (`pull_mobile_msg`, command `12000`). Sự kiện tiến trình (`user_confirm`, `syncmsg_info`, `transfer_error`) sẽ được đẩy về qua `api.listener.on("sync_event")`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sync</span><span class="zca-endpoint-pill">/api/message/pull_mobile_msg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sync.pullMobile({ public_key, pc_name = "Web", from_seq_id = 0, is_retry = 0, min_seq_id = 0, temp_key = "", }: PullMobileParams)
// Hoặc gọi phẳng (Flat Alias):
await api.pullMobile({ public_key, pc_name = "Web", from_seq_id = 0, is_retry = 0, min_seq_id = 0, temp_key = "", }: PullMobileParams)
```

### Tham số

- `params`: Tham số khởi tạo đồng bộ (bao gồm `public_key` RSA SPKI DER Base64)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PullMobileResponse = {
    error_code?: number | string;
    error_message?: string;
    data?: string;
    [key: string]: unknown;
};

export type PullMobileParams = {
    public_key: string;
    pc_name?: string;
    from_seq_id?: number;
    is_retry?: number;
    min_seq_id?: number;
    temp_key?: string;
};
```

---

## `requestSyncFromPhone`

Phát tín hiệu yêu cầu đồng bộ tin nhắn từ ứng dụng Zalo trên điện thoại (`pull_mobile_msg`, command `12000`). Tự động sinh cặp khoá RSA 2048-bit (nếu chưa truyền vào) và gọi `api.pullMobile(...)`. Điện thoại của người dùng sẽ hiển thị thông báo yêu cầu xác nhận đồng bộ (hoặc tự động đồng bộ nếu có `tempKey` từ `transfer_after_login`). Lắng nghe sự kiện `api.listener.on("sync_event", ...)` để nhận tiến trình xác nhận (`user_confirm`) và thông tin file sao lưu (`syncmsg_info`).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sync</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sync.requestSyncFromPhone(options: RequestSyncFromPhoneOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.requestSyncFromPhone(options: RequestSyncFromPhoneOptions = {},)
```

### Tham số

- `options`: Tuỳ chọn đồng bộ (`pcName`, `tempKey`, hoặc cặp khoá RSA tự quản lý)

### Kiểu dữ liệu (TypeScript Types)

```ts
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
```

---
