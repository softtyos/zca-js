import { Listener } from "./apis/listen.js";

import { acceptFriendRequestFactory } from "./apis/friend/acceptFriendRequest.js";
import { addGroupBlockedMemberFactory } from "./apis/group/addGroupBlockedMember.js";
import { addGroupDeputyFactory } from "./apis/group/addGroupDeputy.js";
import { addPollOptionsFactory } from "./apis/board/addPollOptions.js";
import { addQuickMessageFactory } from "./apis/business/addQuickMessage.js";
import { addReactionFactory } from "./apis/chat/addReaction.js";
import { addUnreadMarkFactory } from "./apis/chat/addUnreadMark.js";
import { addUserToGroupFactory } from "./apis/group/addUserToGroup.js";
import { blockUserFactory } from "./apis/friend/blockUser.js";
import { blockViewFeedFactory } from "./apis/friend/blockViewFeed.js";
import { cancelPullMobileFactory } from "./apis/sync/cancelPullMobile.js";
import { cancelVoiceCallFactory } from "./apis/call/cancelVoiceCall.js";
import { changeAccountAvatarFactory } from "./apis/profile/changeAccountAvatar.js";
import { changeFriendAliasFactory } from "./apis/friend/changeFriendAlias.js";
import { changeGroupAvatarFactory } from "./apis/group/changeGroupAvatar.js";
import { changeGroupNameFactory } from "./apis/group/changeGroupName.js";
import { changeGroupOwnerFactory } from "./apis/group/changeGroupOwner.js";
import { clearUnreadFriendRequestsFactory } from "./apis/friend/clearUnreadFriendRequests.js";
import { createAutoReplyFactory } from "./apis/business/createAutoReply.js";
import { createBankAccountFactory } from "./apis/business/createBankAccount.js";
import { createCatalogFactory } from "./apis/business/createCatalog.js";
import { createGroupFactory } from "./apis/group/createGroup.js";
import { createNoteFactory } from "./apis/board/createNote.js";
import { createPollFactory } from "./apis/board/createPoll.js";
import { createProductCatalogFactory } from "./apis/business/createProductCatalog.js";
import { createReminderFactory } from "./apis/board/createReminder.js";
import { decryptGidsFactory } from "./apis/auth/decryptGids.js";
import { deleteAutoReplyFactory } from "./apis/business/deleteAutoReply.js";
import { deleteAvatarFactory } from "./apis/profile/deleteAvatar.js";
import { deleteBankAccountFactory } from "./apis/business/deleteBankAccount.js";
import { deleteCatalogFactory } from "./apis/business/deleteCatalog.js";
import { deleteChatFactory } from "./apis/chat/deleteChat.js";
import { deleteGroupInviteBoxFactory } from "./apis/group/deleteGroupInviteBox.js";
import { deleteMessageFactory } from "./apis/chat/deleteMessage.js";
import { deleteProductCatalogFactory } from "./apis/business/deleteProductCatalog.js";
import { disableGroupLinkFactory } from "./apis/group/disableGroupLink.js";
import { disperseGroupFactory } from "./apis/group/disperseGroup.js";
import { downloadTransferSyncFactory } from "./apis/sync/downloadTransferSync.js";
import { editNoteFactory } from "./apis/board/editNote.js";
import { editReminderFactory } from "./apis/board/editReminder.js";
import { enableGroupLinkFactory } from "./apis/group/enableGroupLink.js";
import { encryptGidsFactory } from "./apis/auth/encryptGids.js";
import { endVoiceCallFactory } from "./apis/call/endVoiceCall.js";
import { fetchAccountInfoFactory } from "./apis/profile/fetchAccountInfo.js";
import { findUserFactory } from "./apis/friend/findUser.js";
import { findUserByUsernameFactory } from "./apis/friend/findUserByUsername.js";
import { forwardMessageFactory } from "./apis/chat/forwardMessage.js";
import { getAliasListFactory } from "./apis/friend/getAliasList.js";
import { getAliasListV2Factory } from "./apis/friend/getAliasListV2.js";
import { getAllFriendsFactory } from "./apis/friend/getAllFriends.js";
import { getAllGroupsFactory } from "./apis/group/getAllGroups.js";
import { getArchivedChatListFactory } from "./apis/chat/getArchivedChatList.js";
import { getAutoDeleteChatFactory } from "./apis/chat/getAutoDeleteChat.js";
import { getAutoReplyListFactory } from "./apis/business/getAutoReplyList.js";
import { getAvatarListFactory } from "./apis/profile/getAvatarList.js";
import { getAvatarUrlProfileFactory } from "./apis/profile/getAvatarUrlProfile.js";
import { getBizAccountFactory } from "./apis/business/getBizAccount.js";
import { getBlockFriendsFactory } from "./apis/friend/getBlockFriends.js";
import { getCatalogListFactory } from "./apis/business/getCatalogList.js";
import { getCloseFriendsFactory } from "./apis/friend/getCloseFriends.js";
import { getCloudInfoFactory } from "./apis/zcloud/getCloudInfo.js";
import { getCloudSettingsFactory } from "./apis/zcloud/getCloudSettings.js";
import { getCloudViewerKeyFactory } from "./apis/zcloud/getCloudViewerKey.js";
import { getContextFactory } from "./apis/auth/getContext.js";
import { getConversationMediaFactory } from "./apis/media/getConversationMedia.js";
import { getCookieFactory } from "./apis/auth/getCookie.js";
import { getEmojiStatusConfigFactory } from "./apis/profile/getEmojiStatusConfig.js";
import { getExtraFriendInfoFactory } from "./apis/friend/getExtraFriendInfo.js";
import { getExtraGroupInfoFactory } from "./apis/group/getExtraGroupInfo.js";
import { getFamilyProfileFactory } from "./apis/zcloud/getFamilyProfile.js";
import { getFamilyUsageFactory } from "./apis/zcloud/getFamilyUsage.js";
import { getFamilyViewerKeyFactory } from "./apis/zcloud/getFamilyViewerKey.js";
import { getFriendBoardListFactory } from "./apis/friend/getFriendBoardList.js";
import { getFriendOnlinesFactory } from "./apis/friend/getFriendOnlines.js";
import { getFriendRecommendationsFactory } from "./apis/friend/getFriendRecommendations.js";
import { getFriendRequestStatusFactory } from "./apis/friend/getFriendRequestStatus.js";
import { getFriendsEmojiStatusFactory } from "./apis/friend/getFriendsEmojiStatus.js";
import { getFullAvatarFactory } from "./apis/profile/getFullAvatar.js";
import { getGroupBlockedMemberFactory } from "./apis/group/getGroupBlockedMember.js";
import { getGroupChatHistoryFactory } from "./apis/group/getGroupChatHistory.js";
import { getGroupCloudMessageJumpFactory } from "./apis/group/getGroupCloudMessageJump.js";
import { getGroupHistoryLegacyFactory } from "./apis/group/getGroupHistoryLegacy.js";
import { getGroupInfoFactory } from "./apis/group/getGroupInfo.js";
import { getGroupInfoV2Factory } from "./apis/group/getGroupInfoV2.js";
import { getGroupInviteBoxInfoFactory } from "./apis/group/getGroupInviteBoxInfo.js";
import { getGroupInviteBoxListFactory } from "./apis/group/getGroupInviteBoxList.js";
import { getGroupLinkDetailFactory } from "./apis/group/getGroupLinkDetail.js";
import { getGroupLinkInfoFactory } from "./apis/group/getGroupLinkInfo.js";
import { getGroupListV3Factory } from "./apis/group/getGroupListV3.js";
import { getGroupMembersInfoFactory } from "./apis/group/getGroupMembersInfo.js";
import { getGroupMessageStatusFactory } from "./apis/group/getGroupMessageStatus.js";
import { getHiddenConversationsFactory } from "./apis/chat/getHiddenConversations.js";
import { getLabelsFactory } from "./apis/business/getLabels.js";
import { getLastReadContactTabFactory } from "./apis/friend/getLastReadContactTab.js";
import { getLastSeenFactory } from "./apis/chat/getLastSeen.js";
import { getLastSeenReactionFactory } from "./apis/chat/getLastSeenReaction.js";
import { getListBankFactory } from "./apis/business/getListBank.js";
import { getListBankAccountFactory } from "./apis/business/getListBankAccount.js";
import { getListBoardFactory } from "./apis/board/getListBoard.js";
import { getListDeviceFactory } from "./apis/auth/getListDevice.js";
import { getListPinTopicsFactory } from "./apis/board/getListPinTopics.js";
import { getListReminderFactory } from "./apis/board/getListReminder.js";
import { getMediaStorePreviewFactory } from "./apis/media/getMediaStorePreview.js";
import { getMiniProfileFactory } from "./apis/profile/getMiniProfile.js";
import { getMultiUsersByPhonesFactory } from "./apis/friend/getMultiUsersByPhones.js";
import { getMuteFactory } from "./apis/chat/getMute.js";
import { getNoisedIdsFactory } from "./apis/auth/getNoisedIds.js";
import { getOwnIdFactory } from "./apis/auth/getOwnId.js";
import { getPendingGroupMembersFactory } from "./apis/group/getPendingGroupMembers.js";
import { getPersonalizedStickerListFactory } from "./apis/sticker/getPersonalizedStickerList.js";
import { getPhonebookV2Factory } from "./apis/friend/getPhonebookV2.js";
import { getPinConversationsFactory } from "./apis/chat/getPinConversations.js";
import { getPollDetailFactory } from "./apis/board/getPollDetail.js";
import { getProductCatalogListFactory } from "./apis/business/getProductCatalogList.js";
import { getProfileRankFactory } from "./apis/profile/getProfileRank.js";
import { getProfileVerificationStatusFactory } from "./apis/profile/getProfileVerificationStatus.js";
import { getQRFactory } from "./apis/auth/getQR.js";
import { getQuickMessageListFactory } from "./apis/business/getQuickMessageList.js";
import { getQuotaCommunityFactory } from "./apis/group/getQuotaCommunity.js";
import { getRecentSearchListFactory } from "./apis/chat/getRecentSearchList.js";
import { getRelatedFriendGroupFactory } from "./apis/group/getRelatedFriendGroup.js";
import { getReminderFactory } from "./apis/board/getReminder.js";
import { getReminderResponsesFactory } from "./apis/board/getReminderResponses.js";
import { getSentFriendRequestFactory } from "./apis/friend/getSentFriendRequest.js";
import { getSettingsFactory } from "./apis/profile/getSettings.js";
import { getStickerCategoriesV2Factory } from "./apis/sticker/getStickerCategoriesV2.js";
import { getStickerCategoryDataFactory } from "./apis/sticker/getStickerCategoryData.js";
import { getStickerCategoryDetailFactory } from "./apis/sticker/getStickerCategoryDetail.js";
import { getStickerHelloFactory } from "./apis/sticker/getStickerHello.js";
import { getStickersFactory } from "./apis/sticker/getStickers.js";
import { getStickersDetailFactory } from "./apis/sticker/getStickersDetail.js";
import { getStickerSuggestionFactory } from "./apis/sticker/getStickerSuggestion.js";
import { getStickerSuggestKeywordsFactory } from "./apis/sticker/getStickerSuggestKeywords.js";
import { getSyncDataFactory } from "./apis/sync/getSyncData.js";
import { getUnreadMarkFactory } from "./apis/chat/getUnreadMark.js";
import { getUsageMyCloudFactory } from "./apis/zcloud/getUsageMyCloud.js";
import { getUsageZCloudFactory } from "./apis/zcloud/getUsageZCloud.js";
import { getUserInfoFactory } from "./apis/profile/getUserInfo.js";
import { inviteUserToGroupsFactory } from "./apis/group/inviteUserToGroups.js";
import { joinGroupInviteBoxFactory } from "./apis/group/joinGroupInviteBox.js";
import { joinGroupLinkFactory } from "./apis/group/joinGroupLink.js";
import { keepAliveFactory } from "./apis/auth/keepAlive.js";
import { lastOnlineFactory } from "./apis/friend/lastOnline.js";
import { leaveGroupFactory } from "./apis/group/leaveGroup.js";
import { lockPollFactory } from "./apis/board/lockPoll.js";
import { lostFocusFactory } from "./apis/auth/lostFocus.js";
import { parseLinkFactory } from "./apis/chat/parseLink.js";
import { preloadConversationsFactory } from "./apis/chat/preloadConversations.js";
import { pullMobileFactory } from "./apis/sync/pullMobile.js";
import { readContactTabFactory } from "./apis/friend/readContactTab.js";
import { registerCatalogFactory } from "./apis/business/registerCatalog.js";
import { rejectFriendRequestFactory } from "./apis/friend/rejectFriendRequest.js";
import { removeConversationMediaFactory } from "./apis/media/removeConversationMedia.js";
import { removeFriendFactory } from "./apis/friend/removeFriend.js";
import { removeFriendAliasFactory } from "./apis/friend/removeFriendAlias.js";
import { removeGroupBlockedMemberFactory } from "./apis/group/removeGroupBlockedMember.js";
import { removeGroupDeputyFactory } from "./apis/group/removeGroupDeputy.js";
import { removeQuickMessageFactory } from "./apis/business/removeQuickMessage.js";
import { removeReminderFactory } from "./apis/board/removeReminder.js";
import { removeUnreadMarkFactory } from "./apis/chat/removeUnreadMark.js";
import { removeUserFromGroupFactory } from "./apis/group/removeUserFromGroup.js";
import { requestSyncFromPhoneFactory } from "./apis/sync/requestSyncFromPhone.js";
import { resetHiddenConversPinFactory } from "./apis/chat/resetHiddenConversPin.js";
import { reuseAvatarFactory } from "./apis/profile/reuseAvatar.js";
import { reviewPendingMemberRequestFactory } from "./apis/group/reviewPendingMemberRequest.js";
import { scanURLFactory } from "./apis/auth/scanURL.js";
import { searchStickerFactory } from "./apis/sticker/searchSticker.js";
import { sendBankCardFactory } from "./apis/chat/sendBankCard.js";
import { sendCardFactory } from "./apis/chat/sendCard.js";
import { sendDeliveredEventFactory } from "./apis/chat/sendDeliveredEvent.js";
import { sendFriendRequestFactory } from "./apis/friend/sendFriendRequest.js";
import { sendLinkFactory } from "./apis/chat/sendLink.js";
import { sendMessageFactory } from "./apis/chat/sendMessage.js";
import { sendReportFactory } from "./apis/chat/sendReport.js";
import { sendSeenEventFactory } from "./apis/chat/sendSeenEvent.js";
import { sendStickerFactory } from "./apis/chat/sendSticker.js";
import { sendTypingEventFactory } from "./apis/chat/sendTypingEvent.js";
import { sendVideoFactory } from "./apis/chat/sendVideo.js";
import { sendVoiceFactory } from "./apis/chat/sendVoice.js";
import { sendVoiceCallFactory } from "./apis/call/sendVoiceCall.js";
import { setHiddenConversationsFactory } from "./apis/chat/setHiddenConversations.js";
import { setMuteFactory } from "./apis/chat/setMute.js";
import { setPinnedConversationsFactory } from "./apis/chat/setPinnedConversations.js";
import { sharePollFactory } from "./apis/board/sharePoll.js";
import { unblockUserFactory } from "./apis/friend/unblockUser.js";
import { undoFactory } from "./apis/chat/undo.js";
import { undoFriendRequestFactory } from "./apis/friend/undoFriendRequest.js";
import { undoMultiMessageFactory } from "./apis/chat/undoMultiMessage.js";
import { updateActiveStatusFactory } from "./apis/auth/updateActiveStatus.js";
import { updateArchivedChatListFactory } from "./apis/chat/updateArchivedChatList.js";
import { updateAutoDeleteChatFactory } from "./apis/chat/updateAutoDeleteChat.js";
import { updateAutoReplyFactory } from "./apis/business/updateAutoReply.js";
import { updateBankAccountFactory } from "./apis/business/updateBankAccount.js";
import { updateCatalogFactory } from "./apis/business/updateCatalog.js";
import { updateGroupSettingsFactory } from "./apis/group/updateGroupSettings.js";
import { updateHiddenConversPinFactory } from "./apis/chat/updateHiddenConversPin.js";
import { updateLabelsFactory } from "./apis/business/updateLabels.js";
import { updateLangFactory } from "./apis/auth/updateLang.js";
import { updateProductCatalogFactory } from "./apis/business/updateProductCatalog.js";
import { updateProfileFactory } from "./apis/profile/updateProfile.js";
import { updateProfileBioFactory } from "./apis/profile/updateProfileBio.js";
import { updateQuickMessageFactory } from "./apis/business/updateQuickMessage.js";
import { updateRecentSearchFactory } from "./apis/chat/updateRecentSearch.js";
import { updateSettingsFactory } from "./apis/profile/updateSettings.js";
import { upgradeGroupToCommunityFactory } from "./apis/group/upgradeGroupToCommunity.js";
import { uploadAttachmentFactory } from "./apis/media/uploadAttachment.js";
import { uploadProductPhotoFactory } from "./apis/business/uploadProductPhoto.js";
import { verifyCloudMediaFactory } from "./apis/zcloud/verifyCloudMedia.js";
import { voiceToTextFactory } from "./apis/media/voiceToText.js";
import { votePollFactory } from "./apis/board/votePoll.js";
import { customFactory } from "./apis/custom.js";
import type { ZPWServiceMap, ContextSession } from "./context.js";

