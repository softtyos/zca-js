import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const apisDir = path.join(rootDir, "src", "apis");
const modelsDir = path.join(rootDir, "src", "models");
const errorsDir = path.join(rootDir, "src", "Errors");
const docsDir = path.join(rootDir, "docs");
const publicDir = path.join(docsDir, "public");
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));

const SITE_URL = "https://softtyos.github.io/zca-js-docs";

const DOMAIN_META = {
    auth: {
        icon: "🔐",
        title: "Xác thực & Phiên (Auth)",
        badge: "api.auth",
        description:
            "Quản lý thiết bị đăng nhập, xuất/nhập phiên (exportSession), mã QR, Keep-Alive, đổi mật khẩu, E2EE và giải mã GID (Global ID) / Noised ID.",
    },
    chat: {
        icon: "💬",
        title: "Tin nhắn, Hội thoại & Dịch AI (Chat)",
        badge: "api.chat",
        description:
            "Gửi/nhận tin nhắn văn bản, ảnh, video, voice, card, thu hồi tin nhắn, Dịch đa ngôn ngữ bằng Zalo AI, đánh dấu tin nhắn quan trọng, chặn chia sẻ và trạng thái Đã nhận/Đã xem.",
    },
    group: {
        icon: "👥",
        title: "Nhóm & Cộng đồng (Group)",
        badge: "api.group",
        description:
            "Quản lý nhóm & Cộng đồng, lấy thông tin nhóm (V1/V2/V3/V4), lịch sử tin nhắn Cloud, trạng thái tin nhắn thành viên, chủ đề (Topic) và phân quyền.",
    },
    friend: {
        icon: "🤝",
        title: "Bạn bè & Danh bạ (Friend)",
        badge: "api.friend",
        description:
            "Quản lý danh sách bạn bè, lời mời kết bạn, gợi ý kết bạn, biệt danh (alias), chặn, đồng bộ danh bạ và kiểm tra trạng thái hoạt động PC/Web.",
    },
    profile: {
        icon: "🪪",
        title: "Hồ sơ cá nhân & Emoji Status (Profile)",
        badge: "api.profile",
        description:
            "Thông tin tài khoản, Mini Profile, đổi ảnh đại diện, cài đặt quyền riêng tư, trạng thái cảm xúc (Emoji Status), hồ sơ Doanh nghiệp và xác thực EKYC.",
    },
    sync: {
        icon: "🔄",
        title: "Đồng bộ Mobile ZDB 4.0 (Sync)",
        badge: "api.sync",
        description:
            "Đồng bộ toàn bộ lịch sử tin nhắn từ điện thoại sang PC qua giao thức RSA-2048 & ZDB 4.0 AES-256-CBC multi-chunk, kiểm tra Backup, Cross-DB và đồng bộ hành động Media.",
    },
    zcloud: {
        icon: "☁️",
        title: "Đám mây ZCloud & ZFamily (ZCloud)",
        badge: "api.zcloud",
        description:
            "Truy vấn dung lượng My Cloud / ZCloud, ZFamily, khóa giải mã ViewerKey (98yS AES-256-CBC), lấy link tải hàng loạt, quản lý hàng đợi và di chuyển dữ liệu.",
    },
    call: {
        icon: "📞",
        title: "Gọi thoại, Video & Gọi nhóm (Call)",
        badge: "api.call",
        description:
            "Điều khiển trọn vẹn 30 API cuộc gọi thoại, video 1-1, gọi nhóm và bộ máy Call Engine (ZaloRtcSession UDP/SRTP 2 chiều & ZaloCallController).",
    },
    media: {
        icon: "🖼️",
        title: "Kho lưu trữ & Chuyển giọng nói (Media)",
        badge: "api.media",
        description:
            "Truy vấn Kho Lưu Trữ Ảnh/Video, File, Link của nhóm và Cloud của tôi (Send2Me), cùng chuyển đổi Voice-to-Text AI.",
    },
    sticker: {
        icon: "✨",
        title: "Nhãn dán, GIF Giphy/Guggy & Hiệu ứng (Sticker)",
        badge: "api.sticker",
        description:
            "Tìm kiếm nhãn dán, danh mục nhãn dán V2, nhãn dán gợi ý theo ngữ cảnh, kho ảnh động GIF (Giphy, Guggy, Tenor) và hiệu ứng tin nhắn nền (Message Effects).",
    },
    board: {
        icon: "📌",
        title: "Bảng tin, Bình chọn, Lịch hẹn & Zalo To-Do (Board)",
        badge: "api.board",
        description:
            "Quản lý Tin ghim (Pin Topics), Ghi chú nhóm (Notes), Bình chọn (Polls), Lịch hẹn nhóm & 1-1 (Reminders), Bảng tin bạn bè và Giao việc Zalo To-Do.",
    },
    business: {
        icon: "💼",
        title: "Zalo Business, OA, Nhãn CRM & Danh mục (Business)",
        badge: "api.business",
        description:
            "Quản lý Zalo Official Account (getOAProfile, blockOA, unblockOA, convertOAIds), Nhãn phân loại hội thoại CRM (Labels), Tin nhắn nhanh (Quick Messages), Trả lời tự động (Auto Reply), Danh mục sản phẩm (Catalog) và Ngân hàng.",
    },
};

