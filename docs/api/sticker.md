# Nhãn dán & Biểu cảm (Sticker)

> Namespace: `api.sticker` (hoặc gọi trực tiếp `api.<methodName>`) — **10 API**

Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh và nhãn dán cá nhân hóa.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`getPersonalizedStickerList`](#getpersonalizedstickerlist) | `GET` | `/api/message/sticker/personalized/list` | Lấy danh sách Sticker cá nhân hóa của tài khoản (command 11745) |
| [`getStickerCategoriesV2`](#getstickercategoriesv2) | `GET` | `/api/message/sticker/category/list/v2` | Lấy danh sách danh mục bộ nhãn dán (Sticker Categories V2 - command 12020) |
| [`getStickerCategoryData`](#getstickercategorydata) | `GET` | `/api/message/sticker/category/detail` | Lấy thông tin chi tiết một bộ nhãn dán theo `cid` (command 11156) |
| [`getStickerCategoryDetail`](#getstickercategorydetail) | `GET` | `/api/message/sticker/category/sticker_detail` | Get sticker category detail |
| [`getStickerHello`](#getstickerhello) | `GET` | `/api/message/sticker/suggestion` | Lấy danh sách Sticker chào hỏi gợi ý khi bắt đầu trò chuyện mới (command 11751) |
| [`getStickerSuggestKeywords`](#getstickersuggestkeywords) | `GET` | `/api/message/sticker/suggest/keywords` | Lấy bộ từ khóa gợi ý Sticker tự động khi gõ tin nhắn (command 11740) |
| [`getStickerSuggestion`](#getstickersuggestion) | `GET` | `/api/message/sticker/suggest/stickers` | Gợi ý Sticker/GIF theo từ khóa đang nhập (command 11741) |
| [`getStickers`](#getstickers) | `GET` | `/api/message/sticker` | Get stickers by keyword |
| [`getStickersDetail`](#getstickersdetail) | `GET` | `/api/message/sticker/sticker_detail` | Get stickers detail by sticker IDs |
| [`searchSticker`](#searchsticker) | `GET` | `/api/message/sticker/search` | Search stickers |

---

## `getPersonalizedStickerList`

Lấy danh sách Sticker cá nhân hóa của tài khoản (command 11745)

- **Endpoint**: `GET /api/message/sticker/personalized/list`
- **Domain call**: `api.sticker.getPersonalizedStickerList()`
- **Alias phẳng**: `api.getPersonalizedStickerList()`

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

- **Endpoint**: `GET /api/message/sticker/category/list/v2`
- **Domain call**: `api.sticker.getStickerCategoriesV2()`
- **Alias phẳng**: `api.getStickerCategoriesV2()`

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

- **Endpoint**: `GET /api/message/sticker/category/detail`
- **Domain call**: `api.sticker.getStickerCategoryData(cid: number)`
- **Alias phẳng**: `api.getStickerCategoryData(cid: number)`

### Tham số

- `cid`: ID bộ nhãn dán (Category ID)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetStickerCategoryDataResponse = StickerCategoryV2Item;
```

---

## `getStickerCategoryDetail`

Get sticker category detail

- **Endpoint**: `GET /api/message/sticker/category/sticker_detail`
- **Domain call**: `api.sticker.getStickerCategoryDetail(cateId: number)`
- **Alias phẳng**: `api.getStickerCategoryDetail(cateId: number)`

### Tham số

- `cateId`: Sticker category ID

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetStickerCategoryDetailResponse = StickerDetail[];
```

---

## `getStickerHello`

Lấy danh sách Sticker chào hỏi gợi ý khi bắt đầu trò chuyện mới (command 11751)

- **Endpoint**: `GET /api/message/sticker/suggestion`
- **Domain call**: `api.sticker.getStickerHello()`
- **Alias phẳng**: `api.getStickerHello()`

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

- **Endpoint**: `GET /api/message/sticker/suggest/keywords`
- **Domain call**: `api.sticker.getStickerSuggestKeywords()`
- **Alias phẳng**: `api.getStickerSuggestKeywords()`

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

- **Endpoint**: `GET /api/message/sticker/suggest/stickers`
- **Domain call**: `api.sticker.getStickerSuggestion(options: GetStickerSuggestionOptions | string)`
- **Alias phẳng**: `api.getStickerSuggestion(options: GetStickerSuggestionOptions | string)`

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

Get stickers by keyword

- **Endpoint**: `GET /api/message/sticker`
- **Domain call**: `api.sticker.getStickers(keyword: string)`
- **Alias phẳng**: `api.getStickers(keyword: string)`

### Tham số

- `keyword`: Keyword to search for

---

## `getStickersDetail`

Get stickers detail by sticker IDs

- **Endpoint**: `GET /api/message/sticker/sticker_detail`
- **Domain call**: `api.sticker.getStickersDetail(stickerIds: number | number[])`
- **Alias phẳng**: `api.getStickersDetail(stickerIds: number | number[])`

### Tham số

- `stickerIds`: Sticker IDs to search for

### Kiểu dữ liệu (TypeScript Types)

```ts
export type StickerDetailResponse = StickerDetail[];
```

---

## `searchSticker`

Search stickers

- **Endpoint**: `GET /api/message/sticker/search`
- **Domain call**: `api.sticker.searchSticker(keyword: string, limit: number = 50)`
- **Alias phẳng**: `api.searchSticker(keyword: string, limit: number = 50)`

### Tham số

- `keyword`: Keyword to search stickers
- `limit`: Limit of stickers to return (default: 50)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SearchStickerResponse = StickerBasic[];
```

---
