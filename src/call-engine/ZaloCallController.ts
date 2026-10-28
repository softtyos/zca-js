import EventEmitter from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { API } from "../apis.js";
import { CallType, type RequestCallServerInfo } from "../apis/call/sendVoiceCall.js";
import { CallEventType, type CallEvent } from "../models/CallEvent.js";
import { ZaloCallTransport, type ZaloCallIpcMessage, type ZaloCallTransportOptions } from "./ZaloCallTransport.js";
import {
    ZaloRtcSession,
    parseIncomingCallEvent,
    type AcceptIncomingCallOptions,
    type GroupCallPartnerInfo,
    type ParsedIncomingCallInfo,
    type RejectIncomingCallOptions,
    type ZaloCallConnectionParams,
    type ZaloMobileDirectHandoffBundle,
    type ZaloRtcAudioFrameEvent,
    type ZaloRtcMediaStateChangeEvent,
    type ZaloRtcSessionOptions,
    type ZaloRtcSessionState,
    type ZaloRtcVideoAnnexBFrameEvent,
    type ZaloRtcVideoFrameEvent,
} from "./ZaloRtcSession.js";

export type ZaloCallControllerOptions = ZaloCallTransportOptions &
    ZaloRtcSessionOptions & {
        /**
         * Tự động khởi chạy IPC bridge nội bộ (mặc định `false` — ưu tiên dùng trực tiếp `ZaloRtcSession` thuần TypeScript).
         */
        spawnProcess?: boolean;
        /**
         * Tự động lắng nghe `call_event` từ `api.listener` và cập nhật phiên gọi (mặc định `true`).
         */
        autoForwardCallEvents?: boolean;
        /**
         * Tên hiển thị của tài khoản hiện tại.
         */
        displayName?: string;
        /**
         * Ảnh đại diện của tài khoản hiện tại.
         */
        avatar?: string;
        /**
         * Ngôn ngữ giao diện (`"vi"` hoặc `"en"`).
         */
        lang?: string;
    };

export type MakeDesktopCallOptions = {
    calleeId: string | number;
    calleeName?: string;
    calleeAvatar?: string;
    isVideoCall?: boolean;
    enableCamera?: boolean;
};

export type MakeDesktopGroupCallOptions = {
    groupId: string | number;
    groupName?: string;
    groupAvatar?: string;
    isVideoCall?: boolean;
    callType?: CallType;
    enableCamera?: boolean;
    offCameraAtStart?: boolean;
    partners?: Array<string | number>;
    members?: Array<{
        id: number | string;
        name?: string;
        avatar?: string;
    }>;
};

export type ZaloCallSignalPayload = {
    type?: number;
    command?: number;
    seqId?: number;
    params?: string | Record<string, unknown>;
    data?: Record<string, unknown>;
};

export interface ZaloCallControllerEvents {
    ready: [];
    ipc_message: [message: ZaloCallIpcMessage];
    signal_sent: [signalType: number, seqId: number, params: Record<string, unknown>];
    signal_response: [signalType: number, seqId: number, response: unknown];
    connection_params: [params: ZaloCallConnectionParams];
    incoming_call: [info: ParsedIncomingCallInfo];
    active: [params: ZaloCallConnectionParams];
    state: [state: ZaloRtcSessionState];
    audio_frame: [frame: ZaloRtcAudioFrameEvent];
    video_frame: [frame: ZaloRtcVideoFrameEvent];
    video_annexb_frame: [frame: ZaloRtcVideoAnnexBFrameEvent];
    media_state_change: [event: ZaloRtcMediaStateChangeEvent];
    group_partner_sync: [partners: GroupCallPartnerInfo[]];
    pli_request: [event: { timestamp: number }];
    call_ended: [data: unknown];
    call_stats: [data: unknown];
    error: [error: unknown];
    close: [code: number | null];
}