export type AuthDomainAPI = {
    readonly decryptGids: ReturnType<typeof decryptGidsFactory>;
    readonly encryptGids: ReturnType<typeof encryptGidsFactory>;
    readonly getContext: ReturnType<typeof getContextFactory>;
    readonly getCookie: ReturnType<typeof getCookieFactory>;
    readonly getListDevice: ReturnType<typeof getListDeviceFactory>;
    readonly getNoisedIds: ReturnType<typeof getNoisedIdsFactory>;
    readonly getOwnId: ReturnType<typeof getOwnIdFactory>;
    readonly getQR: ReturnType<typeof getQRFactory>;
    readonly keepAlive: ReturnType<typeof keepAliveFactory>;
    readonly lostFocus: ReturnType<typeof lostFocusFactory>;
    readonly scanURL: ReturnType<typeof scanURLFactory>;
    readonly updateActiveStatus: ReturnType<typeof updateActiveStatusFactory>;
    readonly updateLang: ReturnType<typeof updateLangFactory>;
};

export type BoardDomainAPI = {
    readonly addPollOptions: ReturnType<typeof addPollOptionsFactory>;
    readonly createNote: ReturnType<typeof createNoteFactory>;
    readonly createPoll: ReturnType<typeof createPollFactory>;
    readonly createReminder: ReturnType<typeof createReminderFactory>;
    readonly editNote: ReturnType<typeof editNoteFactory>;
    readonly editReminder: ReturnType<typeof editReminderFactory>;
    readonly getListBoard: ReturnType<typeof getListBoardFactory>;
    readonly getListPinTopics: ReturnType<typeof getListPinTopicsFactory>;
    readonly getListReminder: ReturnType<typeof getListReminderFactory>;
    readonly getPollDetail: ReturnType<typeof getPollDetailFactory>;
    readonly getReminder: ReturnType<typeof getReminderFactory>;
    readonly getReminderResponses: ReturnType<typeof getReminderResponsesFactory>;
    readonly lockPoll: ReturnType<typeof lockPollFactory>;
    readonly removeReminder: ReturnType<typeof removeReminderFactory>;
    readonly sharePoll: ReturnType<typeof sharePollFactory>;
    readonly votePoll: ReturnType<typeof votePollFactory>;
};

export type BusinessDomainAPI = {
    readonly addQuickMessage: ReturnType<typeof addQuickMessageFactory>;
    readonly createAutoReply: ReturnType<typeof createAutoReplyFactory>;
    readonly createBankAccount: ReturnType<typeof createBankAccountFactory>;
    readonly createCatalog: ReturnType<typeof createCatalogFactory>;
    readonly createProductCatalog: ReturnType<typeof createProductCatalogFactory>;
    readonly deleteAutoReply: ReturnType<typeof deleteAutoReplyFactory>;
    readonly deleteBankAccount: ReturnType<typeof deleteBankAccountFactory>;
    readonly deleteCatalog: ReturnType<typeof deleteCatalogFactory>;
    readonly deleteProductCatalog: ReturnType<typeof deleteProductCatalogFactory>;
    readonly getAutoReplyList: ReturnType<typeof getAutoReplyListFactory>;
    readonly getBizAccount: ReturnType<typeof getBizAccountFactory>;
    readonly getCatalogList: ReturnType<typeof getCatalogListFactory>;
    readonly getLabels: ReturnType<typeof getLabelsFactory>;
    readonly getListBank: ReturnType<typeof getListBankFactory>;
    readonly getListBankAccount: ReturnType<typeof getListBankAccountFactory>;
    readonly getProductCatalogList: ReturnType<typeof getProductCatalogListFactory>;
    readonly getQuickMessageList: ReturnType<typeof getQuickMessageListFactory>;
    readonly registerCatalog: ReturnType<typeof registerCatalogFactory>;
    readonly removeQuickMessage: ReturnType<typeof removeQuickMessageFactory>;
    readonly updateAutoReply: ReturnType<typeof updateAutoReplyFactory>;
    readonly updateBankAccount: ReturnType<typeof updateBankAccountFactory>;
    readonly updateCatalog: ReturnType<typeof updateCatalogFactory>;
    readonly updateLabels: ReturnType<typeof updateLabelsFactory>;
    readonly updateProductCatalog: ReturnType<typeof updateProductCatalogFactory>;
    readonly updateQuickMessage: ReturnType<typeof updateQuickMessageFactory>;
    readonly uploadProductPhoto: ReturnType<typeof uploadProductPhotoFactory>;
};

export type CallDomainAPI = {
    readonly cancelVoiceCall: ReturnType<typeof cancelVoiceCallFactory>;
    readonly endVoiceCall: ReturnType<typeof endVoiceCallFactory>;
    readonly sendVoiceCall: ReturnType<typeof sendVoiceCallFactory>;
};

export type ChatDomainAPI = {
    readonly addReaction: ReturnType<typeof addReactionFactory>;
    readonly addUnreadMark: ReturnType<typeof addUnreadMarkFactory>;
    readonly deleteChat: ReturnType<typeof deleteChatFactory>;
    readonly deleteMessage: ReturnType<typeof deleteMessageFactory>;
    readonly forwardMessage: ReturnType<typeof forwardMessageFactory>;
    readonly getArchivedChatList: ReturnType<typeof getArchivedChatListFactory>;
    readonly getAutoDeleteChat: ReturnType<typeof getAutoDeleteChatFactory>;
    readonly getHiddenConversations: ReturnType<typeof getHiddenConversationsFactory>;
    readonly getLastSeen: ReturnType<typeof getLastSeenFactory>;
    readonly getLastSeenReaction: ReturnType<typeof getLastSeenReactionFactory>;
    readonly getMute: ReturnType<typeof getMuteFactory>;
    readonly getPinConversations: ReturnType<typeof getPinConversationsFactory>;
    readonly getRecentSearchList: ReturnType<typeof getRecentSearchListFactory>;
    readonly getUnreadMark: ReturnType<typeof getUnreadMarkFactory>;
    readonly parseLink: ReturnType<typeof parseLinkFactory>;
    readonly preloadConversations: ReturnType<typeof preloadConversationsFactory>;
    readonly removeUnreadMark: ReturnType<typeof removeUnreadMarkFactory>;
    readonly resetHiddenConversPin: ReturnType<typeof resetHiddenConversPinFactory>;
    readonly sendBankCard: ReturnType<typeof sendBankCardFactory>;
    readonly sendCard: ReturnType<typeof sendCardFactory>;
    readonly sendDeliveredEvent: ReturnType<typeof sendDeliveredEventFactory>;
    readonly sendLink: ReturnType<typeof sendLinkFactory>;
    readonly sendMessage: ReturnType<typeof sendMessageFactory>;
    readonly sendReport: ReturnType<typeof sendReportFactory>;
    readonly sendSeenEvent: ReturnType<typeof sendSeenEventFactory>;
    readonly sendSticker: ReturnType<typeof sendStickerFactory>;
    readonly sendTypingEvent: ReturnType<typeof sendTypingEventFactory>;
    readonly sendVideo: ReturnType<typeof sendVideoFactory>;
    readonly sendVoice: ReturnType<typeof sendVoiceFactory>;
    readonly setHiddenConversations: ReturnType<typeof setHiddenConversationsFactory>;
    readonly setMute: ReturnType<typeof setMuteFactory>;
    readonly setPinnedConversations: ReturnType<typeof setPinnedConversationsFactory>;
    readonly undo: ReturnType<typeof undoFactory>;
    readonly undoMultiMessage: ReturnType<typeof undoMultiMessageFactory>;
    readonly updateArchivedChatList: ReturnType<typeof updateArchivedChatListFactory>;
    readonly updateAutoDeleteChat: ReturnType<typeof updateAutoDeleteChatFactory>;
    readonly updateHiddenConversPin: ReturnType<typeof updateHiddenConversPinFactory>;
    readonly updateRecentSearch: ReturnType<typeof updateRecentSearchFactory>;
};

