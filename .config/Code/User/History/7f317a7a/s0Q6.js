import React, { Fragment, useEffect } from "react";
import { useDispatch } from 'react-redux';

import { CHAT_SOURCES, CHAT_TYPES } from "config/constants";
import { getContactsById } from 'redux/ducks/contacts';

import "./Chat.scss";
import Title from "components/UI/Title/Title";
import AdaptiveTabs from "./components/ChatTabs/AdaptiveTabs";
import ChatTabs from "./components/ChatTabs/ChatTabs";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import ChatSources from "./components/ChatSources/ChatSources";
import ChatTimeline from "./components/ChatTimeline/ChatTimeline1";
import DropMediaContainer from "components/DropMediaContainer/DropMediaContainer";
import ChatMessageInput from "./components/ChatMessageInput/ChatMessageInput";
import ICONS from "assets/icons";
// import ChatCreatorButton from "./components/ChatCreatorForm/ChatCreatorButton/ChatCreatorButton";
// import SvgIcon from "components/SvgIcon/SvgIcon";
import ChatAttachments from "./components/ChatAttachments/ChatAttachments";
import AttachmentRepliedMessage from "./components/ChatAttachments/AttachmentRepliedMessage";
import BufferChatTabs from "components/BufferChats/BufferChatTabs";
import classNames from 'classnames';
// import AttachmentEditedMessage from "./components/ChatAttachments/AttachmentEditedMessage";
// import AttachmentVoiceMessage from "./components/ChatAttachments/AttachmentVoiceMessage";
// import AttachmentImages from "./components/ChatAttachments/AttachmentImages";
// import AttachmentVideos from "./components/ChatAttachments/AttachmentVideos";

