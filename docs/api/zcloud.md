---
title: "Đám mây ZCloud & ZFamily (ZCloud) (api.zcloud) - 9 APIs"
description: "Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC) và xác thực Media. Tra cứu chi tiết 9 phương thức thuộc phân hệ api.zcloud trong bộ SDK @softtynet/zca-js."
---

# ☁️ Đám mây ZCloud & ZFamily (ZCloud)

> Namespace: `api.zcloud` (hoặc gọi trực tiếp `api.<methodName>`) — **9 API nguyên bản**

Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC) và xác thực Media.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`getCloudInfo`](#getcloudinfo) | `GET` | `Internal` | Lấy thông tin gói thuê bao Zalo Cloud (command 12754) |
| [`getCloudSettings`](#getcloudsettings) | `GET` | `Internal` | Lấy cấu hình giới hạn tệp và cài đặt ZCloud của tài khoản (command 12756) |
| [`getCloudViewerKey`](#getcloudviewerkey) | `GET` | `Internal` | Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho hệ thống ZCloud / MyCloud (command 12741). Tự động cache trong bộ nhớ `ctx.zcloudViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp. |
| [`getFamilyProfile`](#getfamilyprofile) | `GET` | `Internal` | Lấy thông tin nhóm gia đình ZFamily (command 12757) |
| [`getFamilyUsage`](#getfamilyusage) | `GET` | `Internal` | Kiểm tra dung lượng sử dụng gói ZCloud Gia đình (Family Usage - command 12758) |
| [`getFamilyViewerKey`](#getfamilyviewerkey) | `GET` | `Internal` | Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho gói gia đình ZFamily (command 12759). Tự động cache trong bộ nhớ `ctx.zfamilyViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp. |
| [`getUsageMyCloud`](#getusagemycloud) | `GET` | `Internal` | Kiểm tra hạn mức và dung lượng sử dụng Cloud của tôi (MyCloud - command 12748) |
| [`getUsageZCloud`](#getusagezcloud) | `GET` | `Internal` | Kiểm tra dung lượng sử dụng ZCloud V2 (bao gồm MyCloud và Sao lưu tin nhắn - command 12749) |
| [`verifyCloudMedia`](#verifycloudmedia) | `GET` | `Internal` | Kiểm tra và lấy danh sách mục Media lưu trữ trên ZCloud (command 12740 / 12761) |

---

## `getCloudInfo`

Lấy thông tin gói thuê bao Zalo Cloud (command 12754)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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

## `getCloudViewerKey`

Lấy cặp khóa phiên (`viewer_key` và khóa giải mã AES-256 `enk`) cho hệ thống ZCloud / MyCloud (command 12741). Tự động cache trong bộ nhớ `ctx.zcloudViewerKeyCache` (TTL 15 phút) để tối ưu hiệu năng khi gọi liên tiếp.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getCloudViewerKey(forceRefresh = false)
// Hoặc gọi phẳng (Flat Alias):
await api.getCloudViewerKey(forceRefresh = false)
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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.zcloud.getFamilyViewerKey(forceRefresh = false)
// Hoặc gọi phẳng (Flat Alias):
await api.getFamilyViewerKey(forceRefresh = false)
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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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

## `verifyCloudMedia`

Kiểm tra và lấy danh sách mục Media lưu trữ trên ZCloud (command 12740 / 12761)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">Local Context Helper</span></div>

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
