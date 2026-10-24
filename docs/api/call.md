---
title: "Gọi thoại & Video 1-1 (Call) (api.call) - 3 APIs"
description: "Điều khiển tín hiệu cuộc gọi thoại và gọi video 1-1 (Commands 11300 → 11306: Request, Call, Ringing, Cancel, End). Tra cứu chi tiết 3 phương thức thuộc phân hệ api.call trong bộ SDK @softtynet/zca-js."
---

# 📞 Gọi thoại & Video 1-1 (Call)

> Namespace: `api.call` (hoặc gọi trực tiếp `api.<methodName>`) — **3 API nguyên bản**

Điều khiển tín hiệu cuộc gọi thoại và gọi video 1-1 (Commands 11300 → 11306: Request, Call, Ringing, Cancel, End).

## Danh sách nhanh

| Phương thức | HTTP | Endpoint Zalo | Mô tả |
| :--- | :---: | :--- | :--- |
| [`cancelVoiceCall`](#cancelvoicecall) | `GET` | `/api/voicecall/cancel` | Huỷ cuộc gọi đang đổ chuông trước khi người nhận bắt máy (`/api/voicecall/cancel`, command `11305`). |
| [`endVoiceCall`](#endvoicecall) | `GET` | `/api/voicecall/endcall` | Kết thúc cuộc gọi thoại / video (`/api/voicecall/endcall`, command `11306`). |
| [`sendVoiceCall`](#sendvoicecall) | `GET` | `/api/voicecall/requestcall`<br/>`/api/voicecall/request` | Khởi tạo cuộc gọi thoại / video (Signaling 2 bước: `/api/voicecall/requestcall` command `11300` + `/api/voicecall/request` command `11301`) giúp đổ chuông trực tiếp trên thiết bị của người nhận. |

---

## `cancelVoiceCall`

Huỷ cuộc gọi đang đổ chuông trước khi người nhận bắt máy (`/api/voicecall/cancel`, command `11305`).

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
    callType?: CallType;
    status?: number;
};

export type CancelVoiceCallResponse = Record<string, unknown>;
```

---

## `endVoiceCall`

Kết thúc cuộc gọi thoại / video (`/api/voicecall/endcall`, command `11306`).

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

## `sendVoiceCall`

Khởi tạo cuộc gọi thoại / video (Signaling 2 bước: `/api/voicecall/requestcall` command `11300` + `/api/voicecall/request` command `11301`) giúp đổ chuông trực tiếp trên thiết bị của người nhận.

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
}

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
    rtpServer?: string;
    rtcpServer?: string;
    rtpIP?: string;
    rtcpIP?: string;
    rtpIPv6?: string;
    rtcpIPv6?: string;
    servers?: RequestCallServerEntry[];
    zrtpKey?: string;
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
