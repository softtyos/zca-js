import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const apisDir = path.join(rootDir, "src", "apis");
const docsDir = path.join(rootDir, "docs");
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));

const DOMAIN_META = {
    auth: {
        title: "Xác thực & Phiên (Auth)",
        badge: "api.auth",
        description: "Quản lý thiết bị đăng nhập, mã QR, Keep-Alive, giải mã GID (Global ID) và Noised ID.",
    },
    chat: {
        title: "Tin nhắn & Hội thoại (Chat)",
        badge: "api.chat",
        description: "Gửi/nhận tin nhắn văn bản, ảnh, video, voice, card, thu hồi tin nhắn, ghim/ẩn/lưu trữ hội thoại và trạng thái Đã nhận/Đã xem.",
    },
    group: {
        title: "Nhóm & Cộng đồng (Group)",
        badge: "api.group",
        description: "Quản lý nhóm & Cộng đồng, lấy thông tin nhóm (V1/V2/V3/V4), lịch sử tin nhắn Cloud, trạng thái tin nhắn thành viên và phân quyền.",
    },
    friend: {
        title: "Bạn bè & Danh bạ (Friend)",
        badge: "api.friend",
        description: "Quản lý danh sách bạn bè, lời mời kết bạn, gợi ý kết bạn, biệt danh (alias), chặn và kiểm tra trạng thái hoạt động PC/Web.",
    },
    profile: {
        title: "Hồ sơ cá nhân (Profile)",
        badge: "api.profile",
        description: "Thông tin tài khoản, đổi ảnh đại diện, cài đặt quyền riêng tư, trạng thái cảm xúc (Emoji Status) và xác thực EKYC.",
    },
    sync: {
        title: "Đồng bộ Mobile ZDB 4.0 (Sync)",
        badge: "api.sync",
        description: "Đồng bộ toàn bộ lịch sử tin nhắn từ điện thoại sang PC qua giao thức RSA-2048 & ZDB 4.0 AES-256-CBC multi-chunk.",
    },
    zcloud: {
        title: "Đám mây ZCloud & ZFamily (ZCloud)",
        badge: "api.zcloud",
        description: "Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC) và xác thực Media.",
    },
    call: {
        title: "Gọi thoại & Video 1-1 (Call)",
        badge: "api.call",
        description: "Điều khiển tín hiệu cuộc gọi thoại và gọi video 1-1 (Commands 11300 → 11306: Request, Call, Ringing, Cancel, End).",
    },
    media: {
        title: "Kho lưu trữ & Chuyển giọng nói (Media)",
        badge: "api.media",
        description: "Truy vấn Kho Lưu Trữ Ảnh/Video, File, Link của nhóm và Cloud của tôi (Send2Me), cùng chuyển đổi Voice-to-Text AI.",
    },
    sticker: {
        title: "Nhãn dán & Biểu cảm (Sticker)",
        badge: "api.sticker",
        description: "Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh và nhãn dán cá nhân hóa.",
    },
    board: {
        title: "Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board)",
        badge: "api.board",
        description: "Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls) và Lịch hẹn (Reminders).",
    },
    business: {
        title: "Zalo Business, Nhãn & Danh mục (Business)",
        badge: "api.business",
        description: "Quản lý nhãn phân loại (Labels), tin nhắn nhanh (Quick Messages), trả lời tự động (Auto Reply), Danh mục sản phẩm (Catalog) và Ngân hàng.",
    },
};

