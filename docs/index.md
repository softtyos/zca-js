---
layout: home
title: "@softtynet/zca-js — Bộ SDK Zalo API Hiện Đại (252 APIs, 12 Domains)"
description: "Tài liệu chính thức @softtynet/zca-js v2.3.5 bởi Softtynet Co., Ltd. Bộ SDK Zalo API cho Node.js, TypeScript & Bun với 252 API trên 12 Domains, Đồng bộ ZDB 4.0, ZCloud AES-256-CBC và Gọi thoại/Video Call."

hero:
  name: "@softtynet/zca-js"
  text: "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun"
  tagline: "Phiên bản v2.3.5 phát triển bởi Softtynet Co., Ltd. — 252 API nguyên bản trên 12 Domains, Đồng bộ ZDB 4.0 từ điện thoại, Giải mã ZCloud AES-256-CBC, Gọi thoại/Video Call và Bảo toàn số nguyên 64-bit."
  image:
    src: /logo.svg
    alt: "@softtynet/zca-js Logo"
  actions:
    - theme: brand
      text: "⚡ Khám phá & Lọc 252 API →"
      link: "/api/"
    - theme: alt
      text: "🛠️ Kịch bản Thực chiến (Cookbook)"
      link: "/guide/cookbook"
    - theme: alt
      text: "🤖 AI Context (llms-full.txt)"
      link: "https://softtyos.github.io/zca-js-docs/llms-full.txt"

features:
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>'
    title: Kiến trúc 12 Domains Hiện Đại
    details: "Tổ chức 252 API nguyên bản thành 12 phân hệ trực quan (api.auth, api.chat, api.group, api.sync, api.zcloud, api.call, api.media...) với Lazy Memoized Getters và tương thích ngược 100%."
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>'
    title: Đồng bộ Mobile ZDB 4.0 & Catch-up Sync
    details: "Hỗ trợ đầy đủ luồng đồng bộ lịch sử tin nhắn từ điện thoại sang PC (RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate)."
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'
    title: ZCloud, MediaStore & 64-bit Precision
    details: "Tích hợp sẵn preParseJsonIds & ws-cipher storeAsString bảo toàn tuyệt đối UID 19 chữ số (owner_id, group_id) trên cả HTTP và WebSocket."
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>'
    title: Chuẩn AI SEO & GEO (llms.txt Ready)
    details: "Tích hợp sẵn chuẩn /llms.txt, /llms-full.txt, Models Reference và Cookbook thực chiến giúp lập trình viên & AI Coding Agents nắm bắt tức thì."
---

<HeroShowcase />

<DomainGrid />