export type FriendDomainAPI = {
    readonly acceptFriendRequest: ReturnType<typeof acceptFriendRequestFactory>;
    readonly blockUser: ReturnType<typeof blockUserFactory>;
    readonly blockViewFeed: ReturnType<typeof blockViewFeedFactory>;
    readonly changeFriendAlias: ReturnType<typeof changeFriendAliasFactory>;
    readonly clearUnreadFriendRequests: ReturnType<typeof clearUnreadFriendRequestsFactory>;
    readonly findUser: ReturnType<typeof findUserFactory>;
    readonly findUserByUsername: ReturnType<typeof findUserByUsernameFactory>;
    readonly getAliasList: ReturnType<typeof getAliasListFactory>;
    readonly getAliasListV2: ReturnType<typeof getAliasListV2Factory>;
    readonly getAllFriends: ReturnType<typeof getAllFriendsFactory>;
    readonly getBlockFriends: ReturnType<typeof getBlockFriendsFactory>;
    readonly getCloseFriends: ReturnType<typeof getCloseFriendsFactory>;
    readonly getExtraFriendInfo: ReturnType<typeof getExtraFriendInfoFactory>;
    readonly getFriendBoardList: ReturnType<typeof getFriendBoardListFactory>;
    readonly getFriendOnlines: ReturnType<typeof getFriendOnlinesFactory>;
    readonly getFriendRecommendations: ReturnType<typeof getFriendRecommendationsFactory>;
    readonly getFriendRequestStatus: ReturnType<typeof getFriendRequestStatusFactory>;
    readonly getFriendsEmojiStatus: ReturnType<typeof getFriendsEmojiStatusFactory>;
    readonly getLastReadContactTab: ReturnType<typeof getLastReadContactTabFactory>;
    readonly getMultiUsersByPhones: ReturnType<typeof getMultiUsersByPhonesFactory>;
    readonly getPhonebookV2: ReturnType<typeof getPhonebookV2Factory>;
    readonly getSentFriendRequest: ReturnType<typeof getSentFriendRequestFactory>;
    readonly lastOnline: ReturnType<typeof lastOnlineFactory>;
    readonly readContactTab: ReturnType<typeof readContactTabFactory>;
    readonly rejectFriendRequest: ReturnType<typeof rejectFriendRequestFactory>;
    readonly removeFriend: ReturnType<typeof removeFriendFactory>;
    readonly removeFriendAlias: ReturnType<typeof removeFriendAliasFactory>;
    readonly sendFriendRequest: ReturnType<typeof sendFriendRequestFactory>;
    readonly unblockUser: ReturnType<typeof unblockUserFactory>;
    readonly undoFriendRequest: ReturnType<typeof undoFriendRequestFactory>;
};

export type GroupDomainAPI = {
    readonly addGroupBlockedMember: ReturnType<typeof addGroupBlockedMemberFactory>;
    readonly addGroupDeputy: ReturnType<typeof addGroupDeputyFactory>;
    readonly addUserToGroup: ReturnType<typeof addUserToGroupFactory>;
    readonly changeGroupAvatar: ReturnType<typeof changeGroupAvatarFactory>;
    readonly changeGroupName: ReturnType<typeof changeGroupNameFactory>;
    readonly changeGroupOwner: ReturnType<typeof changeGroupOwnerFactory>;
    readonly createGroup: ReturnType<typeof createGroupFactory>;
    readonly deleteGroupInviteBox: ReturnType<typeof deleteGroupInviteBoxFactory>;
    readonly disableGroupLink: ReturnType<typeof disableGroupLinkFactory>;
    readonly disperseGroup: ReturnType<typeof disperseGroupFactory>;
    readonly enableGroupLink: ReturnType<typeof enableGroupLinkFactory>;
    readonly getAllGroups: ReturnType<typeof getAllGroupsFactory>;
    readonly getExtraGroupInfo: ReturnType<typeof getExtraGroupInfoFactory>;
    readonly getGroupBlockedMember: ReturnType<typeof getGroupBlockedMemberFactory>;
    readonly getGroupChatHistory: ReturnType<typeof getGroupChatHistoryFactory>;
    readonly getGroupCloudMessageJump: ReturnType<typeof getGroupCloudMessageJumpFactory>;
    readonly getGroupHistoryLegacy: ReturnType<typeof getGroupHistoryLegacyFactory>;
    readonly getGroupInfo: ReturnType<typeof getGroupInfoFactory>;
    readonly getGroupInfoV2: ReturnType<typeof getGroupInfoV2Factory>;
    readonly getGroupInviteBoxInfo: ReturnType<typeof getGroupInviteBoxInfoFactory>;
    readonly getGroupInviteBoxList: ReturnType<typeof getGroupInviteBoxListFactory>;
    readonly getGroupLinkDetail: ReturnType<typeof getGroupLinkDetailFactory>;
    readonly getGroupLinkInfo: ReturnType<typeof getGroupLinkInfoFactory>;
    readonly getGroupListV3: ReturnType<typeof getGroupListV3Factory>;
    readonly getGroupMembersInfo: ReturnType<typeof getGroupMembersInfoFactory>;
    readonly getGroupMessageStatus: ReturnType<typeof getGroupMessageStatusFactory>;
    readonly getPendingGroupMembers: ReturnType<typeof getPendingGroupMembersFactory>;
    readonly getQuotaCommunity: ReturnType<typeof getQuotaCommunityFactory>;
    readonly getRelatedFriendGroup: ReturnType<typeof getRelatedFriendGroupFactory>;
    readonly inviteUserToGroups: ReturnType<typeof inviteUserToGroupsFactory>;
    readonly joinGroupInviteBox: ReturnType<typeof joinGroupInviteBoxFactory>;
    readonly joinGroupLink: ReturnType<typeof joinGroupLinkFactory>;
    readonly leaveGroup: ReturnType<typeof leaveGroupFactory>;
    readonly removeGroupBlockedMember: ReturnType<typeof removeGroupBlockedMemberFactory>;
    readonly removeGroupDeputy: ReturnType<typeof removeGroupDeputyFactory>;
    readonly removeUserFromGroup: ReturnType<typeof removeUserFromGroupFactory>;
    readonly reviewPendingMemberRequest: ReturnType<typeof reviewPendingMemberRequestFactory>;
    readonly updateGroupSettings: ReturnType<typeof updateGroupSettingsFactory>;
    readonly upgradeGroupToCommunity: ReturnType<typeof upgradeGroupToCommunityFactory>;
};

export type MediaDomainAPI = {
    readonly getConversationMedia: ReturnType<typeof getConversationMediaFactory>;
    readonly getMediaStorePreview: ReturnType<typeof getMediaStorePreviewFactory>;
    readonly removeConversationMedia: ReturnType<typeof removeConversationMediaFactory>;
    readonly uploadAttachment: ReturnType<typeof uploadAttachmentFactory>;
    readonly voiceToText: ReturnType<typeof voiceToTextFactory>;
};

export type ProfileDomainAPI = {
    readonly changeAccountAvatar: ReturnType<typeof changeAccountAvatarFactory>;
    readonly deleteAvatar: ReturnType<typeof deleteAvatarFactory>;
    readonly fetchAccountInfo: ReturnType<typeof fetchAccountInfoFactory>;
    readonly getAvatarList: ReturnType<typeof getAvatarListFactory>;
    readonly getAvatarUrlProfile: ReturnType<typeof getAvatarUrlProfileFactory>;
    readonly getEmojiStatusConfig: ReturnType<typeof getEmojiStatusConfigFactory>;
    readonly getFullAvatar: ReturnType<typeof getFullAvatarFactory>;
    readonly getMiniProfile: ReturnType<typeof getMiniProfileFactory>;
    readonly getProfileRank: ReturnType<typeof getProfileRankFactory>;
    readonly getProfileVerificationStatus: ReturnType<typeof getProfileVerificationStatusFactory>;
    readonly getSettings: ReturnType<typeof getSettingsFactory>;
    readonly getUserInfo: ReturnType<typeof getUserInfoFactory>;
    readonly reuseAvatar: ReturnType<typeof reuseAvatarFactory>;
    readonly updateProfile: ReturnType<typeof updateProfileFactory>;
    readonly updateProfileBio: ReturnType<typeof updateProfileBioFactory>;
    readonly updateSettings: ReturnType<typeof updateSettingsFactory>;
};

export type StickerDomainAPI = {
    readonly getPersonalizedStickerList: ReturnType<typeof getPersonalizedStickerListFactory>;
    readonly getStickerCategoriesV2: ReturnType<typeof getStickerCategoriesV2Factory>;
    readonly getStickerCategoryData: ReturnType<typeof getStickerCategoryDataFactory>;
    readonly getStickerCategoryDetail: ReturnType<typeof getStickerCategoryDetailFactory>;
    readonly getStickerHello: ReturnType<typeof getStickerHelloFactory>;
    readonly getStickers: ReturnType<typeof getStickersFactory>;
    readonly getStickersDetail: ReturnType<typeof getStickersDetailFactory>;
    readonly getStickerSuggestion: ReturnType<typeof getStickerSuggestionFactory>;
    readonly getStickerSuggestKeywords: ReturnType<typeof getStickerSuggestKeywordsFactory>;
    readonly searchSticker: ReturnType<typeof searchStickerFactory>;
};

export type SyncDomainAPI = {
    readonly cancelPullMobile: ReturnType<typeof cancelPullMobileFactory>;
    readonly downloadTransferSync: ReturnType<typeof downloadTransferSyncFactory>;
    readonly getSyncData: ReturnType<typeof getSyncDataFactory>;
    readonly pullMobile: ReturnType<typeof pullMobileFactory>;
    readonly requestSyncFromPhone: ReturnType<typeof requestSyncFromPhoneFactory>;
};

export type ZcloudDomainAPI = {
    readonly getCloudInfo: ReturnType<typeof getCloudInfoFactory>;
    readonly getCloudSettings: ReturnType<typeof getCloudSettingsFactory>;
    readonly getCloudViewerKey: ReturnType<typeof getCloudViewerKeyFactory>;
    readonly getFamilyProfile: ReturnType<typeof getFamilyProfileFactory>;
    readonly getFamilyUsage: ReturnType<typeof getFamilyUsageFactory>;
    readonly getFamilyViewerKey: ReturnType<typeof getFamilyViewerKeyFactory>;
    readonly getUsageMyCloud: ReturnType<typeof getUsageMyCloudFactory>;
    readonly getUsageZCloud: ReturnType<typeof getUsageZCloudFactory>;
    readonly verifyCloudMedia: ReturnType<typeof verifyCloudMediaFactory>;
};

export class API {
    private readonly ctx: ContextSession;
    private readonly _cache: Record<string, unknown> = Object.create(null);
    private readonly _domains: Record<string, unknown> = Object.create(null);

    public zpwServiceMap: ZPWServiceMap;
    public listener: Listener;
    public custom: ReturnType<typeof customFactory>;

    constructor(ctx: ContextSession, zpwServiceMap: ZPWServiceMap, wsUrls: string[]) {
        this.ctx = ctx;
        this.zpwServiceMap = zpwServiceMap;
        this.listener = new Listener(ctx, wsUrls);
        this.custom = customFactory(ctx, this);
    }

    // =========================================================================
    // Domain-Driven Namespaces (12 Domains)
    // =========================================================================

    public get auth(): AuthDomainAPI {
        if (!this._domains.auth) {
            const createNamespace = (api: API): AuthDomainAPI => ({
                get decryptGids() { return api.decryptGids; },
                get encryptGids() { return api.encryptGids; },
                get getContext() { return api.getContext; },
                get getCookie() { return api.getCookie; },
                get getListDevice() { return api.getListDevice; },
                get getNoisedIds() { return api.getNoisedIds; },
                get getOwnId() { return api.getOwnId; },
                get getQR() { return api.getQR; },
                get keepAlive() { return api.keepAlive; },
                get lostFocus() { return api.lostFocus; },
                get scanURL() { return api.scanURL; },
                get updateActiveStatus() { return api.updateActiveStatus; },
                get updateLang() { return api.updateLang; },
            });
            this._domains.auth = createNamespace(this);
        }
        return this._domains.auth as AuthDomainAPI;
    }

    public get board(): BoardDomainAPI {
        if (!this._domains.board) {
            const createNamespace = (api: API): BoardDomainAPI => ({
                get addPollOptions() { return api.addPollOptions; },
                get createNote() { return api.createNote; },
                get createPoll() { return api.createPoll; },
                get createReminder() { return api.createReminder; },
                get editNote() { return api.editNote; },
                get editReminder() { return api.editReminder; },
                get getListBoard() { return api.getListBoard; },
                get getListPinTopics() { return api.getListPinTopics; },
                get getListReminder() { return api.getListReminder; },
                get getPollDetail() { return api.getPollDetail; },
                get getReminder() { return api.getReminder; },
                get getReminderResponses() { return api.getReminderResponses; },
                get lockPoll() { return api.lockPoll; },
                get removeReminder() { return api.removeReminder; },
                get sharePoll() { return api.sharePoll; },
                get votePoll() { return api.votePoll; },
            });
            this._domains.board = createNamespace(this);
        }
        return this._domains.board as BoardDomainAPI;
    }