function escapeMarkdownHtml(str) {
    // Only escape < and > when outside backticks
    return str
        .split(/(`[^`]*`)/g)
        .map((part) => (part.startsWith("`") ? part : part.replace(/</g, "&lt;").replace(/>/g, "&gt;")))
        .join("");
}

function parseApiFile(filePath, domain, name) {
    const content = fs.readFileSync(filePath, "utf-8");

    // Extract JSDoc comment immediately before `return async function`
    const jsdocMatch = content.match(/\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*return\s+async\s+function/);
    let summary = "";
    const paramsDoc = [];

    if (jsdocMatch) {
        const rawLines = jsdocMatch[1]
            .split("\n")
            .map((l) => l.replace(/^\s*\*\s?/, "").trim());
        const summaryLines = [];
        for (const line of rawLines) {
            if (line.startsWith("@param")) {
                const pMatch = line.match(/^@param\s+(\S+)\s*(.*)$/);
                if (pMatch) {
                    paramsDoc.push({ name: pMatch[1], desc: escapeMarkdownHtml(pMatch[2] || "") });
                }
            } else if (!line.startsWith("@")) {
                if (line) summaryLines.push(line);
            }
        }
        summary = escapeMarkdownHtml(summaryLines.join(" "));
    }

    // Extract function signature
    const fnMatch = content.match(/return\s+async\s+function\s+[a-zA-Z0-9_]*\s*\(([\s\S]*?)\)\s*(?::\s*[^{]+)?\s*\{/);
    let signatureParams = "";
    if (fnMatch) {
        signatureParams = fnMatch[1]
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" ");
    }

    // Extract endpoints
    const endpoints = Array.from(new Set(content.match(/\/api\/[a-zA-Z0-9_/-]+/g) || []));

    // Extract HTTP method
    const methodMatch = content.match(/method:\s*"(GET|POST|PUT|DELETE)"/);
    const httpMethod = methodMatch ? methodMatch[1] : "GET";

    // Extract exported types
    const typeBlocks = [];
    const typeRegex = /export\s+(?:type|interface|enum)\s+[A-Za-z0-9_]+[\s\S]*?(?=\nexport\s+|\nfunction\s+|\nconst\s+|$)/g;
    let m;
    while ((m = typeRegex.exec(content)) !== null) {
        typeBlocks.push(m[0].trim());
    }

    return {
        name,
        domain,
        summary: summary || `API \`${name}\` thuộc phân hệ \`${domain}\`.`,
        paramsDoc,
        signature: `api.${domain}.${name}(${signatureParams})`,
        flatSignature: `api.${name}(${signatureParams})`,
        endpoints,
        httpMethod,
        typeBlocks,
    };
}

function generateAllDocs() {
    fs.mkdirSync(path.join(docsDir, "guide"), { recursive: true });
    fs.mkdirSync(path.join(docsDir, "api"), { recursive: true });
    fs.mkdirSync(path.join(docsDir, ".vitepress"), { recursive: true });

    const domains = Object.keys(DOMAIN_META);
    const domainApis = {};
    let totalApis = 0;

    for (const domain of domains) {
        const domainPath = path.join(apisDir, domain);
        if (!fs.existsSync(domainPath)) continue;
        const files = fs
            .readdirSync(domainPath)
            .filter((f) => f.endsWith(".ts"))
            .sort();
        domainApis[domain] = files.map((file) => {
            totalApis++;
            const name = file.slice(0, -3);
            return parseApiFile(path.join(domainPath, file), domain, name);
        });
    }

    // 1. Write docs/api/<domain>.md
    for (const domain of domains) {
        const meta = DOMAIN_META[domain];
        const apis = domainApis[domain] || [];
        const lines = [
            `# ${meta.title}`,
            "",
            `> Namespace: \`${meta.badge}\` (hoặc gọi trực tiếp \`api.<methodName>\`) — **${apis.length} API**`,
            "",
            meta.description,
            "",
            "## Danh sách nhanh",
            "",
            "| Phương thức | HTTP | Endpoint Zalo | Mô tả |",
            "| :--- | :---: | :--- | :--- |",
        ];

        for (const a of apis) {
            const ep = a.endpoints.length > 0 ? a.endpoints.map((e) => `\`${e}\``).join("<br/>") : "`N/A`";
            const cleanSummary = a.summary.replace(/\|/g, "\\|");
            lines.push(`| [\`${a.name}\`](#${a.name.toLowerCase()}) | \`${a.httpMethod}\` | ${ep} | ${cleanSummary} |`);
        }

        lines.push("", "---", "");

        for (const a of apis) {
            lines.push(`## \`${a.name}\``);
            lines.push("");
            lines.push(a.summary);
            lines.push("");
            if (a.endpoints.length > 0) {
                lines.push(`- **Endpoint**: ${a.endpoints.map((e) => `\`${a.httpMethod} ${e}\``).join(", ")}`);
            }
            lines.push(`- **Domain call**: \`${a.signature}\``);
            lines.push(`- **Alias phẳng**: \`${a.flatSignature}\``);
            lines.push("");

            if (a.paramsDoc.length > 0) {
                lines.push("### Tham số");
                lines.push("");
                for (const p of a.paramsDoc) {
                    lines.push(`- \`${p.name}\`: ${p.desc}`);
                }
                lines.push("");
            }

            if (a.typeBlocks.length > 0) {
                lines.push("### Kiểu dữ liệu (TypeScript Types)");
                lines.push("");
                lines.push("```ts");
                lines.push(a.typeBlocks.join("\n\n"));
                lines.push("```");
                lines.push("");
            }

            lines.push("---", "");
        }

        fs.writeFileSync(path.join(docsDir, "api", `${domain}.md`), lines.join("\n"), "utf-8");
    }

    // 2. Write docs/api/index.md
    const apiIndexLines = [
        "# Tổng quan API Reference",
        "",
        `Thư viện **\`@softtynet/zca-js\` (v${pkg.version})** cung cấp tổng cộng **${totalApis} API nguyên bản** được tổ chức khoa học thành **12 Domains** theo đúng kiến trúc Zalo PC \`26.7.10\`.`,
        "",
        "Tất cả các phương thức đều có thể được gọi theo 2 cách tương đương:",
        "- **Qua Namespace phân hệ (Khuyên dùng)**: `await api.group.getGroupInfo(groupId)`",
        "- **Qua Phương thức phẳng (Tương thích ngược 100%)**: `await api.getGroupInfo(groupId)`",
        "",
        "## Danh mục 12 Phân hệ (Domains)",
        "",
        "| Phân hệ | Namespace | Số lượng API | Chức năng chính |",
        "| :--- | :--- | :---: | :--- |",
    ];

    for (const domain of domains) {
        const meta = DOMAIN_META[domain];
        const count = (domainApis[domain] || []).length;
        apiIndexLines.push(
            `| [**${meta.title}**](./${domain}.md) | \`${meta.badge}\` | **${count}** | ${meta.description} |`,
        );
    }

    fs.writeFileSync(path.join(docsDir, "api", "index.md"), apiIndexLines.join("\n"), "utf-8");

    // 3. Write docs/index.md
    const homeLines = [
        "---",
        "layout: home",
        "",
        "hero:",
        '  name: "@softtynet/zca-js"',
        '  text: "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun"',
        `  tagline: "Phiên bản v${pkg.version} — ${totalApis} API nguyên bản trên 12 Domains, Đồng bộ ZDB 4.0 từ điện thoại, Giải mã ZCloud AES-256-CBC, Gọi thoại/Video Call và Bảo toàn số nguyên 64-bit."`,
        "  actions:",
        "    - theme: brand",
        '      text: "Bắt đầu nhanh →"',
        '      link: "/guide/getting-started"',
        "    - theme: alt",
        `      text: "Tra cứu ${totalApis} API (12 Domains)"`,
        '      link: "/api/"',
        "    - theme: alt",
        '      text: "GitHub (softtyos/zca-js)"',
        '      link: "https://github.com/softtyos/zca-js"',
        "",
        "features:",
        "  - title: Kiến trúc 12 Domains Hiện Đại",
        `    details: "Tổ chức ${totalApis} API nguyên bản thành 12 phân hệ trực quan (api.auth, api.chat, api.group, api.sync, api.zcloud, api.call, api.media...) với Lazy Memoized Getters và tương thích ngược 100%."`,
        "  - title: Đồng bộ Mobile ZDB 4.0 & Catch-up Sync",
        '    details: "Hỗ trợ đầy đủ luồng đồng bộ lịch sử tin nhắn từ điện thoại sang PC (RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate)."',
        "  - title: ZCloud, MediaStore & 64-bit Precision",
        '    details: "Tích hợp sẵn preParseJsonIds bảo toàn tuyệt đối UID 19 chữ số (owner_id, group_id) trong Kho lưu trữ MediaStore và giải mã khóa ZCloud 98yS."',
        "  - title: Tín hiệu Gọi Thoại & Video Call 1-1",
        '    details: "Điều khiển trọn vẹn vòng đời cuộc gọi thoại và video (11300 -> 11306) cùng hệ thống lắng nghe sự kiện WebSocket thời gian thực."',
        "---",
        "",
    ];
    fs.writeFileSync(path.join(docsDir, "index.md"), homeLines.join("\n"), "utf-8");

    // 4. Write docs/guide/getting-started.md
    const gettingStartedLines = [
        "# Bắt đầu nhanh (Getting Started)",
        "",
        "## 1. Cài đặt",
        "",
        "```bash",
        "npm install @softtynet/zca-js",
        "# hoặc dùng Bun",
        "bun add @softtynet/zca-js",
        "```",
        "",
        "## 2. Đăng nhập tài khoản Zalo",
        "",
        "### Đăng nhập bằng mã QR (`loginQR`)",
        "",
        "```ts",
        'import { Zalo } from "@softtynet/zca-js";',
        "",
        "const zalo = new Zalo({ selfListen: true, logging: true });",
        "const api = await zalo.loginQR();",
        "",
        'console.log("Đăng nhập thành công UID:", api.getOwnId());',
        "```",
        "",
        "### Đăng nhập bằng Cookie & IMEI đã lưu (`login`)",
        "",
        "```ts",
        'import { Zalo } from "@softtynet/zca-js";',
        "",
        "const zalo = new Zalo({ selfListen: true });",
        "const api = await zalo.login({",
        "    cookie: savedCookies,",
        '    imei: "your-device-imei",',
        '    userAgent: "Mozilla/5.0 ...",',
        "});",
        "```",
        "",
        "## 3. Sử dụng các API theo 12 Domains",
        "",
        "```ts",
        "// 1. Phân hệ Group (api.group)",
        "const groupInfo = await api.group.getGroupInfo(groupId);",
        "const chatHistory = await api.group.getGroupChatHistory(groupId, { count: 50, cursor: 0 });",
        "const msgStatus = await api.group.getGroupMessageStatus(groupId, memberUids);",
        "",
        "// 2. Phân hệ Media Store (api.media)",
        "const previewMedia = await api.media.getMediaStorePreview(groupId, 50);",
        'const mediaList = await api.media.getConversationMedia({ groupId, mediaType: "media", limit: 50 });',
        "",
        "// 3. Phân hệ Chat (api.chat)",
        'await api.chat.sendMessage({ msg: "Xin chào từ @softtynet/zca-js!" }, threadId, ThreadType.Group);',
        "",
        "// 4. Phân hệ ZCloud (api.zcloud)",
        "const usage = await api.zcloud.getUsageZCloud();",
        "```",
        "",
        "## 4. Cấu hình `imageMetadataGetter` khi gửi ảnh từ đĩa",
        "",
        "```ts",
        'import { Zalo } from "@softtynet/zca-js";',
        'import sharp from "sharp";',
        'import fs from "node:fs";',
        "",
        "const zalo = new Zalo({",
        "    imageMetadataGetter: async (filePath) => {",
        "        const buf = await fs.promises.readFile(filePath);",
        "        const meta = await sharp(buf).metadata();",
        "        return { width: meta.width, height: meta.height, size: meta.size || buf.length };",
        "    },",
        "});",
        "```",
    ];
    fs.writeFileSync(path.join(docsDir, "guide", "getting-started.md"), gettingStartedLines.join("\n"), "utf-8");

    // 5. Write docs/guide/architecture.md
    const archLines = [
        "# Kiến trúc SDK & Cơ chế Giải mã Lõi",
        "",
        "## 1. Kiến trúc 12 Domains (Lazy Memoized Getters)",
        "",
        "`@softtynet/zca-js` tự động ánh xạ toàn bộ các API nguyên bản vào 12 phân hệ trên đối tượng `api`:",
        "",
        "- `api.auth`: Xác thực, QR, phiên đăng nhập, giải mã `globalId` (`encryptGids` / `decryptGids`) & `getNoisedIds`.",
        "- `api.chat`: Tin nhắn 1-1 & nhóm, thu hồi đơn/đa tin nhắn (`undoMultiMessage`), hội thoại ghim/ẩn/lưu trữ.",
        "- `api.group`: Quản lý nhóm/Cộng đồng, lịch sử Cloud (`getGroupChatHistory`, `getGroupCloudMessagePath`), trạng thái đã xem (`getGroupMessageStatus`).",
        "- `api.friend`: Bạn bè, danh bạ V2 (`getPhonebookV2`), biệt danh V2 (`getAliasListV2`), kiểm tra online PC/Web (`getFriendsActivePCWeb`).",
        "- `api.profile`: Hồ sơ cá nhân, Emoji Status, xác thực tài khoản.",
        "- `api.sync`: Đồng bộ lịch sử tin nhắn từ Mobile (`requestSyncFromPhone`, `pullMobile`, `getSyncData`).",
        "- `api.zcloud`: ZCloud & ZFamily (`getCloudViewerKey`, `getUsageZCloud`, `verifyCloudMedia`).",
        "- `api.call`: Gọi thoại & Video 1-1 (`sendVoiceCall`, `cancelVoiceCall`, `endVoiceCall`).",
        "- `api.media`: Kho lưu trữ Media/File/Link nhóm & cá nhân (`getConversationMedia`, `getMediaStorePreview`, `getPersonalMedia`), `voiceToText`.",
        "- `api.sticker`: Nhãn dán, danh mục V2, gợi ý nhãn dán theo từ khóa.",
        "- `api.board`: Bảng tin nhóm, Tin ghim (`getListPinTopics`), Bình chọn (`getPollDetail`), Lịch hẹn (`getListReminder`).",
        "- `api.business`: Nhãn hội thoại (`getLabels`), Tin nhắn nhanh, Trả lời tự động, Danh mục sản phẩm.",
        "",
        "## 2. Cơ chế Bảo toàn Số nguyên 64-bit (`preParseJsonIds`)",
        "",
        "Nhiều API của Zalo (như `/api/mediastore/list` và `/api/mediastore/preview`) trả về UID 19 chữ số dưới dạng **JSON Number không có dấu ngoặc kép** (ví dụ `\"owner_id\": 4829384719283746192`).",
        "",
        "Nếu gọi trực tiếp `JSON.parse()`, JavaScript (IEEE-754 double) sẽ làm tròn mất 3 chữ số cuối khi vượt quá `Number.MAX_SAFE_INTEGER` (`9007199254740991`).",
        "",
        "`@softtynet/zca-js` tích hợp sẵn hàm `preParseJsonIds` ngay trong tầng `handleZaloResponse` trước khi `JSON.parse()` (giống cơ chế `preParse` trong `app.asar` của Zalo PC), giúp tự động chuyển các trường ID 16+ chữ số (`owner_id`, `group_id`, `uidFrom`, `idTo`, `globalMsgId`, `cliMsgId`...) sang kiểu `string` chính xác tuyệt đối.",
    ];
    fs.writeFileSync(path.join(docsDir, "guide", "architecture.md"), archLines.join("\n"), "utf-8");

    // 6. Write docs/guide/listeners.md
    const listenerLines = [
        "# Lắng nghe Sự kiện WebSocket (`api.listener`)",
        "",
        "Hệ thống `api.listener` duy trì kết nối WebSocket thời gian thực với Zalo Server và phát ra các sự kiện đã được giải mã đầy đủ:",
        "",
        "```ts",
        'api.listener.on("message", (msg) => {',
        "    console.log(msg.threadId, msg.data.uidFrom, msg.data.content);",
        "});",
        "",
        'api.listener.on("reaction", (reaction) => {',
        "    console.log(reaction.threadId, reaction.data.uidFrom, reaction.data.content);",
        "});",
        "",
        'api.listener.on("undo", (undoEvent) => {',
        "    console.log(undoEvent.threadId, undoEvent.data);",
        "});",
        "",
        'api.listener.on("seen_messages", (seen) => {',
        "    console.log(seen);",
        "});",
        "",
        'api.listener.on("group_event", (event) => {',
        "    console.log(event.type, event.groupId, event.data);",
        "});",
        "",
        'api.listener.on("sync_event", (syncEvent) => {',
        "    console.log(syncEvent.phase, syncEvent.decryptedPayload);",
        "});",
        "",
        'api.listener.on("call_event", (callEvent) => {',
        "    console.log(callEvent.subCmd, callEvent.callId, callEvent.fromUid);",
        "});",
        "",
        'api.listener.on("voice2text_event", (v2t) => {',
        "    console.log(v2t.msgId, v2t.text);",
        "});",
        "",
        "api.listener.start({ retryOnClose: true });",
        "```",
    ];
    fs.writeFileSync(path.join(docsDir, "guide", "listeners.md"), listenerLines.join("\n"), "utf-8");

    // 7. Write docs/.vitepress/config.mts
    const sidebarApiItems = domains.map((d) => ({
        text: `${DOMAIN_META[d].title} (${(domainApis[d] || []).length})`,
        link: `/api/${d}`,
    }));

    const configContent = `import { defineConfig } from "vitepress";

export default defineConfig({
    lang: "vi-VN",
    title: "@softtynet/zca-js",
    description: "Tài liệu chính thức bộ SDK Zalo API (@softtynet/zca-js) dành cho Node.js, TypeScript và Bun",
    base: process.env.VITEPRESS_BASE || "/",
    ignoreDeadLinks: true,
    themeConfig: {
        nav: [
            { text: "Trang chủ", link: "/" },
            { text: "Hướng dẫn", link: "/guide/getting-started" },
            { text: "API Reference (${totalApis})", link: "/api/" },
            { text: "Đồng bộ & Gọi thoại", link: "/INTEGRATION_GUIDE_SYNC_AND_CALL" },
        ],
        search: {
            provider: "local",
        },
        sidebar: [
            {
                text: "Bắt đầu & Kiến trúc",
                items: [
                    { text: "Cài đặt & Bắt đầu nhanh", link: "/guide/getting-started" },
                    { text: "Kiến trúc 12 Domains & 64-bit ID", link: "/guide/architecture" },
                    { text: "Lắng nghe WebSocket (Listener)", link: "/guide/listeners" },
                ],
            },
            {
                text: "Tài liệu Chuyên sâu (R&D)",
                items: [
                    { text: "Tích hợp Đồng bộ ZDB 4.0 & Call", link: "/INTEGRATION_GUIDE_SYNC_AND_CALL" },
                    { text: "Kiến trúc Tổng thể & Giao thức", link: "/ARCHITECTURE_AND_API_REFERENCE" },
                    { text: "React Native & WebRTC Voice/Video", link: "/RND_REACT_NATIVE_AND_VOICE_VIDEO_CALL" },
                ],
            },
            {
                text: "Tra cứu API (12 Domains)",
                items: [
                    { text: "Tổng quan 12 Domains", link: "/api/" },
                    ...${JSON.stringify(sidebarApiItems, null, 20)},
                ],
            },
        ],
        socialLinks: [
            { icon: "github", link: "https://github.com/softtyos/zca-js" },
        ],
        footer: {
            message: "Phát hành theo giấy phép MIT License.",
            copyright: "Copyright © 2026 Softtynet Co., Ltd.",
        },
    },
});
`;

    fs.writeFileSync(path.join(docsDir, ".vitepress", "config.mts"), configContent, "utf-8");
    console.log(`✅ Generated VitePress documentation for ${totalApis} APIs across ${domains.length} domains.`);
}

generateAllDocs();