const Chat = props => {
  const {
    activeRecipient,
    tabs,
    className,
    profileId,
    clientChat,
    girlChat,
    updateActiveContact,
    search,
    isCreateChatMode,
    activeGroup,
  } = props;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!activeRecipient?.date_created) {
      dispatch(getContactsById(activeRecipient.id, activeRecipient.type));
    }
  }, [activeRecipient]);

  const markChatAsRead = () => {
    if (activeRecipient && activeRecipient.unreadCount) {
      props.markChatAsRead(activeRecipient);
    }
  };

  const handleDropMediaSubmit = (media) => {
    let images = [];
    let videos = [];

    media.forEach((media) => {
      if (media.type.match('image.*')) {
        images.push(media);
      }
      else if (media.type.match('video.*')) {
        videos.push(media);
      }
    })

    props.updateImages(images);
    props.updateVideos(videos);
  };

  return (
    <div
      onClick={() => setTimeout(() => markChatAsRead(), 100)}
      className={classNames('chat', clientChat ? 'client-chat' : 'girl-chat')}
    >
      {tabs?.length ? //TODO v2 
        <Fragment>
          {!props.isBufferChat &&
            <AdaptiveTabs tabs={tabs} type={props.type}>
              <ChatTabs
                classPrefix={clientChat ? 'client-chat' : 'girl-chat'}
                activeRecipient={activeRecipient}
                updateActiveContact={updateActiveContact}
                removeContactTab={props.removeContactTab}
                isTabsDraggable={props.isTabsDraggable}
                withUnfixedTab={props.withUnfixedTab}
                unfixedTab={props.unfixedTab}
                fixTab={props.fixTab}
                isShowUndoTabs={props.isShowUndoTabs}
              />
            </AdaptiveTabs>
          }

          {props.isBufferChat && props.activeRecipient?.type === CHAT_TYPES.GIRL && <BufferChatTabs />}

          <div className="chat__wrapper">
            <ChatHeader
              updateActiveContact={props.updateActiveContact}
              callFromChat={props.callFromChat}
              userId={profileId}
              fullScreenMode={props.fullScreenMode}
              type={props.type}
              removeContactTab={props.removeContactTab}
              activeRecipient={activeRecipient}
              userTimezone={props.userTimezone}
              showSalesButton={props.showSalesButton}
              canBookFromBuffer={props.canBookFromBuffer}
            />
						
            <div className="chat__content">
              <ChatSources
                activeRecipient={activeRecipient}
                stopMessageSearch={props.stopMessageSearch}
                startMessageSearch={props.startMessageSearch}

                contextDate={props.contextDate}
                search={search}
                showSearchQuery={props.showSearchQuery}
                isGlobalSearch={props.isGlobalSearch}
                activeChatSource={props.activeChatSource}
                scheduledMsgsCount={props.scheduledMsgsCount}
                serviceMsgCount={props.serviceMsgCount}

                searchSource={props.searchSource}
                modifier={activeGroup ? 'hidden' : 'tiny'}
              />

              <DropMediaContainer
                activeRecipient={activeRecipient}
                openModal={props.openModal}
                type={props.type}
                // classNamePrefix="chat-dropzone"
                onSubmit={handleDropMediaSubmit}
              >
                {(getInputProps) => (
                  <>
                    <ChatTimeline
                      activeRecipient={activeRecipient}
                      updateActiveContact={props.updateActiveContact}
                      type={props.type}
                      isMainTimelineOpen={props.isMainTimelineOpen}
                      notForClients={props.notForClients}

                      activeGroup={activeGroup}

                      timelinePending={props.timelinePending}
                      updatePending={props.updatePending}
                      timeline={props.timeline}
                      timelineCurrentPage={props.timelineCurrentPage}
                      timelinePageCount={props.timelinePageCount}
                      timelineHigherLoadedPage={props.timelineHigherLoadedPage}
                      timelineLowerLoadedPage={props.timelineLowerLoadedPage}
                      newInteractionType={props.newInteractionType}
                      updateContactTimeline={props.updateContactTimeline}

                      activeChatSource={props.activeChatSource}
                      isArchiveDisplayed={props.isArchiveDisplayed}
                      isAuxiliaryArchiveDisplayed={props.isAuxiliaryArchiveDisplayed}

                      profileId={profileId}
                      userTimezone={props.userTimezone}
                      userHour12={props.userHour12}

                      pinnedMsgs={props.pinnedMsgs}
                      unpinMsg={props.unpinMsg}
                      pinMsg={props.pinMsg}

                      removeMessageReminder={props.removeMessageReminder}
                      addNewArrayGirlsToState={props.addNewArrayGirlsToState}
                      playMedia={props.playMedia}

                      contextMsgId={props.contextMsgId}
                      getMessageContext={props.getMessageContext}

                      search={search}
                      isGlobalSearch={props.isGlobalSearch}
                      startGlobalMsgSearch={props.startGlobalMsgSearch}

                      contextDate={props.contextDate}
                      cleanContactDateMsgContext={props.cleanContactDateMsgContext}
                      showTimePickerForDateContext={props.showTimePickerForDateContext}

                      editMsg={props.editMsg}
                      replyMsg={props.replyMsg}
                      openModal={props.openModal}

                      repliedMsg={props.repliedMsg}
                    />

                    {/* <ChatAttachments
                      isShow={props.editedMsg}
                      onClose={props.cleanEditedMsg} >
                      <AttachmentEditedMessage
                        showTitle
                        interaction={props.editedMsg} />
                    </ChatAttachments>

                    <ChatAttachments
                      isShow={props.voiceMsg && !props.voiceMsg.sendAtImmediately && !props.editedMsg}
                      onClose={props.updateVoiceMsg} >
                      <AttachmentVoiceMessage
                        showTitle
                        voiceMsg={props.voiceMsg} />
                    </ChatAttachments>

                    <ChatAttachments
                      isShow={!!props.images?.length}
                      onClose={props.cleanImages} >
                      <AttachmentImages
                        images={props.images} />
                    </ChatAttachments>

                    <ChatAttachments
                      isShow={!!props.videos?.length}
                      onClose={props.cleanVideos} >
                      <AttachmentVideos
                        videos={props.videos} />
                    </ChatAttachments>
                  */}

                    <ChatAttachments
                      isShow={props.repliedMsg}
                      onClose={props.cleanRepliedMsg} >
                      <AttachmentRepliedMessage
                        profileId={profileId}
                        userHour12={props.userHour12}
                        interaction={props.repliedMsg}
                        userTimezone={props.userTimezone}
                        activeRecipient={activeRecipient}
                        getMessageContext={props.getMessageContext}
                      />
                    </ChatAttachments>

                    {props.isMsgInput && !(props.activeChatSource === CHAT_SOURCES.REMINDERS) && (
                      <ChatMessageInput
                        isHideMuteBtn={props.isHideMuteBtn}
                        clientChat={clientChat}
                        girlChat={girlChat}
                        type={props.type}
                        typingStatus={props.typingStatus}
                        activeRecipient={activeRecipient}
                        msgTemplates={props.msgTemplates}
                        shortcuts={props.shortcuts}

                        activeGroup={activeGroup}

                        profileId={profileId}
                        sendMessage={props.sendMessage}
                        fileInputProps={getInputProps}
                        fixTab={props.fixTab}
                        unfixedTab={props.unfixedTab}
                        changeRecipientAudioStatus={props.changeRecipientAudioStatus}
                        openModal={props.openModal}
                        editedMsg={props.editedMsg}
                        cleanEditedMsg={props.cleanEditedMsg}
                        repliedMsg={props.repliedMsg}
                        cleanRepliedMsg={props.cleanRepliedMsg}
                        images={props.images}
                        cleanImages={props.cleanImages}
                        videos={props.videos}
                        cleanVideos={props.cleanVideos}
                        voiceMsg={props.voiceMsg}
                        updateVoiceMsg={props.updateVoiceMsg}
                        isScheduledMsgsSource={props.isScheduledMsgsSource}
                        userTimezone={props.userTimezone}
                      />
                    )}
                  </>
                )}
              </ DropMediaContainer >
            </div>
          </div>

        </Fragment>
        : null
      }
    </div>
  );
};

export default Chat;
