import { Listener } from "./apis/listen.js";

import { acceptFriendRequestFactory } from "./apis/friend/acceptFriendRequest.js";
import { ackCloudOnboardingFactory } from "./apis/zcloud/ackCloudOnboarding.js";
import { ackDingTodoFactory } from "./apis/board/ackDingTodo.js";
import { addConversationLabelFactory } from "./apis/business/addConversationLabel.js";
import { addGroupBlockedMemberFactory } from "./apis/group/addGroupBlockedMember.js";
import { addGroupDeputyFactory } from "./apis/group/addGroupDeputy.js";
import { addPollOptionsFactory } from "./apis/board/addPollOptions.js";
import { addQuickMessageFactory } from "./apis/business/addQuickMessage.js";
import { addReactionFactory } from "./apis/chat/addReaction.js";
import { addUnreadMarkFactory } from "./apis/chat/addUnreadMark.js";
import { addUserGroupCallFactory } from "./apis/call/addUserGroupCall.js";
import { addUserToGroupFactory } from "./apis/group/addUserToGroup.js";
import { analyseGroupFactory } from "./apis/group/analyseGroup.js";
import { answerAckVoiceCallFactory } from "./apis/call/answerAckVoiceCall.js";
import { answerGroupCallFactory } from "./apis/call/answerGroupCall.js";
import { answerVoiceCallFactory } from "./apis/call/answerVoiceCall.js";
import { blockOAFactory } from "./apis/business/blockOA.js";
import { blockUserFactory } from "./apis/friend/blockUser.js";
import { blockViewFeedFactory } from "./apis/friend/blockViewFeed.js";
import { broadcastGroupCallStateFactory } from "./apis/call/broadcastGroupCallState.js";
import { cancelGroupCallFactory } from "./apis/call/cancelGroupCall.js";
import { cancelPullMobileFactory } from "./apis/sync/cancelPullMobile.js";
import { cancelVoiceCallFactory } from "./apis/call/cancelVoiceCall.js";
import { changeAccountAvatarFactory } from "./apis/profile/changeAccountAvatar.js";
import { changeFriendAliasFactory } from "./apis/friend/changeFriendAlias.js";
import { changeGroupAvatarFactory } from "./apis/group/changeGroupAvatar.js";
import { changeGroupNameFactory } from "./apis/group/changeGroupName.js";
import { changeGroupOwnerFactory } from "./apis/group/changeGroupOwner.js";
import { checkQuotaCommunityMemberFactory } from "./apis/group/checkQuotaCommunityMember.js";
import { clearUnreadFriendRequestsFactory } from "./apis/friend/clearUnreadFriendRequests.js";
import { convertOAIdsFactory } from "./apis/business/convertOAIds.js";
import { createAutoReplyFactory } from "./apis/business/createAutoReply.js";
import { createBankAccountFactory } from "./apis/business/createBankAccount.js";
import { createCatalogFactory } from "./apis/business/createCatalog.js";
import { createControllerFactory } from "./apis/call/createController.js";
import { createGroupFactory } from "./apis/group/createGroup.js";
import { createNoteFactory } from "./apis/board/createNote.js";
import { createOneOneBoardTopicFactory } from "./apis/board/createOneOneBoardTopic.js";
import { createPollFactory } from "./apis/board/createPoll.js";
import { createProductCatalogFactory } from "./apis/business/createProductCatalog.js";
import { createReminderFactory } from "./apis/board/createReminder.js";
import { createRtcSessionFactory } from "./apis/call/createRtcSession.js";
import { createTodoFactory } from "./apis/board/createTodo.js";
import { decryptGidsFactory } from "./apis/auth/decryptGids.js";
import { deleteAutoReplyFactory } from "./apis/business/deleteAutoReply.js";
import { deleteAvatarFactory } from "./apis/profile/deleteAvatar.js";
import { deleteBankAccountFactory } from "./apis/business/deleteBankAccount.js";
import { deleteCatalogFactory } from "./apis/business/deleteCatalog.js";
import { deleteChatFactory } from "./apis/chat/deleteChat.js";
import { deleteConversationLabelFactory } from "./apis/business/deleteConversationLabel.js";
import { deleteGroupInviteBoxFactory } from "./apis/group/deleteGroupInviteBox.js";
import { deleteMessageFactory } from "./apis/chat/deleteMessage.js";
import { deleteMobileMsgSnapshotFactory } from "./apis/sync/deleteMobileMsgSnapshot.js";
import { deleteProductCatalogFactory } from "./apis/business/deleteProductCatalog.js";
import { deleteSingleProductFactory } from "./apis/business/deleteSingleProduct.js";
import { deleteTodoFactory } from "./apis/board/deleteTodo.js";
import { dingTodoFactory } from "./apis/board/dingTodo.js";
import { disableGroupLinkFactory } from "./apis/group/disableGroupLink.js";
import { disableLimitSearchPhoneReminderFactory } from "./apis/profile/disableLimitSearchPhoneReminder.js";
import { disperseGroupFactory } from "./apis/group/disperseGroup.js";
import { downloadTransferSyncFactory } from "./apis/sync/downloadTransferSync.js";
import { editNoteFactory } from "./apis/board/editNote.js";
import { editReminderFactory } from "./apis/board/editReminder.js";
import { enableGroupLinkFactory } from "./apis/group/enableGroupLink.js";
import { encryptGidsFactory } from "./apis/auth/encryptGids.js";
import { endGroupCallFactory } from "./apis/call/endGroupCall.js";
import { endVoiceCallFactory } from "./apis/call/endVoiceCall.js";
import { exportSessionFactory } from "./apis/auth/exportSession.js";
import { fetchAccountInfoFactory } from "./apis/profile/fetchAccountInfo.js";
import { fetchImportantMessagesFactory } from "./apis/chat/fetchImportantMessages.js";
import { findUserFactory } from "./apis/friend/findUser.js";
import { findUserByUsernameFactory } from "./apis/friend/findUserByUsername.js";
import { finishGroupCallFactory } from "./apis/call/finishGroupCall.js";
import { forwardMessageFactory } from "./apis/chat/forwardMessage.js";
import { getAIStickerListFactory } from "./apis/sticker/getAIStickerList.js";
import { getAliasListFactory } from "./apis/friend/getAliasList.js";
import { getAliasListV2Factory } from "./apis/friend/getAliasListV2.js";
import { getAllFriendsFactory } from "./apis/friend/getAllFriends.js";
import { getAllGroupsFactory } from "./apis/group/getAllGroups.js";
import { getArchivedChatListFactory } from "./apis/chat/getArchivedChatList.js";
import { getAutoDeleteChatFactory } from "./apis/chat/getAutoDeleteChat.js";
import { getAutoReplyListFactory } from "./apis/business/getAutoReplyList.js";
import { getAvatarListFactory } from "./apis/profile/getAvatarList.js";
import { getAvatarUrlProfileFactory } from "./apis/profile/getAvatarUrlProfile.js";
import { getBackupMsgInfoFactory } from "./apis/sync/getBackupMsgInfo.js";
import { getBizAccountFactory } from "./apis/business/getBizAccount.js";
import { getBlockFriendsFactory } from "./apis/friend/getBlockFriends.js";
import { getBlockSharingConversationsFactory } from "./apis/chat/getBlockSharingConversations.js";
import { getCatalogListFactory } from "./apis/business/getCatalogList.js";
import { getCloseFriendsFactory } from "./apis/friend/getCloseFriends.js";
import { getCloudDownloadUrlsFactory } from "./apis/zcloud/getCloudDownloadUrls.js";
import { getCloudInfoFactory } from "./apis/zcloud/getCloudInfo.js";
import { getCloudSettingsFactory } from "./apis/zcloud/getCloudSettings.js";
import { getCloudUploadUrlFactory } from "./apis/zcloud/getCloudUploadUrl.js";
import { getCloudViewerKeyFactory } from "./apis/zcloud/getCloudViewerKey.js";
import { getContextFactory } from "./apis/auth/getContext.js";
import { getConversationMediaFactory } from "./apis/media/getConversationMedia.js";
import { getConvOfflineMessagesFactory } from "./apis/chat/getConvOfflineMessages.js";
import { getCookieFactory } from "./apis/auth/getCookie.js";
import { getCrossDbInfoFactory } from "./apis/sync/getCrossDbInfo.js";
import { getDefaultGuggyGifsFactory } from "./apis/sticker/getDefaultGuggyGifs.js";
import { getDirectMessageStatusFactory } from "./apis/chat/getDirectMessageStatus.js";
import { getE2eeGroupListFactory } from "./apis/group/getE2eeGroupList.js";
import { getEmojiStatusConfigFactory } from "./apis/profile/getEmojiStatusConfig.js";
import { getEnterpriseProfilesFactory } from "./apis/profile/getEnterpriseProfiles.js";
import { getExtraFriendInfoFactory } from "./apis/friend/getExtraFriendInfo.js";
import { getExtraGroupInfoFactory } from "./apis/group/getExtraGroupInfo.js";
import { getFamilyProfileFactory } from "./apis/zcloud/getFamilyProfile.js";
import { getFamilyUsageFactory } from "./apis/zcloud/getFamilyUsage.js";
import { getFamilyViewerKeyFactory } from "./apis/zcloud/getFamilyViewerKey.js";
import { getFriendBoardListFactory } from "./apis/friend/getFriendBoardList.js";
import { getFriendOnlinesFactory } from "./apis/friend/getFriendOnlines.js";
import { getFriendProfilesV2Factory } from "./apis/friend/getFriendProfilesV2.js";
import { getFriendRecommendationsFactory } from "./apis/friend/getFriendRecommendations.js";
import { getFriendRequestStatusFactory } from "./apis/friend/getFriendRequestStatus.js";
import { getFriendsActivePCWebFactory } from "./apis/friend/getFriendsActivePCWeb.js";
import { getFriendsEmojiStatusFactory } from "./apis/friend/getFriendsEmojiStatus.js";
import { getFullAvatarFactory } from "./apis/profile/getFullAvatar.js";
import { getGifCategoriesFactory } from "./apis/sticker/getGifCategories.js";
import { getGifDictionariesFactory } from "./apis/sticker/getGifDictionaries.js";
import { getGifsByCategoryFactory } from "./apis/sticker/getGifsByCategory.js";
import { getGifsByDictionaryFactory } from "./apis/sticker/getGifsByDictionary.js";
import { getGroupBlockedMemberFactory } from "./apis/group/getGroupBlockedMember.js";
import { getGroupCallStateFactory } from "./apis/call/getGroupCallState.js";
import { getGroupChatHistoryFactory } from "./apis/group/getGroupChatHistory.js";
import { getGroupCloudMessageJumpFactory } from "./apis/group/getGroupCloudMessageJump.js";
import { getGroupCloudMessagePathFactory } from "./apis/group/getGroupCloudMessagePath.js";
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
import { getListOneOneBoardFactory } from "./apis/board/getListOneOneBoard.js";
import { getListPinTopicsFactory } from "./apis/board/getListPinTopics.js";
import { getListReminderFactory } from "./apis/board/getListReminder.js";
import { getMediaStorePreviewFactory } from "./apis/media/getMediaStorePreview.js";
import { getMessageEffectByIdFactory } from "./apis/sticker/getMessageEffectById.js";
import { getMessageEffectsFactory } from "./apis/sticker/getMessageEffects.js";
import { getMiniProfileFactory } from "./apis/profile/getMiniProfile.js";
import { getMultiGroupCloudMessagesFactory } from "./apis/group/getMultiGroupCloudMessages.js";
import { getMultiUserQRCodesFactory } from "./apis/friend/getMultiUserQRCodes.js";
import { getMultiUsersByPhonesFactory } from "./apis/friend/getMultiUsersByPhones.js";
import { getMuteFactory } from "./apis/chat/getMute.js";
import { getNoisedIdsFactory } from "./apis/auth/getNoisedIds.js";
import { getOAProfileFactory } from "./apis/business/getOAProfile.js";
import { getOwnIdFactory } from "./apis/auth/getOwnId.js";
import { getPendingGroupMembersFactory } from "./apis/group/getPendingGroupMembers.js";
import { getPersonalizedStickerListFactory } from "./apis/sticker/getPersonalizedStickerList.js";
import { getPersonalMediaFactory } from "./apis/media/getPersonalMedia.js";
import { getPersonalMediaPreviewFactory } from "./apis/media/getPersonalMediaPreview.js";
import { getPhonebookV2Factory } from "./apis/friend/getPhonebookV2.js";
import { getPinConversationsFactory } from "./apis/chat/getPinConversations.js";
import { getPollDetailFactory } from "./apis/board/getPollDetail.js";
import { getProductCatalogListFactory } from "./apis/business/getProductCatalogList.js";
import { getProductDetailFactory } from "./apis/business/getProductDetail.js";
import { getProfileExtraFactory } from "./apis/profile/getProfileExtra.js";
import { getProfileRankFactory } from "./apis/profile/getProfileRank.js";
import { getProfileVerificationStatusFactory } from "./apis/profile/getProfileVerificationStatus.js";
import { getQRFactory } from "./apis/auth/getQR.js";
import { getQuickMessageListFactory } from "./apis/business/getQuickMessageList.js";
import { getQuotaCommunityFactory } from "./apis/group/getQuotaCommunity.js";
import { getRecentSearchListFactory } from "./apis/chat/getRecentSearchList.js";
import { getRecommendedStickersFactory } from "./apis/sticker/getRecommendedStickers.js";
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
import { getSuggestedConversationsFactory } from "./apis/chat/getSuggestedConversations.js";
import { getSyncDataFactory } from "./apis/sync/getSyncData.js";
import { getTenorStickerMappingFactory } from "./apis/sticker/getTenorStickerMapping.js";
import { getTodoDetailFactory } from "./apis/board/getTodoDetail.js";
import { getTodoListFactory } from "./apis/board/getTodoList.js";
import { getTranslateSettingFactory } from "./apis/chat/getTranslateSetting.js";
import { getTrendingGifsFactory } from "./apis/sticker/getTrendingGifs.js";
import { getUnreadMarkFactory } from "./apis/chat/getUnreadMark.js";
import { getUsageMyCloudFactory } from "./apis/zcloud/getUsageMyCloud.js";
import { getUsageZCloudFactory } from "./apis/zcloud/getUsageZCloud.js";
import { getUserInfoFactory } from "./apis/profile/getUserInfo.js";
import { holdVoiceCallFactory } from "./apis/call/holdVoiceCall.js";
import { inviteUserToGroupsFactory } from "./apis/group/inviteUserToGroups.js";
import { joinGroupCallFactory } from "./apis/call/joinGroupCall.js";
import { joinGroupInviteBoxFactory } from "./apis/group/joinGroupInviteBox.js";
import { joinGroupLinkFactory } from "./apis/group/joinGroupLink.js";
import { keepAliveFactory } from "./apis/auth/keepAlive.js";
import { lastOnlineFactory } from "./apis/friend/lastOnline.js";
import { leaveGroupFactory } from "./apis/group/leaveGroup.js";
import { lockPollFactory } from "./apis/board/lockPoll.js";
import { logEndVoiceCallFactory } from "./apis/call/logEndVoiceCall.js";
import { lostFocusFactory } from "./apis/auth/lostFocus.js";
import { markSubTabSeenFactory } from "./apis/chat/markSubTabSeen.js";
import { migrateCloudRecentFactory } from "./apis/zcloud/migrateCloudRecent.js";
import { multiUnpinBoardTopicsFactory } from "./apis/board/multiUnpinBoardTopics.js";
import { notifyGroupCallFactory } from "./apis/call/notifyGroupCall.js";
import { parseLinkFactory } from "./apis/chat/parseLink.js";
import { pinBoardTopicFactory } from "./apis/board/pinBoardTopic.js";
import { pinFriendMessageFactory } from "./apis/board/pinFriendMessage.js";
import { pingGroupCallFactory } from "./apis/call/pingGroupCall.js";
import { preloadConversationsFactory } from "./apis/chat/preloadConversations.js";
import { pullMobileFactory } from "./apis/sync/pullMobile.js";
import { pushProfileVerificationMessageFactory } from "./apis/profile/pushProfileVerificationMessage.js";
import { readContactTabFactory } from "./apis/friend/readContactTab.js";
import { registerCatalogFactory } from "./apis/business/registerCatalog.js";
import { registerTrialBizAccountFactory } from "./apis/profile/registerTrialBizAccount.js";
import { rejectFriendRequestFactory } from "./apis/friend/rejectFriendRequest.js";
import { removeBoardTopicFactory } from "./apis/board/removeBoardTopic.js";
import { removeConversationMediaFactory } from "./apis/media/removeConversationMedia.js";
import { removeFriendFactory } from "./apis/friend/removeFriend.js";
import { removeFriendAliasFactory } from "./apis/friend/removeFriendAlias.js";
import { removeFriendRecommendationFactory } from "./apis/friend/removeFriendRecommendation.js";
import { removeFriendRecommendationV2Factory } from "./apis/friend/removeFriendRecommendationV2.js";
import { removeGroupBlockedMemberFactory } from "./apis/group/removeGroupBlockedMember.js";
import { removeGroupDeputyFactory } from "./apis/group/removeGroupDeputy.js";
import { removeGroupTopicFactory } from "./apis/group/removeGroupTopic.js";
import { removeOneOneBoardTopicFactory } from "./apis/board/removeOneOneBoardTopic.js";
import { removePersonalMediaFactory } from "./apis/media/removePersonalMedia.js";
import { removeQuickMessageFactory } from "./apis/business/removeQuickMessage.js";
import { removeReminderFactory } from "./apis/board/removeReminder.js";
import { removeUnreadMarkFactory } from "./apis/chat/removeUnreadMark.js";
import { removeUserFromGroupFactory } from "./apis/group/removeUserFromGroup.js";
import { removeUserFromGroupsFactory } from "./apis/group/removeUserFromGroups.js";
import { renewMessageLinkFactory } from "./apis/chat/renewMessageLink.js";
import { reorderConversationLabelsFactory } from "./apis/business/reorderConversationLabels.js";
import { reorderFriendBoardFactory } from "./apis/board/reorderFriendBoard.js";
import { reorderPinTopicsFactory } from "./apis/board/reorderPinTopics.js";
import { requestAudioToVideoCallFactory } from "./apis/call/requestAudioToVideoCall.js";
import { requestGroupCallFactory } from "./apis/call/requestGroupCall.js";
import { requestShareScreenCallFactory } from "./apis/call/requestShareScreenCall.js";
import { requestSyncFromPhoneFactory } from "./apis/sync/requestSyncFromPhone.js";
import { requestVoiceCallFactory } from "./apis/call/requestVoiceCall.js";
import { resetCloudQueueFactory } from "./apis/zcloud/resetCloudQueue.js";
import { resetHiddenConversPinFactory } from "./apis/chat/resetHiddenConversPin.js";
import { respondReminderFactory } from "./apis/board/respondReminder.js";
import { reuseAvatarFactory } from "./apis/profile/reuseAvatar.js";
import { reviewPendingMemberRequestFactory } from "./apis/group/reviewPendingMemberRequest.js";
import { ringRingGroupCallFactory } from "./apis/call/ringRingGroupCall.js";
import { ringRingVoiceCallFactory } from "./apis/call/ringRingVoiceCall.js";
import { scanURLFactory } from "./apis/auth/scanURL.js";
import { searchGifsFactory } from "./apis/sticker/searchGifs.js";
import { searchGuggyGifsFactory } from "./apis/sticker/searchGuggyGifs.js";
import { searchStickerFactory } from "./apis/sticker/searchSticker.js";
import { sendBankCardFactory } from "./apis/chat/sendBankCard.js";
import { sendCardFactory } from "./apis/chat/sendCard.js";
import { sendDeliveredEventFactory } from "./apis/chat/sendDeliveredEvent.js";
import { sendFriendRequestFactory } from "./apis/friend/sendFriendRequest.js";
import { sendLinkFactory } from "./apis/chat/sendLink.js";
import { sendMessageFactory } from "./apis/chat/sendMessage.js";
import { sendReportFactory } from "./apis/chat/sendReport.js";
import { sendRequestGroupCallFactory } from "./apis/call/sendRequestGroupCall.js";
import { sendRequestVoiceCallFactory } from "./apis/call/sendRequestVoiceCall.js";
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
import { shareScreenGroupCallFactory } from "./apis/call/shareScreenGroupCall.js";
import { submitCloudMediaExtInfoFactory } from "./apis/zcloud/submitCloudMediaExtInfo.js";
import { submitCloudVerifyActionFactory } from "./apis/zcloud/submitCloudVerifyAction.js";
import { submitSyncMediaActionsFactory } from "./apis/sync/submitSyncMediaActions.js";
import { translateMessageFactory } from "./apis/chat/translateMessage.js";
import { translateMessageAutoFactory } from "./apis/chat/translateMessageAuto.js";
import { translateMessageSuggestFactory } from "./apis/chat/translateMessageSuggest.js";
import { unblockOAFactory } from "./apis/business/unblockOA.js";
import { unblockUserFactory } from "./apis/friend/unblockUser.js";
import { undoFactory } from "./apis/chat/undo.js";
import { undoFriendRequestFactory } from "./apis/friend/undoFriendRequest.js";
import { undoMultiMessageFactory } from "./apis/chat/undoMultiMessage.js";
import { unholdVoiceCallFactory } from "./apis/call/unholdVoiceCall.js";
import { unpinBoardTopicFactory } from "./apis/board/unpinBoardTopic.js";
import { unpinFriendMessagesFactory } from "./apis/board/unpinFriendMessages.js";
import { updateActiveStatusFactory } from "./apis/auth/updateActiveStatus.js";
import { updateArchivedChatListFactory } from "./apis/chat/updateArchivedChatList.js";
import { updateAutoDeleteChatFactory } from "./apis/chat/updateAutoDeleteChat.js";
import { updateAutoReplyFactory } from "./apis/business/updateAutoReply.js";
import { updateBankAccountFactory } from "./apis/business/updateBankAccount.js";
import { updateBlockSharingConversationFactory } from "./apis/chat/updateBlockSharingConversation.js";
import { updateCallMediaStateFactory } from "./apis/call/updateCallMediaState.js";
import { updateCatalogFactory } from "./apis/business/updateCatalog.js";
import { updateCloseFriendFactory } from "./apis/friend/updateCloseFriend.js";
import { updateConversationLabelItemFactory } from "./apis/business/updateConversationLabelItem.js";
import { updateGroupSettingsFactory } from "./apis/group/updateGroupSettings.js";
import { updateHiddenConversPinFactory } from "./apis/chat/updateHiddenConversPin.js";
import { updateLabelsFactory } from "./apis/business/updateLabels.js";
import { updateLangFactory } from "./apis/auth/updateLang.js";
import { updateOneOneBoardTopicFactory } from "./apis/board/updateOneOneBoardTopic.js";
import { updatePersonalizedStickerListFactory } from "./apis/sticker/updatePersonalizedStickerList.js";
import { updatePinConversationsFactory } from "./apis/chat/updatePinConversations.js";
import { updateProductCatalogFactory } from "./apis/business/updateProductCatalog.js";
import { updateProfileFactory } from "./apis/profile/updateProfile.js";
import { updateProfileBioFactory } from "./apis/profile/updateProfileBio.js";
import { updateProfileModeFactory } from "./apis/profile/updateProfileMode.js";
import { updateQuickMessageFactory } from "./apis/business/updateQuickMessage.js";
import { updateRecentSearchFactory } from "./apis/chat/updateRecentSearch.js";
import { updateSettingsFactory } from "./apis/profile/updateSettings.js";
import { updateTodoFactory } from "./apis/board/updateTodo.js";
import { updateTodoStatusFactory } from "./apis/board/updateTodoStatus.js";
import { updateTranslateSettingFactory } from "./apis/chat/updateTranslateSetting.js";
import { upgradeGroupToCommunityFactory } from "./apis/group/upgradeGroupToCommunity.js";
import { uploadAttachmentFactory } from "./apis/media/uploadAttachment.js";
import { uploadBackupChunkFactory } from "./apis/sync/uploadBackupChunk.js";
import { uploadProductPhotoFactory } from "./apis/business/uploadProductPhoto.js";
import { verifyCloudMediaFactory } from "./apis/zcloud/verifyCloudMedia.js";
import { verifyFriendFactory } from "./apis/friend/verifyFriend.js";
import { verifyTodoFactory } from "./apis/board/verifyTodo.js";
import { voiceToTextFactory } from "./apis/media/voiceToText.js";
import { votePollFactory } from "./apis/board/votePoll.js";
import { customFactory } from "./apis/custom.js";
import type { ZPWServiceMap, ContextSession } from "./context.js";