    public get business(): BusinessDomainAPI {
        if (!this._domains.business) {
            const createNamespace = (api: API): BusinessDomainAPI => ({
                get addQuickMessage() { return api.addQuickMessage; },
                get createAutoReply() { return api.createAutoReply; },
                get createBankAccount() { return api.createBankAccount; },
                get createCatalog() { return api.createCatalog; },
                get createProductCatalog() { return api.createProductCatalog; },
                get deleteAutoReply() { return api.deleteAutoReply; },
                get deleteBankAccount() { return api.deleteBankAccount; },
                get deleteCatalog() { return api.deleteCatalog; },
                get deleteProductCatalog() { return api.deleteProductCatalog; },
                get getAutoReplyList() { return api.getAutoReplyList; },
                get getBizAccount() { return api.getBizAccount; },
                get getCatalogList() { return api.getCatalogList; },
                get getLabels() { return api.getLabels; },
                get getListBank() { return api.getListBank; },
                get getListBankAccount() { return api.getListBankAccount; },
                get getProductCatalogList() { return api.getProductCatalogList; },
                get getQuickMessageList() { return api.getQuickMessageList; },
                get registerCatalog() { return api.registerCatalog; },
                get removeQuickMessage() { return api.removeQuickMessage; },
                get updateAutoReply() { return api.updateAutoReply; },
                get updateBankAccount() { return api.updateBankAccount; },
                get updateCatalog() { return api.updateCatalog; },
                get updateLabels() { return api.updateLabels; },
                get updateProductCatalog() { return api.updateProductCatalog; },
                get updateQuickMessage() { return api.updateQuickMessage; },
                get uploadProductPhoto() { return api.uploadProductPhoto; },
            });
            this._domains.business = createNamespace(this);
        }
        return this._domains.business as BusinessDomainAPI;
    }

    public get call(): CallDomainAPI {
        if (!this._domains.call) {
            const createNamespace = (api: API): CallDomainAPI => ({
                get cancelVoiceCall() { return api.cancelVoiceCall; },
                get endVoiceCall() { return api.endVoiceCall; },
                get sendVoiceCall() { return api.sendVoiceCall; },
            });
            this._domains.call = createNamespace(this);
        }
        return this._domains.call as CallDomainAPI;
    }

    public get chat(): ChatDomainAPI {
        if (!this._domains.chat) {
            const createNamespace = (api: API): ChatDomainAPI => ({
                get addReaction() { return api.addReaction; },
                get addUnreadMark() { return api.addUnreadMark; },
                get deleteChat() { return api.deleteChat; },
                get deleteMessage() { return api.deleteMessage; },
                get forwardMessage() { return api.forwardMessage; },
                get getArchivedChatList() { return api.getArchivedChatList; },
                get getAutoDeleteChat() { return api.getAutoDeleteChat; },
                get getHiddenConversations() { return api.getHiddenConversations; },
                get getLastSeen() { return api.getLastSeen; },
                get getLastSeenReaction() { return api.getLastSeenReaction; },
                get getMute() { return api.getMute; },
                get getPinConversations() { return api.getPinConversations; },
                get getRecentSearchList() { return api.getRecentSearchList; },
                get getUnreadMark() { return api.getUnreadMark; },
                get parseLink() { return api.parseLink; },
                get preloadConversations() { return api.preloadConversations; },
                get removeUnreadMark() { return api.removeUnreadMark; },
                get resetHiddenConversPin() { return api.resetHiddenConversPin; },
                get sendBankCard() { return api.sendBankCard; },
                get sendCard() { return api.sendCard; },
                get sendDeliveredEvent() { return api.sendDeliveredEvent; },
                get sendLink() { return api.sendLink; },
                get sendMessage() { return api.sendMessage; },
                get sendReport() { return api.sendReport; },
                get sendSeenEvent() { return api.sendSeenEvent; },
                get sendSticker() { return api.sendSticker; },
                get sendTypingEvent() { return api.sendTypingEvent; },
                get sendVideo() { return api.sendVideo; },
                get sendVoice() { return api.sendVoice; },
                get setHiddenConversations() { return api.setHiddenConversations; },
                get setMute() { return api.setMute; },
                get setPinnedConversations() { return api.setPinnedConversations; },
                get undo() { return api.undo; },
                get undoMultiMessage() { return api.undoMultiMessage; },
                get updateArchivedChatList() { return api.updateArchivedChatList; },
                get updateAutoDeleteChat() { return api.updateAutoDeleteChat; },
                get updateHiddenConversPin() { return api.updateHiddenConversPin; },
                get updateRecentSearch() { return api.updateRecentSearch; },
            });
            this._domains.chat = createNamespace(this);
        }
        return this._domains.chat as ChatDomainAPI;
    }

    public get friend(): FriendDomainAPI {
        if (!this._domains.friend) {
            const createNamespace = (api: API): FriendDomainAPI => ({
                get acceptFriendRequest() { return api.acceptFriendRequest; },
                get blockUser() { return api.blockUser; },
                get blockViewFeed() { return api.blockViewFeed; },
                get changeFriendAlias() { return api.changeFriendAlias; },
                get clearUnreadFriendRequests() { return api.clearUnreadFriendRequests; },
                get findUser() { return api.findUser; },
                get findUserByUsername() { return api.findUserByUsername; },
                get getAliasList() { return api.getAliasList; },
                get getAliasListV2() { return api.getAliasListV2; },
                get getAllFriends() { return api.getAllFriends; },
                get getBlockFriends() { return api.getBlockFriends; },
                get getCloseFriends() { return api.getCloseFriends; },
                get getExtraFriendInfo() { return api.getExtraFriendInfo; },
                get getFriendBoardList() { return api.getFriendBoardList; },
                get getFriendOnlines() { return api.getFriendOnlines; },
                get getFriendRecommendations() { return api.getFriendRecommendations; },
                get getFriendRequestStatus() { return api.getFriendRequestStatus; },
                get getFriendsEmojiStatus() { return api.getFriendsEmojiStatus; },
                get getLastReadContactTab() { return api.getLastReadContactTab; },
                get getMultiUsersByPhones() { return api.getMultiUsersByPhones; },
                get getPhonebookV2() { return api.getPhonebookV2; },
                get getSentFriendRequest() { return api.getSentFriendRequest; },
                get lastOnline() { return api.lastOnline; },
                get readContactTab() { return api.readContactTab; },
                get rejectFriendRequest() { return api.rejectFriendRequest; },
                get removeFriend() { return api.removeFriend; },
                get removeFriendAlias() { return api.removeFriendAlias; },
                get sendFriendRequest() { return api.sendFriendRequest; },
                get unblockUser() { return api.unblockUser; },
                get undoFriendRequest() { return api.undoFriendRequest; },
            });
            this._domains.friend = createNamespace(this);
        }
        return this._domains.friend as FriendDomainAPI;
    }

    public get group(): GroupDomainAPI {
        if (!this._domains.group) {
            const createNamespace = (api: API): GroupDomainAPI => ({
                get addGroupBlockedMember() { return api.addGroupBlockedMember; },
                get addGroupDeputy() { return api.addGroupDeputy; },
                get addUserToGroup() { return api.addUserToGroup; },
                get changeGroupAvatar() { return api.changeGroupAvatar; },
                get changeGroupName() { return api.changeGroupName; },
                get changeGroupOwner() { return api.changeGroupOwner; },
                get createGroup() { return api.createGroup; },
                get deleteGroupInviteBox() { return api.deleteGroupInviteBox; },
                get disableGroupLink() { return api.disableGroupLink; },
                get disperseGroup() { return api.disperseGroup; },
                get enableGroupLink() { return api.enableGroupLink; },
                get getAllGroups() { return api.getAllGroups; },
                get getExtraGroupInfo() { return api.getExtraGroupInfo; },
                get getGroupBlockedMember() { return api.getGroupBlockedMember; },
                get getGroupChatHistory() { return api.getGroupChatHistory; },
                get getGroupCloudMessageJump() { return api.getGroupCloudMessageJump; },
                get getGroupHistoryLegacy() { return api.getGroupHistoryLegacy; },
                get getGroupInfo() { return api.getGroupInfo; },
                get getGroupInfoV2() { return api.getGroupInfoV2; },
                get getGroupInviteBoxInfo() { return api.getGroupInviteBoxInfo; },
                get getGroupInviteBoxList() { return api.getGroupInviteBoxList; },
                get getGroupLinkDetail() { return api.getGroupLinkDetail; },
                get getGroupLinkInfo() { return api.getGroupLinkInfo; },
                get getGroupListV3() { return api.getGroupListV3; },
                get getGroupMembersInfo() { return api.getGroupMembersInfo; },
                get getGroupMessageStatus() { return api.getGroupMessageStatus; },
                get getPendingGroupMembers() { return api.getPendingGroupMembers; },
                get getQuotaCommunity() { return api.getQuotaCommunity; },
                get getRelatedFriendGroup() { return api.getRelatedFriendGroup; },
                get inviteUserToGroups() { return api.inviteUserToGroups; },
                get joinGroupInviteBox() { return api.joinGroupInviteBox; },
                get joinGroupLink() { return api.joinGroupLink; },
                get leaveGroup() { return api.leaveGroup; },
                get removeGroupBlockedMember() { return api.removeGroupBlockedMember; },
                get removeGroupDeputy() { return api.removeGroupDeputy; },
                get removeUserFromGroup() { return api.removeUserFromGroup; },
                get reviewPendingMemberRequest() { return api.reviewPendingMemberRequest; },
                get updateGroupSettings() { return api.updateGroupSettings; },
                get upgradeGroupToCommunity() { return api.upgradeGroupToCommunity; },
            });
            this._domains.group = createNamespace(this);
        }
        return this._domains.group as GroupDomainAPI;
    }

    public get media(): MediaDomainAPI {
        if (!this._domains.media) {
            const createNamespace = (api: API): MediaDomainAPI => ({
                get getConversationMedia() { return api.getConversationMedia; },
                get getMediaStorePreview() { return api.getMediaStorePreview; },
                get removeConversationMedia() { return api.removeConversationMedia; },
                get uploadAttachment() { return api.uploadAttachment; },
                get voiceToText() { return api.voiceToText; },
            });
            this._domains.media = createNamespace(this);
        }
        return this._domains.media as MediaDomainAPI;
    }

    public get profile(): ProfileDomainAPI {
        if (!this._domains.profile) {
            const createNamespace = (api: API): ProfileDomainAPI => ({
                get changeAccountAvatar() { return api.changeAccountAvatar; },
                get deleteAvatar() { return api.deleteAvatar; },
                get fetchAccountInfo() { return api.fetchAccountInfo; },
                get getAvatarList() { return api.getAvatarList; },
                get getAvatarUrlProfile() { return api.getAvatarUrlProfile; },
                get getEmojiStatusConfig() { return api.getEmojiStatusConfig; },
                get getFullAvatar() { return api.getFullAvatar; },
                get getMiniProfile() { return api.getMiniProfile; },
                get getProfileRank() { return api.getProfileRank; },
                get getProfileVerificationStatus() { return api.getProfileVerificationStatus; },
                get getSettings() { return api.getSettings; },
                get getUserInfo() { return api.getUserInfo; },
                get reuseAvatar() { return api.reuseAvatar; },
                get updateProfile() { return api.updateProfile; },
                get updateProfileBio() { return api.updateProfileBio; },
                get updateSettings() { return api.updateSettings; },
            });
            this._domains.profile = createNamespace(this);
        }
        return this._domains.profile as ProfileDomainAPI;
    }

    public get sticker(): StickerDomainAPI {
        if (!this._domains.sticker) {
            const createNamespace = (api: API): StickerDomainAPI => ({
                get getPersonalizedStickerList() { return api.getPersonalizedStickerList; },
                get getStickerCategoriesV2() { return api.getStickerCategoriesV2; },
                get getStickerCategoryData() { return api.getStickerCategoryData; },
                get getStickerCategoryDetail() { return api.getStickerCategoryDetail; },
                get getStickerHello() { return api.getStickerHello; },
                get getStickers() { return api.getStickers; },
                get getStickersDetail() { return api.getStickersDetail; },
                get getStickerSuggestion() { return api.getStickerSuggestion; },
                get getStickerSuggestKeywords() { return api.getStickerSuggestKeywords; },
                get searchSticker() { return api.searchSticker; },
            });
            this._domains.sticker = createNamespace(this);
        }
        return this._domains.sticker as StickerDomainAPI;
    }

    public get sync(): SyncDomainAPI {
        if (!this._domains.sync) {
            const createNamespace = (api: API): SyncDomainAPI => ({
                get cancelPullMobile() { return api.cancelPullMobile; },
                get downloadTransferSync() { return api.downloadTransferSync; },
                get getSyncData() { return api.getSyncData; },
                get pullMobile() { return api.pullMobile; },
                get requestSyncFromPhone() { return api.requestSyncFromPhone; },
            });
            this._domains.sync = createNamespace(this);
        }
        return this._domains.sync as SyncDomainAPI;
    }

    public get zcloud(): ZcloudDomainAPI {
        if (!this._domains.zcloud) {
            const createNamespace = (api: API): ZcloudDomainAPI => ({
                get getCloudInfo() { return api.getCloudInfo; },
                get getCloudSettings() { return api.getCloudSettings; },
                get getCloudViewerKey() { return api.getCloudViewerKey; },
                get getFamilyProfile() { return api.getFamilyProfile; },
                get getFamilyUsage() { return api.getFamilyUsage; },
                get getFamilyViewerKey() { return api.getFamilyViewerKey; },
                get getUsageMyCloud() { return api.getUsageMyCloud; },
                get getUsageZCloud() { return api.getUsageZCloud; },
                get verifyCloudMedia() { return api.verifyCloudMedia; },
            });
            this._domains.zcloud = createNamespace(this);
        }
        return this._domains.zcloud as ZcloudDomainAPI;
    }

