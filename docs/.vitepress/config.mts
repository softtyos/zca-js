import { defineConfig } from "vitepress";

const SITE_URL = "https://softtyos.github.io/zca-js-docs";

export default defineConfig({
    lang: "vi-VN",
    title: "@softtynet/zca-js",
    titleTemplate: ":title | Softtynet Zalo SDK",
    description:
        "Tài liệu chính thức bộ SDK Zalo API (@softtynet/zca-js v2.3.7) phát triển bởi Softtynet Co., Ltd. dành cho Node.js, TypeScript và Bun (256 APIs, 12 Domains).",
    base: process.env.VITEPRESS_BASE || "/",
    ignoreDeadLinks: true,
    lastUpdated: true,
    sitemap: {
        hostname: "https://softtyos.github.io/zca-js-docs/",
    },
    head: [
        ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
        ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
        [
            "link",
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap",
            },
        ],
        ["link", { rel: "icon", type: "image/svg+xml", href: "/zca-js-docs/favicon.svg" }],
        ["meta", { name: "author", content: "Softtynet Co., Ltd." }],
        [
            "meta",
            {
                name: "keywords",
                content:
                    "zalo api, @softtynet/zca-js, zca-js, softtynet, zalo sdk, zalo bot nodejs, zalo typescript, zalo zdb sync, zalo cloud message",
            },
        ],
        ["meta", { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:site_name", content: "@softtynet/zca-js — Softtynet Zalo SDK" }],
        ["meta", { property: "og:locale", content: "vi_VN" }],
        ["meta", { property: "og:image", content: "https://softtyos.github.io/zca-js-docs/og-banner.svg" }],
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        ["meta", { name: "twitter:image", content: "https://softtyos.github.io/zca-js-docs/og-banner.svg" }],
        [
            "link",
            {
                rel: "alternate",
                type: "text/plain",
                title: "LLM Summary Context (llms.txt)",
                href: "https://softtyos.github.io/zca-js-docs/llms.txt",
            },
        ],
        [
            "link",
            {
                rel: "alternate",
                type: "text/plain",
                title: "LLM Full API Reference (llms-full.txt)",
                href: "https://softtyos.github.io/zca-js-docs/llms-full.txt",
            },
        ],
        [
            "script",
            { type: "application/ld+json" },
            '{"@context":"https://schema.org","@type":"SoftwareSourceCode","name":"@softtynet/zca-js","version":"2.3.7","description":"Bộ thư viện SDK Zalo API hiện đại dành cho Node.js, TypeScript và Bun với 256 API nguyên bản trên 12 Domains, phát triển bởi Softtynet Co., Ltd.","programmingLanguage":["TypeScript","JavaScript"],"runtimePlatform":["Node.js","Bun"],"codeRepository":"https://github.com/softtyos/zca-js","url":"https://softtyos.github.io/zca-js-docs/","license":"https://opensource.org/licenses/MIT","author":{"@type":"Organization","name":"Softtynet Co., Ltd.","url":"https://github.com/softtyos"},"keywords":["zalo api","zca-js","@softtynet/zca-js","softtynet","zalo sdk nodejs","zalo bot typescript","zalo pc protocol","zalo cloud message"]}',
        ],
    ],
    transformPageData(pageData) {
        const canonicalUrl = `${SITE_URL}/${pageData.relativePath}`.replace(/index\.md$/, "").replace(/\.md$/, ".html");

        pageData.frontmatter.head ??= [];
        pageData.frontmatter.head.push(
            ["link", { rel: "canonical", href: canonicalUrl }],
            ["meta", { property: "og:url", content: canonicalUrl }],
            [
                "meta",
                { property: "og:title", content: pageData.frontmatter.title || pageData.title || "@softtynet/zca-js" },
            ],
            [
                "meta",
                {
                    property: "og:description",
                    content:
                        pageData.frontmatter.description ||
                        pageData.description ||
                        "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun bởi Softtynet Co., Ltd.",
                },
            ],
        );
    },
    themeConfig: {
        logo: "/logo.svg",
        siteTitle: "@softtynet/zca-js",
        nav: [
            { text: "Trang chủ", link: "/" },
            { text: "Hướng dẫn & Thực chiến", link: "/guide/getting-started" },
            { text: "⚡ API Explorer (256)", link: "/api/" },
            { text: "📦 Models & Enums", link: "/api/models" },
            { text: "🤖 llms.txt", link: "https://softtyos.github.io/zca-js-docs/llms.txt" },
        ],
        search: {
            provider: "local",
        },
        outline: {
            level: [2, 3],
            label: "Mục lục trang",
        },
        sidebar: [
            {
                text: "🚀 Bắt đầu & Thực chiến",
                items: [
                    { text: "Cài đặt & Bắt đầu nhanh", link: "/guide/getting-started" },
                    { text: "🛠️ Kịch bản Thực chiến (Cookbook)", link: "/guide/cookbook" },
                    { text: "Kiến trúc 12 Domains & 64-bit ID", link: "/guide/architecture" },
                    { text: "Lắng nghe WebSocket (Listener)", link: "/guide/listeners" },
                ],
            },
            {
                text: "⚡ Tra cứu API & Models",
                items: [
                    { text: "🔍 API Explorer (256 APIs)", link: "/api/" },
                    { text: "📦 Models, Enums & Errors", link: "/api/models" },
                ],
            },
            {
                text: "💬 Phân hệ Chat & Nhóm (Cốt lõi)",
                collapsed: false,
                items: [
                    {
                        text: "💬 Tin nhắn & Hội thoại (Chat) (41)",
                        link: "/api/chat",
                    },
                    {
                        text: "👥 Nhóm & Cộng đồng (Group) (44)",
                        link: "/api/group",
                    },
                    {
                        text: "🤝 Bạn bè & Danh bạ (Friend) (33)",
                        link: "/api/friend",
                    },
                    {
                        text: "🪪 Hồ sơ cá nhân (Profile) (16)",
                        link: "/api/profile",
                    },
                ],
            },
            {
                text: "🔄 Đồng bộ & Dữ liệu Nâng cao",
                collapsed: false,
                items: [
                    {
                        text: "🔄 Đồng bộ Mobile ZDB 4.0 (Sync) (5)",
                        link: "/api/sync",
                    },
                    {
                        text: "☁️ Đám mây ZCloud & ZFamily (ZCloud) (9)",
                        link: "/api/zcloud",
                    },
                    {
                        text: "📞 Gọi thoại, Video & Gọi nhóm (Call) (30)",
                        link: "/api/call",
                    },
                    {
                        text: "🖼️ Kho lưu trữ & Chuyển giọng nói (Media) (8)",
                        link: "/api/media",
                    },
                ],
            },
            {
                text: "💼 Tiện ích & Doanh nghiệp",
                collapsed: false,
                items: [
                    {
                        text: "🔐 Xác thực & Phiên (Auth) (14)",
                        link: "/api/auth",
                    },
                    {
                        text: "✨ Nhãn dán & Biểu cảm (Sticker) (10)",
                        link: "/api/sticker",
                    },
                    {
                        text: "📌 Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board) (16)",
                        link: "/api/board",
                    },
                    {
                        text: "💼 Zalo Business, OA, Nhãn & Danh mục (Business) (30)",
                        link: "/api/business",
                    },
                ],
            },
            {
                text: "📚 Tài liệu Chuyên sâu (R&D)",
                collapsed: true,
                items: [
                    { text: "Tích hợp Đồng bộ ZDB 4.0 & Call", link: "/INTEGRATION_GUIDE_SYNC_AND_CALL" },
                    { text: "Kiến trúc Tổng thể & Giao thức", link: "/ARCHITECTURE_AND_API_REFERENCE" },
                    { text: "React Native & WebRTC Voice/Video", link: "/RND_REACT_NATIVE_AND_VOICE_VIDEO_CALL" },
                ],
            },
        ],
        socialLinks: [{ icon: "github", link: "https://github.com/softtyos/zca-js" }],
        footer: {
            message: "Phát hành theo giấy phép MIT License • Tích hợp chuẩn AI SEO (/llms.txt & /llms-full.txt)",
            copyright: "Copyright © 2026 Softtynet Co., Ltd. All rights reserved.",
        },
    },
});