const VI_DESCRIPTIONS = {
    getListDevice: "Lấy danh sách các thiết bị đang đăng nhập tài khoản Zalo hiện tại.",
    getQR: "Lấy mã QR của danh sách người dùng theo UID.",
    lostFocus: "Gửi tín hiệu thông báo ứng dụng chuyển sang chế độ chạy nền (Background).",
    scanURL: "Quét và kiểm tra độ an toàn của đường dẫn URL thông qua bộ lọc bảo mật Zalo.",
    updateActiveStatus: "Cập nhật trạng thái hoạt động (Online / Offline / Ping) của tài khoản.",
    updateLang: "Cập nhật ngôn ngữ hiển thị của phiên tài khoản Zalo.",
    addReaction: "Thả biểu cảm (Reaction: Tim, Like, Haha, Wow, Buồn, Giận) vào một tin nhắn cá nhân hoặc nhóm.",
    addUnreadMark: "Đánh dấu hội thoại là chưa đọc (Unread).",
    deleteChat: "Xóa lịch sử cuộc trò chuyện cá nhân hoặc nhóm ở phía tài khoản hiện tại.",
    deleteMessage: "Xóa một tin nhắn cụ thể (chỉ xóa ở phía tôi hoặc thu hồi).",
    forwardMessage: "Chuyển tiếp (Forward) tin nhắn văn bản hoặc đính kèm tới nhiều hội thoại cùng lúc.",
    getArchivedChatList: "Lấy danh sách các hội thoại đã được lưu trữ (Archived Chats).",
    getAutoDeleteChat: "Lấy danh sách các hội thoại đang bật chế độ tin nhắn tự xóa.",
    getHiddenConversations: "Lấy danh sách các cuộc trò chuyện đang được ẩn bằng mã PIN.",
    getMute: "Lấy danh sách các cuộc trò chuyện đang tắt thông báo (Mute).",
    getPinConversations: "Lấy danh sách các cuộc trò chuyện đang được ghim trên đầu danh sách chat.",
    getUnreadMark: "Lấy danh sách các cuộc trò chuyện đang được đánh dấu là chưa đọc.",
    parseLink: "Phân tích siêu dữ liệu (Title, Description, Thumbnail) của một đường dẫn URL trước khi gửi.",
    preloadConversations:
        "Tải trước tin nhắn cuối cùng và trạng thái đã đọc của các hội thoại đang hoạt động (command 10053).",
    removeUnreadMark: "Gỡ bỏ đánh dấu chưa đọc trên cuộc trò chuyện.",
    resetHiddenConversPin: "Đặt lại (Reset) mã PIN bảo vệ trò chuyện ẩn.",
    sendBankCard: "Gửi danh thiếp thông tin tài khoản ngân hàng (Bank Card) vào cuộc trò chuyện.",
    sendCard: "Gửi danh thiếp liên hệ Zalo (Contact Card / QR) vào hội thoại cá nhân hoặc nhóm.",
    sendDeliveredEvent: "Gửi tín hiệu xác nhận Đã nhận (Delivered) cho một hoặc nhiều tin nhắn.",
    sendLink: "Gửi tin nhắn kèm bản xem trước liên kết (Link Preview) vào hội thoại.",
    sendMessage:
        "Gửi tin nhắn văn bản, trích dẫn (Quote), nhắc tên (@Mention) hoặc tệp đính kèm (Ảnh/File/GIF) tới cá nhân hoặc nhóm.",
    sendReport: "Gửi báo cáo vi phạm (Report Abuse) đối với người dùng hoặc cuộc trò chuyện.",
    sendSeenEvent: "Gửi tín hiệu xác nhận Đã xem (Seen) cho các tin nhắn trong hội thoại.",
    sendSticker: "Gửi nhãn dán (Sticker) vào cuộc trò chuyện cá nhân hoặc nhóm.",
    sendTypingEvent: "Gửi tín hiệu trạng thái Đang soạn tin nhắn (Typing...) tới người nhận hoặc nhóm.",
    sendVideo: "Gửi tệp video kèm ảnh thu nhỏ (Thumbnail) và thời lượng vào hội thoại cá nhân hoặc nhóm.",
    sendVoice: "Gửi tin nhắn thoại (Voice / Audio MP3 / AAC) vào hội thoại cá nhân hoặc nhóm.",
    setHiddenConversations: "Ẩn hoặc bỏ ẩn một hoặc nhiều cuộc trò chuyện bằng mã PIN.",
    setMute: "Bật hoặc tắt chế độ im lặng (Mute thông báo) cho cuộc trò chuyện theo khoảng thời gian.",
    setPinnedConversations: "Ghim hoặc bỏ ghim cuộc trò chuyện lên đầu danh sách.",
    undo: "Thu hồi (Undo) một tin nhắn đã gửi với tất cả mọi người trong cuộc trò chuyện.",
    updateArchivedChatList: "Đưa cuộc trò chuyện vào mục Lưu trữ (Archive) hoặc khôi phục ra ngoài.",
    updateAutoDeleteChat:
        "Cấu hình thời gian tự động xóa tin nhắn cho cuộc trò chuyện (1 ngày, 7 ngày, 30 ngày hoặc tắt).",
    updateHiddenConversPin: "Đặt mới hoặc thay đổi mã PIN bảo mật cho tính năng Trò chuyện ẩn.",
    addGroupBlockedMember: "Chặn một hoặc nhiều thành viên khỏi nhóm (không cho tham gia lại).",
    addGroupDeputy: "Bổ nhiệm thành viên làm Phó nhóm (Quản trị viên).",
    addUserToGroup: "Thêm trực tiếp một hoặc nhiều người dùng vào nhóm.",
    changeGroupAvatar: "Thay đổi ảnh đại diện (Avatar) của nhóm.",
    changeGroupName: "Đổi tên hiển thị của nhóm chat hoặc Cộng đồng.",
    changeGroupOwner: "Chuyển nhượng quyền Trưởng nhóm (Owner) cho một thành viên khác trong nhóm.",
    createGroup: "Tạo một nhóm chat mới kèm tên nhóm, danh sách thành viên ban đầu và ảnh đại diện.",
    deleteGroupInviteBox: "Xóa lời mời tham gia nhóm trong hộp thư lời mời nhóm.",
    disableGroupLink: "Vô hiệu hóa (Tắt) đường dẫn tham gia nhóm bằng liên kết (Invite Link).",
    disperseGroup: "Giải tán nhóm chat vĩnh viễn (yêu cầu quyền Trưởng nhóm).",
    enableGroupLink: "Kích hoạt hoặc tạo mới đường dẫn liên kết mời tham gia nhóm.",
    getGroupBlockedMember: "Lấy danh sách các tài khoản đang bị chặn khỏi nhóm.",
    getGroupInfo:
        "Lấy thông tin chi tiết của một hoặc nhiều nhóm (tên nhóm, cài đặt lockViewMember, creatorId, adminIds, memVerList) qua /api/group/getmg-v2.",
    getGroupInviteBoxInfo: "Lấy thông tin chi tiết của một lời mời vào nhóm cụ thể.",
    getGroupInviteBoxList: "Lấy danh sách tất cả lời mời tham gia nhóm đang chờ trong hộp thư.",
    getGroupLinkDetail: "Lấy chi tiết đường dẫn mời tham gia nhóm (Link邀請) của một nhóm mà bạn đang tham gia.",
    getGroupLinkInfo:
        "Tra cứu thông tin nhóm và danh sách thành viên theo trang từ đường dẫn nhóm công khai (https://zalo.me/g/...).",
    getGroupMembersInfo:
        "Giải mã hàng loạt thông tin hồ sơ thành viên (displayName, zaloName, avatar, globalId) từ danh sách UID qua /api/social/group/members.",
    getPendingGroupMembers: "Lấy danh sách các yêu cầu xin vào nhóm đang chờ Quản trị viên phê duyệt.",
    getRelatedFriendGroup:
        "Kiểm tra danh sách các nhóm chung giữa tài khoản hiện tại và danh sách UID truyền vào qua /api/friend/group/related.",
    inviteUserToGroups: "Gửi lời mời tham gia một hoặc nhiều nhóm tới người dùng.",
    joinGroupInviteBox: "Chấp nhận lời mời tham gia nhóm từ hộp thư lời mời.",
    joinGroupLink: "Tham gia vào nhóm thông qua đường dẫn liên kết mời (Group Link).",
    leaveGroup: "Rời khỏi một hoặc nhiều nhóm chat (hỗ trợ rời nhóm im lặng silent).",
    removeGroupBlockedMember: "Gỡ chặn (Unblock) cho người dùng khỏi danh sách chặn của nhóm.",
    removeGroupDeputy: "Cách chức Phó nhóm (thu hồi quyền Quản trị viên) của thành viên.",
    removeUserFromGroup: "Mời ra khỏi nhóm (Kick) một hoặc nhiều thành viên.",
    reviewPendingMemberRequest: "Phê duyệt (Chấp nhận hoặc Từ chối) yêu cầu xin tham gia nhóm của thành viên mới.",
    updateGroupSettings:
        "Cập nhật các thiết lập quyền hạn của nhóm (ẩn thành viên lockViewMember, duyệt thành viên joinAppr, khóa nhắn tin lockSendMsg...).",
    upgradeGroupToCommunity: "Nâng cấp nhóm thường lên Cộng đồng (Community - tối đa 1000 thành viên).",
    acceptFriendRequest: "Đồng ý lời mời kết bạn từ một người dùng.",
    blockUser: "Chặn tin nhắn từ một người dùng theo UID.",
    blockViewFeed: "Chặn hoặc mở chặn quyền xem Nhật ký (Timeline Feed) đối với một người bạn.",
    changeFriendAlias: "Đặt hoặc đổi tên gợi nhớ (Biệt danh / Alias) cho bạn bè.",
    findUser: "Tìm kiếm thông tin tài khoản Zalo thông qua số điện thoại.",
    findUserByUsername: "Tìm kiếm thông tin tài khoản Zalo thông qua Username.",
    getAliasList: "Lấy danh sách toàn bộ tên gợi nhớ (Alias) đã đặt cho bạn bè.",
    getAllFriends: "Lấy toàn bộ danh sách bạn bè trong danh bạ tài khoản hiện tại.",
    getCloseFriends: "Lấy danh sách bạn thân (Close Friends).",
    getFriendBoardList: "Lấy thông tin bảng tin chung với một người bạn.",
    getFriendOnlines: "Lấy danh sách bạn bè đang trực tuyến (Online) kèm trạng thái thiết bị.",
    getFriendRecommendations: "Lấy danh sách gợi ý kết bạn và lời mời kết bạn đã nhận.",
    getFriendRequestStatus: "Kiểm tra trạng thái quan hệ bạn bè và lời mời kết bạn với một UID.",
    getMultiUsersByPhones: "Tra cứu hàng loạt thông tin tài khoản Zalo từ danh sách nhiều số điện thoại cùng lúc.",
    getSentFriendRequest: "Lấy danh sách các lời mời kết bạn mà tài khoản hiện tại đã gửi đi nhưng chưa được phản hồi.",
    lastOnline: "Kiểm tra thời điểm truy cập (Online) gần nhất của một người dùng.",
    rejectFriendRequest: "Từ chối lời mời kết bạn từ một người dùng.",
    removeFriend: "Hủy kết bạn (Xóa bạn) với một người dùng trong danh bạ.",
    removeFriendAlias: "Xóa tên gợi nhớ (Biệt danh / Alias) đã đặt cho một người bạn.",
    sendFriendRequest: "Gửi lời mời kết bạn kèm lời chào tới một người dùng theo UID.",
    unblockUser: "Bỏ chặn tin nhắn đối với một người dùng.",
    undoFriendRequest: "Thu hồi (Hủy) lời mời kết bạn đã gửi trước đó.",
    changeAccountAvatar: "Thay đổi ảnh đại diện (Avatar) cho tài khoản cá nhân.",
    deleteAvatar: "Xóa một hoặc nhiều ảnh đại diện cũ trong kho ảnh đại diện.",
    getAvatarList: "Lấy danh sách lịch sử các ảnh đại diện đã từng sử dụng của tài khoản.",
    getAvatarUrlProfile: "Lấy đường dẫn ảnh đại diện của danh sách hồ sơ người dùng.",
    getFullAvatar: "Lấy ảnh đại diện kích thước gốc (Full HD) của một người dùng theo UID.",
    getSettings: "Lấy toàn bộ cấu hình quyền riêng tư và cài đặt của tài khoản hiện tại.",
    getUserInfo:
        "Lấy thông tin hồ sơ chi tiết (Tên, Ảnh bìa, Ngày sinh, Giới tính, Bio, Zalo Business) của một hoặc nhiều UID.",
    reuseAvatar: "Sử dụng lại một ảnh đại diện cũ từ kho lịch sử ảnh đại diện.",
    updateProfile: "Cập nhật thông tin cá nhân (Tên hiển thị, Ngày sinh, Giới tính) và thông tin Zalo Business.",
    updateProfileBio: "Cập nhật dòng tiểu sử (Status / Bio) trên trang cá nhân.",
    updateSettings:
        "Cập nhật cài đặt quyền riêng tư (Hiển thị ngày sinh, Trạng thái Online, Đã xem, Nguồn nhận tin nhắn/cuộc gọi, Nguồn kết bạn).",
    uploadAttachment:
        "Tải tệp đính kèm (Ảnh, Video, File) lên máy chủ Zalo để lấy thông tin fileUrl / fileId trước khi gửi.",
    getStickerCategoryDetail: "Lấy danh sách toàn bộ nhãn dán nằm trong một bộ nhãn dán (Category/Pack ID).",
    getStickers: "Tìm kiếm danh sách ID nhãn dán theo từ khóa tiếng Việt/tiếng Anh.",
    getStickersDetail: "Lấy thông tin chi tiết (URL ảnh động, loại sticker, cateId) của một hoặc nhiều Sticker ID.",
    searchSticker: "Tìm kiếm nhãn dán nâng cao theo từ khóa.",
    addPollOptions: "Thêm phương án lựa chọn mới vào một cuộc Bình chọn (Poll) đang mở trong nhóm.",
    createNote: "Tạo một Ghi chú (Note) mới trên Bảng tin nhóm và tùy chọn ghim lên đầu.",
    createPoll: "Tạo một cuộc Bình chọn (Poll) mới trong nhóm với nhiều phương án và cấu hình ẩn danh/đa lựa chọn.",
    createReminder: "Tạo một Lịch hẹn (Reminder) mới trong hội thoại cá nhân hoặc nhóm.",
    editNote: "Chỉnh sửa nội dung ghi chú đã tạo trên Bảng tin nhóm.",
    editReminder: "Chỉnh sửa nội dung và thời gian của một Lịch hẹn (Reminder).",
    getListBoard:
        "Lấy danh sách các mục trên Bảng tin nhóm (bao gồm Ghi chú, Bình chọn và Tin nhắn ghim) qua /api/board/list.",
    getListReminder: "Lấy danh sách các Lịch hẹn (Reminders) trong hội thoại cá nhân hoặc nhóm.",
    getPollDetail:
        "Lấy thông tin chi tiết và toàn bộ danh sách UID thành viên đã bỏ phiếu (voters) trong cuộc Bình chọn qua /api/poll/detail.",
    getReminder: "Lấy thông tin chi tiết của một Lịch hẹn (Reminder) trong nhóm.",
    getReminderResponses:
        "Lấy danh sách UID các thành viên đã bấm Tham gia (acceptMember) hoặc Từ chối (rejectMember) một Lịch hẹn.",
    lockPoll: "Khóa (Kết thúc) một cuộc Bình chọn trong nhóm.",
    removeReminder: "Xóa một Lịch hẹn trong hội thoại cá nhân hoặc nhóm.",
    sharePoll: "Chia sẻ lại cuộc Bình chọn vào luồng tin nhắn nhóm.",
    votePoll: "Bỏ phiếu bình chọn cho một hoặc nhiều phương án trong cuộc Bình chọn nhóm.",
    addQuickMessage: "Thêm mẫu Tin nhắn nhanh (Quick Message) mới cho tài khoản Zalo Business.",
    createAutoReply: "Tạo kịch bản Trả lời tự động (Auto Reply) theo khung giờ cho Zalo Business.",
    createBankAccount: "Thêm thông tin tài khoản ngân hàng mới vào danh bạ ngân hàng.",
    createCatalog: "Tạo Danh mục sản phẩm (Catalog) mới cho Zalo Business.",
    createProductCatalog: "Thêm sản phẩm mới vào Danh mục sản phẩm (Product Catalog).",
    deleteAutoReply: "Xóa một kịch bản Trả lời tự động.",
    deleteBankAccount: "Xóa một tài khoản ngân hàng đã lưu.",
    deleteCatalog: "Xóa một Danh mục sản phẩm (Catalog).",
    deleteProductCatalog: "Xóa một hoặc nhiều sản phẩm khỏi Danh mục sản phẩm.",
    getAutoReplyList: "Lấy danh sách các kịch bản Trả lời tự động của tài khoản.",
    getBizAccount: "Lấy thông tin cấu hình tài khoản Zalo Business (ZBusiness).",
    getCatalogList: "Lấy danh sách các Danh mục sản phẩm (Catalogs) của tài khoản.",
    getLabels: "Lấy toàn bộ danh sách Nhãn phân loại hội thoại (Conversation Labels) và các hội thoại được gắn nhãn.",
    getListBank: "Lấy danh sách mã ngân hàng (BIN / NAPAS) được Zalo hỗ trợ.",
    getListBankAccount: "Lấy danh sách các tài khoản ngân hàng đã lưu của người dùng.",
    getProductCatalogList: "Lấy danh sách các sản phẩm nằm trong một Danh mục sản phẩm (Catalog).",
    getQuickMessageList: "Lấy danh sách các mẫu Tin nhắn nhanh (Quick Messages) đã tạo.",
    registerCatalog: "Đăng ký kích hoạt tính năng Danh mục sản phẩm (Catalog) cho tài khoản.",
    removeQuickMessage: "Xóa một hoặc nhiều mẫu Tin nhắn nhanh.",
    updateAutoReply: "Cập nhật nội dung và thời gian hoạt động của kịch bản Trả lời tự động.",
    updateBankAccount: "Cập nhật thông tin tài khoản ngân hàng đã lưu.",
    updateCatalog: "Cập nhật tên hoặc ảnh của Danh mục sản phẩm.",
    updateLabels: "Cập nhật danh sách Nhãn phân loại (Labels) và gán nhãn cho các cuộc trò chuyện.",
    updateProductCatalog: "Cập nhật thông tin chi tiết, giá bán và hình ảnh của sản phẩm trong Danh mục.",
    updateQuickMessage: "Chỉnh sửa phím tắt và nội dung của mẫu Tin nhắn nhanh.",
    uploadProductPhoto: "Tải ảnh sản phẩm lên máy chủ Zalo phục vụ cho Product Catalog hoặc Quick Message.",
    getOAProfile:
        "Lấy hồ sơ chuẩn hóa đầy đủ của một Zalo Official Account (OA) theo oaId (bao gồm tích vàng isVerified, isZaloBot, dnrStatus, hotline, website, giờ mở cửa, địa chỉ, danh mục...).",
    blockOA: "Chặn nhận tin nhắn / thông báo từ một Zalo Official Account (OA) qua /api/social/oa/block (cmd 12681).",
    unblockOA:
        "Bỏ chặn một Zalo Official Account (OA) để tiếp tục nhận tin nhắn qua /api/social/oa/unblock (cmd 12682).",
    convertOAIds:
        "Chuyển đổi danh sách OA ID sang Zalo UID nội bộ (hoặc ngược lại) qua /api/social/oa/convertid (cmd 11863).",
    sendVoiceCall:
        "Khởi tạo cuộc gọi Thoại hoặc Video 1-1 trọn gói (tự động thực hiện 2 bước 11300 + 11301 làm đổ chuông máy người nhận).",
    requestVoiceCall:
        "Bước 1 gọi 1-1 (cmd 11300 - /api/voicecall/requestcall, signal 401): Xin cấp phát phòng gọi 1-1 (callId, sessId, rtpServer, rtcpServer, zrtpKey, codec).",
    sendRequestVoiceCall:
        "Bước 2 gọi 1-1 (cmd 11301 - /api/voicecall/request, signal 416): Gửi gói mời gọi (Invite) kèm extendData ZRTC để kích hoạt đổ chuông trên thiết bị người nhận.",
    ringRingVoiceCall:
        "Báo hiệu thiết bị đang đổ chuông cho cuộc gọi 1-1 đến (cmd 11302 - /api/voicecall/ringring, signal 407).",
    answerVoiceCall:
        "Chấp nhận (Bắt máy) cuộc gọi Thoại/Video 1-1 đến (cmd 11303 - /api/voicecall/answer, signal 402).",
    answerAckVoiceCall:
        "Gửi xác nhận hoàn tất bắt tay nhận cuộc gọi 1-1 (cmd 11304 - /api/voicecall/answerack, signal 408).",
    cancelVoiceCall:
        "Hủy cuộc gọi 1-1 đang đổ chuông trước khi người nhận bắt máy (cmd 11305 - /api/voicecall/cancel, signal 405).",
    endVoiceCall:
        "Kết thúc cuộc gọi 1-1 đang diễn ra hoặc từ chối cuộc gọi đến (cmd 11306 - /api/voicecall/endcall, signal 404).",
    holdVoiceCall:
        "Tạm giữ (Hold) cuộc gọi 1-1 đang diễn ra hoặc phản hồi yêu cầu tạm giữ (cmd 11307 holdreq / cmd 11308 holdresp, signal 411/412).",
    unholdVoiceCall:
        "Khôi phục (Unhold) cuộc gọi 1-1 đang tạm giữ hoặc phản hồi yêu cầu khôi phục (cmd 11309 unholdreq / cmd 11310 unholdresp, signal 413/414).",
    logEndVoiceCall:
        "Gửi thống kê chất lượng cuộc gọi (QoS/Billing stats) sau khi kết thúc cuộc gọi 1-1 (cmd 11311 - /api/voicecall/logendcall, signal 406).",
    updateCallMediaState:
        "Đồng bộ trạng thái bật/tắt Mic và Camera trong cuộc gọi 1-1 (cmd 12006 - /api/voicecall/conf).",
    requestAudioToVideoCall:
        "Yêu cầu nâng cấp từ cuộc gọi Thoại sang cuộc gọi Video hoặc phản hồi yêu cầu (cmd 12056 - /api/voicecall/requestaudio2video).",
    requestShareScreenCall:
        "Yêu cầu bắt đầu hoặc kết thúc chia sẻ màn hình (Screen Share) trong cuộc gọi 1-1 (cmd 12064 - /api/voicecall/requestsharescreen).",
    requestGroupCall:
        "Bước 1 gọi nhóm (cmd 12433 - /api/voicecall/group/requestcall): Xin cấp phát phòng gọi nhóm (Group Call Room & RTP/ZRTC servers).",
    sendRequestGroupCall:
        "Bước 2 gọi nhóm (cmd 12434 - /api/voicecall/group/request): Phát tín hiệu mời gọi nhóm tới danh sách thành viên.",
    addUserGroupCall:
        "Mời thêm thành viên mới vào cuộc gọi nhóm đang diễn ra (cmd 12435 - /api/voicecall/group/adduser).",
    answerGroupCall:
        "Chấp nhận tham gia cuộc gọi nhóm khi nhận được lời mời (cmd 12436 - /api/voicecall/group/answer).",
    cancelGroupCall: "Hủy lời mời cuộc gọi nhóm (cmd 12437 - /api/voicecall/group/cancel).",
    endGroupCall: "Rời khỏi cuộc gọi nhóm hoặc từ chối lời mời gọi nhóm (cmd 12438 - /api/voicecall/group/endcall).",
    ringRingGroupCall:
        "Báo hiệu thiết bị đang đổ chuông cho lời mời gọi nhóm (cmd 12439 - /api/voicecall/group/ringring).",
    getGroupCallState:
        "Truy vấn trạng thái hiện tại và danh sách thành viên trong phòng gọi nhóm (cmd 12445 - /api/voicecall/group/state).",
    finishGroupCall:
        "Kết thúc hoàn toàn phòng gọi nhóm cho tất cả thành viên (cmd 12446 - /api/voicecall/group/finish).",
    notifyGroupCall:
        "Gửi thông báo sự kiện cuộc gọi nhóm vào luồng chat nhóm (cmd 12447 - /api/voicecall/group/notify).",
    pingGroupCall:
        "Gửi nhịp tim (Heartbeat Ping) duy trì kết nối của thành viên trong phòng gọi nhóm (cmd 12097 - /api/voicecall/group/ping).",
    broadcastGroupCallState:
        "Phát quảng bá trạng thái thiết bị (Mic, Camera, Screen Share) tới các thành viên trong cuộc gọi nhóm (cmd 12098 - /api/voicecall/group/broadcast).",
    joinGroupCall:
        "Chủ động tham gia vào một cuộc gọi nhóm đang diễn ra từ banner nhóm (cmd 12043 - /api/voicecall/group/join).",
    shareScreenGroupCall:
        "Bắt đầu hoặc dừng chia sẻ màn hình trong cuộc gọi nhóm (cmd 12044 - /api/voicecall/group/sharescreen).",
    createRtcSession:
        "Khởi tạo phiên gọi thoại / video 2 chiều thuần TypeScript (ZaloRtcSession — UDP ZRTPPacket + SRTP + H.264 Annex-B + Mobile Direct UDP Handoff).",
    createController:
        "Khởi tạo bộ điều phối cuộc gọi ZaloCallController quản lý vòng đời gọi đi, nhận cuộc gọi đến và kênh IPC cục bộ.",
};

