export type OAHighlightItem =
    | string
    | number
    | {
          type?: number;
          uid?: string;
          dpn?: string;
          text?: string;
          value?: string;
          ts?: number;
          [key: string]: unknown;
      };

export type OACustomMessage = {
    msg?: {
        vi?: string;
        en?: string;
        [lang: string]: string | undefined;
    };
    previewTxt?: string;
    highLightsV2?: OAHighlightItem[];
    [key: string]: unknown;
};

export type OAListActionItem = {
    type?: string;
    title?: string;
    description?: string;
    thumb?: string;
    href?: string;
    childnumber?: number;
    action?: string;
    params?: string | Record<string, unknown>;
    childAction?: unknown[];
    [key: string]: unknown;
};

export type OAFooterItem = {
    title?: string;
    label?: string;
    text?: string;
    type?: number | string;
    action?: string;
    href?: string;
    url?: string;
    data?: unknown;
    [key: string]: unknown;
};

export type OAFooterData = {
    type?: number;
    canForward: boolean;
    footerList: OAFooterItem[];
    raw?: unknown;
};

export type OAMessageKind = "oa_chat" | "oa_list" | "info_chat" | "ecard";

export type ParsedOAMessage = {
    /**
     * Phân loại tin nhắn Zalo Official Account (OA):
     * - `"oa_chat"`: Tin nhắn hội thoại trực tiếp 2 chiều từ/đến Zalo OA (`pageMsgs`, có `footerv2`, hoặc `topOut === "1"`).
     * - `"oa_list"`: `msgType === "chat.list.action"` (Danh sách bài viết / thẻ hành động đa phương tiện từ OA).
     * - `"info_chat"`: `msgType === "webchat"` với `content.action === "msginfo.actionlist"` hoặc `"msginfo.action"` (Thông báo sự kiện/trạng thái OA).
     * - `"ecard"`: `msgType === "chat.ecard"` (Thiệp chúc mừng / thông báo sinh nhật / sự kiện OA).
     */
    kind: OAMessageKind;
    /**
     * Nội dung văn bản hiển thị đã được giải mã và điền đầy đủ các biến `%1$s` / `$1$s`.
     */
    text: string;
    /**
     * Văn bản thông báo tiếng Việt (nếu có trong `customMsg.msg.vi`).
     */
    textVi?: string;
    /**
     * Văn bản thông báo tiếng Anh (nếu có trong `customMsg.msg.en`).
     */
    textEn?: string;
    /**
     * Dữ liệu chi tiết đính kèm trong `content` / `params` của tin nhắn OA.
     */
    bundleData: Record<string, unknown>;
    /**
     * Danh sách các thẻ bài viết / nút hành động (dành cho `chat.list.action`).
     */
    items?: OAListActionItem[];
    /**
     * Cấu hình chân trang tương tác (`footerv2`) đính kèm tin nhắn OA (danh sách nút bấm `footerList`, cờ `canForward`).
     */
    footer?: OAFooterData;
    /**
     * Cờ đánh dấu tin nhắn nổi bật từ OA (`topOut === "1"`).
     */
    topOut?: boolean;
    /**
     * Cờ cho phép trả lời trực tiếp tin nhắn OA.
     */
    canReply?: boolean;
    /**
     * Dữ liệu `customMsg` / `params` nguyên bản sau khi parse JSON.
     */
    metadata?: {
        customMsg?: OACustomMessage;
        [key: string]: unknown;
    };
};

export type OAFieldEntry = {
    label?: string;
    value?: string;
    icon?: string;
    [key: string]: unknown;
};

export type OARawInfo = {
    description?: string | null;
    appUrl?: string | null;
    hotline?: OAFieldEntry | null;
    category?: OAFieldEntry | null;
    website?: OAFieldEntry | null;
    address?: OAFieldEntry | null;
    openTime?: OAFieldEntry | null;
    group_msg?: number;
    [key: string]: unknown;
};

export type OADnrStatus = {
    isBlocked: boolean;
    enableDnr: boolean;
    dnrType: number | null;
    dnrText: string | null;
    raw?: unknown;
};