/**
 * Bộ điều phối cuộc gọi thuần TypeScript / Node.js tích hợp sẵn `ZaloRtcSession`
 * và kênh IPC cục bộ (`ZaloCallTransport`) cho giao diện tuỳ chỉnh (HTML/JS, Electron, WebView, Mobile Bridge)
 * mà hoàn toàn không phụ thuộc ứng dụng Zalo PC.
 */
export class ZaloCallController extends EventEmitter<ZaloCallControllerEvents> {
    public readonly transport: ZaloCallTransport;
    private activeSession: ZaloRtcSession | null = null;
    private isEngineReady = false;
    private readonly options: ZaloCallControllerOptions;
    private boundCallEventListener?: (event: CallEvent) => void;
    private ringNotifiedCalls = new Set<number>();

    constructor(
        private readonly api: API,
        options: ZaloCallControllerOptions = {},
    ) {
        super();
        this.options = {
            spawnProcess: false,
            autoForwardCallEvents: true,
            ...options,
        };
        this.transport = new ZaloCallTransport(options);

        this.transport.on("client_connected", () => {
            this.isEngineReady = true;
            this.sendBootstrapConfig();
            this.emit("ready");
        });

        this.transport.on("message", (msg) => {
            void this.handleIpcMessage(msg);
        });
        this.transport.on("error", (err) => {
            this.emit("error", err);
        });
    }

    public isReady(): boolean {
        return this.isEngineReady;
    }

    public getActiveSession(): ZaloRtcSession | null {
        return this.activeSession;
    }

    /**
     * Khởi tạo bộ điều khiển cuộc gọi thuần TypeScript & kênh IPC cục bộ.
     */
    public async start(): Promise<void> {
        await this.transport.start();

        if (this.options.autoForwardCallEvents) {
            this.attachCallEventListener();
        }

        this.isEngineReady = true;
        this.emit("ready");
    }

    private createAndBindSession(): ZaloRtcSession {
        const session = new ZaloRtcSession(this.api, this.options);
        this.activeSession = session;

        session.on("ended", (reason) => {
            this.emit("call_ended", { reason });
        });
        session.on("error", (err) => {
            this.emit("error", err);
        });
        session.on("active", (params) => {
            this.emit("active", params);
        });
        session.on("state", (state) => {
            this.emit("state", state);
        });
        session.on("audio_frame", (frame) => {
            this.emit("audio_frame", frame);
        });
        session.on("video_frame", (frame) => {
            this.emit("video_frame", frame);
        });
        session.on("video_annexb_frame", (frame) => {
            this.emit("video_annexb_frame", frame);
        });
        session.on("media_state_change", (ev) => {
            this.emit("media_state_change", ev);
        });
        session.on("group_partner_sync", (partners) => {
            this.emit("group_partner_sync", partners);
        });
        session.on("pli_request", (ev) => {
            this.emit("pli_request", ev as { timestamp: number });
        });

        return session;
    }

    /**
     * Thực hiện cuộc gọi 1-1 (Thoại hoặc Video) bằng thuật toán thuần TypeScript (`ZaloRtcSession`).
     */
    public async makeCall(options: MakeDesktopCallOptions): Promise<ZaloCallConnectionParams> {
        const isVideo = Boolean(options.isVideoCall);

        if (this.activeSession) {
            await this.activeSession.endCall("new_call").catch(() => {});
        }

        const session = this.createAndBindSession();

        const params = await session.startOutgoingCall(String(options.calleeId), {
            callType: isVideo ? CallType.Video : CallType.Audio,
            offCameraAtStart: isVideo && options.enableCamera === false,
        });

        this.emit("connection_params", params);
        return params;
    }

