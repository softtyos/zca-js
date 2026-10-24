# Xác thực & Phiên (Auth)

> Namespace: `api.auth` (hoặc gọi trực tiếp `api.<methodName>`) — **13 API**

Quản lý thiết bị đăng nhập, mã QR, Keep-Alive, giải mã GID (Global ID) và Noised ID.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`decryptGids`](#decryptgids) | `GET` | `/api/gid/decrypt` | Giải mã danh sách Global ID (g_...) ẩn danh thành User ID thật (tương ứng hàm `getUidFromGlobalNoiseId` / command `12054` trên Zalo PC) |
| [`encryptGids`](#encryptgids) | `GET` | `/api/gid/encrypt` | Mã hóa danh sách UID thật sang định danh ẩn danh Global Noise ID (`OTDAKO...`) (command 12053) |
| [`getContext`](#getcontext) | `GET` | `N/A` | API `getContext` thuộc phân hệ `auth`. |
| [`getCookie`](#getcookie) | `GET` | `N/A` | API `getCookie` thuộc phân hệ `auth`. |
| [`getListDevice`](#getlistdevice) | `GET` | `/api/devices/linked` | Get list device |
| [`getNoisedIds`](#getnoisedids) | `GET` | `/api/znoise` | Chuyển đổi danh sách UID cá nhân (`fids`) và GID nhóm (`gids`) dạng số thuần (từ SQLite ZDB4.0 mobile) sang định dạng Noised ID 19 chữ số dùng trên Zalo Web/PC (`getNoisedUids`, command `12390`). Tự động fallback sang `https://zwid.api.zalo.me/api/znoise` nếu profile domain trả về lỗi. |
| [`getOwnId`](#getownid) | `GET` | `N/A` | API `getOwnId` thuộc phân hệ `auth`. |
| [`getQR`](#getqr) | `POST` | `/api/friend/mget-qr` | Get QR code for users |
| [`keepAlive`](#keepalive) | `GET` | `N/A` | Gửi tín hiệu duy trì phiên kết nối HTTP tới máy chủ Chat (KeepAlive - command 11770) |
| [`lostFocus`](#lostfocus) | `POST` | `/api/social/profile/changefgtobg` | Lost focus |
| [`scanURL`](#scanurl) | `POST` | `/api/message/scanurl` | Scan URL to check if it is safe? - `114` - Invalid params |
| [`updateActiveStatus`](#updateactivestatus) | `GET` | `/api/social/profile/ping`<br/>`/api/social/profile/deactive` | Update active status? |
| [`updateLang`](#updatelang) | `GET` | `/api/social/profile/updatelang` | Update language? |

---

## `decryptGids`

Giải mã danh sách Global ID (g_...) ẩn danh thành User ID thật (tương ứng hàm `getUidFromGlobalNoiseId` / command `12054` trên Zalo PC)

- **Endpoint**: `GET /api/gid/decrypt`
- **Domain call**: `api.auth.decryptGids(gids: string | string[])`
- **Alias phẳng**: `api.decryptGids(gids: string | string[])`

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

- **Endpoint**: `GET /api/gid/encrypt`
- **Domain call**: `api.auth.encryptGids(uids: string[])`
- **Alias phẳng**: `api.encryptGids(uids: string[])`

### Tham số

- `uids`: Mảng chuỗi các UID cần mã hóa

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EncryptGidsResponse = {
    data: Record<string, string>;
};
```

---

## `getContext`

API `getContext` thuộc phân hệ `auth`.

- **Domain call**: `api.auth.getContext()`
- **Alias phẳng**: `api.getContext()`

---

## `getCookie`

API `getCookie` thuộc phân hệ `auth`.

- **Domain call**: `api.auth.getCookie()`
- **Alias phẳng**: `api.getCookie()`

---

## `getListDevice`

Get list device

- **Endpoint**: `GET /api/devices/linked`
- **Domain call**: `api.auth.getListDevice()`
- **Alias phẳng**: `api.getListDevice()`

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

- **Endpoint**: `GET /api/znoise`
- **Domain call**: `api.auth.getNoisedIds({ fids = [], gids = [] }: GetNoisedIdsParams)`
- **Alias phẳng**: `api.getNoisedIds({ fids = [], gids = [] }: GetNoisedIdsParams)`

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

- **Domain call**: `api.auth.getOwnId()`
- **Alias phẳng**: `api.getOwnId()`

---

## `getQR`

Get QR code for users

- **Endpoint**: `POST /api/friend/mget-qr`
- **Domain call**: `api.auth.getQR(userId: string | string[])`
- **Alias phẳng**: `api.getQR(userId: string | string[])`

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

- **Domain call**: `api.auth.keepAlive()`
- **Alias phẳng**: `api.keepAlive()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type KeepAliveResponse = {
    config_vesion?: number;
    [key: string]: unknown;
};
```

---

## `lostFocus`

Lost focus

- **Endpoint**: `POST /api/social/profile/changefgtobg`
- **Domain call**: `api.auth.lostFocus()`
- **Alias phẳng**: `api.lostFocus()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LostFocusResponse = {
    status: boolean;
};
```

---

## `scanURL`

Scan URL to check if it is safe? - `114` - Invalid params

- **Endpoint**: `POST /api/message/scanurl`
- **Domain call**: `api.auth.scanURL(url: string)`
- **Alias phẳng**: `api.scanURL(url: string)`

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

Update active status?

- **Endpoint**: `GET /api/social/profile/ping`, `GET /api/social/profile/deactive`
- **Domain call**: `api.auth.updateActiveStatus(active: boolean)`
- **Alias phẳng**: `api.updateActiveStatus(active: boolean)`

### Tham số

- `active`: 

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateActiveStatusResponse = {
    status: boolean;
};
```

---

## `updateLang`

Update language?

- **Endpoint**: `GET /api/social/profile/updatelang`
- **Domain call**: `api.auth.updateLang(language: UpdateLangAvailableLanguages = UpdateLangAvailableLanguages.VI)`
- **Alias phẳng**: `api.updateLang(language: UpdateLangAvailableLanguages = UpdateLangAvailableLanguages.VI)`

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
