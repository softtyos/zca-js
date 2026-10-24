---
title: "Zalo Business, Nhãn & Danh mục (Business) (api.business) - 26 APIs"
description: "Quản lý nhãn phân loại (Labels), tin nhắn nhanh (Quick Messages), trả lời tự động (Auto Reply), Danh mục sản phẩm (Catalog) và Ngân hàng. Tra cứu chi tiết 26 phương thức thuộc phân hệ api.business trong bộ SDK @softtynet/zca-js."
---

# 💼 Zalo Business, Nhãn & Danh mục (Business)

> Namespace: `api.business` (hoặc gọi trực tiếp `api.<methodName>`) — **26 API nguyên bản**

Quản lý nhãn phân loại (Labels), tin nhắn nhanh (Quick Messages), trả lời tự động (Auto Reply), Danh mục sản phẩm (Catalog) và Ngân hàng.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`addQuickMessage`](#addquickmessage) | `GET` | `/api/quickmessage/create` | Thêm mẫu Tin nhắn nhanh (Quick Message) mới cho tài khoản Zalo Business. |
| [`createAutoReply`](#createautoreply) | `POST` | `/api/autoreply/create` | Tạo kịch bản Trả lời tự động (Auto Reply) theo khung giờ cho Zalo Business. |
| [`createBankAccount`](#createbankaccount) | `POST` | `/api/transfer/create` | Thêm thông tin tài khoản ngân hàng mới vào danh bạ ngân hàng. |
| [`createCatalog`](#createcatalog) | `POST` | `/api/prodcatalog/catalog/create` | Tạo Danh mục sản phẩm (Catalog) mới cho Zalo Business. |
| [`createProductCatalog`](#createproductcatalog) | `POST` | `/api/prodcatalog/product/create` | Thêm sản phẩm mới vào Danh mục sản phẩm (Product Catalog). |
| [`deleteAutoReply`](#deleteautoreply) | `POST` | `/api/autoreply/delete` | Xóa một kịch bản Trả lời tự động. |
| [`deleteBankAccount`](#deletebankaccount) | `POST` | `/api/transfer/delete` | Xóa một tài khoản ngân hàng đã lưu. |
| [`deleteCatalog`](#deletecatalog) | `POST` | `/api/prodcatalog/catalog/delete` | Xóa một Danh mục sản phẩm (Catalog). |
| [`deleteProductCatalog`](#deleteproductcatalog) | `POST` | `/api/prodcatalog/product/mdelete` | Xóa một hoặc nhiều sản phẩm khỏi Danh mục sản phẩm. |
| [`getAutoReplyList`](#getautoreplylist) | `GET` | `/api/autoreply/list` | Lấy danh sách các kịch bản Trả lời tự động của tài khoản. |
| [`getBizAccount`](#getbizaccount) | `POST` | `/api/social/friend/get-bizacc` | Lấy thông tin cấu hình tài khoản Zalo Business (ZBusiness). |
| [`getCatalogList`](#getcataloglist) | `POST` | `/api/prodcatalog/catalog/list` | Lấy danh sách các Danh mục sản phẩm (Catalogs) của tài khoản. |
| [`getLabels`](#getlabels) | `GET` | `/api/convlabel/get` | Lấy toàn bộ danh sách Nhãn phân loại hội thoại (Conversation Labels) và các hội thoại được gắn nhãn. |
| [`getListBank`](#getlistbank) | `GET` | `/api/transfer/conf` | Lấy danh sách mã ngân hàng (BIN / NAPAS) được Zalo hỗ trợ. |
| [`getListBankAccount`](#getlistbankaccount) | `GET` | `/api/transfer/list` | Lấy danh sách các tài khoản ngân hàng đã lưu của người dùng. |
| [`getProductCatalogList`](#getproductcataloglist) | `POST` | `/api/prodcatalog/product/list` | Lấy danh sách các sản phẩm nằm trong một Danh mục sản phẩm (Catalog). |
| [`getQuickMessageList`](#getquickmessagelist) | `GET` | `/api/quickmessage/list` | Lấy danh sách các mẫu Tin nhắn nhanh (Quick Messages) đã tạo. |
| [`registerCatalog`](#registercatalog) | `POST` | `/api/prodcatalog/catalog/register` | Đăng ký kích hoạt tính năng Danh mục sản phẩm (Catalog) cho tài khoản. |
| [`removeQuickMessage`](#removequickmessage) | `GET` | `/api/quickmessage/delete` | Xóa một hoặc nhiều mẫu Tin nhắn nhanh. |
| [`updateAutoReply`](#updateautoreply) | `POST` | `/api/autoreply/update` | Cập nhật nội dung và thời gian hoạt động của kịch bản Trả lời tự động. |
| [`updateBankAccount`](#updatebankaccount) | `POST` | `/api/transfer/update` | Cập nhật thông tin tài khoản ngân hàng đã lưu. |
| [`updateCatalog`](#updatecatalog) | `POST` | `/api/prodcatalog/catalog/update` | Cập nhật tên hoặc ảnh của Danh mục sản phẩm. |
| [`updateLabels`](#updatelabels) | `POST` | `/api/convlabel/update` | Cập nhật danh sách Nhãn phân loại (Labels) và gán nhãn cho các cuộc trò chuyện. |
| [`updateProductCatalog`](#updateproductcatalog) | `POST` | `/api/prodcatalog/product/update` | Cập nhật thông tin chi tiết, giá bán và hình ảnh của sản phẩm trong Danh mục. |
| [`updateQuickMessage`](#updatequickmessage) | `GET` | `/api/quickmessage/update` | Chỉnh sửa phím tắt và nội dung của mẫu Tin nhắn nhanh. |
| [`uploadProductPhoto`](#uploadproductphoto) | `POST` | `/api/product/upload/photo` | Tải ảnh sản phẩm lên máy chủ Zalo phục vụ cho Product Catalog hoặc Quick Message. |

---

## `addQuickMessage`

Thêm mẫu Tin nhắn nhanh (Quick Message) mới cho tài khoản Zalo Business.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/quickmessage/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.addQuickMessage(addPayload: AddQuickMessagePayload)
// Hoặc gọi phẳng (Flat Alias):
await api.addQuickMessage(addPayload: AddQuickMessagePayload)
```

### Tham số

- `addPayload`: - The payload containing data to add the quick message

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddQuickMessagePayload = {
    keyword: string;
    title: string;
    media?: AttachmentSource;
};

export type AddQuickMessageResponse = {
    item: QuickMessage;
    version: number;
};
```

---

## `createAutoReply`

Tạo kịch bản Trả lời tự động (Auto Reply) theo khung giờ cho Zalo Business.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/autoreply/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.createAutoReply(payload: CreateAutoReplyPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.createAutoReply(payload: CreateAutoReplyPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateAutoReplyPayload = {
    content: string;
    isEnable: boolean;
    startTime: number;
    endTime: number;
    scope: AutoReplyScope;
    uids?: string | string[];
};

export type CreateAutoReplyResponse = {
    item: AutoReplyItem;
    version: number;
};
```

---

## `createBankAccount`

Thêm thông tin tài khoản ngân hàng mới vào danh bạ ngân hàng.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/transfer/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.createBankAccount(payload: CreateBankAccountPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.createBankAccount(payload: CreateBankAccountPayload)
```

### Tham số

- `payload`: The payload containing the bank account information

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateBankAccountPayload = {
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank: string;
};

export type CreateBankAccountResponse = BankAccount;
```

---

## `createCatalog`

Tạo Danh mục sản phẩm (Catalog) mới cho Zalo Business.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/catalog/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.createCatalog(catalogName: string)
// Hoặc gọi phẳng (Flat Alias):
await api.createCatalog(catalogName: string)
```

### Tham số

- `catalogName`: catalog name

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateCatalogResponse = {
    item: CatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
```

---

## `createProductCatalog`

Thêm sản phẩm mới vào Danh mục sản phẩm (Product Catalog).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/product/create</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.createProductCatalog(payload: CreateProductCatalogPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.createProductCatalog(payload: CreateProductCatalogPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CreateProductCatalogPayload = {
    catalogId: string;

    productName: string;
    price: string;
    description: string;

    /**
     * Upto 5 media files are allowed, will be ignored if product_photos is provided
     */
    files?: AttachmentSource[];
    /**
     * List of product photo URLs, upto 5
     *
     * You can manually get the URL using `uploadProductPhoto` api
     */
    product_photos?: string[];
};

export type CreateProductCatalogResponse = {
    item: ProductCatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
```

---

## `deleteAutoReply`

Xóa một kịch bản Trả lời tự động.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/autoreply/delete</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.deleteAutoReply(id: number)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteAutoReply(id: number)
```

### Tham số

- `id`: id of auto reply

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteAutoReplyResponse = {
    item: number;
    version: number;
};
```

---

## `deleteBankAccount`

Xóa một tài khoản ngân hàng đã lưu.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/transfer/delete</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.deleteBankAccount(payload: DeleteBankAccountPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteBankAccount(payload: DeleteBankAccountPayload)
```

### Tham số

- `payload`: The payload containing the bank account information to delete

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteBankAccountPayload = {
    accountId: number;
    isDefault: boolean;
};

export type DeleteBankAccountResponse = {
    hasMore: boolean;
    total: number;
    myBanks: BankAccount[];
};
```

---

## `deleteCatalog`

Xóa một Danh mục sản phẩm (Catalog).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/catalog/delete</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.deleteCatalog(catalogId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteCatalog(catalogId: string)
```

### Tham số

- `catalogId`: catalog id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteCatalogResponse = "";
```

---

## `deleteProductCatalog`

Xóa một hoặc nhiều sản phẩm khỏi Danh mục sản phẩm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/product/mdelete</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.deleteProductCatalog(payload: DeleteProductCatalogPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.deleteProductCatalog(payload: DeleteProductCatalogPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteProductCatalogPayload = {
    productIds: string | string[];
    catalogId: string;
};

export type DeleteProductCatalogResponse = {
    item: number[];
    version_ls_catalog: number;
    version_catalog: number;
};
```

---

## `getAutoReplyList`

Lấy danh sách các kịch bản Trả lời tự động của tài khoản.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/autoreply/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getAutoReplyList()
// Hoặc gọi phẳng (Flat Alias):
await api.getAutoReplyList()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAutoReplyListResponse = {
    item: AutoReplyItem[];
    version: number;
};
```

---

## `getBizAccount`

Lấy thông tin cấu hình tài khoản Zalo Business (ZBusiness).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/social/friend/get-bizacc</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getBizAccount(friendId: string)
// Hoặc gọi phẳng (Flat Alias):
await api.getBizAccount(friendId: string)
```

### Tham số

- `friendId`: The friend ID to get biz account

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetBizAccountResponse = {
    biz?: {
        desc: string | null;
        cate: BusinessCategory;
        addr: string;
        website: string;
        email: string;
    };
    setting_start_page?: {
        enable_biz_label: number;
        enable_cate: number;
        enable_add: number;
        cta_profile: number;
        /**
         * Relative path used to build the catalog URL.
         *
         * Example: https://catalog.zalo.me/${cta_catalog}
         */
        cta_catalog: string | null;
    } | null;
    pkgId: number;
};
```

---

## `getCatalogList`

Lấy danh sách các Danh mục sản phẩm (Catalogs) của tài khoản.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/catalog/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getCatalogList(payload?: GetCatalogListPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.getCatalogList(payload?: GetCatalogListPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetCatalogListPayload = {
    /**
     * Number of items to retrieve (default: 20)
     */
    limit?: number;
    lastProductId?: number;
    /**
     * Page number (default: 0)
     */
    page?: number;
};

export type GetCatalogListResponse = {
    items: CatalogItem[];
    version: number;
    has_more: number;
};
```

---

## `getLabels`

Lấy toàn bộ danh sách Nhãn phân loại hội thoại (Conversation Labels) và các hội thoại được gắn nhãn.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/convlabel/get</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getLabels()
// Hoặc gọi phẳng (Flat Alias):
await api.getLabels()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetLabelsResponse = {
    labelData: LabelData[];
    version: number;
    lastUpdateTime: number;
};

type RawResponseType = Omit<GetLabelsResponse, "labelData"> & {
    labelData: string;
};
```

---

## `getListBank`

Lấy danh sách mã ngân hàng (BIN / NAPAS) được Zalo hỗ trợ.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/transfer/conf</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getListBank()
// Hoặc gọi phẳng (Flat Alias):
await api.getListBank()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetListBankResponse = {
    banks: BankInfo[];
};
```

---

## `getListBankAccount`

Lấy danh sách các tài khoản ngân hàng đã lưu của người dùng.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/transfer/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getListBankAccount(page: number = 0, limit: number = 20)
// Hoặc gọi phẳng (Flat Alias):
await api.getListBankAccount(page: number = 0, limit: number = 20)
```

### Tham số

- `page`: Page number (default: 0)
- `limit`: Number of items to retrieve (default: 20)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetListBankAccountResponse = {
    hasMore: boolean;
    total: number;
    myBanks: BankAccount[];
};
```

---

## `getProductCatalogList`

Lấy danh sách các sản phẩm nằm trong một Danh mục sản phẩm (Catalog).

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/product/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getProductCatalogList(payload: GetProductCatalogListPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.getProductCatalogList(payload: GetProductCatalogListPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetProductCatalogListPayload = {
    catalogId: string;
    /**
     * Number of items to retrieve (default: 100)
     */
    limit?: number;
    versionCatalog?: number;
    lastProductId?: string;
    /**
     * Page number (default: 0)
     */
    page?: number;
};

export type GetProductCatalogListResponse = {
    items: ProductCatalogItem[];
    version: number;
    has_more: number;
};
```

---

## `getQuickMessageList`

Lấy danh sách các mẫu Tin nhắn nhanh (Quick Messages) đã tạo.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/quickmessage/list</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.getQuickMessageList()
// Hoặc gọi phẳng (Flat Alias):
await api.getQuickMessageList()
```

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetQuickMessageListResponse = {
    cursor: number;
    version: number;
    items: QuickMessage[];
};
```

---

## `registerCatalog`

Đăng ký kích hoạt tính năng Danh mục sản phẩm (Catalog) cho tài khoản.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/catalog/register</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.registerCatalog(enable: boolean)
// Hoặc gọi phẳng (Flat Alias):
await api.registerCatalog(enable: boolean)
```

### Tham số

- `enable`: enable or disable catalog

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RegisterCatalogResponse = "";
```

---

## `removeQuickMessage`

Xóa một hoặc nhiều mẫu Tin nhắn nhanh.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/quickmessage/delete</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.removeQuickMessage(itemIds: number | number[])
// Hoặc gọi phẳng (Flat Alias):
await api.removeQuickMessage(itemIds: number | number[])
```

### Tham số

- `itemIds`: - The id(s) of the quick message(s) to remove (number or number[])

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveQuickMessageResponse = {
    itemIds: number[];
    version: number;
};
```

---

## `updateAutoReply`

Cập nhật nội dung và thời gian hoạt động của kịch bản Trả lời tự động.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/autoreply/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.updateAutoReply(payload: UpdateAutoReplyPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.updateAutoReply(payload: UpdateAutoReplyPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateAutoReplyPayload = {
    id: number;
    content: string;
    isEnable: boolean;
    startTime: number;
    endTime: number;
    scope: AutoReplyScope;
    uids?: string | string[];
};

export type UpdateAutoReplyResponse = {
    item: AutoReplyItem;
    version: number;
};
```

---

## `updateBankAccount`

Cập nhật thông tin tài khoản ngân hàng đã lưu.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/transfer/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.updateBankAccount(payload: UpdateBankAccountPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.updateBankAccount(payload: UpdateBankAccountPayload)
```

### Tham số

- `payload`: The payload containing the bank account information to update

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateBankAccountPayload = {
    accountId: number;
    binBank: BinBankCard;
    numAccBank: string;
    nameAccBank: string;
};

export type UpdateBankAccountResponse = BankAccount;
```

---

## `updateCatalog`

Cập nhật tên hoặc ảnh của Danh mục sản phẩm.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/catalog/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.updateCatalog(payload: UpdateCatalogPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.updateCatalog(payload: UpdateCatalogPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateCatalogPayload = {
    catalogId: string;
    catalogName: string;
};

export type UpdateCatalogResponse = {
    item: CatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
```

---

## `updateLabels`

Cập nhật danh sách Nhãn phân loại (Labels) và gán nhãn cho các cuộc trò chuyện.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/convlabel/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.updateLabels(payload: UpdateLabelsPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.updateLabels(payload: UpdateLabelsPayload)
```

### Tham số

- `label`: label data

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateLabelsPayload = {
    labelData: LabelData[];
    version: number;
};

export type UpdateLabelsResponse = {
    labelData: LabelData[];
    version: number;
    lastUpdateTime: number;
};
```

---

## `updateProductCatalog`

Cập nhật thông tin chi tiết, giá bán và hình ảnh của sản phẩm trong Danh mục.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/prodcatalog/product/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.updateProductCatalog(payload: UpdateProductCatalogPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.updateProductCatalog(payload: UpdateProductCatalogPayload)
```

### Tham số

- `payload`: payload

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateProductCatalogPayload = {
    catalogId: string;

    productId: string;
    productName: string;
    price: string;
    description: string;
    createTime: number;

    /**
     * Upto 5 media files are allowed, will be ignored if product_photos is provided
     */
    files?: AttachmentSource[];
    /**
     * List of product photo URLs, upto 5
     *
     * You can manually get the URL using `uploadProductPhoto` api
     */
    product_photos?: string[];
};

export type UpdateProductCatalogResponse = {
    item: ProductCatalogItem;
    version_ls_catalog: number;
    version_catalog: number;
};
```

---

## `updateQuickMessage`

Chỉnh sửa phím tắt và nội dung của mẫu Tin nhắn nhanh.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">/api/quickmessage/update</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.updateQuickMessage(updatePayload: UpdateQuickMessagePayload, itemId: number)
// Hoặc gọi phẳng (Flat Alias):
await api.updateQuickMessage(updatePayload: UpdateQuickMessagePayload, itemId: number)
```

### Tham số

- `updatePayload`: - The payload containing data to update the quick message
- `itemId`: - The id of the quick message to update

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateQuickMessagePayload = {
    keyword: string;
    title: string;
    media?: AttachmentSource;
};

export type UpdateQuickMessageResponse = {
    item: QuickMessage;
    version: number;
};
```

---

## `uploadProductPhoto`

Tải ảnh sản phẩm lên máy chủ Zalo phục vụ cho Product Catalog hoặc Quick Message.

<div class="zca-api-meta"><span class="zca-badge-method post">POST</span><span class="zca-endpoint-pill">/api/product/upload/photo</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.business.uploadProductPhoto(payload: UploadProductPhotoPayload)
// Hoặc gọi phẳng (Flat Alias):
await api.uploadProductPhoto(payload: UploadProductPhotoPayload)
```

### Tham số

- `payload`: file path or attachment source

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UploadProductPhotoPayload = {
    file: AttachmentSource;
};

export type UploadProductPhotoResponse = {
    normalUrl: string;
    photoId: string;
    finished: number;
    hdUrl: string;
    thumbUrl: string;
    clientFileId: number;
    chunkId: number;
};
```

---
