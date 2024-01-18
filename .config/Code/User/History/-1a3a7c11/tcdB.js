import React, { Component } from 'react';
import { connect } from 'react-redux';

himport LS from 'utils/localStorageAPI';
import {
  getContactTimeline,
  updateContactTimeline,
  updateActiveContact,
  sendMessage,
  removeContactTab,
  removeContactTabsFromContextMenu,
  markContactChatAsRead,
  getTimelineMedia,
  cleanTimelineMedia,
  updateContactTimelineMedia,
  getContactMessageContext,
  updateContactMessageContext,
  deletePinnedMessage,
  pinClientMsg,
  fixClientTab,
  getContactReminders,
  cleanContactReminders,
  updateContactReminders,
  removeMessageReminder,
  updateContactMessageSearch,
  stopContactMessageSearch,
  searchContactMessage,
  searchGlobalContactMessage,
  updateGlobalContactMessageSearch,
  getContactDateMsgContext,
  updateContactDateMsgContext,
  cleanContactDateMsgContext,
  getScheduledMsgs,
  cleanScheduledMsgs,
  updateScheduledMsgs,
  createContactChat,
  getScheduledMsgsCount
} from 'redux/ducks/clientChats';
import {
  playMedia,
  openModal,
  closeModal,
  MODAL_TYPES,
} from 'redux/ducks/activeWindows';
import API from 'api/api';
import { getContactsById, addNewArrayGirlsToState, updateContactInState } from 'redux/ducks/contacts';
import { getAllTemplates, getMsgShortcuts } from 'redux/ducks/msgTemplates';
import { CHAT_SOURCES, CHAT_TYPES } from 'config/constants';
import { getDateByTimezoneOffset } from 'utils';
import { selectUserTimezone } from 'redux/selectors/selectors';
import { getUnfinishedBookingsByCallerId, getBookingsByCallerId } from 'redux/ducks/bookings';
import { getActiveDivaGirls } from 'redux/ducks/divaGirls';
import ICONS from 'assets/icons';

// import SvgIcon from 'components/SvgIcon/SvgIcon';
// import ChatCreatorButton from './components/ChatCreatorForm/ChatCreatorButton/ChatCreatorButton';
import Title from 'components/UI/Title/Title';
import ChatRestore from './components/ChatRestore';
import Chat from './Chat';

class ClientChat extends Component {
  state = {
    repliedMsg: null,
    editedMsg: null,
    voiceMsg: null,
    images: null,
    videos: null,
  }

  componentDidMount() {
    if (this.props.active && !this.props.timeline.length) {
      this.props.getContactTimeline(this.props.active, CHAT_TYPES.CLIENT, this.props.userTimezone, false);
      this.props.getScheduledMsgsCount(this.props.active, CHAT_TYPES.CLIENT);
    }

    if (this.props.active) {
      this.props.getBookingsByCallerId(this.props.active)
      // this.props.getUnfinishedBookingsByCallerId(this.props.active)
      //   .then((profiles) => {
      //       const ids = profiles.map(({ profile_id }) => profile_id);

      //     this.props.getActiveDivaGirls({ 'filter-ids': ids })
      //   })
    }

    document.addEventListener('closeModal', this.loadNotForClients);
  }

  componentWillUnmount() {
    if (this.state.images) {
      this.cleanImages();
    }
    if (this.state.videos) {
      this.cleanVideos();
    }

    document.removeEventListener('closeModal', this.loadNotForClients);
  }