export type AuthDomainAPI = {
    readonly decryptGids: ReturnType<typeof decryptGidsFactory>;
    readonly encryptGids: ReturnType<typeof encryptGidsFactory>;
    readonly exportSession: ReturnType<typeof exportSessionFactory>;
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
    readonly ackDingTodo: ReturnType<typeof ackDingTodoFactory>;
    readonly addPollOptions: ReturnType<typeof addPollOptionsFactory>;
    readonly createNote: ReturnType<typeof createNoteFactory>;
    readonly createOneOneBoardTopic: ReturnType<typeof createOneOneBoardTopicFactory>;
    readonly createPoll: ReturnType<typeof createPollFactory>;
    readonly createReminder: ReturnType<typeof createReminderFactory>;
    readonly createTodo: ReturnType<typeof createTodoFactory>;
    readonly deleteTodo: ReturnType<typeof deleteTodoFactory>;
    readonly dingTodo: ReturnType<typeof dingTodoFactory>;
    readonly editNote: ReturnType<typeof editNoteFactory>;
    readonly editReminder: ReturnType<typeof editReminderFactory>;
    readonly getListBoard: ReturnType<typeof getListBoardFactory>;
    readonly getListOneOneBoard: ReturnType<typeof getListOneOneBoardFactory>;
    readonly getListPinTopics: ReturnType<typeof getListPinTopicsFactory>;
    readonly getListReminder: ReturnType<typeof getListReminderFactory>;
    readonly getPollDetail: ReturnType<typeof getPollDetailFactory>;
    readonly getReminder: ReturnType<typeof getReminderFactory>;
    readonly getReminderResponses: ReturnType<typeof getReminderResponsesFactory>;
    readonly getTodoDetail: ReturnType<typeof getTodoDetailFactory>;
    readonly getTodoList: ReturnType<typeof getTodoListFactory>;
    readonly lockPoll: ReturnType<typeof lockPollFactory>;
    readonly multiUnpinBoardTopics: ReturnType<typeof multiUnpinBoardTopicsFactory>;
    readonly pinBoardTopic: ReturnType<typeof pinBoardTopicFactory>;
    readonly pinFriendMessage: ReturnType<typeof pinFriendMessageFactory>;
    readonly removeBoardTopic: ReturnType<typeof removeBoardTopicFactory>;
    readonly removeOneOneBoardTopic: ReturnType<typeof removeOneOneBoardTopicFactory>;
    readonly removeReminder: ReturnType<typeof removeReminderFactory>;
    readonly reorderFriendBoard: ReturnType<typeof reorderFriendBoardFactory>;
    readonly reorderPinTopics: ReturnType<typeof reorderPinTopicsFactory>;
    readonly respondReminder: ReturnType<typeof respondReminderFactory>;
    readonly sharePoll: ReturnType<typeof sharePollFactory>;
    readonly unpinBoardTopic: ReturnType<typeof unpinBoardTopicFactory>;
    readonly unpinFriendMessages: ReturnType<typeof unpinFriendMessagesFactory>;
    readonly updateOneOneBoardTopic: ReturnType<typeof updateOneOneBoardTopicFactory>;
    readonly updateTodo: ReturnType<typeof updateTodoFactory>;
    readonly updateTodoStatus: ReturnType<typeof updateTodoStatusFactory>;
    readonly verifyTodo: ReturnType<typeof verifyTodoFactory>;
    readonly votePoll: ReturnType<typeof votePollFactory>;
};

export type BusinessDomainAPI = {
    readonly addConversationLabel: ReturnType<typeof addConversationLabelFactory>;
    readonly addQuickMessage: ReturnType<typeof addQuickMessageFactory>;
    readonly blockOA: ReturnType<typeof blockOAFactory>;
    readonly convertOAIds: ReturnType<typeof convertOAIdsFactory>;
    readonly createAutoReply: ReturnType<typeof createAutoReplyFactory>;
    readonly createBankAccount: ReturnType<typeof createBankAccountFactory>;
    readonly createCatalog: ReturnType<typeof createCatalogFactory>;
    readonly createProductCatalog: ReturnType<typeof createProductCatalogFactory>;
    readonly deleteAutoReply: ReturnType<typeof deleteAutoReplyFactory>;
    readonly deleteBankAccount: ReturnType<typeof deleteBankAccountFactory>;
    readonly deleteCatalog: ReturnType<typeof deleteCatalogFactory>;
    readonly deleteConversationLabel: ReturnType<typeof deleteConversationLabelFactory>;
    readonly deleteProductCatalog: ReturnType<typeof deleteProductCatalogFactory>;
    readonly deleteSingleProduct: ReturnType<typeof deleteSingleProductFactory>;
    readonly getAutoReplyList: ReturnType<typeof getAutoReplyListFactory>;
    readonly getBizAccount: ReturnType<typeof getBizAccountFactory>;
    readonly getCatalogList: ReturnType<typeof getCatalogListFactory>;
    readonly getLabels: ReturnType<typeof getLabelsFactory>;
    readonly getListBank: ReturnType<typeof getListBankFactory>;
    readonly getListBankAccount: ReturnType<typeof getListBankAccountFactory>;
    readonly getOAProfile: ReturnType<typeof getOAProfileFactory>;
    readonly getProductCatalogList: ReturnType<typeof getProductCatalogListFactory>;
    readonly getProductDetail: ReturnType<typeof getProductDetailFactory>;
    readonly getQuickMessageList: ReturnType<typeof getQuickMessageListFactory>;
    readonly registerCatalog: ReturnType<typeof registerCatalogFactory>;
    readonly removeQuickMessage: ReturnType<typeof removeQuickMessageFactory>;
    readonly reorderConversationLabels: ReturnType<typeof reorderConversationLabelsFactory>;
    readonly unblockOA: ReturnType<typeof unblockOAFactory>;
    readonly updateAutoReply: ReturnType<typeof updateAutoReplyFactory>;
    readonly updateBankAccount: ReturnType<typeof updateBankAccountFactory>;
    readonly updateCatalog: ReturnType<typeof updateCatalogFactory>;
    readonly updateConversationLabelItem: ReturnType<typeof updateConversationLabelItemFactory>;
    readonly updateLabels: ReturnType<typeof updateLabelsFactory>;
    readonly updateProductCatalog: ReturnType<typeof updateProductCatalogFactory>;
    readonly updateQuickMessage: ReturnType<typeof updateQuickMessageFactory>;
    readonly uploadProductPhoto: ReturnType<typeof uploadProductPhotoFactory>;
};

export type CallDomainAPI = {
    readonly addUserGroupCall: ReturnType<typeof addUserGroupCallFactory>;
    readonly answerAckVoiceCall: ReturnType<typeof answerAckVoiceCallFactory>;
    readonly answerGroupCall: ReturnType<typeof answerGroupCallFactory>;
    readonly answerVoiceCall: ReturnType<typeof answerVoiceCallFactory>;
    readonly broadcastGroupCallState: ReturnType<typeof broadcastGroupCallStateFactory>;
    readonly cancelGroupCall: ReturnType<typeof cancelGroupCallFactory>;
    readonly cancelVoiceCall: ReturnType<typeof cancelVoiceCallFactory>;
    readonly createController: ReturnType<typeof createControllerFactory>;
    readonly createRtcSession: ReturnType<typeof createRtcSessionFactory>;
    readonly endGroupCall: ReturnType<typeof endGroupCallFactory>;
    readonly endVoiceCall: ReturnType<typeof endVoiceCallFactory>;
    readonly finishGroupCall: ReturnType<typeof finishGroupCallFactory>;
    readonly getGroupCallState: ReturnType<typeof getGroupCallStateFactory>;
    readonly holdVoiceCall: ReturnType<typeof holdVoiceCallFactory>;
    readonly joinGroupCall: ReturnType<typeof joinGroupCallFactory>;
    readonly logEndVoiceCall: ReturnType<typeof logEndVoiceCallFactory>;
    readonly notifyGroupCall: ReturnType<typeof notifyGroupCallFactory>;
    readonly pingGroupCall: ReturnType<typeof pingGroupCallFactory>;
    readonly requestAudioToVideoCall: ReturnType<typeof requestAudioToVideoCallFactory>;
    readonly requestGroupCall: ReturnType<typeof requestGroupCallFactory>;
    readonly requestShareScreenCall: ReturnType<typeof requestShareScreenCallFactory>;
    readonly requestVoiceCall: ReturnType<typeof requestVoiceCallFactory>;
    readonly ringRingGroupCall: ReturnType<typeof ringRingGroupCallFactory>;
    readonly ringRingVoiceCall: ReturnType<typeof ringRingVoiceCallFactory>;
    readonly sendRequestGroupCall: ReturnType<typeof sendRequestGroupCallFactory>;
    readonly sendRequestVoiceCall: ReturnType<typeof sendRequestVoiceCallFactory>;
    readonly sendVoiceCall: ReturnType<typeof sendVoiceCallFactory>;
    readonly shareScreenGroupCall: ReturnType<typeof shareScreenGroupCallFactory>;
    readonly unholdVoiceCall: ReturnType<typeof unholdVoiceCallFactory>;
    readonly updateCallMediaState: ReturnType<typeof updateCallMediaStateFactory>;
};

export type ChatDomainAPI = {
    readonly addReaction: ReturnType<typeof addReactionFactory>;
    readonly addUnreadMark: ReturnType<typeof addUnreadMarkFactory>;
    readonly deleteChat: ReturnType<typeof deleteChatFactory>;
    readonly deleteMessage: ReturnType<typeof deleteMessageFactory>;
    readonly fetchImportantMessages: ReturnType<typeof fetchImportantMessagesFactory>;
    readonly forwardMessage: ReturnType<typeof forwardMessageFactory>;
    readonly getArchivedChatList: ReturnType<typeof getArchivedChatListFactory>;
    readonly getAutoDeleteChat: ReturnType<typeof getAutoDeleteChatFactory>;
    readonly getBlockSharingConversations: ReturnType<typeof getBlockSharingConversationsFactory>;
    readonly getConvOfflineMessages: ReturnType<typeof getConvOfflineMessagesFactory>;
    readonly getDirectMessageStatus: ReturnType<typeof getDirectMessageStatusFactory>;
    readonly getHiddenConversations: ReturnType<typeof getHiddenConversationsFactory>;
    readonly getLastSeen: ReturnType<typeof getLastSeenFactory>;
    readonly getLastSeenReaction: ReturnType<typeof getLastSeenReactionFactory>;
    readonly getMute: ReturnType<typeof getMuteFactory>;
    readonly getPinConversations: ReturnType<typeof getPinConversationsFactory>;
    readonly getRecentSearchList: ReturnType<typeof getRecentSearchListFactory>;
    readonly getSuggestedConversations: ReturnType<typeof getSuggestedConversationsFactory>;
    readonly getTranslateSetting: ReturnType<typeof getTranslateSettingFactory>;
    readonly getUnreadMark: ReturnType<typeof getUnreadMarkFactory>;
    readonly markSubTabSeen: ReturnType<typeof markSubTabSeenFactory>;
    readonly parseLink: ReturnType<typeof parseLinkFactory>;
    readonly preloadConversations: ReturnType<typeof preloadConversationsFactory>;
    readonly removeUnreadMark: ReturnType<typeof removeUnreadMarkFactory>;
    readonly renewMessageLink: ReturnType<typeof renewMessageLinkFactory>;
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
    readonly translateMessage: ReturnType<typeof translateMessageFactory>;
    readonly translateMessageAuto: ReturnType<typeof translateMessageAutoFactory>;
    readonly translateMessageSuggest: ReturnType<typeof translateMessageSuggestFactory>;
    readonly undo: ReturnType<typeof undoFactory>;
    readonly undoMultiMessage: ReturnType<typeof undoMultiMessageFactory>;
    readonly updateArchivedChatList: ReturnType<typeof updateArchivedChatListFactory>;
    readonly updateAutoDeleteChat: ReturnType<typeof updateAutoDeleteChatFactory>;
    readonly updateBlockSharingConversation: ReturnType<typeof updateBlockSharingConversationFactory>;
    readonly updateHiddenConversPin: ReturnType<typeof updateHiddenConversPinFactory>;
    readonly updatePinConversations: ReturnType<typeof updatePinConversationsFactory>;
    readonly updateRecentSearch: ReturnType<typeof updateRecentSearchFactory>;
    readonly updateTranslateSetting: ReturnType<typeof updateTranslateSettingFactory>;
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
    readonly getFriendProfilesV2: ReturnType<typeof getFriendProfilesV2Factory>;
    readonly getFriendRecommendations: ReturnType<typeof getFriendRecommendationsFactory>;
    readonly getFriendRequestStatus: ReturnType<typeof getFriendRequestStatusFactory>;
    readonly getFriendsActivePCWeb: ReturnType<typeof getFriendsActivePCWebFactory>;
    readonly getFriendsEmojiStatus: ReturnType<typeof getFriendsEmojiStatusFactory>;
    readonly getLastReadContactTab: ReturnType<typeof getLastReadContactTabFactory>;
    readonly getMultiUserQRCodes: ReturnType<typeof getMultiUserQRCodesFactory>;
    readonly getMultiUsersByPhones: ReturnType<typeof getMultiUsersByPhonesFactory>;
    readonly getPhonebookV2: ReturnType<typeof getPhonebookV2Factory>;
    readonly getSentFriendRequest: ReturnType<typeof getSentFriendRequestFactory>;
    readonly lastOnline: ReturnType<typeof lastOnlineFactory>;
    readonly readContactTab: ReturnType<typeof readContactTabFactory>;
    readonly rejectFriendRequest: ReturnType<typeof rejectFriendRequestFactory>;
    readonly removeFriend: ReturnType<typeof removeFriendFactory>;
    readonly removeFriendAlias: ReturnType<typeof removeFriendAliasFactory>;
    readonly removeFriendRecommendation: ReturnType<typeof removeFriendRecommendationFactory>;
    readonly removeFriendRecommendationV2: ReturnType<typeof removeFriendRecommendationV2Factory>;
    readonly sendFriendRequest: ReturnType<typeof sendFriendRequestFactory>;
    readonly unblockUser: ReturnType<typeof unblockUserFactory>;
    readonly undoFriendRequest: ReturnType<typeof undoFriendRequestFactory>;
    readonly updateCloseFriend: ReturnType<typeof updateCloseFriendFactory>;
    readonly verifyFriend: ReturnType<typeof verifyFriendFactory>;
};

