---
layout: home
title: "@softtynet/zca-js — Bộ SDK Zalo API Hiện Đại (225 APIs, 12 Domains)"
description: "Tài liệu chính thức @softtynet/zca-js v2.3.4 bởi Softtynet Co., Ltd. Bộ SDK Zalo API cho Node.js, TypeScript & Bun với 225 API trên 12 Domains, Đồng bộ ZDB 4.0, ZCloud AES-256-CBC và Gọi thoại/Video Call."

hero:
  name: "@softtynet/zca-js"
  text: "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun"
  tagline: "Phiên bản v2.3.4 phát triển bởi Softtynet Co., Ltd. — 225 API nguyên bản trên 12 Domains, Đồng bộ ZDB 4.0 từ điện thoại, Giải mã ZCloud AES-256-CBC, Gọi thoại/Video Call và Bảo toàn số nguyên 64-bit."
  image:
    src: /logo.svg
    alt: "@softtynet/zca-js Logo"
  actions:
    - theme: brand
      text: "⚡ Khám phá & Lọc 225 API →"
      link: "/api/"
    - theme: alt
      text: "🛠️ Kịch bản Thực chiến (Cookbook)"
      link: "/guide/cookbook"
    - theme: alt
      text: "🤖 AI Context (llms-full.txt)"
      link: "https://softtyos.github.io/zca-js-docs/llms-full.txt"

features:
  - icon: 🧩
    title: Kiến trúc 12 Domains Hiện Đại
    details: "Tổ chức 225 API nguyên bản thành 12 phân hệ trực quan (api.auth, api.chat, api.group, api.sync, api.zcloud, api.call, api.media...) với Lazy Memoized Getters và tương thích ngược 100%."
  - icon: 🔄
    title: Đồng bộ Mobile ZDB 4.0 & Catch-up Sync
    details: "Hỗ trợ đầy đủ luồng đồng bộ lịch sử tin nhắn từ điện thoại sang PC (RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate)."
  - icon: 🛡️
    title: ZCloud, MediaStore & 64-bit Precision
    details: "Tích hợp sẵn preParseJsonIds & ws-cipher storeAsString bảo toàn tuyệt đối UID 19 chữ số (owner_id, group_id) trên cả HTTP và WebSocket."
  - icon: 🤖
    title: Chuẩn AI SEO & GEO (llms.txt Ready)
    details: "Tích hợp sẵn chuẩn /llms.txt, /llms-full.txt, Models Reference và Cookbook thực chiến giúp lập trình viên & AI Coding Agents nắm bắt tức thì."
---

<DomainGrid />
