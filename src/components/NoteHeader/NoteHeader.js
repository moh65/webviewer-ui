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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Tag from 'components/Tag';

import './NoteHeader.scss';
import { typeOf } from 'react-is';
import { format } from 'date-fns';
import { ConstructionOutlined } from '@mui/icons-material';



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

  let [
    currentDocumentInfo
  ] = useSelector(state => [
    selectors.getThisDocumentInfo(state),
  ]);

  currentDocumentInfo = currentDocumentInfo && currentDocumentInfo.id ? currentDocumentInfo : {
    id: 4043,
    title: 'Annette Wallis Atkins Costs Disclosure Signed',
    dateFormat: 'dd-MM-yyyy',
    timeFormat: 'HH:mm:ss'
  };

  currentDocumentInfo.displayDateFormat = "" + currentDocumentInfo.dateFormat.toLocaleUpperCase();
  currentDocumentInfo.dateFormat = currentDocumentInfo.dateFormat.replace('DD', 'dd').replace('YY', 'yy'); 

  const [t] = useTranslation();
  const date = (sortStrategy === NotesPanelSortStrategy.MODIFIED_DATE || (notesShowLastUpdatedDate && sortStrategy !== NotesPanelSortStrategy.CREATED_DATE)) ? getLatestActivityDate(annotation) : annotation.DateCreated;
  const numberOfReplies = annotation.getReplies().length;
  let color = annotation[iconColor]?.toHexString?.();
  const fillColor = getColor(annotation.FillColor);

  const getCustomData = () => {
    const result = { cl: null, cp: null, cd: '', tags: null, ci: false};

    let cl = annotation.getCustomData('custom-link');
    let cp = annotation.getCustomData('custom-private');
    let cd = annotation.getCustomData('custom-date');
    let ct = annotation.getCustomData('custom-tag-options');
    let ci = annotation.getCustomData('custom-imported');

    if (cl != null && cl != undefined) {
      result.cl = cl;
    }

    if (cp != null && cp != undefined) {
      result.cp = cp;
    } 
    if (cd != 'null' && cd !== null && cd !== undefined && cd != '') {
      result.cd = format(Date.parse(cd), currentDocumentInfo.dateFormat);
    }

    if (ct !== null && ct !== undefined && ct !== '') {
      const tags = JSON.parse(ct);
      result.tags = [...tags];
    }

    if (ci != null && ci != undefined) {
      result.ci = ci;
    }

    return result;
  };
  

  let [customLink, setCustomLink] = useState(null);
  let [customPrivate, setCustomPrivate] = useState(null);
  let [customDate, setCustomDate] = useState(null);
  let [customTag, setCustomTag] = useState(null);
  let [showHeader, setShowHeader] = useState(true);
  let [customImported, setCustomImporter] = useState(false);

  const InitaliseCustomData = () => {
    const customData = getCustomData();
    customLink = customData.cl;
    customPrivate = customData.cp;
    customDate = customData.cd;   
    customTag = customData.tags;
    customImported = customData.ci;
  }

  InitaliseCustomData();
  
  const setCustomData = () => {
    const customData = getCustomData();
    
    setCustomLink(customData.cl);
    setCustomPrivate(customData.cp);
    setCustomDate(customData.cd);   
    setCustomTag(customData.tags);
    setCustomImporter(customData.ci);
  }

  useEffect(() => {
    if (isEditing === true && isSelected === true) {
      setShowHeader(false);
    } else {
      setCustomData();
      setShowHeader(true);
    }
  }, [isEditing, isSelected]);

  const authorAndDateClass = classNames('author-and-date', { isReply });
  const noteHeaderClass = classNames('NoteHeader', { parent: !isReply });

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
            <div className="row-flex mb-1">
              <div className="col-grow author">
                {renderAuthorName(annotation)}
              </div>
              <div className="col-shrink">
                <div className="date-and-time">
                  {date ? dayjs(date).locale(language).format(noteDateFormat) : t('option.notesPanel.noteContent.noDate')}
                </div>
              </div>
            </div>
            { showHeader && !isReply && (
              <div className="row-flex mb-1">
                <div className="col-grow visibility">
                  {customPrivate === 'true'
                    ? <><FontAwesomeIcon icon={faEyeSlash} /> Private</>
                    : <><FontAwesomeIcon icon={faEye} /> Public</>
                  }
                </div>
                {numberOfReplies > 0 &&
                  <div className="col-shrink num-replies-container">
                    <Icon className="num-reply-icon" glyph={"icon-chat-bubble"} />
                    <div className="num-replies">{numberOfReplies}</div>
                  </div>
                }
              </div>
            )}
            { showHeader && (
              <div>
                {customTag && (
                  <div className="note-detail custom-tag-container">
                    {
                    customTag.map(
                      ({ label, value }) => (
                        <Tag key={label} label={label} value={value} />
                      )
                    )}
                  </div>
                )}
                {customDate && customDate !== 'null' && (
                  <div className="note-detail">
                    <strong>Date:</strong> {customDate}
                  </div>
                )}
                {customLink !== '' && (
                  <div className="note-detail">
                    <strong>URL:</strong> {customLink.replace('&amp;', '&')}
                  </div>
                )}
              </div>
            )}
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
                customImported={customImported}
              />}
          </div>
        </div>
      </div>
    </div>
  );
}

NoteHeader.propTypes = propTypes;

export default NoteHeader;