function escapeMarkdownHtml(str) {
    return str
        .split(/(`[^`]*`)/g)
        .map((part) => (part.startsWith("`") ? part : part.replace(/</g, "&lt;").replace(/>/g, "&gt;")))
        .join("");
}

function loadEndpointRegistry() {
    const endpointsFile = path.join(rootDir, "src", "constants", "endpoints.ts");
    const map = {};
    if (!fs.existsSync(endpointsFile)) return map;
    const raw = fs.readFileSync(endpointsFile, "utf-8");
    const groupRegex = /([A-Z0-9_]+)\s*:\s*\{([\s\S]*?)\}/g;
    let gm;
    while ((gm = groupRegex.exec(raw)) !== null) {
        const groupName = gm[1];
        const body = gm[2];
        const keyRegex = /([A-Z0-9_]+)\s*:\s*"([^"]+)"/g;
        let km;
        while ((km = keyRegex.exec(body)) !== null) {
            map[`ZALO_ENDPOINTS.${groupName}.${km[1]}`] = km[2];
        }
    }
    return map;
}

const ENDPOINT_REGISTRY = loadEndpointRegistry();

function parseApiFile(filePath, domain, name) {
    const content = fs.readFileSync(filePath, "utf-8");

    const jsdocMatch = content.match(/\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*return\s+(?:async\s+)?function/);
    let summary = "";
    let plainSummary = "";
    const paramsDoc = [];

    if (jsdocMatch) {
        const rawLines = jsdocMatch[1].split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim());
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
        plainSummary = summaryLines.join(" ").replace(/`/g, "");
        summary = escapeMarkdownHtml(summaryLines.join(" "));
    }

    if (VI_DESCRIPTIONS[name]) {
        plainSummary = VI_DESCRIPTIONS[name];
        summary = escapeMarkdownHtml(VI_DESCRIPTIONS[name]);
    }

    const fnMatch = content.match(
        /return\s+(?:async\s+)?function\s+[a-zA-Z0-9_]*\s*\(([\s\S]*?)\)\s*(?::\s*[^{]+)?\s*\{/,
    );
    let signatureParams = "";
    if (fnMatch) {
        signatureParams = fnMatch[1]
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" ");
    }

    const literalEndpoints = content.match(/\/(?:api|cloudmedia|zalocloud|zfamily|keepalive)[a-zA-Z0-9_/-]*/g) || [];
    const externalEndpoints =
        content.match(/https:\/\/(?:api\.giphy\.com|text2gif\.guggy\.com|api\.tenor\.com)\/[a-zA-Z0-9_/-]+/g) || [];
    const constRefs = content.match(/ZALO_ENDPOINTS\.[A-Z0-9_]+\.[A-Z0-9_]+/g) || [];
    const resolvedConstEndpoints = constRefs.map((ref) => ENDPOINT_REGISTRY[ref]).filter(Boolean);

    const endpoints = Array.from(new Set([...literalEndpoints, ...resolvedConstEndpoints, ...externalEndpoints]));
    const methodMatch = content.match(/method:\s*"(GET|POST|PUT|DELETE)"/);
    const httpMethod = methodMatch ? methodMatch[1] : "GET";

    const typeBlocks = [];
    const typeRegex =
        /export\s+(?:type|interface|enum)\s+[A-Za-z0-9_]+[\s\S]*?(?=\nexport\s+|\nfunction\s+|\nconst\s+|$)/g;
    let m;
    while ((m = typeRegex.exec(content)) !== null) {
        typeBlocks.push(m[0].trim());
    }

    return {
        name,
        domain,
        summary: summary || `API \`${name}\` thuộc phân hệ \`${domain}\`.`,
        plainSummary: plainSummary || `API ${name} thuộc phân hệ ${domain}.`,
        paramsDoc,
        signature: `api.${domain}.${name}(${signatureParams})`,
        flatSignature: `api.${name}(${signatureParams})`,
        endpoints,
        httpMethod,
        typeBlocks,
    };
}

