//customization-new-file
import React, { Component, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Select from 'react-select';
import { SketchPicker } from 'react-color';
import actions from 'actions';
import selectors from 'selectors';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Swipeable } from 'react-swipeable';
import { FocusTrap } from '@pdftron/webviewer-react-toolkit';
import { hexToRgba2 } from 'helpers/color';
import setToolStyles from 'helpers/setToolStyles';

import './TagDropDown.scss';

export default forwardRef(({ setDropDownChanged, setSelectedTags, selectedTags, creatable, placeholder }, ref) => {
  let [
    token,
    defaultTag,
    createTagUrl,
    getTagsUrl,
    tagOptionsState,
    disabledElements,
    defaultBaseUrlAddress
  ] = useSelector(
    state => [
      selectors.getAuthToken(state),
      selectors.getDefaultTag(state),
      selectors.getCreateTagUrl(state),
      selectors.getGetTagsUrl(state),
      selectors.getTagOptions(state),
      selectors.getDisabledElements(state),
      selectors.getDefaultUrlBaseAddress(state)
    ]
  );

  createTagUrl = createTagUrl ? createTagUrl : `${defaultBaseUrlAddress}/api/bundle/jobtag/664`;
  getTagsUrl = getTagsUrl ? getTagsUrl : `${defaultBaseUrlAddress}/api/bundle/jobtag/664`;

  const noTagOption = { value: 'no-tag', label: 'No tag' };
  const createTagOption = { value: 'create-tag', label: 'Create new tag...' };

  const dropDownRef = useRef();

  const [tagOptions, setTagOptions] = useState([]);
  const [showTagCreateForm, setShowTagCreateForm] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('');
  const [showElement, setShowElement] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const disableElement = disabledElements['tag-drop-down'];
    if (disableElement == undefined) {
      setShowElement(true);
      dispatch(actions.enableElement('tag-drop-down'));
    } else if (disableElement.disabled === false) {
      setShowElement(true);
    } else if (disableElement.disabled === true) {
      setShowElement(false);
    }

  }, [disabledElements]);

  useImperativeHandle(ref, () => ({

    clearSelect() {
      dropDownRef.current.select.clearValue();
    }

  }));

  const customStyles = {
    option: (provided, state) => {
      return ({
        ...provided,
        color: state.data.value.split('-')[1]
      });
    },
    control: provided => ({
      ...provided,
      height: 30,
      minHeight: 30,
    }),
    dropdownIndicator: provider => ({
      ...provider,
      padding: 4,
    }),
    multiValue: (provided, state) => {
      return { ...provided, backgroundColor: state.data.value.split('-')[1] };
    },
    multiValueLabel: (provided, state) => {
      return { ...provided, backgroundColor: state.data.value.split('-')[1] };
    },
    singleValue: (provided, state) => {
      if (state.data.value === 'no-tag') {
        return { ...provided };
      }
      return { ...provided, backgroundColor: state.data.value.split('-')[1] };
    },
    singleValueLabel: (provided, state) => {
      if (state.data.value === 'no-tag') {
        return { ...provided };
      }
      return { ...provided, backgroundColor: state.data.value.split('-')[1] };
    }
  };

  const colorPickerHandler = (color, event) => {
    setTagColor(color.hex);
  };

  const setAndCheckCreatableDropDown = options => {
    let newOptions = [];
    if (creatable) {
      newOptions = [noTagOption, ...options, createTagOption];
      setTagOptions(newOptions);
    } else {
      setTagOptions(options);
    }
  };

  useEffect(() => {
    let options = [];
    if (!tagOptionsState.loaded) {
      fetch(getTagsUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      }).then(res => res.json())
        .then(json => {
          options = json.map(m => ({
            label: m.TagName,
            value: `${m.JobTagId}-${m.TagColour}`
          }));
          dispatch(actions.setTagOptions({ loaded: true, options }));
        });
    }
  }, []);

  useEffect(() => {
    setAndCheckCreatableDropDown(tagOptionsState.options);
  }, [tagOptionsState.options]);


  const saveTag = () => {
    let body = { TagName: tagName, TagColour: tagColor, JobId: 0, JobTagId: 0 };
    fetch(getTagsUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify(body)
    }).then(async res => {
      if (res.status === 200) {
        let id = await res.json();

        let newTagOptionState = {
          loaded: tagOptionsState.loaded, options: [...tagOptionsState.options, {
            label: tagName,
            value: `${id}-${tagColor}`
          }]
        };

        dispatch(actions.setTagOptions(newTagOptionState));
      }
    }).then(r => setShowTagCreateForm(false));
  };

  return (
    showElement && (
      <div className="custom-select" style={{ width: '200px' }}>
        <Select
          onChange={(option, { action }) => {
            if (creatable) {
              if (action === 'select-option') {
                if (option.value === 'create-tag') {
                  setShowTagCreateForm(true);
                  return;
                }
                if (option.value === 'no-tag') {
                  dispatch(actions.setDefaultTag({}));
                  return;
                }
                let toolNames = ['AnnotationCreateTextHighlight',
                  'AnnotationCreateEllipse',
                  'AnnotationCreateRectangle',
                  'AnnotationCreateLine',
                  'AnnotationCreateFreeHand',
                  'AnnotationCreateFreeHandHighlight',
                  'AnnotationCreatePolygon',
                  'AnnotationCreatePolygonCloud',
                  'AnnotationCreatePolyline',
                  'AnnotationCreateArrow',
                  'AnnotationCreateFreeText',
                  'AnnotationCreateTextUnderline',
                  'AnnotationCreateTextStrikeout',
                  'AnnotationCreateTextSquiggly',
                  'AnnotationCreateSticky'];
                let color = new window.Annotations.Color(option.value.split('-')[1]);
                toolNames.forEach(toolName => {
                  if (toolName === 'AnnotationCreateFreeText') {
                    setToolStyles(toolName, 'TextColor', color);
                  } else {
                    setToolStyles(toolName, 'StrokeColor', color);
                  }
                });

                dispatch(actions.setDefaultTag(option));
              }
            } else {
              if (setDropDownChanged) {
                setDropDownChanged(true);
              }
              if (setSelectedTags) {
                setSelectedTags(option);
              }
            }
          }
          }
          ref={dropDownRef}
          placeholder={placeholder}
          defaultValue={creatable ? noTagOption : (defaultTag && defaultTag.value ? defaultTag : selectedTags)}
          isSearchable
          isClearable={creatable ? false : true}
          options={tagOptions}
          styles={customStyles}
          closeMenuOnSelect={creatable ? true : false}
          isMulti={creatable ? false : true}
          noOptionsMessage={() => "no tags available"}
        />
        {showTagCreateForm && (
          <Swipeable
            onSwipedUp={() => setShowTagCreateForm(false)}
            onSwipedDown={() => setShowTagCreateForm(false)}
            preventDefaultTouchmoveEvent
            className="new-tag-form"
          >
            <div className="new-tag-form-inner">
              <label htmlFor="tagName">Tag Name:</label>
              <input type="text" id="tagName" placeholder="Enter tag name" value={tagName} onChange={e => setTagName(e.target.value)} />
              <br />
              <label htmlFor="tagColor">Tag Color:</label>
              <SketchPicker color={tagColor} onChange={colorPickerHandler} />
            </div>
            <div className="fm-container clear">
              <div className="fm-container-child">
                <button className="btn btn-cancel" onClick={() => setShowTagCreateForm(false)}>Cancel</button>
              </div>
              <div className="fm-container-child">
                <button className="btn btn-success" onClick={saveTag}>Done</button>
              </div>
            </div>
          </Swipeable>
        )}
      </div>
    )
  );
});