export type OAProfileInfo = {
    oaId: string;
    displayName: string;
    zaloName: string;
    username: string;
    avatar: string;
    cover: string;
    globalId: string;
    type: number;
    isOA: boolean;
    isVerified: boolean;
    isZaloBot: boolean;
    isBlocked: boolean;
    isGroupedMsg: boolean;
    description: string;
    category: string;
    address: string;
    website: string;
    hotline: string;
    openTime: string;
    email: string;
    appUrl: string | null;
    dnrStatus: OADnrStatus;
    oaInfo: OARawInfo | null;
    rawProfile: Record<string, unknown>;
    bizAccount?: Record<string, unknown> | null;
};

export type TOAEventData = {
    uids: string[];
    [key: string]: unknown;
};

export type OAEvent = {
    act: "block" | "unblock" | string;
    act_type: "oa";
    data: TOAEventData;
    isBlocked: boolean;
    oaIds: string[];
};

function safeJsonParse<T = unknown>(input: unknown): T | undefined {
    if (input === null || input === undefined) return undefined;
    if (typeof input === "object") return input as T;
    if (typeof input !== "string") return undefined;
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return undefined;
    }
}

function resolveHighlightValue(item: OAHighlightItem): string {
    if (typeof item === "string") return item;
    if (typeof item === "number") return String(item);
    if (item && typeof item === "object") {
        if (typeof item.dpn === "string" && item.dpn.length > 0) return item.dpn;
        if (typeof item.text === "string" && item.text.length > 0) return item.text;
        if (typeof item.value === "string" && item.value.length > 0) return item.value;
        if (typeof item.uid === "string" && item.uid.length > 0) return item.uid;
        if (typeof item.ts === "number") return new Date(item.ts).toISOString();
    }
    return "";
}

/**
 * Điền các biến `%1$s`, `%2$s`... và `$1$s`, `$2$s`... trong mẫu chuỗi thông báo Zalo OA
 * theo chuẩn hàm `_renderItemReplace` trên Zalo PC.
 */
export function formatOAHighlightText(templateText?: string, highLightsV2?: OAHighlightItem[]): string {
    if (!templateText || typeof templateText !== "string") return "";
    if (!Array.isArray(highLightsV2) || highLightsV2.length === 0) return templateText;

    let result = templateText;
    highLightsV2.forEach((item, index) => {
        const val = resolveHighlightValue(item);
        const idx1 = index + 1;
        result = result.replaceAll(`%${idx1}$s`, val).replaceAll(`$${idx1}$s`, val);
    });
    return result;
}

/**
 * Bóc tách cấu hình chân trang tương tác `footerv2` / `footer` của tin nhắn Zalo OA
 * (`footerList`, `canForward`, `type`).
 */
export function parseOAFooter(rawFooter: unknown): OAFooterData | undefined {
    const parsed = safeJsonParse<Record<string, unknown>>(rawFooter);
    if (!parsed || typeof parsed !== "object") return undefined;

    const dataObj = safeJsonParse<Record<string, unknown>>(parsed.data) ?? parsed;
    const footerListRaw = Array.isArray(dataObj.footerList)
        ? dataObj.footerList
        : Array.isArray(parsed.footerList)
          ? parsed.footerList
          : [];
    const footerList: OAFooterItem[] = footerListRaw
        .map((entry) => safeJsonParse<OAFooterItem>(entry))
        .filter((entry): entry is OAFooterItem => Boolean(entry && typeof entry === "object"));

    const canForwardRaw = dataObj.canForward ?? parsed.canForward;
    const canForward = canForwardRaw === undefined ? true : Boolean(Number(canForwardRaw));
    const type = typeof parsed.type === "number" ? parsed.type : undefined;

    return {
        type,
        canForward,
        footerList,
        raw: parsed,
    };
}

/**
 * Kiểm tra xem một hồ sơ người dùng có phải là Zalo Official Account (OA) hay không.
 * Theo chuẩn `isOA(profile)` trên Zalo PC: `profile.type > 0` hoặc có `profile.oaInfo`.
 */
export function isOAProfile(profile: { type?: number; oaInfo?: unknown } | null | undefined): boolean {
    if (!profile || typeof profile !== "object") return false;
    if (typeof profile.type === "number" && profile.type > 0) return true;
    return Boolean(profile.oaInfo && typeof profile.oaInfo === "object");
}

/**
 * Kiểm tra xem Zalo OA có tích vàng xác thực (Verified OA) hay không.
 * Theo chuẩn `isOAVerifiedByInfo(profile)` trên Zalo PC (`@10388120`):
 * Chuyển `profile.type` sang nhị phân (`Number(type).toString(2)`), kiểm tra độ dài >= 3 và ký tự index `2` là `"1"`.
 * Ví dụ: `type = 7` (`"111"`) -> Verified OA; `type = 5` (`"101"`) -> Verified OA.
 */