function generateModelsAndCookbookDocs() {
    // 1. Generate docs/api/models.md from src/models/*.ts & src/Errors/*.ts
    const modelLines = [
        "---",
        'title: "Models, Enums & Errors Reference - Kiểu dữ liệu & Hằng số"',
        'description: "Tra cứu đầy đủ toàn bộ các Enum (ThreadType, Reactions, GroupEventType, FriendEventType...) và các Model dữ liệu gốc trong @softtynet/zca-js."',
        "---",
        "",
        "# 📦 Models, Enums & Errors Reference",
        "",
        "Trang này tổng hợp toàn bộ các **Hằng số (`Enum`)**, **Lớp dữ liệu (`Model`)** và **Lớp ngoại lệ (`ZaloApiError`)** được xuất trực tiếp từ gói `@softtynet/zca-js`:",
        "",
        "```ts",
        "import {",
        "    ThreadType,",
        "    DestType,",
        "    Gender,",
        "    Reactions,",
        "    GroupEventType,",
        "    FriendEventType,",
        "    BoardType,",
        "    CallType,",
        "    CallEventType,",
        "    SyncEventType,",
        "    ZaloApiError,",
        '} from "@softtynet/zca-js";',
        "```",
        "",
        "---",
        "",
    ];

    if (fs.existsSync(errorsDir)) {
        const errFiles = fs
            .readdirSync(errorsDir)
            .filter((f) => f.endsWith(".ts") && f !== "index.ts")
            .sort();
        modelLines.push("## ⚠️ Lớp Ngoại lệ & Xử lý lỗi (`Errors`)");
        modelLines.push("");
        for (const f of errFiles) {
            const code = fs.readFileSync(path.join(errorsDir, f), "utf-8").trim();
            modelLines.push(`### \`${f.slice(0, -3)}\``);
            modelLines.push("```ts");
            modelLines.push(code);
            modelLines.push("```");
            modelLines.push("");
        }
        modelLines.push("---", "");
    }

    if (fs.existsSync(modelsDir)) {
        const mFiles = fs
            .readdirSync(modelsDir)
            .filter((f) => f.endsWith(".ts") && f !== "index.ts")
            .sort();
        modelLines.push("## 📐 Các Hằng số (`Enums`) & Mô hình Dữ liệu (`Models`)");
        modelLines.push("");
        for (const f of mFiles) {
            const code = fs.readFileSync(path.join(modelsDir, f), "utf-8").trim();
            modelLines.push(`### \`${f.slice(0, -3)}\``);
            modelLines.push("```ts");
            modelLines.push(code);
            modelLines.push("```");
            modelLines.push("");
        }
    }

    fs.writeFileSync(path.join(docsDir, "api", "models.md"), modelLines.join("\n"), "utf-8");

    // 2. Generate docs/guide/cookbook.md (10 Real-World Production Recipes)
    const cookbookLines = [
        "---",
        'title: "Cookbook & Best Practices - 10 Kịch bản Thực chiến Production"',
        'description: "Hướng dẫn thực chiến: Lưu & khôi phục phiên đăng nhập (exportSession), gắn Proxy HTTP/SOCKS5 cho đa tài khoản, phân trang chống Rate-Limit, WebSocket 24/7, xử lý lỗi ZaloApiError, Gọi thoại/Video 2 chiều 1-1 & Nhóm (ZaloRtcSession), quản lý Zalo Official Account (OA), Dịch AI đa ngôn ngữ, Zalo To-Do & Nhắc hẹn 1-1, GIF Giphy/Guggy & Nhãn CRM."',
        "---",
        "",
        "# 🛠️ Kịch bản Thực chiến (Cookbook & Production Best Practices)",
        "",
        "Tài liệu này tổng hợp **10 mẫu thiết kế chuẩn Production** khi vận hành hệ thống Bot / Worker Zalo thực tế với `@softtynet/zca-js`.",
        "",
        "---",
        "",
        "## 1. Lưu & Khôi phục Phiên Đăng nhập (`exportSession` + `zalo.login`)",
        "",
        "Để không phải quét mã QR lại mỗi khi khởi động lại server, hãy sử dụng `api.auth.exportSession()` ngay sau khi `loginQR()` thành công:",
        "",
        "```ts",
        'import { Zalo } from "@softtynet/zca-js";',
        'import fs from "node:fs/promises";',
        "",
        'const SESSION_FILE = "./zalo-session.json";',
        "",
        "async function getAuthenticatedApi() {",
        "    const zalo = new Zalo({ selfListen: true, requestTimeout: 30000 });",
        "",
        "    // 1. Thử khôi phục phiên đã lưu từ đĩa / Database",
        "    try {",
        '        const raw = await fs.readFile(SESSION_FILE, "utf-8");',
        "        const savedSession = JSON.parse(raw);",
        "        const api = await zalo.login(savedSession);",
        '        console.log("✅ Khôi phục phiên thành công cho UID:", api.getOwnId());',
        "        return api;",
        "    } catch {",
        '        console.log("⚠️ Chưa có phiên hợp lệ, chuyển sang đăng nhập QR...");',
        "    }",
        "",
        "    // 2. Đăng nhập mới bằng QR và xuất phiên lưu lại",
        "    const api = await zalo.loginQR();",
        "    const session = api.auth.exportSession();",
        "    await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2));",
        '    console.log("💾 Đã lưu phiên đăng nhập mới cho UID:", session.uid);',
        "    return api;",
        "}",
        "```",
        "",
        "---",
        "",
        "## 2. Chạy Đa Tài Khoản với Proxy Độc Lập (`agent` + `node-fetch`)",
        "",
        "Khi vận hành nhiều tài khoản Zalo trên cùng một máy chủ, mỗi tài khoản nên đi qua một IP Proxy riêng kèm `userAgent` và `imei` cố định:",
        "",
        "```ts",
        'import { Zalo, type ExportedSession } from "@softtynet/zca-js";',
        'import { HttpsProxyAgent } from "https-proxy-agent";',
        'import nodeFetch from "node-fetch";',
        "",
        "async function createAccountWorker(session: ExportedSession, proxyUrl: string) {",
        "    const proxyAgent = new HttpsProxyAgent(proxyUrl);",
        "",
        "    const zalo = new Zalo({",
        "        selfListen: true,",
        "        logging: false,",
        "        requestTimeout: 25000, // Tự động ngắt nếu Proxy treo quá 25 giây",
        "        agent: proxyAgent,",
        "        polyfill: nodeFetch as unknown as typeof fetch,",
        "    });",
        "",
        "    const api = await zalo.login(session);",
        "    api.listener.start({ retryOnClose: true });",
        "    return api;",
        "}",
        "```",
        "",
        "---",
        "",
        "## 3. Phân trang An toàn & Chống Rate-Limit (Lịch sử Chat & MediaStore)",
        "",
        "Khi quét dữ liệu lịch sử lớn (tin nhắn nhóm hoặc kho lưu trữ Media/File/Link), luôn kết hợp con trỏ phân trang (`nextCursor` / `last_id`) với một khoảng nghỉ ngắn (`sleep`) giữa các trang:",
        "",
        "```ts",
        "const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));",
        "",
        "// A. Phân trang Lịch sử Tin nhắn Nhóm (Cloud Message)",
        "async function fetchGroupMessagesPaginated(api: any, groupId: string, maxPages = 10) {",
        "    let cursor: string | number = 0;",
        "    const allMessages = [];",
        "",
        "    for (let page = 1; page <= maxPages; page++) {",
        "        const res = await api.group.getGroupChatHistory(groupId, {",
        "            count: 50,",
        "            cursor,",
        "            useOldEndpoint: page > 1, // Trang 1 gọi getrecentv2, các trang sau gọi getoldv2",
        "        });",
        "",
        "        if (!res.groupMsgs?.length) break;",
        "        allMessages.push(...res.groupMsgs);",
        "",
        "        if (!res.hasMore || !res.nextCursor || String(res.nextCursor) === String(cursor)) break;",
        "        cursor = res.nextCursor;",
        "        await sleep(350); // Nghỉ 350ms giữa các trang để bảo vệ tài khoản",
        "    }",
        "    return allMessages;",
        "}",
        "",
        "// B. Phân trang Kho Lưu Trữ Ảnh/Video, File, Link (MediaStore)",
        "async function fetchGroupMediaOwners(api: any, groupId: string) {",
        "    const ownerUids = new Set<string>();",
        "",
        '    for (const mediaType of ["media", "file", "link"] as const) {',
        "        let lastId: number | string | undefined = undefined;",
        "        for (let page = 1; page <= 10; page++) {",
        "            const res = await api.media.getConversationMedia({",
        "                groupId,",
        "                mediaType,",
        "                limit: 50,",
        "                lastId,",
        "            });",
        "            for (const item of res.items ?? []) {",
        "                // owner_id 19 chữ số được bảo toàn chính xác nhờ preParseJsonIds",
        "                if (item.owner_id) ownerUids.add(item.owner_id);",
        "            }",
        "            if (res.has_more !== 1 || !res.last_id || res.last_id === lastId) break;",
        "            lastId = res.last_id;",
        "            await sleep(300);",
        "        }",
        "    }",
        "    return Array.from(ownerUids);",
        "}",
        "```",
        "",
        "---",
        "",
        "## 4. Duy trì Kết nối WebSocket Bền bỉ 24/7 (`Listener` + `KeepAlive` + 4 Outbound WS Requests)",
        "",
        "```ts",
        'api.listener.on("connected", () => {',
        '    console.log("🟢 WebSocket Zalo đã kết nối");',
        "    // Chủ động đồng bộ trạng thái Online, Đã nhận/Đã xem và cảm xúc ngay khi kết nối",
        "    api.listener.sendPingActive();",
        "    api.listener.requestLastDeliverSeen();",
        "    api.listener.requestLastSeenSubChatTab();",
        "    api.listener.requestLastSeenReaction();",
        "});",
        "",
        'api.listener.on("disconnected", (code, reason) => {',
        "    console.warn(`🟡 WebSocket tạm ngắt (code=${code}): ${reason}`);",
        "});",
        "",
        'api.listener.on("error", (err) => {',
        '    console.error("🔴 Lỗi WebSocket:", err);',
        "});",
        "",
        "// Tự động kết nối lại khi đóng socket",
        "api.listener.start({ retryOnClose: true });",
        "```",
        "",
        "---",
        "",
        "## 5. Xử lý Ngoại lệ Tập trung với `ZaloApiError`",
        "",
        "Mọi lỗi trả về từ máy chủ Zalo đều được chuẩn hóa thành `ZaloApiError` kèm mã lỗi số (`error.code`):",
        "",
        "```ts",
        'import { ZaloApiError } from "@softtynet/zca-js";',
        "",
        "try {",
        '    await api.friend.sendFriendRequest("Xin chào bạn!", targetUid);',
        "} catch (err) {",
        "    if (err instanceof ZaloApiError) {",
        "        console.error(`Mã lỗi Zalo [${err.code}]: ${err.message}`);",
        "        // Ví dụ: code 215 (bị chặn), code 222 (đối phương đã gửi lời mời trước đó)",
        "    }",
        "}",
        "```",
        "",
        "---",
        "",
        "## 6. Gọi Thoại, Video 1-1 & Gọi Nhóm 2 Chiều (`ZaloRtcSession` & 30 APIs trong `api.call`)",
        "",
        "Phân hệ `api.call` cung cấp trọn bộ **30 API** gồm 28 API Báo hiệu (`zpw_type = 24`) và 2 bộ máy truyền tải **2 chiều thuần TypeScript (`createRtcSession` & `createController`)**:",
        "",
        "```ts",
        'import { CallType } from "@softtynet/zca-js";',
        "",
        "const session = api.call.createRtcSession({ autoAttachListener: true });",
        "",
        "// A. Gọi Video 1-1 hai chiều (Opus 16kHz + H.264 Annex-B FU-A)",
        "const callParams = await session.startOutgoingCall(targetUid, {",
        "    callType: CallType.Video, // Hoặc CallType.Audio",
        "});",
        'console.log("Đã kết nối RTP Server:", callParams.rtpAddress);',
        "",
        "// B. Nhận khung âm thanh Opus & hình ảnh H.264 Annex-B từ đối phương / thành viên nhóm",
        'session.on("audio_frame", (frame) => {',
        "    // frame.payload: Buffer (Opus 16kHz Mono), frame.ssrc: number",
        "});",
        'session.on("video_annexb_frame", (frame) => {',
        "    // frame.annexB: Buffer (00 00 00 01 + SPS/PPS/IDR/P-Slice)",
        "    // frame.partnerId?: string (Zalo UID 19 chữ số của người phát trong Group Call)",
        "    // frame.isKeyframe: boolean",
        "});",
        "",
        "// C. Tự động bắt máy khi có cuộc gọi 1-1 hoặc Gọi Nhóm đến qua WebSocket",
        'api.listener.on("call_event", async (ev) => {',
        '    if (ev.act === "request") {',
        "        await session.ringIncomingCall(ev);",
        "        await session.acceptIncomingCall(ev, { skipRingRing: true });",
        '    } else if (ev.act === "group_request") {',
        "        await session.ringIncomingCall(ev);",
        "        await session.acceptIncomingGroupCall(ev, { skipRingRing: true });",
        "    }",
        "});",
        "",
        "// D. Khởi tạo hoặc tham gia Cuộc gọi Nhóm Video 2 chiều qua Zavi SFU",
        "// Lưu ý quy ước trạng thái Group Call: audioState = 0 (Mic Bật) / 1 (Mic Tắt), videoState = 0 (Cam Bật) / 1 (Cam Tắt)",
        "const grpParams = await session.startGroupCall(groupId, memberUids, {",
        "    callType: CallType.GroupVideo,",
        "});",
        "// Hoặc tham gia phòng gọi nhóm đang mở trên Banner:",
        "// await session.joinActiveGroupCall(groupId, { callType: CallType.GroupVideo });",
        "```",
        "",
        "---",
        "",
        "## 7. Nhận, Trả lời & Quản lý Zalo Official Account (`api.business` & `oa_message`)",
        "",
        "`@softtynet/zca-js` hỗ trợ đầy đủ luồng hội thoại 2 chiều với Zalo Official Account (OA), tự động phân tách `pageMessages` và giải mã hồ sơ tích vàng (`isOAVerified`), thẻ bài viết (`chat.list.action`), nút bấm chân trang (`footerv2`):",
        "",
        "```ts",
        'import { ThreadType } from "@softtynet/zca-js";',
        "",
        "// 1. Tra cứu hồ sơ chuẩn hóa của Zalo OA (bao gồm tích vàng, hotline, website, giờ mở cửa, DNR)",
        'const oaProfile = await api.business.getOAProfile("2359864726282056346");',
        "console.log(oaProfile.displayName, oaProfile.isVerified, oaProfile.hotline, oaProfile.website);",
        "",
        "// 2. Tải trước các tin nhắn từ Zalo OA khi khởi động",
        "const preload = await api.chat.preloadConversations();",
        "for (const oaMsg of preload.pageMessages) {",
        "    console.log(`[OA Preload] ${oaMsg.data.dName}: ${oaMsg.oaData?.text}`);",
        "}",
        "",
        "// 3. Lắng nghe tin nhắn OA thời gian thực qua WebSocket và tự động trả lời 2 chiều",
        'api.listener.on("oa_message", async (msg) => {',
        "    console.log(`[OA Realtime - ${msg.oaData?.kind}] ${msg.data.dName}: ${msg.oaData?.text}`);",
        "    if (msg.oaData?.footer?.footerList.length) {",
        '        console.log("Nút bấm chân trang (footerv2):", msg.oaData.footer.footerList);',
        "    }",
        "    if (!msg.isSelf) {",
        '        await api.chat.sendMessage({ msg: "Cảm ơn OA, tôi đã nhận được thông tin!" }, msg.threadId, ThreadType.User);',
        "    }",
        "});",
        "",
        "// 4. Lắng nghe sự kiện chặn / bỏ chặn OA và quản lý trạng thái OA",
        'api.listener.on("oa_event", (ev) => {',
        '    console.log(`Sự kiện OA: act=${ev.act}, isBlocked=${ev.isBlocked}, oaIds=${ev.oaIds.join(",")}`);',
        "});",
        'await api.business.blockOA("2359864726282056346");',
        'await api.business.unblockOA("2359864726282056346");',
        "```",
        "",
        "---",
        "",
        "## 8. Dịch Tin Nhắn Đa Ngôn Ngữ Tự Động Bằng Zalo AI (`api.chat` & `translate_event`)",
        "",
        "Sử dụng bộ 5 API Dịch AI nguyên bản của Zalo PC (`zpw_type = 30`) để dịch tức thì tin nhắn thủ công, dịch tự động theo hội thoại hoặc lấy gợi ý bản dịch:",
        "",
        "```ts",
        "// 1. Dịch thủ công một đoạn văn bản sang tiếng Việt hoặc tiếng Anh",
        "const manualRes = await api.chat.translateMessageManual({",
        '    content: "Bonjour, comment allez-vous aujourd\'hui ?",',
        '    targetLanguage: "vi",',
        "});",
        'console.log("Bản dịch AI:", manualRes);',
        "",
        "// 2. Dịch tự động tin nhắn trong luồng hội thoại",
        "const autoRes = await api.chat.translateMessageAuto({",
        '    content: "Let\'s schedule our deployment at 10 AM tomorrow.",',
        '    targetLanguage: "vi",',
        "});",
        "",
        "// 3. Lấy gợi ý bản dịch nhanh khi đang soạn thảo",
        "const suggestRes = await api.chat.getTranslateSuggestion({",
        '    content: "Cảm ơn bạn đã hợp tác cùng chúng tôi!",',
        '    targetLanguage: "en",',
        "});",
        "",
        "// 4. Kiểm tra và cập nhật cấu hình tự động dịch cho hội thoại",
        "const translateSetting = await api.chat.getTranslateSetting();",
        'api.listener.on("translate_event", (ev) => {',
        '    console.log("[WebSocket AI Translate Update]", ev.data);',
        "});",
        "```",
        "",
        "---",
        "",
        "## 9. Quản Lý Công Việc Zalo To-Do, Nhắc Hẹn 1-1 & Bảng Tin Nhóm (`api.board`)",
        "",
        "Tự động hóa giao việc (Zalo To-Do), quản lý lịch hẹn 1-1 (`getListOneOneBoard`) và lắng nghe sự kiện công việc / bình chọn thời gian thực:",
        "",
        "```ts",
        "// 1. Kiểm tra trạng thái kích hoạt Zalo To-Do và lấy danh sách công việc",
        "const todoVerify = await api.board.verifyTodo();",
        "const todoList = await api.board.getTodoList({ page: 1, count: 20 });",
        "",
        "// 2. Tạo công việc mới (Zalo To-Do) giao cho thành viên kèm hạn hoàn thành",
        "const newTodo = await api.board.createTodo({",
        '    title: "Hoàn thành kiểm thử tích hợp ZCA-JS v1.4",',
        '    content: "Kiểm tra toàn bộ 333 API và 18 sự kiện WebSocket Realtime",',
        "    assignees: [targetUid],",
        "    dueDate: Date.now() + 24 * 3600 * 1000,",
        "    watchers: [],",
        "});",
        "",
        "// 3. Lấy danh sách nhắc hẹn 1-1 và bảng tin chung với một người bạn",
        "const oneOneReminders = await api.board.getListOneOneBoard(targetUid);",
        "const friendBoards = await api.board.getFriendBoardList(targetUid);",
        "",
        "// 4. Lắng nghe sự kiện Zalo To-Do & Bình chọn nhóm qua WebSocket",
        'api.listener.on("todo_event", (ev) => {',
        "    console.log(`[To-Do Realtime] subCmd=${ev.subCmd}:`, ev.data);",
        "});",
        'api.listener.on("poll_event", (ev) => {',
        "    console.log(`[Poll Realtime] pollId=${ev.pollId}:`, ev.data);",
        "});",
        "```",
        "",
        "---",
        "",
        "## 10. Kho Ảnh Động GIF Giphy/Guggy, Hiệu Ứng Tin Nhắn & Quản Lý Nhãn CRM (`api.sticker` & `api.business`)",
        "",
        "Tích hợp tìm kiếm ảnh động GIF từ Giphy / Guggy / Tenor, hiệu ứng tin nhắn nền và quản lý Nhãn phân loại khách hàng CRM:",
        "",
        "```ts",
        "// 1. Lấy danh sách GIF thịnh hành & tìm kiếm GIF theo từ khóa (Giphy & Guggy)",
        "const trendingGifs = await api.sticker.getTrendingGiphyGifs({ limit: 10 });",
        'const happyGifs = await api.sticker.searchGiphyGifs("chúc mừng", { limit: 10 });',
        'const textGifs = await api.sticker.searchGuggyGifs("Xin chào");',
        "",
        "// 2. Lấy danh sách hiệu ứng tin nhắn (Message Effects & Visual Keyword Rules)",
        "const effects = await api.sticker.getMessageEffects();",
        "const keywordRules = await api.sticker.getVisualKeywordRule();",
        "",
        "// 3. Quản lý Nhãn phân loại hội thoại CRM (Conversation Labels)",
        "const crmLabels = await api.business.getConversationLabels();",
        'console.log("Danh sách nhãn CRM hiện tại:", crmLabels.labelData, "Phiên bản:", crmLabels.version);',
        "```",
    ];
    fs.writeFileSync(path.join(docsDir, "guide", "cookbook.md"), cookbookLines.join("\n"), "utf-8");
}

