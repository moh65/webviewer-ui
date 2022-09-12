import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NoteContext from 'components/Note/Context';
import NoteContent from 'components/NoteContent';
import ReplyArea from 'components/Note/ReplyArea';

import selectors from 'selectors';
import actions from 'actions';
import core from 'core';
import AnnotationNoteConnectorLine from 'components/AnnotationNoteConnectorLine';
import useDidUpdate from 'hooks/useDidUpdate';
import Button from 'components/Button';

import './Note.scss';

const propTypes = {
  annotation: PropTypes.object.isRequired,
};

let currId = 0;

const Note = ({
  annotation,
}) => {
  const { isSelected, resize, pendingEditTextMap, setPendingEditText, isContentEditable, isDocumentReadOnly, isNotePanelOpen, isExpandedFromSearch } = useContext(NoteContext);
  const containerRef = useRef();
  const containerHeightRef = useRef();
  const [isEditingMap, setIsEditingMap] = useState({});
  const ids = useRef([]);
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const unreadReplyIdSet = new Set();

  if (annotation.Subject === "Rectangle" || annotation.Subject === "Ellipse") {
    annotation.FillColor.G = annotation.StrokeColor.G;
    annotation.FillColor.R = annotation.StrokeColor.R;
    annotation.FillColor.B = annotation.StrokeColor.B;
    annotation.FillColor.A = 0.1;
    annotation.Opacity = 1.0;
    core.getAnnotationManager().redrawAnnotation(annotation);
  }

  const [
    noteTransformFunction,
    customNoteSelectionFunction,
    unreadAnnotationIdSet,
    defaultTag,
  ] = useSelector(
    state => [
      selectors.getNoteTransformFunction(state),
      selectors.getCustomNoteSelectionFunction(state),
      selectors.getUnreadAnnotationIdSet(state),
      selectors.getDefaultTag(state),
    ],
    shallowEqual,
  );

  const replies = annotation
    .getReplies()
    .sort((a, b) => a['DateCreated'] - b['DateCreated']);

  replies.filter(r => unreadAnnotationIdSet.has(r.Id)).forEach(r => unreadReplyIdSet.add(r.Id));

  useEffect(() => {
    const annotationChangedListener = (annotations, action) => {
      if (action === 'delete') {
        annotations.forEach(annot => {
          if (unreadAnnotationIdSet.has(annot.Id)) {
            dispatch(actions.setAnnotationReadState({ isRead: true, annotationId: annot.Id }));
          }
        });
      }
    };
    core.addEventListener('annotationChanged', annotationChangedListener);

    return () => {
      core.removeEventListener('annotationChanged', annotationChangedListener);
    };
  }, [unreadAnnotationIdSet]);




  useEffect(() => {
    const prevHeight = containerHeightRef.current;
    const currHeight = containerRef.current.getBoundingClientRect().height;
    containerHeightRef.current = currHeight;

    // have a prevHeight check here because we don't want to call resize on mount
    // use Math.round because in some cases in IE11 these two numbers will differ in just 0.00001
    // and we don't want call resize in this case
    if (prevHeight && Math.round(prevHeight) !== Math.round(currHeight)) {
      resize();
    }
  });

  useEffect(() => {
    if (noteTransformFunction) {
      ids.current.forEach(id => {
        const child = document.querySelector(`[data-webviewer-custom-element='${id}']`);
        if (child) {
          child.parentNode.removeChild(child);
        }
      });

      ids.current = [];

      const state = {
        annotation,
        isSelected,
      };

      noteTransformFunction(containerRef.current, state, (...params) => {
        const element = document.createElement(...params);
        const id = `custom-element-${currId}`;
        currId++;
        ids.current.push(id);
        element.setAttribute('data-webviewer-custom-element', id);
        element.addEventListener('mousedown', e => {
          e.stopPropagation();
        });

        return element;
      });
    }
  });

  useEffect(() => {
    //If this is not a new one, rebuild the isEditing map
    const pendingText = pendingEditTextMap[annotation.Id]

    if ((pendingText !== '' && isContentEditable && !isDocumentReadOnly)) {
      let editmode = annotation.getCustomData('edit-mode');
      if (editmode !== "0")
      {
        setIsEditing(true, 0);
        // console.warn('editmode, set edit to true for annotid = ' + annotation.Id)
      }
    }
  }, [isDocumentReadOnly, isContentEditable, setIsEditing, annotation]);

  useDidUpdate(() => {
    if (isDocumentReadOnly || !isContentEditable) {
      setIsEditing(false, 0);
      // console.warn('editmode, set to false in didupdate annotid = ' + annotation.Id)
    }
  }, [isDocumentReadOnly, isContentEditable, setIsEditing])

  const handleNoteClick = e => {
    // stop bubbling up otherwise the note will be closed
    // due to annotation deselection
    e && e.stopPropagation();

    if (isNotePanelOpen && unreadAnnotationIdSet.has(annotation.Id)) {
      dispatch(actions.setAnnotationReadState({ isRead: true, annotationId: annotation.Id }));
    }

    if (!isSelected) {
      customNoteSelectionFunction && customNoteSelectionFunction(annotation);
      core.deselectAllAnnotations();
      core.selectAnnotation(annotation);
      core.jumpToAnnotation(annotation);

      // Need this delay to ensure all other event listeners fire before we open the line
      setTimeout(() => dispatch(actions.openElement('annotationNoteConnectorLine')), 300);
    }
  };

  const hasUnreadReplies = unreadReplyIdSet.size > 0;

  const noteClass = classNames({
    Note: true,
    expanded: isSelected,
    unread: unreadAnnotationIdSet.has(annotation.Id) || hasUnreadReplies,
  });

  const repliesClass = classNames({
    replies: true,
    hidden: !isSelected,
  });

  useEffect(() => {
    //Must also restore the isEdit for  any replies, in case someone was editing a
    //reply when a comment was placed above
    replies.forEach((reply, index) => {
      const pendingText = pendingEditTextMap[reply.Id]
      if ((pendingText !== '' && typeof pendingText !== 'undefined') && isSelected) {
        setIsEditing(true, 1 + index);
      }
    })

    if (!isSelected) {
      if (removeButtonContents) {
        removeButtonContents();
      }
      
      // let editmode = annotation.getCustomData('edit-mode');
      // let subject = annotation.Subject;
      // console.warn('editmode in unselected, subject is ' + subject + ' and edit mode = ' + editmode)      
      setIsEditing(false, 0);
    } else {

      let editmode = annotation.getCustomData('edit-mode');
      let subject = annotation.Subject;
      // console.warn('editmode in selected, subject is ' + subject + ' and edit mode = ' + editmode)
      if (editmode !== "0")
      {
        setIsEditing(true, 0);
        if (subject === 'Note' && !annotation.InReplyTo && editmode === '1'){
          let editmodeCount = annotation.getCustomData('edit-mode-count');
          // console.warn('editmode in count, subject is ' + subject + ' and edit mode count = ' + editmodeCount)

          if (!editmodeCount){
            annotation.setCustomData('edit-mode-count', 1)
          } else {
            annotation.setCustomData('edit-mode', "0");
          }
        } else {
          annotation.setCustomData('edit-mode', "0");
        }
      }
      else 
      {
        setIsEditing(false, 0);
      }

      
      //console.warn('editmode, annotation is selected  ' + annotation.Id)
    }
  }, [isSelected]);

  const removeButtonContents = () => {
    const container = document.getElementById('annotation-footer-' + annotation.Id);

    if (container) {
      ReactDOM.render(
        <div></div>
        , container);
    }
  }

  const showReplyArea = !Object.values(isEditingMap).some(val => val);

  const handleNoteKeydown = e => {

    // Click if enter or space is pressed and is current target.
    const isNote = e.target === e.currentTarget;
    if (isNote && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); // Stop from being entered in field
      handleNoteClick();
    }
  };

  const handleReplyClicked = reply => {
    //set clicked reply as read
    if (unreadReplyIdSet.has(reply.Id)) {
      dispatch(actions.setAnnotationReadState({ isRead: true, annotationId: reply.Id }));
      core.getAnnotationManager().selectAnnotation(reply);
    }
  };

  const markAllRepliesRead = () => {
    //set all replies to read state if user starts to type in reply textarea
    if (unreadReplyIdSet.size > 0) {
      const repliesSetToRead = replies.filter(r => unreadReplyIdSet.has(r.Id));
      core.getAnnotationManager().selectAnnotations(repliesSetToRead);
      repliesSetToRead.forEach(r => dispatch(actions.setAnnotationReadState({ isRead: true, annotationId: r.Id })));
    }
  };

  const setIsEditing = useCallback(
    (isEditing, index) => {
      setIsEditingMap(map => ({
        ...map,
        [index]: isEditing,
      }));
    },
    [setIsEditingMap],
  );

  //apply unread reply style to replyArea if the last reply is unread
  const lastReplyId = replies.length > 0 ? replies[replies.length - 1].Id : null;
  return (
    <div
      role="button"
      tabIndex={0}
      ref={containerRef}
      className={noteClass}
      onClick={handleNoteClick}
      onKeyDown={handleNoteKeydown}
      id={`note_${annotation.Id}`}
    >
      <NoteContent
        noteIndex={0}
        annotation={annotation}
        isSelected={isSelected}
        setIsEditing={setIsEditing}
        isEditing={isEditingMap[0]}
        textAreaValue={pendingEditTextMap[annotation.Id]}
        onTextChange={setPendingEditText}
        isNonReplyNoteRead={!unreadAnnotationIdSet.has(annotation.Id)}
        isUnread={unreadAnnotationIdSet.has(annotation.Id) || hasUnreadReplies}
      />
      {(isSelected || isExpandedFromSearch) && (
        <React.Fragment>
          {replies.length > 0 && (
            <div className={repliesClass}>
              {hasUnreadReplies && (
                <Button
                  dataElement="markAllReadButton"
                  className="mark-all-read-button"
                  label={t('action.markAllRead')}
                  onClick={markAllRepliesRead}
                />
              )}
              {replies.map((reply, i) => (
                <div className="reply" id={`note_reply_${reply.Id}`} key={`note_reply_${reply.Id}`}>
                  <NoteContent
                    noteIndex={i + 1}
                    key={reply.Id}
                    annotation={reply}
                    setIsEditing={setIsEditing}
                    isEditing={isEditingMap[i + 1]}
                    onTextChange={setPendingEditText}
                    onReplyClicked={handleReplyClicked}
                    isUnread={unreadAnnotationIdSet.has(reply.Id)}
                  />
                </div>
              ))}
            </div>
          )}
          {showReplyArea && (
            <ReplyArea
              isUnread={lastReplyId && unreadAnnotationIdSet.has(lastReplyId)}
              onPendingReplyChange={markAllRepliesRead}
              annotation={annotation}
            />
          )}
        </React.Fragment>
      )}
      <div id={('annotation-footer-' + annotation.Id)}></div>
      {isSelected && <AnnotationNoteConnectorLine annotation={annotation} noteContainerRef={containerRef} />}
    </div>
  );
};

Note.propTypes = propTypes;

export default Note;