    // =========================================================================
    // Flat API Methods (100% Backward Compatible, Lazy Memoized)
    // =========================================================================

    public get acceptFriendRequest(): ReturnType<typeof acceptFriendRequestFactory> {
        return (this._cache.acceptFriendRequest ??= acceptFriendRequestFactory(this.ctx, this)) as ReturnType<typeof acceptFriendRequestFactory>;
    }

    public get addGroupBlockedMember(): ReturnType<typeof addGroupBlockedMemberFactory> {
        return (this._cache.addGroupBlockedMember ??= addGroupBlockedMemberFactory(this.ctx, this)) as ReturnType<typeof addGroupBlockedMemberFactory>;
    }

    public get addGroupDeputy(): ReturnType<typeof addGroupDeputyFactory> {
        return (this._cache.addGroupDeputy ??= addGroupDeputyFactory(this.ctx, this)) as ReturnType<typeof addGroupDeputyFactory>;
    }

    public get addPollOptions(): ReturnType<typeof addPollOptionsFactory> {
        return (this._cache.addPollOptions ??= addPollOptionsFactory(this.ctx, this)) as ReturnType<typeof addPollOptionsFactory>;
    }

    public get addQuickMessage(): ReturnType<typeof addQuickMessageFactory> {
        return (this._cache.addQuickMessage ??= addQuickMessageFactory(this.ctx, this)) as ReturnType<typeof addQuickMessageFactory>;
    }

    public get addReaction(): ReturnType<typeof addReactionFactory> {
        return (this._cache.addReaction ??= addReactionFactory(this.ctx, this)) as ReturnType<typeof addReactionFactory>;
    }

    public get addUnreadMark(): ReturnType<typeof addUnreadMarkFactory> {
        return (this._cache.addUnreadMark ??= addUnreadMarkFactory(this.ctx, this)) as ReturnType<typeof addUnreadMarkFactory>;
    }

    public get addUserToGroup(): ReturnType<typeof addUserToGroupFactory> {
        return (this._cache.addUserToGroup ??= addUserToGroupFactory(this.ctx, this)) as ReturnType<typeof addUserToGroupFactory>;
    }

    public get blockUser(): ReturnType<typeof blockUserFactory> {
        return (this._cache.blockUser ??= blockUserFactory(this.ctx, this)) as ReturnType<typeof blockUserFactory>;
    }

    public get blockViewFeed(): ReturnType<typeof blockViewFeedFactory> {
        return (this._cache.blockViewFeed ??= blockViewFeedFactory(this.ctx, this)) as ReturnType<typeof blockViewFeedFactory>;
    }

    public get cancelPullMobile(): ReturnType<typeof cancelPullMobileFactory> {
        return (this._cache.cancelPullMobile ??= cancelPullMobileFactory(this.ctx, this)) as ReturnType<typeof cancelPullMobileFactory>;
    }

    public get cancelVoiceCall(): ReturnType<typeof cancelVoiceCallFactory> {
        return (this._cache.cancelVoiceCall ??= cancelVoiceCallFactory(this.ctx, this)) as ReturnType<typeof cancelVoiceCallFactory>;
    }

    public get changeAccountAvatar(): ReturnType<typeof changeAccountAvatarFactory> {
        return (this._cache.changeAccountAvatar ??= changeAccountAvatarFactory(this.ctx, this)) as ReturnType<typeof changeAccountAvatarFactory>;
    }

    public get changeFriendAlias(): ReturnType<typeof changeFriendAliasFactory> {
        return (this._cache.changeFriendAlias ??= changeFriendAliasFactory(this.ctx, this)) as ReturnType<typeof changeFriendAliasFactory>;
    }

    public get changeGroupAvatar(): ReturnType<typeof changeGroupAvatarFactory> {
        return (this._cache.changeGroupAvatar ??= changeGroupAvatarFactory(this.ctx, this)) as ReturnType<typeof changeGroupAvatarFactory>;
    }

    public get changeGroupName(): ReturnType<typeof changeGroupNameFactory> {
        return (this._cache.changeGroupName ??= changeGroupNameFactory(this.ctx, this)) as ReturnType<typeof changeGroupNameFactory>;
    }

    public get changeGroupOwner(): ReturnType<typeof changeGroupOwnerFactory> {
        return (this._cache.changeGroupOwner ??= changeGroupOwnerFactory(this.ctx, this)) as ReturnType<typeof changeGroupOwnerFactory>;
    }

    public get clearUnreadFriendRequests(): ReturnType<typeof clearUnreadFriendRequestsFactory> {
        return (this._cache.clearUnreadFriendRequests ??= clearUnreadFriendRequestsFactory(this.ctx, this)) as ReturnType<typeof clearUnreadFriendRequestsFactory>;
    }

    public get createAutoReply(): ReturnType<typeof createAutoReplyFactory> {
        return (this._cache.createAutoReply ??= createAutoReplyFactory(this.ctx, this)) as ReturnType<typeof createAutoReplyFactory>;
    }

    public get createBankAccount(): ReturnType<typeof createBankAccountFactory> {
        return (this._cache.createBankAccount ??= createBankAccountFactory(this.ctx, this)) as ReturnType<typeof createBankAccountFactory>;
    }

    public get createCatalog(): ReturnType<typeof createCatalogFactory> {
        return (this._cache.createCatalog ??= createCatalogFactory(this.ctx, this)) as ReturnType<typeof createCatalogFactory>;
    }

    public get createGroup(): ReturnType<typeof createGroupFactory> {
        return (this._cache.createGroup ??= createGroupFactory(this.ctx, this)) as ReturnType<typeof createGroupFactory>;
    }

    public get createNote(): ReturnType<typeof createNoteFactory> {
        return (this._cache.createNote ??= createNoteFactory(this.ctx, this)) as ReturnType<typeof createNoteFactory>;
    }

    public get createPoll(): ReturnType<typeof createPollFactory> {
        return (this._cache.createPoll ??= createPollFactory(this.ctx, this)) as ReturnType<typeof createPollFactory>;
    }

    public get createProductCatalog(): ReturnType<typeof createProductCatalogFactory> {
        return (this._cache.createProductCatalog ??= createProductCatalogFactory(this.ctx, this)) as ReturnType<typeof createProductCatalogFactory>;
    }

    public get createReminder(): ReturnType<typeof createReminderFactory> {
        return (this._cache.createReminder ??= createReminderFactory(this.ctx, this)) as ReturnType<typeof createReminderFactory>;
    }

    public get decryptGids(): ReturnType<typeof decryptGidsFactory> {
        return (this._cache.decryptGids ??= decryptGidsFactory(this.ctx, this)) as ReturnType<typeof decryptGidsFactory>;
    }

    public get deleteAutoReply(): ReturnType<typeof deleteAutoReplyFactory> {
        return (this._cache.deleteAutoReply ??= deleteAutoReplyFactory(this.ctx, this)) as ReturnType<typeof deleteAutoReplyFactory>;
    }

    public get deleteAvatar(): ReturnType<typeof deleteAvatarFactory> {
        return (this._cache.deleteAvatar ??= deleteAvatarFactory(this.ctx, this)) as ReturnType<typeof deleteAvatarFactory>;
    }

    public get deleteBankAccount(): ReturnType<typeof deleteBankAccountFactory> {
        return (this._cache.deleteBankAccount ??= deleteBankAccountFactory(this.ctx, this)) as ReturnType<typeof deleteBankAccountFactory>;
    }

    public get deleteCatalog(): ReturnType<typeof deleteCatalogFactory> {
        return (this._cache.deleteCatalog ??= deleteCatalogFactory(this.ctx, this)) as ReturnType<typeof deleteCatalogFactory>;
    }

    public get deleteChat(): ReturnType<typeof deleteChatFactory> {
        return (this._cache.deleteChat ??= deleteChatFactory(this.ctx, this)) as ReturnType<typeof deleteChatFactory>;
    }

    public get deleteGroupInviteBox(): ReturnType<typeof deleteGroupInviteBoxFactory> {
        return (this._cache.deleteGroupInviteBox ??= deleteGroupInviteBoxFactory(this.ctx, this)) as ReturnType<typeof deleteGroupInviteBoxFactory>;
    }

    public get deleteMessage(): ReturnType<typeof deleteMessageFactory> {
        return (this._cache.deleteMessage ??= deleteMessageFactory(this.ctx, this)) as ReturnType<typeof deleteMessageFactory>;
    }

    public get deleteProductCatalog(): ReturnType<typeof deleteProductCatalogFactory> {
        return (this._cache.deleteProductCatalog ??= deleteProductCatalogFactory(this.ctx, this)) as ReturnType<typeof deleteProductCatalogFactory>;
    }

    public get disableGroupLink(): ReturnType<typeof disableGroupLinkFactory> {
        return (this._cache.disableGroupLink ??= disableGroupLinkFactory(this.ctx, this)) as ReturnType<typeof disableGroupLinkFactory>;
    }

    public get disperseGroup(): ReturnType<typeof disperseGroupFactory> {
        return (this._cache.disperseGroup ??= disperseGroupFactory(this.ctx, this)) as ReturnType<typeof disperseGroupFactory>;
    }

    public get downloadTransferSync(): ReturnType<typeof downloadTransferSyncFactory> {
        return (this._cache.downloadTransferSync ??= downloadTransferSyncFactory(this.ctx, this)) as ReturnType<typeof downloadTransferSyncFactory>;
    }

    public get editNote(): ReturnType<typeof editNoteFactory> {
        return (this._cache.editNote ??= editNoteFactory(this.ctx, this)) as ReturnType<typeof editNoteFactory>;
    }

    public get editReminder(): ReturnType<typeof editReminderFactory> {
        return (this._cache.editReminder ??= editReminderFactory(this.ctx, this)) as ReturnType<typeof editReminderFactory>;
    }

    public get enableGroupLink(): ReturnType<typeof enableGroupLinkFactory> {
        return (this._cache.enableGroupLink ??= enableGroupLinkFactory(this.ctx, this)) as ReturnType<typeof enableGroupLinkFactory>;
    }

    public get encryptGids(): ReturnType<typeof encryptGidsFactory> {
        return (this._cache.encryptGids ??= encryptGidsFactory(this.ctx, this)) as ReturnType<typeof encryptGidsFactory>;
    }

    public get endVoiceCall(): ReturnType<typeof endVoiceCallFactory> {
        return (this._cache.endVoiceCall ??= endVoiceCallFactory(this.ctx, this)) as ReturnType<typeof endVoiceCallFactory>;
    }

    public get fetchAccountInfo(): ReturnType<typeof fetchAccountInfoFactory> {
        return (this._cache.fetchAccountInfo ??= fetchAccountInfoFactory(this.ctx, this)) as ReturnType<typeof fetchAccountInfoFactory>;
    }

    public get findUser(): ReturnType<typeof findUserFactory> {
        return (this._cache.findUser ??= findUserFactory(this.ctx, this)) as ReturnType<typeof findUserFactory>;
    }

    public get findUserByUsername(): ReturnType<typeof findUserByUsernameFactory> {
        return (this._cache.findUserByUsername ??= findUserByUsernameFactory(this.ctx, this)) as ReturnType<typeof findUserByUsernameFactory>;
    }

    public get forwardMessage(): ReturnType<typeof forwardMessageFactory> {
        return (this._cache.forwardMessage ??= forwardMessageFactory(this.ctx, this)) as ReturnType<typeof forwardMessageFactory>;
    }

    public get getAliasList(): ReturnType<typeof getAliasListFactory> {
        return (this._cache.getAliasList ??= getAliasListFactory(this.ctx, this)) as ReturnType<typeof getAliasListFactory>;
    }

    public get getAliasListV2(): ReturnType<typeof getAliasListV2Factory> {
        return (this._cache.getAliasListV2 ??= getAliasListV2Factory(this.ctx, this)) as ReturnType<typeof getAliasListV2Factory>;
    }

    public get getAllFriends(): ReturnType<typeof getAllFriendsFactory> {
        return (this._cache.getAllFriends ??= getAllFriendsFactory(this.ctx, this)) as ReturnType<typeof getAllFriendsFactory>;
    }

    public get getAllGroups(): ReturnType<typeof getAllGroupsFactory> {
        return (this._cache.getAllGroups ??= getAllGroupsFactory(this.ctx, this)) as ReturnType<typeof getAllGroupsFactory>;
    }

    public get getArchivedChatList(): ReturnType<typeof getArchivedChatListFactory> {
        return (this._cache.getArchivedChatList ??= getArchivedChatListFactory(this.ctx, this)) as ReturnType<typeof getArchivedChatListFactory>;
    }

    public get getAutoDeleteChat(): ReturnType<typeof getAutoDeleteChatFactory> {
        return (this._cache.getAutoDeleteChat ??= getAutoDeleteChatFactory(this.ctx, this)) as ReturnType<typeof getAutoDeleteChatFactory>;
    }