export type GroupDomainAPI = {
    readonly addGroupBlockedMember: ReturnType<typeof addGroupBlockedMemberFactory>;
    readonly addGroupDeputy: ReturnType<typeof addGroupDeputyFactory>;
    readonly addUserToGroup: ReturnType<typeof addUserToGroupFactory>;
    readonly analyseGroup: ReturnType<typeof analyseGroupFactory>;
    readonly changeGroupAvatar: ReturnType<typeof changeGroupAvatarFactory>;
    readonly changeGroupName: ReturnType<typeof changeGroupNameFactory>;
    readonly changeGroupOwner: ReturnType<typeof changeGroupOwnerFactory>;
    readonly checkQuotaCommunityMember: ReturnType<typeof checkQuotaCommunityMemberFactory>;
    readonly createGroup: ReturnType<typeof createGroupFactory>;
    readonly deleteGroupInviteBox: ReturnType<typeof deleteGroupInviteBoxFactory>;
    readonly disableGroupLink: ReturnType<typeof disableGroupLinkFactory>;
    readonly disperseGroup: ReturnType<typeof disperseGroupFactory>;
    readonly enableGroupLink: ReturnType<typeof enableGroupLinkFactory>;
    readonly getAllGroups: ReturnType<typeof getAllGroupsFactory>;
    readonly getE2eeGroupList: ReturnType<typeof getE2eeGroupListFactory>;
    readonly getExtraGroupInfo: ReturnType<typeof getExtraGroupInfoFactory>;
    readonly getGroupBlockedMember: ReturnType<typeof getGroupBlockedMemberFactory>;
    readonly getGroupChatHistory: ReturnType<typeof getGroupChatHistoryFactory>;
    readonly getGroupCloudMessageJump: ReturnType<typeof getGroupCloudMessageJumpFactory>;
    readonly getGroupCloudMessagePath: ReturnType<typeof getGroupCloudMessagePathFactory>;
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
    readonly getMultiGroupCloudMessages: ReturnType<typeof getMultiGroupCloudMessagesFactory>;
    readonly getPendingGroupMembers: ReturnType<typeof getPendingGroupMembersFactory>;
    readonly getQuotaCommunity: ReturnType<typeof getQuotaCommunityFactory>;
    readonly getRelatedFriendGroup: ReturnType<typeof getRelatedFriendGroupFactory>;
    readonly inviteUserToGroups: ReturnType<typeof inviteUserToGroupsFactory>;
    readonly joinGroupInviteBox: ReturnType<typeof joinGroupInviteBoxFactory>;
    readonly joinGroupLink: ReturnType<typeof joinGroupLinkFactory>;
    readonly leaveGroup: ReturnType<typeof leaveGroupFactory>;
    readonly removeGroupBlockedMember: ReturnType<typeof removeGroupBlockedMemberFactory>;
    readonly removeGroupDeputy: ReturnType<typeof removeGroupDeputyFactory>;
    readonly removeGroupTopic: ReturnType<typeof removeGroupTopicFactory>;
    readonly removeUserFromGroup: ReturnType<typeof removeUserFromGroupFactory>;
    readonly removeUserFromGroups: ReturnType<typeof removeUserFromGroupsFactory>;
    readonly reviewPendingMemberRequest: ReturnType<typeof reviewPendingMemberRequestFactory>;
    readonly updateGroupSettings: ReturnType<typeof updateGroupSettingsFactory>;
    readonly upgradeGroupToCommunity: ReturnType<typeof upgradeGroupToCommunityFactory>;
};

export type MediaDomainAPI = {
    readonly getConversationMedia: ReturnType<typeof getConversationMediaFactory>;
    readonly getMediaStorePreview: ReturnType<typeof getMediaStorePreviewFactory>;
    readonly getPersonalMedia: ReturnType<typeof getPersonalMediaFactory>;
    readonly getPersonalMediaPreview: ReturnType<typeof getPersonalMediaPreviewFactory>;
    readonly removeConversationMedia: ReturnType<typeof removeConversationMediaFactory>;
    readonly removePersonalMedia: ReturnType<typeof removePersonalMediaFactory>;
    readonly uploadAttachment: ReturnType<typeof uploadAttachmentFactory>;
    readonly voiceToText: ReturnType<typeof voiceToTextFactory>;
};

export type ProfileDomainAPI = {
    readonly changeAccountAvatar: ReturnType<typeof changeAccountAvatarFactory>;
    readonly deleteAvatar: ReturnType<typeof deleteAvatarFactory>;
    readonly disableLimitSearchPhoneReminder: ReturnType<typeof disableLimitSearchPhoneReminderFactory>;
    readonly fetchAccountInfo: ReturnType<typeof fetchAccountInfoFactory>;
    readonly getAvatarList: ReturnType<typeof getAvatarListFactory>;
    readonly getAvatarUrlProfile: ReturnType<typeof getAvatarUrlProfileFactory>;
    readonly getEmojiStatusConfig: ReturnType<typeof getEmojiStatusConfigFactory>;
    readonly getEnterpriseProfiles: ReturnType<typeof getEnterpriseProfilesFactory>;
    readonly getFullAvatar: ReturnType<typeof getFullAvatarFactory>;
    readonly getMiniProfile: ReturnType<typeof getMiniProfileFactory>;
    readonly getProfileExtra: ReturnType<typeof getProfileExtraFactory>;
    readonly getProfileRank: ReturnType<typeof getProfileRankFactory>;
    readonly getProfileVerificationStatus: ReturnType<typeof getProfileVerificationStatusFactory>;
    readonly getSettings: ReturnType<typeof getSettingsFactory>;
    readonly getUserInfo: ReturnType<typeof getUserInfoFactory>;
    readonly pushProfileVerificationMessage: ReturnType<typeof pushProfileVerificationMessageFactory>;
    readonly registerTrialBizAccount: ReturnType<typeof registerTrialBizAccountFactory>;
    readonly reuseAvatar: ReturnType<typeof reuseAvatarFactory>;
    readonly updateProfile: ReturnType<typeof updateProfileFactory>;
    readonly updateProfileBio: ReturnType<typeof updateProfileBioFactory>;
    readonly updateProfileMode: ReturnType<typeof updateProfileModeFactory>;
    readonly updateSettings: ReturnType<typeof updateSettingsFactory>;
};

export type StickerDomainAPI = {
    readonly getAIStickerList: ReturnType<typeof getAIStickerListFactory>;
    readonly getDefaultGuggyGifs: ReturnType<typeof getDefaultGuggyGifsFactory>;
    readonly getGifCategories: ReturnType<typeof getGifCategoriesFactory>;
    readonly getGifDictionaries: ReturnType<typeof getGifDictionariesFactory>;
    readonly getGifsByCategory: ReturnType<typeof getGifsByCategoryFactory>;
    readonly getGifsByDictionary: ReturnType<typeof getGifsByDictionaryFactory>;
    readonly getMessageEffectById: ReturnType<typeof getMessageEffectByIdFactory>;
    readonly getMessageEffects: ReturnType<typeof getMessageEffectsFactory>;
    readonly getPersonalizedStickerList: ReturnType<typeof getPersonalizedStickerListFactory>;
    readonly getRecommendedStickers: ReturnType<typeof getRecommendedStickersFactory>;
    readonly getStickerCategoriesV2: ReturnType<typeof getStickerCategoriesV2Factory>;
    readonly getStickerCategoryData: ReturnType<typeof getStickerCategoryDataFactory>;
    readonly getStickerCategoryDetail: ReturnType<typeof getStickerCategoryDetailFactory>;
    readonly getStickerHello: ReturnType<typeof getStickerHelloFactory>;
    readonly getStickers: ReturnType<typeof getStickersFactory>;
    readonly getStickersDetail: ReturnType<typeof getStickersDetailFactory>;
    readonly getStickerSuggestion: ReturnType<typeof getStickerSuggestionFactory>;
    readonly getStickerSuggestKeywords: ReturnType<typeof getStickerSuggestKeywordsFactory>;
    readonly getTenorStickerMapping: ReturnType<typeof getTenorStickerMappingFactory>;
    readonly getTrendingGifs: ReturnType<typeof getTrendingGifsFactory>;
    readonly searchGifs: ReturnType<typeof searchGifsFactory>;
    readonly searchGuggyGifs: ReturnType<typeof searchGuggyGifsFactory>;
    readonly searchSticker: ReturnType<typeof searchStickerFactory>;
    readonly updatePersonalizedStickerList: ReturnType<typeof updatePersonalizedStickerListFactory>;
};

export type SyncDomainAPI = {
    readonly cancelPullMobile: ReturnType<typeof cancelPullMobileFactory>;
    readonly deleteMobileMsgSnapshot: ReturnType<typeof deleteMobileMsgSnapshotFactory>;
    readonly downloadTransferSync: ReturnType<typeof downloadTransferSyncFactory>;
    readonly getBackupMsgInfo: ReturnType<typeof getBackupMsgInfoFactory>;
    readonly getCrossDbInfo: ReturnType<typeof getCrossDbInfoFactory>;
    readonly getSyncData: ReturnType<typeof getSyncDataFactory>;
    readonly pullMobile: ReturnType<typeof pullMobileFactory>;
    readonly requestSyncFromPhone: ReturnType<typeof requestSyncFromPhoneFactory>;
    readonly submitSyncMediaActions: ReturnType<typeof submitSyncMediaActionsFactory>;
    readonly uploadBackupChunk: ReturnType<typeof uploadBackupChunkFactory>;
};

