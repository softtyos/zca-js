---
title: "Xác thực & Phiên (Auth) (api.auth) - 14 APIs"
description: "Quản lý thiết bị đăng nhập, xuất/nhập phiên (exportSession), mã QR, Keep-Alive, giải mã GID (Global ID) và Noised ID. Tra cứu chi tiết 14 phương thức thuộc phân hệ api.auth trong bộ SDK @softtynet/zca-js."
---

# 🔐 Xác thực & Phiên (Auth)

> Namespace: `api.auth` (hoặc gọi trực tiếp `api.<methodName>`) — **14 API nguyên bản**

Quản lý thiết bị đăng nhập, xuất/nhập phiên (exportSession), mã QR, Keep-Alive, giải mã GID (Global ID) và Noised ID.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`decryptGids`](#decryptgids) | `GET` | `/api/gid/decrypt` | Giải mã danh sách Global ID (g_...) ẩn danh thành User ID thật (tương ứng hàm `getUidFromGlobalNoiseId` / command `12054` trên Zalo PC) |
| [`encryptGids`](#encryptgids) | `GET` | `/api/gid/encrypt` | Mã hóa danh sách UID thật sang định danh ẩn danh Global Noise ID (`OTDAKO...`) (command 12053) |
| [`exportSession`](#exportsession) | `GET` | `Internal` | Xuất toàn bộ thông tin phiên đăng nhập hiện tại (`uid`, `imei`, `userAgent`, `language`, `cookie`) dưới định dạng chuẩn `Credentials` để lưu trữ (JSON/Database) và truyền trực tiếp vào `zalo.login(session)`. |
| [`getContext`](#getcontext) | `GET` | `Internal` | API `getContext` thuộc phân hệ `auth`. |
| [`getCookie`](#getcookie) | `GET` | `Internal` | Get the current cookie string |
| [`getListDevice`](#getlistdevice) | `GET` | `/api/devices/linked` | Lấy danh sách các thiết bị đang đăng nhập tài khoản Zalo hiện tại. |
| [`getNoisedIds`](#getnoisedids) | `GET` | `/api/znoise` | Chuyển đổi danh sách UID cá nhân (`fids`) và GID nhóm (`gids`) dạng số thuần (từ SQLite ZDB4.0 mobile) sang định dạng Noised ID 19 chữ số dùng trên Zalo Web/PC (`getNoisedUids`, command `12390`). Tự động fallback sang `https://zwid.api.zalo.me/api/znoise` nếu profile domain trả về lỗi. |
| [`getOwnId`](#getownid) | `GET` | `Internal` | API `getOwnId` thuộc phân hệ `auth`. |
| [`getQR`](#getqr) | `POST` | `/api/friend/mget-qr` | Lấy mã QR của danh sách người dùng theo UID. |
| [`keepAlive`](#keepalive) | `GET` | `Internal` | Gửi tín hiệu duy trì phiên kết nối HTTP tới máy chủ Chat (KeepAlive - command 11770) |
| [`lostFocus`](#lostfocus) | `POST` | `/api/social/profile/changefgtobg` | Gửi tín hiệu thông báo ứng dụng chuyển sang chế độ chạy nền (Background). |
| [`scanURL`](#scanurl) | `POST` | `/api/message/scanurl` | Quét và kiểm tra độ an toàn của đường dẫn URL thông qua bộ lọc bảo mật Zalo. |
| [`updateActiveStatus`](#updateactivestatus) | `GET` | `/api/social/profile/ping`<br/>`/api/social/profile/deactive` | Cập nhật trạng thái hoạt động (Online / Offline / Ping) của tài khoản. |
| [`updateLang`](#updatelang) | `GET` | `/api/social/profile/updatelang` | Cập nhật ngôn ngữ hiển thị của phiên tài khoản Zalo. |

---

## `decryptGids`

Giải mã danh sách Global ID (g_...) ẩn danh thành User ID thật (tương ứng hàm `getUidFromGlobalNoiseId` / command `12054` trên Zalo PC)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/gid/decrypt</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.decryptGids(gids: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.decryptGids(gids: string | string[])
```

### Tham số

- `gids`: Danh sách Global ID (hoặc 1 GID đơn lẻ)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DecryptGidsResponse = {
    data?: Record<string, string>;
    gids?: Record<string, string>;
    [key: string]: unknown;
};
```

---

## `encryptGids`

Mã hóa danh sách UID thật sang định danh ẩn danh Global Noise ID (`OTDAKO...`) (command 12053)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/gid/encrypt</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.encryptGids(uids: string[])
// Hoặc gọi phẳng (Flat Alias):
await api.encryptGids(uids: string[])
```

### Tham số

- `uids`: Mảng chuỗi các UID cần mã hóa

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EncryptGidsResponse = {
    data: Record<string, string>;
};
```

---

## `exportSession`

Xuất toàn bộ thông tin phiên đăng nhập hiện tại (`uid`, `imei`, `userAgent`, `language`, `cookie`) dưới định dạng chuẩn `Credentials` để lưu trữ (JSON/Database) và truyền trực tiếp vào `zalo.login(session)`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.exportSession()
// Hoặc gọi phẳng (Flat Alias):
await api.exportSession()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ExportedSession = Credentials & {
    uid: string;
    cookie: toughCookie.SerializedCookie[];
};
```

---

## `getContext`

API `getContext` thuộc phân hệ `auth`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.getContext()
// Hoặc gọi phẳng (Flat Alias):
await api.getContext()
```

---

## `getCookie`

Get the current cookie string

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.getCookie()
// Hoặc gọi phẳng (Flat Alias):
await api.getCookie()
```

---

## `getListDevice`

Lấy danh sách các thiết bị đang đăng nhập tài khoản Zalo hiện tại.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/devices/linked</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.getListDevice()
// Hoặc gọi phẳng (Flat Alias):
await api.getListDevice()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetListDeviceResponse = {
    devices: {
        masterId: string;
        encIdentity: string;
        lastUpdateTs: number;
        encSignature: string;
        companions: unknown[]; // @TODO check type later
    };
};
```

---

## `getNoisedIds`

Chuyển đổi danh sách UID cá nhân (`fids`) và GID nhóm (`gids`) dạng số thuần (từ SQLite ZDB4.0 mobile) sang định dạng Noised ID 19 chữ số dùng trên Zalo Web/PC (`getNoisedUids`, command `12390`). Tự động fallback sang `https://zwid.api.zalo.me/api/znoise` nếu profile domain trả về lỗi.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/znoise</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.getNoisedIds({ fids = [], gids = [] }: GetNoisedIdsParams)
// Hoặc gọi phẳng (Flat Alias):
await api.getNoisedIds({ fids = [], gids = [] }: GetNoisedIdsParams)
```

### Tham số

- `params`: Danh sách `fids` và `gids`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetNoisedIdsParams = {
    fids?: Array<string | number>;
    gids?: Array<string | number>;
};

export type GetNoisedIdsResponse = {
    fids: string[];
    gids: string[];
};
```

---

## `getOwnId`

API `getOwnId` thuộc phân hệ `auth`.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.getOwnId()
// Hoặc gọi phẳng (Flat Alias):
await api.getOwnId()
```

---

## `getQR`

Lấy mã QR của danh sách người dùng theo UID.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/friend/mget-qr</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.getQR(userId: string | string[])
// Hoặc gọi phẳng (Flat Alias):
await api.getQR(userId: string | string[])
```

### Tham số

- `userId`: User ID or list of user IDs

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetQRResponse = {
    [userId: string]: string;
};
```

---

## `keepAlive`

Gửi tín hiệu duy trì phiên kết nối HTTP tới máy chủ Chat (KeepAlive - command 11770)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.keepAlive()
// Hoặc gọi phẳng (Flat Alias):
await api.keepAlive()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type KeepAliveResponse = {
    config_vesion?: number;
    [key: string]: unknown;
};
```

---

## `lostFocus`

Gửi tín hiệu thông báo ứng dụng chuyển sang chế độ chạy nền (Background).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/social/profile/changefgtobg</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.lostFocus()
// Hoặc gọi phẳng (Flat Alias):
await api.lostFocus()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LostFocusResponse = {
    status: boolean;
};
```

---

## `scanURL`

Quét và kiểm tra độ an toàn của đường dẫn URL thông qua bộ lọc bảo mật Zalo.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/message/scanurl</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.scanURL(url: string)
// Hoặc gọi phẳng (Flat Alias):
await api.scanURL(url: string)
```

### Tham số

- `url`: URL to scan

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ScanURLResponse = {
    isSafe: boolean;
};
```

---

## `updateActiveStatus`

Cập nhật trạng thái hoạt động (Online / Offline / Ping) của tài khoản.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/social/profile/ping</span> <span class="zca-endpoint-pill">/api/social/profile/deactive</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.updateActiveStatus(active: boolean)
// Hoặc gọi phẳng (Flat Alias):
await api.updateActiveStatus(active: boolean)
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateActiveStatusResponse = {
    status: boolean;
};
```

---

## `updateLang`

Cập nhật ngôn ngữ hiển thị của phiên tài khoản Zalo.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.auth</span><span class="zca-endpoint-pill">/api/social/profile/updatelang</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.auth.updateLang(language: UpdateLangAvailableLanguages = UpdateLangAvailableLanguages.VI)
// Hoặc gọi phẳng (Flat Alias):
await api.updateLang(language: UpdateLangAvailableLanguages = UpdateLangAvailableLanguages.VI)
```

### Tham số

- `language`: language to update (VI, EN)

### Kiểu dữ liệu (TypeScript Types)

```ts
export enum UpdateLangAvailableLanguages {
    VI = "VI",
    EN = "EN",
}

export type UpdateLangResponse = "";
```

---
