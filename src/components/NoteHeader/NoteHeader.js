import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import NotePopup from 'components/NotePopup';
import NoteState from 'components/NoteState';
import Icon from 'components/Icon';
import NoteUnpostedCommentIndicator from 'components/NoteUnpostedCommentIndicator';
import getLatestActivityDate from "helpers/getLatestActivityDate";
import getColor from 'helpers/getColor';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { NotesPanelSortStrategy } from 'constants/sortStrategies';
import selectors from 'selectors';
import { useDispatch, useSelector } from 'react-redux';
import actions from 'actions';


import './NoteHeader.scss';



const propTypes = {
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  color: PropTypes.string,
  fillColor: PropTypes.string,
  annotation: PropTypes.object,
  language: PropTypes.string,
  noteDateFormat: PropTypes.string,
  isSelected: PropTypes.bool,
  setIsEditing: PropTypes.func,
  notesShowLastUpdatedDate: PropTypes.bool,
  isUnread: PropTypes.bool,
  renderAuthorName: PropTypes.func,
  isNoteStateDisabled: PropTypes.bool,
  isEditing: PropTypes.bool,
  noteIndex: PropTypes.number,
  sortStrategy: PropTypes.string,
};


function NoteHeader(props) {
  const {
    icon,
    iconColor,
    annotation,
    language,
    noteDateFormat,
    isSelected,
    setIsEditing,
    notesShowLastUpdatedDate,
    isReply,
    isUnread,
    renderAuthorName,
    isNoteStateDisabled,
    isEditing,
    noteIndex,
    sortStrategy,
  } = props;

  const [t] = useTranslation();
  const date = (sortStrategy === NotesPanelSortStrategy.MODIFIED_DATE || (notesShowLastUpdatedDate && sortStrategy !== NotesPanelSortStrategy.CREATED_DATE)) ? getLatestActivityDate(annotation) : annotation.DateCreated;
  const numberOfReplies = annotation.getReplies().length;
  let color = annotation[iconColor]?.toHexString?.();
  const fillColor = getColor(annotation.FillColor);

  const [customLink, setCustomLink] = useState(null);
  const [customPrivate, setCustomPrivate] = useState(null);
  const [customDate, setCustomDate] = useState(null);
  const [customTag, setCustomTag] = useState(null);
  const [showHeader, setShowHeader] = useState(true);

  const setCustomData = () => {
    let cl = annotation.getCustomData('custom-link');
    let cp = annotation.getCustomData('custom-private');
    let cd = annotation.getCustomData('custom-date');
    let ct = annotation.getCustomData('custom-tag-options');

    if (cl != null && cl != undefined)
    {
      setCustomLink(cl)
    }

    if (cp != null && cp != undefined)
    {
      setCustomPrivate(cp)
    }

    if (cd != null && cd != undefined)
    {
      setCustomDate(cd)
    }

    if (ct != null && ct != undefined && ct != '') {
      let joinedTag = JSON.parse(ct);
      joinedTag = joinedTag ? joinedTag.map(m => m.label).join(',') : '';
      setCustomTag(joinedTag)
    }
  }

  // useEffect(() => {
  //   console.log(`for annotation ${annotation.Id} noteIndex = ${noteIndex} isEditing = ${isEditing}`)
  //   setCustomData();
  // })

  useEffect(() => {
    setCustomData();
  }, [])

  useEffect(()=>{
    if (annotation.Subject === 'Redact'){
      debugger
    }
    if (isEditing === true && isSelected === true){
      setShowHeader(false)
    } else {
      setCustomData();
      setShowHeader(true)
    }
  }, [isEditing, isSelected])

  const authorAndDateClass = classNames('author-and-date', { isReply });
  const noteHeaderClass = classNames('NoteHeader', { parent: !isReply })

  return (
    <div className={noteHeaderClass}>
      {!isReply &&
        <div className="type-icon-container">
          {isUnread &&
            <div className="unread-notification"></div>
          }
          <Icon className="type-icon" glyph={icon} color={color} fillColor={fillColor} />
        </div>
      }
      <div className={authorAndDateClass}>
        <div className="author-and-overflow">
          <div className="author-and-time">
            <div className='author'>
              {renderAuthorName(annotation)}
            </div>
            { showHeader && (<div>
              <div>
                {`Visibility : ${customPrivate === 'true' ? 'private' : 'public'}`}
              </div>
              <div>
                {`Date : ${customDate === '' ? 'not set' : customDate}`}
              </div>
              <div>
                {customLink != '' ? `URL : ${customLink}` : ''}
              </div>
              <div>
                {customTag !== '[]' ? customTag : ''}
              </div>
            </div>)}
            <div className="date-and-num-replies">
              <div className="date-and-time">
                {date ? dayjs(date).locale(language).format(noteDateFormat) : t('option.notesPanel.noteContent.noDate')}
              </div>
              {numberOfReplies > 0 && !isSelected &&
                <div className="num-replies-container">
                  <Icon className="num-reply-icon" glyph={"icon-chat-bubble"} />
                  <div className="num-replies">{numberOfReplies}</div>
                </div>}
            </div>
          </div>
          <div className="state-and-overflow">
            <NoteUnpostedCommentIndicator annotationId={annotation.Id} />
            {/* {!isNoteStateDisabled && !isReply &&
              <NoteState
                annotation={annotation}
                isSelected={isSelected}
              />
            } */}
            {!isEditing && isSelected &&
              <NotePopup
                noteIndex={noteIndex}
                annotation={annotation}
                setIsEditing={setIsEditing}
                isReply={isReply}
              />}
          </div>
        </div>
      </div>
    </div>
  )
};

NoteHeader.propTypes = propTypes;

export default NoteHeader;