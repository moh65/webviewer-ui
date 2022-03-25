import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import defaultTool from 'constants/defaultTool';
import Events from 'constants/events';
import core from 'core';
import actions from 'actions';
import selectors from 'selectors';
import fireEvent from 'helpers/fireEvent';
import { rgbaToHex, hexToRgba } from 'helpers/color';

import Choice from 'components/Choice';
import Button from 'components/Button';

import { Swipeable } from 'react-swipeable';
import { FocusTrap } from '@pdftron/webviewer-react-toolkit';

import './FilterAnnotModal.scss';
import { bool } from 'prop-types';

//customization

import { getAnnotationClass, getAnnotationClassForFilterModal } from 'helpers/getAnnotationClass';
import TagDropDown from 'components/TagDropDown';
//customization
const hidden = [];

const FilterAnnotModal = () => {
  const [isDisabled, isOpen] = useSelector(state => [
    selectors.isElementDisabled(state, 'filterModal'),
    selectors.isElementOpen(state, 'filterModal')

  ]);
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [authors, setAuthors] = useState([]);
  const [annotTypes, setAnnotTypes] = useState([]);
  const [colors, setColorTypes] = useState([]);
  const [statuses, setStatusTypes] = useState([]);

  const [authorFilter, setAuthorFilter] = useState([]);
  const [typesFilter, setTypesFilter] = useState([]);
  const [colorFilter, setColorFilter] = useState([]);
  const [checkRepliesForAuthorFilter, setCheckRepliesForAuthorFilter] = useState(true);
  const [statusFilter, setStatusFilter] = useState([]);

  //customization

  const [privateFilter, setPrivateFilter] = useState(false);
  const [toDateRange, setToDateRange] = useState('yyyy-mm-dd');
  const [fromDateRange, setFromDateRange] = useState('yyyy-mm-dd');
  const [filteredTags, setFilteredTags] = useState([]);
  //customization



  const similarColorExist = (currColor, newColor) => {
    const colorObject = currColor.map(c => Object.assign({
      R: parseInt(`${c[1]}${c[2]}`, 16),
      G: parseInt(`${c[3]}${c[4]}`, 16),
      B: parseInt(`${c[5]}${c[6]}`, 16)
    }));

    const threshold = 10;
    const similarColors = colorObject
      .filter(c => Math.abs(newColor.R - c.R) < threshold
        && Math.abs(newColor.G - c.G) < threshold
        && Math.abs(newColor.B - c.B) < threshold);

    return !!similarColors.length;
  }



  const filterApply = () => {
    //customization
    const annots = core.getAnnotationsList();
    hidden.splice(0, hidden.length);
    //customization

    dispatch(
      actions.setCustomNoteFilter(annot => {
        let type = true;
        let author = true;
        let color = true;
        let status = true;

        if (typesFilter.length > 0) {
          //customization

          type = annots.some(s => s.Subject === 'Link' && s.InReplyTo === annot.Id);
          if (!type) {
            let annotType = getAnnotationClassForFilterModal(annot);
            type = typesFilter.includes(annotType);
          }

          //customization
        }

        if (authorFilter.length > 0) {
          author = authorFilter.includes(core.getDisplayAuthor(annot['Author']));
          if (!author && checkRepliesForAuthorFilter) {
            const allReplies = annot.getReplies();
            for (const reply of allReplies) {
              // Short-circuit the search if at least one reply is created by
              // one of the desired authors
              if (authorFilter.includes(core.getDisplayAuthor(reply['Author']))) {
                author = true;
                break;
              }
            }
          }
        }
        if (colorFilter.length > 0) {
          if (annot.Color) {
            color = similarColorExist(colorFilter, annot.Color);
          } else {
            // check for default color if no color is available
            color = colorFilter.includes('#485056');
          }
        }
        if (statusFilter.length > 0) {
          if (annot.getStatus()) {
            status = statusFilter.includes(annot.getStatus());
          } else {
            status = statusFilter.includes('None');
          }
        }

        //customization
        let fromDateApply = false;
        let toDateApply = false;
        let annotDate = annot.getCustomData('custom-date');

        if (annotDate !== "") {
          debugger
        }

        if (fromDateRange !== '' && fromDateRange !== "yyyy-mm-dd") {
          if (annotDate !== "" && annotDate != null) {
            fromDateApply = annotDate < fromDateRange;
          } else
            fromDateApply = true;
        }

        if (toDateRange !== '' && toDateRange !== "yyyy-mm-dd") {
          if (annotDate !== "" && annotDate != null) {
            toDateApply = annotDate > toDateRange;
          } else
            toDateApply = true;
        }

        //customization

        //customization
        let isPrivate = annot.getCustomData("custom-private");
        if (isPrivate.toLocaleLowerCase() === "true") {
          isPrivate = true;
        } else if (isPrivate.toLocaleLowerCase() === "false") {
          isPrivate = false;
        } else
          isPrivate = (isPrivate == null || isPrivate == undefined || isPrivate === "" ? false : isPrivate);
        let privatePublicShow = (isPrivate && privateFilter) || (!isPrivate && !privateFilter);

        //customization

        //customization
        let filteredTagShouldApply = false;
        
        if (filteredTags && filteredTags.length > 0){
          let tag = annot.getCustomData('custom-tag');
          let filteredTagValues = filteredTags.map(t => t.value.split('-')[0]);

          let commonValues = filteredTagValues.filter((n) => tag.indexOf(n) !== -1);
          filteredTagShouldApply = commonValues.length > 0 ? false : true;
          debugger
        }

        //customization


        let showComment = !filteredTagShouldApply && type && author && privatePublicShow && !fromDateApply && !toDateApply;

        if (!showComment) {
          hidden.push(annot);
        }

        return showComment;
        //customization


        // return type && author && color && status;
      })

    );


    fireEvent(
      Events.ANNOTATION_FILTER_CHANGED,
      {
        types: typesFilter,
        authors: authorFilter,
        colors: colorFilter,
        statuses: statusFilter,
        checkRepliesForAuthorFilter
      }
    );
    closeModal();
  };

  const filterClear = () => {


    dispatch(
      actions.setCustomNoteFilter(annot => {

        return true;
      }),
    );
    setCheckRepliesForAuthorFilter(false);
    setAuthorFilter([]);
    setTypesFilter([]);
    setColorFilter([]);
    setStatusFilter([]);

    //customization

    setPrivateFilter(false);
    setToDateRange('');
    setFromDateRange('');
    hidden.splice(0, hidden.length);
    showAnnot();
    //customization

    fireEvent('annotationFilterChanged', {
      types: [],
      //customization
      private: false,
      //customization
      authors: [],
      colors: [],
      statuses: [],
      checkRepliesForAuthorFilter: false,
    });
  };

  const closeModal = () => {
    dispatch(actions.closeElement('filterModal'));
    core.setToolMode(defaultTool);
  };

  useEffect(() => {
    const annots = core.getAnnotationsList();
    // set is a great way to remove any duplicate additions and ensure the unique items are present
    // the only gotcha that it should not be used by state since not always it will trigger a rerender
    const authorsToBeAdded = new Set();
    const annotTypesToBeAdded = new Set();
    const annotColorsToBeAdded = new Set();
    const annotStatusesToBeAdded = new Set();
    annots.forEach(annot => {
      const displayAuthor = core.getDisplayAuthor(annot['Author']);
      if (displayAuthor && displayAuthor !== '') {
        authorsToBeAdded.add(displayAuthor);
      }
      // We don't show it in the filter for WidgetAnnotation or StickyAnnotation or LinkAnnotation from the comments
      if (
        annot instanceof Annotations.WidgetAnnotation ||
        (annot instanceof Annotations.StickyAnnotation && annot.isReply())
        //customization
        //|| annot instanceof Annotations.Link //customization needs to be changed - since we want to have links in filter as well
        || (annot instanceof Annotations.Link && annot.Subject == null)  //customization needs to be changed - since we want to have links in filter as well
        //customization
      ) {
        return;
      }
      if (annot.Subject === 'Link')
        debugger

      annotTypesToBeAdded.add(getAnnotationClassForFilterModal(annot));
      if (annot.Color && !similarColorExist([...annotColorsToBeAdded], annot.Color)) {
        annotColorsToBeAdded.add(rgbaToHex(annot.Color.R, annot.Color.G, annot.Color.B, annot.Color.A));
      } else {
        annotColorsToBeAdded.add('#485056');
      }

      if (annot.getStatus()) {
        annotStatusesToBeAdded.add(annot.getStatus());
      } else {
        annotStatusesToBeAdded.add('None');
      }
    });


    hideAnnot();
    setAuthors([...authorsToBeAdded]);
    setAnnotTypes([...annotTypesToBeAdded]);
    setColorTypes([...annotColorsToBeAdded]);
    setStatusTypes([...annotStatusesToBeAdded]);

    core.addEventListener('documentUnloaded', closeModal);
    return () => {
      core.removeEventListener('documentUnloaded', closeModal);
    };
  }, [isOpen]);





  const renderAuthors = () => {
    return (
      <div className="filter">
        <div className="heading">{t('option.filterAnnotModal.commentBy')}</div>
        <div className="buttons">
          {[...authors].map((val, index) => {
            return (
              <Choice
                type="checkbox"
                key={index}
                label={val}
                checked={authorFilter.includes(val)}
                id={val}
                onChange={e => {
                  if (authorFilter.indexOf(e.target.getAttribute('id')) === -1) {
                    setAuthorFilter([...authorFilter, e.target.getAttribute('id')]);
                  } else {
                    setAuthorFilter(authorFilter.filter(author => author !== e.target.getAttribute('id')));
                  }
                }}
              />
            );
          })}
        </div>
        <div className="buttons">
          <Choice
            type="checkbox"
            label={t('option.filterAnnotModal.includeReplies')}
            checked={checkRepliesForAuthorFilter}
            onChange={
              e => setCheckRepliesForAuthorFilter(e.target.checked)
            }
            id="filter-annot-modal-include-replies"
          />
        </div>
      </div>
    );
  };

  const renderAnnotTypes = () => {
    return (
      <div className="filter">
        <div className="heading">{t('option.filterAnnotModal.types')}</div>
        <div className="buttons">
          {[...annotTypes]
            .sort((type1, type2) => (t(`annotation.${type1}`) <= t(`annotation.${type2}`) ? -1 : 1))
            .map((val, index) => {
              return (
                <Choice
                  type="checkbox"
                  key={index}
                  label={t(`annotation.${val}`)}
                  checked={typesFilter.includes(val)}
                  id={val}
                  onChange={e => {
                    if (typesFilter.indexOf(e.target.getAttribute('id')) === -1) {
                      setTypesFilter([...typesFilter, e.target.getAttribute('id')]);
                    } else {
                      setTypesFilter(typesFilter.filter(type => type !== e.target.getAttribute('id')));
                    }
                  }}
                />
              );
            })}
        </div>
      </div>
    );
  };

  const renderColorTypes = () => {
    return (
      <div className="filter">
        <div className="heading">{t('option.filterAnnotModal.color')}</div>
        <div className="buttons color">
          {[...colors].map((val, index) => {
            return (
              <div className="colorSelect" key={`color${index}`}>
                <Choice
                  type="checkbox"
                  checked={colorFilter.includes(val)}
                  id={val}
                  onChange={e => {
                    if (colorFilter.indexOf(e.target.getAttribute('id')) === -1) {
                      setColorFilter([...colorFilter, e.target.getAttribute('id')]);
                    } else {
                      setColorFilter(colorFilter.filter(color => color !== e.target.getAttribute('id')));
                    }
                  }}
                />
                <div
                  className="colorCell"
                  style={{
                    background: hexToRgba(val),
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStatusTypes = () => {
    // Hide status filter if there is only on status type
    if (statuses.length === 1) {
      return null;
    }

    return (
      <div className="filter">
        <div className="heading">{t('option.status.status')}</div>
        <div className="buttons">
          {[...statuses].map((val, index) => {
            return (
              <Choice
                type="checkbox"
                key={index}
                checked={statusFilter.includes(val)}
                label={t(`option.state.${val.toLocaleLowerCase()}`)}
                id={val}
                onChange={e => {
                  if (statusFilter.indexOf(e.target.getAttribute('id')) === -1) {
                    setStatusFilter([...statusFilter, e.target.getAttribute('id')]);
                  } else {
                    setStatusFilter(statusFilter.filter(status => status !== e.target.getAttribute('id')));
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  //customization
  const renderTags = () => {

    return (
      <div className="filter">
        <div className="heading">{t('annotation.tag')}</div>
        <div className="buttons">
          <TagDropDown creatable={false} setSelectedTags={setFilteredTags} />
        </div>
      </div>
    );
  };

  const renderPrivateField = () => {

    return (
      <div className="filter">
        <div className="heading">{t('annotation.visibility')}</div>
        <div className="buttons">
          <Choice
            type="checkbox"

            checked={privateFilter}
            label={t('annotation.private')}

            onChange={e => {
              setPrivateFilter(e.target.checked);
            }}
          />
        </div>
      </div>
    );
  };

  const hideAnnot = () => {
    showAnnot();
    core.hideAnnotations(hidden);
  }

  const showAnnot = () => {
    core.showAnnotations(core.getAnnotationsList());
  }

  const renderDateRange = () => {

    return (
      <div className="filter">
        <div className="heading">Date Range Filter</div>
        <div className="buttons">
          <span>
            <label for="fromDateRange">From Date: </label>
            <input
              type="date"
              id="fromDateRange"
              value={fromDateRange}
              onChange={e => {
                e.stopPropagation();
                setFromDateRange(e.target.value);
              }

              } />
          </span>
          <br />
          <span>
            <label for="toDateRange">To Date: </label>
            <input
              type="date"
              id="toDateRange"
              value={toDateRange}
              onChange={
                e => {
                  e.stopPropagation();
                  setToDateRange(e.target.value);
                }
              } />
          </span>
        </div>
      </div>
    );
  };
  //customization

  const modalClass = classNames({
    Modal: true,
    FilterAnnotModal: true,
    open: isOpen,
    closed: !isOpen,
  });

  //customization
  // these two lines were removed from below method
  // {renderColorTypes()}
  // {renderStatusTypes()}
  //customization

  return isDisabled ? null : (
    <Swipeable onSwipedUp={closeModal} onSwipedDown={closeModal} preventDefaultTouchmoveEvent>
      <div className={modalClass} data-element="filterModal" onMouseDown={closeModal}>
        <FocusTrap locked={isOpen} focusLastOnUnlock>
          <div className="container" onMouseDown={e => e.stopPropagation()}>
            {core.getAnnotationsList().length > 0 ? (
              <div className="filter-modal">
                <div className="swipe-indicator" />
                <div className="filter-options">
                  {renderAuthors()}
                  {renderAnnotTypes()}
                  {renderPrivateField()}
                  {renderDateRange()}
                  {renderTags()}
                </div>
                <div className="footer">
                  <Button className="filter-annot-clear" onClick={filterClear} label={t('action.clear')} />
                  <Button className="filter-annot-apply" onClick={filterApply} label={t('action.apply')} />
                </div>
              </div>
            ) : (
              <div>
                <div className="swipe-indicator" />
                <div className="message">{t('message.noAnnotationsFilter')}</div>
              </div>
            )}
          </div>
        </FocusTrap>
      </div>
    </Swipeable>
  );
};

export default FilterAnnotModal;
