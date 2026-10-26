# Kiến trúc SDK & Cơ chế Giải mã Lõi

## 1. Sơ đồ Tổng quan Kiến trúc 5 Tầng (`@softtynet/zca-js`)

```mermaid
flowchart TD
    subgraph L5["Tầng 5: 12 Phân hệ Nghiệp vụ (256 Primitive APIs)"]
        D1["api.auth • api.chat • api.group • api.friend"]
        D2["api.profile • api.sync • api.zcloud • api.call"]
        D3["api.media • api.sticker • api.board • api.business"]
    end

    subgraph L4["Tầng 4: Động cơ WebSocket Thời gian thực (src/realtime/)"]
        R1["Listener (Watchdog 50s, Ping/Pong, Endpoint Rotation)"]
        R2["4 Handlers: message • control (Group/Sync/VoIP/OA) • reaction • status"]
        R1 --> R2
    end

    subgraph L3["Tầng 3: Điều phối Dịch vụ & Client Chuyên biệt (src/core/)"]
        C1["service-router (zpw_service_map_v3 + Fallback)"]
        C2["zcloud-client (Auto Cache ViewerKey 15m + Retry)"]
    end

    subgraph L2["Tầng 2: Lõi Mật mã học 4 Cơ chế (src/crypto/)"]
        K1["AES-CBC (ParamsEncryptor) & WS AES-GCM 128-bit + Pako"]
        K2["ZCloud 98yS (AES-256-CBC 16B IV) & ZDB 4.0 (RSA-2048 + 64KB Chunks)"]
    end

    subgraph L1["Tầng 1: Hằng số Giao thức & Bảo toàn 64-bit ID (src/constants/)"]
        P1["ZALO_PROTOCOL (zpw_type=30, zpw_ver=689, voicecall=24)"]
        P2["preParseJsonIds & JSONBig (Bảo toàn UID 19 chữ số)"]
    end

    L5 --> L3
    L4 --> L2
    L3 --> L2
    L2 --> L1
```

## 2. Kiến trúc 12 Domains (Lazy Memoized Getters)

`@softtynet/zca-js` tự động ánh xạ toàn bộ các API nguyên bản vào 12 phân hệ trên đối tượng `api`:

- `api.auth`: Xác thực, QR, phiên đăng nhập (`exportSession`), giải mã `globalId` (`encryptGids` / `decryptGids`) & `getNoisedIds`.
- `api.chat`: Tin nhắn 1-1, nhóm & Zalo OA (`preloadConversations`), thu hồi đơn/đa tin nhắn (`undoMultiMessage`), hội thoại ghim/ẩn/lưu trữ.
- `api.group`: Quản lý nhóm/Cộng đồng, lịch sử Cloud (`getGroupChatHistory`, `getGroupCloudMessagePath`), trạng thái đã xem (`getGroupMessageStatus`).
- `api.friend`: Bạn bè, danh bạ V2 (`getPhonebookV2`), biệt danh V2 (`getAliasListV2`), kiểm tra online PC/Web (`getFriendsActivePCWeb`).
- `api.profile`: Hồ sơ cá nhân, Emoji Status, xác thực tài khoản.
- `api.sync`: Đồng bộ lịch sử tin nhắn từ Mobile (`requestSyncFromPhone`, `pullMobile`, `getSyncData`).
- `api.zcloud`: ZCloud & ZFamily (`getCloudViewerKey`, `getUsageZCloud`, `verifyCloudMedia`).
- `api.call`: Gọi thoại, Video 1-1 & Gọi nhóm — trọn bộ 30 API (`sendVoiceCall`, `requestVoiceCall`, `sendRequestVoiceCall`, `ringRingVoiceCall`, `answerVoiceCall`, `answerAckVoiceCall`, `cancelVoiceCall`, `endVoiceCall`, `holdVoiceCall`, `unholdVoiceCall`, `logEndVoiceCall`, `updateCallMediaState`, `requestAudioToVideoCall`, `requestShareScreenCall`, 14 API `*GroupCall*`, `createRtcSession`, `createController`).
- `api.media`: Kho lưu trữ Media/File/Link nhóm & cá nhân (`getConversationMedia`, `getMediaStorePreview`, `getPersonalMedia`), `voiceToText`.
- `api.sticker`: Nhãn dán, danh mục V2, gợi ý nhãn dán theo từ khóa.
- `api.board`: Bảng tin nhóm, Tin ghim (`getListPinTopics`), Bình chọn (`getPollDetail`), Lịch hẹn (`getListReminder`).
- `api.business`: Zalo Official Account (`getOAProfile`, `blockOA`, `unblockOA`, `convertOAIds`), Nhãn hội thoại (`getLabels`), Tin nhắn nhanh, Trả lời tự động, Danh mục sản phẩm.

## 3. Cơ chế Bảo toàn Số nguyên 64-bit (`preParseJsonIds`)

Nhiều API của Zalo (như `/api/mediastore/list` và `/api/mediastore/preview`) trả về UID 19 chữ số dưới dạng **JSON Number không có dấu ngoặc kép** (ví dụ `"owner_id": 4829384719283746192`).

Nếu gọi trực tiếp `JSON.parse()`, JavaScript (IEEE-754 double) sẽ làm tròn mất 3 chữ số cuối khi vượt quá `Number.MAX_SAFE_INTEGER` (`9007199254740991`).

`@softtynet/zca-js` tích hợp sẵn hàm `preParseJsonIds` ngay trong tầng `handleZaloResponse` trước khi `JSON.parse()` (giống cơ chế `preParse` trong `app.asar` của Zalo PC), giúp tự động chuyển các trường ID 16+ chữ số (`owner_id`, `group_id`, `uidFrom`, `idTo`, `globalMsgId`, `cliMsgId`...) sang kiểu `string` chính xác tuyệt đối.
