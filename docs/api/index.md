---
title: "API Explorer - Tra cứu 252 API Zalo SDK (12 Domains)"
description: "Công cụ tìm kiếm và lọc trực tiếp toàn bộ 252 API nguyên bản của @softtynet/zca-js chia theo 12 phân hệ: Auth, Chat, Group, Friend, Profile, Sync, ZCloud, Call, Media, Sticker, Board, Business."
---

# ⚡ Tra cứu & Lọc trực tiếp API Reference

Thư viện **`@softtynet/zca-js` (v2.3.5)** cung cấp tổng cộng **252 API nguyên bản** được tổ chức khoa học thành **12 Domains** theo đúng kiến trúc Zalo PC `26.7.10`.

> 🤖 **Dành cho AI Agents (Cursor, Antigravity, Claude, ChatGPT)**: Bạn có thể nạp trực tiếp ngữ cảnh toàn bộ 252 API qua chuẩn AI SEO tại [`/llms.txt`](https://softtyos.github.io/zca-js-docs/llms.txt) hoặc bản đầy đủ [`/llms-full.txt`](https://softtyos.github.io/zca-js-docs/llms-full.txt).

Sử dụng thanh công cụ bên dưới để lọc tức thì theo **Phân hệ**, **HTTP Method (`GET`/`POST`)**, **Tên hàm** hoặc **Endpoint Zalo** và sao chép nhanh cú pháp gọi hàm:

<ApiExplorer />

## Bảng tổng hợp 12 Phân hệ (Domains)

| Phân hệ | Namespace | Số lượng API | Chức năng chính |
| :--- | :--- | :---: | :--- |
| [**🔐 Xác thực & Phiên (Auth)**](./auth.md) | `api.auth` | **14** | Quản lý thiết bị đăng nhập, xuất/nhập phiên (exportSession), mã QR, Keep-Alive, giải mã GID (Global ID) và Noised ID. |
| [**💬 Tin nhắn & Hội thoại (Chat)**](./chat.md) | `api.chat` | **41** | Gửi/nhận tin nhắn văn bản, ảnh, video, voice, card, thu hồi tin nhắn, ghim/ẩn/lưu trữ hội thoại và trạng thái Đã nhận/Đã xem. |
| [**👥 Nhóm & Cộng đồng (Group)**](./group.md) | `api.group` | **44** | Quản lý nhóm & Cộng đồng, lấy thông tin nhóm (V1/V2/V3/V4), lịch sử tin nhắn Cloud, trạng thái tin nhắn thành viên và phân quyền. |
| [**🤝 Bạn bè & Danh bạ (Friend)**](./friend.md) | `api.friend` | **33** | Quản lý danh sách bạn bè, lời mời kết bạn, gợi ý kết bạn, biệt danh (alias), chặn và kiểm tra trạng thái hoạt động PC/Web. |
| [**🪪 Hồ sơ cá nhân (Profile)**](./profile.md) | `api.profile` | **16** | Thông tin tài khoản, đổi ảnh đại diện, cài đặt quyền riêng tư, trạng thái cảm xúc (Emoji Status) và xác thực EKYC. |
| [**🔄 Đồng bộ Mobile ZDB 4.0 (Sync)**](./sync.md) | `api.sync` | **5** | Đồng bộ toàn bộ lịch sử tin nhắn từ điện thoại sang PC qua giao thức RSA-2048 & ZDB 4.0 AES-256-CBC multi-chunk. |
| [**☁️ Đám mây ZCloud & ZFamily (ZCloud)**](./zcloud.md) | `api.zcloud` | **9** | Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC) và xác thực Media. |
| [**📞 Gọi thoại, Video & Gọi nhóm (Call)**](./call.md) | `api.call` | **30** | Điều khiển trọn vẹn 30 API cuộc gọi thoại, video 1-1, gọi nhóm và bộ máy Call Engine (ZaloRtcSession UDP/SRTP 2 chiều & ZaloCallController). |
| [**🖼️ Kho lưu trữ & Chuyển giọng nói (Media)**](./media.md) | `api.media` | **8** | Truy vấn Kho Lưu Trữ Ảnh/Video, File, Link của nhóm và Cloud của tôi (Send2Me), cùng chuyển đổi Voice-to-Text AI. |
| [**✨ Nhãn dán & Biểu cảm (Sticker)**](./sticker.md) | `api.sticker` | **10** | Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh và nhãn dán cá nhân hóa. |
| [**📌 Bảng tin, Ghi chú, Bình chọn & Lịch hẹn (Board)**](./board.md) | `api.board` | **16** | Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls) và Lịch hẹn (Reminders). |
| [**💼 Zalo Business, Nhãn & Danh mục (Business)**](./business.md) | `api.business` | **26** | Quản lý nhãn phân loại (Labels), tin nhắn nhanh (Quick Messages), trả lời tự động (Auto Reply), Danh mục sản phẩm (Catalog) và Ngân hàng. |