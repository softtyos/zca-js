---
title: "Nhãn dán, GIF Giphy/Guggy & Hiệu ứng (Sticker) (api.sticker) - 24 APIs"
description: "Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh, kho ảnh động GIF (Giphy, Guggy, Tenor) và hiệu ứng tin nhắn nền (Message Effects). Tra cứu chi tiết 24 phương thức thuộc phân hệ api.sticker trong bộ SDK @softtynet/zca-js."
---

# ✨ Nhãn dán, GIF Giphy/Guggy & Hiệu ứng (Sticker)

> Namespace: `api.sticker` (hoặc gọi trực tiếp `api.<methodName>`) — **24 API nguyên bản**

Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh, kho ảnh động GIF (Giphy, Guggy, Tenor) và hiệu ứng tin nhắn nền (Message Effects).

## Danh sách nhanh

| Phương thức                                                       | HTTP  | Endpoint Zalo                                  | Mô tả                                                                                      |
| :---------------------------------------------------------------- | :---: | :--------------------------------------------- | :----------------------------------------------------------------------------------------- |
| [`getAIStickerList`](#getaistickerlist)                           | `GET` | `/api/message/sticker/ai/list`                 | Lấy danh sách Sticker AI của người dùng (command 12190)                                    |
| [`getDefaultGuggyGifs`](#getdefaultguggygifs)                     | `GET` | `/api/message/guggy/default`                   | Lấy danh sách ảnh động Guggy GIF mặc định (command 11749)                                  |
| [`getGifCategories`](#getgifcategories)                           | `GET` | `/api/message/giphy/cates`                     | Lấy danh sách danh mục ảnh động Giphy GIF (command 11294)                                  |
| [`getGifDictionaries`](#getgifdictionaries)                       | `GET` | `/api/message/giphy/dicts`                     | Lấy danh sách từ điển ảnh động Giphy GIF (command 11298)                                   |
| [`getGifsByCategory`](#getgifsbycategory)                         | `GET` | `/api/message/giphy/gifs`                      | Lấy danh sách ảnh động Giphy GIF theo ID danh mục (command 11295)                          |
| [`getGifsByDictionary`](#getgifsbydictionary)                     | `GET` | `/api/message/giphy/gifsbydict`                | Lấy danh sách ảnh động Giphy GIF theo ID từ điển (command 11299)                           |
| [`getMessageEffectById`](#getmessageeffectbyid)                   | `GET` | `/api/message/effect/get`                      | Lấy chi tiết một hiệu ứng tin nhắn theo ID và kích thước (command 11743)                   |
| [`getMessageEffects`](#getmessageeffects)                         | `GET` | `/api/message/effects`                         | Lấy thông tin hiệu ứng tin nhắn theo danh sách ID (command 11742)                          |
| [`getPersonalizedStickerList`](#getpersonalizedstickerlist)       | `GET` | `/api/message/sticker/personalized/list`       | Lấy danh sách Sticker cá nhân hóa của tài khoản (command 11745)                            |
| [`getRecommendedStickers`](#getrecommendedstickers)               | `GET` | `/api/message/sticker/recommended`             | Lấy danh sách các bộ Sticker được Zalo đề xuất (command 11748)                             |
| [`getStickerCategoriesV2`](#getstickercategoriesv2)               | `GET` | `/api/message/sticker/category/list/v2`        | Lấy danh sách danh mục bộ nhãn dán (Sticker Categories V2 - command 12020)                 |
| [`getStickerCategoryData`](#getstickercategorydata)               | `GET` | `/api/message/sticker/category/detail`         | Lấy thông tin chi tiết một bộ nhãn dán theo `cid` (command 11156)                          |
| [`getStickerCategoryDetail`](#getstickercategorydetail)           | `GET` | `/api/message/sticker/category/sticker_detail` | Lấy danh sách toàn bộ nhãn dán nằm trong một bộ nhãn dán (Category/Pack ID).               |
| [`getStickerHello`](#getstickerhello)                             | `GET` | `/api/message/sticker/suggestion`              | Lấy danh sách Sticker chào hỏi gợi ý khi bắt đầu trò chuyện mới (command 11751)            |
| [`getStickerSuggestKeywords`](#getstickersuggestkeywords)         | `GET` | `/api/message/sticker/suggest/keywords`        | Lấy bộ từ khóa gợi ý Sticker tự động khi gõ tin nhắn (command 11740)                       |
| [`getStickerSuggestion`](#getstickersuggestion)                   | `GET` | `/api/message/sticker/suggest/stickers`        | Gợi ý Sticker/GIF theo từ khóa đang nhập (command 11741)                                   |
| [`getStickers`](#getstickers)                                     | `GET` | `/api/message/sticker`                         | Tìm kiếm danh sách ID nhãn dán theo từ khóa tiếng Việt/tiếng Anh.                          |
| [`getStickersDetail`](#getstickersdetail)                         | `GET` | `/api/message/sticker/sticker_detail`          | Lấy thông tin chi tiết (URL ảnh động, loại sticker, cateId) của một hoặc nhiều Sticker ID. |
| [`getTenorStickerMapping`](#gettenorstickermapping)               | `GET` | `/api/message/sticker/tenor/mapping`           | Lấy bảng ánh xạ Tenor sang Sticker Zalo (command 12015)                                    |
| [`getTrendingGifs`](#gettrendinggifs)                             | `GET` | `/api/message/giphy/trending`                  | Lấy danh sách ảnh động Giphy GIF thịnh hành (command 11296)                                |
| [`searchGifs`](#searchgifs)                                       | `GET` | `/api/message/giphy/search`                    | Tìm kiếm ảnh động Giphy GIF theo từ khóa (command 11297)                                   |
| [`searchGuggyGifs`](#searchguggygifs)                             | `GET` | `/api/message/guggy/search`                    | Tìm kiếm ảnh động Guggy GIF theo từ khóa (command 11750)                                   |
| [`searchSticker`](#searchsticker)                                 | `GET` | `/api/message/sticker/search`                  | Tìm kiếm nhãn dán nâng cao theo từ khóa.                                                   |
| [`updatePersonalizedStickerList`](#updatepersonalizedstickerlist) | `GET` | `/api/message/sticker/personalized/update`     | Cập nhật danh sách các bộ Sticker cá nhân hóa của người dùng (command 11746)               |

---

## `getAIStickerList`

Lấy danh sách Sticker AI của người dùng (command 12190)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/ai/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getAIStickerList();
// Hoặc gọi phẳng (Flat Alias):
await api.getAIStickerList();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAIStickerListResponse = Record<string, unknown>;
```

---

## `getDefaultGuggyGifs`

Lấy danh sách ảnh động Guggy GIF mặc định (command 11749)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/guggy/default</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getDefaultGuggyGifs(limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.getDefaultGuggyGifs(limit: number = 10)
```

### Tham số

- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetDefaultGuggyGifsResponse = Record<string, unknown>;
```

---

## `getGifCategories`

Lấy danh sách danh mục ảnh động Giphy GIF (command 11294)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/giphy/cates</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getGifCategories(offset: number = 0, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.getGifCategories(offset: number = 0, limit: number = 10)
```

### Tham số

- `offset`: Vị trí bắt đầu (mặc định `0`)
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGifCategoriesResponse = Record<string, unknown>;
```

---

## `getGifDictionaries`

Lấy danh sách từ điển ảnh động Giphy GIF (command 11298)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/giphy/dicts</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getGifDictionaries(offset: number = 0, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.getGifDictionaries(offset: number = 0, limit: number = 10)
```

### Tham số

- `offset`: Vị trí bắt đầu (mặc định `0`)
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGifDictionariesResponse = Record<string, unknown>;
```

---

## `getGifsByCategory`

Lấy danh sách ảnh động Giphy GIF theo ID danh mục (command 11295)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/giphy/gifs</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getGifsByCategory(cateId: number, offset: number = 0, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.getGifsByCategory(cateId: number, offset: number = 0, limit: number = 10)
```

### Tham số

- `cateId`: ID danh mục GIF
- `offset`: Vị trí bắt đầu (mặc định `0`)
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGifsByCategoryResponse = Record<string, unknown>;
```

---

## `getGifsByDictionary`

Lấy danh sách ảnh động Giphy GIF theo ID từ điển (command 11299)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/giphy/gifsbydict</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getGifsByDictionary(dicId: number, offset: number = 0, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.getGifsByDictionary(dicId: number, offset: number = 0, limit: number = 10)
```

### Tham số

- `dicId`: ID từ điển GIF
- `offset`: Vị trí bắt đầu (mặc định `0`)
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGifsByDictionaryResponse = Record<string, unknown>;
```

---

## `getMessageEffectById`

Lấy chi tiết một hiệu ứng tin nhắn theo ID và kích thước (command 11743)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/effect/get</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getMessageEffectById(id: number | string, size: number = 130)
// Hoặc gọi phẳng (Flat Alias):
await api.getMessageEffectById(id: number | string, size: number = 130)
```

### Tham số

- `id`: ID hiệu ứng
- `size`: Kích thước tài nguyên hiệu ứng (mặc định `130`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetMessageEffectByIdResponse = Record<string, unknown>;
```

---

## `getMessageEffects`

Lấy thông tin hiệu ứng tin nhắn theo danh sách ID (command 11742)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/effects</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getMessageEffects(effectIds: number | number[] = [1])
// Hoặc gọi phẳng (Flat Alias):
await api.getMessageEffects(effectIds: number | number[] = [1])
```

### Tham số

- `effectIds`: ID hoặc danh sách ID hiệu ứng

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetMessageEffectsResponse = Record<string, unknown>;
```

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

## `getRecommendedStickers`

Lấy danh sách các bộ Sticker được Zalo đề xuất (command 11748)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/recommended</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getRecommendedStickers();
// Hoặc gọi phẳng (Flat Alias):
await api.getRecommendedStickers();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetRecommendedStickersResponse = Record<string, unknown>;
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

## `getTenorStickerMapping`

Lấy bảng ánh xạ Tenor sang Sticker Zalo (command 12015)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/tenor/mapping</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getTenorStickerMapping();
// Hoặc gọi phẳng (Flat Alias):
await api.getTenorStickerMapping();
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetTenorStickerMappingResponse = Record<string, unknown>;
```

---

## `getTrendingGifs`

Lấy danh sách ảnh động Giphy GIF thịnh hành (command 11296)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/giphy/trending</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.getTrendingGifs(offset: number = 0, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.getTrendingGifs(offset: number = 0, limit: number = 10)
```

### Tham số

- `offset`: Vị trí bắt đầu (mặc định `0`)
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetTrendingGifsResponse = Record<string, unknown>;
```

---

## `searchGifs`

Tìm kiếm ảnh động Giphy GIF theo từ khóa (command 11297)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/giphy/search</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.searchGifs(keyword: string, offset: number = 0, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.searchGifs(keyword: string, offset: number = 0, limit: number = 10)
```

### Tham số

- `keyword`: Từ khóa tìm kiếm
- `offset`: Vị trí bắt đầu (mặc định `0`)
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SearchGifsResponse = Record<string, unknown>;
```

---

## `searchGuggyGifs`

Tìm kiếm ảnh động Guggy GIF theo từ khóa (command 11750)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/guggy/search</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.searchGuggyGifs(keyword: string, limit: number = 10)
// Hoặc gọi phẳng (Flat Alias):
await api.searchGuggyGifs(keyword: string, limit: number = 10)
```

### Tham số

- `keyword`: Từ khóa tìm kiếm
- `limit`: Số lượng kết quả tối đa (mặc định `10`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SearchGuggyGifsResponse = Record<string, unknown>;
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

## `updatePersonalizedStickerList`

Cập nhật danh sách các bộ Sticker cá nhân hóa của người dùng (command 11746)

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.sticker</span><span class="zca-endpoint-pill">/api/message/sticker/personalized/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.sticker.updatePersonalizedStickerList(stickerCateIds: number[], version: number = 0)
// Hoặc gọi phẳng (Flat Alias):
await api.updatePersonalizedStickerList(stickerCateIds: number[], version: number = 0)
```

### Tham số

- `stickerCateIds`: Danh sách ID danh mục Sticker
- `version`: Phiên bản hiện tại của danh sách

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdatePersonalizedStickerListResponse = Record<string, unknown>;
```

---