    /**
     * Giải mã và báo máy đang đổ chuông (`ringRingVoiceCall` / `ringRingGroupCall`) cho cuộc gọi đến.
     */
    public async ringIncomingCall(callEvent: CallEvent | Record<string, unknown>): Promise<ParsedIncomingCallInfo> {
        const info = parseIncomingCallEvent(callEvent, this.api.getContext().uid);
        if (
            this.activeSession &&
            this.activeSession.getState() !== "idle" &&
            this.activeSession.getState() !== "ended" &&
            this.activeSession.getMediaState().callId !== info.callId
        ) {
            await this.activeSession.endCall("new_incoming_call").catch(() => {});
            this.activeSession = null;
        }
        if (!this.activeSession || this.activeSession.getState() === "ended") {
            this.createAndBindSession();
        }
        return this.activeSession!.ringIncomingCall(callEvent);
    }

    /**
     * Chấp nhận cuộc gọi đến (1-1 hoặc Nhóm) bằng `ZaloRtcSession` thuần TypeScript.
     */
    public async acceptIncomingCall(
        callEvent: CallEvent | Record<string, unknown>,
        options: AcceptIncomingCallOptions = {},
    ): Promise<ZaloCallConnectionParams> {
        const info = parseIncomingCallEvent(callEvent, this.api.getContext().uid);
        if (
            this.activeSession &&
            this.activeSession.getState() !== "idle" &&
            this.activeSession.getState() !== "ended" &&
            this.activeSession.getMediaState().callId !== info.callId
        ) {
            await this.activeSession.endCall("accept_new_incoming_call").catch(() => {});
            this.activeSession = null;
        }
        if (!this.activeSession || this.activeSession.getState() === "ended") {
            this.createAndBindSession();
        }
        const params = await this.activeSession!.acceptIncomingCall(callEvent, options);
        this.emit("connection_params", params);
        return params;
    }

    /**
     * Tái kích hoạt kết nối UDP (Re-bind UDP socket + bắt tay `InitCall` + khởi động lại vòng lặp Ping/Media/RTCP)
     * cho phiên gọi đang hoạt động.
     */
    public async reconnectUdp(options: { skipUdpHandshake?: boolean } = {}): Promise<ZaloCallConnectionParams | null> {
        if (!this.activeSession) return null;
        const params = await this.activeSession.reconnectUdp(options);
        this.emit("connection_params", params);
        return params;
    }

    /**
     * Từ chối cuộc gọi đến (1-1 hoặc Nhóm) bằng `ZaloRtcSession` thuần TypeScript.
     */
    public async rejectIncomingCall(
        callEvent: CallEvent | Record<string, unknown>,
        options: RejectIncomingCallOptions = {},
    ): Promise<void> {
        const session = this.activeSession ?? new ZaloRtcSession(this.api, this.options);
        await session.rejectIncomingCall(callEvent, options);
    }

    /**
     * Ngắt kênh UDP cục bộ tại Worker để bàn giao luồng kết nối UDP trực tiếp cho Mobile App.
     */
    public handoffUdpToExternal(routingTokenOverride?: number): ZaloMobileDirectHandoffBundle | null {
        if (!this.activeSession) return null;
        return this.activeSession.handoffUdpToExternal(routingTokenOverride);
    }

    /**
     * Khởi tạo cuộc gọi Nhóm (Group Audio / Video Call) qua kênh IPC và `ZaloRtcSession`.
     */
    public makeGroupCall(options: MakeDesktopGroupCallOptions): void {
        const isVideo =
            options.callType !== undefined
                ? options.callType === CallType.GroupVideo || options.callType === CallType.Video
                : Boolean(options.isVideoCall);
        const memberList =
            Array.isArray(options.members) && options.members.length > 0
                ? options.members.map((m) => ({
                      id: String(m.id),
                      name: m.name ?? "",
                      avatar: m.avatar ?? "",
                  }))
                : (options.partners ?? []).map((id) => ({
                      id: String(id),
                      name: "",
                      avatar: "",
                  }));

        this.transport.send({
            type: "request",
            command: "makeCall",
            data: {
                partner: memberList,
                type: isVideo ? CallType.GroupVideo : CallType.GroupAudio,
                groupInfo: {
                    id: String(options.groupId),
                    name: options.groupName ?? String(options.groupId),
                    avatar: options.groupAvatar ?? "",
                },
            },
        });
    }

