import React, { useState, useEffect, useRef } from 'react';
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
import ActionButton from 'components/ActionButton';

//customization
import { Checkbox } from '@mui/material';
import { green } from '@mui/material/colors';
import { Radio } from '@mui/material';
import { RadioGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { FormControl } from '@mui/material';
import { FormLabel } from '@mui/material';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Select from 'react-select';
import Switch from 'components/Switch';
import { getAnnotationClass, getAnnotationClassForFilterModal } from 'helpers/getAnnotationClass';
import TagDropDown from 'components/TagDropDown';
import QueryBuilder from 'components/QueryBuilder';
import { ConstructionOutlined } from '@mui/icons-material';

//customization
const hidden = [];

const FilterAnnotModal = () => {
  const [isDisabled, isOpen, tagOptionsState] = useSelector(state => [
    selectors.isElementDisabled(state, 'filterModal'),
    selectors.isElementOpen(state, 'filterModal'),
    selectors.getTagOptions(state),

  ]);
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const dropRef = useRef();

  const [applied, setApplied] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [annotTypes, setAnnotTypes] = useState([]);
  const [colors, setColorTypes] = useState([]);
  const [statuses, setStatusTypes] = useState([]);

  const [authorFilter, setAuthorFilter] = useState([]);
  const [typesFilter, setTypesFilter] = useState([]);
  const [colorFilter, setColorFilter] = useState([]);
  const [checkRepliesForAuthorFilter, setCheckRepliesForAuthorFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);

  //customization

  const [privateFilter, setPrivateFilter] = useState(false);
  const [toCommentDateRange, setToCommentDateRange] = useState('yyyy-mm-dd');
  const [fromCommentDateRange, setFromCommentDateRange] = useState('yyyy-mm-dd');
  const [fromCommentDate, setFromCommentDate] = useState(null);
  const [toCommentDate, setToCommentDate] = useState(null);
  const [isFromCommentDatePickerShown, setIsFromCommentDatePickerShown] = useState(false);
  const [isToCommentDatePickerShown, setIsToCommentDatePickerShown] = useState(false);

  const [toAttributeDateRange, setToAttributeDateRange] = useState('yyyy-mm-dd');
  const [fromAttributeDateRange, setFromAttributeDateRange] = useState('yyyy-mm-dd');
  const [fromAttributeDate, setFromAttributeDate] = useState(null);
  const [toAttributeDate, setToAttributeDate] = useState(null);
  const [isFromAttributeDatePickerShown, setIsFromAttributeDatePickerShown] = useState(false);
  const [isToAttributeDatePickerShown, setIsToAttributeDatePickerShown] = useState(false);


  const [filteredTags, setFilteredTags] = useState([]);
  const [openQueryBuilder, setOpenQueryBuilder] = useState(false);
  const [visibility, setVisiblity] = useState('All');

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
            let annotType = getAnnotationClassForFilterModal(annot);
            type = typesFilter.includes(annotType);
            
          //}

          //customization
        }

        if (authorFilter && authorFilter.length > 0) {
          const annotAuthor = core.getDisplayAuthor(annot['Author']);
          author = authorFilter.find(i => i.value === annotAuthor)
          if (!author && checkRepliesForAuthorFilter) {
            const allReplies = annot.getReplies();
            for (const reply of allReplies) {
              // Short-circuit the search if at least one reply is created by
              // one of the desired authors
              const replyAuthor = core.getDisplayAuthor(reply['Author']);
              const authorReply = authorFilter.find(i => i.value === replyAuthor)
              if (authorReply) {
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
        let fromCommentDateApply = false;
        let toCommentDateApply = false;
        
        let annotCommentDate = annot['wN'];

        if (annotCommentDate !== "") {
          // debugger
        }

        if (isFromCommentDatePickerShown && fromCommentDate !== '' && fromCommentDate !== "yyyy-mm-dd") {
          if (annotCommentDate !== "" && annotCommentDate != null) {
            fromCommentDateApply = annotCommentDate < fromCommentDate;
          } else {
            fromCommentDateApply = true;
          }
        }

        if (isToCommentDatePickerShown && toCommentDateRange !== '' && toCommentDateRange !== "yyyy-mm-dd") {
          if (annotCommentDate !== "" && annotCommentDate != null) {
            toCommentDateApply = annotCommentDate > toCommentDateRange;
          } else {
            toCommentDateApply = true;
          }
        }

        let fromAttributeDateApply = false;
        let toAttributeDateApply = false;
        
        let annotAttributeDate = annot.getCustomData('custom-date');

        if (annotAttributeDate !== "") {
          //debugger
        }

        if (isFromAttributeDatePickerShown && fromAttributeDate !== '' && fromAttributeDate !== "yyyy-mm-dd") {
          if (annotAttributeDate !== "" && annotAttributeDate != null) {
            fromAttributeDateApply = annotAttributeDate < fromAttributeDate;
          } else {
            fromAttributeDateApply = true;
          }
        }

        if (isToAttributeDatePickerShown && toAttributeDateRange !== '' && toAttributeDateRange !== "yyyy-mm-dd") {
          if (annotAttributeDate !== "" && annotAttributeDate != null) {
            toAttributeDateApply = annotAttributeDate > toAttributeDateRange;
          } else {
            toAttributeDateApply = true;
          }
        }
        //customization

        //customization
  
        let isPrivate = annot.getCustomData("custom-private");
        let privatePublicShow = true;

        switch(visibility) { 
          case 'Private': { 
             if (isPrivate.toLocaleLowerCase() !== "true") {
              privatePublicShow = false;
             } 
             break; 
          } 
          case 'Public': { 
            if (isPrivate.toLocaleLowerCase() === "true") {
              privatePublicShow = false;
            }
            break; 
          } 
          default: { 
            privatePublicShow = true;
            break; 
          } 
        } 
        //customization

        //customization
        let filteredTagShouldApply = false;

        if (filteredTags && filteredTags.length > 0) {
          let tag = annot.getCustomData('custom-tag');
          let filteredTagValues = filteredTags.map(t => t.value.split('-')[0]);

          let commonValues = filteredTagValues.filter((n) => tag.indexOf(n) !== -1);
          const containsNo = filteredTagValues.some(i => i === 'no');

          filteredTagShouldApply = (tag.length === 0 && containsNo) || commonValues.length > 0 ? false : true;
        }

        //customization

        let showComment = !filteredTagShouldApply && type && author && privatePublicShow && !fromCommentDateApply && !toCommentDateApply && !fromAttributeDateApply && !toAttributeDateApply;

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

    setApplied(true);
    closeModal();
  };

  const filterClear = () => {


    dispatch(
      actions.setCustomNoteFilter(annot => {

        return true;
      }),
    );
    setCheckRepliesForAuthorFilter(false);

    setAuthorFilter([...authors]);
    setTypesFilter([...annotTypes]);
    setColorFilter([]);
    setStatusFilter([...statuses]);

    //customization

    setPrivateFilter(true);
    setVisiblity('All');

    setToCommentDateRange('yyyy-mm-dd');
    setFromCommentDateRange('yyyy-mm-dd');
    setFromCommentDate(null);
    setToCommentDate(null);
    setIsFromCommentDatePickerShown(false);
    setIsToCommentDatePickerShown(false);

    setToAttributeDateRange('yyyy-mm-dd');
    setFromAttributeDateRange('yyyy-mm-dd');
    setFromAttributeDate(null);
    setToAttributeDate(null);
    setIsFromAttributeDatePickerShown(false);
    setIsToAttributeDatePickerShown(false);

    hidden.splice(0, hidden.length);
    showAnnot();
    setFilteredTags([]);
    dropRef.current.clearSelect();

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

    //customization
    const authorsToBeAdded = [];
    const authorsToBeSet = [];
    const annotTypesToBeSet = new Set();
    //customization
    const annotTypesToBeAdded = new Set();
    const annotColorsToBeAdded = new Set();
    const annotStatusesToBeAdded = new Set();
    annots.forEach(annot => {    
      //customization
      const isHidden = annot.Hidden;

      const displayAuthor = core.getDisplayAuthor(annot['Author']);
      if (displayAuthor && displayAuthor !== '' && !authorsToBeAdded.find(i => i.value === displayAuthor)) {
        const author = { value: displayAuthor, label: displayAuthor };
        authorsToBeAdded.push(author);
      }
      //customization

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

      const annotType = getAnnotationClassForFilterModal(annot);
      annotTypesToBeAdded.add(annotType);

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

    //customization
    setAuthors(authorsToBeAdded); 
    
    if (!applied) {
      setTypesFilter([...annotTypesToBeAdded]);
      setAuthorFilter([...authorsToBeAdded]);  
      setStatusFilter([...annotStatusesToBeAdded]);
    }
    //customization

    setAnnotTypes([...annotTypesToBeAdded]);
    setColorTypes([...annotColorsToBeAdded]);
    setStatusTypes([...annotStatusesToBeAdded]);
    

    core.addEventListener('documentUnloaded', closeModal);
    return () => {
      core.removeEventListener('documentUnloaded', closeModal);
    };
  }, [isOpen]);

  const handleAuthorChange = selectedOption => {
    setAuthorFilter(selectedOption);
  };

  const renderAuthors = () => {
    return (
      <div className="filter">
        <div className="heading"><h6>Comment Author</h6></div>
        <div className="author-buttons">
          <div className='authors'>
            <Select options={authors} isSearchable="true" isMulti className="multi-select" closeMenuOnSelect={false}
            onChange={handleAuthorChange}
              value={authorFilter}
            />
            <div className="replies">
              <Switch onChange={setCheckRepliesForAuthorFilter} checked={checkRepliesForAuthorFilter} />   
            </div>            
            <div className='replies-label'>Include Replies</div>
          </div>
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

  //customization
  const renderAnnotTypes = () => {
    return (
      <div className="filter">
        <div className="heading"><h6>{t('option.filterAnnotModal.types')}</h6></div>
        <div className="annotationTypes">
          {[...annotTypes]
            .sort((type1, type2) => (t(`annotation.${type1}`) <= t(`annotation.${type2}`) ? -1 : 1))
            .map((val, index) => {
              return (  
                <div className="annotationType">  
                  <Checkbox 
                    checked={typesFilter.includes(val)} 
                    id={val}

                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                      color: green[300],
                      '&.Mui-checked': {
                        color: green[400],
                      },
                    }}
                    onChange={(e, status) => {
                      if (typesFilter.indexOf(e.currentTarget.getAttribute('id')) === -1) {
                        setTypesFilter([...typesFilter, e.currentTarget.getAttribute('id')]);
                      } else {
                        setTypesFilter(typesFilter.filter(type => type !== e.currentTarget.getAttribute('id')));
                      }
                    }}/>
                  
                  <label>{t(`annotation.${val}`)}</label>
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

  const renderTags = () => {

    return (
      <div className="filter">
        <div className="heading">{t('annotation.tag')}</div>
        <div className="tag-buttons">
          <TagDropDown ref={dropRef} creatable={false} setSelectedTags={setFilteredTags} controlWidth="100%"/>
        </div>
      </div>
    );
  };

  const renderPrivateField = () => {

    return (
      <div className="filter">
        <div className="heading"><h6>Visibility</h6></div>
        <FormControl>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          row
          value={visibility}                    
          onChange={(e, value) => {
            setPrivateFilter(value === 'Private');
            setVisiblity(value);
          }}
        >
        <FormControlLabel value="All" control={<Radio        
            sx={{ 
            '& .MuiSvgIcon-root': { fontSize: 20 },
            color: green[300],
            '&.Mui-checked': {
              color: green[400],
            },
          }} />} label="All" />
          <FormControlLabel value="Private" control={<Radio         sx={{ 
            '& .MuiSvgIcon-root': { fontSize: 20 },
            color: green[300],
            '&.Mui-checked': {
              color: green[400],
            },
          }}
          />} label="Private only" />
          <FormControlLabel value="Public" control={<Radio         sx={{ 
            '& .MuiSvgIcon-root': { fontSize: 20 },
            color: green[300],
            '&.Mui-checked': {
              color: green[400],
            },
          }}
          />} label="Public only" />
        </RadioGroup>
      </FormControl>
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

  const renderQueryBuilder = () => {
    return (
      <div>
        <button onClick={() => { setOpenQueryBuilder(true) }}>query...</button>
        <QueryBuilder isOpen={openQueryBuilder} onClose={() => { setOpenQueryBuilder(false) }} />
      </div>

    )
  }

  const renderDateRange = () => {

    return (
      <div className="filter">
        <div className="heading"><h6>Date Range Filter</h6></div>
        <div className="date-buttons">
          <div className='date-row'>
            <div className='date-cell-header'>
              <p>Comment date</p>
            </div>
            <div className='date-cell'>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  inputFormat="yyyy-MM-dd"
                  value={fromCommentDate}  
                  maxDate={toCommentDate}
                  onChange={(newValue) => {
                    setFromCommentDate(newValue);  
                    setFromCommentDateRange(newValue);
                    setIsFromCommentDatePickerShown(true);
                  }}
                  renderInput={(params) => <TextField {...params} helperText={null} />}
                />
              </LocalizationProvider>
            </div>
            <div className='date-cell-seperator'>
              <p>➞</p>
            </div>
            <div className='date-cell'>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={toCommentDate}  
                    minDate={fromCommentDate}
                    inputFormat="yyyy-MM-dd"
                    onChange={(newValue) => {
                      setToCommentDate(newValue);    
                      setToCommentDateRange(newValue);                    
                      setIsToCommentDatePickerShown(true);
                    }}
                    renderInput={(params) => <TextField {...params} helperText={null} />}
                  />
                </LocalizationProvider>
            </div>
          </div>
          <div className='date-row'>
            <div className='date-cell-header'>
              <p>Attributed date</p>
            </div>
            <div className='date-cell'>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={fromAttributeDate}  
                  maxDate={toAttributeDate}
                  inputFormat="yyyy-MM-dd"
                  onChange={(newValue) => {
                    setFromAttributeDate(newValue);  
                    setFromAttributeDateRange(newValue);                    
                    setIsFromAttributeDatePickerShown(true);  
                  }}
                  renderInput={(params) => <TextField {...params} helperText={null} />}
                />
              </LocalizationProvider>
            </div>
            <div className='date-cell-seperator'>
              <p>➞</p>
            </div>
            <div className='date-cell'>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={toAttributeDate}  
                    minDate={fromAttributeDate}
                    inputFormat="yyyy-MM-dd"
                    onChange={(newValue) => {
                      setToAttributeDate(newValue);   
                      setToAttributeDateRange(newValue);                    
                      setIsToAttributeDatePickerShown(true); 
                    }}
                    renderInput={(params) => <TextField {...params} helperText={null} />}
                  />
                </LocalizationProvider>
            </div>
          </div>
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
            <div className="modal4-header">
                <h5 className="modal-title">Comment Filters</h5>
                <button type="button" aria-label="Close" class="close" onClick={closeModal}>×</button>
            </div>
            {core.getAnnotationsList().length > 0 ? (
              <div className="filter-modal">
                <div className="swipe-indicator" />
                <div className="filter-options">
                  {renderAuthors()}
                  {renderAnnotTypes()}
                  {renderPrivateField()}
                  {renderDateRange()}
                  {renderTags()}
                  {/* {renderQueryBuilder()} */}
                </div>
                <div className="footer">
                  <Button className="btn4-secondary" onClick={filterClear} label={t('action.clear')} />
                  <Button className="btn4-primary" onClick={filterApply} label={t('action.apply')} />
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
