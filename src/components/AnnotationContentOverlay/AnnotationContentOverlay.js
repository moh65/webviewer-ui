/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import core from 'core';
import { isMobileDevice } from 'helpers/device';
import selectors from 'selectors';

import './AnnotationContentOverlay.scss';
import actions from 'actions';

import CustomElement from '../CustomElement';
import FormFieldPlaceHolderOverlay from './FormFieldPlaceHolderOverlay';
import Tag from 'components/Tag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const MAX_CHARACTERS = 100;

const AnnotationContentOverlay = () => {
  const [isDisabled, isOverlayOpen] = useSelector(state =>
    [
      selectors.isElementDisabled(state, 'annotationContentOverlay'),
      selectors.isElementOpen(state, 'annotationContentOverlay'),
    ]

  );
  const [t] = useTranslation();
  //customization
  const [annotation, setAnnotation] = useState();
  const [annotationVisibility, setAnnotationVisibility] = useState(false);
  const [annotationDate, setAnnotationDate] = useState('');
  const [tagsName, setTagsName] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  //customization
  const [overlayPosition, setOverlayPosition] = useState({
    left: 0,
    top: 0,
  });
  const dispatch = useDispatch();
  // Clients have the option to customize how the tooltip is rendered
  // by passing a handler
  const customHandler = useSelector(state =>
    selectors.getAnnotationContentOverlayHandler(state),
  );
  const isUsingCustomHandler = customHandler !== null;
  const overlayRef = useRef(null);
  const contents = annotation?.getContents();
  // the gap between the component and the mouse, to make sure that the mouse won't be on component element
  // so that the underlying annotation will always be hovered
  const gap = 20;

  useEffect(() => {
    const fitWindowSize = (e, left, top) => {
      const overlayRect = overlayRef.current.getBoundingClientRect();

      if (left + overlayRect.width > window.innerWidth) {
        left = e.clientX - overlayRect.width - gap;
      }

      if (top + overlayRect.height > window.innerHeight) {
        top = e.clientY - overlayRect.height - gap;
      }

      if (top <= 0) {
        top = 0
      }

      return { left, top };
    }

    const onMouseHover = e => {
      const viewElement = core.getViewerElement();
      let annotation = core
        .getAnnotationManager()
        .getAnnotationByMouseEvent(e);

      if (annotation && viewElement.contains(e.target)) {
        // if hovered annot is grouped, pick the "primary" annot to match Adobe's behavior
        const groupedAnnots = core.getAnnotationManager().getGroupAnnotations(annotation);
        const ungroupedAnnots = groupedAnnots.filter(annot => !annot.isGrouped());
        annotation = ungroupedAnnots.length > 0 ? ungroupedAnnots[0] : annotation;

        //customization
        setAnnotationVisibility(annotation.getCustomData('custom-private'));
        setAnnotationDate(annotation.getCustomData('custom-date'));
        let tags = annotation.getCustomData('custom-tag-options');

        if (tags != null && tags !== '') {
          const customTags = JSON.parse(tags);
          setTagsName([...customTags]);
        }

        let link = annotation.getCustomData('custom-link');
        setLinkUrl(link && link !== '' && link != {} ? link : null);
        //customization

        if (isUsingCustomHandler || !(annotation instanceof Annotations.FreeTextAnnotation)) {
          setAnnotation(annotation);
          if (overlayRef.current) {
            const { left, top } = fitWindowSize(e, e.clientX + gap, e.clientY + gap);
            setOverlayPosition({ left, top });
          }
        }

        dispatch(actions.openElement('annotationContentOverlay'));
      } else {
        setAnnotation(null);
        dispatch(actions.closeElement('annotationContentOverlay'));
      }
    };

    core.addEventListener('mouseMove', onMouseHover);
    return () => {
      core.removeEventListener('mouseMove', onMouseHover);
    };
  }, [annotation, dispatch, isUsingCustomHandler]);

  const numberOfReplies = annotation?.getReplies().length;

  const preRenderedElements = isUsingCustomHandler && annotation ? customHandler(annotation) : null;

  const customRender = useCallback(() => preRenderedElements, [preRenderedElements]);

  const renderContents = () => (
    <div
      className="Overlay AnnotationContentOverlay"
      data-element="annotationContentOverlay"
      style={{ ...overlayPosition }}
      ref={overlayRef}
    >
      <div className="author">{core.getDisplayAuthor(annotation['Author'])}</div>

      {/*customization*/}
      <div className='note-detail'>
        {
          annotationVisibility === 'true'
            ? <><FontAwesomeIcon icon={faEyeSlash} /> Private</>
            : <><FontAwesomeIcon icon={faEye} /> Public</>
        }
      </div>
      {tagsName && (
      <div className="note-detail custom-tag-container">
        {
        tagsName.map(
          ({ label, value }) => (
            <Tag key={label} label={label} value={value} />
          )
        )}
      </div>
      )}
      {annotationDate != null && annotationDate != '' && annotationDate != 'null' && annotationDate != 'yyyy-mm-dd' && (
      <div className='note-detail'>
          <strong>Date:</strong> {annotationDate}
      </div>
      )}
      { contents &&
      <div className="note-detail contents">
        {contents.length > MAX_CHARACTERS
          ? `${contents.slice(0, MAX_CHARACTERS)}...`
          : contents}
      </div>
      }
      {
        linkUrl != null && (
        <div className='note-detail'>
          <strong>Link:</strong> {linkUrl}
        </div>
      )}
      {/*customization*/}
      {numberOfReplies > 0 && (
        <div className="replies">
          {t('message.annotationReplyCount', { count: numberOfReplies })}
        </div>
      )}
    </div>
  );

  if (isDisabled || isMobileDevice || !annotation) {
    return null;
  }

  if (isUsingCustomHandler && isOverlayOpen && preRenderedElements !== undefined) {
    if (preRenderedElements) {
      return (
        <div
          className="Overlay AnnotationContentOverlay"
          data-element="annotationContentOverlay"
          style={{ ...overlayPosition }}
          ref={overlayRef}
        >
          <CustomElement render={customRender} />
        </div>
      );
    }
    return null;
  }

  if (annotation.isFormFieldPlaceholder() && isOverlayOpen) {
    return (
      <FormFieldPlaceHolderOverlay
        annotation={annotation}
        overlayPosition={overlayPosition}
        overlayRef={overlayRef} />
    )
  }

  if (isOverlayOpen) {
    return renderContents();
  }

  return null;
};

export default AnnotationContentOverlay;