export function isOAVerified(profileOrType: { type?: number } | number | null | undefined): boolean {
    const typeNum =
        typeof profileOrType === "number"
            ? profileOrType
            : typeof profileOrType?.type === "number"
              ? profileOrType.type
              : 0;
    if (!(typeNum > 0)) return false;
    const bin = Number(typeNum).toString(2);
    return bin.length >= 3 && bin[2] === "1";
}

/**
 * Kiểm tra xem tài khoản có phải là Zalo Bot hay không.
 * Theo chuẩn `isZaloBotByInfo(profile)` trên Zalo PC (`@10388180`):
 * Chuyển `profile.type` sang nhị phân (`Number(type).toString(2)`), kiểm tra độ dài >= 4 và ký tự đầu tiên là `"1"`.
 */
export function isZaloBot(profileOrType: { type?: number } | number | null | undefined): boolean {
    const typeNum =
        typeof profileOrType === "number"
            ? profileOrType
            : typeof profileOrType?.type === "number"
              ? profileOrType.type
              : 0;
    if (!(typeNum > 0)) return false;
    const bin = Number(typeNum).toString(2);
    return bin.length >= 4 && bin[0] === "1";
}

/**
 * Giải mã trạng thái chặn & Do-Not-Disturb (`oa_status`) của Zalo OA
 * theo chuẩn `_getOAStatus` trên Zalo PC (`@1719856`).
 */
export function parseOADnrStatus(oaStatus: unknown, fallbackIsBlocked?: number | boolean): OADnrStatus {
    const parsed = safeJsonParse<Record<string, unknown>>(oaStatus);
    const isBlocked =
        parsed && "blocked" in parsed
            ? Boolean(Number(parsed.blocked))
            : Boolean(Number(fallbackIsBlocked ?? 0));
    const enableDnr = parsed && "enable_dnr" in parsed ? Boolean(Number(parsed.enable_dnr)) : false;
    const dnrType = parsed && typeof parsed.dnr_type === "number" ? parsed.dnr_type : null;

    let dnrText: string | null = null;
    if (parsed && parsed.dnr_string) {
        if (typeof parsed.dnr_string === "string") {
            dnrText = parsed.dnr_string;
        } else if (typeof parsed.dnr_string === "object" && parsed.dnr_string !== null) {
            const langObj = parsed.dnr_string as Record<string, unknown>;
            dnrText =
                (typeof langObj.vi === "string" && langObj.vi) ||
                (typeof langObj.en === "string" && langObj.en) ||
                null;
        }
    }

    return {
        isBlocked,
        enableDnr,
        dnrType,
        dnrText,
        raw: parsed ?? oaStatus ?? null,
    };
}

/**
 * Chuẩn hóa dữ liệu hồ sơ Zalo Official Account (`getUserInfo` + `getBizAccount`) thành cấu trúc `OAProfileInfo` đồng nhất.
 */