    public get getAutoReplyList(): ReturnType<typeof getAutoReplyListFactory> {
        return (this._cache.getAutoReplyList ??= getAutoReplyListFactory(this.ctx, this)) as ReturnType<typeof getAutoReplyListFactory>;
    }

    public get getAvatarList(): ReturnType<typeof getAvatarListFactory> {
        return (this._cache.getAvatarList ??= getAvatarListFactory(this.ctx, this)) as ReturnType<typeof getAvatarListFactory>;
    }

    public get getAvatarUrlProfile(): ReturnType<typeof getAvatarUrlProfileFactory> {
        return (this._cache.getAvatarUrlProfile ??= getAvatarUrlProfileFactory(this.ctx, this)) as ReturnType<typeof getAvatarUrlProfileFactory>;
    }

    public get getBizAccount(): ReturnType<typeof getBizAccountFactory> {
        return (this._cache.getBizAccount ??= getBizAccountFactory(this.ctx, this)) as ReturnType<typeof getBizAccountFactory>;
    }

    public get getBlockFriends(): ReturnType<typeof getBlockFriendsFactory> {
        return (this._cache.getBlockFriends ??= getBlockFriendsFactory(this.ctx, this)) as ReturnType<typeof getBlockFriendsFactory>;
    }

    public get getCatalogList(): ReturnType<typeof getCatalogListFactory> {
        return (this._cache.getCatalogList ??= getCatalogListFactory(this.ctx, this)) as ReturnType<typeof getCatalogListFactory>;
    }

    public get getCloseFriends(): ReturnType<typeof getCloseFriendsFactory> {
        return (this._cache.getCloseFriends ??= getCloseFriendsFactory(this.ctx, this)) as ReturnType<typeof getCloseFriendsFactory>;
    }

    public get getCloudInfo(): ReturnType<typeof getCloudInfoFactory> {
        return (this._cache.getCloudInfo ??= getCloudInfoFactory(this.ctx, this)) as ReturnType<typeof getCloudInfoFactory>;
    }

    public get getCloudSettings(): ReturnType<typeof getCloudSettingsFactory> {
        return (this._cache.getCloudSettings ??= getCloudSettingsFactory(this.ctx, this)) as ReturnType<typeof getCloudSettingsFactory>;
    }

    public get getCloudViewerKey(): ReturnType<typeof getCloudViewerKeyFactory> {
        return (this._cache.getCloudViewerKey ??= getCloudViewerKeyFactory(this.ctx, this)) as ReturnType<typeof getCloudViewerKeyFactory>;
    }

    public get getContext(): ReturnType<typeof getContextFactory> {
        return (this._cache.getContext ??= getContextFactory(this.ctx, this)) as ReturnType<typeof getContextFactory>;
    }

    public get getConversationMedia(): ReturnType<typeof getConversationMediaFactory> {
        return (this._cache.getConversationMedia ??= getConversationMediaFactory(this.ctx, this)) as ReturnType<typeof getConversationMediaFactory>;
    }

    public get getCookie(): ReturnType<typeof getCookieFactory> {
        return (this._cache.getCookie ??= getCookieFactory(this.ctx, this)) as ReturnType<typeof getCookieFactory>;
    }

    public get getEmojiStatusConfig(): ReturnType<typeof getEmojiStatusConfigFactory> {
        return (this._cache.getEmojiStatusConfig ??= getEmojiStatusConfigFactory(this.ctx, this)) as ReturnType<typeof getEmojiStatusConfigFactory>;
    }

    public get getExtraFriendInfo(): ReturnType<typeof getExtraFriendInfoFactory> {
        return (this._cache.getExtraFriendInfo ??= getExtraFriendInfoFactory(this.ctx, this)) as ReturnType<typeof getExtraFriendInfoFactory>;
    }

    public get getExtraGroupInfo(): ReturnType<typeof getExtraGroupInfoFactory> {
        return (this._cache.getExtraGroupInfo ??= getExtraGroupInfoFactory(this.ctx, this)) as ReturnType<typeof getExtraGroupInfoFactory>;
    }

    public get getFamilyProfile(): ReturnType<typeof getFamilyProfileFactory> {
        return (this._cache.getFamilyProfile ??= getFamilyProfileFactory(this.ctx, this)) as ReturnType<typeof getFamilyProfileFactory>;
    }

    public get getFamilyUsage(): ReturnType<typeof getFamilyUsageFactory> {
        return (this._cache.getFamilyUsage ??= getFamilyUsageFactory(this.ctx, this)) as ReturnType<typeof getFamilyUsageFactory>;
    }

    public get getFamilyViewerKey(): ReturnType<typeof getFamilyViewerKeyFactory> {
        return (this._cache.getFamilyViewerKey ??= getFamilyViewerKeyFactory(this.ctx, this)) as ReturnType<typeof getFamilyViewerKeyFactory>;
    }

    public get getFriendBoardList(): ReturnType<typeof getFriendBoardListFactory> {
        return (this._cache.getFriendBoardList ??= getFriendBoardListFactory(this.ctx, this)) as ReturnType<typeof getFriendBoardListFactory>;
    }

    public get getFriendOnlines(): ReturnType<typeof getFriendOnlinesFactory> {
        return (this._cache.getFriendOnlines ??= getFriendOnlinesFactory(this.ctx, this)) as ReturnType<typeof getFriendOnlinesFactory>;
    }

    public get getFriendRecommendations(): ReturnType<typeof getFriendRecommendationsFactory> {
        return (this._cache.getFriendRecommendations ??= getFriendRecommendationsFactory(this.ctx, this)) as ReturnType<typeof getFriendRecommendationsFactory>;
    }

    public get getFriendRequestStatus(): ReturnType<typeof getFriendRequestStatusFactory> {
        return (this._cache.getFriendRequestStatus ??= getFriendRequestStatusFactory(this.ctx, this)) as ReturnType<typeof getFriendRequestStatusFactory>;
    }

    public get getFriendsEmojiStatus(): ReturnType<typeof getFriendsEmojiStatusFactory> {
        return (this._cache.getFriendsEmojiStatus ??= getFriendsEmojiStatusFactory(this.ctx, this)) as ReturnType<typeof getFriendsEmojiStatusFactory>;
    }

    public get getFullAvatar(): ReturnType<typeof getFullAvatarFactory> {
        return (this._cache.getFullAvatar ??= getFullAvatarFactory(this.ctx, this)) as ReturnType<typeof getFullAvatarFactory>;
    }

    public get getGroupBlockedMember(): ReturnType<typeof getGroupBlockedMemberFactory> {
        return (this._cache.getGroupBlockedMember ??= getGroupBlockedMemberFactory(this.ctx, this)) as ReturnType<typeof getGroupBlockedMemberFactory>;
    }

    public get getGroupChatHistory(): ReturnType<typeof getGroupChatHistoryFactory> {
        return (this._cache.getGroupChatHistory ??= getGroupChatHistoryFactory(this.ctx, this)) as ReturnType<typeof getGroupChatHistoryFactory>;
    }

    public get getGroupCloudMessageJump(): ReturnType<typeof getGroupCloudMessageJumpFactory> {
        return (this._cache.getGroupCloudMessageJump ??= getGroupCloudMessageJumpFactory(this.ctx, this)) as ReturnType<typeof getGroupCloudMessageJumpFactory>;
    }

    public get getGroupHistoryLegacy(): ReturnType<typeof getGroupHistoryLegacyFactory> {
        return (this._cache.getGroupHistoryLegacy ??= getGroupHistoryLegacyFactory(this.ctx, this)) as ReturnType<typeof getGroupHistoryLegacyFactory>;
    }

    public get getGroupInfo(): ReturnType<typeof getGroupInfoFactory> {
        return (this._cache.getGroupInfo ??= getGroupInfoFactory(this.ctx, this)) as ReturnType<typeof getGroupInfoFactory>;
    }

    public get getGroupInfoV2(): ReturnType<typeof getGroupInfoV2Factory> {
        return (this._cache.getGroupInfoV2 ??= getGroupInfoV2Factory(this.ctx, this)) as ReturnType<typeof getGroupInfoV2Factory>;
    }

    public get getGroupInviteBoxInfo(): ReturnType<typeof getGroupInviteBoxInfoFactory> {
        return (this._cache.getGroupInviteBoxInfo ??= getGroupInviteBoxInfoFactory(this.ctx, this)) as ReturnType<typeof getGroupInviteBoxInfoFactory>;
    }

    public get getGroupInviteBoxList(): ReturnType<typeof getGroupInviteBoxListFactory> {
        return (this._cache.getGroupInviteBoxList ??= getGroupInviteBoxListFactory(this.ctx, this)) as ReturnType<typeof getGroupInviteBoxListFactory>;
    }

    public get getGroupLinkDetail(): ReturnType<typeof getGroupLinkDetailFactory> {
        return (this._cache.getGroupLinkDetail ??= getGroupLinkDetailFactory(this.ctx, this)) as ReturnType<typeof getGroupLinkDetailFactory>;
    }

    public get getGroupLinkInfo(): ReturnType<typeof getGroupLinkInfoFactory> {
        return (this._cache.getGroupLinkInfo ??= getGroupLinkInfoFactory(this.ctx, this)) as ReturnType<typeof getGroupLinkInfoFactory>;
    }

    public get getGroupListV3(): ReturnType<typeof getGroupListV3Factory> {
        return (this._cache.getGroupListV3 ??= getGroupListV3Factory(this.ctx, this)) as ReturnType<typeof getGroupListV3Factory>;
    }

    public get getGroupMembersInfo(): ReturnType<typeof getGroupMembersInfoFactory> {
        return (this._cache.getGroupMembersInfo ??= getGroupMembersInfoFactory(this.ctx, this)) as ReturnType<typeof getGroupMembersInfoFactory>;
    }

    public get getGroupMessageStatus(): ReturnType<typeof getGroupMessageStatusFactory> {
        return (this._cache.getGroupMessageStatus ??= getGroupMessageStatusFactory(this.ctx, this)) as ReturnType<typeof getGroupMessageStatusFactory>;
    }

    public get getHiddenConversations(): ReturnType<typeof getHiddenConversationsFactory> {
        return (this._cache.getHiddenConversations ??= getHiddenConversationsFactory(this.ctx, this)) as ReturnType<typeof getHiddenConversationsFactory>;
    }

    public get getLabels(): ReturnType<typeof getLabelsFactory> {
        return (this._cache.getLabels ??= getLabelsFactory(this.ctx, this)) as ReturnType<typeof getLabelsFactory>;
    }

    public get getLastReadContactTab(): ReturnType<typeof getLastReadContactTabFactory> {
        return (this._cache.getLastReadContactTab ??= getLastReadContactTabFactory(this.ctx, this)) as ReturnType<typeof getLastReadContactTabFactory>;
    }

    public get getLastSeen(): ReturnType<typeof getLastSeenFactory> {
        return (this._cache.getLastSeen ??= getLastSeenFactory(this.ctx, this)) as ReturnType<typeof getLastSeenFactory>;
    }

    public get getLastSeenReaction(): ReturnType<typeof getLastSeenReactionFactory> {
        return (this._cache.getLastSeenReaction ??= getLastSeenReactionFactory(this.ctx, this)) as ReturnType<typeof getLastSeenReactionFactory>;
    }

    public get getListBank(): ReturnType<typeof getListBankFactory> {
        return (this._cache.getListBank ??= getListBankFactory(this.ctx, this)) as ReturnType<typeof getListBankFactory>;
    }

    public get getListBankAccount(): ReturnType<typeof getListBankAccountFactory> {
        return (this._cache.getListBankAccount ??= getListBankAccountFactory(this.ctx, this)) as ReturnType<typeof getListBankAccountFactory>;
    }

    public get getListBoard(): ReturnType<typeof getListBoardFactory> {
        return (this._cache.getListBoard ??= getListBoardFactory(this.ctx, this)) as ReturnType<typeof getListBoardFactory>;
    }

    public get getListDevice(): ReturnType<typeof getListDeviceFactory> {
        return (this._cache.getListDevice ??= getListDeviceFactory(this.ctx, this)) as ReturnType<typeof getListDeviceFactory>;
    }

    public get getListPinTopics(): ReturnType<typeof getListPinTopicsFactory> {
        return (this._cache.getListPinTopics ??= getListPinTopicsFactory(this.ctx, this)) as ReturnType<typeof getListPinTopicsFactory>;
    }

    public get getListReminder(): ReturnType<typeof getListReminderFactory> {
        return (this._cache.getListReminder ??= getListReminderFactory(this.ctx, this)) as ReturnType<typeof getListReminderFactory>;
    }

    public get getMediaStorePreview(): ReturnType<typeof getMediaStorePreviewFactory> {
        return (this._cache.getMediaStorePreview ??= getMediaStorePreviewFactory(this.ctx, this)) as ReturnType<typeof getMediaStorePreviewFactory>;
    }

