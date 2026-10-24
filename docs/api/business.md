# Zalo Business, Nhãn & Danh mục (Business)

> Namespace: `api.business` (hoặc gọi trực tiếp `api.<methodName>`) — **26 API**

Quản lý nhãn phân loại (Labels), tin nhắn nhanh (Quick Messages), trả lời tự động (Auto Reply), Danh mục sản phẩm (Catalog) và Ngân hàng.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`addQuickMessage`](#addquickmessage) | `GET` | `/api/quickmessage/create` | Add quick message |
| [`createAutoReply`](#createautoreply) | `POST` | `/api/autoreply/create` | Create auto reply |
| [`createBankAccount`](#createbankaccount) | `POST` | `/api/transfer/create` | Create bank account - `-263` - Bank account already exists - `810` - Internal Zalo error, might be invalid input |
| [`createCatalog`](#createcatalog) | `POST` | `/api/prodcatalog/catalog/create` | Create catalog? |
| [`createProductCatalog`](#createproductcatalog) | `POST` | `/api/prodcatalog/product/create` | Create product catalog? |
| [`deleteAutoReply`](#deleteautoreply) | `POST` | `/api/autoreply/delete` | Delete auto reply |
| [`deleteBankAccount`](#deletebankaccount) | `POST` | `/api/transfer/delete` | Delete bank account - `114` - Invalid params - `-265` - Bank account not exists - `810` Internal Zalo error, maybe you're trying to delete a default bank account |
| [`deleteCatalog`](#deletecatalog) | `POST` | `/api/prodcatalog/catalog/delete` | Delete catalog? |
| [`deleteProductCatalog`](#deleteproductcatalog) | `POST` | `/api/prodcatalog/product/mdelete` | Delete product catalog? |
| [`getAutoReplyList`](#getautoreplylist) | `GET` | `/api/autoreply/list` | Get auto reply list |
| [`getBizAccount`](#getbizaccount) | `POST` | `/api/social/friend/get-bizacc` | Get biz account |
| [`getCatalogList`](#getcataloglist) | `POST` | `/api/prodcatalog/catalog/list` | Get catalog list? |
| [`getLabels`](#getlabels) | `GET` | `/api/convlabel/get` | Get all labels |
| [`getListBank`](#getlistbank) | `GET` | `/api/transfer/conf` | Get list bank |
| [`getListBankAccount`](#getlistbankaccount) | `GET` | `/api/transfer/list` | Get list bank accounts - `114` - Invalid params |
| [`getProductCatalogList`](#getproductcataloglist) | `POST` | `/api/prodcatalog/product/list` | Get product catalog list? |
| [`getQuickMessageList`](#getquickmessagelist) | `GET` | `/api/quickmessage/list` | Get quick message list |
| [`registerCatalog`](#registercatalog) | `POST` | `/api/prodcatalog/catalog/register` | Register catalog? |
| [`removeQuickMessage`](#removequickmessage) | `GET` | `/api/quickmessage/delete` | Remove quick message |
| [`updateAutoReply`](#updateautoreply) | `POST` | `/api/autoreply/update` | Update auto reply |
| [`updateBankAccount`](#updatebankaccount) | `POST` | `/api/transfer/update` | Update bank account |
| [`updateCatalog`](#updatecatalog) | `POST` | `/api/prodcatalog/catalog/update` | Update catalog? |
| [`updateLabels`](#updatelabels) | `POST` | `/api/convlabel/update` | Update labels |
| [`updateProductCatalog`](#updateproductcatalog) | `POST` | `/api/prodcatalog/product/update` | Update product catalog? |
| [`updateQuickMessage`](#updatequickmessage) | `GET` | `/api/quickmessage/update` | Update quick message |
| [`uploadProductPhoto`](#uploadproductphoto) | `POST` | `/api/product/upload/photo` | Upload product photo for api quick message, product catalog or custom local storage |

---

## `addQuickMessage`

Add quick message

- **Endpoint**: `GET /api/quickmessage/create`
- **Domain call**: `api.business.addQuickMessage(addPayload: AddQuickMessagePayload)`
- **Alias phẳng**: `api.addQuickMessage(addPayload: AddQuickMessagePayload)`

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

Create auto reply

- **Endpoint**: `POST /api/autoreply/create`
- **Domain call**: `api.business.createAutoReply(payload: CreateAutoReplyPayload)`
- **Alias phẳng**: `api.createAutoReply(payload: CreateAutoReplyPayload)`

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

Create bank account - `-263` - Bank account already exists - `810` - Internal Zalo error, might be invalid input

- **Endpoint**: `POST /api/transfer/create`
- **Domain call**: `api.business.createBankAccount(payload: CreateBankAccountPayload)`
- **Alias phẳng**: `api.createBankAccount(payload: CreateBankAccountPayload)`

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

Create catalog?

- **Endpoint**: `POST /api/prodcatalog/catalog/create`
- **Domain call**: `api.business.createCatalog(catalogName: string)`
- **Alias phẳng**: `api.createCatalog(catalogName: string)`

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

Create product catalog?

- **Endpoint**: `POST /api/prodcatalog/product/create`
- **Domain call**: `api.business.createProductCatalog(payload: CreateProductCatalogPayload)`
- **Alias phẳng**: `api.createProductCatalog(payload: CreateProductCatalogPayload)`

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

Delete auto reply

- **Endpoint**: `POST /api/autoreply/delete`
- **Domain call**: `api.business.deleteAutoReply(id: number)`
- **Alias phẳng**: `api.deleteAutoReply(id: number)`

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

Delete bank account - `114` - Invalid params - `-265` - Bank account not exists - `810` Internal Zalo error, maybe you're trying to delete a default bank account

- **Endpoint**: `POST /api/transfer/delete`
- **Domain call**: `api.business.deleteBankAccount(payload: DeleteBankAccountPayload)`
- **Alias phẳng**: `api.deleteBankAccount(payload: DeleteBankAccountPayload)`

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

Delete catalog?

- **Endpoint**: `POST /api/prodcatalog/catalog/delete`
- **Domain call**: `api.business.deleteCatalog(catalogId: string)`
- **Alias phẳng**: `api.deleteCatalog(catalogId: string)`

### Tham số

- `catalogId`: catalog id

### Kiểu dữ liệu (TypeScript Types)

```ts
export type DeleteCatalogResponse = "";
```

---

## `deleteProductCatalog`

Delete product catalog?

- **Endpoint**: `POST /api/prodcatalog/product/mdelete`
- **Domain call**: `api.business.deleteProductCatalog(payload: DeleteProductCatalogPayload)`
- **Alias phẳng**: `api.deleteProductCatalog(payload: DeleteProductCatalogPayload)`

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

Get auto reply list

- **Endpoint**: `GET /api/autoreply/list`
- **Domain call**: `api.business.getAutoReplyList()`
- **Alias phẳng**: `api.getAutoReplyList()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetAutoReplyListResponse = {
    item: AutoReplyItem[];
    version: number;
};
```

---

## `getBizAccount`

Get biz account

- **Endpoint**: `POST /api/social/friend/get-bizacc`
- **Domain call**: `api.business.getBizAccount(friendId: string)`
- **Alias phẳng**: `api.getBizAccount(friendId: string)`

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

Get catalog list?

- **Endpoint**: `POST /api/prodcatalog/catalog/list`
- **Domain call**: `api.business.getCatalogList(payload?: GetCatalogListPayload)`
- **Alias phẳng**: `api.getCatalogList(payload?: GetCatalogListPayload)`

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

Get all labels

- **Endpoint**: `GET /api/convlabel/get`
- **Domain call**: `api.business.getLabels()`
- **Alias phẳng**: `api.getLabels()`

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

Get list bank

- **Endpoint**: `GET /api/transfer/conf`
- **Domain call**: `api.business.getListBank()`
- **Alias phẳng**: `api.getListBank()`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetListBankResponse = {
    banks: BankInfo[];
};
```

---

## `getListBankAccount`

Get list bank accounts - `114` - Invalid params

- **Endpoint**: `GET /api/transfer/list`
- **Domain call**: `api.business.getListBankAccount(page: number = 0, limit: number = 20)`
- **Alias phẳng**: `api.getListBankAccount(page: number = 0, limit: number = 20)`

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

Get product catalog list?

- **Endpoint**: `POST /api/prodcatalog/product/list`
- **Domain call**: `api.business.getProductCatalogList(payload: GetProductCatalogListPayload)`
- **Alias phẳng**: `api.getProductCatalogList(payload: GetProductCatalogListPayload)`

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

Get quick message list

- **Endpoint**: `GET /api/quickmessage/list`
- **Domain call**: `api.business.getQuickMessageList()`
- **Alias phẳng**: `api.getQuickMessageList()`

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

Register catalog?

- **Endpoint**: `POST /api/prodcatalog/catalog/register`
- **Domain call**: `api.business.registerCatalog(enable: boolean)`
- **Alias phẳng**: `api.registerCatalog(enable: boolean)`

### Tham số

- `enable`: enable or disable catalog

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RegisterCatalogResponse = "";
```

---

## `removeQuickMessage`

Remove quick message

- **Endpoint**: `GET /api/quickmessage/delete`
- **Domain call**: `api.business.removeQuickMessage(itemIds: number | number[])`
- **Alias phẳng**: `api.removeQuickMessage(itemIds: number | number[])`

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

Update auto reply

- **Endpoint**: `POST /api/autoreply/update`
- **Domain call**: `api.business.updateAutoReply(payload: UpdateAutoReplyPayload)`
- **Alias phẳng**: `api.updateAutoReply(payload: UpdateAutoReplyPayload)`

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

Update bank account

- **Endpoint**: `POST /api/transfer/update`
- **Domain call**: `api.business.updateBankAccount(payload: UpdateBankAccountPayload)`
- **Alias phẳng**: `api.updateBankAccount(payload: UpdateBankAccountPayload)`

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

Update catalog?

- **Endpoint**: `POST /api/prodcatalog/catalog/update`
- **Domain call**: `api.business.updateCatalog(payload: UpdateCatalogPayload)`
- **Alias phẳng**: `api.updateCatalog(payload: UpdateCatalogPayload)`

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

Update labels

- **Endpoint**: `POST /api/convlabel/update`
- **Domain call**: `api.business.updateLabels(payload: UpdateLabelsPayload)`
- **Alias phẳng**: `api.updateLabels(payload: UpdateLabelsPayload)`

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

Update product catalog?

- **Endpoint**: `POST /api/prodcatalog/product/update`
- **Domain call**: `api.business.updateProductCatalog(payload: UpdateProductCatalogPayload)`
- **Alias phẳng**: `api.updateProductCatalog(payload: UpdateProductCatalogPayload)`

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

Update quick message

- **Endpoint**: `GET /api/quickmessage/update`
- **Domain call**: `api.business.updateQuickMessage(updatePayload: UpdateQuickMessagePayload, itemId: number)`
- **Alias phẳng**: `api.updateQuickMessage(updatePayload: UpdateQuickMessagePayload, itemId: number)`

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

Upload product photo for api quick message, product catalog or custom local storage

- **Endpoint**: `POST /api/product/upload/photo`
- **Domain call**: `api.business.uploadProductPhoto(payload: UploadProductPhotoPayload)`
- **Alias phẳng**: `api.uploadProductPhoto(payload: UploadProductPhotoPayload)`

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