    /**
     * Thực hiện cuộc gọi Nhóm (Thoại hoặc Video) trực tiếp bằng `ZaloRtcSession` thuần TypeScript.
     */
    public async makeGroupCallRtc(options: MakeDesktopGroupCallOptions): Promise<ZaloCallConnectionParams> {
        const isVideo =
            options.callType !== undefined
                ? options.callType === CallType.GroupVideo || options.callType === CallType.Video
                : Boolean(options.isVideoCall);

        if (this.activeSession) {
            await this.activeSession.endCall("new_group_call").catch(() => {});
        }

        const session = this.createAndBindSession();
        const memberList =
            Array.isArray(options.members) && options.members.length > 0
                ? options.members.map((m) => ({
                      id: String(m.id),
                      name: m.name ?? "",
                      avatar: m.avatar ?? "",
                  }))
                : (options.partners ?? []).map((id) => ({
                      id: String(id),
                      name: "",
                      avatar: "",
                  }));

        const params = await session.startGroupCall(String(options.groupId), {
            callType: isVideo ? CallType.GroupVideo : CallType.GroupAudio,
            groupName: options.groupName,
            groupAvatar: options.groupAvatar,
            offCameraAtStart: options.offCameraAtStart ?? (isVideo && options.enableCamera === false),
            partners: memberList.map((m) => m.id),
            partnerInfo: memberList,
        });

        this.emit("connection_params", params);
        return params;
    }

    /**
     * Chuyển tiếp một sự kiện `call_event` từ WebSocket Zalo xuống `ZaloCall` dưới dạng gói `{ type: "control" }`.
     */
    public forwardCallEvent(event: CallEvent): void {
        const normalizedAct = this.normalizeControlAct(event.act);
        const parsedInfo = parseIncomingCallEvent(event, this.api.getContext().uid);
        const callId = parsedInfo.callId || Number(event.data.callId ?? event.data.call_id ?? event.data.id ?? 0);

        if (
            event.type === CallEventType.REQUEST ||
            event.type === CallEventType.GROUP_REQUEST ||
            normalizedAct === "request" ||
            normalizedAct === "group_request"
        ) {
            this.emit("incoming_call", parsedInfo);
        }

        if (normalizedAct === "ring_ring" && callId > 0) {
            this.ringNotifiedCalls.add(callId);
        }

        // Trong ZCallInfo::receiveAnswer (0x1000cbf28), ZaloCall yêu cầu trạng thái đã qua bước ring_ring (state 8)
        if (normalizedAct === "answer" && callId > 0 && !this.ringNotifiedCalls.has(callId)) {
            this.ringNotifiedCalls.add(callId);
            this.transport.send({
                type: "control",
                data: {
                    act: "ring_ring",
                    act_type: "voip",
                    inCallStatus: "zalo",
                    data: {
                        callId,
                        codec: typeof event.data.codec === "string" ? event.data.codec : "[]",
                        params:
                            typeof event.data.params === "string"
                                ? event.data.params
                                : JSON.stringify(event.data.params ?? {}),
                    },
                },
            });
        }

        const controlData: Record<string, unknown> = {
            ...event.data,
        };
        if (callId > 0) {
            controlData.callId = callId;
            controlData.id = callId;
        }
        if (normalizedAct === "answer" && controlData.params && typeof controlData.params !== "string") {
            controlData.params = JSON.stringify(controlData.params);
        }

        this.transport.send({
            type: "control",
            data: {
                act: normalizedAct,
                act_type: event.act_type || "voip",
                inCallStatus: "zalo",
                data: controlData,
            },
        });
    }