    public get getMiniProfile(): ReturnType<typeof getMiniProfileFactory> {
        return (this._cache.getMiniProfile ??= getMiniProfileFactory(this.ctx, this)) as ReturnType<typeof getMiniProfileFactory>;
    }

    public get getMultiUsersByPhones(): ReturnType<typeof getMultiUsersByPhonesFactory> {
        return (this._cache.getMultiUsersByPhones ??= getMultiUsersByPhonesFactory(this.ctx, this)) as ReturnType<typeof getMultiUsersByPhonesFactory>;
    }

    public get getMute(): ReturnType<typeof getMuteFactory> {
        return (this._cache.getMute ??= getMuteFactory(this.ctx, this)) as ReturnType<typeof getMuteFactory>;
    }

    public get getNoisedIds(): ReturnType<typeof getNoisedIdsFactory> {
        return (this._cache.getNoisedIds ??= getNoisedIdsFactory(this.ctx, this)) as ReturnType<typeof getNoisedIdsFactory>;
    }

    public get getOwnId(): ReturnType<typeof getOwnIdFactory> {
        return (this._cache.getOwnId ??= getOwnIdFactory(this.ctx, this)) as ReturnType<typeof getOwnIdFactory>;
    }

    public get getPendingGroupMembers(): ReturnType<typeof getPendingGroupMembersFactory> {
        return (this._cache.getPendingGroupMembers ??= getPendingGroupMembersFactory(this.ctx, this)) as ReturnType<typeof getPendingGroupMembersFactory>;
    }

    public get getPersonalizedStickerList(): ReturnType<typeof getPersonalizedStickerListFactory> {
        return (this._cache.getPersonalizedStickerList ??= getPersonalizedStickerListFactory(this.ctx, this)) as ReturnType<typeof getPersonalizedStickerListFactory>;
    }

    public get getPhonebookV2(): ReturnType<typeof getPhonebookV2Factory> {
        return (this._cache.getPhonebookV2 ??= getPhonebookV2Factory(this.ctx, this)) as ReturnType<typeof getPhonebookV2Factory>;
    }

    public get getPinConversations(): ReturnType<typeof getPinConversationsFactory> {
        return (this._cache.getPinConversations ??= getPinConversationsFactory(this.ctx, this)) as ReturnType<typeof getPinConversationsFactory>;
    }

    public get getPollDetail(): ReturnType<typeof getPollDetailFactory> {
        return (this._cache.getPollDetail ??= getPollDetailFactory(this.ctx, this)) as ReturnType<typeof getPollDetailFactory>;
    }

    public get getProductCatalogList(): ReturnType<typeof getProductCatalogListFactory> {
        return (this._cache.getProductCatalogList ??= getProductCatalogListFactory(this.ctx, this)) as ReturnType<typeof getProductCatalogListFactory>;
    }

    public get getProfileRank(): ReturnType<typeof getProfileRankFactory> {
        return (this._cache.getProfileRank ??= getProfileRankFactory(this.ctx, this)) as ReturnType<typeof getProfileRankFactory>;
    }

    public get getProfileVerificationStatus(): ReturnType<typeof getProfileVerificationStatusFactory> {
        return (this._cache.getProfileVerificationStatus ??= getProfileVerificationStatusFactory(this.ctx, this)) as ReturnType<typeof getProfileVerificationStatusFactory>;
    }

    public get getQR(): ReturnType<typeof getQRFactory> {
        return (this._cache.getQR ??= getQRFactory(this.ctx, this)) as ReturnType<typeof getQRFactory>;
    }

    public get getQuickMessageList(): ReturnType<typeof getQuickMessageListFactory> {
        return (this._cache.getQuickMessageList ??= getQuickMessageListFactory(this.ctx, this)) as ReturnType<typeof getQuickMessageListFactory>;
    }

    public get getQuotaCommunity(): ReturnType<typeof getQuotaCommunityFactory> {
        return (this._cache.getQuotaCommunity ??= getQuotaCommunityFactory(this.ctx, this)) as ReturnType<typeof getQuotaCommunityFactory>;
    }

    public get getRecentSearchList(): ReturnType<typeof getRecentSearchListFactory> {
        return (this._cache.getRecentSearchList ??= getRecentSearchListFactory(this.ctx, this)) as ReturnType<typeof getRecentSearchListFactory>;
    }

    public get getRelatedFriendGroup(): ReturnType<typeof getRelatedFriendGroupFactory> {
        return (this._cache.getRelatedFriendGroup ??= getRelatedFriendGroupFactory(this.ctx, this)) as ReturnType<typeof getRelatedFriendGroupFactory>;
    }

    public get getReminder(): ReturnType<typeof getReminderFactory> {
        return (this._cache.getReminder ??= getReminderFactory(this.ctx, this)) as ReturnType<typeof getReminderFactory>;
    }

    public get getReminderResponses(): ReturnType<typeof getReminderResponsesFactory> {
        return (this._cache.getReminderResponses ??= getReminderResponsesFactory(this.ctx, this)) as ReturnType<typeof getReminderResponsesFactory>;
    }

    public get getSentFriendRequest(): ReturnType<typeof getSentFriendRequestFactory> {
        return (this._cache.getSentFriendRequest ??= getSentFriendRequestFactory(this.ctx, this)) as ReturnType<typeof getSentFriendRequestFactory>;
    }

    public get getSettings(): ReturnType<typeof getSettingsFactory> {
        return (this._cache.getSettings ??= getSettingsFactory(this.ctx, this)) as ReturnType<typeof getSettingsFactory>;
    }

    public get getStickerCategoriesV2(): ReturnType<typeof getStickerCategoriesV2Factory> {
        return (this._cache.getStickerCategoriesV2 ??= getStickerCategoriesV2Factory(this.ctx, this)) as ReturnType<typeof getStickerCategoriesV2Factory>;
    }

    public get getStickerCategoryData(): ReturnType<typeof getStickerCategoryDataFactory> {
        return (this._cache.getStickerCategoryData ??= getStickerCategoryDataFactory(this.ctx, this)) as ReturnType<typeof getStickerCategoryDataFactory>;
    }

    public get getStickerCategoryDetail(): ReturnType<typeof getStickerCategoryDetailFactory> {
        return (this._cache.getStickerCategoryDetail ??= getStickerCategoryDetailFactory(this.ctx, this)) as ReturnType<typeof getStickerCategoryDetailFactory>;
    }

    public get getStickerHello(): ReturnType<typeof getStickerHelloFactory> {
        return (this._cache.getStickerHello ??= getStickerHelloFactory(this.ctx, this)) as ReturnType<typeof getStickerHelloFactory>;
    }

    public get getStickers(): ReturnType<typeof getStickersFactory> {
        return (this._cache.getStickers ??= getStickersFactory(this.ctx, this)) as ReturnType<typeof getStickersFactory>;
    }

    public get getStickersDetail(): ReturnType<typeof getStickersDetailFactory> {
        return (this._cache.getStickersDetail ??= getStickersDetailFactory(this.ctx, this)) as ReturnType<typeof getStickersDetailFactory>;
    }

    public get getStickerSuggestion(): ReturnType<typeof getStickerSuggestionFactory> {
        return (this._cache.getStickerSuggestion ??= getStickerSuggestionFactory(this.ctx, this)) as ReturnType<typeof getStickerSuggestionFactory>;
    }

    public get getStickerSuggestKeywords(): ReturnType<typeof getStickerSuggestKeywordsFactory> {
        return (this._cache.getStickerSuggestKeywords ??= getStickerSuggestKeywordsFactory(this.ctx, this)) as ReturnType<typeof getStickerSuggestKeywordsFactory>;
    }

    public get getSyncData(): ReturnType<typeof getSyncDataFactory> {
        return (this._cache.getSyncData ??= getSyncDataFactory(this.ctx, this)) as ReturnType<typeof getSyncDataFactory>;
    }

    public get getUnreadMark(): ReturnType<typeof getUnreadMarkFactory> {
        return (this._cache.getUnreadMark ??= getUnreadMarkFactory(this.ctx, this)) as ReturnType<typeof getUnreadMarkFactory>;
    }

    public get getUsageMyCloud(): ReturnType<typeof getUsageMyCloudFactory> {
        return (this._cache.getUsageMyCloud ??= getUsageMyCloudFactory(this.ctx, this)) as ReturnType<typeof getUsageMyCloudFactory>;
    }

    public get getUsageZCloud(): ReturnType<typeof getUsageZCloudFactory> {
        return (this._cache.getUsageZCloud ??= getUsageZCloudFactory(this.ctx, this)) as ReturnType<typeof getUsageZCloudFactory>;
    }

    public get getUserInfo(): ReturnType<typeof getUserInfoFactory> {
        return (this._cache.getUserInfo ??= getUserInfoFactory(this.ctx, this)) as ReturnType<typeof getUserInfoFactory>;
    }

    public get inviteUserToGroups(): ReturnType<typeof inviteUserToGroupsFactory> {
        return (this._cache.inviteUserToGroups ??= inviteUserToGroupsFactory(this.ctx, this)) as ReturnType<typeof inviteUserToGroupsFactory>;
    }

    public get joinGroupInviteBox(): ReturnType<typeof joinGroupInviteBoxFactory> {
        return (this._cache.joinGroupInviteBox ??= joinGroupInviteBoxFactory(this.ctx, this)) as ReturnType<typeof joinGroupInviteBoxFactory>;
    }

    public get joinGroupLink(): ReturnType<typeof joinGroupLinkFactory> {
        return (this._cache.joinGroupLink ??= joinGroupLinkFactory(this.ctx, this)) as ReturnType<typeof joinGroupLinkFactory>;
    }

    public get keepAlive(): ReturnType<typeof keepAliveFactory> {
        return (this._cache.keepAlive ??= keepAliveFactory(this.ctx, this)) as ReturnType<typeof keepAliveFactory>;
    }

    public get lastOnline(): ReturnType<typeof lastOnlineFactory> {
        return (this._cache.lastOnline ??= lastOnlineFactory(this.ctx, this)) as ReturnType<typeof lastOnlineFactory>;
    }

    public get leaveGroup(): ReturnType<typeof leaveGroupFactory> {
        return (this._cache.leaveGroup ??= leaveGroupFactory(this.ctx, this)) as ReturnType<typeof leaveGroupFactory>;
    }

    public get lockPoll(): ReturnType<typeof lockPollFactory> {
        return (this._cache.lockPoll ??= lockPollFactory(this.ctx, this)) as ReturnType<typeof lockPollFactory>;
    }

    public get lostFocus(): ReturnType<typeof lostFocusFactory> {
        return (this._cache.lostFocus ??= lostFocusFactory(this.ctx, this)) as ReturnType<typeof lostFocusFactory>;
    }

    public get parseLink(): ReturnType<typeof parseLinkFactory> {
        return (this._cache.parseLink ??= parseLinkFactory(this.ctx, this)) as ReturnType<typeof parseLinkFactory>;
    }

    public get preloadConversations(): ReturnType<typeof preloadConversationsFactory> {
        return (this._cache.preloadConversations ??= preloadConversationsFactory(this.ctx, this)) as ReturnType<typeof preloadConversationsFactory>;
    }

    public get pullMobile(): ReturnType<typeof pullMobileFactory> {
        return (this._cache.pullMobile ??= pullMobileFactory(this.ctx, this)) as ReturnType<typeof pullMobileFactory>;
    }

    public get readContactTab(): ReturnType<typeof readContactTabFactory> {
        return (this._cache.readContactTab ??= readContactTabFactory(this.ctx, this)) as ReturnType<typeof readContactTabFactory>;
    }

    public get registerCatalog(): ReturnType<typeof registerCatalogFactory> {
        return (this._cache.registerCatalog ??= registerCatalogFactory(this.ctx, this)) as ReturnType<typeof registerCatalogFactory>;
    }

    public get rejectFriendRequest(): ReturnType<typeof rejectFriendRequestFactory> {
        return (this._cache.rejectFriendRequest ??= rejectFriendRequestFactory(this.ctx, this)) as ReturnType<typeof rejectFriendRequestFactory>;
    }

    public get removeConversationMedia(): ReturnType<typeof removeConversationMediaFactory> {
        return (this._cache.removeConversationMedia ??= removeConversationMediaFactory(this.ctx, this)) as ReturnType<typeof removeConversationMediaFactory>;
    }

    public get removeFriend(): ReturnType<typeof removeFriendFactory> {
        return (this._cache.removeFriend ??= removeFriendFactory(this.ctx, this)) as ReturnType<typeof removeFriendFactory>;
    }

    public get removeFriendAlias(): ReturnType<typeof removeFriendAliasFactory> {
        return (this._cache.removeFriendAlias ??= removeFriendAliasFactory(this.ctx, this)) as ReturnType<typeof removeFriendAliasFactory>;
    }

    public get removeGroupBlockedMember(): ReturnType<typeof removeGroupBlockedMemberFactory> {
        return (this._cache.removeGroupBlockedMember ??= removeGroupBlockedMemberFactory(this.ctx, this)) as ReturnType<typeof removeGroupBlockedMemberFactory>;
    }