  componentDidUpdate(prevProps) {
    const { activeChatSource } = this.props;

    if (prevProps.active !== this.props.active) {

      if (this.props.active !== null) {
        const withCancel = !!prevProps.active;

        this.props.getScheduledMsgsCount(this.props.active, CHAT_TYPES.CLIENT, withCancel);

        if (this.props.clientSearchSource === 'msgs' && this.props.clientSearch) {
          this.props.getContactTimeline(this.props.active, CHAT_TYPES.CLIENT, this.props.userTimezone, withCancel, this.props.clientSearch);
        }
        else {
          this.props.getContactTimeline(this.props.active, CHAT_TYPES.CLIENT, this.props.userTimezone, withCancel);
        }
        
        if (this.props.active !== 'new_chat') {
          this.props.getBookingsByCallerId(this.props.active)
          // this.props.getUnfinishedBookingsByCallerId(this.props.active)
          //   .then(({ data }) => {
          //     const ids = data?.map(({ profile_id }) => profile_id) || [];
  
          //     this.props.getActiveDivaGirls({ 'filter-ids': ids })
          //   })
        }
      }
      if (this.state.editedMsg) {
        this.cleanEditedMsg();
      }
      if (this.state.voiceMsg) {
        this.updateVoiceMsg();
      }
      if (this.state.images) {
        this.cleanImages();
      }
      if (this.state.videos) {
        this.cleanVideos();
      }
      LS.setItem('aClient', this.props.active, this.props.userId);

      this.loadNotForClients();
    }
    if (prevProps.tabs !== this.props.tabs) {
      LS.setItem('cTabs', this.props.tabs, this.props.userId);
    }
    if (prevProps.unfixedTab !== this.props.unfixedTab) {
      LS.setItem('unfixedClientTab', this.props.unfixedTab, this.props.userId);
    }

    if (activeChatSource !== prevProps.activeChatSource) {
      if (activeChatSource === CHAT_SOURCES.REMINDERS) {
        this.props.getContactReminders(this.props.activeRecipient, this.props.userTimezone);
      }
      else if (activeChatSource === CHAT_SOURCES.MEDIA) {
        this.props.getTimelineMedia(this.props.activeRecipient, this.props.userTimezone);
      }
      else if (activeChatSource === CHAT_SOURCES.SCHEDULED_MSGS) {
        this.props.getScheduledMsgs(this.props.activeRecipient, this.props.userTimezone);
      }
      if (prevProps.activeChatSource === CHAT_SOURCES.REMINDERS) {
        this.props.cleanContactReminders(CHAT_TYPES.CLIENT);
      }
      else if (prevProps.activeChatSource === CHAT_SOURCES.MEDIA) {
        this.props.cleanTimelineMedia(CHAT_TYPES.CLIENT);
      }
      else if (prevProps.activeChatSource === CHAT_SOURCES.SCHEDULED_MSGS) {
        this.props.cleanScheduledMsgs(CHAT_TYPES.CLIENT);
      }
    }

  }

  replyMsg = (msg) =>  this.setState({ repliedMsg: msg });
  cleanRepliedMsg = () => this.setState({ repliedMsg: null });

  editMsg = (msg) => this.setState({ editedMsg: msg });
  cleanEditedMsg = () => this.setState({ editedMsg: null });

  updateVoiceMsg = (blob, duration) => {
    if (blob && duration) {                 // add voiceMsg
      this.setState({
        voiceMsg: {
          blob,
          url: URL.createObjectURL(blob),
          duration
        }
      });
    }
    else if (this.state.voiceMsg) {         // clean voiceMsg
      this.setState({ voiceMsg: null });
    }
  }

  updateImages = (images) => {
    const imagesWithUrl = images.map(file => Object.assign(file, {
      url: URL.createObjectURL(file)
    }));

    this.setState({ images: imagesWithUrl });
  }
  cleanImages = () => {
    this.state.images.forEach(file => URL.revokeObjectURL(file.url));
    this.setState({ images: null });
  }

  updateVideos = (videos) => {
    const videosWithUrl = videos.map(file => Object.assign(file, {
      url: URL.createObjectURL(file)
    }));

    this.setState({ videos: videosWithUrl });
  }
  cleanVideos = () => {
    this.state.videos.forEach(file => URL.revokeObjectURL(file.url));
    this.setState({ videos: null });
  }

  loadNotForClients = () => {
    if (this.props.activeRecipient) {
      API.getClientNotFor(this.props.activeRecipient.id)
        .then(({ data }) => {
          this.props.setNotForClients && this.props.setNotForClients(data);
        })
        .catch(err => console.log(err));
    }
  } 

  timeline = () => {
    if (this.props.contextMsgId) {
      return this.props.auxiliaryTimeline;
    }
    else if (this.props.contextDate) {
      return this.props.auxiliaryTimeline;
    }
    else if (this.props.search) {
      return this.props.auxiliaryTimeline;
    }
    else if (this.props.activeChatSource !== CHAT_SOURCES.MSGS) {
      return this.props.auxiliaryTimeline;
    }
    return this.props.timeline;
  }

