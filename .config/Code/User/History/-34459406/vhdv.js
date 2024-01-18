import React from 'react';

import {
  getContactAvatar,
  classModifier
} from 'utils';
import { selectContactById, selectOperatorById, selectUserTimezone } from 'redux/selectors/selectors';
import { connect } from 'react-redux';
import { useToggle } from 'hooks';
import { BASE_DATE_CONFIG, TODO_MESSAGE_DATE_CONFIG } from 'config/dates-сonfig';

import ICONS from 'assets/icons';
import MsgText from './MsgText';
import API from 'api/api';
import InteractionAttachments from '../../ChatAttachments/InteractionAttachments';
import DateTime from 'components/DateTime';
import PinnedMsgAttachments from '../PinnedMsgs/PinnedMsgsAttachments';

const WebmasterMessage = ({
  interaction,
  userTimezone,
  userHour12,
  userId,
  girl,
  creatorUser,
  finisherUser,
  currentUserName,
}) => {
  const [isMsgExpanded, toggleMsgExpanded] = useToggle(false);

  const { webMasterTask } = interaction;
  const timeStampsArray = [
    ...(webMasterTask.is_completed ? [{
      text: 'completed',
      date: webMasterTask.date_finished,
      name: finisherUser.username,
    }] : []),
    {
      text: 'added',
      date: webMasterTask.date_created,
      name: creatorUser.username,
    }
  ]

  const handleMsgClick = (event) => {
    if (event.target.localName === 'input') {
      return;
    }

    toggleMsgExpanded();
  }

  return (
    <li
      className="interaction interaction--task"
      onClick={handleMsgClick}
    >
      <form className="interaction__completed-menu">
        {timeStampsArray.map((timeStamp, index) => (
          <p className="interaction__completed-item">
            {timeStamp.text}

            <DateTime
              date={timeStamp.date}
              config={TODO_MESSAGE_DATE_CONFIG}
              hoursToAbsolute={1}
            />

            by

            <span className="interaction__completed-name">
              {currentUserName === timeStamp.name ? 'You' : timeStamp.name}
            </span>

          </p>
            {!index &&
              <label className="checkbox-container interaction__checkbox-container">
                <input
                  type="checkbox"
                  style={{
                    cursor: webMasterTask.is_completed ? 'auto' : 'pointer',
                  }}
                  onChange={() => API.completeWebmasterTask(webMasterTask.id)}
                  defaultChecked={webMasterTask.is_completed}
                  disabled={webMasterTask.is_completed}
                />

                <span className="checkmark">
                  {Boolean(webMasterTask.is_completed) &&
                    <ICONS.check />
                  }
                </span>
              </label>
            }
        ))}
      </form>

      <header className="interaction__header">
        <div className={classModifier('interaction__ava', girl.availability)}>
          <img
            src={getContactAvatar(girl)}
            className="interaction__ava-img"
            alt="ava"
          />

          <ICONS.telegram className="interaction__ava-telegram-icon" />
        </div>

        <div className='interaction__header-info'>
          <span className="interaction__name">
            {girl && (girl.short_name || girl.fn)}
          </span>

          <DateTime
            className={classModifier('interaction__time', 'msg')}
            date={interaction.dateCreated}
            config={BASE_DATE_CONFIG}
          />
        </div>
      </header>

      <div className='interaction__text-wrap'>
        {(interaction.body || !interaction.attachments) &&
          <MsgText
            interaction={interaction}
            isMsgExpanded={isMsgExpanded}
            isCompleted={webMasterTask.is_completed}
          />
        }

        {interaction.attachments && (isMsgExpanded ? (
          <InteractionAttachments
            attachments={interaction.attachments}
            profileId={userId}
            userTimezone={userTimezone}
            userHour12={userHour12}
          />
        ) : (
          <PinnedMsgAttachments
            attachments={interaction.attachments}
            isMenuOpen={false}
          />
        ))}
      </div>
    </li>
  )
}

const mapStateToProps = (state, { interaction: { caller_id, webMasterTask } }) => ({
  girl: selectContactById(state, caller_id),
  creatorUser: selectOperatorById(state, webMasterTask.user_creator_id),
  finisherUser: selectOperatorById(state, webMasterTask.user_finisher_id),
  userId: state.user.id,
  userTimezone: selectUserTimezone(state),
  userHour12: state.user.hour12,
  currentUserName: state.user.username,
});

export default connect(mapStateToProps)(WebmasterMessage);
