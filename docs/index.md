---
layout: home

hero:
  name: "@softtynet/zca-js"
  text: "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun"
  tagline: "Phiên bản v2.3.3 — 224 API nguyên bản trên 12 Domains, Đồng bộ ZDB 4.0 từ điện thoại, Giải mã ZCloud AES-256-CBC, Gọi thoại/Video Call và Bảo toàn số nguyên 64-bit."
  actions:
    - theme: brand
      text: "Bắt đầu nhanh →"
      link: "/guide/getting-started"
    - theme: alt
      text: "Tra cứu 224 API (12 Domains)"
      link: "/api/"
    - theme: alt
      text: "GitHub (softtyos/zca-js)"
      link: "https://github.com/softtyos/zca-js"

features:
  - title: Kiến trúc 12 Domains Hiện Đại
    details: "Tổ chức 224 API nguyên bản thành 12 phân hệ trực quan (api.auth, api.chat, api.group, api.sync, api.zcloud, api.call, api.media...) với Lazy Memoized Getters và tương thích ngược 100%."
  - title: Đồng bộ Mobile ZDB 4.0 & Catch-up Sync
    details: "Hỗ trợ đầy đủ luồng đồng bộ lịch sử tin nhắn từ điện thoại sang PC (RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate)."
  - title: ZCloud, MediaStore & 64-bit Precision
    details: "Tích hợp sẵn preParseJsonIds bảo toàn tuyệt đối UID 19 chữ số (owner_id, group_id) trong Kho lưu trữ MediaStore và giải mã khóa ZCloud 98yS."
  - title: Tín hiệu Gọi Thoại & Video Call 1-1
    details: "Điều khiển trọn vẹn vòng đời cuộc gọi thoại và video (11300 -> 11306) cùng hệ thống lắng nghe sự kiện WebSocket thời gian thực."
---
