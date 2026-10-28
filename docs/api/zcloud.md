---
title: "Đám mây ZCloud & ZFamily (ZCloud) (api.zcloud) - 16 APIs"
description: "Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC), lấy link tải hàng loạt, quản lý hàng đợi và di chuyển dữ liệu. Tra cứu chi tiết 16 phương thức thuộc phân hệ api.zcloud trong bộ SDK @softtynet/zca-js."
---

# ☁️ Đám mây ZCloud & ZFamily (ZCloud)

> Namespace: `api.zcloud` (hoặc gọi trực tiếp `api.<methodName>`) — **16 API nguyên bản**

Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC), lấy link tải hàng loạt, quản lý hàng đợi và di chuyển dữ liệu.

## Danh sách nhanh

| Phương thức                                           |  HTTP  | Endpoint Zalo                             | Mô tả                                                                                                                                                                                                                     |
| :---------------------------------------------------- | :----: | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`ackCloudOnboarding`](#ackcloudonboarding)           | `POST` | `/cloudmedia/onboarding/pc/ack/v1`        | Xác nhận hoàn tất bước khởi tạo (Onboarding ACK V1) trên ZCloud (command 12746)                                                                                                                                           |
| [`getCloudDownloadUrls`](#getclouddownloadurls)       | `GET`  | `/cloudmedia/downloadurls/pc/v1`          | Lấy danh sách đường dẫn tải xuống các tệp Media lưu trữ trên ZCloud theo `noiseIds` (command 12743)                                                                                                                       |
| [`getCloudInfo`](#getcloudinfo)                       | `GET`  | `/zalocloud/cloudinfopcweb/v1/info`       | Lấy thông tin gói thuê bao Zalo Cloud (command 12754)                                                                                                                                                                     |
| [`getCloudSettings`](#getcloudsettings)               | `GET`  | `/cloudmedia/info/pc/v1/cloud-settings`   | Lấy cấu hình giới hạn tệp và cài đặt ZCloud của tài khoản (command 12756)                                                                                                                                                 |
| [`getCloudUploadUrl`](#getclouduploadurl)             | `GET`  | `/zalocloud/migration/v1/getuploadurl`    | Lấy đường dẫn tải lên tệp di trú lên ZCloud (command 12752)                                                                                                                                                               |
| [`getCloudViewerKey`](#getcloudviewerkey)             | `GET`  | `/api/getCloudViewerKey`                  | Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho hệ thống ZCloud / MyCloud (command 12741). Tự động cache trong bộ nhớ `ctx.zcloudViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp. |
| [`getFamilyProfile`](#getfamilyprofile)               | `GET`  | `/zfamily/pc/family-profile/v1/family`    | Lấy thông tin nhóm gia đình ZFamily (command 12757)                                                                                                                                                                       |
| [`getFamilyUsage`](#getfamilyusage)                   | `GET`  | `/cloudmedia/info/pc/v1/family-usage`     | Kiểm tra dung lượng sử dụng gói ZCloud Gia đình (Family Usage - command 12758)                                                                                                                                            |
| [`getFamilyViewerKey`](#getfamilyviewerkey)           | `GET`  | `/api/getFamilyViewerKey`                 | Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho gói gia đình ZFamily (command 12759). Tự động cache trong bộ nhớ `ctx.zfamilyViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp.     |
| [`getUsageMyCloud`](#getusagemycloud)                 | `GET`  | `/cloudmedia/info/pc/v1/usage-mycloud`    | Kiểm tra hạn mức và dung lượng sử dụng Cloud của tôi (MyCloud - command 12748)                                                                                                                                            |
| [`getUsageZCloud`](#getusagezcloud)                   | `GET`  | `/cloudmedia/info/pc/v2/usage`            | Kiểm tra dung lượng sử dụng ZCloud V2 (bao gồm MyCloud và Sao lưu tin nhắn - command 12749)                                                                                                                               |
| [`migrateCloudRecent`](#migratecloudrecent)           | `POST` | `/zalocloud/migration/v1/migraterecent`   | Thực hiện di trú dữ liệu tệp tin gần đây lên ZCloud (command 12753)                                                                                                                                                       |
| [`resetCloudQueue`](#resetcloudqueue)                 | `GET`  | `/cloudmedia/queue/pc/reset`              | Đặt lại hàng đợi đồng bộ Media trên ZCloud (command 12744)                                                                                                                                                                |
| [`submitCloudMediaExtInfo`](#submitcloudmediaextinfo) | `POST` | `/cloudmedia/queue/pc/submitMediaExtInfo` | Gửi thông tin mở rộng (siêu dữ liệu / khóa giải mã) của các tệp Media lên hàng đợi ZCloud (command 12745)                                                                                                                 |
| [`submitCloudVerifyAction`](#submitcloudverifyaction) | `POST` | `/cloudmedia/onboarding/pc/ack/v2`        | Gửi hành động xác thực bảo mật ZCloud (Onboarding ACK V2 - command 12750)                                                                                                                                                 |
| [`verifyCloudMedia`](#verifycloudmedia)               | `GET`  | `/cloudmedia/queue/pc/verify`             | Kiểm tra và lấy danh sách mục Media lưu trữ trên ZCloud (command 12740 / 12761)                                                                                                                                           |

---

## `ackCloudOnboarding`

Xác nhận hoàn tất bước khởi tạo (Onboarding ACK V1) trên ZCloud (command 12746)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/onboarding/pc/ack/v1</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.ackCloudOnboarding(payload: Record<string, unknown> = {}, viewerKeyInfo?: GetCloudViewerKeyResponse,)
// Hoặc gọi phẳng (Flat Alias):
await api.ackCloudOnboarding(payload: Record<string, unknown> = {}, viewerKeyInfo?: GetCloudViewerKeyResponse,)
```

### Tham số

- `payload`: Thông tin xác nhận khởi tạo ZCloud
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AckCloudOnboardingResponse = Record<string, unknown>;
```

---

## `getCloudDownloadUrls`

Lấy danh sách đường dẫn tải xuống các tệp Media lưu trữ trên ZCloud theo `noiseIds` (command 12743)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/downloadurls/pc/v1</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getCloudDownloadUrls(listNoiseIds: string | string[], viewerKeyInfo?: GetCloudViewerKeyResponse,)
// Hoặc gọi phẳng (Flat Alias):
await api.getCloudDownloadUrls(listNoiseIds: string | string[], viewerKeyInfo?: GetCloudViewerKeyResponse,)
```

### Tham số

- `listNoiseIds`: Danh sách `noiseId` của các tệp trên ZCloud
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloudDownloadUrlsResponse = Record<string, unknown>;
```

---

## `getCloudInfo`

Lấy thông tin gói thuê bao Zalo Cloud (command 12754)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/zalocloud/cloudinfopcweb/v1/info</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getCloudInfo(viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getCloudInfo(viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloudInfoResponse = Record<string, unknown>;
```

---

## `getCloudSettings`

Lấy cấu hình giới hạn tệp và cài đặt ZCloud của tài khoản (command 12756)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/info/pc/v1/cloud-settings</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getCloudSettings(viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getCloudSettings(viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloudSettingsResponse = {
    cloud_media_file_size_limit: number;
    enable_community: number;
    my_cloud_file_size_limit: number;
    opt_in: number;
    key_export: Record<string, unknown>;
    enable_offload: number;
};
```

---

## `getCloudUploadUrl`

Lấy đường dẫn tải lên tệp di trú lên ZCloud (command 12752)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/zalocloud/migration/v1/getuploadurl</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getCloudUploadUrl(numberOfFiles: number = 1, viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getCloudUploadUrl(numberOfFiles: number = 1, viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `numberOfFiles`: Số lượng tệp cần tải lên (mặc định `1`)
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloudUploadUrlResponse = Record<string, unknown>;
```

---

## `getCloudViewerKey`

Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho hệ thống ZCloud / MyCloud (command 12741). Tự động cache trong bộ nhớ `ctx.zcloudViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/api/getCloudViewerKey</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getCloudViewerKey((forceRefresh = false));
// Hoặc gọi phẳng (Flat Alias):
await api.getCloudViewerKey((forceRefresh = false));
```

### Tham số

- `forceRefresh`: Đặt `true` nếu muốn bỏ qua bộ nhớ đệm và bắt buộc lấy khóa mới từ máy chủ

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCloudViewerKeyResponse = {
    viewer_key: string;
    enk: string;
};
```

---

## `getFamilyProfile`

Lấy thông tin nhóm gia đình ZFamily (command 12757)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/zfamily/pc/family-profile/v1/family</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getFamilyProfile(familyKeyInfo?: GetFamilyViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getFamilyProfile(familyKeyInfo?: GetFamilyViewerKeyResponse)
```

### Tham số

- `familyKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getFamilyViewerKey()`.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFamilyProfileResponse = Record<string, unknown>;
```

---

## `getFamilyUsage`

Kiểm tra dung lượng sử dụng gói ZCloud Gia đình (Family Usage - command 12758)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/info/pc/v1/family-usage</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getFamilyUsage(viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getFamilyUsage(viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFamilyUsageResponse = {
    usage: number;
    quota: number;
    lastUpdated: number;
};
```

---

## `getFamilyViewerKey`

Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho gói gia đình ZFamily (command 12759). Tự động cache trong bộ nhớ `ctx.zfamilyViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/api/getFamilyViewerKey</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getFamilyViewerKey((forceRefresh = false));
// Hoặc gọi phẳng (Flat Alias):
await api.getFamilyViewerKey((forceRefresh = false));
```

### Tham số

- `forceRefresh`: Đặt `true` nếu muốn bỏ qua bộ nhớ đệm và bắt buộc lấy khóa mới từ máy chủ

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetFamilyViewerKeyResponse = {
    viewer_key: string;
    enk: string;
};
```

---

## `getUsageMyCloud`

Kiểm tra hạn mức và dung lượng sử dụng Cloud của tôi (MyCloud - command 12748)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/info/pc/v1/usage-mycloud</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getUsageMyCloud(viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getUsageMyCloud(viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetUsageMyCloudResponse = {
    usage: number;
    quota: number;
    plan: number;
};
```

---

## `getUsageZCloud`

Kiểm tra dung lượng sử dụng ZCloud V2 (bao gồm MyCloud và Sao lưu tin nhắn - command 12749)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/info/pc/v2/usage</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getUsageZCloud(viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.getUsageZCloud(viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`. Nếu không truyền sẽ tự động lấy từ cache hoặc cấp mới.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetUsageZCloudResponse = {
    service_usage: {
        my_cloud: number;
        message_backup: number;
    };
    usage: number;
    quota: number;
    plan: number;
};
```

---

## `migrateCloudRecent`

Thực hiện di trú dữ liệu tệp tin gần đây lên ZCloud (command 12753)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/zalocloud/migration/v1/migraterecent</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.migrateCloudRecent(payload: Record<string, unknown>, viewerKeyInfo?: GetCloudViewerKeyResponse,)
// Hoặc gọi phẳng (Flat Alias):
await api.migrateCloudRecent(payload: Record<string, unknown>, viewerKeyInfo?: GetCloudViewerKeyResponse,)
```

### Tham số

- `payload`: Thông tin tệp cần di trú lên ZCloud
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type MigrateCloudRecentResponse = Record<string, unknown>;
```

---

## `resetCloudQueue`

Đặt lại hàng đợi đồng bộ Media trên ZCloud (command 12744)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/queue/pc/reset</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.resetCloudQueue(viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.resetCloudQueue(viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ResetCloudQueueResponse = Record<string, unknown>;
```

---

## `submitCloudMediaExtInfo`

Gửi thông tin mở rộng (siêu dữ liệu / khóa giải mã) của các tệp Media lên hàng đợi ZCloud (command 12745)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/queue/pc/submitMediaExtInfo</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.submitCloudMediaExtInfo(info: unknown[], viewerKeyInfo?: GetCloudViewerKeyResponse)
// Hoặc gọi phẳng (Flat Alias):
await api.submitCloudMediaExtInfo(info: unknown[], viewerKeyInfo?: GetCloudViewerKeyResponse)
```

### Tham số

- `info`: Danh sách thông tin mở rộng của các mục Media
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SubmitCloudMediaExtInfoResponse = {
    noiseIdsErr?: string[];
    [key: string]: unknown;
};
```

---

## `submitCloudVerifyAction`

Gửi hành động xác thực bảo mật ZCloud (Onboarding ACK V2 - command 12750)

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/onboarding/pc/ack/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.submitCloudVerifyAction(payload: Record<string, unknown>, viewerKeyInfo?: GetCloudViewerKeyResponse,)
// Hoặc gọi phẳng (Flat Alias):
await api.submitCloudVerifyAction(payload: Record<string, unknown>, viewerKeyInfo?: GetCloudViewerKeyResponse,)
```

### Tham số

- `payload`: Dữ liệu hành động xác thực ZCloud
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SubmitCloudVerifyActionResponse = Record<string, unknown>;
```

---

## `verifyCloudMedia`

Kiểm tra và lấy danh sách mục Media lưu trữ trên ZCloud (command 12740 / 12761)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.zcloud</span><span class="zca-endpoint-pill">/cloudmedia/queue/pc/verify</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.verifyCloudMedia(options: VerifyCloudMediaOptions = {}, viewerKeyInfo?: GetCloudViewerKeyResponse,)
// Hoặc gọi phẳng (Flat Alias):
await api.verifyCloudMedia(options: VerifyCloudMediaOptions = {}, viewerKeyInfo?: GetCloudViewerKeyResponse,)
```

### Tham số

- `options`: Tùy chọn truy vấn (`lastNoiseId`, `loadType`, `listNoiseIds`, `trackingSource`)
- `viewerKeyInfo`: (Tùy chọn) Cặp `{ viewer_key, enk }` từ `api.getCloudViewerKey()`.

### Kiểu dữ liệu (TypeScript Types)

```ts
export type VerifyCloudMediaOptions = {
    lastNoiseId?: string;
    loadType?: number;
    listNoiseIds?: string[];
    trackingSource?: number;
};

export type VerifyCloudMediaResponse = {
    lastNoiseId: string;
    hasMore: number;
    mediaItems: Record<string, unknown>[];
    listVerifyNoiseIds: string[];
};
```

---
