import React, { useState, useLayoutEffect, useRef, memo, useEffect } from 'react';
import { Scrollbars } from "react-custom-scrollbars-2";
import moment from 'moment';

import ICONS from 'assets/icons';
import { CHAT_SOURCES, CHAT_TYPES, INTERACTION_TYPES } from 'config/constants';
import { throttle, sumOfNestedArrayItems, classModifier } from 'utils';
import { useDidMount, usePrevious, useToggle } from 'hooks';
import { openModal, MODAL_TYPES } from 'redux/ducks/activeWindows';
import { useDispatch, useSelector } from 'react-redux';
import { selectBookingsByClientIds } from 'redux/selectors/selectors';

import './ChatTimeline.scss';
import InteractionsList from './InteractionsList';
import PinnedMsgs from './PinnedMsgs/PinnedMsgs';
import PinnedBookings from './PinnedBookings/PinnedBookings';
import Spinner from 'components/UI/Spinner/Spinner';
import CustomScrollbarThumb from 'components/UI/CustomScrollbarThumb/CustomScrollbarThumb';
import CustomScrollbarTrack from 'components/UI/CustomScrollbarTrack/CustomScrollbarTrack';

const ChatTimeline = (props) => {
  const {
    timelinePending,
    updatePending,
    timeline,
    activeRecipient = {},
    newInteractionType,

    search,
    contextMsgId,
    isMainTimelineOpen,

    contextDate,
    activeChatSource,

    activeGroup,
  } = props;

  const activeClient = useSelector((state) => state.contacts.entities[state.clientChats.active]);
  const bookings = useSelector((state) => selectBookingsByClientIds(state, state.clientChats.active));

  const { OUTGOING_CALL, OUTGOING_MSG, MSG_ATTACHMENT } = INTERACTION_TYPES;

  const [scrollBtn, setScrollBtn] = useState(false);
  const [isScroledDown, setIsScrolledDown] = useState(false);

  const scrollPosition = useRef(0);

  const timelineRef = useRef();
  const unreadRef = useRef();
  const contextMsgRef = useRef();
  const contextDateRef = useRef();
  const lastLoadScrollDirection = useRef();
  const scrollBottomRef = useRef();

  const dispatch = useDispatch();

  const prevTimelineLength = usePrevious(sumOfNestedArrayItems(timeline));
  const prevActiveRecipientId = usePrevious(activeRecipient.id);

  const prevSearch = usePrevious(search);
  const prevContextMsgId = usePrevious(contextMsgId);
  const prevContextDate = usePrevious(contextDate);
  const prevActiveChatSource = usePrevious(activeChatSource);
  // const prevIsShowReminders = usePrevious(isShowReminders);
  // const prevIsTimelineMedia = usePrevious(timelineMedia);

  const notForClient = props.notForClients?.find(
    (client) => client.caller_ignore_id === activeRecipient.id,
  );

  const onNameClick = () => {
    dispatch(openModal(MODAL_TYPES.contactCard, { contact: activeClient.id }));
  };

  useEffect(() => {
    isScroledDown && setIsScrolledDown(false);
  }, [activeRecipient.id, activeGroup]);

  useEffect(() => {
    // if we come from another page and timeline already loaded

    if (timeline.length && !isScroledDown) {
      scrollToBottom();
      setIsScrolledDown(true);
      // timelineRef.current.scrollToBottom();
    }
  }, [timeline]);

  useLayoutEffect(() => {
    // if first timeline page load

    // if (!prevTimelineLength && sumOfNestedArrayItems(timeline)
    //     || (prevActiveChatSource !== activeChatSource)
    //     || (prevActiveChatSource === activeChatSource && !scrollBottomRef.current)) {
    //   return scrollToBottom();
    //   // return timelineRef.current.scrollToBottom();
    // }

    // if search toggle or new search query => scroll to bottom
    if ((!prevSearch && search) || (prevSearch && !search) || (prevSearch && search && (prevSearch !== search))) {
      return timelineRef.current.scrollToBottom();
    }

    // if chat source changed => scroll to bottom
    if (prevActiveChatSource && activeChatSource && (prevActiveChatSource !== activeChatSource)) {
      return timelineRef.current.scrollToBottom();
    }
    // if ((!prevContextMsgId && contextMsgId) || (prevContextMsgId && !contextMsgId)) {
    // if message context toggle 
    if ((!prevContextMsgId && contextMsgId) || (prevContextMsgId && !contextMsgId)) {
      // if contextMessageId => scroll to contextMsg
      if (contextMsgRef.current) {
        // return contextMsgRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        return timelineRef.current.scrollTop(contextMsgRef.current.offsetTop - 30);
      }
      // if we close message context => scroll to bottom
      return timelineRef.current.scrollToBottom();
    }
    // if message context date toggle or change
    if ((!prevContextDate && contextDate) ||
      (prevContextDate && !contextDate) ||
      (prevContextDate && contextDate && (prevContextDate !== contextDate))
    ) {
      // if contextMessageId => scroll to contextMsg
      if (contextDateRef.current) {
        // return contextDateRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        return timelineRef.current.scrollTop(contextDateRef.current.offsetTop - 30);
      }
      // if we close message context => scroll to bottom
      return timelineRef.current.scrollToBottom();
    }

    // 
    if (activeRecipient.id === prevActiveRecipientId) {
      // timeline update
      if (prevTimelineLength && sumOfNestedArrayItems(timeline) !== prevTimelineLength) {
        if (newInteractionType) {
          // timeline update by new outgoing interaction => scroll to bottom
          if ([OUTGOING_CALL, OUTGOING_MSG].includes(newInteractionType)) {
            return timelineRef.current.scrollToBottom();
          }
          // timeline update by new incoming interaction => scroll to bottom
          else {
            const isBottom = timelineRef.current.getScrollHeight() - timelineRef.current.getScrollTop() - timelineRef.current.getClientHeight();

            if (isBottom <= 400) {
              return timelineRef.current.scrollToBottom();
            }
          }
        }
        // timeline update by getting new page
        else {
          // timeline update by getting new page with scrollTop => save scroll position
          if (lastLoadScrollDirection.current === 'up') {
            return timelineRef.current.scrollTop(timelineRef.current.getScrollHeight() - scrollPosition.current);
          }
        }
      }
      // if interaction attachment
      else if (prevTimelineLength && sumOfNestedArrayItems(timeline) === prevTimelineLength) {
        if (newInteractionType === MSG_ATTACHMENT) {
          const isBottom = timelineRef.current.getScrollHeight() - timelineRef.current.getScrollTop() - timelineRef.current.getClientHeight();

          if (isBottom <= 300) {
            return timelineRef.current.scrollToBottom();
          }
        }
      } else if (activeChatSource === CHAT_SOURCES.SYSTEM_MSGS) {
        return scrollToBottom();
      }
      return;
    }
    // any other situation
    return scrollToBottom();
  }, [timeline, activeRecipient.id, newInteractionType, activeChatSource, search, contextMsgId, contextDate, timelineRef.current]);

  const handleScroll = ({ target: { scrollTop, scrollHeight, clientHeight } }) => {
    const {
      updateContactTimeline,
      timelinePageCount,
      timelineLowerLoadedPage,
      timelineHigherLoadedPage,
    } = props;
    scrollBottomRef.current = scrollHeight - scrollTop - clientHeight;

    if (timelinePending || updatePending) {
      return;
    }

    //toggle scroll button
    if (!scrollBtn && scrollBottomRef.current >= 350) {
      setScrollBtn(true);
    } else if (scrollBtn && scrollBottomRef.current < 350) {
      setScrollBtn(false);
    }

    if ((scrollTop <= clientHeight) && !!timelineHigherLoadedPage && timelineHigherLoadedPage !== 1) { // this code for infinite scroll
      // if (scrollTop === 0 && timelineHigherLoadedPage !== 1) {
      // if we already have msgs more than our limit
      //TODO: some calculation for shift
      scrollPosition.current = scrollHeight - scrollTop;
      lastLoadScrollDirection.current = 'up';
      return updateContactTimeline(activeRecipient, timelineHigherLoadedPage - 1, 'up');
    } else if (scrollBottomRef.current === 0 && timelineLowerLoadedPage && timelineLowerLoadedPage !== timelinePageCount) {
      lastLoadScrollDirection.current = 'down';
      return updateContactTimeline(activeRecipient, timelineLowerLoadedPage + 1, 'down');
    }
  };

  const scrollToBottom = (scrollToNew) => {
    if (contextMsgRef.current) {
      return timelineRef.current.scrollTop(contextMsgRef.current.offsetTop - 30);
    }
    else if (unreadRef.current && scrollToNew) {
      return timelineRef.current.scrollTop(unreadRef.current.offsetTop - 30);
    }

    if (scrollBtn) {
      setScrollBtn(false);
    }

    timelineRef.current.scrollToBottom();
  };

  const smoothScroll = () => {
    const scrollStep = setInterval(() => {
      const isBottom = timelineRef.current.getScrollHeight() - timelineRef.current.getScrollTop() - timelineRef.current.getClientHeight();

      if (isBottom > 1) {
        timelineRef.current.scrollTop(timelineRef.current.getScrollTop() + 350);
      }
      else {
        clearInterval(scrollStep);
      }
    }, 15);
  }

  const preparedPinnedBookings = bookings
    ?.filter((booking) => [1, 2, 5].includes(booking?.status)) //pending, in-progress and pre-pending status
    .sort(({ date: prevDate }, { date: nextDate }) => {
      return moment(prevDate).diff(moment(nextDate));
    })

  return (
    <div
      className={classModifier('timeline', [props.publicChat && 'public'])}
      onClick={() => openModal(MODAL_TYPES.contactCard, { contact: activeClient?.id })}
    >
      <div className="pinned-items">
        {!!props.pinnedMsgs?.length && (props.type === CHAT_TYPES.GIRL && !activeGroup || props.type !== CHAT_TYPES.GIRL) &&
          <PinnedMsgs
            playMedia={props.playMedia}
            profileId={props.profileId}
            unpinMsg={props.unpinMsg}
            chatId={activeRecipient.id}
            getMessageContext={props.getMessageContext}
            activeRecipient={activeRecipient}
            type={props.type}
            pinnedMsgs={props.pinnedMsgs}
          />
        }
        {props.type === CHAT_TYPES.CLIENT && !!preparedPinnedBookings?.length && (
          <div className="pinned-items__bookings-wrapper">
            <details className="pinned-items__bookings">
              <summary className="pinned-booking__text">
                {preparedPinnedBookings.length} Bookings
              </summary>

              {preparedPinnedBookings.map((booking) => (
                <PinnedBookings
                  key={booking?.id}
                  booking={booking}
                  userTimezone={props.userTimezone}
                  userHour12={props.userHour12}
                />
              ))}
            </details>
          </div>
        )}
      </div>

      {notForClient && activeClient &&
        <div
          className='chat-notification'
        >
          <div className='chat-notification__details'>
            Do not book this provider for “{activeClient.fn}” Click to see the notes
          </div>

          <button
            className='chat-notification__icon-button'
            onClick={onNameClick}
          >
            <ICONS.penSquare className='chat-notification__icon' />
          </button>
        </div>
      }

      <Scrollbars
        onScroll={throttle(handleScroll, 300)}
        autoHide
        ref={timelineRef}
        renderThumbVertical={CustomScrollbarThumb}
        renderTrackVertical={CustomScrollbarTrack}
      >

        <InteractionsList
          pinMsg={props.pinMsg}
          activeRecipient={activeRecipient}
          activeGroup={activeGroup}
          type={props.type}
          search={search}
          timelinePending={props.timelinePending}
          editMsg={props.editMsg}
          playMedia={props.playMedia}
          timeline={props.timeline}
          profileId={props.profileId}
          userTimezone={props.userTimezone}
          userHour12={props.userHour12}
          unreadRef={unreadRef}
          showTimePickerForDateContext={props.showTimePickerForDateContext}
          getMessageContext={props.getMessageContext}
          addNewArrayGirlsToState={props.addNewArrayGirlsToState}
          contextMsgId={props.contextMsgId}
          contextMsgRef={contextMsgRef}
          contextDate={props.contextDate}
          contextDateRef={contextDateRef}
          shareMsg={props.shareMsg}
          replyMsg={props.replyMsg}
          publicChat={props.publicChat}
          isGlobalSearch={props.isGlobalSearch}
          startGlobalMsgSearch={props.startGlobalMsgSearch}
          removeMessageReminder={props.removeMessageReminder}
          updateActiveContact={props.updateActiveContact}
          openModal={props.openModal}
          isMainTimelineOpen={isMainTimelineOpen}
          activeChatSource={activeChatSource}

          timelineHigherLoadedPage={props.timelineHigherLoadedPage}
          updateContactTimeline={props.updateContactTimeline}
          isArchiveDisplayed={props.isArchiveDisplayed}
          isAuxiliaryArchiveDisplayed={props.isAuxiliaryArchiveDisplayed}
        />
      </Scrollbars>

      {scrollBtn &&
        <button
          className={classModifier('timeline__scroll-btn', [props.type === CHAT_TYPES.ROOM && 'operators'])}
          onClick={smoothScroll}
        >
          {props.type === CHAT_TYPES.ROOM && Boolean(activeRecipient.unreadCount) &&
            <mark className="timeline__new-message-count">
              {activeRecipient.unreadCount}
            </mark>
          }
          <ICONS.arrow className="timeline__btn-icon" />
        </button>
      }

      {(props.contextMsgId || props.contextDate) &&
        <button
          className="timeline__btn--search"
          title="Back to search results"
          onClick={() => props.contextMsgId
            ? props.getMessageContext(false, activeRecipient, search)
            : props.cleanContactDateMsgContext(props.type)
          }>
          ➥
        </button>
      }

      {props.updatePending &&
        <Spinner spinnerSize={25} className="timeline__update-spinner" />
      }
    </div>
  );
}



export default memo(ChatTimeline);