    /**
     * Đóng phiên gọi hiện tại và giải phóng toàn bộ kênh IPC.
     */
    public async stop(): Promise<void> {
        this.detachCallEventListener();
        this.isEngineReady = false;

        if (this.activeSession) {
            await this.activeSession.endCall("controller_stop").catch(() => {});
            this.activeSession = null;
        }

        await this.transport.close();
    }

    private sendBootstrapConfig(): void {
        const ctx = this.api.getContext();
        const appPath = path.join(os.tmpdir(), `zalo-call-${this.transport.socketId}`);
        try {
            fs.mkdirSync(appPath, { recursive: true });
        } catch {
            // Ignore
        }

        this.transport.send({
            type: "update",
            command: "init",
            data: {
                local: {
                    id: String(ctx.uid ?? "0"),
                    name: this.options.displayName ?? "Zalo User",
                    avatar: this.options.avatar ?? "",
                },
                osInfo: process.platform === "darwin" ? "macOS" : "Windows",
                mainWindowId: 1,
                logPath: appPath,
                zrtcLogPath: appPath,
                dumpPath: appPath,
                clientVersion: ctx.API_VERSION || 689,
                language: this.options.lang ?? ctx.language ?? "vi",
                timeoutMakeCall2ZRtp: 30000,
                enablePreviewDeviceOutgoing: false,
                enablePreviewDeviceIncall: true,
                enableUnstableConnecting: true,
                autoAudioInput: true,
                autoAudioOutput: true,
                defaultAudInputDevice: "",
                defaultAudOutputDevice: "",
                defaultVidDevice: "",
            },
        });
    }

    private async handleIpcMessage(msg: ZaloCallIpcMessage): Promise<void> {
        this.emit("ipc_message", msg);

        if (msg.type === "ready") {
            if (!this.isEngineReady) {
                this.isEngineReady = true;
                this.sendBootstrapConfig();
                this.emit("ready");
            }
            return;
        }

        if ((msg.type === "request" && msg.command === "serverTime") || msg.type === "serverTime") {
            this.transport.send({
                type: "response",
                command: "serverTime",
                data: { timestamp: Date.now() },
            });
            return;
        }

        if ((msg.type === "request" && msg.command === "getAliasName") || msg.type === "getAliasName") {
            const reqData = (msg.data ?? {}) as Record<string, unknown>;
            this.transport.send({
                type: "response",
                command: "getAliasName",
                data: {
                    uid: reqData.uid,
                    aliasName: reqData.name ?? "",
                },
            });
            return;
        }

        if (msg.type === "sendSignal") {
            const inner = (msg.data ?? {}) as Record<string, unknown>;
            const signalType = Number(msg.command ?? inner.type ?? 0);
            const seqId = Number(inner.seqId ?? 0);
            const rawParams = inner.params !== undefined ? inner.params : inner;
            if (signalType > 0) {
                await this.handleSignalFromEngine(signalType, seqId, rawParams);
            }
            return;
        }

        if (msg.type === "endCall" || msg.command === "endCall") {
            this.emit("call_ended", msg.data);
        } else if (msg.type === "stats" || msg.command === "stats") {
            this.emit("call_stats", msg.data);
        }
    }

