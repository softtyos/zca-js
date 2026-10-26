# Tài Liệu & Kế Hoạch Sử Dụng REA (`morluto/rea`) Cho Dự Án `zca-js`

Tài liệu này là sổ tay kỹ thuật hoàn chỉnh hướng dẫn cài đặt, vận hành bộ công cụ **REA (`rea-agents`)** ([github.com/morluto/rea](https://github.com/morluto/rea) | [rea.tools](https://rea.tools/)) và **Kế hoạch 4 giai đoạn** áp dụng REA để dịch ngược các tính năng nâng cao của Zalo Desktop (`app.asar` + Native Addons) và Zalo Web (`chat.zalo.me`).

---

## 1. Tổng Quan Về REA (`rea-agents`)

**REA (Reverse Engineering Assistant)** là một bộ công cụ **CLI + MCP Server** chuyên dụng giúp kết nối các AI Coding Agents (như Antigravity, Claude Code, Cursor, Codex) trực tiếp với các trình dịch ngược phần mềm:

| Thành phần mục tiêu                    | Công cụ REA sử dụng              | Ứng dụng trong `zca-js`                                                                                                                           |
| :------------------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Gói Electron (`app.asar`)**          | `analyze-javascript-application` | Giải nén, quét AST, trích xuất bảng `commandId`, endpoint REST/WebSocket, hằng số mã hóa từ `/Applications/Zalo.app/Contents/Resources/app.asar`. |
| **Web App (`chat.zalo.me`)**           | `analyze-website` + HAR Capture  | Quét các webpack chunks, WebWorker, WASM (`libzproto_wasm_bg.wasm`) và phân tích lưu lượng mạng thực tế (`.har`).                                 |
| **Cơ sở dữ liệu cục bộ**               | SQLite Inspector                 | Kiểm tra cấu trúc bảng `ChatContent`, `message`, `conversation` trong file sao lưu `ZDB4.0` (`.db.crypt`) của Zalo Mobile/PC.                     |
| **Native Binary (`.node` / `.dylib`)** | Ghidra / Hopper / IDA Bridge     | Dịch ngược mã máy C/C++ trong `zcall.node`, `libzrtc.dylib`, `zcrypto.node` để lấy thuật toán mã hóa media (ZRTP) và chữ ký native.               |

---

## 2. Cài Đặt & Cấu Hình Chuẩn Bị

### 2.1. Yêu cầu hệ thống

1. **Node.js `>= 22.19.0` hoặc `24.x`** (bắt buộc vì `rea-agents` sử dụng module native `node:sqlite` để lập chỉ mục các hàm/symbol khi dịch ngược):

    ```bash
    # Kiểm tra phiên bản Node hiện tại
    node -v

    # Nếu đang ở Node 20, chuyển sang Node 22+ qua nvm hoặc fnm:
    nvm install 22 && nvm use 22
    ```

2. **Ứng dụng Zalo Desktop trên macOS**:
    - Đường dẫn ASAR: `/Applications/Zalo.app/Contents/Resources/app.asar`
    - Đường dẫn Native Addons đã giải nén: `/Applications/Zalo.app/Contents/Resources/app.asar.unpacked/`
3. **Trình dịch ngược Binary (tuỳ chọn cho Giai đoạn 1 & 3)**:
    - **Ghidra** (miễn phí, mã nguồn mở) hoặc **Hopper Disassembler** / **IDA Pro** trên macOS.

### 2.2. Cài đặt và kết nối MCP Server

Chạy lệnh khởi tạo tự động của REA để đăng ký MCP server vào trình soạn thảo/AI Agent:

```bash
npx -y rea-agents@latest setup
```

Hoặc cấu hình thủ công trong `mcp_config.json`:

```json
{
    "mcpServers": {
        "rea": {
            "command": "npx",
            "args": ["-y", "rea-agents@latest", "mcp"]
        }
    }
}
```

---

## 3. Sổ Tay Các Lệnh REA Thực Chiến Với Zalo

### 3.1. Phân tích gói Electron `app.asar` của Zalo PC

```bash
npx -y rea-agents@latest analyze-javascript-application \
  "/Applications/Zalo.app/Contents/Resources/app.asar" \
  --json
```

- Lệnh này giúp lập chỉ mục toàn bộ các webpack modules bên trong `app.asar` (ví dụ module chứa bảng định tuyến `commandId` từ `10001` đến `16228`, `SyncMessageController`, `BackupMsgController`, `VoiceCallDomain`, v.v.).

### 3.2. Phân tích trực tiếp `chat.zalo.me`

```bash
npx -y rea-agents@latest analyze-website https://chat.zalo.me --json
```

### 3.3. Giải nén `app.asar` ra thư mục tạm để tra cứu sâu kết hợp REA

Khi cần kết hợp REA với tìm kiếm mã nguồn trực tiếp:

```bash
npx -y @electron/asar extract \
  "/Applications/Zalo.app/Contents/Resources/app.asar" \
  "/tmp/zalo-asar-extracted"
```

---

## 4. Hiện Trạng Các Tính Năng Đã Hoàn Thiện (100% Verified) Trong `zca-js`

Trước khi dùng REA cho các tính năng mới, dưới đây là các tính năng **đã được xác minh 100% từ `app.asar` và tích hợp sẵn vào nhánh `lib` của `zca-js`**:

| Nhóm tính năng                                           | API / Sự kiện trong `zca-js`                                                                                            | Command ID / Giao thức Zalo                                                                                  | Trạng thái       |
| :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :--------------- |
| **Lấy bù tin nhắn khi mở lại app (Offline Catch-up)**    | `api.preloadConversations(threadIdLocalMsgId)`                                                                          | `10053` (`/api/preloadconvers/get-last-msgs`)                                                                | ✅ Hoàn tất 100% |
| **Kéo hàng đợi tin nhắn nhỡ qua WebSocket**              | `api.listener.requestOldMessages(threadType, lastMsgId)` + sự kiện `old_messages`                                       | WS `cmd: 510` (User) & `cmd: 511` (Group), `subCmd: 0 \| 1`                                                  | ✅ Hoàn tất 100% |
| **Đồng bộ trạng thái đã đọc liên thiết bị**              | Sự kiện `api.listener.on("unread_cleared", ...)`                                                                        | WS `cmd: 504` / `524` (`clearUnreads`)                                                                       | ✅ Hoàn tất 100% |
| **Kích hoạt đồng bộ từ điện thoại (Mobile Backup Sync)** | `api.requestSyncFromPhone()`, `api.pullMobile()`, `api.cancelPullMobile()`                                              | `12000` (`pull_mobile_msg`), `12700` (`cancel_pull_mobile_msg`)                                              | ✅ Hoàn tất 100% |
| **Lắng nghe tiến trình đồng bộ từ điện thoại**           | Sự kiện `api.listener.on("sync_event", ...)` (`USER_CONFIRM`, `SYNCMSG_INFO`, `TRANSFER_ERROR`, `TRANSFER_AFTER_LOGIN`) | WS `cmd: 601`, `act_type: "syncmsgmb"` & `"transfer_msg"`                                                    | ✅ Hoàn tất 100% |
| **Tải & giải mã gói sao lưu `ZDB4.0` (`.db.crypt`)**     | `api.getSyncData()`, `decryptWithPrivateKey()`, `deriveZdbAesKey()`, `decryptZdbBuffer()`                               | RSA-2048 PKCS#1 v1.5 + AES-256-CBC 64KB chunk (`ZDB4.0`)                                                     | ✅ Hoàn tất 100% |
| **Quy đổi UID/GID số thuần sang Noised ID 19 số**        | `api.getNoisedIds({ fids, gids })` & `api.decryptGids(gids)`                                                            | `12390` (`/api/znoise`) & `12054` (`/api/gid/decrypt`)                                                       | ✅ Hoàn tất 100% |
| **Báo hiệu Gọi Điện Thoại (Voice/Video Call Signaling)** | `api.sendVoiceCall()`, `api.cancelVoiceCall()`, `api.endVoiceCall()` + sự kiện `call_event`                             | `11300` (`requestcall`), `11301` (`request`), `11305` (`cancel`), `11306` (`endcall`), WS `act_type: "voip"` | ✅ Hoàn tất 100% |

---

## 5. Kế Hoạch 4 Giai Đoạn Sử Dụng REA Cho Các Tính Năng Chưa Có

Dưới đây là lộ trình chi tiết sử dụng **REA** để nghiên cứu và mở khóa 4 nhóm tính năng phức tạp tiếp theo của Zalo:

### Giai đoạn 1: Giải mã Media Plane 2 chiều (Đàm thoại âm thanh RTP/ZRTP thực sự)

- **Vấn đề hiện tại**: `api.sendVoiceCall()` đã làm đổ chuông điện thoại người nhận và lấy về thành công `{ sessId, rtpServer, rtcpServer, zrtpKey, codec }`, đồng thời nhận được sự kiện `call_event` khi người nhận bắt máy (`CallEventType.ANSWER`). Tuy nhiên, để truyền/nhận giọng nói 2 chiều sau khi bắt máy, Zalo PC không dùng WebRTC của trình duyệt mà uỷ quyền cho native addon `zcall.node` + `libzrtc.dylib`.
- **Mục tiêu dùng REA**:
    1. Dùng REA kết nối với **Ghidra/Hopper** mở 2 file native trong `/Applications/Zalo.app/Contents/Resources/app.asar.unpacked/`:
        - `zcall.node` (Bridge IPC giữa Electron JS và C++)
        - `libzrtc.dylib` (Engine xử lý giao thức UDP RTP/RTCP + mã hóa ZRTP)
    2. Tìm các hàm xuất (exports) liên quan đến `initCall`, `sendDataToNative`, `recvSignal` (đặc biệt khi nhận `command: 401`, `416`, `402` trong `app.asar`) và `InitZRTP`.
    3. Xác định định dạng header gói tin UDP đầu tiên gửi tới `rtpServer` / `rtcpServer` (cách đóng gói `sessId`, `callId`, `zrtpKey` và codec Opus payload type).
    4. Viết module `VoiceCallMediaSession` bằng `node:dgram` (UDP socket) trong `zca-js` để cho phép phát file âm thanh (`.wav`/`.opus`) vào cuộc gọi hoặc thu âm luồng thoại của đối phương.

### Giai đoạn 2: Giải mã giao thức Đồng bộ thế hệ 2 (`Transfer-Sync-V2` & WebAssembly)

- **Vấn đề hiện tại**: Ngoài luồng `pull_mobile_msg` (`12000` - `ZDB4.0`), các bản Zalo mới đang triển khai song song giao thức `/api/transfer-sync-v2/request-sync` (command `12888`) và sự kiện `act_type: "transfer_sync2"` sử dụng file WebAssembly `libzproto_wasm_bg.wasm`.
- **Mục tiêu dùng REA**:
    1. Dùng REA phân tích class `SyncController` và `_processSync2Ctrl` trong `app.asar` để lấy toàn bộ state machine của `transfer_sync2`.
    2. Dùng REA + Ghidra (với plugin WASM) hoặc `wasm2wat` phân tích file `libzproto_wasm_bg.wasm` để trích xuất schema Protobuf của tham số `data` trong:
        - `/api/transfer-sync-v2/request-sync` (`12888`)
        - `/api/transfer-sync-v2/download`
    3. Tích hợp bộ parser Protobuf thuần TypeScript vào `zca-js` mà không cần phụ thuộc binary WASM nặng nề.

### Giai đoạn 3: Giải mã Tin nhắn Mã hóa Đầu cuối (`CHAT_E2EE`, commands `16000`–`16201`)

- **Vấn đề hiện tại**: Khi một cuộc trò chuyện bật "Mã hóa đầu cuối (E2EE)", tin nhắn trả về nằm trong mảng `eeMsgs` (khi gọi `preloadConversations`) và sử dụng cụm endpoint `/api/e2ee/pc/message/*` (`16000`–`16201`).
- **Mục tiêu dùng REA**:
    1. Dùng REA quét toàn bộ các tham chiếu tới `16000`–`16201` (`getE2eeDomain()`, `deleteOneOneE2eeMessageV2`, `EntriesTransferManager`) trong `app.asar`.
    2. Dùng REA kết nối Ghidra phân tích `zcrypto.node` để xác định cơ chế trao đổi khoá (Signal Protocol / Double Ratchet hoặc X25519 + AES-GCM của Zalo).
    3. Bổ sung `sendE2EEMessage` và bộ giải mã tự động cho `eeMsgs` trong `listen.ts` và `preloadConversations.ts`.

### Giai đoạn 4: Gọi Nhóm (`Group Voice/Video Call`, commands `12433`–`12447`)

- **Vấn đề hiện tại**: Từ `app.asar`, chúng ta đã trích xuất được danh sách đầy đủ các API gọi nhóm:
    - `12433`: `/api/voicecall/group/requestcall` (`{ groupId, callId, typeRequest, data, partners }`)
    - `12434`: `/api/voicecall/group/request` (`{ calleeId, callId, callType, data, session, partners, groupId }`)
    - `12435`: `/api/voicecall/group/adduser`
    - `12436`: `/api/voicecall/group/answer`
    - `12437`: `/api/voicecall/group/cancel`
    - `12438`: `/api/voicecall/group/endcall`
    - `12439`: `/api/voicecall/group/ringring`
    - `12445`: `/api/voicecall/group/state`
- **Mục tiêu dùng REA**:
    1. Dùng tính năng phân tích HAR của REA khi thực hiện 1 cuộc gọi nhóm thực tế trên Zalo PC/Web để bắt chính xác cấu trúc chuỗi JSON bên trong trường `data` và mảng `partners`.
    2. Sau khi có mẫu payload thực tế từ HAR, đóng gói thành các API `sendGroupVoiceCall`, `cancelGroupVoiceCall`, `endGroupVoiceCall` trong `zca-js`.