export function normalizeOAProfile(
    oaId: string,
    rawProfile?: Record<string, unknown> | null,
    bizAccount?: Record<string, unknown> | null,
): OAProfileInfo {
    const prof = rawProfile ?? {};
    const oaInfo = (safeJsonParse<OARawInfo>(prof.oaInfo) ?? null) as OARawInfo | null;
    const biz = safeJsonParse<Record<string, unknown>>(bizAccount?.biz) ?? {};
    const type = typeof prof.type === "number" ? prof.type : oaInfo ? 1 : 0;
    const dnrStatus = parseOADnrStatus(prof.oa_status, prof.isBlocked as number | boolean | undefined);

    const pickFieldValue = (entry: OAFieldEntry | null | undefined, fallback?: unknown): string => {
        if (entry && typeof entry === "object" && typeof entry.value === "string" && entry.value.trim()) {
            return entry.value.trim();
        }
        if (typeof fallback === "string" && fallback.trim()) {
            return fallback.trim();
        }
        return "";
    };

    const cateObj = safeJsonParse<Record<string, unknown>>(biz.cate);
    const fallbackCategory =
        (typeof cateObj?.name === "string" && cateObj.name) ||
        (typeof cateObj?.vi === "string" && cateObj.vi) ||
        (typeof biz.cate === "string" ? biz.cate : "");

    const displayName =
        (typeof prof.displayName === "string" && prof.displayName) ||
        (typeof prof.zaloName === "string" && prof.zaloName) ||
        oaId;
    const zaloName =
        (typeof prof.zaloName === "string" && prof.zaloName) ||
        displayName;

    return {
        oaId: String(prof.userId ?? oaId),
        displayName,
        zaloName,
        username: typeof prof.username === "string" ? prof.username : String(prof.userId ?? oaId),
        avatar: typeof prof.avatar === "string" ? prof.avatar : "",
        cover: typeof prof.cover === "string" ? prof.cover : "",
        globalId: typeof prof.globalId === "string" ? prof.globalId : "",
        type,
        isOA: isOAProfile({ type, oaInfo }),
        isVerified: isOAVerified(type),
        isZaloBot: isZaloBot(type),
        isBlocked: dnrStatus.isBlocked,
        isGroupedMsg: Number(oaInfo?.group_msg ?? 0) === 1,
        description:
            (typeof oaInfo?.description === "string" && oaInfo.description.trim()) ||
            (typeof biz.desc === "string" && biz.desc.trim()) ||
            (typeof prof.status === "string" && prof.status.trim()) ||
            "",
        category: pickFieldValue(oaInfo?.category, fallbackCategory),
        address: pickFieldValue(oaInfo?.address, biz.addr),
        website: pickFieldValue(oaInfo?.website, biz.website),
        hotline: pickFieldValue(oaInfo?.hotline, prof.phoneNumber),
        openTime: pickFieldValue(oaInfo?.openTime),
        email: typeof biz.email === "string" ? biz.email.trim() : "",
        appUrl: typeof oaInfo?.appUrl === "string" ? oaInfo.appUrl : null,
        dnrStatus,
        oaInfo,
        rawProfile: prof,
        bizAccount: bizAccount ?? null,
    };
}

/**
 * Bóc tách và giải mã các loại tin nhắn từ Zalo Official Account (OA):
 * - Danh sách bài viết / thẻ hành động OA (`chat.list.action`, bao gồm `l.a.header.full`, `l.a.normal`)
 * - Thông báo sự kiện OA (`webchat` với `action === "msginfo.actionlist"` hoặc `"msginfo.action"`)
 * - Thiệp chúc mừng / sự kiện OA (`chat.ecard`)
 * - Tin nhắn hội thoại trực tiếp 2 chiều với OA (`pageMsgs`, có `footerv2`, hoặc `topOut === "1"`)
 *
 * Trả về `undefined` nếu tin nhắn là tin nhắn cá nhân thông thường không thuộc Zalo OA.
 */
