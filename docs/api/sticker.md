---
title: "Nhãn dán & Biểu cảm (Sticker) (api.sticker) - 10 APIs"
description: "Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh và nhãn dán cá nhân hóa. Tra cứu chi tiết 10 phương thức thuộc phân hệ api.sticker trong bộ SDK @softtynet/zca-js."
---

# ✨ Nhãn dán & Biểu cảm (Sticker)

> Namespace: `api.sticker` (hoặc gọi trực tiếp `api.<methodName>`) — **10 API nguyên bản**

Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh và nhãn dán cá nhân hóa.

## Danh sách nhanh

| Phương thức                                                 | HTTP  | Endpoint Zalo                                  | Mô tả                                                                                      |
| :---------------------------------------------------------- | :---: | :--------------------------------------------- | :----------------------------------------------------------------------------------------- |
| [`getPersonalizedStickerList`](#getpersonalizedstickerlist) | `GET` | `/api/message/sticker/personalized/list`       | Lấy danh sách Sticker cá nhân hóa của tài khoản (command 11745)                            |
| [`getStickerCategoriesV2`](#getstickercategoriesv2)         | `GET` | `/api/message/sticker/category/list/v2`        | Lấy danh sách danh mục bộ nhãn dán (Sticker Categories V2 - command 12020)                 |
| [`getStickerCategoryData`](#getstickercategorydata)         | `GET` | `/api/message/sticker/category/detail`         | Lấy thông tin chi tiết một bộ nhãn dán theo `cid` (command 11156)                          |
| [`getStickerCategoryDetail`](#getstickercategorydetail)     | `GET` | `/api/message/sticker/category/sticker_detail` | Lấy danh sách toàn bộ nhãn dán nằm trong một bộ nhãn dán (Category/Pack ID).               |
| [`getStickerHello`](#getstickerhello)                       | `GET` | `/api/message/sticker/suggestion`              | Lấy danh sách Sticker chào hỏi gợi ý khi bắt đầu trò chuyện mới (command 11751)            |
| [`getStickerSuggestKeywords`](#getstickersuggestkeywords)   | `GET` | `/api/message/sticker/suggest/keywords`        | Lấy bộ từ khóa gợi ý Sticker tự động khi gõ tin nhắn (command 11740)                       |
| [`getStickerSuggestion`](#getstickersuggestion)             | `GET` | `/api/message/sticker/suggest/stickers`        | Gợi ý Sticker/GIF theo từ khóa đang nhập (command 11741)                                   |
| [`getStickers`](#getstickers)                               | `GET` | `/api/message/sticker`                         | Tìm kiếm danh sách ID nhãn dán theo từ khóa tiếng Việt/tiếng Anh.                          |
| [`getStickersDetail`](#getstickersdetail)                   | `GET` | `/api/message/sticker/sticker_detail`          | Lấy thông tin chi tiết (URL ảnh động, loại sticker, cateId) của một hoặc nhiều Sticker ID. |
| [`searchSticker`](#searchsticker)                           | `GET` | `/api/message/sticker/search`                  | Tìm kiếm nhãn dán nâng cao theo từ khóa.                                                   |

---

## `getPersonalizedStickerList`

Lấy danh sách Sticker cá nhân hóa của tài khoản (command 11745)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/personalized/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getPersonalizedStickerList();
// Hoặc gọi phẳng (Flat Alias):
await api.getPersonalizedStickerList();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetPersonalizedStickerListResponse = {
    list: unknown[];
    version: number;
};
```

---

## `getStickerCategoriesV2`

Lấy danh sách danh mục bộ nhãn dán (Sticker Categories V2 - command 12020)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/category/list/v2</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickerCategoriesV2();
// Hoặc gọi phẳng (Flat Alias):
await api.getStickerCategoriesV2();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type StickerCategoryV2Item = {
    id: number;
    name: string;
    desc?: string;
    totalImage?: number;
    iconUrl?: string;
    thumbUrl?: string;
    previewUrl?: string;
    status?: number;
    type?: number;
    [key: string]: unknown;
};

export type GetStickerCategoriesV2Response = {
    categories: StickerCategoryV2Item[];
    [key: string]: unknown;
};
```

---

## `getStickerCategoryData`

Lấy thông tin chi tiết một bộ nhãn dán theo `cid` (command 11156)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/category/detail</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickerCategoryData(cid: number)
// Hoặc gọi phẳng (Flat Alias):
await api.getStickerCategoryData(cid: number)
```

### Tham số

- `cid`: ID bộ nhãn dán (Category ID)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetStickerCategoryDataResponse = StickerCategoryV2Item;
```

---

## `getStickerCategoryDetail`

Lấy danh sách toàn bộ nhãn dán nằm trong một bộ nhãn dán (Category/Pack ID).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/category/sticker_detail</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickerCategoryDetail(cateId: number)
// Hoặc gọi phẳng (Flat Alias):
await api.getStickerCategoryDetail(cateId: number)
```

### Tham số

- `cateId`: Sticker category ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetStickerCategoryDetailResponse = StickerDetail[];
```

---

## `getStickerHello`

Lấy danh sách Sticker chào hỏi gợi ý khi bắt đầu trò chuyện mới (command 11751)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/suggestion</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickerHello();
// Hoặc gọi phẳng (Flat Alias):
await api.getStickerHello();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type StickerHelloItem = {
    id: number;
    cateId: number;
    type: number;
    text: string;
    uri: string;
    fkey: number;
    status: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl?: string | null;
    totalFrames: number;
    duration: number;
};

export type GetStickerHelloResponse = Record<string, unknown> | StickerHelloItem[];
```

---

## `getStickerSuggestKeywords`

Lấy bộ từ khóa gợi ý Sticker tự động khi gõ tin nhắn (command 11740)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/suggest/keywords</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickerSuggestKeywords();
// Hoặc gọi phẳng (Flat Alias):
await api.getStickerSuggestKeywords();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetStickerSuggestKeywordsResponse = {
    time: number;
    suggest_data: {
        version: number;
        sdata: Array<{
            keyword: string;
            stickers?: number[];
            [key: string]: unknown;
        }>;
    };
};
```

---

## `getStickerSuggestion`

Gợi ý Sticker/GIF theo từ khóa đang nhập (command 11741)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/suggest/stickers</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickerSuggestion(options: GetStickerSuggestionOptions | string)
// Hoặc gọi phẳng (Flat Alias):
await api.getStickerSuggestion(options: GetStickerSuggestionOptions | string)
```

### Tham số

- `options`: Từ khóa và tùy chọn kèm theo (`gif`, `guggy`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetStickerSuggestionOptions = {
    keyword: string;
    gif?: 0 | 1;
    guggy?: 0 | 1;
};

export type GetStickerSuggestionResponse = {
    sdata: unknown;
    gif?: unknown;
    guggy?: unknown;
    [key: string]: unknown;
};
```

---

## `getStickers`

Tìm kiếm danh sách ID nhãn dán theo từ khóa tiếng Việt/tiếng Anh.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickers(keyword: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getStickers(keyword: string)
```

### Tham số

- `keyword`: Keyword to search for

---

## `getStickersDetail`

Lấy thông tin chi tiết (URL ảnh động, loại sticker, cateId) của một hoặc nhiều Sticker ID.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/sticker_detail</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getStickersDetail(stickerIds: number | number[])
// Hoặc gọi phẳng (Flat Alias):
await api.getStickersDetail(stickerIds: number | number[])
```

### Tham số

- `stickerIds`: Sticker IDs to search for

### Kiểu dữ liệu (TypeScript Types)

```ts
export type StickerDetailResponse = StickerDetail[];
```

---

## `searchSticker`

Tìm kiếm nhãn dán nâng cao theo từ khóa.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/search</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.searchSticker(keyword: string, limit: number = 50)
// Hoặc gọi phẳng (Flat Alias):
await api.searchSticker(keyword: string, limit: number = 50)
```

### Tham số

- `keyword`: Keyword to search stickers
- `limit`: Limit of stickers to return (default: 50)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SearchStickerResponse = StickerBasic[];
```

---
