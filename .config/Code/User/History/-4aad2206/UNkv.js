import React, { useState, useRef, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useToggle, useDidUpdate } from "hooks";
import { CHAT_SOURCES, CHAT_TYPES } from "config/constants";
import { changeChatSource } from "redux/ducks/girlChats";

import "./ChatSources.scss";
import SearchInput from "components/SearchInput/SearchInput";
import ICONS from "assets/icons";
import { classModifier } from "utils";

const ChatSources = (props) => {
  const {
    activeRecipient,
    isGlobalSearch,
    search,
    showSearchQuery,
    contextDate,
    activeChatSource,
    searchSource = 'contacts',
    modifier,
  } = props;

  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [ignoreRequest, setIgnoreRequest] = useToggle(false);
  const [showSearch, toggleShowSearch] = useToggle(!Boolean(activeChatSource));

  const searchInputRef = useRef();

  const isGirlType = Number(activeRecipient.type) === CHAT_TYPES.GIRL;

  // if global search from another type of chat => open searchBar with query
  useEffect(() => {
    if (showSearchQuery && searchSource === 'msgs') {
      if (search && search.length > 1) {
        setQuery(search);
        toggleShowSearch(true);
      }
    }
    else if (showSearchQuery) {
      if (search && search.length > 1) {
        setQuery(search);
          toggleShowSearch(true);
        setIgnoreRequest(true);
      }
    } else if (!showSearchQuery) {
      setIgnoreRequest(false);
    }
    // if we start to search when timelineMedia is open
    if (search && search.length > 1) {
      dispatch(changeChatSource(CHAT_SOURCES.MSGS, activeRecipient.type));
    }
  }, [showSearchQuery, search]);

  useEffect(() => {
    if (props.setIsSearchOpen) {
      props.setIsSearchOpen(showSearch);
    }
  }, [showSearch]);

  useDidUpdate(() => {
    
    if (query && !isGlobalSearch) {
      setQuery("");
    }
    if (!isGlobalSearch) {
      toggleShowSearch(false);
      if (isGirlType) {
        dispatch(changeChatSource(CHAT_SOURCES.SYSTEM_MSGS, activeRecipient.type));
      } else {
        dispatch(changeChatSource(CHAT_SOURCES.MSGS, activeRecipient.type));
      }
    }
  }, [activeRecipient.id]);

  useEffect(() => {
    if (contextDate) {
      if (query) {
        setQuery("");
        toggleShowSearch(false);
      }
      dispatch(changeChatSource(CHAT_SOURCES.MSGS, activeRecipient.type));
    }
  }, [contextDate]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (activeChatSource) {
      if (!showSearch) {
        toggleShowSearch();
  
        return searchInputRef.current.focus();
      }
      if (!query) {
        return toggleShowSearch();
      }
    }
  };

  const getIsSelectedSource = (source) => activeChatSource === source;

  const getSelectedClass = (source) => getIsSelectedSource(source)
    ? "chat-sources__source-btn--selected"
    : "";

  const remindersNumFromState = useSelector((state) =>
    isGirlType
      ? state.girlChats.remindersCount
      : state.clientChats.remindersCount
  );

  return (
    <div className={classModifier('chat-sources', [showSearch && 'search', modifier])}>
      <button
        title='chat'
        className={`chat-sources__source-btn ${getSelectedClass(CHAT_SOURCES.MSGS)}`}
        onClick={() => dispatch(changeChatSource(CHAT_SOURCES.MSGS, activeRecipient.type))}
      >
        <ICONS.comments className="chat-sources__icon" />
      </button>

      <button
        title='media'
        className={`chat-sources__source-btn ${getSelectedClass(CHAT_SOURCES.MEDIA)}`}
        onClick={() => dispatch(changeChatSource(CHAT_SOURCES.MEDIA, activeRecipient.type))}
      >
        <ICONS.media className="chat-sources__icon" />
      </button>
      
      {props.type !== CHAT_TYPES.ROOM && props.type !== CHAT_TYPES.GIRLROOM && (
        <>
          <button
            title='reminders'
            className={`chat-sources__source-btn ${getSelectedClass(CHAT_SOURCES.REMINDERS)}`}
            onClick={() => dispatch(changeChatSource(CHAT_SOURCES.REMINDERS, activeRecipient.type))}
          >
            {remindersNumFromState > 0 && 
              <span className={classModifier("chat-sources__source-btn", "counter")}>
                {remindersNumFromState}
              </span>
            }
            <ICONS.checkbox className="chat-sources__icon" />
          </button>

          <button
            title='scheduled messages'
            className={`chat-sources__source-btn ${getSelectedClass(CHAT_SOURCES.SCHEDULED_MSGS)}`}
            onClick={() => dispatch(changeChatSource(CHAT_SOURCES.SCHEDULED_MSGS, activeRecipient.type))}
          >
            {!!props.scheduledMsgsCount &&
              <span className="chat-sources__count">
                {props.scheduledMsgsCount > 99 ? '+99' : props.scheduledMsgsCount}
              </span>
            }

            <ICONS.history className="chat-sources__icon" />
          </button>
        </>
      )}

      {(props.type === CHAT_TYPES.GIRLROOM || isGirlType) &&
        <button
          title='service messages'
          className={`chat-sources__source-btn ${getSelectedClass(CHAT_SOURCES.SYSTEM_MSGS)}`}
          onClick={() => dispatch(changeChatSource(CHAT_SOURCES.SYSTEM_MSGS, activeRecipient.type))}
        >
          <ICONS.messageWarn className='chat-sources__icon' />
        </button>
      }
      
      <form
        action=""
        className={classModifier('chat-sources__search-form', showSearch && 'open')}
      >
        <SearchInput
          startSearch={ignoreRequest ? () => console.log('ignore') : props.startMessageSearch}
          stopSearch={props.stopMessageSearch}
          inputRef={searchInputRef}
          query={query}
          setQuery={setQuery}
        />

        {query.length >= 2 && (
          <button
            className="chat-sources__clear-btn"
            onClick={() => setQuery('')}
            type="button"
            >
            <ICONS.close className="chat-sources__clear-btn-icon"/>
          </button>
        )}

        <button
          type="submit"
          title="search"
          className={classModifier("chat-sources__search-btn", modifier)}
          onClick={handleSearch}
          disabled={activeChatSource === CHAT_SOURCES.SYSTEM_MSGS}
        >
          <ICONS.search className={classModifier('chat-sources__search-btn-icon', showSearch && 'active')} />
        </button>
      </form>
    </div>
  );
};


export default memo(ChatSources);