function generateBrandAndSeoAssets(domains, domainApis, totalApis) {
    fs.mkdirSync(publicDir, { recursive: true });

    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="zcaGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0068FF" />
      <stop offset="55%" stop-color="#00A3FF" />
      <stop offset="100%" stop-color="#00E5FF" />
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0068FF" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="28" fill="url(#zcaGrad)" filter="url(#glow)" />
  <path d="M36 40H84L46 80H84" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="84" cy="40" r="6" fill="#00E5FF" />
</svg>`;
    fs.writeFileSync(path.join(publicDir, "logo.svg"), logoSvg, "utf-8");
    fs.writeFileSync(path.join(publicDir, "favicon.svg"), logoSvg, "utf-8");

    const ogBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#050914" />
      <stop offset="50%" stop-color="#0B1528" />
      <stop offset="100%" stop-color="#071E3D" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1020" cy="140" r="260" fill="#0068FF" fill-opacity="0.18" />
  <circle cx="180" cy="520" r="220" fill="#00E5FF" fill-opacity="0.12" />
  <rect x="80" y="80" width="1040" height="470" rx="28" fill="#0F172A" fill-opacity="0.75" stroke="#1E293B" stroke-width="2" />
  <text x="140" y="185" fill="#38BDF8" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700" letter-spacing="2">SOFTTYNET CO., LTD. • OFFICIAL ZALO SDK</text>
  <text x="140" y="275" fill="#FFFFFF" font-family="Inter, system-ui, sans-serif" font-size="68" font-weight="800">@softtynet/zca-js</text>
  <text x="140" y="345" fill="#94A3B8" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="500">Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript &amp; Bun</text>
  <text x="140" y="435" fill="#E2E8F0" font-family="monospace" font-size="24" font-weight="600">⚡ ${totalApis} Primitive APIs • 12 Domains • ZDB 4.0 Sync • ZCloud AES • Voice/Video Call</text>
  <text x="140" y="495" fill="#38BDF8" font-family="monospace" font-size="22">https://softtyos.github.io/zca-js-docs/</text>
</svg>`;
    fs.writeFileSync(path.join(publicDir, "og-banner.svg"), ogBannerSvg, "utf-8");

    const robotsTxt = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
# AI / LLM Context Files (GEO & AI SEO)
# Summary: ${SITE_URL}/llms.txt
# Full API Reference: ${SITE_URL}/llms-full.txt
`;
    fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf-8");

    const llmsLines = [
        `# @softtynet/zca-js (v${pkg.version})`,
        "",
        `> Bộ thư viện SDK Zalo API hiện đại dành cho Node.js, TypeScript và Bun, được phát triển và duy trì bởi Softtynet Co., Ltd. Cung cấp ${totalApis} API nguyên bản chia theo 12 Domains chuẩn kiến trúc Zalo PC 26.7.10.`,
        "",
        "## Thông tin định danh gói (Package Identity)",
        `- **Package NPM**: \`@softtynet/zca-js\``,
        `- **Phiên bản**: \`${pkg.version}\``,
        `- **Đơn vị phát triển**: Softtynet Co., Ltd.`,
        `- **Repository**: https://github.com/softtyos/zca-js`,
        `- **Website Tài liệu chính thức**: ${SITE_URL}/`,
        `- **Tài liệu đầy đủ cho AI/LLM (1 file duy nhất)**: ${SITE_URL}/llms-full.txt`,
        "",
        "## Kiến trúc 12 Domains & Điểm khác biệt cốt lõi",
        "1. **Tổ chức theo 12 Domains (`api.<domain>.<method>`) và hỗ trợ gọi phẳng (`api.<method>`)**:",
    ];

    for (const d of domains) {
        const meta = DOMAIN_META[d];
        const count = (domainApis[d] || []).length;
        llmsLines.push(
            `   - \`${meta.badge}\` (${count} APIs): [${meta.title}](${SITE_URL}/api/${d}.html) — ${meta.description}`,
        );
    }

    llmsLines.push(
        "",
        "2. **Bảo toàn số nguyên 64-bit (`preParseJsonIds` & `ws-cipher` `storeAsString`)**: Tự động chuyển các trường ID 16+ chữ số không ngoặc kép (`owner_id`, `group_id`, `globalMsgId`, `cliMsgId`) thành `string` trước khi `JSON.parse()` để không bị làm tròn IEEE-754.",
        "3. **Quản lý Phiên & Timeout**: Hỗ trợ `api.auth.exportSession()` để lưu/khôi phục phiên đăng nhập và `requestTimeout` (mặc định 30s) bảo vệ kết nối.",
        "4. **Đồng bộ Mobile ZDB 4.0 (`api.sync`)**: Giải mã RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate, cùng `getBackupMsgInfo`, `getCrossDbInfo`, `syncActionMedia`.",
        "5. **ZCloud & ZFamily (`api.zcloud`)**: Tích hợp chuẩn mã hóa `98yS` AES-256-CBC 16-byte random IV, tự động cache `viewer_key`, lấy link tải hàng loạt (`getZCloudDownloadUrls`), quản lý hàng đợi và di chuyển dữ liệu.",
        "6. **Zalo Call Engine 2 Chiều (`api.call` — 30 APIs & `ZaloRtcSession`)**: Gọi Thoại / Video 1-1 và Gọi Nhóm (Zavi SFU) 2 chiều thuần TypeScript (UDP `ZRTPPacket` + `SRTP` + `Opus 16kHz` + `H.264 Annex-B FU-A 0x1c` + `0xBEDE` 24-byte extension + `CSRC[0]` multi-partner demuxing + Mobile Direct UDP Handoff).",
        "7. **Zalo Official Account & Nhãn CRM (`api.business` & `oa_message`)**: Lấy hồ sơ tích vàng (`getOAProfile`), chặn/bỏ chặn OA (`blockOA`/`unblockOA`), chuyển đổi OA ID (`convertOAIds`), quản lý Nhãn CRM (`getConversationLabels`, `updateConversationLabels`) và nhận/trả lời tin nhắn OA thời gian thực (`oa_message`, `oa_event`, `footerv2`).",
        "8. **Zalo AI Dịch Đa Ngôn Ngữ (`api.chat`)**: Dịch tin nhắn thủ công (`translateMessageManual`), tự động (`translateMessageAuto`), gợi ý dịch (`getTranslateSuggestion`) và đồng bộ cấu hình dịch (`getTranslateSetting`, `updateTranslateSetting`).",
        "9. **Zalo To-Do, Nhắc Hẹn 1-1 & Bảng Tin Nhóm (`api.board`)**: Tạo/cập nhật/theo dõi công việc Zalo To-Do (`createTodo`, `updateTodo`, `updateTodoStatus`, `getTodoList`, `verifyTodo`), nhắc hẹn 1-1 (`getListOneOneBoard`) và bảng tin bạn bè (`getFriendBoardList`).",
        "10. **18 Sự Kiện WebSocket Realtime & 4 Phương Thức Điều Khiển Chủ Động (`api.listener`)**: Hỗ trợ `message`, `oa_message`, `oa_event`, `reaction`, `undo`, `typing`, `seen_messages`, `delivered_messages`, `group_event`, `friend_event`, `call_event`, `sync_event`, `zcloud_event`, `todo_event`, `poll_event`, `translate_event`, `emoji_status_event`, `online_status_event`, `control_sync_event` cùng `sendPingActive()`, `requestLastDeliverSeen()`, `requestLastSeenSubChatTab()`, `requestLastSeenReaction()`.",
        "",
        "## Liên kết Tài liệu Chính",
        `- [Bắt đầu nhanh (Getting Started)](${SITE_URL}/guide/getting-started.html)`,
        `- [Kịch bản Thực chiến (Cookbook & Best Practices)](${SITE_URL}/guide/cookbook.html)`,
        `- [Hướng dẫn Gọi Thoại, Video 1-1 & Gọi Nhóm 2 Chiều (ZaloRtcSession)](${SITE_URL}/guide/call-engine.html)`,
        `- [Kiến trúc 12 Domains & 64-bit ID](${SITE_URL}/guide/architecture.html)`,
        `- [Lắng nghe sự kiện WebSocket (Listener)](${SITE_URL}/guide/listeners.html)`,
        `- [Tra cứu toàn bộ ${totalApis} API (API Explorer)](${SITE_URL}/api/)`,
        `- [Tra cứu Models, Enums & Errors](${SITE_URL}/api/models.html)`,
        `- [Bản đầy đủ toàn bộ chữ ký hàm & Types cho AI Agent (llms-full.txt)](${SITE_URL}/llms-full.txt)`,
    );
    fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsLines.join("\n"), "utf-8");

    const llmsFullLines = [
        `# @softtynet/zca-js v${pkg.version} — Full AI/LLM Technical Reference (${totalApis} APIs across 12 Domains)`,
        "",
        `Maintained by Softtynet Co., Ltd. | Docs: ${SITE_URL}/ | NPM: npm install @softtynet/zca-js`,
        "",
        "---",
        "",
    ];

    for (const d of domains) {
        const meta = DOMAIN_META[d];
        const apis = domainApis[d] || [];
        llmsFullLines.push(`## Domain: ${meta.title} (\`${meta.badge}\` — ${apis.length} APIs)`);
        llmsFullLines.push(meta.description);
        llmsFullLines.push("");

        for (const a of apis) {
            llmsFullLines.push(`### ${a.name}`);
            llmsFullLines.push(`- **Call**: \`await ${a.signature}\` (or \`await ${a.flatSignature}\`)`);
            if (a.endpoints.length > 0) {
                llmsFullLines.push(`- **Endpoint**: ${a.httpMethod} ${a.endpoints.join(", ")}`);
            }
            llmsFullLines.push(`- **Description**: ${a.plainSummary}`);
            if (a.typeBlocks.length > 0) {
                llmsFullLines.push("```ts");
                llmsFullLines.push(a.typeBlocks.join("\n\n"));
                llmsFullLines.push("```");
            }
            llmsFullLines.push("");
        }
    }
    fs.writeFileSync(path.join(publicDir, "llms-full.txt"), llmsFullLines.join("\n"), "utf-8");
}