  updateTimeline = () => {
    if (this.props.contextMsgId) {
      return this.updateMsgContext;
    }
    else if (this.props.contextDate) {
      return this.updateDateMsgContext;
    }
    else if (this.props.search && this.props.isGlobalSearch) {
      return this.updateGlobalContactMessageSearch;
    }
    else if (this.props.search) {
      return this.updateMsgSearch;
    }
    else if (this.props.activeChatSource === CHAT_SOURCES.MEDIA) {
      return this.updateContactTimelineMedia;
    }
    else if (this.props.activeChatSource === CHAT_SOURCES.REMINDERS) {
      return this.updateContactReminders;
    }
    else if (this.props.activeChatSource === CHAT_SOURCES.SCHEDULED_MSGS) {
      return this.updateScheduledMsgs;
    }
    return this.updateContactTimeline;
  }

  getContactMsgContext = (msgId, contact, searchQuery) =>
    this.props.getContactMessageContext(msgId, CHAT_TYPES.CLIENT, contact, searchQuery, this.props.userTimezone);

  updateMsgContext = (activeRecipient, page, loadDirection) =>
    this.props.updateContactMessageContext(this.props.contextMsgId, page, loadDirection, activeRecipient, this.props.userTimezone);

  getContactDateMsgContext = (date) =>
    this.props.getContactDateMsgContext(date, this.props.activeRecipient.id, CHAT_TYPES.CLIENT, this.props.userTimezone);

  updateDateMsgContext = (activeRecipient, page, loadDirection) =>
    this.props.updateContactDateMsgContext(activeRecipient, page, loadDirection, this.props.contextDate, this.props.userTimezone);

  startMessageSearch = (query) =>
    this.props.searchContactMessage(query, this.props.activeRecipient, this.props.userTimezone);

  updateMsgSearch = (activeRecipient, page, loadDirection, isArchive) =>
    this.props.updateContactMessageSearch(activeRecipient, page, loadDirection, this.props.search, this.props.userTimezone, (isArchive || this.props.isAuxiliaryArchiveDisplayed));

  stopMessageSearch = () => this.props.stopContactMessageSearch(this.props.activeRecipient);

  updateContactTimeline = (activeRecipient, page, loadDirection, isArchive) =>
    this.props.updateContactTimeline(activeRecipient, page, loadDirection, this.props.userTimezone, false, (isArchive || this.props.isArchiveDisplayed));

  updateGlobalContactMessageSearch = (activeRecipient, page, loadDirection, isArchive) =>
    this.props.updateGlobalContactMessageSearch(activeRecipient, page, this.props.search, loadDirection, this.props.userTimezone, (isArchive || this.props.isAuxiliaryArchiveDisplayed));

  updateContactTimelineMedia = (activeRecipient, page, loadDirection, isArchive) =>
    this.props.updateContactTimelineMedia(activeRecipient, page, loadDirection, this.props.userTimezone, (isArchive || this.props.isAuxiliaryArchiveDisplayed));

  updateContactReminders = (activeRecipient, page, loadDirection) =>
    this.props.updateContactReminders(activeRecipient, page, loadDirection, this.props.userTimezone);

  updateScheduledMsgs = (activeRecipient, page, loadDirection) =>
    this.props.updateScheduledMsgs(activeRecipient, page, loadDirection, this.props.userTimezone);

  showTimePicker = async () => this.props.openModal(
    MODAL_TYPES.timePicker, {
      // action: this.getContactDateMsgContext,
      onSelectDate: date => {
        this.getContactDateMsgContext(date - (this.props.userTimezone - (new Date().getTimezoneOffset() * (-1))) * 60000);
        this.props.closeModal();
      },
      maxDate: getDateByTimezoneOffset(this.props.userTimezone),
      userTimezone: this.props.userTimezone
    }
  );

  changeRecipientAudioStatus = (action, recipientId) =>
    API.setContactAudioStatus(action, recipientId)
      .then(({ data }) => {
        this.props.updateContactInState(data.caller, data.caller.type);
      })
      .catch(console.error);