export function parseOAMessage(
    msg: { msgType: string; content: unknown; [key: string]: unknown },
    options?: { isPageMsg?: boolean },
): ParsedOAMessage | undefined {
    if (!msg || typeof msg.msgType !== "string") return undefined;

    const msgType = msg.msgType.trim();
    const rawContent = msg.content;
    const contentObj =
        typeof rawContent === "object" && rawContent !== null
            ? (rawContent as Record<string, unknown>)
            : safeJsonParse<Record<string, unknown>>(rawContent);

    const footer = parseOAFooter(msg.footerv2 ?? msg.footer);
    const topOut = msg.topOut === "1" || msg.topOut === 1 ? true : undefined;

    // 1. Danh sách bài viết / Thẻ hành động OA (`chat.list.action`)
    if (msgType === "chat.list.action") {
        let items: OAListActionItem[] = [];
        if (Array.isArray(rawContent)) {
            items = rawContent as OAListActionItem[];
        } else if (Array.isArray(contentObj)) {
            items = contentObj as unknown as OAListActionItem[];
        } else if (contentObj && typeof contentObj === "object") {
            if (Array.isArray(contentObj.items)) {
                items = contentObj.items as OAListActionItem[];
            } else if (Array.isArray(contentObj.elements)) {
                items = contentObj.elements as OAListActionItem[];
            } else {
                const parsedParams = safeJsonParse<unknown>(contentObj.params);
                if (Array.isArray(parsedParams)) {
                    items = parsedParams as OAListActionItem[];
                } else {
                    items = [contentObj as OAListActionItem];
                }
            }
        }

        const itemLines = items
            .map((it) => {
                const t = typeof it.title === "string" ? it.title.trim() : "";
                const d = typeof it.description === "string" ? it.description.trim() : "";
                if (t && d) return `${t}: ${d}`;
                return t || d;
            })
            .filter(Boolean);

        return {
            kind: "oa_list",
            text: itemLines.join("\n"),
            bundleData: contentObj ?? {},
            items,
            footer,
            topOut,
            canReply: true,
        };
    }

    // 2. Tin nhắn thông báo / ActionList OA (`webchat` với `action === "msginfo.actionlist"` hoặc `"msginfo.action"`)
    if (
        (msgType === "webchat" || msgType === "msginfo.actionlist" || msgType === "msginfo.action") &&
        contentObj &&
        (contentObj.action === "msginfo.actionlist" ||
            contentObj.action === "msginfo.action" ||
            msgType.startsWith("msginfo."))
    ) {
        const paramsObj = safeJsonParse<OACustomMessage>(contentObj.params) ?? (contentObj as OACustomMessage);
        const highLights = paramsObj.highLightsV2;
        const textVi = paramsObj.msg?.vi ? formatOAHighlightText(paramsObj.msg.vi, highLights) : undefined;
        const textEn = paramsObj.msg?.en ? formatOAHighlightText(paramsObj.msg.en, highLights) : undefined;
        const previewTxt =
            typeof paramsObj.previewTxt === "string"
                ? formatOAHighlightText(paramsObj.previewTxt, highLights)
                : undefined;
        const fallbackTitle = typeof contentObj.title === "string" ? contentObj.title : "";
        const fallbackDesc = typeof contentObj.description === "string" ? contentObj.description : "";

        return {
            kind: "info_chat",
            text: textVi || textEn || previewTxt || [fallbackTitle, fallbackDesc].filter(Boolean).join(" — "),
            textVi,
            textEn,
            bundleData: paramsObj as Record<string, unknown>,
            footer,
            topOut,
            metadata: { customMsg: paramsObj },
        };
    }

    // 3. Thiệp chúc mừng / ECard OA (`chat.ecard`)
    if (msgType === "chat.ecard") {
        const paramsObj = safeJsonParse<OACustomMessage>(contentObj?.params) ?? {};
        const highLights = paramsObj.highLightsV2;
        const textVi = paramsObj.msg?.vi ? formatOAHighlightText(paramsObj.msg.vi, highLights) : undefined;
        const textEn = paramsObj.msg?.en ? formatOAHighlightText(paramsObj.msg.en, highLights) : undefined;
        const previewTxt =
            typeof paramsObj.previewTxt === "string"
                ? formatOAHighlightText(paramsObj.previewTxt, highLights)
                : undefined;
        const fallbackTitle = typeof contentObj?.title === "string" ? contentObj.title.trim() : "";
        const fallbackDesc = typeof contentObj?.description === "string" ? contentObj.description.trim() : "";

        return {
            kind: "ecard",
            text: textVi || textEn || previewTxt || [fallbackTitle, fallbackDesc].filter(Boolean).join(" — "),
            textVi,
            textEn,
            bundleData: (contentObj ?? paramsObj) as Record<string, unknown>,
            footer,
            topOut,
            metadata: { customMsg: paramsObj },
        };
    }

    // 4. Tin nhắn hội thoại trực tiếp 2 chiều với Zalo Official Account (`pageMsgs` / `footerv2` / `topOut === "1"`)
    const hasOAMarkers = Boolean(options?.isPageMsg) || footer !== undefined || Boolean(topOut);

    if (hasOAMarkers) {
        let text = "";
        if (typeof rawContent === "string") {
            text = rawContent;
        } else if (contentObj && typeof contentObj === "object") {
            const title = typeof contentObj.title === "string" ? contentObj.title.trim() : "";
            const desc = typeof contentObj.description === "string" ? contentObj.description.trim() : "";
            const href = typeof contentObj.href === "string" ? contentObj.href.trim() : "";
            text = [title, desc].filter(Boolean).join(" — ") || href || JSON.stringify(contentObj);
        }
        return {
            kind: "oa_chat",
            text,
            bundleData: contentObj ?? {},
            footer,
            topOut,
            canReply: true,
        };
    }

    return undefined;
}

export function initializeOAEvent(data: TOAEventData, act: string): OAEvent {
    const uids = Array.isArray(data?.uids) ? data.uids.map(String) : [];
    return {
        act,
        act_type: "oa",
        data: {
            ...data,
            uids,
        },
        isBlocked: act === "block",
        oaIds: uids,
    };
}