function generateAllDocs() {
    fs.mkdirSync(path.join(docsDir, "guide"), { recursive: true });
    fs.mkdirSync(path.join(docsDir, "api"), { recursive: true });
    fs.mkdirSync(path.join(docsDir, ".vitepress", "theme", "components"), { recursive: true });

    const domains = Object.keys(DOMAIN_META);
    const domainApis = {};
    const flatAllApis = [];
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
            const parsed = parseApiFile(path.join(domainPath, file), domain, name);
            flatAllApis.push({
                name: parsed.name,
                domain: parsed.domain,
                summary: parsed.plainSummary,
                signature: parsed.signature,
                endpoints: parsed.endpoints,
                httpMethod: parsed.httpMethod,
            });
            return parsed;
        });
    }

    generateBrandAndSeoAssets(domains, domainApis, totalApis);
    generateModelsAndCookbookDocs();

    // 0. Write docs/.vitepress/theme/api-data.json
    const apiDataJson = {
        version: pkg.version,
        totalApis,
        domains: domains.map((key) => ({
            key,
            icon: DOMAIN_META[key].icon,
            title: DOMAIN_META[key].title,
            badge: DOMAIN_META[key].badge,
            description: DOMAIN_META[key].description,
            count: (domainApis[key] || []).length,
            sampleMethods: (domainApis[key] || []).slice(0, 4).map((a) => a.name),
        })),
        apis: flatAllApis,
    };
    fs.writeFileSync(
        path.join(docsDir, ".vitepress", "theme", "api-data.json"),
        JSON.stringify(apiDataJson, null, 2),
        "utf-8",
    );

    // 1. Write docs/api/<domain>.md
    for (const domain of domains) {
        const meta = DOMAIN_META[domain];
        const apis = domainApis[domain] || [];
        const lines = [
            "---",
            `title: "${meta.title} (${meta.badge}) - ${apis.length} APIs"`,
            `description: "${meta.description} Tra cứu chi tiết ${apis.length} phương thức thuộc phân hệ ${meta.badge} trong bộ SDK @softtynet/zca-js."`,
            "---",
            "",
            `# ${meta.icon} ${meta.title}`,
            "",
            `> Namespace: \`${meta.badge}\` (hoặc gọi trực tiếp \`api.<methodName>\`) — **${apis.length} API nguyên bản**`,
            "",
            meta.description,
            "",
            "## Danh sách nhanh",
            "",
            "| Phương thức | HTTP | Endpoint Zalo | Mô tả |",
            "| :--- | :---: | :--- | :--- |",
        ];

        for (const a of apis) {
            const ep = a.endpoints.length > 0 ? a.endpoints.map((e) => `\`${e}\``).join("<br/>") : "`Internal`";
            const cleanSummary = a.summary.replace(/\|/g, "\\|");
            lines.push(`| [\`${a.name}\`](#${a.name.toLowerCase()}) | \`${a.httpMethod}\` | ${ep} | ${cleanSummary} |`);
        }

        lines.push("", "---", "");

        for (const a of apis) {
            lines.push(`## \`${a.name}\``);
            lines.push("");
            lines.push(a.summary);
            lines.push("");

            const epPills =
                a.endpoints.length > 0
                    ? a.endpoints.map((e) => `<span class="zca-endpoint-pill">${e}</span>`).join(" ")
                    : `<span class="zca-endpoint-pill">Hàm tiện ích nội bộ</span>`;

            lines.push(
                `<div class="zca-api-meta">` +
                    `<span class="zca-badge-method ${a.httpMethod.toLowerCase()}">${a.httpMethod}</span>` +
                    `<span class="zca-endpoint-pill">api.${domain}</span>` +
                    `${epPills}` +
                    `</div>`,
            );
            lines.push("");
            lines.push("```ts");
            lines.push(`// Gọi theo phân hệ (Domain Namespace):`);
            lines.push(`await ${a.signature}`);
            lines.push(`// Hoặc gọi phẳng (Flat Alias):`);
            lines.push(`await ${a.flatSignature}`);
            lines.push("```");
            lines.push("");

            if (a.paramsDoc.length > 0) {
                const nonEmptyParams = a.paramsDoc.filter((p) => p.desc && p.desc.trim().length > 0);
                if (nonEmptyParams.length > 0) {
                    lines.push("### Tham số");
                    lines.push("");
                    for (const p of nonEmptyParams) {
                        lines.push(`- \`${p.name}\`: ${p.desc}`);
                    }
                    lines.push("");
                }
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

    // 2. Write docs/api/index.md with Interactive <ApiExplorer />
    const apiIndexLines = [
        "---",
        `title: "API Explorer - Tra cứu ${totalApis} API Zalo SDK (12 Domains)"`,
        `description: "Công cụ tìm kiếm và lọc trực tiếp toàn bộ ${totalApis} API nguyên bản của @softtynet/zca-js chia theo 12 phân hệ: Auth, Chat, Group, Friend, Profile, Sync, ZCloud, Call, Media, Sticker, Board, Business."`,
        "---",
        "",
        "# ⚡ Tra cứu & Lọc trực tiếp API Reference",
        "",
        `Thư viện **\`@softtynet/zca-js\` (v${pkg.version})** cung cấp tổng cộng **${totalApis} API nguyên bản** được tổ chức khoa học thành **12 Domains** theo đúng kiến trúc Zalo PC \`26.7.10\`.`,
        "",
        `> 🤖 **Dành cho AI Agents (Cursor, Antigravity, Claude, ChatGPT)**: Bạn có thể nạp trực tiếp ngữ cảnh toàn bộ ${totalApis} API qua chuẩn AI SEO tại [\`/llms.txt\`](${SITE_URL}/llms.txt) hoặc bản đầy đủ [\`/llms-full.txt\`](${SITE_URL}/llms-full.txt).`,
        "",
        "Sử dụng thanh công cụ bên dưới để lọc tức thì theo **Phân hệ**, **HTTP Method (`GET`/`POST`)**, **Tên hàm** hoặc **Endpoint Zalo** và sao chép nhanh cú pháp gọi hàm:",
        "",
        "<ApiExplorer />",
        "",
        "## Bảng tổng hợp 12 Phân hệ (Domains)",
        "",
        "| Phân hệ | Namespace | Số lượng API | Chức năng chính |",
        "| :--- | :--- | :---: | :--- |",
    ];

    for (const domain of domains) {
        const meta = DOMAIN_META[domain];
        const count = (domainApis[domain] || []).length;
        apiIndexLines.push(
            `| [**${meta.icon} ${meta.title}**](./${domain}.md) | \`${meta.badge}\` | **${count}** | ${meta.description} |`,
        );
    }

    fs.writeFileSync(path.join(docsDir, "api", "index.md"), apiIndexLines.join("\n"), "utf-8");

    // 3. Write docs/index.md with <DomainGrid />
    const homeLines = [
        "---",
        "layout: home",
        `title: "@softtynet/zca-js — Bộ SDK Zalo API Hiện Đại (${totalApis} APIs, 12 Domains)"`,
        `description: "Tài liệu chính thức @softtynet/zca-js v${pkg.version} bởi Softtynet Co., Ltd. Bộ SDK Zalo API cho Node.js, TypeScript & Bun với ${totalApis} API trên 12 Domains, Đồng bộ ZDB 4.0, ZCloud AES-256-CBC và Gọi thoại/Video Call."`,
        "",
        "hero:",
        '  name: "@softtynet/zca-js"',
        '  text: "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun"',
        `  tagline: "Phiên bản v${pkg.version} phát triển bởi Softtynet Co., Ltd. — ${totalApis} API nguyên bản trên 12 Domains, Đồng bộ ZDB 4.0 từ điện thoại, Giải mã ZCloud AES-256-CBC, Gọi thoại/Video Call và Bảo toàn số nguyên 64-bit."`,
        "  image:",
        "    src: /logo.svg",
        '    alt: "@softtynet/zca-js Logo"',
        "  actions:",
        "    - theme: brand",
        `      text: "⚡ Khám phá & Lọc ${totalApis} API →"`,
        '      link: "/api/"',
        "    - theme: alt",
        '      text: "🛠️ Kịch bản Thực chiến (Cookbook)"',
        '      link: "/guide/cookbook"',
        "    - theme: alt",
        '      text: "🤖 AI Context (llms-full.txt)"',
        `      link: "${SITE_URL}/llms-full.txt"`,
        "",
        "features:",
        `  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>'`,
        "    title: Kiến trúc 12 Domains Hiện Đại",
        `    details: "Tổ chức ${totalApis} API nguyên bản thành 12 phân hệ trực quan (api.auth, api.chat, api.group, api.sync, api.zcloud, api.call, api.media...) với Lazy Memoized Getters và tương thích ngược 100%."`,
        `  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>'`,
        "    title: Đồng bộ Mobile ZDB 4.0 & Catch-up Sync",
        '    details: "Hỗ trợ đầy đủ luồng đồng bộ lịch sử tin nhắn từ điện thoại sang PC (RSA-2048 OAEP/PKCS1 + ZDB 4.0 64KB multi-chunk AES-256-CBC + Deflate)."',
        `  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'`,
        "    title: ZCloud, MediaStore & 64-bit Precision",
        '    details: "Tích hợp sẵn preParseJsonIds & ws-cipher storeAsString bảo toàn tuyệt đối UID 19 chữ số (owner_id, group_id) trên cả HTTP và WebSocket."',
        `  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0068ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>'`,
        "    title: Chuẩn AI SEO & GEO (llms.txt Ready)",
        '    details: "Tích hợp sẵn chuẩn /llms.txt, /llms-full.txt, Models Reference và Cookbook thực chiến giúp lập trình viên & AI Coding Agents nắm bắt tức thì."',
        "---",
        "",
        "<HeroShowcase />",
        "",
        "<DomainGrid />",
        "",
    ];
    fs.writeFileSync(path.join(docsDir, "index.md"), homeLines.join("\n"), "utf-8");

    // 4. Write docs/.vitepress/config.mts
    const coreDomains = ["chat", "group", "friend", "profile"];
    const advancedDomains = ["sync", "zcloud", "call", "media"];
    const utilityDomains = ["auth", "sticker", "board", "business"];

    const coreSidebarItems = coreDomains.map((d) => ({
        text: `${DOMAIN_META[d].icon} ${DOMAIN_META[d].title} (${(domainApis[d] || []).length})`,
        link: `/api/${d}`,
    }));
    const advancedSidebarItems = advancedDomains.map((d) => ({
        text: `${DOMAIN_META[d].icon} ${DOMAIN_META[d].title} (${(domainApis[d] || []).length})`,
        link: `/api/${d}`,
    }));
    const utilitySidebarItems = utilityDomains.map((d) => ({
        text: `${DOMAIN_META[d].icon} ${DOMAIN_META[d].title} (${(domainApis[d] || []).length})`,
        link: `/api/${d}`,
    }));

    const jsonLdSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "@softtynet/zca-js",
        version: pkg.version,
        description: `Bộ thư viện SDK Zalo API hiện đại dành cho Node.js, TypeScript và Bun với ${totalApis} API nguyên bản trên 12 Domains, phát triển bởi Softtynet Co., Ltd.`,
        programmingLanguage: ["TypeScript", "JavaScript"],
        runtimePlatform: ["Node.js", "Bun"],
        codeRepository: "https://github.com/softtyos/zca-js",
        url: `${SITE_URL}/`,
        license: "https://opensource.org/licenses/MIT",
        author: {
            "@type": "Organization",
            name: "Softtynet Co., Ltd.",
            url: "https://github.com/softtyos",
        },
        keywords: [
            "zalo api",
            "zca-js",
            "@softtynet/zca-js",
            "softtynet",
            "zalo sdk nodejs",
            "zalo bot typescript",
            "zalo pc protocol",
            "zalo cloud message",
        ],
    });

    const configContent = `import { defineConfig } from "vitepress";

const SITE_URL = "${SITE_URL}";

export default defineConfig({
    lang: "vi-VN",
    title: "@softtynet/zca-js",
    titleTemplate: ":title | Softtynet Zalo SDK",
    description: "Tài liệu chính thức bộ SDK Zalo API (@softtynet/zca-js v${pkg.version}) phát triển bởi Softtynet Co., Ltd. dành cho Node.js, TypeScript và Bun (${totalApis} APIs, 12 Domains).",
    base: process.env.VITEPRESS_BASE || "/",
    ignoreDeadLinks: true,
    lastUpdated: true,
    sitemap: {
        hostname: "${SITE_URL}/",
    },
    head: [
        ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
        ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
        ["link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap" }],
        ["link", { rel: "icon", type: "image/svg+xml", href: "/zca-js-docs/favicon.svg" }],
        ["meta", { name: "author", content: "Softtynet Co., Ltd." }],
        ["meta", { name: "keywords", content: "zalo api, @softtynet/zca-js, zca-js, softtynet, zalo sdk, zalo bot nodejs, zalo typescript, zalo zdb sync, zalo cloud message" }],
        ["meta", { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:site_name", content: "@softtynet/zca-js — Softtynet Zalo SDK" }],
        ["meta", { property: "og:locale", content: "vi_VN" }],
        ["meta", { property: "og:image", content: "${SITE_URL}/og-banner.svg" }],
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        ["meta", { name: "twitter:image", content: "${SITE_URL}/og-banner.svg" }],
        ["link", { rel: "alternate", type: "text/plain", title: "LLM Summary Context (llms.txt)", href: "${SITE_URL}/llms.txt" }],
        ["link", { rel: "alternate", type: "text/plain", title: "LLM Full API Reference (llms-full.txt)", href: "${SITE_URL}/llms-full.txt" }],
        ["script", { type: "application/ld+json" }, ${JSON.stringify(jsonLdSchema)}],
    ],
    transformPageData(pageData) {
        const canonicalUrl = \`\${SITE_URL}/\${pageData.relativePath}\`
            .replace(/index\\.md$/, "")
            .replace(/\\.md$/, ".html");

        pageData.frontmatter.head ??= [];
        pageData.frontmatter.head.push(
            ["link", { rel: "canonical", href: canonicalUrl }],
            ["meta", { property: "og:url", content: canonicalUrl }],
            ["meta", { property: "og:title", content: pageData.frontmatter.title || pageData.title || "@softtynet/zca-js" }],
            ["meta", { property: "og:description", content: pageData.frontmatter.description || pageData.description || "Bộ SDK Zalo API Hiện Đại Cho Node.js, TypeScript & Bun bởi Softtynet Co., Ltd." }],
        );
    },
    themeConfig: {
        logo: "/logo.svg",
        siteTitle: "@softtynet/zca-js",
        nav: [
            { text: "Trang chủ", link: "/" },
            { text: "Hướng dẫn & Thực chiến", link: "/guide/getting-started" },
            { text: "⚡ API Explorer (${totalApis})", link: "/api/" },
            { text: "📦 Models & Enums", link: "/api/models" },
            { text: "🤖 llms.txt", link: "${SITE_URL}/llms.txt" },
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
                    { text: "📞 Gọi Thoại, Video & Gọi Nhóm 2 Chiều", link: "/guide/call-engine" },
                    { text: "Kiến trúc 12 Domains & 64-bit ID", link: "/guide/architecture" },
                    { text: "Lắng nghe WebSocket (Listener)", link: "/guide/listeners" },
                ],
            },
            {
                text: "⚡ Tra cứu API & Models",
                items: [
                    { text: "🔍 API Explorer (${totalApis} APIs)", link: "/api/" },
                    { text: "📦 Models, Enums & Errors", link: "/api/models" },
                ],
            },
            {
                text: "💬 Phân hệ Chat & Nhóm (Cốt lõi)",
                collapsed: false,
                items: ${JSON.stringify(coreSidebarItems, null, 20)},
            },
            {
                text: "🔄 Đồng bộ & Dữ liệu Nâng cao",
                collapsed: false,
                items: ${JSON.stringify(advancedSidebarItems, null, 20)},
            },
            {
                text: "💼 Tiện ích & Doanh nghiệp",
                collapsed: false,
                items: ${JSON.stringify(utilitySidebarItems, null, 20)},
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
        socialLinks: [
            { icon: "github", link: "https://github.com/softtyos/zca-js" },
        ],
        footer: {
            message: "Phát hành theo giấy phép MIT License • Tích hợp chuẩn AI SEO (/llms.txt & /llms-full.txt)",
            copyright: "Copyright © 2026 Softtynet Co., Ltd. All rights reserved.",
        },
    },
});
`;

    fs.writeFileSync(path.join(docsDir, ".vitepress", "config.mts"), configContent, "utf-8");
    console.log(
        `✅ Generated VitePress documentation, Models Reference, Cookbook, Brand Assets & AI SEO for ${totalApis} APIs.`,
    );
}

generateAllDocs();