  render() {
    const isMainTimelineOpen = this.props.search ||
      this.props.activeChatSource !== CHAT_SOURCES.MSGS ||
      this.props.contextMsgId ||
      this.props.contextDate
      ? false
      : true;

    const timelineLowerLoadedPage = !isMainTimelineOpen
      ? this.props.auxiliaryLowerLoadedPage
      : this.props.timelineLowerLoadedPage;

    const timelinePageCount = !isMainTimelineOpen
      ? this.props.auxiliaryPageCount
      : this.props.timelinePageCount;

    const timelineHigherLoadedPage = !isMainTimelineOpen
      ? this.props.auxiliaryHigherLoadedPage
      : this.props.timelineCurrentPage;

    const timelineCurrentPage = !isMainTimelineOpen
      ? this.props.auxiliaryCurrentPage
      : this.props.timelineCurrentPage;

    return this.props.activeRecipient || this.props.isBufferChat
      ? (
        <Chat
          clientChat
          title={`${this.props.isBufferChat ? 'Conversation with Client' : 'Conversations with Clients'}`}
          type={CHAT_TYPES.CLIENT}
          isBufferChat={this.props.isBufferChat}
          onSendMessageInBufferChat={this.props.onSendMessageInBufferChat}
          activeRecipient={this.props.activeRecipient}
          updateActiveContact={this.props.updateActiveContact}
          profileId={this.props.userId}
          userTimezone={this.props.userTimezone}
          userHour12={this.props.userHour12}

          tabs={this.props.tabs}
          isTabsDraggable
          withUnfixedTab
          unfixedTab={this.props.unfixedTab}
          fixTab={this.props.fixClientTab}
          removeContactTab={this.props.removeContactTab}
          removeContactTabsFromContextMenu={this.props.removeContactTabsFromContextMenu}

          timelinePending={this.props.timelinePending}
          updatePending={this.props.updatePending}
          isMainTimelineOpen={isMainTimelineOpen}
          timeline={this.timeline()}
          timelineCurrentPage={timelineCurrentPage}
          timelinePageCount={timelinePageCount}
          timelineHigherLoadedPage={timelineHigherLoadedPage}
          timelineLowerLoadedPage={timelineLowerLoadedPage}
          newInteractionType={this.props.newInteractionType}
          updateContactTimeline={this.updateTimeline()}

          isArchiveDisplayed={this.props.isArchiveDisplayed}
          isAuxiliaryArchiveDisplayed={this.props.isAuxiliaryArchiveDisplayed}

          msgTemplates={this.props.msgTemplates}
          shortcuts={this.props.shortcuts}
          typingStatus={this.props.typingStatus}

          search={this.props.search}
          startMessageSearch={this.startMessageSearch}
          stopMessageSearch={this.stopMessageSearch}
          isGlobalSearch={this.props.isGlobalSearch}
          startGlobalMsgSearch={this.props.searchGlobalContactMessage}
          showSearchQuery={this.props.showSearchQuery}

          contextMsgId={this.props.contextMsgId}
          getMessageContext={this.getContactMsgContext}

          contextDate={this.props.contextDate}
          cleanContactDateMsgContext={this.props.cleanContactDateMsgContext}
          showTimePickerForDateContext={this.props.activeChatSource !== CHAT_SOURCES.MSGS ? null : this.showTimePicker}

          pinnedMsgs={this.props.pinnedMsgs}
          unpinMsg={this.props.deletePinnedMessage}
          pinMsg={this.props.pinClientMsg}

          isFullMode={this.props.currentCallerId}

          activeChatSource={this.props.activeChatSource}

          removeMessageReminder={this.props.removeMessageReminder}

          sendMessage={this.props.sendMessage}
          openModal={this.props.openModal}
          playMedia={this.props.playMedia}
          markChatAsRead={this.props.markChatAsRead}
          changeRecipientAudioStatus={this.changeRecipientAudioStatus}
          callFromChat
          fullScreenMode={this.props.fullScreenMode}
          showSalesButton
          isCreateChatMode

          replyMsg={this.replyMsg}
          repliedMsg={this.state.repliedMsg}
          cleanRepliedMsg={this.cleanRepliedMsg}

          editMsg={this.editMsg}
          editedMsg={this.state.editedMsg}
          cleanEditedMsg={this.cleanEditedMsg}

          voiceMsg={this.state.voiceMsg}
          updateVoiceMsg={this.updateVoiceMsg}

          images={this.state.images}
          updateImages={this.updateImages}
          cleanImages={this.cleanImages}

          videos={this.state.videos}
          updateVideos={this.updateVideos}
          cleanVideos={this.cleanVideos}

          addNewArrayGirlsToState={this.props.addNewArrayGirlsToState}

          createContactChat={this.props.createContactChat}
          isMsgInput={this.props.activeRecipient?.id === "new_chat" ? false : true}
          isShowUndoTabs={true}
          isScheduledMsgsSource={this.props.activeChatSource === CHAT_SOURCES.SCHEDULED_MSGS}
          scheduledMsgsCount={this.props.scheduledMsgsCount}

          searchSource={this.props.clientSearchSource}
        />
      ) : (
        <div className="chat">
          <div className="chat__title title">
            <Title
              icon={ICONS.comments}
              text={this.props.title}
              count={this.props.tabs.length}
            />

            {/* {this.props.active !== 'new_chat' &&
              <ChatCreatorButton
                onClick={this.props.createContactChat}
              >
                <SvgIcon
                  icon="plus"
                  width="18"
                  className="chat-creator-button__img"
                  title="create new chat" />
              </ChatCreatorButton>
            } */}
          </div>

          <ChatRestore
            recentTabs={this.props.recentTabs}
            type={CHAT_TYPES.CLIENT}
          />
        </div>
      );
  }
}

