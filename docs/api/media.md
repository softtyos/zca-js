# Kho lưu trữ & Chuyển giọng nói (Media)

> Namespace: `api.media` (hoặc gọi trực tiếp `api.<methodName>`) — **8 API**

Truy vấn Kho Lưu Trữ Ảnh/Video, File, Link của nhóm và Cloud của tôi (Send2Me), cùng chuyển đổi Voice-to-Text AI.

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`getConversationMedia`](#getconversationmedia) | `GET` | `/api/mediastore/list` | Lấy danh sách Kho Lưu Trữ (Ảnh/Video `"media"`, File `"file"`, hoặc Link `"link"`) trong hội thoại nhóm (command 11841) |
| [`getMediaStorePreview`](#getmediastorepreview) | `POST` | `/api/mediastore/preview` | Lấy danh sách xem trước nhanh Kho Lưu Trữ (Ảnh/Video, File, Link) của nhóm (command 11843) |
| [`getPersonalMedia`](#getpersonalmedia) | `GET` | `/api/media/oneone/list` | Lấy danh sách Kho Lưu Trữ Ảnh/Video (`"media"`), File (`"file"`), hoặc Link (`"link"`) trong Cloud của tôi (Send2Me) (command 12220) |
| [`getPersonalMediaPreview`](#getpersonalmediapreview) | `POST` | `/api/media/oneone/preview` | Lấy danh sách xem trước nhanh Kho Lưu Trữ trong Cloud của tôi (Send2Me) (command 12221) |
| [`removeConversationMedia`](#removeconversationmedia) | `POST` | `/api/mediastore/remove` | Xóa mục Ảnh/Video, File hoặc Link khỏi Kho Lưu Trữ của nhóm (command 11842) |
| [`removePersonalMedia`](#removepersonalmedia) | `POST` | `/api/media/oneone/remove` | Xóa mục lưu trữ trong Kho Lưu Trữ Cloud của tôi (Send2Me) (command 12222) |
| [`uploadAttachment`](#uploadattachment) | `POST` | `N/A` | Upload an attachment to a thread |
| [`voiceToText`](#voicetotext) | `POST` | `/api/aifeatures/voice2text` | Gửi yêu cầu chuyển đổi tin nhắn thoại sang văn bản bằng Zalo AI (command 13394). Kết quả văn bản sau khi xử lý xong sẽ được đẩy về qua sự kiện `api.listener.on("voice2text_event", ...)` khớp với `req_id`. |

---

## `getConversationMedia`

Lấy danh sách Kho Lưu Trữ (Ảnh/Video `"media"`, File `"file"`, hoặc Link `"link"`) trong hội thoại nhóm (command 11841)

- **Endpoint**: `GET /api/mediastore/list`
- **Domain call**: `api.media.getConversationMedia(options: GetConversationMediaOptions)`
- **Alias phẳng**: `api.getConversationMedia(options: GetConversationMediaOptions)`

### Tham số

- `options`: Tùy chọn truy vấn (`groupId`, `mediaType`, `limit`, `lastId`, `lastFetchId`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type MediaStoreType = "media" | "file" | "link";

export type GetConversationMediaOptions = {
    groupId?: string;
    threadId?: string;
    mediaType?: MediaStoreType;
    limit?: number;
    lastId?: number | string;
    lastFetchId?: number;
};

export type MediaStoreItem = {
    id: number | string;
    type: string;
    sub_type?: number;
    owner_id?: string;
    group_id?: string;
    global_msg_id?: string | number;
    client_msg_id?: string | number;
    title?: string;
    src_url?: string;
    thumb_url?: string;
    previewThumb?: string | null;
    created_time?: number;
    file_size?: number;
    checksum?: string;
    width?: number;
    height?: number;
    duration?: number;
    [key: string]: unknown;
};

export type GetConversationMediaResponse = {
    items: MediaStoreItem[];
    isLimitPermission: boolean;
    last_id: number | string;
    has_more: number;
};
```

---

## `getMediaStorePreview`

Lấy danh sách xem trước nhanh Kho Lưu Trữ (Ảnh/Video, File, Link) của nhóm (command 11843)

- **Endpoint**: `POST /api/mediastore/preview`
- **Domain call**: `api.media.getMediaStorePreview(groupId: string, limit: number = 50)`
- **Alias phẳng**: `api.getMediaStorePreview(groupId: string, limit: number = 50)`

### Tham số

- `groupId`: ID của nhóm
- `limit`: Số lượng mục tối đa (mặc định: 50)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetMediaStorePreviewResponse = MediaStoreItem[];
```

---

## `getPersonalMedia`

Lấy danh sách Kho Lưu Trữ Ảnh/Video (`"media"`), File (`"file"`), hoặc Link (`"link"`) trong Cloud của tôi (Send2Me) (command 12220)

- **Endpoint**: `GET /api/media/oneone/list`
- **Domain call**: `api.media.getPersonalMedia(options: GetPersonalMediaOptions = {})`
- **Alias phẳng**: `api.getPersonalMedia(options: GetPersonalMediaOptions = {})`

### Tham số

- `options`: Tùy chọn truy vấn (`mediaType`, `limit`, `lastId`, `lastFetchId`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetPersonalMediaOptions = {
    mediaType?: MediaStoreType;
    limit?: number;
    lastId?: number | string;
    lastFetchId?: number;
};
```

---

## `getPersonalMediaPreview`

Lấy danh sách xem trước nhanh Kho Lưu Trữ trong Cloud của tôi (Send2Me) (command 12221)

- **Endpoint**: `POST /api/media/oneone/preview`
- **Domain call**: `api.media.getPersonalMediaPreview(limit: number = 50)`
- **Alias phẳng**: `api.getPersonalMediaPreview(limit: number = 50)`

### Tham số

- `limit`: Số lượng mục tối đa (mặc định: `50`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetPersonalMediaPreviewResponse = MediaStoreItem[];
```

---

## `removeConversationMedia`

Xóa mục Ảnh/Video, File hoặc Link khỏi Kho Lưu Trữ của nhóm (command 11842)

- **Endpoint**: `POST /api/mediastore/remove`
- **Domain call**: `api.media.removeConversationMedia(options: RemoveConversationMediaOptions)`
- **Alias phẳng**: `api.removeConversationMedia(options: RemoveConversationMediaOptions)`

### Tham số

- `options`: Thông tin mục cần xóa (`groupId`, `mediaType`, `mediaId`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemoveConversationMediaOptions = {
    groupId: string;
    mediaType: MediaStoreType;
    mediaId: string | number | (string | number)[];
};

export type RemoveConversationMediaResponse = unknown;
```

---

## `removePersonalMedia`

Xóa mục lưu trữ trong Kho Lưu Trữ Cloud của tôi (Send2Me) (command 12222)

- **Endpoint**: `POST /api/media/oneone/remove`
- **Domain call**: `api.media.removePersonalMedia(options: RemovePersonalMediaOptions)`
- **Alias phẳng**: `api.removePersonalMedia(options: RemovePersonalMediaOptions)`

### Tham số

- `options`: Thông tin mục cần xóa (`mediaType`, `mediaId`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RemovePersonalMediaOptions = {
    mediaType: MediaStoreType;
    mediaId: number | string | Array<number | string>;
};

export type RemovePersonalMediaResponse = {
    [key: string]: unknown;
};
```

---

## `uploadAttachment`

Upload an attachment to a thread

- **Domain call**: `api.media.uploadAttachment(sources: AttachmentSource | AttachmentSource[], threadId: string, type: ThreadType = ThreadType.User,)`
- **Alias phẳng**: `api.uploadAttachment(sources: AttachmentSource | AttachmentSource[], threadId: string, type: ThreadType = ThreadType.User,)`

### Tham số

- `sources`: path to files or attachment sources
- `threadId`: Group or User ID
- `type`: Message type (User or Group)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UploadAttachmentImageResponse = {
    normalUrl: string;
    photoId: string;
    finished: number | boolean;
    hdUrl: string;
    thumbUrl: string;
    clientFileId: number;
    chunkId: number;

    fileType: "image";
    width: number;
    height: number;
    totalSize: number;
    hdSize: number;
};

export type UploadAttachmentVideoResponse = {
    finished: number | boolean;
    clientFileId: number;
    chunkId: number;

    fileType: "video";
    fileUrl: string;
    fileId: string;
    checksum: string;
    totalSize: number;
    fileName: string;
};

export type UploadAttachmentFileResponse = {
    finished: number | boolean;
    clientFileId: number;
    chunkId: number;

    fileType: "others";
    fileUrl: string;
    fileId: string;
    checksum: string;
    totalSize: number;
    fileName: string;
};

export type ImageData = {
    fileName: string;
    totalSize: number | undefined;
    width: number | undefined;
    height: number | undefined;
};

export type FileData = {
    fileName: string;
    totalSize: number;
};

export type UploadAttachmentType = UploadAttachmentImageResponse | UploadAttachmentVideoResponse | UploadAttachmentFileResponse;

export type UploadAttachmentResponse = UploadAttachmentType[];

type RawResponse = {
    finished: number | boolean;
    clientFileId: number;
    chunkId: number;

    fileId?: string;
    photoId?: string;

    normalUrl?: string;
    hdUrl?: string;
    thumbUrl?: string;
};

type AttachmentData =
    | {
          filePath: string;
          fileType: "image";
          chunkContent: FormData[];
          fileData: ImageData;
          params: {
              toid?: string;
              grid?: string;
              totalChunk: number;
              fileName: string;
              clientId: number;
              totalSize: number;
              imei: string;
              isE2EE: number;
              jxl: number;
              chunkId: number;
          };
          source: AttachmentSource;
      }
    | {
          filePath: string;
          fileType: "video" | "others";
          chunkContent: FormData[];
          fileData: FileData;
          params: {
              toid?: string;
              grid?: string;
              totalChunk: number;
              fileName: string;
              clientId: number;
              totalSize: number;
              imei: string;
              isE2EE: number;
              jxl: number;
              chunkId: number;
          };
          source: AttachmentSource;
      };
```

---

## `voiceToText`

Gửi yêu cầu chuyển đổi tin nhắn thoại sang văn bản bằng Zalo AI (command 13394). Kết quả văn bản sau khi xử lý xong sẽ được đẩy về qua sự kiện `api.listener.on("voice2text_event", ...)` khớp với `req_id`.

- **Endpoint**: `POST /api/aifeatures/voice2text`
- **Domain call**: `api.media.voiceToText(voiceUrl: string)`
- **Alias phẳng**: `api.voiceToText(voiceUrl: string)`

### Tham số

- `voiceUrl`: Đường dẫn URL của tệp ghi âm tin nhắn thoại (`.aac` / `.mp3` / `.m4a`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type VoiceToTextResponse = {
    req_id: string;
};
```

---