export type ZcloudDomainAPI = {
    readonly ackCloudOnboarding: ReturnType<typeof ackCloudOnboardingFactory>;
    readonly getCloudDownloadUrls: ReturnType<typeof getCloudDownloadUrlsFactory>;
    readonly getCloudInfo: ReturnType<typeof getCloudInfoFactory>;
    readonly getCloudSettings: ReturnType<typeof getCloudSettingsFactory>;
    readonly getCloudUploadUrl: ReturnType<typeof getCloudUploadUrlFactory>;
    readonly getCloudViewerKey: ReturnType<typeof getCloudViewerKeyFactory>;
    readonly getFamilyProfile: ReturnType<typeof getFamilyProfileFactory>;
    readonly getFamilyUsage: ReturnType<typeof getFamilyUsageFactory>;
    readonly getFamilyViewerKey: ReturnType<typeof getFamilyViewerKeyFactory>;
    readonly getUsageMyCloud: ReturnType<typeof getUsageMyCloudFactory>;
    readonly getUsageZCloud: ReturnType<typeof getUsageZCloudFactory>;
    readonly migrateCloudRecent: ReturnType<typeof migrateCloudRecentFactory>;
    readonly resetCloudQueue: ReturnType<typeof resetCloudQueueFactory>;
    readonly submitCloudMediaExtInfo: ReturnType<typeof submitCloudMediaExtInfoFactory>;
    readonly submitCloudVerifyAction: ReturnType<typeof submitCloudVerifyActionFactory>;
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
                get decryptGids() {
                    return api.decryptGids;
                },
                get encryptGids() {
                    return api.encryptGids;
                },
                get exportSession() {
                    return api.exportSession;
                },
                get getContext() {
                    return api.getContext;
                },
                get getCookie() {
                    return api.getCookie;
                },
                get getListDevice() {
                    return api.getListDevice;
                },
                get getNoisedIds() {
                    return api.getNoisedIds;
                },
                get getOwnId() {
                    return api.getOwnId;
                },
                get getQR() {
                    return api.getQR;
                },
                get keepAlive() {
                    return api.keepAlive;
                },
                get lostFocus() {
                    return api.lostFocus;
                },
                get scanURL() {
                    return api.scanURL;
                },
                get updateActiveStatus() {
                    return api.updateActiveStatus;
                },
                get updateLang() {
                    return api.updateLang;
                },
            });
            this._domains.auth = createNamespace(this);
        }
        return this._domains.auth as AuthDomainAPI;
    }

    public get board(): BoardDomainAPI {
        if (!this._domains.board) {
            const createNamespace = (api: API): BoardDomainAPI => ({
                get ackDingTodo() {
                    return api.ackDingTodo;
                },
                get addPollOptions() {
                    return api.addPollOptions;
                },
                get createNote() {
                    return api.createNote;
                },
                get createOneOneBoardTopic() {
                    return api.createOneOneBoardTopic;
                },
                get createPoll() {
                    return api.createPoll;
                },
                get createReminder() {
                    return api.createReminder;
                },
                get createTodo() {
                    return api.createTodo;
                },
                get deleteTodo() {
                    return api.deleteTodo;
                },
                get dingTodo() {
                    return api.dingTodo;
                },
                get editNote() {
                    return api.editNote;
                },
                get editReminder() {
                    return api.editReminder;
                },
                get getListBoard() {
                    return api.getListBoard;
                },
                get getListOneOneBoard() {
                    return api.getListOneOneBoard;
                },
                get getListPinTopics() {
                    return api.getListPinTopics;
                },
                get getListReminder() {
                    return api.getListReminder;
                },
                get getPollDetail() {
                    return api.getPollDetail;
                },
                get getReminder() {
                    return api.getReminder;
                },
                get getReminderResponses() {
                    return api.getReminderResponses;
                },
                get getTodoDetail() {
                    return api.getTodoDetail;
                },
                get getTodoList() {
                    return api.getTodoList;
                },
                get lockPoll() {
                    return api.lockPoll;
                },
                get multiUnpinBoardTopics() {
                    return api.multiUnpinBoardTopics;
                },
                get pinBoardTopic() {
                    return api.pinBoardTopic;
                },
                get pinFriendMessage() {
                    return api.pinFriendMessage;
                },
                get removeBoardTopic() {
                    return api.removeBoardTopic;
                },
                get removeOneOneBoardTopic() {
                    return api.removeOneOneBoardTopic;
                },
                get removeReminder() {
                    return api.removeReminder;
                },
                get reorderFriendBoard() {
                    return api.reorderFriendBoard;
                },
                get reorderPinTopics() {
                    return api.reorderPinTopics;
                },
                get respondReminder() {
                    return api.respondReminder;
                },
                get sharePoll() {
                    return api.sharePoll;
                },
                get unpinBoardTopic() {
                    return api.unpinBoardTopic;
                },
                get unpinFriendMessages() {
                    return api.unpinFriendMessages;
                },
                get updateOneOneBoardTopic() {
                    return api.updateOneOneBoardTopic;
                },
                get updateTodo() {
                    return api.updateTodo;
                },
                get updateTodoStatus() {
                    return api.updateTodoStatus;
                },
                get verifyTodo() {
                    return api.verifyTodo;
                },
                get votePoll() {
                    return api.votePoll;
                },
            });
            this._domains.board = createNamespace(this);
        }
        return this._domains.board as BoardDomainAPI;
    }

    public get business(): BusinessDomainAPI {
        if (!this._domains.business) {
            const createNamespace = (api: API): BusinessDomainAPI => ({
                get addConversationLabel() {
                    return api.addConversationLabel;
                },
                get addQuickMessage() {
                    return api.addQuickMessage;
                },
                get blockOA() {
                    return api.blockOA;
                },
                get convertOAIds() {
                    return api.convertOAIds;
                },
                get createAutoReply() {
                    return api.createAutoReply;
                },
                get createBankAccount() {
                    return api.createBankAccount;
                },
                get createCatalog() {
                    return api.createCatalog;
                },
                get createProductCatalog() {
                    return api.createProductCatalog;
                },
                get deleteAutoReply() {
                    return api.deleteAutoReply;
                },
                get deleteBankAccount() {
                    return api.deleteBankAccount;
                },
                get deleteCatalog() {
                    return api.deleteCatalog;
                },
                get deleteConversationLabel() {
                    return api.deleteConversationLabel;
                },
                get deleteProductCatalog() {
                    return api.deleteProductCatalog;
                },
                get deleteSingleProduct() {
                    return api.deleteSingleProduct;
                },
                get getAutoReplyList() {
                    return api.getAutoReplyList;
                },
                get getBizAccount() {
                    return api.getBizAccount;
                },
                get getCatalogList() {
                    return api.getCatalogList;
                },
                get getLabels() {
                    return api.getLabels;
                },
                get getListBank() {
                    return api.getListBank;
                },
                get getListBankAccount() {
                    return api.getListBankAccount;
                },
                get getOAProfile() {
                    return api.getOAProfile;
                },
                get getProductCatalogList() {
                    return api.getProductCatalogList;
                },
                get getProductDetail() {
                    return api.getProductDetail;
                },
                get getQuickMessageList() {
                    return api.getQuickMessageList;
                },
                get registerCatalog() {
                    return api.registerCatalog;
                },
                get removeQuickMessage() {
                    return api.removeQuickMessage;
                },
                get reorderConversationLabels() {
                    return api.reorderConversationLabels;
                },
                get unblockOA() {
                    return api.unblockOA;
                },
                get updateAutoReply() {
                    return api.updateAutoReply;
                },
                get updateBankAccount() {
                    return api.updateBankAccount;
                },
                get updateCatalog() {
                    return api.updateCatalog;
                },
                get updateConversationLabelItem() {
                    return api.updateConversationLabelItem;
                },
                get updateLabels() {
                    return api.updateLabels;
                },
                get updateProductCatalog() {
                    return api.updateProductCatalog;
                },
                get updateQuickMessage() {
                    return api.updateQuickMessage;
                },
                get uploadProductPhoto() {
                    return api.uploadProductPhoto;
                },
            });
            this._domains.business = createNamespace(this);
        }
        return this._domains.business as BusinessDomainAPI;
    }

    public get call(): CallDomainAPI {
        if (!this._domains.call) {
            const createNamespace = (api: API): CallDomainAPI => ({
                get addUserGroupCall() {
                    return api.addUserGroupCall;
                },
                get answerAckVoiceCall() {
                    return api.answerAckVoiceCall;
                },
                get answerGroupCall() {
                    return api.answerGroupCall;
                },
                get answerVoiceCall() {
                    return api.answerVoiceCall;
                },
                get broadcastGroupCallState() {
                    return api.broadcastGroupCallState;
                },
                get cancelGroupCall() {
                    return api.cancelGroupCall;
                },
                get cancelVoiceCall() {
                    return api.cancelVoiceCall;
                },
                get createController() {
                    return api.createController;
                },
                get createRtcSession() {
                    return api.createRtcSession;
                },
                get endGroupCall() {
                    return api.endGroupCall;
                },
                get endVoiceCall() {
                    return api.endVoiceCall;
                },
                get finishGroupCall() {
                    return api.finishGroupCall;
                },
                get getGroupCallState() {
                    return api.getGroupCallState;
                },
                get holdVoiceCall() {
                    return api.holdVoiceCall;
                },
                get joinGroupCall() {
                    return api.joinGroupCall;
                },
                get logEndVoiceCall() {
                    return api.logEndVoiceCall;
                },
                get notifyGroupCall() {
                    return api.notifyGroupCall;
                },
                get pingGroupCall() {
                    return api.pingGroupCall;
                },
                get requestAudioToVideoCall() {
                    return api.requestAudioToVideoCall;
                },
                get requestGroupCall() {
                    return api.requestGroupCall;
                },
                get requestShareScreenCall() {
                    return api.requestShareScreenCall;
                },
                get requestVoiceCall() {
                    return api.requestVoiceCall;
                },
                get ringRingGroupCall() {
                    return api.ringRingGroupCall;
                },
                get ringRingVoiceCall() {
                    return api.ringRingVoiceCall;
                },
                get sendRequestGroupCall() {
                    return api.sendRequestGroupCall;
                },
                get sendRequestVoiceCall() {
                    return api.sendRequestVoiceCall;
                },
                get sendVoiceCall() {
                    return api.sendVoiceCall;
                },
                get shareScreenGroupCall() {
                    return api.shareScreenGroupCall;
                },
                get unholdVoiceCall() {
                    return api.unholdVoiceCall;
                },
                get updateCallMediaState() {
                    return api.updateCallMediaState;
                },
            });
            this._domains.call = createNamespace(this);
        }
        return this._domains.call as CallDomainAPI;
    }

    public get chat(): ChatDomainAPI {
        if (!this._domains.chat) {
            const createNamespace = (api: API): ChatDomainAPI => ({
                get addReaction() {
                    return api.addReaction;
                },
                get addUnreadMark() {
                    return api.addUnreadMark;
                },
                get deleteChat() {
                    return api.deleteChat;
                },
                get deleteMessage() {
                    return api.deleteMessage;
                },
                get fetchImportantMessages() {
                    return api.fetchImportantMessages;
                },
                get forwardMessage() {
                    return api.forwardMessage;
                },
                get getArchivedChatList() {
                    return api.getArchivedChatList;
                },
                get getAutoDeleteChat() {
                    return api.getAutoDeleteChat;
                },
                get getBlockSharingConversations() {
                    return api.getBlockSharingConversations;
                },
                get getConvOfflineMessages() {
                    return api.getConvOfflineMessages;
                },
                get getDirectMessageStatus() {
                    return api.getDirectMessageStatus;
                },
                get getHiddenConversations() {
                    return api.getHiddenConversations;
                },
                get getLastSeen() {
                    return api.getLastSeen;
                },
                get getLastSeenReaction() {
                    return api.getLastSeenReaction;
                },
                get getMute() {
                    return api.getMute;
                },
                get getPinConversations() {
                    return api.getPinConversations;
                },
                get getRecentSearchList() {
                    return api.getRecentSearchList;
                },
                get getSuggestedConversations() {
                    return api.getSuggestedConversations;
                },
                get getTranslateSetting() {
                    return api.getTranslateSetting;
                },
                get getUnreadMark() {
                    return api.getUnreadMark;
                },
                get markSubTabSeen() {
                    return api.markSubTabSeen;
                },
                get parseLink() {
                    return api.parseLink;
                },
                get preloadConversations() {
                    return api.preloadConversations;
                },
                get removeUnreadMark() {
                    return api.removeUnreadMark;
                },
                get renewMessageLink() {
                    return api.renewMessageLink;
                },
                get resetHiddenConversPin() {
                    return api.resetHiddenConversPin;
                },
                get sendBankCard() {
                    return api.sendBankCard;
                },
                get sendCard() {
                    return api.sendCard;
                },
                get sendDeliveredEvent() {
                    return api.sendDeliveredEvent;
                },
                get sendLink() {
                    return api.sendLink;
                },
                get sendMessage() {
                    return api.sendMessage;
                },
                get sendReport() {
                    return api.sendReport;
                },
                get sendSeenEvent() {
                    return api.sendSeenEvent;
                },
                get sendSticker() {
                    return api.sendSticker;
                },
                get sendTypingEvent() {
                    return api.sendTypingEvent;
                },
                get sendVideo() {
                    return api.sendVideo;
                },
                get sendVoice() {
                    return api.sendVoice;
                },
                get setHiddenConversations() {
                    return api.setHiddenConversations;
                },
                get setMute() {
                    return api.setMute;
                },
                get setPinnedConversations() {
                    return api.setPinnedConversations;
                },
                get translateMessage() {
                    return api.translateMessage;
                },
                get translateMessageAuto() {
                    return api.translateMessageAuto;
                },
                get translateMessageSuggest() {
                    return api.translateMessageSuggest;
                },
                get undo() {
                    return api.undo;
                },
                get undoMultiMessage() {
                    return api.undoMultiMessage;
                },
                get updateArchivedChatList() {
                    return api.updateArchivedChatList;
                },
                get updateAutoDeleteChat() {
                    return api.updateAutoDeleteChat;
                },
                get updateBlockSharingConversation() {
                    return api.updateBlockSharingConversation;
                },
                get updateHiddenConversPin() {
                    return api.updateHiddenConversPin;
                },
                get updatePinConversations() {
                    return api.updatePinConversations;
                },
                get updateRecentSearch() {
                    return api.updateRecentSearch;
                },
                get updateTranslateSetting() {
                    return api.updateTranslateSetting;
                },
            });
            this._domains.chat = createNamespace(this);
        }
        return this._domains.chat as ChatDomainAPI;
    }

    public get friend(): FriendDomainAPI {
        if (!this._domains.friend) {
            const createNamespace = (api: API): FriendDomainAPI => ({
                get acceptFriendRequest() {
                    return api.acceptFriendRequest;
                },
                get blockUser() {
                    return api.blockUser;
                },
                get blockViewFeed() {
                    return api.blockViewFeed;
                },
                get changeFriendAlias() {
                    return api.changeFriendAlias;
                },
                get clearUnreadFriendRequests() {
                    return api.clearUnreadFriendRequests;
                },
                get findUser() {
                    return api.findUser;
                },
                get findUserByUsername() {
                    return api.findUserByUsername;
                },
                get getAliasList() {
                    return api.getAliasList;
                },
                get getAliasListV2() {
                    return api.getAliasListV2;
                },
                get getAllFriends() {
                    return api.getAllFriends;
                },
                get getBlockFriends() {
                    return api.getBlockFriends;
                },
                get getCloseFriends() {
                    return api.getCloseFriends;
                },
                get getExtraFriendInfo() {
                    return api.getExtraFriendInfo;
                },
                get getFriendBoardList() {
                    return api.getFriendBoardList;
                },
                get getFriendOnlines() {
                    return api.getFriendOnlines;
                },
                get getFriendProfilesV2() {
                    return api.getFriendProfilesV2;
                },
                get getFriendRecommendations() {
                    return api.getFriendRecommendations;
                },
                get getFriendRequestStatus() {
                    return api.getFriendRequestStatus;
                },
                get getFriendsActivePCWeb() {
                    return api.getFriendsActivePCWeb;
                },
                get getFriendsEmojiStatus() {
                    return api.getFriendsEmojiStatus;
                },
                get getLastReadContactTab() {
                    return api.getLastReadContactTab;
                },
                get getMultiUserQRCodes() {
                    return api.getMultiUserQRCodes;
                },
                get getMultiUsersByPhones() {
                    return api.getMultiUsersByPhones;
                },
                get getPhonebookV2() {
                    return api.getPhonebookV2;
                },
                get getSentFriendRequest() {
                    return api.getSentFriendRequest;
                },
                get lastOnline() {
                    return api.lastOnline;
                },
                get readContactTab() {
                    return api.readContactTab;
                },
                get rejectFriendRequest() {
                    return api.rejectFriendRequest;
                },
                get removeFriend() {
                    return api.removeFriend;
                },
                get removeFriendAlias() {
                    return api.removeFriendAlias;
                },
                get removeFriendRecommendation() {
                    return api.removeFriendRecommendation;
                },
                get removeFriendRecommendationV2() {
                    return api.removeFriendRecommendationV2;
                },
                get sendFriendRequest() {
                    return api.sendFriendRequest;
                },
                get unblockUser() {
                    return api.unblockUser;
                },
                get undoFriendRequest() {
                    return api.undoFriendRequest;
                },
                get updateCloseFriend() {
                    return api.updateCloseFriend;
                },
                get verifyFriend() {
                    return api.verifyFriend;
                },
            });
            this._domains.friend = createNamespace(this);
        }
        return this._domains.friend as FriendDomainAPI;
    }

    public get group(): GroupDomainAPI {
        if (!this._domains.group) {
            const createNamespace = (api: API): GroupDomainAPI => ({
                get addGroupBlockedMember() {
                    return api.addGroupBlockedMember;
                },
                get addGroupDeputy() {
                    return api.addGroupDeputy;
                },
                get addUserToGroup() {
                    return api.addUserToGroup;
                },
                get analyseGroup() {
                    return api.analyseGroup;
                },
                get changeGroupAvatar() {
                    return api.changeGroupAvatar;
                },
                get changeGroupName() {
                    return api.changeGroupName;
                },
                get changeGroupOwner() {
                    return api.changeGroupOwner;
                },
                get checkQuotaCommunityMember() {
                    return api.checkQuotaCommunityMember;
                },
                get createGroup() {
                    return api.createGroup;
                },
                get deleteGroupInviteBox() {
                    return api.deleteGroupInviteBox;
                },
                get disableGroupLink() {
                    return api.disableGroupLink;
                },
                get disperseGroup() {
                    return api.disperseGroup;
                },
                get enableGroupLink() {
                    return api.enableGroupLink;
                },
                get getAllGroups() {
                    return api.getAllGroups;
                },
                get getE2eeGroupList() {
                    return api.getE2eeGroupList;
                },
                get getExtraGroupInfo() {
                    return api.getExtraGroupInfo;
                },
                get getGroupBlockedMember() {
                    return api.getGroupBlockedMember;
                },
                get getGroupChatHistory() {
                    return api.getGroupChatHistory;
                },
                get getGroupCloudMessageJump() {
                    return api.getGroupCloudMessageJump;
                },
                get getGroupCloudMessagePath() {
                    return api.getGroupCloudMessagePath;
                },
                get getGroupHistoryLegacy() {
                    return api.getGroupHistoryLegacy;
                },
                get getGroupInfo() {
                    return api.getGroupInfo;
                },
                get getGroupInfoV2() {
                    return api.getGroupInfoV2;
                },
                get getGroupInviteBoxInfo() {
                    return api.getGroupInviteBoxInfo;
                },
                get getGroupInviteBoxList() {
                    return api.getGroupInviteBoxList;
                },
                get getGroupLinkDetail() {
                    return api.getGroupLinkDetail;
                },
                get getGroupLinkInfo() {
                    return api.getGroupLinkInfo;
                },
                get getGroupListV3() {
                    return api.getGroupListV3;
                },
                get getGroupMembersInfo() {
                    return api.getGroupMembersInfo;
                },
                get getGroupMessageStatus() {
                    return api.getGroupMessageStatus;
                },
                get getMultiGroupCloudMessages() {
                    return api.getMultiGroupCloudMessages;
                },
                get getPendingGroupMembers() {
                    return api.getPendingGroupMembers;
                },
                get getQuotaCommunity() {
                    return api.getQuotaCommunity;
                },
                get getRelatedFriendGroup() {
                    return api.getRelatedFriendGroup;
                },
                get inviteUserToGroups() {
                    return api.inviteUserToGroups;
                },
                get joinGroupInviteBox() {
                    return api.joinGroupInviteBox;
                },
                get joinGroupLink() {
                    return api.joinGroupLink;
                },
                get leaveGroup() {
                    return api.leaveGroup;
                },
                get removeGroupBlockedMember() {
                    return api.removeGroupBlockedMember;
                },
                get removeGroupDeputy() {
                    return api.removeGroupDeputy;
                },
                get removeGroupTopic() {
                    return api.removeGroupTopic;
                },
                get removeUserFromGroup() {
                    return api.removeUserFromGroup;
                },
                get removeUserFromGroups() {
                    return api.removeUserFromGroups;
                },
                get reviewPendingMemberRequest() {
                    return api.reviewPendingMemberRequest;
                },
                get updateGroupSettings() {
                    return api.updateGroupSettings;
                },
                get upgradeGroupToCommunity() {
                    return api.upgradeGroupToCommunity;
                },
            });
            this._domains.group = createNamespace(this);
        }
        return this._domains.group as GroupDomainAPI;
    }

    public get media(): MediaDomainAPI {
        if (!this._domains.media) {
            const createNamespace = (api: API): MediaDomainAPI => ({
                get getConversationMedia() {
                    return api.getConversationMedia;
                },
                get getMediaStorePreview() {
                    return api.getMediaStorePreview;
                },
                get getPersonalMedia() {
                    return api.getPersonalMedia;
                },
                get getPersonalMediaPreview() {
                    return api.getPersonalMediaPreview;
                },
                get removeConversationMedia() {
                    return api.removeConversationMedia;
                },
                get removePersonalMedia() {
                    return api.removePersonalMedia;
                },
                get uploadAttachment() {
                    return api.uploadAttachment;
                },
                get voiceToText() {
                    return api.voiceToText;
                },
            });
            this._domains.media = createNamespace(this);
        }
        return this._domains.media as MediaDomainAPI;
    }

    public get profile(): ProfileDomainAPI {
        if (!this._domains.profile) {
            const createNamespace = (api: API): ProfileDomainAPI => ({
                get changeAccountAvatar() {
                    return api.changeAccountAvatar;
                },
                get deleteAvatar() {
                    return api.deleteAvatar;
                },
                get disableLimitSearchPhoneReminder() {
                    return api.disableLimitSearchPhoneReminder;
                },
                get fetchAccountInfo() {
                    return api.fetchAccountInfo;
                },
                get getAvatarList() {
                    return api.getAvatarList;
                },
                get getAvatarUrlProfile() {
                    return api.getAvatarUrlProfile;
                },
                get getEmojiStatusConfig() {
                    return api.getEmojiStatusConfig;
                },
                get getEnterpriseProfiles() {
                    return api.getEnterpriseProfiles;
                },
                get getFullAvatar() {
                    return api.getFullAvatar;
                },
                get getMiniProfile() {
                    return api.getMiniProfile;
                },
                get getProfileExtra() {
                    return api.getProfileExtra;
                },
                get getProfileRank() {
                    return api.getProfileRank;
                },
                get getProfileVerificationStatus() {
                    return api.getProfileVerificationStatus;
                },
                get getSettings() {
                    return api.getSettings;
                },
                get getUserInfo() {
                    return api.getUserInfo;
                },
                get pushProfileVerificationMessage() {
                    return api.pushProfileVerificationMessage;
                },
                get registerTrialBizAccount() {
                    return api.registerTrialBizAccount;
                },
                get reuseAvatar() {
                    return api.reuseAvatar;
                },
                get updateProfile() {
                    return api.updateProfile;
                },
                get updateProfileBio() {
                    return api.updateProfileBio;
                },
                get updateProfileMode() {
                    return api.updateProfileMode;
                },
                get updateSettings() {
                    return api.updateSettings;
                },
            });
            this._domains.profile = createNamespace(this);
        }
        return this._domains.profile as ProfileDomainAPI;
    }

    public get sticker(): StickerDomainAPI {
        if (!this._domains.sticker) {
            const createNamespace = (api: API): StickerDomainAPI => ({
                get getAIStickerList() {
                    return api.getAIStickerList;
                },
                get getDefaultGuggyGifs() {
                    return api.getDefaultGuggyGifs;
                },
                get getGifCategories() {
                    return api.getGifCategories;
                },
                get getGifDictionaries() {
                    return api.getGifDictionaries;
                },
                get getGifsByCategory() {
                    return api.getGifsByCategory;
                },
                get getGifsByDictionary() {
                    return api.getGifsByDictionary;
                },
                get getMessageEffectById() {
                    return api.getMessageEffectById;
                },
                get getMessageEffects() {
                    return api.getMessageEffects;
                },
                get getPersonalizedStickerList() {
                    return api.getPersonalizedStickerList;
                },
                get getRecommendedStickers() {
                    return api.getRecommendedStickers;
                },
                get getStickerCategoriesV2() {
                    return api.getStickerCategoriesV2;
                },
                get getStickerCategoryData() {
                    return api.getStickerCategoryData;
                },
                get getStickerCategoryDetail() {
                    return api.getStickerCategoryDetail;
                },
                get getStickerHello() {
                    return api.getStickerHello;
                },
                get getStickers() {
                    return api.getStickers;
                },
                get getStickersDetail() {
                    return api.getStickersDetail;
                },
                get getStickerSuggestion() {
                    return api.getStickerSuggestion;
                },
                get getStickerSuggestKeywords() {
                    return api.getStickerSuggestKeywords;
                },
                get getTenorStickerMapping() {
                    return api.getTenorStickerMapping;
                },
                get getTrendingGifs() {
                    return api.getTrendingGifs;
                },
                get searchGifs() {
                    return api.searchGifs;
                },
                get searchGuggyGifs() {
                    return api.searchGuggyGifs;
                },
                get searchSticker() {
                    return api.searchSticker;
                },
                get updatePersonalizedStickerList() {
                    return api.updatePersonalizedStickerList;
                },
            });
            this._domains.sticker = createNamespace(this);
        }
        return this._domains.sticker as StickerDomainAPI;
    }

    public get sync(): SyncDomainAPI {
        if (!this._domains.sync) {
            const createNamespace = (api: API): SyncDomainAPI => ({
                get cancelPullMobile() {
                    return api.cancelPullMobile;
                },
                get deleteMobileMsgSnapshot() {
                    return api.deleteMobileMsgSnapshot;
                },
                get downloadTransferSync() {
                    return api.downloadTransferSync;
                },
                get getBackupMsgInfo() {
                    return api.getBackupMsgInfo;
                },
                get getCrossDbInfo() {
                    return api.getCrossDbInfo;
                },
                get getSyncData() {
                    return api.getSyncData;
                },
                get pullMobile() {
                    return api.pullMobile;
                },
                get requestSyncFromPhone() {
                    return api.requestSyncFromPhone;
                },
                get submitSyncMediaActions() {
                    return api.submitSyncMediaActions;
                },
                get uploadBackupChunk() {
                    return api.uploadBackupChunk;
                },
            });
            this._domains.sync = createNamespace(this);
        }
        return this._domains.sync as SyncDomainAPI;
    }

    public get zcloud(): ZcloudDomainAPI {
        if (!this._domains.zcloud) {
            const createNamespace = (api: API): ZcloudDomainAPI => ({
                get ackCloudOnboarding() {
                    return api.ackCloudOnboarding;
                },
                get getCloudDownloadUrls() {
                    return api.getCloudDownloadUrls;
                },
                get getCloudInfo() {
                    return api.getCloudInfo;
                },
                get getCloudSettings() {
                    return api.getCloudSettings;
                },
                get getCloudUploadUrl() {
                    return api.getCloudUploadUrl;
                },
                get getCloudViewerKey() {
                    return api.getCloudViewerKey;
                },
                get getFamilyProfile() {
                    return api.getFamilyProfile;
                },
                get getFamilyUsage() {
                    return api.getFamilyUsage;
                },
                get getFamilyViewerKey() {
                    return api.getFamilyViewerKey;
                },
                get getUsageMyCloud() {
                    return api.getUsageMyCloud;
                },
                get getUsageZCloud() {
                    return api.getUsageZCloud;
                },
                get migrateCloudRecent() {
                    return api.migrateCloudRecent;
                },
                get resetCloudQueue() {
                    return api.resetCloudQueue;
                },
                get submitCloudMediaExtInfo() {
                    return api.submitCloudMediaExtInfo;
                },
                get submitCloudVerifyAction() {
                    return api.submitCloudVerifyAction;
                },
                get verifyCloudMedia() {
                    return api.verifyCloudMedia;
                },
            });
            this._domains.zcloud = createNamespace(this);
        }
        return this._domains.zcloud as ZcloudDomainAPI;
    }

    // =========================================================================
    // Flat API Methods (100% Backward Compatible, Lazy Memoized)
    // =========================================================================

    public get acceptFriendRequest(): ReturnType<typeof acceptFriendRequestFactory> {
        return (this._cache.acceptFriendRequest ??= acceptFriendRequestFactory(this.ctx, this)) as ReturnType<
            typeof acceptFriendRequestFactory
        >;
    }

    public get ackCloudOnboarding(): ReturnType<typeof ackCloudOnboardingFactory> {
        return (this._cache.ackCloudOnboarding ??= ackCloudOnboardingFactory(this.ctx, this)) as ReturnType<
            typeof ackCloudOnboardingFactory
        >;
    }

    public get ackDingTodo(): ReturnType<typeof ackDingTodoFactory> {
        return (this._cache.ackDingTodo ??= ackDingTodoFactory(this.ctx, this)) as ReturnType<
            typeof ackDingTodoFactory
        >;
    }

    public get addConversationLabel(): ReturnType<typeof addConversationLabelFactory> {
        return (this._cache.addConversationLabel ??= addConversationLabelFactory(this.ctx, this)) as ReturnType<
            typeof addConversationLabelFactory
        >;
    }

    public get addGroupBlockedMember(): ReturnType<typeof addGroupBlockedMemberFactory> {
        return (this._cache.addGroupBlockedMember ??= addGroupBlockedMemberFactory(this.ctx, this)) as ReturnType<
            typeof addGroupBlockedMemberFactory
        >;
    }

    public get addGroupDeputy(): ReturnType<typeof addGroupDeputyFactory> {
        return (this._cache.addGroupDeputy ??= addGroupDeputyFactory(this.ctx, this)) as ReturnType<
            typeof addGroupDeputyFactory
        >;
    }

    public get addPollOptions(): ReturnType<typeof addPollOptionsFactory> {
        return (this._cache.addPollOptions ??= addPollOptionsFactory(this.ctx, this)) as ReturnType<
            typeof addPollOptionsFactory
        >;
    }

    public get addQuickMessage(): ReturnType<typeof addQuickMessageFactory> {
        return (this._cache.addQuickMessage ??= addQuickMessageFactory(this.ctx, this)) as ReturnType<
            typeof addQuickMessageFactory
        >;
    }

    public get addReaction(): ReturnType<typeof addReactionFactory> {
        return (this._cache.addReaction ??= addReactionFactory(this.ctx, this)) as ReturnType<
            typeof addReactionFactory
        >;
    }

    public get addUnreadMark(): ReturnType<typeof addUnreadMarkFactory> {
        return (this._cache.addUnreadMark ??= addUnreadMarkFactory(this.ctx, this)) as ReturnType<
            typeof addUnreadMarkFactory
        >;
    }

    public get addUserGroupCall(): ReturnType<typeof addUserGroupCallFactory> {
        return (this._cache.addUserGroupCall ??= addUserGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof addUserGroupCallFactory
        >;
    }

    public get addUserToGroup(): ReturnType<typeof addUserToGroupFactory> {
        return (this._cache.addUserToGroup ??= addUserToGroupFactory(this.ctx, this)) as ReturnType<
            typeof addUserToGroupFactory
        >;
    }

    public get analyseGroup(): ReturnType<typeof analyseGroupFactory> {
        return (this._cache.analyseGroup ??= analyseGroupFactory(this.ctx, this)) as ReturnType<
            typeof analyseGroupFactory
        >;
    }

    public get answerAckVoiceCall(): ReturnType<typeof answerAckVoiceCallFactory> {
        return (this._cache.answerAckVoiceCall ??= answerAckVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof answerAckVoiceCallFactory
        >;
    }

    public get answerGroupCall(): ReturnType<typeof answerGroupCallFactory> {
        return (this._cache.answerGroupCall ??= answerGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof answerGroupCallFactory
        >;
    }

    public get answerVoiceCall(): ReturnType<typeof answerVoiceCallFactory> {
        return (this._cache.answerVoiceCall ??= answerVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof answerVoiceCallFactory
        >;
    }

    public get blockOA(): ReturnType<typeof blockOAFactory> {
        return (this._cache.blockOA ??= blockOAFactory(this.ctx, this)) as ReturnType<typeof blockOAFactory>;
    }

    public get blockUser(): ReturnType<typeof blockUserFactory> {
        return (this._cache.blockUser ??= blockUserFactory(this.ctx, this)) as ReturnType<typeof blockUserFactory>;
    }

    public get blockViewFeed(): ReturnType<typeof blockViewFeedFactory> {
        return (this._cache.blockViewFeed ??= blockViewFeedFactory(this.ctx, this)) as ReturnType<
            typeof blockViewFeedFactory
        >;
    }

    public get broadcastGroupCallState(): ReturnType<typeof broadcastGroupCallStateFactory> {
        return (this._cache.broadcastGroupCallState ??= broadcastGroupCallStateFactory(this.ctx, this)) as ReturnType<
            typeof broadcastGroupCallStateFactory
        >;
    }

    public get cancelGroupCall(): ReturnType<typeof cancelGroupCallFactory> {
        return (this._cache.cancelGroupCall ??= cancelGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof cancelGroupCallFactory
        >;
    }

    public get cancelPullMobile(): ReturnType<typeof cancelPullMobileFactory> {
        return (this._cache.cancelPullMobile ??= cancelPullMobileFactory(this.ctx, this)) as ReturnType<
            typeof cancelPullMobileFactory
        >;
    }

    public get cancelVoiceCall(): ReturnType<typeof cancelVoiceCallFactory> {
        return (this._cache.cancelVoiceCall ??= cancelVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof cancelVoiceCallFactory
        >;
    }

    public get changeAccountAvatar(): ReturnType<typeof changeAccountAvatarFactory> {
        return (this._cache.changeAccountAvatar ??= changeAccountAvatarFactory(this.ctx, this)) as ReturnType<
            typeof changeAccountAvatarFactory
        >;
    }

    public get changeFriendAlias(): ReturnType<typeof changeFriendAliasFactory> {
        return (this._cache.changeFriendAlias ??= changeFriendAliasFactory(this.ctx, this)) as ReturnType<
            typeof changeFriendAliasFactory
        >;
    }

    public get changeGroupAvatar(): ReturnType<typeof changeGroupAvatarFactory> {
        return (this._cache.changeGroupAvatar ??= changeGroupAvatarFactory(this.ctx, this)) as ReturnType<
            typeof changeGroupAvatarFactory
        >;
    }

    public get changeGroupName(): ReturnType<typeof changeGroupNameFactory> {
        return (this._cache.changeGroupName ??= changeGroupNameFactory(this.ctx, this)) as ReturnType<
            typeof changeGroupNameFactory
        >;
    }

    public get changeGroupOwner(): ReturnType<typeof changeGroupOwnerFactory> {
        return (this._cache.changeGroupOwner ??= changeGroupOwnerFactory(this.ctx, this)) as ReturnType<
            typeof changeGroupOwnerFactory
        >;
    }

    public get checkQuotaCommunityMember(): ReturnType<typeof checkQuotaCommunityMemberFactory> {
        return (this._cache.checkQuotaCommunityMember ??= checkQuotaCommunityMemberFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof checkQuotaCommunityMemberFactory>;
    }

    public get clearUnreadFriendRequests(): ReturnType<typeof clearUnreadFriendRequestsFactory> {
        return (this._cache.clearUnreadFriendRequests ??= clearUnreadFriendRequestsFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof clearUnreadFriendRequestsFactory>;
    }

    public get convertOAIds(): ReturnType<typeof convertOAIdsFactory> {
        return (this._cache.convertOAIds ??= convertOAIdsFactory(this.ctx, this)) as ReturnType<
            typeof convertOAIdsFactory
        >;
    }

    public get createAutoReply(): ReturnType<typeof createAutoReplyFactory> {
        return (this._cache.createAutoReply ??= createAutoReplyFactory(this.ctx, this)) as ReturnType<
            typeof createAutoReplyFactory
        >;
    }

    public get createBankAccount(): ReturnType<typeof createBankAccountFactory> {
        return (this._cache.createBankAccount ??= createBankAccountFactory(this.ctx, this)) as ReturnType<
            typeof createBankAccountFactory
        >;
    }

    public get createCatalog(): ReturnType<typeof createCatalogFactory> {
        return (this._cache.createCatalog ??= createCatalogFactory(this.ctx, this)) as ReturnType<
            typeof createCatalogFactory
        >;
    }

    public get createController(): ReturnType<typeof createControllerFactory> {
        return (this._cache.createController ??= createControllerFactory(this.ctx, this)) as ReturnType<
            typeof createControllerFactory
        >;
    }

    public get createGroup(): ReturnType<typeof createGroupFactory> {
        return (this._cache.createGroup ??= createGroupFactory(this.ctx, this)) as ReturnType<
            typeof createGroupFactory
        >;
    }

    public get createNote(): ReturnType<typeof createNoteFactory> {
        return (this._cache.createNote ??= createNoteFactory(this.ctx, this)) as ReturnType<typeof createNoteFactory>;
    }

    public get createOneOneBoardTopic(): ReturnType<typeof createOneOneBoardTopicFactory> {
        return (this._cache.createOneOneBoardTopic ??= createOneOneBoardTopicFactory(this.ctx, this)) as ReturnType<
            typeof createOneOneBoardTopicFactory
        >;
    }

    public get createPoll(): ReturnType<typeof createPollFactory> {
        return (this._cache.createPoll ??= createPollFactory(this.ctx, this)) as ReturnType<typeof createPollFactory>;
    }

    public get createProductCatalog(): ReturnType<typeof createProductCatalogFactory> {
        return (this._cache.createProductCatalog ??= createProductCatalogFactory(this.ctx, this)) as ReturnType<
            typeof createProductCatalogFactory
        >;
    }

    public get createReminder(): ReturnType<typeof createReminderFactory> {
        return (this._cache.createReminder ??= createReminderFactory(this.ctx, this)) as ReturnType<
            typeof createReminderFactory
        >;
    }

    public get createRtcSession(): ReturnType<typeof createRtcSessionFactory> {
        return (this._cache.createRtcSession ??= createRtcSessionFactory(this.ctx, this)) as ReturnType<
            typeof createRtcSessionFactory
        >;
    }

    public get createTodo(): ReturnType<typeof createTodoFactory> {
        return (this._cache.createTodo ??= createTodoFactory(this.ctx, this)) as ReturnType<typeof createTodoFactory>;
    }

    public get decryptGids(): ReturnType<typeof decryptGidsFactory> {
        return (this._cache.decryptGids ??= decryptGidsFactory(this.ctx, this)) as ReturnType<
            typeof decryptGidsFactory
        >;
    }

    public get deleteAutoReply(): ReturnType<typeof deleteAutoReplyFactory> {
        return (this._cache.deleteAutoReply ??= deleteAutoReplyFactory(this.ctx, this)) as ReturnType<
            typeof deleteAutoReplyFactory
        >;
    }

    public get deleteAvatar(): ReturnType<typeof deleteAvatarFactory> {
        return (this._cache.deleteAvatar ??= deleteAvatarFactory(this.ctx, this)) as ReturnType<
            typeof deleteAvatarFactory
        >;
    }

    public get deleteBankAccount(): ReturnType<typeof deleteBankAccountFactory> {
        return (this._cache.deleteBankAccount ??= deleteBankAccountFactory(this.ctx, this)) as ReturnType<
            typeof deleteBankAccountFactory
        >;
    }

    public get deleteCatalog(): ReturnType<typeof deleteCatalogFactory> {
        return (this._cache.deleteCatalog ??= deleteCatalogFactory(this.ctx, this)) as ReturnType<
            typeof deleteCatalogFactory
        >;
    }

    public get deleteChat(): ReturnType<typeof deleteChatFactory> {
        return (this._cache.deleteChat ??= deleteChatFactory(this.ctx, this)) as ReturnType<typeof deleteChatFactory>;
    }

    public get deleteConversationLabel(): ReturnType<typeof deleteConversationLabelFactory> {
        return (this._cache.deleteConversationLabel ??= deleteConversationLabelFactory(this.ctx, this)) as ReturnType<
            typeof deleteConversationLabelFactory
        >;
    }

    public get deleteGroupInviteBox(): ReturnType<typeof deleteGroupInviteBoxFactory> {
        return (this._cache.deleteGroupInviteBox ??= deleteGroupInviteBoxFactory(this.ctx, this)) as ReturnType<
            typeof deleteGroupInviteBoxFactory
        >;
    }

    public get deleteMessage(): ReturnType<typeof deleteMessageFactory> {
        return (this._cache.deleteMessage ??= deleteMessageFactory(this.ctx, this)) as ReturnType<
            typeof deleteMessageFactory
        >;
    }

    public get deleteMobileMsgSnapshot(): ReturnType<typeof deleteMobileMsgSnapshotFactory> {
        return (this._cache.deleteMobileMsgSnapshot ??= deleteMobileMsgSnapshotFactory(this.ctx, this)) as ReturnType<
            typeof deleteMobileMsgSnapshotFactory
        >;
    }

    public get deleteProductCatalog(): ReturnType<typeof deleteProductCatalogFactory> {
        return (this._cache.deleteProductCatalog ??= deleteProductCatalogFactory(this.ctx, this)) as ReturnType<
            typeof deleteProductCatalogFactory
        >;
    }

    public get deleteSingleProduct(): ReturnType<typeof deleteSingleProductFactory> {
        return (this._cache.deleteSingleProduct ??= deleteSingleProductFactory(this.ctx, this)) as ReturnType<
            typeof deleteSingleProductFactory
        >;
    }

    public get deleteTodo(): ReturnType<typeof deleteTodoFactory> {
        return (this._cache.deleteTodo ??= deleteTodoFactory(this.ctx, this)) as ReturnType<typeof deleteTodoFactory>;
    }

    public get dingTodo(): ReturnType<typeof dingTodoFactory> {
        return (this._cache.dingTodo ??= dingTodoFactory(this.ctx, this)) as ReturnType<typeof dingTodoFactory>;
    }

    public get disableGroupLink(): ReturnType<typeof disableGroupLinkFactory> {
        return (this._cache.disableGroupLink ??= disableGroupLinkFactory(this.ctx, this)) as ReturnType<
            typeof disableGroupLinkFactory
        >;
    }

    public get disableLimitSearchPhoneReminder(): ReturnType<typeof disableLimitSearchPhoneReminderFactory> {
        return (this._cache.disableLimitSearchPhoneReminder ??= disableLimitSearchPhoneReminderFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof disableLimitSearchPhoneReminderFactory>;
    }

    public get disperseGroup(): ReturnType<typeof disperseGroupFactory> {
        return (this._cache.disperseGroup ??= disperseGroupFactory(this.ctx, this)) as ReturnType<
            typeof disperseGroupFactory
        >;
    }

    public get downloadTransferSync(): ReturnType<typeof downloadTransferSyncFactory> {
        return (this._cache.downloadTransferSync ??= downloadTransferSyncFactory(this.ctx, this)) as ReturnType<
            typeof downloadTransferSyncFactory
        >;
    }

    public get editNote(): ReturnType<typeof editNoteFactory> {
        return (this._cache.editNote ??= editNoteFactory(this.ctx, this)) as ReturnType<typeof editNoteFactory>;
    }

    public get editReminder(): ReturnType<typeof editReminderFactory> {
        return (this._cache.editReminder ??= editReminderFactory(this.ctx, this)) as ReturnType<
            typeof editReminderFactory
        >;
    }

    public get enableGroupLink(): ReturnType<typeof enableGroupLinkFactory> {
        return (this._cache.enableGroupLink ??= enableGroupLinkFactory(this.ctx, this)) as ReturnType<
            typeof enableGroupLinkFactory
        >;
    }

    public get encryptGids(): ReturnType<typeof encryptGidsFactory> {
        return (this._cache.encryptGids ??= encryptGidsFactory(this.ctx, this)) as ReturnType<
            typeof encryptGidsFactory
        >;
    }

    public get endGroupCall(): ReturnType<typeof endGroupCallFactory> {
        return (this._cache.endGroupCall ??= endGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof endGroupCallFactory
        >;
    }

    public get endVoiceCall(): ReturnType<typeof endVoiceCallFactory> {
        return (this._cache.endVoiceCall ??= endVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof endVoiceCallFactory
        >;
    }

    public get exportSession(): ReturnType<typeof exportSessionFactory> {
        return (this._cache.exportSession ??= exportSessionFactory(this.ctx, this)) as ReturnType<
            typeof exportSessionFactory
        >;
    }

    public get fetchAccountInfo(): ReturnType<typeof fetchAccountInfoFactory> {
        return (this._cache.fetchAccountInfo ??= fetchAccountInfoFactory(this.ctx, this)) as ReturnType<
            typeof fetchAccountInfoFactory
        >;
    }

    public get fetchImportantMessages(): ReturnType<typeof fetchImportantMessagesFactory> {
        return (this._cache.fetchImportantMessages ??= fetchImportantMessagesFactory(this.ctx, this)) as ReturnType<
            typeof fetchImportantMessagesFactory
        >;
    }

    public get findUser(): ReturnType<typeof findUserFactory> {
        return (this._cache.findUser ??= findUserFactory(this.ctx, this)) as ReturnType<typeof findUserFactory>;
    }

    public get findUserByUsername(): ReturnType<typeof findUserByUsernameFactory> {
        return (this._cache.findUserByUsername ??= findUserByUsernameFactory(this.ctx, this)) as ReturnType<
            typeof findUserByUsernameFactory
        >;
    }

    public get finishGroupCall(): ReturnType<typeof finishGroupCallFactory> {
        return (this._cache.finishGroupCall ??= finishGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof finishGroupCallFactory
        >;
    }

    public get forwardMessage(): ReturnType<typeof forwardMessageFactory> {
        return (this._cache.forwardMessage ??= forwardMessageFactory(this.ctx, this)) as ReturnType<
            typeof forwardMessageFactory
        >;
    }

    public get getAIStickerList(): ReturnType<typeof getAIStickerListFactory> {
        return (this._cache.getAIStickerList ??= getAIStickerListFactory(this.ctx, this)) as ReturnType<
            typeof getAIStickerListFactory
        >;
    }

    public get getAliasList(): ReturnType<typeof getAliasListFactory> {
        return (this._cache.getAliasList ??= getAliasListFactory(this.ctx, this)) as ReturnType<
            typeof getAliasListFactory
        >;
    }

    public get getAliasListV2(): ReturnType<typeof getAliasListV2Factory> {
        return (this._cache.getAliasListV2 ??= getAliasListV2Factory(this.ctx, this)) as ReturnType<
            typeof getAliasListV2Factory
        >;
    }

    public get getAllFriends(): ReturnType<typeof getAllFriendsFactory> {
        return (this._cache.getAllFriends ??= getAllFriendsFactory(this.ctx, this)) as ReturnType<
            typeof getAllFriendsFactory
        >;
    }

    public get getAllGroups(): ReturnType<typeof getAllGroupsFactory> {
        return (this._cache.getAllGroups ??= getAllGroupsFactory(this.ctx, this)) as ReturnType<
            typeof getAllGroupsFactory
        >;
    }

    public get getArchivedChatList(): ReturnType<typeof getArchivedChatListFactory> {
        return (this._cache.getArchivedChatList ??= getArchivedChatListFactory(this.ctx, this)) as ReturnType<
            typeof getArchivedChatListFactory
        >;
    }

    public get getAutoDeleteChat(): ReturnType<typeof getAutoDeleteChatFactory> {
        return (this._cache.getAutoDeleteChat ??= getAutoDeleteChatFactory(this.ctx, this)) as ReturnType<
            typeof getAutoDeleteChatFactory
        >;
    }

    public get getAutoReplyList(): ReturnType<typeof getAutoReplyListFactory> {
        return (this._cache.getAutoReplyList ??= getAutoReplyListFactory(this.ctx, this)) as ReturnType<
            typeof getAutoReplyListFactory
        >;
    }

    public get getAvatarList(): ReturnType<typeof getAvatarListFactory> {
        return (this._cache.getAvatarList ??= getAvatarListFactory(this.ctx, this)) as ReturnType<
            typeof getAvatarListFactory
        >;
    }

    public get getAvatarUrlProfile(): ReturnType<typeof getAvatarUrlProfileFactory> {
        return (this._cache.getAvatarUrlProfile ??= getAvatarUrlProfileFactory(this.ctx, this)) as ReturnType<
            typeof getAvatarUrlProfileFactory
        >;
    }

    public get getBackupMsgInfo(): ReturnType<typeof getBackupMsgInfoFactory> {
        return (this._cache.getBackupMsgInfo ??= getBackupMsgInfoFactory(this.ctx, this)) as ReturnType<
            typeof getBackupMsgInfoFactory
        >;
    }

    public get getBizAccount(): ReturnType<typeof getBizAccountFactory> {
        return (this._cache.getBizAccount ??= getBizAccountFactory(this.ctx, this)) as ReturnType<
            typeof getBizAccountFactory
        >;
    }

    public get getBlockFriends(): ReturnType<typeof getBlockFriendsFactory> {
        return (this._cache.getBlockFriends ??= getBlockFriendsFactory(this.ctx, this)) as ReturnType<
            typeof getBlockFriendsFactory
        >;
    }

    public get getBlockSharingConversations(): ReturnType<typeof getBlockSharingConversationsFactory> {
        return (this._cache.getBlockSharingConversations ??= getBlockSharingConversationsFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof getBlockSharingConversationsFactory>;
    }

    public get getCatalogList(): ReturnType<typeof getCatalogListFactory> {
        return (this._cache.getCatalogList ??= getCatalogListFactory(this.ctx, this)) as ReturnType<
            typeof getCatalogListFactory
        >;
    }

    public get getCloseFriends(): ReturnType<typeof getCloseFriendsFactory> {
        return (this._cache.getCloseFriends ??= getCloseFriendsFactory(this.ctx, this)) as ReturnType<
            typeof getCloseFriendsFactory
        >;
    }

    public get getCloudDownloadUrls(): ReturnType<typeof getCloudDownloadUrlsFactory> {
        return (this._cache.getCloudDownloadUrls ??= getCloudDownloadUrlsFactory(this.ctx, this)) as ReturnType<
            typeof getCloudDownloadUrlsFactory
        >;
    }

    public get getCloudInfo(): ReturnType<typeof getCloudInfoFactory> {
        return (this._cache.getCloudInfo ??= getCloudInfoFactory(this.ctx, this)) as ReturnType<
            typeof getCloudInfoFactory
        >;
    }

    public get getCloudSettings(): ReturnType<typeof getCloudSettingsFactory> {
        return (this._cache.getCloudSettings ??= getCloudSettingsFactory(this.ctx, this)) as ReturnType<
            typeof getCloudSettingsFactory
        >;
    }

    public get getCloudUploadUrl(): ReturnType<typeof getCloudUploadUrlFactory> {
        return (this._cache.getCloudUploadUrl ??= getCloudUploadUrlFactory(this.ctx, this)) as ReturnType<
            typeof getCloudUploadUrlFactory
        >;
    }

    public get getCloudViewerKey(): ReturnType<typeof getCloudViewerKeyFactory> {
        return (this._cache.getCloudViewerKey ??= getCloudViewerKeyFactory(this.ctx, this)) as ReturnType<
            typeof getCloudViewerKeyFactory
        >;
    }

    public get getContext(): ReturnType<typeof getContextFactory> {
        return (this._cache.getContext ??= getContextFactory(this.ctx, this)) as ReturnType<typeof getContextFactory>;
    }

    public get getConversationMedia(): ReturnType<typeof getConversationMediaFactory> {
        return (this._cache.getConversationMedia ??= getConversationMediaFactory(this.ctx, this)) as ReturnType<
            typeof getConversationMediaFactory
        >;
    }

    public get getConvOfflineMessages(): ReturnType<typeof getConvOfflineMessagesFactory> {
        return (this._cache.getConvOfflineMessages ??= getConvOfflineMessagesFactory(this.ctx, this)) as ReturnType<
            typeof getConvOfflineMessagesFactory
        >;
    }

    public get getCookie(): ReturnType<typeof getCookieFactory> {
        return (this._cache.getCookie ??= getCookieFactory(this.ctx, this)) as ReturnType<typeof getCookieFactory>;
    }

    public get getCrossDbInfo(): ReturnType<typeof getCrossDbInfoFactory> {
        return (this._cache.getCrossDbInfo ??= getCrossDbInfoFactory(this.ctx, this)) as ReturnType<
            typeof getCrossDbInfoFactory
        >;
    }

    public get getDefaultGuggyGifs(): ReturnType<typeof getDefaultGuggyGifsFactory> {
        return (this._cache.getDefaultGuggyGifs ??= getDefaultGuggyGifsFactory(this.ctx, this)) as ReturnType<
            typeof getDefaultGuggyGifsFactory
        >;
    }

    public get getDirectMessageStatus(): ReturnType<typeof getDirectMessageStatusFactory> {
        return (this._cache.getDirectMessageStatus ??= getDirectMessageStatusFactory(this.ctx, this)) as ReturnType<
            typeof getDirectMessageStatusFactory
        >;
    }

    public get getE2eeGroupList(): ReturnType<typeof getE2eeGroupListFactory> {
        return (this._cache.getE2eeGroupList ??= getE2eeGroupListFactory(this.ctx, this)) as ReturnType<
            typeof getE2eeGroupListFactory
        >;
    }

    public get getEmojiStatusConfig(): ReturnType<typeof getEmojiStatusConfigFactory> {
        return (this._cache.getEmojiStatusConfig ??= getEmojiStatusConfigFactory(this.ctx, this)) as ReturnType<
            typeof getEmojiStatusConfigFactory
        >;
    }

    public get getEnterpriseProfiles(): ReturnType<typeof getEnterpriseProfilesFactory> {
        return (this._cache.getEnterpriseProfiles ??= getEnterpriseProfilesFactory(this.ctx, this)) as ReturnType<
            typeof getEnterpriseProfilesFactory
        >;
    }

    public get getExtraFriendInfo(): ReturnType<typeof getExtraFriendInfoFactory> {
        return (this._cache.getExtraFriendInfo ??= getExtraFriendInfoFactory(this.ctx, this)) as ReturnType<
            typeof getExtraFriendInfoFactory
        >;
    }

    public get getExtraGroupInfo(): ReturnType<typeof getExtraGroupInfoFactory> {
        return (this._cache.getExtraGroupInfo ??= getExtraGroupInfoFactory(this.ctx, this)) as ReturnType<
            typeof getExtraGroupInfoFactory
        >;
    }

    public get getFamilyProfile(): ReturnType<typeof getFamilyProfileFactory> {
        return (this._cache.getFamilyProfile ??= getFamilyProfileFactory(this.ctx, this)) as ReturnType<
            typeof getFamilyProfileFactory
        >;
    }

    public get getFamilyUsage(): ReturnType<typeof getFamilyUsageFactory> {
        return (this._cache.getFamilyUsage ??= getFamilyUsageFactory(this.ctx, this)) as ReturnType<
            typeof getFamilyUsageFactory
        >;
    }

    public get getFamilyViewerKey(): ReturnType<typeof getFamilyViewerKeyFactory> {
        return (this._cache.getFamilyViewerKey ??= getFamilyViewerKeyFactory(this.ctx, this)) as ReturnType<
            typeof getFamilyViewerKeyFactory
        >;
    }

    public get getFriendBoardList(): ReturnType<typeof getFriendBoardListFactory> {
        return (this._cache.getFriendBoardList ??= getFriendBoardListFactory(this.ctx, this)) as ReturnType<
            typeof getFriendBoardListFactory
        >;
    }

    public get getFriendOnlines(): ReturnType<typeof getFriendOnlinesFactory> {
        return (this._cache.getFriendOnlines ??= getFriendOnlinesFactory(this.ctx, this)) as ReturnType<
            typeof getFriendOnlinesFactory
        >;
    }

    public get getFriendProfilesV2(): ReturnType<typeof getFriendProfilesV2Factory> {
        return (this._cache.getFriendProfilesV2 ??= getFriendProfilesV2Factory(this.ctx, this)) as ReturnType<
            typeof getFriendProfilesV2Factory
        >;
    }

    public get getFriendRecommendations(): ReturnType<typeof getFriendRecommendationsFactory> {
        return (this._cache.getFriendRecommendations ??= getFriendRecommendationsFactory(this.ctx, this)) as ReturnType<
            typeof getFriendRecommendationsFactory
        >;
    }

    public get getFriendRequestStatus(): ReturnType<typeof getFriendRequestStatusFactory> {
        return (this._cache.getFriendRequestStatus ??= getFriendRequestStatusFactory(this.ctx, this)) as ReturnType<
            typeof getFriendRequestStatusFactory
        >;
    }

    public get getFriendsActivePCWeb(): ReturnType<typeof getFriendsActivePCWebFactory> {
        return (this._cache.getFriendsActivePCWeb ??= getFriendsActivePCWebFactory(this.ctx, this)) as ReturnType<
            typeof getFriendsActivePCWebFactory
        >;
    }

    public get getFriendsEmojiStatus(): ReturnType<typeof getFriendsEmojiStatusFactory> {
        return (this._cache.getFriendsEmojiStatus ??= getFriendsEmojiStatusFactory(this.ctx, this)) as ReturnType<
            typeof getFriendsEmojiStatusFactory
        >;
    }

    public get getFullAvatar(): ReturnType<typeof getFullAvatarFactory> {
        return (this._cache.getFullAvatar ??= getFullAvatarFactory(this.ctx, this)) as ReturnType<
            typeof getFullAvatarFactory
        >;
    }

    public get getGifCategories(): ReturnType<typeof getGifCategoriesFactory> {
        return (this._cache.getGifCategories ??= getGifCategoriesFactory(this.ctx, this)) as ReturnType<
            typeof getGifCategoriesFactory
        >;
    }

    public get getGifDictionaries(): ReturnType<typeof getGifDictionariesFactory> {
        return (this._cache.getGifDictionaries ??= getGifDictionariesFactory(this.ctx, this)) as ReturnType<
            typeof getGifDictionariesFactory
        >;
    }

    public get getGifsByCategory(): ReturnType<typeof getGifsByCategoryFactory> {
        return (this._cache.getGifsByCategory ??= getGifsByCategoryFactory(this.ctx, this)) as ReturnType<
            typeof getGifsByCategoryFactory
        >;
    }

    public get getGifsByDictionary(): ReturnType<typeof getGifsByDictionaryFactory> {
        return (this._cache.getGifsByDictionary ??= getGifsByDictionaryFactory(this.ctx, this)) as ReturnType<
            typeof getGifsByDictionaryFactory
        >;
    }

    public get getGroupBlockedMember(): ReturnType<typeof getGroupBlockedMemberFactory> {
        return (this._cache.getGroupBlockedMember ??= getGroupBlockedMemberFactory(this.ctx, this)) as ReturnType<
            typeof getGroupBlockedMemberFactory
        >;
    }

    public get getGroupCallState(): ReturnType<typeof getGroupCallStateFactory> {
        return (this._cache.getGroupCallState ??= getGroupCallStateFactory(this.ctx, this)) as ReturnType<
            typeof getGroupCallStateFactory
        >;
    }

    public get getGroupChatHistory(): ReturnType<typeof getGroupChatHistoryFactory> {
        return (this._cache.getGroupChatHistory ??= getGroupChatHistoryFactory(this.ctx, this)) as ReturnType<
            typeof getGroupChatHistoryFactory
        >;
    }

    public get getGroupCloudMessageJump(): ReturnType<typeof getGroupCloudMessageJumpFactory> {
        return (this._cache.getGroupCloudMessageJump ??= getGroupCloudMessageJumpFactory(this.ctx, this)) as ReturnType<
            typeof getGroupCloudMessageJumpFactory
        >;
    }

    public get getGroupCloudMessagePath(): ReturnType<typeof getGroupCloudMessagePathFactory> {
        return (this._cache.getGroupCloudMessagePath ??= getGroupCloudMessagePathFactory(this.ctx, this)) as ReturnType<
            typeof getGroupCloudMessagePathFactory
        >;
    }

    public get getGroupHistoryLegacy(): ReturnType<typeof getGroupHistoryLegacyFactory> {
        return (this._cache.getGroupHistoryLegacy ??= getGroupHistoryLegacyFactory(this.ctx, this)) as ReturnType<
            typeof getGroupHistoryLegacyFactory
        >;
    }

    public get getGroupInfo(): ReturnType<typeof getGroupInfoFactory> {
        return (this._cache.getGroupInfo ??= getGroupInfoFactory(this.ctx, this)) as ReturnType<
            typeof getGroupInfoFactory
        >;
    }

    public get getGroupInfoV2(): ReturnType<typeof getGroupInfoV2Factory> {
        return (this._cache.getGroupInfoV2 ??= getGroupInfoV2Factory(this.ctx, this)) as ReturnType<
            typeof getGroupInfoV2Factory
        >;
    }

    public get getGroupInviteBoxInfo(): ReturnType<typeof getGroupInviteBoxInfoFactory> {
        return (this._cache.getGroupInviteBoxInfo ??= getGroupInviteBoxInfoFactory(this.ctx, this)) as ReturnType<
            typeof getGroupInviteBoxInfoFactory
        >;
    }

    public get getGroupInviteBoxList(): ReturnType<typeof getGroupInviteBoxListFactory> {
        return (this._cache.getGroupInviteBoxList ??= getGroupInviteBoxListFactory(this.ctx, this)) as ReturnType<
            typeof getGroupInviteBoxListFactory
        >;
    }

    public get getGroupLinkDetail(): ReturnType<typeof getGroupLinkDetailFactory> {
        return (this._cache.getGroupLinkDetail ??= getGroupLinkDetailFactory(this.ctx, this)) as ReturnType<
            typeof getGroupLinkDetailFactory
        >;
    }

    public get getGroupLinkInfo(): ReturnType<typeof getGroupLinkInfoFactory> {
        return (this._cache.getGroupLinkInfo ??= getGroupLinkInfoFactory(this.ctx, this)) as ReturnType<
            typeof getGroupLinkInfoFactory
        >;
    }

    public get getGroupListV3(): ReturnType<typeof getGroupListV3Factory> {
        return (this._cache.getGroupListV3 ??= getGroupListV3Factory(this.ctx, this)) as ReturnType<
            typeof getGroupListV3Factory
        >;
    }

    public get getGroupMembersInfo(): ReturnType<typeof getGroupMembersInfoFactory> {
        return (this._cache.getGroupMembersInfo ??= getGroupMembersInfoFactory(this.ctx, this)) as ReturnType<
            typeof getGroupMembersInfoFactory
        >;
    }

    public get getGroupMessageStatus(): ReturnType<typeof getGroupMessageStatusFactory> {
        return (this._cache.getGroupMessageStatus ??= getGroupMessageStatusFactory(this.ctx, this)) as ReturnType<
            typeof getGroupMessageStatusFactory
        >;
    }

    public get getHiddenConversations(): ReturnType<typeof getHiddenConversationsFactory> {
        return (this._cache.getHiddenConversations ??= getHiddenConversationsFactory(this.ctx, this)) as ReturnType<
            typeof getHiddenConversationsFactory
        >;
    }

    public get getLabels(): ReturnType<typeof getLabelsFactory> {
        return (this._cache.getLabels ??= getLabelsFactory(this.ctx, this)) as ReturnType<typeof getLabelsFactory>;
    }

    public get getLastReadContactTab(): ReturnType<typeof getLastReadContactTabFactory> {
        return (this._cache.getLastReadContactTab ??= getLastReadContactTabFactory(this.ctx, this)) as ReturnType<
            typeof getLastReadContactTabFactory
        >;
    }

    public get getLastSeen(): ReturnType<typeof getLastSeenFactory> {
        return (this._cache.getLastSeen ??= getLastSeenFactory(this.ctx, this)) as ReturnType<
            typeof getLastSeenFactory
        >;
    }

    public get getLastSeenReaction(): ReturnType<typeof getLastSeenReactionFactory> {
        return (this._cache.getLastSeenReaction ??= getLastSeenReactionFactory(this.ctx, this)) as ReturnType<
            typeof getLastSeenReactionFactory
        >;
    }

    public get getListBank(): ReturnType<typeof getListBankFactory> {
        return (this._cache.getListBank ??= getListBankFactory(this.ctx, this)) as ReturnType<
            typeof getListBankFactory
        >;
    }

    public get getListBankAccount(): ReturnType<typeof getListBankAccountFactory> {
        return (this._cache.getListBankAccount ??= getListBankAccountFactory(this.ctx, this)) as ReturnType<
            typeof getListBankAccountFactory
        >;
    }

    public get getListBoard(): ReturnType<typeof getListBoardFactory> {
        return (this._cache.getListBoard ??= getListBoardFactory(this.ctx, this)) as ReturnType<
            typeof getListBoardFactory
        >;
    }

    public get getListDevice(): ReturnType<typeof getListDeviceFactory> {
        return (this._cache.getListDevice ??= getListDeviceFactory(this.ctx, this)) as ReturnType<
            typeof getListDeviceFactory
        >;
    }

    public get getListOneOneBoard(): ReturnType<typeof getListOneOneBoardFactory> {
        return (this._cache.getListOneOneBoard ??= getListOneOneBoardFactory(this.ctx, this)) as ReturnType<
            typeof getListOneOneBoardFactory
        >;
    }

    public get getListPinTopics(): ReturnType<typeof getListPinTopicsFactory> {
        return (this._cache.getListPinTopics ??= getListPinTopicsFactory(this.ctx, this)) as ReturnType<
            typeof getListPinTopicsFactory
        >;
    }

    public get getListReminder(): ReturnType<typeof getListReminderFactory> {
        return (this._cache.getListReminder ??= getListReminderFactory(this.ctx, this)) as ReturnType<
            typeof getListReminderFactory
        >;
    }

    public get getMediaStorePreview(): ReturnType<typeof getMediaStorePreviewFactory> {
        return (this._cache.getMediaStorePreview ??= getMediaStorePreviewFactory(this.ctx, this)) as ReturnType<
            typeof getMediaStorePreviewFactory
        >;
    }

    public get getMessageEffectById(): ReturnType<typeof getMessageEffectByIdFactory> {
        return (this._cache.getMessageEffectById ??= getMessageEffectByIdFactory(this.ctx, this)) as ReturnType<
            typeof getMessageEffectByIdFactory
        >;
    }

    public get getMessageEffects(): ReturnType<typeof getMessageEffectsFactory> {
        return (this._cache.getMessageEffects ??= getMessageEffectsFactory(this.ctx, this)) as ReturnType<
            typeof getMessageEffectsFactory
        >;
    }

    public get getMiniProfile(): ReturnType<typeof getMiniProfileFactory> {
        return (this._cache.getMiniProfile ??= getMiniProfileFactory(this.ctx, this)) as ReturnType<
            typeof getMiniProfileFactory
        >;
    }

    public get getMultiGroupCloudMessages(): ReturnType<typeof getMultiGroupCloudMessagesFactory> {
        return (this._cache.getMultiGroupCloudMessages ??= getMultiGroupCloudMessagesFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof getMultiGroupCloudMessagesFactory>;
    }

    public get getMultiUserQRCodes(): ReturnType<typeof getMultiUserQRCodesFactory> {
        return (this._cache.getMultiUserQRCodes ??= getMultiUserQRCodesFactory(this.ctx, this)) as ReturnType<
            typeof getMultiUserQRCodesFactory
        >;
    }

    public get getMultiUsersByPhones(): ReturnType<typeof getMultiUsersByPhonesFactory> {
        return (this._cache.getMultiUsersByPhones ??= getMultiUsersByPhonesFactory(this.ctx, this)) as ReturnType<
            typeof getMultiUsersByPhonesFactory
        >;
    }

    public get getMute(): ReturnType<typeof getMuteFactory> {
        return (this._cache.getMute ??= getMuteFactory(this.ctx, this)) as ReturnType<typeof getMuteFactory>;
    }

    public get getNoisedIds(): ReturnType<typeof getNoisedIdsFactory> {
        return (this._cache.getNoisedIds ??= getNoisedIdsFactory(this.ctx, this)) as ReturnType<
            typeof getNoisedIdsFactory
        >;
    }

    public get getOAProfile(): ReturnType<typeof getOAProfileFactory> {
        return (this._cache.getOAProfile ??= getOAProfileFactory(this.ctx, this)) as ReturnType<
            typeof getOAProfileFactory
        >;
    }

    public get getOwnId(): ReturnType<typeof getOwnIdFactory> {
        return (this._cache.getOwnId ??= getOwnIdFactory(this.ctx, this)) as ReturnType<typeof getOwnIdFactory>;
    }

    public get getPendingGroupMembers(): ReturnType<typeof getPendingGroupMembersFactory> {
        return (this._cache.getPendingGroupMembers ??= getPendingGroupMembersFactory(this.ctx, this)) as ReturnType<
            typeof getPendingGroupMembersFactory
        >;
    }

    public get getPersonalizedStickerList(): ReturnType<typeof getPersonalizedStickerListFactory> {
        return (this._cache.getPersonalizedStickerList ??= getPersonalizedStickerListFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof getPersonalizedStickerListFactory>;
    }

    public get getPersonalMedia(): ReturnType<typeof getPersonalMediaFactory> {
        return (this._cache.getPersonalMedia ??= getPersonalMediaFactory(this.ctx, this)) as ReturnType<
            typeof getPersonalMediaFactory
        >;
    }

    public get getPersonalMediaPreview(): ReturnType<typeof getPersonalMediaPreviewFactory> {
        return (this._cache.getPersonalMediaPreview ??= getPersonalMediaPreviewFactory(this.ctx, this)) as ReturnType<
            typeof getPersonalMediaPreviewFactory
        >;
    }

    public get getPhonebookV2(): ReturnType<typeof getPhonebookV2Factory> {
        return (this._cache.getPhonebookV2 ??= getPhonebookV2Factory(this.ctx, this)) as ReturnType<
            typeof getPhonebookV2Factory
        >;
    }

    public get getPinConversations(): ReturnType<typeof getPinConversationsFactory> {
        return (this._cache.getPinConversations ??= getPinConversationsFactory(this.ctx, this)) as ReturnType<
            typeof getPinConversationsFactory
        >;
    }

    public get getPollDetail(): ReturnType<typeof getPollDetailFactory> {
        return (this._cache.getPollDetail ??= getPollDetailFactory(this.ctx, this)) as ReturnType<
            typeof getPollDetailFactory
        >;
    }

    public get getProductCatalogList(): ReturnType<typeof getProductCatalogListFactory> {
        return (this._cache.getProductCatalogList ??= getProductCatalogListFactory(this.ctx, this)) as ReturnType<
            typeof getProductCatalogListFactory
        >;
    }

    public get getProductDetail(): ReturnType<typeof getProductDetailFactory> {
        return (this._cache.getProductDetail ??= getProductDetailFactory(this.ctx, this)) as ReturnType<
            typeof getProductDetailFactory
        >;
    }

    public get getProfileExtra(): ReturnType<typeof getProfileExtraFactory> {
        return (this._cache.getProfileExtra ??= getProfileExtraFactory(this.ctx, this)) as ReturnType<
            typeof getProfileExtraFactory
        >;
    }

    public get getProfileRank(): ReturnType<typeof getProfileRankFactory> {
        return (this._cache.getProfileRank ??= getProfileRankFactory(this.ctx, this)) as ReturnType<
            typeof getProfileRankFactory
        >;
    }

    public get getProfileVerificationStatus(): ReturnType<typeof getProfileVerificationStatusFactory> {
        return (this._cache.getProfileVerificationStatus ??= getProfileVerificationStatusFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof getProfileVerificationStatusFactory>;
    }

    public get getQR(): ReturnType<typeof getQRFactory> {
        return (this._cache.getQR ??= getQRFactory(this.ctx, this)) as ReturnType<typeof getQRFactory>;
    }

    public get getQuickMessageList(): ReturnType<typeof getQuickMessageListFactory> {
        return (this._cache.getQuickMessageList ??= getQuickMessageListFactory(this.ctx, this)) as ReturnType<
            typeof getQuickMessageListFactory
        >;
    }

    public get getQuotaCommunity(): ReturnType<typeof getQuotaCommunityFactory> {
        return (this._cache.getQuotaCommunity ??= getQuotaCommunityFactory(this.ctx, this)) as ReturnType<
            typeof getQuotaCommunityFactory
        >;
    }

    public get getRecentSearchList(): ReturnType<typeof getRecentSearchListFactory> {
        return (this._cache.getRecentSearchList ??= getRecentSearchListFactory(this.ctx, this)) as ReturnType<
            typeof getRecentSearchListFactory
        >;
    }

    public get getRecommendedStickers(): ReturnType<typeof getRecommendedStickersFactory> {
        return (this._cache.getRecommendedStickers ??= getRecommendedStickersFactory(this.ctx, this)) as ReturnType<
            typeof getRecommendedStickersFactory
        >;
    }

    public get getRelatedFriendGroup(): ReturnType<typeof getRelatedFriendGroupFactory> {
        return (this._cache.getRelatedFriendGroup ??= getRelatedFriendGroupFactory(this.ctx, this)) as ReturnType<
            typeof getRelatedFriendGroupFactory
        >;
    }

    public get getReminder(): ReturnType<typeof getReminderFactory> {
        return (this._cache.getReminder ??= getReminderFactory(this.ctx, this)) as ReturnType<
            typeof getReminderFactory
        >;
    }

    public get getReminderResponses(): ReturnType<typeof getReminderResponsesFactory> {
        return (this._cache.getReminderResponses ??= getReminderResponsesFactory(this.ctx, this)) as ReturnType<
            typeof getReminderResponsesFactory
        >;
    }

    public get getSentFriendRequest(): ReturnType<typeof getSentFriendRequestFactory> {
        return (this._cache.getSentFriendRequest ??= getSentFriendRequestFactory(this.ctx, this)) as ReturnType<
            typeof getSentFriendRequestFactory
        >;
    }

    public get getSettings(): ReturnType<typeof getSettingsFactory> {
        return (this._cache.getSettings ??= getSettingsFactory(this.ctx, this)) as ReturnType<
            typeof getSettingsFactory
        >;
    }

    public get getStickerCategoriesV2(): ReturnType<typeof getStickerCategoriesV2Factory> {
        return (this._cache.getStickerCategoriesV2 ??= getStickerCategoriesV2Factory(this.ctx, this)) as ReturnType<
            typeof getStickerCategoriesV2Factory
        >;
    }

    public get getStickerCategoryData(): ReturnType<typeof getStickerCategoryDataFactory> {
        return (this._cache.getStickerCategoryData ??= getStickerCategoryDataFactory(this.ctx, this)) as ReturnType<
            typeof getStickerCategoryDataFactory
        >;
    }

    public get getStickerCategoryDetail(): ReturnType<typeof getStickerCategoryDetailFactory> {
        return (this._cache.getStickerCategoryDetail ??= getStickerCategoryDetailFactory(this.ctx, this)) as ReturnType<
            typeof getStickerCategoryDetailFactory
        >;
    }

    public get getStickerHello(): ReturnType<typeof getStickerHelloFactory> {
        return (this._cache.getStickerHello ??= getStickerHelloFactory(this.ctx, this)) as ReturnType<
            typeof getStickerHelloFactory
        >;
    }

    public get getStickers(): ReturnType<typeof getStickersFactory> {
        return (this._cache.getStickers ??= getStickersFactory(this.ctx, this)) as ReturnType<
            typeof getStickersFactory
        >;
    }

    public get getStickersDetail(): ReturnType<typeof getStickersDetailFactory> {
        return (this._cache.getStickersDetail ??= getStickersDetailFactory(this.ctx, this)) as ReturnType<
            typeof getStickersDetailFactory
        >;
    }

    public get getStickerSuggestion(): ReturnType<typeof getStickerSuggestionFactory> {
        return (this._cache.getStickerSuggestion ??= getStickerSuggestionFactory(this.ctx, this)) as ReturnType<
            typeof getStickerSuggestionFactory
        >;
    }

    public get getStickerSuggestKeywords(): ReturnType<typeof getStickerSuggestKeywordsFactory> {
        return (this._cache.getStickerSuggestKeywords ??= getStickerSuggestKeywordsFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof getStickerSuggestKeywordsFactory>;
    }

    public get getSuggestedConversations(): ReturnType<typeof getSuggestedConversationsFactory> {
        return (this._cache.getSuggestedConversations ??= getSuggestedConversationsFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof getSuggestedConversationsFactory>;
    }

    public get getSyncData(): ReturnType<typeof getSyncDataFactory> {
        return (this._cache.getSyncData ??= getSyncDataFactory(this.ctx, this)) as ReturnType<
            typeof getSyncDataFactory
        >;
    }

    public get getTenorStickerMapping(): ReturnType<typeof getTenorStickerMappingFactory> {
        return (this._cache.getTenorStickerMapping ??= getTenorStickerMappingFactory(this.ctx, this)) as ReturnType<
            typeof getTenorStickerMappingFactory
        >;
    }

    public get getTodoDetail(): ReturnType<typeof getTodoDetailFactory> {
        return (this._cache.getTodoDetail ??= getTodoDetailFactory(this.ctx, this)) as ReturnType<
            typeof getTodoDetailFactory
        >;
    }

    public get getTodoList(): ReturnType<typeof getTodoListFactory> {
        return (this._cache.getTodoList ??= getTodoListFactory(this.ctx, this)) as ReturnType<
            typeof getTodoListFactory
        >;
    }

    public get getTranslateSetting(): ReturnType<typeof getTranslateSettingFactory> {
        return (this._cache.getTranslateSetting ??= getTranslateSettingFactory(this.ctx, this)) as ReturnType<
            typeof getTranslateSettingFactory
        >;
    }

    public get getTrendingGifs(): ReturnType<typeof getTrendingGifsFactory> {
        return (this._cache.getTrendingGifs ??= getTrendingGifsFactory(this.ctx, this)) as ReturnType<
            typeof getTrendingGifsFactory
        >;
    }

    public get getUnreadMark(): ReturnType<typeof getUnreadMarkFactory> {
        return (this._cache.getUnreadMark ??= getUnreadMarkFactory(this.ctx, this)) as ReturnType<
            typeof getUnreadMarkFactory
        >;
    }

    public get getUsageMyCloud(): ReturnType<typeof getUsageMyCloudFactory> {
        return (this._cache.getUsageMyCloud ??= getUsageMyCloudFactory(this.ctx, this)) as ReturnType<
            typeof getUsageMyCloudFactory
        >;
    }

    public get getUsageZCloud(): ReturnType<typeof getUsageZCloudFactory> {
        return (this._cache.getUsageZCloud ??= getUsageZCloudFactory(this.ctx, this)) as ReturnType<
            typeof getUsageZCloudFactory
        >;
    }

    public get getUserInfo(): ReturnType<typeof getUserInfoFactory> {
        return (this._cache.getUserInfo ??= getUserInfoFactory(this.ctx, this)) as ReturnType<
            typeof getUserInfoFactory
        >;
    }

    public get holdVoiceCall(): ReturnType<typeof holdVoiceCallFactory> {
        return (this._cache.holdVoiceCall ??= holdVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof holdVoiceCallFactory
        >;
    }

    public get inviteUserToGroups(): ReturnType<typeof inviteUserToGroupsFactory> {
        return (this._cache.inviteUserToGroups ??= inviteUserToGroupsFactory(this.ctx, this)) as ReturnType<
            typeof inviteUserToGroupsFactory
        >;
    }

    public get joinGroupCall(): ReturnType<typeof joinGroupCallFactory> {
        return (this._cache.joinGroupCall ??= joinGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof joinGroupCallFactory
        >;
    }

    public get joinGroupInviteBox(): ReturnType<typeof joinGroupInviteBoxFactory> {
        return (this._cache.joinGroupInviteBox ??= joinGroupInviteBoxFactory(this.ctx, this)) as ReturnType<
            typeof joinGroupInviteBoxFactory
        >;
    }

    public get joinGroupLink(): ReturnType<typeof joinGroupLinkFactory> {
        return (this._cache.joinGroupLink ??= joinGroupLinkFactory(this.ctx, this)) as ReturnType<
            typeof joinGroupLinkFactory
        >;
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

    public get logEndVoiceCall(): ReturnType<typeof logEndVoiceCallFactory> {
        return (this._cache.logEndVoiceCall ??= logEndVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof logEndVoiceCallFactory
        >;
    }

    public get lostFocus(): ReturnType<typeof lostFocusFactory> {
        return (this._cache.lostFocus ??= lostFocusFactory(this.ctx, this)) as ReturnType<typeof lostFocusFactory>;
    }

    public get markSubTabSeen(): ReturnType<typeof markSubTabSeenFactory> {
        return (this._cache.markSubTabSeen ??= markSubTabSeenFactory(this.ctx, this)) as ReturnType<
            typeof markSubTabSeenFactory
        >;
    }

    public get migrateCloudRecent(): ReturnType<typeof migrateCloudRecentFactory> {
        return (this._cache.migrateCloudRecent ??= migrateCloudRecentFactory(this.ctx, this)) as ReturnType<
            typeof migrateCloudRecentFactory
        >;
    }

    public get multiUnpinBoardTopics(): ReturnType<typeof multiUnpinBoardTopicsFactory> {
        return (this._cache.multiUnpinBoardTopics ??= multiUnpinBoardTopicsFactory(this.ctx, this)) as ReturnType<
            typeof multiUnpinBoardTopicsFactory
        >;
    }

    public get notifyGroupCall(): ReturnType<typeof notifyGroupCallFactory> {
        return (this._cache.notifyGroupCall ??= notifyGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof notifyGroupCallFactory
        >;
    }

    public get parseLink(): ReturnType<typeof parseLinkFactory> {
        return (this._cache.parseLink ??= parseLinkFactory(this.ctx, this)) as ReturnType<typeof parseLinkFactory>;
    }

    public get pinBoardTopic(): ReturnType<typeof pinBoardTopicFactory> {
        return (this._cache.pinBoardTopic ??= pinBoardTopicFactory(this.ctx, this)) as ReturnType<
            typeof pinBoardTopicFactory
        >;
    }

    public get pinFriendMessage(): ReturnType<typeof pinFriendMessageFactory> {
        return (this._cache.pinFriendMessage ??= pinFriendMessageFactory(this.ctx, this)) as ReturnType<
            typeof pinFriendMessageFactory
        >;
    }

    public get pingGroupCall(): ReturnType<typeof pingGroupCallFactory> {
        return (this._cache.pingGroupCall ??= pingGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof pingGroupCallFactory
        >;
    }

    public get preloadConversations(): ReturnType<typeof preloadConversationsFactory> {
        return (this._cache.preloadConversations ??= preloadConversationsFactory(this.ctx, this)) as ReturnType<
            typeof preloadConversationsFactory
        >;
    }

    public get pullMobile(): ReturnType<typeof pullMobileFactory> {
        return (this._cache.pullMobile ??= pullMobileFactory(this.ctx, this)) as ReturnType<typeof pullMobileFactory>;
    }

    public get pushProfileVerificationMessage(): ReturnType<typeof pushProfileVerificationMessageFactory> {
        return (this._cache.pushProfileVerificationMessage ??= pushProfileVerificationMessageFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof pushProfileVerificationMessageFactory>;
    }

    public get readContactTab(): ReturnType<typeof readContactTabFactory> {
        return (this._cache.readContactTab ??= readContactTabFactory(this.ctx, this)) as ReturnType<
            typeof readContactTabFactory
        >;
    }

    public get registerCatalog(): ReturnType<typeof registerCatalogFactory> {
        return (this._cache.registerCatalog ??= registerCatalogFactory(this.ctx, this)) as ReturnType<
            typeof registerCatalogFactory
        >;
    }

    public get registerTrialBizAccount(): ReturnType<typeof registerTrialBizAccountFactory> {
        return (this._cache.registerTrialBizAccount ??= registerTrialBizAccountFactory(this.ctx, this)) as ReturnType<
            typeof registerTrialBizAccountFactory
        >;
    }

    public get rejectFriendRequest(): ReturnType<typeof rejectFriendRequestFactory> {
        return (this._cache.rejectFriendRequest ??= rejectFriendRequestFactory(this.ctx, this)) as ReturnType<
            typeof rejectFriendRequestFactory
        >;
    }

    public get removeBoardTopic(): ReturnType<typeof removeBoardTopicFactory> {
        return (this._cache.removeBoardTopic ??= removeBoardTopicFactory(this.ctx, this)) as ReturnType<
            typeof removeBoardTopicFactory
        >;
    }

    public get removeConversationMedia(): ReturnType<typeof removeConversationMediaFactory> {
        return (this._cache.removeConversationMedia ??= removeConversationMediaFactory(this.ctx, this)) as ReturnType<
            typeof removeConversationMediaFactory
        >;
    }

    public get removeFriend(): ReturnType<typeof removeFriendFactory> {
        return (this._cache.removeFriend ??= removeFriendFactory(this.ctx, this)) as ReturnType<
            typeof removeFriendFactory
        >;
    }

    public get removeFriendAlias(): ReturnType<typeof removeFriendAliasFactory> {
        return (this._cache.removeFriendAlias ??= removeFriendAliasFactory(this.ctx, this)) as ReturnType<
            typeof removeFriendAliasFactory
        >;
    }

    public get removeFriendRecommendation(): ReturnType<typeof removeFriendRecommendationFactory> {
        return (this._cache.removeFriendRecommendation ??= removeFriendRecommendationFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof removeFriendRecommendationFactory>;
    }

    public get removeFriendRecommendationV2(): ReturnType<typeof removeFriendRecommendationV2Factory> {
        return (this._cache.removeFriendRecommendationV2 ??= removeFriendRecommendationV2Factory(
            this.ctx,
            this,
        )) as ReturnType<typeof removeFriendRecommendationV2Factory>;
    }

    public get removeGroupBlockedMember(): ReturnType<typeof removeGroupBlockedMemberFactory> {
        return (this._cache.removeGroupBlockedMember ??= removeGroupBlockedMemberFactory(this.ctx, this)) as ReturnType<
            typeof removeGroupBlockedMemberFactory
        >;
    }

    public get removeGroupDeputy(): ReturnType<typeof removeGroupDeputyFactory> {
        return (this._cache.removeGroupDeputy ??= removeGroupDeputyFactory(this.ctx, this)) as ReturnType<
            typeof removeGroupDeputyFactory
        >;
    }

    public get removeGroupTopic(): ReturnType<typeof removeGroupTopicFactory> {
        return (this._cache.removeGroupTopic ??= removeGroupTopicFactory(this.ctx, this)) as ReturnType<
            typeof removeGroupTopicFactory
        >;
    }

    public get removeOneOneBoardTopic(): ReturnType<typeof removeOneOneBoardTopicFactory> {
        return (this._cache.removeOneOneBoardTopic ??= removeOneOneBoardTopicFactory(this.ctx, this)) as ReturnType<
            typeof removeOneOneBoardTopicFactory
        >;
    }

    public get removePersonalMedia(): ReturnType<typeof removePersonalMediaFactory> {
        return (this._cache.removePersonalMedia ??= removePersonalMediaFactory(this.ctx, this)) as ReturnType<
            typeof removePersonalMediaFactory
        >;
    }

    public get removeQuickMessage(): ReturnType<typeof removeQuickMessageFactory> {
        return (this._cache.removeQuickMessage ??= removeQuickMessageFactory(this.ctx, this)) as ReturnType<
            typeof removeQuickMessageFactory
        >;
    }

    public get removeReminder(): ReturnType<typeof removeReminderFactory> {
        return (this._cache.removeReminder ??= removeReminderFactory(this.ctx, this)) as ReturnType<
            typeof removeReminderFactory
        >;
    }

    public get removeUnreadMark(): ReturnType<typeof removeUnreadMarkFactory> {
        return (this._cache.removeUnreadMark ??= removeUnreadMarkFactory(this.ctx, this)) as ReturnType<
            typeof removeUnreadMarkFactory
        >;
    }

    public get removeUserFromGroup(): ReturnType<typeof removeUserFromGroupFactory> {
        return (this._cache.removeUserFromGroup ??= removeUserFromGroupFactory(this.ctx, this)) as ReturnType<
            typeof removeUserFromGroupFactory
        >;
    }

    public get removeUserFromGroups(): ReturnType<typeof removeUserFromGroupsFactory> {
        return (this._cache.removeUserFromGroups ??= removeUserFromGroupsFactory(this.ctx, this)) as ReturnType<
            typeof removeUserFromGroupsFactory
        >;
    }

    public get renewMessageLink(): ReturnType<typeof renewMessageLinkFactory> {
        return (this._cache.renewMessageLink ??= renewMessageLinkFactory(this.ctx, this)) as ReturnType<
            typeof renewMessageLinkFactory
        >;
    }

    public get reorderConversationLabels(): ReturnType<typeof reorderConversationLabelsFactory> {
        return (this._cache.reorderConversationLabels ??= reorderConversationLabelsFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof reorderConversationLabelsFactory>;
    }

    public get reorderFriendBoard(): ReturnType<typeof reorderFriendBoardFactory> {
        return (this._cache.reorderFriendBoard ??= reorderFriendBoardFactory(this.ctx, this)) as ReturnType<
            typeof reorderFriendBoardFactory
        >;
    }

    public get reorderPinTopics(): ReturnType<typeof reorderPinTopicsFactory> {
        return (this._cache.reorderPinTopics ??= reorderPinTopicsFactory(this.ctx, this)) as ReturnType<
            typeof reorderPinTopicsFactory
        >;
    }

    public get requestAudioToVideoCall(): ReturnType<typeof requestAudioToVideoCallFactory> {
        return (this._cache.requestAudioToVideoCall ??= requestAudioToVideoCallFactory(this.ctx, this)) as ReturnType<
            typeof requestAudioToVideoCallFactory
        >;
    }

    public get requestGroupCall(): ReturnType<typeof requestGroupCallFactory> {
        return (this._cache.requestGroupCall ??= requestGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof requestGroupCallFactory
        >;
    }

    public get requestShareScreenCall(): ReturnType<typeof requestShareScreenCallFactory> {
        return (this._cache.requestShareScreenCall ??= requestShareScreenCallFactory(this.ctx, this)) as ReturnType<
            typeof requestShareScreenCallFactory
        >;
    }

    public get requestSyncFromPhone(): ReturnType<typeof requestSyncFromPhoneFactory> {
        return (this._cache.requestSyncFromPhone ??= requestSyncFromPhoneFactory(this.ctx, this)) as ReturnType<
            typeof requestSyncFromPhoneFactory
        >;
    }

    public get requestVoiceCall(): ReturnType<typeof requestVoiceCallFactory> {
        return (this._cache.requestVoiceCall ??= requestVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof requestVoiceCallFactory
        >;
    }

    public get resetCloudQueue(): ReturnType<typeof resetCloudQueueFactory> {
        return (this._cache.resetCloudQueue ??= resetCloudQueueFactory(this.ctx, this)) as ReturnType<
            typeof resetCloudQueueFactory
        >;
    }

    public get resetHiddenConversPin(): ReturnType<typeof resetHiddenConversPinFactory> {
        return (this._cache.resetHiddenConversPin ??= resetHiddenConversPinFactory(this.ctx, this)) as ReturnType<
            typeof resetHiddenConversPinFactory
        >;
    }

    public get respondReminder(): ReturnType<typeof respondReminderFactory> {
        return (this._cache.respondReminder ??= respondReminderFactory(this.ctx, this)) as ReturnType<
            typeof respondReminderFactory
        >;
    }

    public get reuseAvatar(): ReturnType<typeof reuseAvatarFactory> {
        return (this._cache.reuseAvatar ??= reuseAvatarFactory(this.ctx, this)) as ReturnType<
            typeof reuseAvatarFactory
        >;
    }

    public get reviewPendingMemberRequest(): ReturnType<typeof reviewPendingMemberRequestFactory> {
        return (this._cache.reviewPendingMemberRequest ??= reviewPendingMemberRequestFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof reviewPendingMemberRequestFactory>;
    }

    public get ringRingGroupCall(): ReturnType<typeof ringRingGroupCallFactory> {
        return (this._cache.ringRingGroupCall ??= ringRingGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof ringRingGroupCallFactory
        >;
    }

    public get ringRingVoiceCall(): ReturnType<typeof ringRingVoiceCallFactory> {
        return (this._cache.ringRingVoiceCall ??= ringRingVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof ringRingVoiceCallFactory
        >;
    }

    public get scanURL(): ReturnType<typeof scanURLFactory> {
        return (this._cache.scanURL ??= scanURLFactory(this.ctx, this)) as ReturnType<typeof scanURLFactory>;
    }

    public get searchGifs(): ReturnType<typeof searchGifsFactory> {
        return (this._cache.searchGifs ??= searchGifsFactory(this.ctx, this)) as ReturnType<typeof searchGifsFactory>;
    }

    public get searchGuggyGifs(): ReturnType<typeof searchGuggyGifsFactory> {
        return (this._cache.searchGuggyGifs ??= searchGuggyGifsFactory(this.ctx, this)) as ReturnType<
            typeof searchGuggyGifsFactory
        >;
    }

    public get searchSticker(): ReturnType<typeof searchStickerFactory> {
        return (this._cache.searchSticker ??= searchStickerFactory(this.ctx, this)) as ReturnType<
            typeof searchStickerFactory
        >;
    }

    public get sendBankCard(): ReturnType<typeof sendBankCardFactory> {
        return (this._cache.sendBankCard ??= sendBankCardFactory(this.ctx, this)) as ReturnType<
            typeof sendBankCardFactory
        >;
    }

    public get sendCard(): ReturnType<typeof sendCardFactory> {
        return (this._cache.sendCard ??= sendCardFactory(this.ctx, this)) as ReturnType<typeof sendCardFactory>;
    }

    public get sendDeliveredEvent(): ReturnType<typeof sendDeliveredEventFactory> {
        return (this._cache.sendDeliveredEvent ??= sendDeliveredEventFactory(this.ctx, this)) as ReturnType<
            typeof sendDeliveredEventFactory
        >;
    }

    public get sendFriendRequest(): ReturnType<typeof sendFriendRequestFactory> {
        return (this._cache.sendFriendRequest ??= sendFriendRequestFactory(this.ctx, this)) as ReturnType<
            typeof sendFriendRequestFactory
        >;
    }

    public get sendLink(): ReturnType<typeof sendLinkFactory> {
        return (this._cache.sendLink ??= sendLinkFactory(this.ctx, this)) as ReturnType<typeof sendLinkFactory>;
    }

    public get sendMessage(): ReturnType<typeof sendMessageFactory> {
        return (this._cache.sendMessage ??= sendMessageFactory(this.ctx, this)) as ReturnType<
            typeof sendMessageFactory
        >;
    }

    public get sendReport(): ReturnType<typeof sendReportFactory> {
        return (this._cache.sendReport ??= sendReportFactory(this.ctx, this)) as ReturnType<typeof sendReportFactory>;
    }

    public get sendRequestGroupCall(): ReturnType<typeof sendRequestGroupCallFactory> {
        return (this._cache.sendRequestGroupCall ??= sendRequestGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof sendRequestGroupCallFactory
        >;
    }

    public get sendRequestVoiceCall(): ReturnType<typeof sendRequestVoiceCallFactory> {
        return (this._cache.sendRequestVoiceCall ??= sendRequestVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof sendRequestVoiceCallFactory
        >;
    }

    public get sendSeenEvent(): ReturnType<typeof sendSeenEventFactory> {
        return (this._cache.sendSeenEvent ??= sendSeenEventFactory(this.ctx, this)) as ReturnType<
            typeof sendSeenEventFactory
        >;
    }

    public get sendSticker(): ReturnType<typeof sendStickerFactory> {
        return (this._cache.sendSticker ??= sendStickerFactory(this.ctx, this)) as ReturnType<
            typeof sendStickerFactory
        >;
    }

    public get sendTypingEvent(): ReturnType<typeof sendTypingEventFactory> {
        return (this._cache.sendTypingEvent ??= sendTypingEventFactory(this.ctx, this)) as ReturnType<
            typeof sendTypingEventFactory
        >;
    }

    public get sendVideo(): ReturnType<typeof sendVideoFactory> {
        return (this._cache.sendVideo ??= sendVideoFactory(this.ctx, this)) as ReturnType<typeof sendVideoFactory>;
    }

    public get sendVoice(): ReturnType<typeof sendVoiceFactory> {
        return (this._cache.sendVoice ??= sendVoiceFactory(this.ctx, this)) as ReturnType<typeof sendVoiceFactory>;
    }

    public get sendVoiceCall(): ReturnType<typeof sendVoiceCallFactory> {
        return (this._cache.sendVoiceCall ??= sendVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof sendVoiceCallFactory
        >;
    }

    public get setHiddenConversations(): ReturnType<typeof setHiddenConversationsFactory> {
        return (this._cache.setHiddenConversations ??= setHiddenConversationsFactory(this.ctx, this)) as ReturnType<
            typeof setHiddenConversationsFactory
        >;
    }

    public get setMute(): ReturnType<typeof setMuteFactory> {
        return (this._cache.setMute ??= setMuteFactory(this.ctx, this)) as ReturnType<typeof setMuteFactory>;
    }

    public get setPinnedConversations(): ReturnType<typeof setPinnedConversationsFactory> {
        return (this._cache.setPinnedConversations ??= setPinnedConversationsFactory(this.ctx, this)) as ReturnType<
            typeof setPinnedConversationsFactory
        >;
    }

    public get sharePoll(): ReturnType<typeof sharePollFactory> {
        return (this._cache.sharePoll ??= sharePollFactory(this.ctx, this)) as ReturnType<typeof sharePollFactory>;
    }

    public get shareScreenGroupCall(): ReturnType<typeof shareScreenGroupCallFactory> {
        return (this._cache.shareScreenGroupCall ??= shareScreenGroupCallFactory(this.ctx, this)) as ReturnType<
            typeof shareScreenGroupCallFactory
        >;
    }

    public get submitCloudMediaExtInfo(): ReturnType<typeof submitCloudMediaExtInfoFactory> {
        return (this._cache.submitCloudMediaExtInfo ??= submitCloudMediaExtInfoFactory(this.ctx, this)) as ReturnType<
            typeof submitCloudMediaExtInfoFactory
        >;
    }

    public get submitCloudVerifyAction(): ReturnType<typeof submitCloudVerifyActionFactory> {
        return (this._cache.submitCloudVerifyAction ??= submitCloudVerifyActionFactory(this.ctx, this)) as ReturnType<
            typeof submitCloudVerifyActionFactory
        >;
    }

    public get submitSyncMediaActions(): ReturnType<typeof submitSyncMediaActionsFactory> {
        return (this._cache.submitSyncMediaActions ??= submitSyncMediaActionsFactory(this.ctx, this)) as ReturnType<
            typeof submitSyncMediaActionsFactory
        >;
    }

    public get translateMessage(): ReturnType<typeof translateMessageFactory> {
        return (this._cache.translateMessage ??= translateMessageFactory(this.ctx, this)) as ReturnType<
            typeof translateMessageFactory
        >;
    }

    public get translateMessageAuto(): ReturnType<typeof translateMessageAutoFactory> {
        return (this._cache.translateMessageAuto ??= translateMessageAutoFactory(this.ctx, this)) as ReturnType<
            typeof translateMessageAutoFactory
        >;
    }

    public get translateMessageSuggest(): ReturnType<typeof translateMessageSuggestFactory> {
        return (this._cache.translateMessageSuggest ??= translateMessageSuggestFactory(this.ctx, this)) as ReturnType<
            typeof translateMessageSuggestFactory
        >;
    }

    public get unblockOA(): ReturnType<typeof unblockOAFactory> {
        return (this._cache.unblockOA ??= unblockOAFactory(this.ctx, this)) as ReturnType<typeof unblockOAFactory>;
    }

    public get unblockUser(): ReturnType<typeof unblockUserFactory> {
        return (this._cache.unblockUser ??= unblockUserFactory(this.ctx, this)) as ReturnType<
            typeof unblockUserFactory
        >;
    }

    public get undo(): ReturnType<typeof undoFactory> {
        return (this._cache.undo ??= undoFactory(this.ctx, this)) as ReturnType<typeof undoFactory>;
    }

    public get undoFriendRequest(): ReturnType<typeof undoFriendRequestFactory> {
        return (this._cache.undoFriendRequest ??= undoFriendRequestFactory(this.ctx, this)) as ReturnType<
            typeof undoFriendRequestFactory
        >;
    }

    public get undoMultiMessage(): ReturnType<typeof undoMultiMessageFactory> {
        return (this._cache.undoMultiMessage ??= undoMultiMessageFactory(this.ctx, this)) as ReturnType<
            typeof undoMultiMessageFactory
        >;
    }

    public get unholdVoiceCall(): ReturnType<typeof unholdVoiceCallFactory> {
        return (this._cache.unholdVoiceCall ??= unholdVoiceCallFactory(this.ctx, this)) as ReturnType<
            typeof unholdVoiceCallFactory
        >;
    }

    public get unpinBoardTopic(): ReturnType<typeof unpinBoardTopicFactory> {
        return (this._cache.unpinBoardTopic ??= unpinBoardTopicFactory(this.ctx, this)) as ReturnType<
            typeof unpinBoardTopicFactory
        >;
    }

    public get unpinFriendMessages(): ReturnType<typeof unpinFriendMessagesFactory> {
        return (this._cache.unpinFriendMessages ??= unpinFriendMessagesFactory(this.ctx, this)) as ReturnType<
            typeof unpinFriendMessagesFactory
        >;
    }

    public get updateActiveStatus(): ReturnType<typeof updateActiveStatusFactory> {
        return (this._cache.updateActiveStatus ??= updateActiveStatusFactory(this.ctx, this)) as ReturnType<
            typeof updateActiveStatusFactory
        >;
    }

    public get updateArchivedChatList(): ReturnType<typeof updateArchivedChatListFactory> {
        return (this._cache.updateArchivedChatList ??= updateArchivedChatListFactory(this.ctx, this)) as ReturnType<
            typeof updateArchivedChatListFactory
        >;
    }

    public get updateAutoDeleteChat(): ReturnType<typeof updateAutoDeleteChatFactory> {
        return (this._cache.updateAutoDeleteChat ??= updateAutoDeleteChatFactory(this.ctx, this)) as ReturnType<
            typeof updateAutoDeleteChatFactory
        >;
    }

    public get updateAutoReply(): ReturnType<typeof updateAutoReplyFactory> {
        return (this._cache.updateAutoReply ??= updateAutoReplyFactory(this.ctx, this)) as ReturnType<
            typeof updateAutoReplyFactory
        >;
    }

    public get updateBankAccount(): ReturnType<typeof updateBankAccountFactory> {
        return (this._cache.updateBankAccount ??= updateBankAccountFactory(this.ctx, this)) as ReturnType<
            typeof updateBankAccountFactory
        >;
    }

    public get updateBlockSharingConversation(): ReturnType<typeof updateBlockSharingConversationFactory> {
        return (this._cache.updateBlockSharingConversation ??= updateBlockSharingConversationFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof updateBlockSharingConversationFactory>;
    }

    public get updateCallMediaState(): ReturnType<typeof updateCallMediaStateFactory> {
        return (this._cache.updateCallMediaState ??= updateCallMediaStateFactory(this.ctx, this)) as ReturnType<
            typeof updateCallMediaStateFactory
        >;
    }

    public get updateCatalog(): ReturnType<typeof updateCatalogFactory> {
        return (this._cache.updateCatalog ??= updateCatalogFactory(this.ctx, this)) as ReturnType<
            typeof updateCatalogFactory
        >;
    }

    public get updateCloseFriend(): ReturnType<typeof updateCloseFriendFactory> {
        return (this._cache.updateCloseFriend ??= updateCloseFriendFactory(this.ctx, this)) as ReturnType<
            typeof updateCloseFriendFactory
        >;
    }

    public get updateConversationLabelItem(): ReturnType<typeof updateConversationLabelItemFactory> {
        return (this._cache.updateConversationLabelItem ??= updateConversationLabelItemFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof updateConversationLabelItemFactory>;
    }

    public get updateGroupSettings(): ReturnType<typeof updateGroupSettingsFactory> {
        return (this._cache.updateGroupSettings ??= updateGroupSettingsFactory(this.ctx, this)) as ReturnType<
            typeof updateGroupSettingsFactory
        >;
    }

    public get updateHiddenConversPin(): ReturnType<typeof updateHiddenConversPinFactory> {
        return (this._cache.updateHiddenConversPin ??= updateHiddenConversPinFactory(this.ctx, this)) as ReturnType<
            typeof updateHiddenConversPinFactory
        >;
    }

    public get updateLabels(): ReturnType<typeof updateLabelsFactory> {
        return (this._cache.updateLabels ??= updateLabelsFactory(this.ctx, this)) as ReturnType<
            typeof updateLabelsFactory
        >;
    }

    public get updateLang(): ReturnType<typeof updateLangFactory> {
        return (this._cache.updateLang ??= updateLangFactory(this.ctx, this)) as ReturnType<typeof updateLangFactory>;
    }

    public get updateOneOneBoardTopic(): ReturnType<typeof updateOneOneBoardTopicFactory> {
        return (this._cache.updateOneOneBoardTopic ??= updateOneOneBoardTopicFactory(this.ctx, this)) as ReturnType<
            typeof updateOneOneBoardTopicFactory
        >;
    }

    public get updatePersonalizedStickerList(): ReturnType<typeof updatePersonalizedStickerListFactory> {
        return (this._cache.updatePersonalizedStickerList ??= updatePersonalizedStickerListFactory(
            this.ctx,
            this,
        )) as ReturnType<typeof updatePersonalizedStickerListFactory>;
    }

    public get updatePinConversations(): ReturnType<typeof updatePinConversationsFactory> {
        return (this._cache.updatePinConversations ??= updatePinConversationsFactory(this.ctx, this)) as ReturnType<
            typeof updatePinConversationsFactory
        >;
    }

    public get updateProductCatalog(): ReturnType<typeof updateProductCatalogFactory> {
        return (this._cache.updateProductCatalog ??= updateProductCatalogFactory(this.ctx, this)) as ReturnType<
            typeof updateProductCatalogFactory
        >;
    }

    public get updateProfile(): ReturnType<typeof updateProfileFactory> {
        return (this._cache.updateProfile ??= updateProfileFactory(this.ctx, this)) as ReturnType<
            typeof updateProfileFactory
        >;
    }

    public get updateProfileBio(): ReturnType<typeof updateProfileBioFactory> {
        return (this._cache.updateProfileBio ??= updateProfileBioFactory(this.ctx, this)) as ReturnType<
            typeof updateProfileBioFactory
        >;
    }

    public get updateProfileMode(): ReturnType<typeof updateProfileModeFactory> {
        return (this._cache.updateProfileMode ??= updateProfileModeFactory(this.ctx, this)) as ReturnType<
            typeof updateProfileModeFactory
        >;
    }

    public get updateQuickMessage(): ReturnType<typeof updateQuickMessageFactory> {
        return (this._cache.updateQuickMessage ??= updateQuickMessageFactory(this.ctx, this)) as ReturnType<
            typeof updateQuickMessageFactory
        >;
    }

    public get updateRecentSearch(): ReturnType<typeof updateRecentSearchFactory> {
        return (this._cache.updateRecentSearch ??= updateRecentSearchFactory(this.ctx, this)) as ReturnType<
            typeof updateRecentSearchFactory
        >;
    }

    public get updateSettings(): ReturnType<typeof updateSettingsFactory> {
        return (this._cache.updateSettings ??= updateSettingsFactory(this.ctx, this)) as ReturnType<
            typeof updateSettingsFactory
        >;
    }

    public get updateTodo(): ReturnType<typeof updateTodoFactory> {
        return (this._cache.updateTodo ??= updateTodoFactory(this.ctx, this)) as ReturnType<typeof updateTodoFactory>;
    }

    public get updateTodoStatus(): ReturnType<typeof updateTodoStatusFactory> {
        return (this._cache.updateTodoStatus ??= updateTodoStatusFactory(this.ctx, this)) as ReturnType<
            typeof updateTodoStatusFactory
        >;
    }

    public get updateTranslateSetting(): ReturnType<typeof updateTranslateSettingFactory> {
        return (this._cache.updateTranslateSetting ??= updateTranslateSettingFactory(this.ctx, this)) as ReturnType<
            typeof updateTranslateSettingFactory
        >;
    }

    public get upgradeGroupToCommunity(): ReturnType<typeof upgradeGroupToCommunityFactory> {
        return (this._cache.upgradeGroupToCommunity ??= upgradeGroupToCommunityFactory(this.ctx, this)) as ReturnType<
            typeof upgradeGroupToCommunityFactory
        >;
    }

    public get uploadAttachment(): ReturnType<typeof uploadAttachmentFactory> {
        return (this._cache.uploadAttachment ??= uploadAttachmentFactory(this.ctx, this)) as ReturnType<
            typeof uploadAttachmentFactory
        >;
    }

    public get uploadBackupChunk(): ReturnType<typeof uploadBackupChunkFactory> {
        return (this._cache.uploadBackupChunk ??= uploadBackupChunkFactory(this.ctx, this)) as ReturnType<
            typeof uploadBackupChunkFactory
        >;
    }

    public get uploadProductPhoto(): ReturnType<typeof uploadProductPhotoFactory> {
        return (this._cache.uploadProductPhoto ??= uploadProductPhotoFactory(this.ctx, this)) as ReturnType<
            typeof uploadProductPhotoFactory
        >;
    }

    public get verifyCloudMedia(): ReturnType<typeof verifyCloudMediaFactory> {
        return (this._cache.verifyCloudMedia ??= verifyCloudMediaFactory(this.ctx, this)) as ReturnType<
            typeof verifyCloudMediaFactory
        >;
    }

    public get verifyFriend(): ReturnType<typeof verifyFriendFactory> {
        return (this._cache.verifyFriend ??= verifyFriendFactory(this.ctx, this)) as ReturnType<
            typeof verifyFriendFactory
        >;
    }

    public get verifyTodo(): ReturnType<typeof verifyTodoFactory> {
        return (this._cache.verifyTodo ??= verifyTodoFactory(this.ctx, this)) as ReturnType<typeof verifyTodoFactory>;
    }

    public get voiceToText(): ReturnType<typeof voiceToTextFactory> {
        return (this._cache.voiceToText ??= voiceToTextFactory(this.ctx, this)) as ReturnType<
            typeof voiceToTextFactory
        >;
    }

    public get votePoll(): ReturnType<typeof votePollFactory> {
        return (this._cache.votePoll ??= votePollFactory(this.ctx, this)) as ReturnType<typeof votePollFactory>;
    }
}