const mapStateToProps = (state, ownProps) => ({
  active: ownProps.activeSessionRecipient || state.clientChats.active,
  activeRecipient: state.contacts.entities[state.clientChats.active || ownProps.currentCallerId],
  tabs: state.clientChats.tabs,
  unfixedTab: state.clientChats.unfixedTab,
  recentTabs: state.clientChats.recentTabs,

  timeline: state.clientChats.timeline,
  timelinePending: state.clientChats.timelinePending,
  updatePending: state.clientChats.updatePending,
  timelineCurrentPage: state.clientChats.timelineCurrentPage,
  timelinePageCount: state.clientChats.timelinePageCount,
  timelineLowerLoadedPage: state.clientChats.timelineLowerLoadedPage,
  newInteractionType: state.clientChats.newInteractionType,

  auxiliaryTimeline: state.clientChats.auxiliaryTimeline,
  auxiliaryLowerLoadedPage: state.clientChats.auxiliaryLowerLoadedPage,
  auxiliaryPageCount: state.clientChats.auxiliaryPageCount,
  auxiliaryHigherLoadedPage: state.clientChats.auxiliaryHigherLoadedPage,
  auxiliaryCurrentPage: state.clientChats.auxiliaryCurrentPage,

  msgTemplates: state.msgTemplates.clientsTemplates,
  shortcuts: state.msgTemplates.shortcuts,

  search: state.clientChats.search,

  contextMsgId: state.clientChats.contextMsgId,
  contextDate: state.clientChats.contextDate,

  isGlobalSearch: state.clientChats.isGlobalMsgSearch,
  showSearchQuery: state.clientChats.showSearchQuery,

  userId: state.user.id,
  userTimezone: selectUserTimezone(state),
  userHour12: state.user.hour12,

  pinnedMsgs: state.clientChats.pinnedMsgs,

  typingStatus: state.typingOperators.chats[state.clientChats.active + '_' + CHAT_TYPES.CLIENT],

  scheduledMsgsCount: state.clientChats.scheduledMsgsCount,

  clientSearchSource: state.contacts.clients.searchSource,
  clientSearch: state.contacts.clients.search,
  activeChatSource: state.clientChats.chatSource,

  isArchiveDisplayed: state.clientChats.isArchiveDisplayed,
  isAuxiliaryArchiveDisplayed: state.clientChats.isAuxiliaryArchiveDisplayed,
});

const mapDispatchToProps = {
  updateContactInState,
  getContactTimeline,
  updateContactTimeline,
  updateContactMessageSearch,
  updateActiveContact,
  sendMessage,
  removeContactTab,
  removeContactTabsFromContextMenu,
  openModal,
  closeModal,
  getContactMessageContext,
  getAllTemplates,
  getMsgShortcuts,
  markChatAsRead: markContactChatAsRead,
  getContactsById,
  getTimelineMedia,
  getContactReminders,
  cleanContactReminders,
  cleanTimelineMedia,
  updateContactTimelineMedia,
  updateContactReminders,

  searchGlobalContactMessage,
  updateGlobalContactMessageSearch,

  stopContactMessageSearch,
  searchContactMessage,

  createContactChat,

  pinClientMsg,
  deletePinnedMessage,
  playMedia,
  fixClientTab,

  addNewArrayGirlsToState,
  removeMessageReminder,
  updateContactMessageContext,

  getContactDateMsgContext,
  updateContactDateMsgContext,
  cleanContactDateMsgContext,

  getScheduledMsgs,
  updateScheduledMsgs,
  cleanScheduledMsgs,
  getScheduledMsgsCount,
  getUnfinishedBookingsByCallerId,
  getBookingsByCallerId,
  getActiveDivaGirls,
};
export default connect(mapStateToProps, mapDispatchToProps)(ClientChat);
