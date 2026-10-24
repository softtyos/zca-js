import { defineConfig } from "vitepress";

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
            { text: "API Reference (224)", link: "/api/" },
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
                    ...[
          {
                    "text": "Xác thực & Phiên (Auth) (13)",
                    "link": "/api/auth"
          },
          {
                    "text": "Tin nhắn & Hội thoại (Chat) (41)",
                    "link": "/api/chat"
          },
          {
                    "text": "Nhóm & Cộng đồng (Group) (44)",
                    "link": "/api/group"
          },
          {
                    "text": "Bạn bè & Danh bạ (Friend) (33)",
                    "link": "/api/friend"
          },
          {
                    "text": "Hồ sơ cá nhân (Profile) (16)",
                    "link": "/api/profile"
          },
          {
                    "text": "Đồng bộ Mobile ZDB 4.0 (Sync) (5)",
                    "link": "/api/sync"
          },
          {
                    "text": "Đám mây ZCloud & ZFamily (ZCloud) (9)",
                    "link": "/api/zcloud"
          },
          {
                    "text": "Gọi thoại & Video 1-1 (Call) (3)",
                    "link": "/api/call"
          },
          {
                    "text": "Kho lưu trữ & Chuyển giọng nói (Media) (8)",
                    "link": "/api/media"
          },
          {
                    "text": "Nhãn dán & Biểu cảm (Sticker) (10)",
                    "link": "/api/sticker"
          },
          {
                    "text": "Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board) (16)",
                    "link": "/api/board"
          },
          {
                    "text": "Zalo Business, Nhãn & Danh mục (Business) (26)",
                    "link": "/api/business"
          }
],
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
