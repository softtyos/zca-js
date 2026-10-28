---
title: "Gọi thoại, Video & Gọi nhóm (Call) (api.call) - 30 APIs"
description: "Điều khiển trọn vẹn 30 API cuộc gọi thoại, video 1-1, gọi nhóm và bộ máy Call Engine (ZaloRtcSession UDP/SRTP 2 chiều & ZaloCallController). Tra cứu chi tiết 30 phương thức thuộc phân hệ api.call trong bộ SDK @softtynet/zca-js."
---

# 📞 Gọi thoại, Video & Gọi nhóm (Call)

> Namespace: `api.call` (hoặc gọi trực tiếp `api.<methodName>`) — **30 API nguyên bản**

Điều khiển trọn vẹn 30 API cuộc gọi thoại, video 1-1, gọi nhóm và bộ máy Call Engine (ZaloRtcSession UDP/SRTP 2 chiều & ZaloCallController).

## Danh sách nhanh

| Phương thức                                           | HTTP  | Endpoint Zalo                                                                    | Mô tả                                                                                                                                                          |
| :---------------------------------------------------- | :---: | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`addUserGroupCall`](#addusergroupcall)               | `GET` | `/api/voicecall/group/adduser`                                                   | Mời thêm thành viên mới vào cuộc gọi nhóm đang diễn ra (cmd 12435 - /api/voicecall/group/adduser).                                                             |
| [`answerAckVoiceCall`](#answerackvoicecall)           | `GET` | `/api/voicecall/answerack`                                                       | Gửi xác nhận hoàn tất bắt tay nhận cuộc gọi 1-1 (cmd 11304 - /api/voicecall/answerack, signal 408).                                                            |
| [`answerGroupCall`](#answergroupcall)                 | `GET` | `/api/voicecall/group/answer`                                                    | Chấp nhận tham gia cuộc gọi nhóm khi nhận được lời mời (cmd 12436 - /api/voicecall/group/answer).                                                              |
| [`answerVoiceCall`](#answervoicecall)                 | `GET` | `/api/voicecall/answer`                                                          | Chấp nhận (Bắt máy) cuộc gọi Thoại/Video 1-1 đến (cmd 11303 - /api/voicecall/answer, signal 402).                                                              |
| [`broadcastGroupCallState`](#broadcastgroupcallstate) | `GET` | `/api/voicecall/group/broadcast`                                                 | Phát quảng bá trạng thái thiết bị (Mic, Camera, Screen Share) tới các thành viên trong cuộc gọi nhóm (cmd 12098 - /api/voicecall/group/broadcast).             |
| [`cancelGroupCall`](#cancelgroupcall)                 | `GET` | `/api/voicecall/group/cancel`                                                    | Hủy lời mời cuộc gọi nhóm (cmd 12437 - /api/voicecall/group/cancel).                                                                                           |
| [`cancelVoiceCall`](#cancelvoicecall)                 | `GET` | `/api/voicecall/cancel`                                                          | Hủy cuộc gọi 1-1 đang đổ chuông trước khi người nhận bắt máy (cmd 11305 - /api/voicecall/cancel, signal 405).                                                  |
| [`createController`](#createcontroller)               | `GET` | `/apis`                                                                          | Khởi tạo bộ điều phối cuộc gọi ZaloCallController quản lý vòng đời gọi đi, nhận cuộc gọi đến và kênh IPC cục bộ.                                               |
| [`createRtcSession`](#creatertcsession)               | `GET` | `/apis`                                                                          | Khởi tạo phiên gọi thoại / video 2 chiều thuần TypeScript (ZaloRtcSession — UDP ZRTPPacket + SRTP + H.264 Annex-B + Mobile Direct UDP Handoff).                |
| [`endGroupCall`](#endgroupcall)                       | `GET` | `/api/voicecall/group/endcall`                                                   | Rời khỏi cuộc gọi nhóm hoặc từ chối lời mời gọi nhóm (cmd 12438 - /api/voicecall/group/endcall).                                                               |
| [`endVoiceCall`](#endvoicecall)                       | `GET` | `/api/voicecall/endcall`                                                         | Kết thúc cuộc gọi 1-1 đang diễn ra hoặc từ chối cuộc gọi đến (cmd 11306 - /api/voicecall/endcall, signal 404).                                                 |
| [`finishGroupCall`](#finishgroupcall)                 | `GET` | `/api/voicecall/group/finish`                                                    | Kết thúc hoàn toàn phòng gọi nhóm cho tất cả thành viên (cmd 12446 - /api/voicecall/group/finish).                                                             |
| [`getGroupCallState`](#getgroupcallstate)             | `GET` | `/api/voicecall/group/state`                                                     | Truy vấn trạng thái hiện tại và danh sách thành viên trong phòng gọi nhóm (cmd 12445 - /api/voicecall/group/state).                                            |
| [`holdVoiceCall`](#holdvoicecall)                     | `GET` | `/api/voicecall/holdreq`<br/>`/api/voicecall/holdresp`<br/>`/api/voicecall/`     | Tạm giữ (Hold) cuộc gọi 1-1 đang diễn ra hoặc phản hồi yêu cầu tạm giữ (cmd 11307 holdreq / cmd 11308 holdresp, signal 411/412).                               |
| [`joinGroupCall`](#joingroupcall)                     | `GET` | `/api/voicecall/group/join`                                                      | Chủ động tham gia vào một cuộc gọi nhóm đang diễn ra từ banner nhóm (cmd 12043 - /api/voicecall/group/join).                                                   |
| [`logEndVoiceCall`](#logendvoicecall)                 | `GET` | `/api/voicecall/logendcall`                                                      | Gửi thống kê chất lượng cuộc gọi (QoS/Billing stats) sau khi kết thúc cuộc gọi 1-1 (cmd 11311 - /api/voicecall/logendcall, signal 406).                        |
| [`notifyGroupCall`](#notifygroupcall)                 | `GET` | `/api/voicecall/group/notify`                                                    | Gửi thông báo sự kiện cuộc gọi nhóm vào luồng chat nhóm (cmd 12447 - /api/voicecall/group/notify).                                                             |
| [`pingGroupCall`](#pinggroupcall)                     | `GET` | `/api/voicecall/group/ping`                                                      | Gửi nhịp tim (Heartbeat Ping) duy trì kết nối của thành viên trong phòng gọi nhóm (cmd 12097 - /api/voicecall/group/ping).                                     |
| [`requestAudioToVideoCall`](#requestaudiotovideocall) | `GET` | `/api/voicecall/requestaudio2video`                                              | Yêu cầu nâng cấp từ cuộc gọi Thoại sang cuộc gọi Video hoặc phản hồi yêu cầu (cmd 12056 - /api/voicecall/requestaudio2video).                                  |
| [`requestGroupCall`](#requestgroupcall)               | `GET` | `/api/voicecall/group/requestcall`                                               | Bước 1 gọi nhóm (cmd 12433 - /api/voicecall/group/requestcall): Xin cấp phát phòng gọi nhóm (Group Call Room & RTP/ZRTC servers).                              |
| [`requestShareScreenCall`](#requestsharescreencall)   | `GET` | `/api/voicecall/requestsharescreen`                                              | Yêu cầu bắt đầu hoặc kết thúc chia sẻ màn hình (Screen Share) trong cuộc gọi 1-1 (cmd 12064 - /api/voicecall/requestsharescreen).                              |
| [`requestVoiceCall`](#requestvoicecall)               | `GET` | `/api/voicecall/requestcall`                                                     | Bước 1 gọi 1-1 (cmd 11300 - /api/voicecall/requestcall, signal 401): Xin cấp phát phòng gọi 1-1 (callId, sessId, rtpServer, rtcpServer, zrtpKey, codec).       |
| [`ringRingGroupCall`](#ringringgroupcall)             | `GET` | `/api/voicecall/group/ringring`                                                  | Báo hiệu thiết bị đang đổ chuông cho lời mời gọi nhóm (cmd 12439 - /api/voicecall/group/ringring).                                                             |
| [`ringRingVoiceCall`](#ringringvoicecall)             | `GET` | `/api/voicecall/ringring`                                                        | Báo hiệu thiết bị đang đổ chuông cho cuộc gọi 1-1 đến (cmd 11302 - /api/voicecall/ringring, signal 407).                                                       |
| [`sendRequestGroupCall`](#sendrequestgroupcall)       | `GET` | `/api/voicecall/group/request`                                                   | Bước 2 gọi nhóm (cmd 12434 - /api/voicecall/group/request): Phát tín hiệu mời gọi nhóm tới danh sách thành viên.                                               |
| [`sendRequestVoiceCall`](#sendrequestvoicecall)       | `GET` | `/api/voicecall/request`                                                         | Bước 2 gọi 1-1 (cmd 11301 - /api/voicecall/request, signal 416): Gửi gói mời gọi (Invite) kèm extendData ZRTC để kích hoạt đổ chuông trên thiết bị người nhận. |
| [`sendVoiceCall`](#sendvoicecall)                     | `GET` | `/api/voicecall/requestcall`<br/>`/api/voicecall/request`                        | Khởi tạo cuộc gọi Thoại hoặc Video 1-1 trọn gói (tự động thực hiện 2 bước 11300 + 11301 làm đổ chuông máy người nhận).                                         |
| [`shareScreenGroupCall`](#sharescreengroupcall)       | `GET` | `/api/voicecall/group/sharescreen`                                               | Bắt đầu hoặc dừng chia sẻ màn hình trong cuộc gọi nhóm (cmd 12044 - /api/voicecall/group/sharescreen).                                                         |
| [`unholdVoiceCall`](#unholdvoicecall)                 | `GET` | `/api/voicecall/unholdreq`<br/>`/api/voicecall/unholdresp`<br/>`/api/voicecall/` | Khôi phục (Unhold) cuộc gọi 1-1 đang tạm giữ hoặc phản hồi yêu cầu khôi phục (cmd 11309 unholdreq / cmd 11310 unholdresp, signal 413/414).                     |
| [`updateCallMediaState`](#updatecallmediastate)       | `GET` | `/api/voicecall/conf`                                                            | Đồng bộ trạng thái bật/tắt Mic và Camera trong cuộc gọi 1-1 (cmd 12006 - /api/voicecall/conf).                                                                 |

---

## `addUserGroupCall`

Mời thêm thành viên mới vào cuộc gọi nhóm đang diễn ra (cmd 12435 - /api/voicecall/group/adduser).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/adduser</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.addUserGroupCall(callId: number, options: AddUserGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.addUserGroupCall(callId: number, options: AddUserGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `session`, `partners`, `calleeId`, `callType` (`0` Audio / `1` Video) và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AddUserGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
    rtpAddress?: string;
    rtcpAddress?: string;
    codec?: string;
    extendData?: string | Record<string, unknown>;
    data?: string | Record<string, unknown>;
    session: string;
    partners: string[];
};

export type AddUserGroupCallResponse = Record<string, unknown>;
```

---

## `answerAckVoiceCall`

Gửi xác nhận hoàn tất bắt tay nhận cuộc gọi 1-1 (cmd 11304 - /api/voicecall/answerack, signal 408).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/answerack</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.answerAckVoiceCall(calleeId: string, callId: number, options: AnswerAckVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.answerAckVoiceCall(calleeId: string, callId: number, options: AnswerAckVoiceCallOptions = {},)
```

### Tham số

- `calleeId`: User ID của người nhận cuộc gọi
- `callId`: ID của cuộc gọi
- `options`: Tuỳ chọn mã trạng thái (`status`, mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AnswerAckVoiceCallOptions = {
    status?: number;
};

export type AnswerAckVoiceCallResponse = Record<string, unknown>;
```

---

## `answerGroupCall`

Chấp nhận tham gia cuộc gọi nhóm khi nhận được lời mời (cmd 12436 - /api/voicecall/group/answer).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/answer</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.answerGroupCall(callId: number, options: AnswerGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.answerGroupCall(callId: number, options: AnswerGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `calleeId`, `callType` (`0` Audio / `1` Video), `session`, `status`, `partners` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AnswerGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    session?: string;
    status?: number;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type AnswerGroupCallResponse = Record<string, unknown>;
```

---

## `answerVoiceCall`

Chấp nhận (Bắt máy) cuộc gọi Thoại/Video 1-1 đến (cmd 11303 - /api/voicecall/answer, signal 402).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/answer</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.answerVoiceCall(callerId: string, callId: number, options: AnswerVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.answerVoiceCall(callerId: string, callId: number, options: AnswerVoiceCallOptions = {},)
```

### Tham số

- `callerId`: User ID của người gọi đến
- `callId`: ID của cuộc gọi
- `options`: Thông tin `sessionId`, `rtpAddress`, `rtcpAddress`, `codec`, `extendData` và `status`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type AnswerVoiceCallOptions = {
    status?: number;
    codec?: string;
    rtcpAddress?: string;
    rtpAddress?: string;
    sessionId?: string;
    extendData?: string | Record<string, unknown>;
    subCommand?: number;
};

export type AnswerVoiceCallResponse = Record<string, unknown>;
```

---

## `broadcastGroupCallState`

Phát quảng bá trạng thái thiết bị (Mic, Camera, Screen Share) tới các thành viên trong cuộc gọi nhóm (cmd 12098 - /api/voicecall/group/broadcast).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/broadcast</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.broadcastGroupCallState(callId: number, options: BroadcastGroupCallStateOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.broadcastGroupCallState(callId: number, options: BroadcastGroupCallStateOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `userId`, `callState`, `audioState`, `videoState` và `params`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type BroadcastGroupCallStateOptions = {
    hostCall: string | number;
    userId?: string | number;
    callState?: number;
    audioState?: number;
    videoState?: number;
    params?: string | Record<string, unknown>;
};

export type BroadcastGroupCallStateResponse = Record<string, unknown>;
```

---

## `cancelGroupCall`

Hủy lời mời cuộc gọi nhóm (cmd 12437 - /api/voicecall/group/cancel).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/cancel</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.cancelGroupCall(callId: number, options: CancelGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.cancelGroupCall(callId: number, options: CancelGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `groupId`, `calleeId`, `callType` (`0` Audio / `1` Video), `session`, `status`, `partners` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CancelGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    session?: string;
    status?: number;
    duration?: number;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type CancelGroupCallResponse = Record<string, unknown>;
```

---

## `cancelVoiceCall`

Hủy cuộc gọi 1-1 đang đổ chuông trước khi người nhận bắt máy (cmd 11305 - /api/voicecall/cancel, signal 405).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/cancel</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.cancelVoiceCall(calleeId: string, callId: number, options: CancelVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.cancelVoiceCall(calleeId: string, callId: number, options: CancelVoiceCallOptions = {},)
```

### Tham số

- `calleeId`: User ID của người nhận cuộc gọi
- `callId`: ID của cuộc gọi (nhận từ `sendVoiceCall`)
- `options`: Tuỳ chọn loại cuộc gọi (`callType`) và `status`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type CancelVoiceCallOptions = {
    callType?: CallType | number;
    status?: number;
};

export type CancelVoiceCallResponse = Record<string, unknown>;
```

---

## `createController`

Khởi tạo bộ điều phối cuộc gọi ZaloCallController quản lý vòng đời gọi đi, nhận cuộc gọi đến và kênh IPC cục bộ.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/apis</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.createController(options: ZaloCallControllerOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.createController(options: ZaloCallControllerOptions = {})
```

---

## `createRtcSession`

Khởi tạo phiên gọi thoại / video 2 chiều thuần TypeScript (ZaloRtcSession — UDP ZRTPPacket + SRTP + H.264 Annex-B + Mobile Direct UDP Handoff).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/apis</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.createRtcSession(options: ZaloRtcSessionOptions = {})
// Hoặc gọi phẳng (Flat Alias):
await api.createRtcSession(options: ZaloRtcSessionOptions = {})
```

---

## `endGroupCall`

Rời khỏi cuộc gọi nhóm hoặc từ chối lời mời gọi nhóm (cmd 12438 - /api/voicecall/group/endcall).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/endcall</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.endGroupCall(callId: number, options: EndGroupCallOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.endGroupCall(callId: number, options: EndGroupCallOptions)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `groupId`, `calleeId`, `callType` (`0` Audio / `1` Video), `session`, `status`, `partners` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EndGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    session?: string;
    status?: number;
    duration?: number;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type EndGroupCallResponse = Record<string, unknown>;
```

---

## `endVoiceCall`

Kết thúc cuộc gọi 1-1 đang diễn ra hoặc từ chối cuộc gọi đến (cmd 11306 - /api/voicecall/endcall, signal 404).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/endcall</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.endVoiceCall(calleeId: string, callId: number, options: EndVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.endVoiceCall(calleeId: string, callId: number, options: EndVoiceCallOptions = {},)
```

### Tham số

- `calleeId`: User ID của đối phương
- `callId`: ID của cuộc gọi
- `options`: Tuỳ chọn mã trạng thái kết thúc (`status`, mặc định `3`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type EndVoiceCallOptions = {
    status?: number;
};

export type EndVoiceCallResponse = Record<string, unknown>;
```

---

## `finishGroupCall`

Kết thúc hoàn toàn phòng gọi nhóm cho tất cả thành viên (cmd 12446 - /api/voicecall/group/finish).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/finish</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.finishGroupCall(callId: number, options: FinishGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.finishGroupCall(callId: number, options: FinishGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `duration`, `joinTime`, `status`, `partners` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type FinishGroupCallOptions = {
    callType?: CallType | number;
    data?: string | Record<string, unknown>;
    duration?: number;
    hostCall: string | number;
    partners?: string[];
    status?: number;
    joinTime?: number;
};

export type FinishGroupCallResponse = Record<string, unknown>;
```

---

## `getGroupCallState`

Truy vấn trạng thái hiện tại và danh sách thành viên trong phòng gọi nhóm (cmd 12445 - /api/voicecall/group/state).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/state</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.getGroupCallState(callId: number, hostCall: string | number, callType: CallType | number = CallType.GroupAudio,)
// Hoặc gọi phẳng (Flat Alias):
await api.getGroupCallState(callId: number, hostCall: string | number, callType: CallType | number = CallType.GroupAudio,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `hostCall`: User ID hoặc Group ID chủ trì cuộc gọi (`hostCall`)
- `callType`: Loại cuộc gọi nhóm (`CallType.GroupAudio = 5` hoặc `CallType.GroupVideo = 6`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type GetGroupCallStateResponse = Record<string, unknown>;
```

---

## `holdVoiceCall`

Tạm giữ (Hold) cuộc gọi 1-1 đang diễn ra hoặc phản hồi yêu cầu tạm giữ (cmd 11307 holdreq / cmd 11308 holdresp, signal 411/412).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/holdreq</span> <span class="zca-endpoint-pill">/api/voicecall/holdresp</span> <span class="zca-endpoint-pill">/api/voicecall/</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.holdVoiceCall(toId: string, options: HoldVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.holdVoiceCall(toId: string, options: HoldVoiceCallOptions = {},)
```

### Tham số

- `toId`: User ID của đối phương trong cuộc gọi
- `options`: Đặt `isResponse = true` nếu là gói phản hồi (`holdresp`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type HoldVoiceCallOptions = {
    isResponse?: boolean;
};

export type HoldVoiceCallResponse = Record<string, unknown>;
```

---

## `joinGroupCall`

Chủ động tham gia vào một cuộc gọi nhóm đang diễn ra từ banner nhóm (cmd 12043 - /api/voicecall/group/join).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/join</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.joinGroupCall(callId: number, options: JoinGroupCallOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.joinGroupCall(callId: number, options: JoinGroupCallOptions)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `userId`, `status`, `srcJoinCall`, `audioState`, `videoState` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type JoinGroupCallOptions = {
    userId?: string | number;
    hostCall: string | number;
    status?: number;
    srcJoinCall?: number;
    audioState?: number;
    videoState?: number;
    data?: string | Record<string, unknown>;
};

export type JoinGroupCallResponse = Record<string, unknown>;
```

---

## `logEndVoiceCall`

Gửi thống kê chất lượng cuộc gọi (QoS/Billing stats) sau khi kết thúc cuộc gọi 1-1 (cmd 11311 - /api/voicecall/logendcall, signal 406).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/logendcall</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.logEndVoiceCall(partnerId: string, callId: number, options: LogEndVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.logEndVoiceCall(partnerId: string, callId: number, options: LogEndVoiceCallOptions = {},)
```

### Tham số

- `partnerId`: User ID của đối phương
- `callId`: ID của cuộc gọi
- `options`: Thông tin `status`, `duration`, `role` và `logData`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type LogEndVoiceCallOptions = {
    status?: number;
    logData?: string | Record<string, unknown>;
    duration?: number;
    role?: boolean | number;
};

export type LogEndVoiceCallResponse = Record<string, unknown>;
```

---

## `notifyGroupCall`

Gửi thông báo sự kiện cuộc gọi nhóm vào luồng chat nhóm (cmd 12447 - /api/voicecall/group/notify).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/notify</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.notifyGroupCall(callId: number, options: NotifyGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.notifyGroupCall(callId: number, options: NotifyGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `callType`, `status` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type NotifyGroupCallOptions = {
    hostCall: string | number;
    callType?: CallType | number;
    status?: number;
    data?: string | Record<string, unknown>;
};

export type NotifyGroupCallResponse = Record<string, unknown>;
```

---

## `pingGroupCall`

Gửi nhịp tim (Heartbeat Ping) duy trì kết nối của thành viên trong phòng gọi nhóm (cmd 12097 - /api/voicecall/group/ping).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/ping</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.pingGroupCall(callId: number, options: PingGroupCallOptions)
// Hoặc gọi phẳng (Flat Alias):
await api.pingGroupCall(callId: number, options: PingGroupCallOptions)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `userId`, `callState`, `audioState`, `videoState` và `params`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type PingGroupCallOptions = {
    hostCall: string | number;
    userId?: string | number;
    callState?: number;
    audioState?: number;
    videoState?: number;
    params?: string | Record<string, unknown>;
};

export type PingGroupCallResponse = Record<string, unknown>;
```

---

## `requestAudioToVideoCall`

Yêu cầu nâng cấp từ cuộc gọi Thoại sang cuộc gọi Video hoặc phản hồi yêu cầu (cmd 12056 - /api/voicecall/requestaudio2video).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/requestaudio2video</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.requestAudioToVideoCall(uidTo: string, callId: number, options: RequestAudioToVideoCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.requestAudioToVideoCall(uidTo: string, callId: number, options: RequestAudioToVideoCallOptions = {},)
```

### Tham số

- `uidTo`: User ID của đối phương
- `callId`: ID của cuộc gọi
- `options`: Trạng thái yêu cầu (`status`, mặc định `1`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RequestAudioToVideoCallOptions = {
    status?: number;
};

export type RequestAudioToVideoCallResponse = Record<string, unknown>;
```

---

## `requestGroupCall`

Bước 1 gọi nhóm (cmd 12433 - /api/voicecall/group/requestcall): Xin cấp phát phòng gọi nhóm (Group Call Room & RTP/ZRTC servers).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/requestcall</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.requestGroupCall(groupId: string, options: RequestGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.requestGroupCall(groupId: string, options: RequestGroupCallOptions,)
```

### Tham số

- `groupId`: ID của nhóm
- `options`: Danh sách `partners`, `callId`, `typeRequest` (`0` / `CallType.GroupAudio = 5` hoặc `1` / `CallType.GroupVideo = 6`) và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RequestGroupCallOptions = {
    callId?: number;
    typeRequest?: CallType | number;
    data?: string | Record<string, unknown>;
    partners: string[];
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
    extraData?: string;
};

export type RequestGroupCallResponse = Record<string, unknown>;
```

---

## `requestShareScreenCall`

Yêu cầu bắt đầu hoặc kết thúc chia sẻ màn hình (Screen Share) trong cuộc gọi 1-1 (cmd 12064 - /api/voicecall/requestsharescreen).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/requestsharescreen</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.requestShareScreenCall(uidTo: string, callId: number, options: RequestShareScreenCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.requestShareScreenCall(uidTo: string, callId: number, options: RequestShareScreenCallOptions = {},)
```

### Tham số

- `uidTo`: User ID của đối phương
- `callId`: ID của cuộc gọi
- `options`: Trạng thái chia sẻ màn hình (`status`: `1` bật, `0` tắt)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RequestShareScreenCallOptions = {
    status?: number;
};

export type RequestShareScreenCallResponse = Record<string, unknown>;
```

---

## `requestVoiceCall`

Bước 1 gọi 1-1 (cmd 11300 - /api/voicecall/requestcall, signal 401): Xin cấp phát phòng gọi 1-1 (callId, sessId, rtpServer, rtcpServer, zrtpKey, codec).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/requestcall</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.requestVoiceCall(calleeId: string, options: RequestVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.requestVoiceCall(calleeId: string, options: RequestVoiceCallOptions = {},)
```

### Tham số

- `calleeId`: User ID của người nhận cuộc gọi
- `options`: Tuỳ chọn loại cuộc gọi (`callType`), `callId` và `codec`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RequestVoiceCallOptions = {
    callType?: CallType;
    callId?: number;
    codec?: string;
};

export type RequestVoiceCallResponse = RequestCallServerInfo & {
    callId: number;
};
```

---

## `ringRingGroupCall`

Báo hiệu thiết bị đang đổ chuông cho lời mời gọi nhóm (cmd 12439 - /api/voicecall/group/ringring).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/ringring</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.ringRingGroupCall(callId: number, options: RingRingGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.ringRingGroupCall(callId: number, options: RingRingGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `calleeId`, `callType` (`0` Audio / `1` Video), `session`, `status`, `partners` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RingRingGroupCallOptions = {
    calleeId?: string;
    callType?: CallType | number;
    hostCall: string | number;
    groupId?: string | number;
    session?: string;
    status?: number;
    data?: string | Record<string, unknown>;
    partners?: string[];
};

export type RingRingGroupCallResponse = Record<string, unknown>;
```

---

## `ringRingVoiceCall`

Báo hiệu thiết bị đang đổ chuông cho cuộc gọi 1-1 đến (cmd 11302 - /api/voicecall/ringring, signal 407).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/ringring</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.ringRingVoiceCall(callerId: string, callId: number, options: RingRingVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.ringRingVoiceCall(callerId: string, callId: number, options: RingRingVoiceCallOptions = {},)
```

### Tham số

- `callerId`: User ID của người gọi đến
- `callId`: ID của cuộc gọi
- `options`: Tuỳ chọn mã trạng thái (`status`, mặc định `0`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type RingRingVoiceCallOptions = {
    status?: number;
};

export type RingRingVoiceCallResponse = Record<string, unknown>;
```

---

## `sendRequestGroupCall`

Bước 2 gọi nhóm (cmd 12434 - /api/voicecall/group/request): Phát tín hiệu mời gọi nhóm tới danh sách thành viên.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/request</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.sendRequestGroupCall(groupId: string, options: SendRequestGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendRequestGroupCall(groupId: string, options: SendRequestGroupCallOptions,)
```

### Tham số

- `groupId`: ID của nhóm
- `options`: Thông tin `callId`, `session`, `partners`, `callType` (`0` Audio / `1` Video) và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendRequestGroupCallOptions = {
    calleeId?: string;
    callId: number;
    callType?: CallType | number;
    data?: string | Record<string, unknown>;
    session: string;
    partners: string[];
    hostCall?: string | number;
    rtpAddress?: string;
    rtcpAddress?: string;
    codec?: string;
    extendData?: string | Record<string, unknown>;
    groupName?: string;
    groupAvatar?: string;
    maxUsers?: number;
};

export type SendRequestGroupCallResponse = Record<string, unknown>;
```

---

## `sendRequestVoiceCall`

Bước 2 gọi 1-1 (cmd 11301 - /api/voicecall/request, signal 416): Gửi gói mời gọi (Invite) kèm extendData ZRTC để kích hoạt đổ chuông trên thiết bị người nhận.

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/request</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.sendRequestVoiceCall(calleeId: string, options: SendRequestVoiceCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.sendRequestVoiceCall(calleeId: string, options: SendRequestVoiceCallOptions,)
```

### Tham số

- `calleeId`: User ID của người nhận cuộc gọi
- `options`: Thông tin `callId`, `session`, `rtpAddress`, `rtcpAddress`, `codec` và `extendData`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type SendRequestVoiceCallOptions = {
    callId: number;
    session: string;
    rtpAddress: string;
    rtcpAddress: string;
    codec?: string;
    extendData?: string | Record<string, unknown>;
    subCommand?: number;
};

export type SendRequestVoiceCallResponse = Record<string, unknown>;
```

---

## `sendVoiceCall`

Khởi tạo cuộc gọi Thoại hoặc Video 1-1 trọn gói (tự động thực hiện 2 bước 11300 + 11301 làm đổ chuông máy người nhận).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/requestcall</span> <span class="zca-endpoint-pill">/api/voicecall/request</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.sendVoiceCall(calleeId: string, options: SendVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.sendVoiceCall(calleeId: string, options: SendVoiceCallOptions = {},)
```

### Tham số

- `calleeId`: User ID của người nhận cuộc gọi
- `options`: Tuỳ chọn loại cuộc gọi (`CallType.Audio` hoặc `CallType.Video`) và `callId`

### Kiểu dữ liệu (TypeScript Types)

```ts
export enum CallType {
    Audio = 1,
    Video = 3,
    GroupAudio = 5,
    GroupVideo = 6,
}

/**
 * Chuẩn hoá mã loại cuộc gọi nhóm khi gửi lên máy chủ Zalo (`ZJBuilderInternal::fromZCallStateToGroupState` @ `0x100029620`):
 * - `CallType.GroupAudio` (`5`) hoặc `0` ➔ `0` (Thoại nhóm)
 * - `CallType.GroupVideo` (`6`), `CallType.Video` (`3`) hoặc `1` ➔ `1` (Video nhóm)
 */

export type SendVoiceCallOptions = {
    callType?: CallType;
    callId?: number;
    codec?: string;
};

export type RequestCallServerEntry = {
    rtpaddr?: string;
    rtcpaddr?: string;
    rtpIPv6?: string;
    rtcpIPv6?: string;
    spTcp?: number;
    bonus?: number;
    [key: string]: unknown;
};

export type RequestCallServerInfo = {
    sessId: string;
    fromId?: number;
    toId?: number;
    protocol?: number;
    rtpServer?: string;
    rtcpServer?: string;
    rtpIP?: string;
    rtcpIP?: string;
    rtpIPv6?: string;
    rtcpIPv6?: string;
    servers?: RequestCallServerEntry[];
    zrtpKey?: string;
    zrtc_config?: Record<string, unknown> | string;
    settings?: Record<string, unknown>;
    expiredTime?: number;
    codec?: string;
    [key: string]: unknown;
};

export type SendVoiceCallResponse = {
    callId: number;
    sessId: string;
    rtpServer: string;
    rtcpServer: string;
    zrtpKey?: string;
    expiredTime?: number;
    codec?: string;
    serverInfo?: RequestCallServerInfo;
    requestResult?: unknown;
};
```

---

## `shareScreenGroupCall`

Bắt đầu hoặc dừng chia sẻ màn hình trong cuộc gọi nhóm (cmd 12044 - /api/voicecall/group/sharescreen).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/group/sharescreen</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.shareScreenGroupCall(callId: number, options: ShareScreenGroupCallOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.shareScreenGroupCall(callId: number, options: ShareScreenGroupCallOptions,)
```

### Tham số

- `callId`: ID của cuộc gọi nhóm
- `options`: Thông tin `hostCall`, `userId`, `status`, `audioState`, `videoState` và `data`

### Kiểu dữ liệu (TypeScript Types)

```ts
export type ShareScreenGroupCallOptions = {
    userId?: string | number;
    hostCall: string | number;
    status?: number;
    audioState?: number;
    videoState?: number;
    data?: string | Record<string, unknown>;
};

export type ShareScreenGroupCallResponse = Record<string, unknown>;
```

---

## `unholdVoiceCall`

Khôi phục (Unhold) cuộc gọi 1-1 đang tạm giữ hoặc phản hồi yêu cầu khôi phục (cmd 11309 unholdreq / cmd 11310 unholdresp, signal 413/414).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/unholdreq</span> <span class="zca-endpoint-pill">/api/voicecall/unholdresp</span> <span class="zca-endpoint-pill">/api/voicecall/</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.unholdVoiceCall(toId: string, options: UnholdVoiceCallOptions = {},)
// Hoặc gọi phẳng (Flat Alias):
await api.unholdVoiceCall(toId: string, options: UnholdVoiceCallOptions = {},)
```

### Tham số

- `toId`: User ID của đối phương trong cuộc gọi
- `options`: Đặt `isResponse = true` nếu là gói phản hồi (`unholdresp`)

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UnholdVoiceCallOptions = {
    isResponse?: boolean;
};

export type UnholdVoiceCallResponse = Record<string, unknown>;
```

---

## `updateCallMediaState`

Đồng bộ trạng thái bật/tắt Mic và Camera trong cuộc gọi 1-1 (cmd 12006 - /api/voicecall/conf).

<div class="zca-api-meta"><span class="zca-badge-method get">GET</span><span class="zca-endpoint-pill">api.call</span><span class="zca-endpoint-pill">/api/voicecall/conf</span></div>

```ts
// Gọi theo phân hệ (Domain Namespace):
await api.call.updateCallMediaState(calleeId: string, callId: number, options: UpdateCallMediaStateOptions,)
// Hoặc gọi phẳng (Flat Alias):
await api.updateCallMediaState(calleeId: string, callId: number, options: UpdateCallMediaStateOptions,)
```

### Tham số

- `calleeId`: User ID của đối phương
- `callId`: ID của cuộc gọi
- `options`: Trạng thái `isOnCam`, `isOnMic` và `data` bổ sung

### Kiểu dữ liệu (TypeScript Types)

```ts
export type UpdateCallMediaStateOptions = {
    isOnCam?: boolean | number;
    isOnMic?: boolean | number;
    data?: string | Record<string, unknown>;
};

export type UpdateCallMediaStateResponse = Record<string, unknown>;
```

---