    /**
     * Cầu nối điều phối toàn bộ 28 mã lệnh `sendSignal` (`401..418` và `501..514`)
     * từ `ZaloCall` sang các hàm trong `api.call.*` và trả kết quả về qua `recvSignal`.
     */
    private async handleSignalFromEngine(type: number, seqId: number, rawParams: unknown): Promise<void> {
        const paramsObj: Record<string, unknown> =
            typeof rawParams === "string"
                ? (JSON.parse(rawParams) as Record<string, unknown>)
                : ((rawParams ?? {}) as Record<string, unknown>);

        this.emit("signal_sent", type, seqId, paramsObj);

        const partnerId = String(
            paramsObj.calleeId ?? paramsObj.callerId ?? paramsObj.partnerId ?? paramsObj.uid ?? "",
        );
        const callId = Number(paramsObj.callId ?? 0);
        const session = String(paramsObj.session ?? paramsObj.sessionId ?? paramsObj.sessId ?? "");
        const rtpAddress = String(paramsObj.rtpAddress ?? "");
        const rtcpAddress = String(paramsObj.rtcpAddress ?? rtpAddress);
        const codec = typeof paramsObj.codec === "string" ? paramsObj.codec : undefined;
        const extendData = paramsObj.extendData as string | Record<string, unknown> | undefined;

        try {
            let result: unknown;

            switch (type) {
                case 401: {
                    const srv = (await this.api.call.requestVoiceCall(partnerId, {
                        callId: callId || undefined,
                        callType: (Number(paramsObj.typeRequest) as CallType) || CallType.Audio,
                        codec,
                    })) as RequestCallServerInfo & { callId: number };

                    const rtpAddr = srv.rtpServer ?? srv.rtpIP ?? srv.servers?.[0]?.rtpaddr ?? "";
                    const rtcpAddr = srv.rtcpServer ?? srv.rtcpIP ?? srv.servers?.[0]?.rtcpaddr ?? rtpAddr;

                    result = {
                        ...srv,
                        id: srv.callId || callId,
                        callId: srv.callId || callId,
                        fromId: srv.fromId ?? String(this.api.getContext().uid ?? ""),
                        toId: srv.toId ?? partnerId,
                        ts: srv.ts ?? Date.now(),
                        protocol: srv.protocol ?? 3,
                        status: 0,
                        sessId: srv.sessId ?? `${partnerId}_${srv.callId || callId}_401`,
                        msg: "",
                        showDebugInfo: 0,
                        showShareScreenBtn: 1,
                        zrtc_config: srv.zrtc_config ?? {},
                        servers: srv.servers ?? [{ rtpaddr: rtpAddr, rtcpaddr: rtcpAddr, spTcp: 1, bonus: 0 }],
                    };
                    break;
                }
                case 402:
                    result = await this.api.call.answerVoiceCall(partnerId, callId, {
                        sessionId: session,
                        rtpAddress,
                        rtcpAddress,
                        codec,
                        extendData,
                        status: Number(paramsObj.status ?? 0),
                    });
                    break;
                case 403:
                    result = await this.api.call.holdVoiceCall(partnerId, {
                        isResponse: false,
                    });
                    break;
                case 404:
                    result = await this.api.call.holdVoiceCall(partnerId, {
                        isResponse: true,
                    });
                    break;
                case 405:
                    result = await this.api.call.cancelVoiceCall(partnerId, callId, {
                        callType: (Number(paramsObj.callType) as CallType) || CallType.Audio,
                    });
                    break;
                case 406:
                    result = await this.api.call.endVoiceCall(partnerId, callId, {
                        status: Number(paramsObj.status ?? 3),
                    });
                    break;
                case 407:
                    result = await this.api.call.ringRingVoiceCall(partnerId, callId, {
                        status: Number(paramsObj.status ?? 0),
                    });
                    break;
                case 408:
                    result = await this.api.call.logEndVoiceCall(partnerId, callId, {
                        duration: Number(paramsObj.duration ?? 0),
                        status: Number(paramsObj.status ?? 0),
                    });
                    break;
                case 409:
                    result = await this.api.call.answerAckVoiceCall(partnerId, callId);
                    break;
                case 411:
                    result = await this.api.call.unholdVoiceCall(partnerId, {
                        isResponse: false,
                    });
                    break;
                case 412:
                    result = await this.api.call.unholdVoiceCall(partnerId, {
                        isResponse: true,
                    });
                    break;
                case 413:
                case 415:
                    result = await this.api.call.updateCallMediaState(partnerId, callId, {
                        isOnCam:
                            paramsObj.isOnCam === -1 ||
                            paramsObj.isOnCam === 0 ||
                            paramsObj.isOnCam === 1 ||
                            typeof paramsObj.isOnCam === "boolean"
                                ? paramsObj.isOnCam
                                : undefined,
                        isOnMic:
                            paramsObj.isOnMic === -1 ||
                            paramsObj.isOnMic === 0 ||
                            paramsObj.isOnMic === 1 ||
                            typeof paramsObj.isOnMic === "boolean"
                                ? paramsObj.isOnMic
                                : undefined,
                    });
                    break;
                case 416: {
                    const reqRes = await this.api.call.sendRequestVoiceCall(partnerId, {
                        callId,
                        session,
                        rtpAddress,
                        rtcpAddress,
                        codec,
                        extendData,
                        subCommand: Number(paramsObj.subCommand ?? 3),
                    });
                    result = {
                        ...(typeof reqRes === "object" && reqRes !== null ? reqRes : {}),
                        status: 0,
                        id: callId,
                    };
                    break;
                }
                case 417:
                    result = await this.api.call.requestAudioToVideoCall(partnerId, callId, {
                        status: Number(paramsObj.status ?? 0),
                    });
                    break;
                case 418:
                    result = await this.api.call.requestShareScreenCall(partnerId, callId, {
                        status: Number(paramsObj.status ?? 1),
                    });
                    break;
                case 501:
                case 12433:
                    result = await this.api.call.requestGroupCall(String(paramsObj.groupId ?? ""), {
                        callId: callId || undefined,
                        typeRequest:
                            paramsObj.typeRequest !== undefined
                                ? (Number(paramsObj.typeRequest) as CallType)
                                : paramsObj.callType !== undefined
                                  ? (Number(paramsObj.callType) as CallType)
                                  : CallType.GroupAudio,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                        partners: (paramsObj.partners as string[] | undefined) ?? [],
                    });
                    break;
                case 502:
                case 12435:
                    result = await this.api.call.addUserGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        groupId: paramsObj.groupId ? String(paramsObj.groupId) : undefined,
                        session,
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        partners: (paramsObj.partners as string[] | undefined) ?? [],
                        rtpAddress,
                        rtcpAddress,
                        codec,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 503:
                case 12436:
                    result = await this.api.call.answerGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        groupId: paramsObj.groupId ? String(paramsObj.groupId) : undefined,
                        session: session || undefined,
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        status: paramsObj.status !== undefined ? Number(paramsObj.status) : undefined,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 504:
                case 12437:
                    result = await this.api.call.cancelGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        groupId: paramsObj.groupId ? String(paramsObj.groupId) : undefined,
                        session: session || undefined,
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        status: paramsObj.status !== undefined ? Number(paramsObj.status) : undefined,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 505:
                case 12438:
                    result = await this.api.call.endGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        groupId: paramsObj.groupId ? String(paramsObj.groupId) : undefined,
                        session: session || undefined,
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        status: paramsObj.status !== undefined ? Number(paramsObj.status) : undefined,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 506:
                case 12439:
                    result = await this.api.call.ringRingGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        groupId: paramsObj.groupId ? String(paramsObj.groupId) : undefined,
                        session: session || undefined,
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        status: paramsObj.status !== undefined ? Number(paramsObj.status) : undefined,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 507:
                case 12440:
                    result = await this.api.call.finishGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        duration: Number(paramsObj.duration ?? 0),
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 508:
                case 12446:
                    result = await this.api.call.getGroupCallState(
                        callId,
                        String(paramsObj.hostCall ?? ""),
                        paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                    );
                    break;
                case 509:
                case 12097:
                    result = await this.api.call.pingGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        userId: paramsObj.userId ? String(paramsObj.userId) : undefined,
                        callState:
                            paramsObj.callstate !== undefined
                                ? Number(paramsObj.callstate)
                                : paramsObj.callState !== undefined
                                  ? Number(paramsObj.callState)
                                  : undefined,
                        audioState:
                            paramsObj.audiostate !== undefined
                                ? Number(paramsObj.audiostate)
                                : paramsObj.audioState !== undefined
                                  ? Number(paramsObj.audioState)
                                  : undefined,
                        videoState:
                            paramsObj.videostate !== undefined
                                ? Number(paramsObj.videostate)
                                : paramsObj.videoState !== undefined
                                  ? Number(paramsObj.videoState)
                                  : undefined,
                        params: paramsObj.params as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 510:
                case 12098:
                    result = await this.api.call.broadcastGroupCallState(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        userId: paramsObj.userId ? String(paramsObj.userId) : undefined,
                        callState:
                            paramsObj.callstate !== undefined
                                ? Number(paramsObj.callstate)
                                : paramsObj.callState !== undefined
                                  ? Number(paramsObj.callState)
                                  : undefined,
                        audioState:
                            paramsObj.audiostate !== undefined
                                ? Number(paramsObj.audiostate)
                                : paramsObj.audioState !== undefined
                                  ? Number(paramsObj.audioState)
                                  : undefined,
                        videoState:
                            paramsObj.videostate !== undefined
                                ? Number(paramsObj.videostate)
                                : paramsObj.videoState !== undefined
                                  ? Number(paramsObj.videoState)
                                  : undefined,
                        params: paramsObj.params as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 511:
                case 12043:
                    result = await this.api.call.joinGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        userId: paramsObj.userId ? String(paramsObj.userId) : undefined,
                        data: paramsObj.params as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 512:
                case 12044:
                    result = await this.api.call.shareScreenGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        userId: paramsObj.userId ? String(paramsObj.userId) : undefined,
                        data: paramsObj.params as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 513:
                case 12434:
                    result = await this.api.call.sendRequestGroupCall(String(paramsObj.groupId ?? ""), {
                        callId,
                        hostCall: paramsObj.hostCall ? String(paramsObj.hostCall) : undefined,
                        session,
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        partners: (paramsObj.partners as string[] | undefined) ?? [],
                        rtpAddress,
                        rtcpAddress,
                        codec,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                case 514:
                case 12447:
                    result = await this.api.call.notifyGroupCall(callId, {
                        hostCall: String(paramsObj.hostCall ?? ""),
                        callType:
                            paramsObj.callType !== undefined ? (Number(paramsObj.callType) as CallType) : undefined,
                        data: paramsObj.data as string | Record<string, unknown> | undefined,
                    });
                    break;
                default:
                    result = {};
                    break;
            }

            this.emit("signal_response", type, seqId, result);
            this.transport.send({
                type: "recvSignal",
                command: type,
                data: {
                    ...(typeof result === "object" && result !== null ? (result as Record<string, unknown>) : {}),
                    type,
                    seqId,
                    errorCode: 0,
                    errorMessage: "Successful.",
                },
            });
        } catch (err) {
            this.emit("error", err);
            this.transport.send({
                type: "recvSignal",
                command: type,
                data: {
                    type,
                    seqId,
                    errorCode: -1,
                    errorMessage: err instanceof Error ? err.message : String(err),
                },
            });
        }
    }

    private normalizeControlAct(act: string): string {
        switch (act) {
            case "ringring":
                return "ring_ring";
            case "end":
            case "endcall":
                return "end_call";
            case "answerack":
                return "answer_ack";
            case "group_ringring":
                return "group_ring_ring";
            case "group_end":
            case "group_endcall":
                return "group_end_call";
            default:
                return act;
        }
    }

    private attachCallEventListener(): void {
        if (this.boundCallEventListener) return;
        this.boundCallEventListener = (event: CallEvent) => {
            this.forwardCallEvent(event);
        };
        try {
            this.api.listener.on("call_event", this.boundCallEventListener);
        } catch {
            // Ignore if listener is not active
        }
    }

    private detachCallEventListener(): void {
        if (!this.boundCallEventListener) return;
        try {
            this.api.listener.removeListener("call_event", this.boundCallEventListener);
        } catch {
            // Ignore
        }
        this.boundCallEventListener = undefined;
    }
}