    public get removeGroupDeputy(): ReturnType<typeof removeGroupDeputyFactory> {
        return (this._cache.removeGroupDeputy ??= removeGroupDeputyFactory(this.ctx, this)) as ReturnType<typeof removeGroupDeputyFactory>;
    }

    public get removeQuickMessage(): ReturnType<typeof removeQuickMessageFactory> {
        return (this._cache.removeQuickMessage ??= removeQuickMessageFactory(this.ctx, this)) as ReturnType<typeof removeQuickMessageFactory>;
    }

    public get removeReminder(): ReturnType<typeof removeReminderFactory> {
        return (this._cache.removeReminder ??= removeReminderFactory(this.ctx, this)) as ReturnType<typeof removeReminderFactory>;
    }

    public get removeUnreadMark(): ReturnType<typeof removeUnreadMarkFactory> {
        return (this._cache.removeUnreadMark ??= removeUnreadMarkFactory(this.ctx, this)) as ReturnType<typeof removeUnreadMarkFactory>;
    }

    public get removeUserFromGroup(): ReturnType<typeof removeUserFromGroupFactory> {
        return (this._cache.removeUserFromGroup ??= removeUserFromGroupFactory(this.ctx, this)) as ReturnType<typeof removeUserFromGroupFactory>;
    }

    public get requestSyncFromPhone(): ReturnType<typeof requestSyncFromPhoneFactory> {
        return (this._cache.requestSyncFromPhone ??= requestSyncFromPhoneFactory(this.ctx, this)) as ReturnType<typeof requestSyncFromPhoneFactory>;
    }

    public get resetHiddenConversPin(): ReturnType<typeof resetHiddenConversPinFactory> {
        return (this._cache.resetHiddenConversPin ??= resetHiddenConversPinFactory(this.ctx, this)) as ReturnType<typeof resetHiddenConversPinFactory>;
    }

    public get reuseAvatar(): ReturnType<typeof reuseAvatarFactory> {
        return (this._cache.reuseAvatar ??= reuseAvatarFactory(this.ctx, this)) as ReturnType<typeof reuseAvatarFactory>;
    }

    public get reviewPendingMemberRequest(): ReturnType<typeof reviewPendingMemberRequestFactory> {
        return (this._cache.reviewPendingMemberRequest ??= reviewPendingMemberRequestFactory(this.ctx, this)) as ReturnType<typeof reviewPendingMemberRequestFactory>;
    }

    public get scanURL(): ReturnType<typeof scanURLFactory> {
        return (this._cache.scanURL ??= scanURLFactory(this.ctx, this)) as ReturnType<typeof scanURLFactory>;
    }

    public get searchSticker(): ReturnType<typeof searchStickerFactory> {
        return (this._cache.searchSticker ??= searchStickerFactory(this.ctx, this)) as ReturnType<typeof searchStickerFactory>;
    }

    public get sendBankCard(): ReturnType<typeof sendBankCardFactory> {
        return (this._cache.sendBankCard ??= sendBankCardFactory(this.ctx, this)) as ReturnType<typeof sendBankCardFactory>;
    }

    public get sendCard(): ReturnType<typeof sendCardFactory> {
        return (this._cache.sendCard ??= sendCardFactory(this.ctx, this)) as ReturnType<typeof sendCardFactory>;
    }

    public get sendDeliveredEvent(): ReturnType<typeof sendDeliveredEventFactory> {
        return (this._cache.sendDeliveredEvent ??= sendDeliveredEventFactory(this.ctx, this)) as ReturnType<typeof sendDeliveredEventFactory>;
    }

    public get sendFriendRequest(): ReturnType<typeof sendFriendRequestFactory> {
        return (this._cache.sendFriendRequest ??= sendFriendRequestFactory(this.ctx, this)) as ReturnType<typeof sendFriendRequestFactory>;
    }

    public get sendLink(): ReturnType<typeof sendLinkFactory> {
        return (this._cache.sendLink ??= sendLinkFactory(this.ctx, this)) as ReturnType<typeof sendLinkFactory>;
    }

    public get sendMessage(): ReturnType<typeof sendMessageFactory> {
        return (this._cache.sendMessage ??= sendMessageFactory(this.ctx, this)) as ReturnType<typeof sendMessageFactory>;
    }

    public get sendReport(): ReturnType<typeof sendReportFactory> {
        return (this._cache.sendReport ??= sendReportFactory(this.ctx, this)) as ReturnType<typeof sendReportFactory>;
    }

    public get sendSeenEvent(): ReturnType<typeof sendSeenEventFactory> {
        return (this._cache.sendSeenEvent ??= sendSeenEventFactory(this.ctx, this)) as ReturnType<typeof sendSeenEventFactory>;
    }

    public get sendSticker(): ReturnType<typeof sendStickerFactory> {
        return (this._cache.sendSticker ??= sendStickerFactory(this.ctx, this)) as ReturnType<typeof sendStickerFactory>;
    }

    public get sendTypingEvent(): ReturnType<typeof sendTypingEventFactory> {
        return (this._cache.sendTypingEvent ??= sendTypingEventFactory(this.ctx, this)) as ReturnType<typeof sendTypingEventFactory>;
    }

    public get sendVideo(): ReturnType<typeof sendVideoFactory> {
        return (this._cache.sendVideo ??= sendVideoFactory(this.ctx, this)) as ReturnType<typeof sendVideoFactory>;
    }

    public get sendVoice(): ReturnType<typeof sendVoiceFactory> {
        return (this._cache.sendVoice ??= sendVoiceFactory(this.ctx, this)) as ReturnType<typeof sendVoiceFactory>;
    }

    public get sendVoiceCall(): ReturnType<typeof sendVoiceCallFactory> {
        return (this._cache.sendVoiceCall ??= sendVoiceCallFactory(this.ctx, this)) as ReturnType<typeof sendVoiceCallFactory>;
    }

    public get setHiddenConversations(): ReturnType<typeof setHiddenConversationsFactory> {
        return (this._cache.setHiddenConversations ??= setHiddenConversationsFactory(this.ctx, this)) as ReturnType<typeof setHiddenConversationsFactory>;
    }

    public get setMute(): ReturnType<typeof setMuteFactory> {
        return (this._cache.setMute ??= setMuteFactory(this.ctx, this)) as ReturnType<typeof setMuteFactory>;
    }

    public get setPinnedConversations(): ReturnType<typeof setPinnedConversationsFactory> {
        return (this._cache.setPinnedConversations ??= setPinnedConversationsFactory(this.ctx, this)) as ReturnType<typeof setPinnedConversationsFactory>;
    }

    public get sharePoll(): ReturnType<typeof sharePollFactory> {
        return (this._cache.sharePoll ??= sharePollFactory(this.ctx, this)) as ReturnType<typeof sharePollFactory>;
    }

    public get unblockUser(): ReturnType<typeof unblockUserFactory> {
        return (this._cache.unblockUser ??= unblockUserFactory(this.ctx, this)) as ReturnType<typeof unblockUserFactory>;
    }

    public get undo(): ReturnType<typeof undoFactory> {
        return (this._cache.undo ??= undoFactory(this.ctx, this)) as ReturnType<typeof undoFactory>;
    }

    public get undoFriendRequest(): ReturnType<typeof undoFriendRequestFactory> {
        return (this._cache.undoFriendRequest ??= undoFriendRequestFactory(this.ctx, this)) as ReturnType<typeof undoFriendRequestFactory>;
    }

    public get undoMultiMessage(): ReturnType<typeof undoMultiMessageFactory> {
        return (this._cache.undoMultiMessage ??= undoMultiMessageFactory(this.ctx, this)) as ReturnType<typeof undoMultiMessageFactory>;
    }

    public get updateActiveStatus(): ReturnType<typeof updateActiveStatusFactory> {
        return (this._cache.updateActiveStatus ??= updateActiveStatusFactory(this.ctx, this)) as ReturnType<typeof updateActiveStatusFactory>;
    }

    public get updateArchivedChatList(): ReturnType<typeof updateArchivedChatListFactory> {
        return (this._cache.updateArchivedChatList ??= updateArchivedChatListFactory(this.ctx, this)) as ReturnType<typeof updateArchivedChatListFactory>;
    }

    public get updateAutoDeleteChat(): ReturnType<typeof updateAutoDeleteChatFactory> {
        return (this._cache.updateAutoDeleteChat ??= updateAutoDeleteChatFactory(this.ctx, this)) as ReturnType<typeof updateAutoDeleteChatFactory>;
    }

    public get updateAutoReply(): ReturnType<typeof updateAutoReplyFactory> {
        return (this._cache.updateAutoReply ??= updateAutoReplyFactory(this.ctx, this)) as ReturnType<typeof updateAutoReplyFactory>;
    }

    public get updateBankAccount(): ReturnType<typeof updateBankAccountFactory> {
        return (this._cache.updateBankAccount ??= updateBankAccountFactory(this.ctx, this)) as ReturnType<typeof updateBankAccountFactory>;
    }

    public get updateCatalog(): ReturnType<typeof updateCatalogFactory> {
        return (this._cache.updateCatalog ??= updateCatalogFactory(this.ctx, this)) as ReturnType<typeof updateCatalogFactory>;
    }

    public get updateGroupSettings(): ReturnType<typeof updateGroupSettingsFactory> {
        return (this._cache.updateGroupSettings ??= updateGroupSettingsFactory(this.ctx, this)) as ReturnType<typeof updateGroupSettingsFactory>;
    }

    public get updateHiddenConversPin(): ReturnType<typeof updateHiddenConversPinFactory> {
        return (this._cache.updateHiddenConversPin ??= updateHiddenConversPinFactory(this.ctx, this)) as ReturnType<typeof updateHiddenConversPinFactory>;
    }

    public get updateLabels(): ReturnType<typeof updateLabelsFactory> {
        return (this._cache.updateLabels ??= updateLabelsFactory(this.ctx, this)) as ReturnType<typeof updateLabelsFactory>;
    }

    public get updateLang(): ReturnType<typeof updateLangFactory> {
        return (this._cache.updateLang ??= updateLangFactory(this.ctx, this)) as ReturnType<typeof updateLangFactory>;
    }

    public get updateProductCatalog(): ReturnType<typeof updateProductCatalogFactory> {
        return (this._cache.updateProductCatalog ??= updateProductCatalogFactory(this.ctx, this)) as ReturnType<typeof updateProductCatalogFactory>;
    }

    public get updateProfile(): ReturnType<typeof updateProfileFactory> {
        return (this._cache.updateProfile ??= updateProfileFactory(this.ctx, this)) as ReturnType<typeof updateProfileFactory>;
    }

    public get updateProfileBio(): ReturnType<typeof updateProfileBioFactory> {
        return (this._cache.updateProfileBio ??= updateProfileBioFactory(this.ctx, this)) as ReturnType<typeof updateProfileBioFactory>;
    }

    public get updateQuickMessage(): ReturnType<typeof updateQuickMessageFactory> {
        return (this._cache.updateQuickMessage ??= updateQuickMessageFactory(this.ctx, this)) as ReturnType<typeof updateQuickMessageFactory>;
    }

    public get updateRecentSearch(): ReturnType<typeof updateRecentSearchFactory> {
        return (this._cache.updateRecentSearch ??= updateRecentSearchFactory(this.ctx, this)) as ReturnType<typeof updateRecentSearchFactory>;
    }

    public get updateSettings(): ReturnType<typeof updateSettingsFactory> {
        return (this._cache.updateSettings ??= updateSettingsFactory(this.ctx, this)) as ReturnType<typeof updateSettingsFactory>;
    }

    public get upgradeGroupToCommunity(): ReturnType<typeof upgradeGroupToCommunityFactory> {
        return (this._cache.upgradeGroupToCommunity ??= upgradeGroupToCommunityFactory(this.ctx, this)) as ReturnType<typeof upgradeGroupToCommunityFactory>;
    }

    public get uploadAttachment(): ReturnType<typeof uploadAttachmentFactory> {
        return (this._cache.uploadAttachment ??= uploadAttachmentFactory(this.ctx, this)) as ReturnType<typeof uploadAttachmentFactory>;
    }

    public get uploadProductPhoto(): ReturnType<typeof uploadProductPhotoFactory> {
        return (this._cache.uploadProductPhoto ??= uploadProductPhotoFactory(this.ctx, this)) as ReturnType<typeof uploadProductPhotoFactory>;
    }

    public get verifyCloudMedia(): ReturnType<typeof verifyCloudMediaFactory> {
        return (this._cache.verifyCloudMedia ??= verifyCloudMediaFactory(this.ctx, this)) as ReturnType<typeof verifyCloudMediaFactory>;
    }

    public get voiceToText(): ReturnType<typeof voiceToTextFactory> {
        return (this._cache.voiceToText ??= voiceToTextFactory(this.ctx, this)) as ReturnType<typeof voiceToTextFactory>;
    }

    public get votePoll(): ReturnType<typeof votePollFactory> {
        return (this._cache.votePoll ??= votePollFactory(this.ctx, this)) as ReturnType<typeof votePollFactory>;
    }
}
