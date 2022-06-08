//customization-new-file
import React, { Component, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Select, { components, SingleValue, MultiValue } from 'react-select';
import { SketchPicker } from 'react-color';
import actions from 'actions';
import selectors from 'selectors';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Swipeable } from 'react-swipeable';
import { FocusTrap } from '@pdftron/webviewer-react-toolkit';
import { hexToRgba2 } from 'helpers/color';
import setToolStyles from 'helpers/setToolStyles';

import './TagDropDown.scss';

export default forwardRef(({ setDropDownChanged, setSelectedTags, selectedTags, creatable, placeholder, controlWidth }, ref) => {
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

  createTagUrl = createTagUrl ? createTagUrl : `${defaultBaseUrlAddress}/api/bundle/jobtag/1`;
  getTagsUrl = getTagsUrl ? getTagsUrl : `${defaultBaseUrlAddress}/api/bundle/jobtag/1`;

  const createTagOption = { value: 'create-tag', label: 'Create new tag...' };

  const dropDownRef = useRef();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(selectedTags === undefined ? [] : selectedTags);
  const [showTagCreateForm, setShowTagCreateForm] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('');
  const [showElement, setShowElement] = useState(false);
  const [previousOptions, setPreviousOptions] = useState(selectedTags === undefined ? [] : selectedTags);
  const [noTagOption, setNoTagOption] = useState({ value: 'no-tag', label: 'No tag' });
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

  // Helper function to get the text color of the tag
  const pickTextColorFromBgColor = bgColor => {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 150) ? '#000000' : '#FFFFFF';
  };

  const valueStyles = {
    padding: '5px 8px',
    borderRadius: 4,
  };

  const labelStyles = {
    fontWeight: 600,
    fontSize: 11,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginRight: '5px',
  };

  const customStyles = {
    option: (provided, state) => {
      return ({
        ...provided,
        color: state.data.value.split('-')[1]
      });
    },
    control: provided => ({
      ...provided,
      height: 'auto',
      minHeight: 30,
      lineHeight: 1,
    }),
    valueContainer: provided => ({
      ...provided,
      paddingLeft: 4,
    }),
    placeholder: provided => ({
      ...provided,
      marginLeft: 4,
    }),
    dropdownIndicator: provider => ({
      ...provider,
      padding: 4,
    }),
    clearIndicator: provider => ({
      ...provider,
      padding: 4,
    }),
    multiValue: (provided, state) => {
      const bgColor = state.data.value.split('-')[1];
      return {
        ...provided,
        ...valueStyles,
        alignItems: 'center',
        backgroundColor: bgColor,
        color: pickTextColorFromBgColor(bgColor)
      };
    },
    multiValueLabel: (provided, state) => {
      const bgColor = state.data.value.split('-')[1];
      return {
        ...labelStyles,
        backgroundColor: bgColor,
        paddingRight: 0,
        color: pickTextColorFromBgColor(bgColor)
      };
    },
    multiValueRemove: provided => ({
      ...provided,
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: 4,
      marginRight: -4,
      height: 12,
      width: 12,
    }),
    singleValue: (provided, state) => {
      const bgColor = state.data.value.split('-')[1];
      if (state.data.value === 'no-tag') {
        return { 
          ...valueStyles,
          ...labelStyles,
          maxWidth: '95%',
        };
      }
      return {
        ...valueStyles,
        ...labelStyles,
        maxWidth: '95%',
        backgroundColor: bgColor,
        color: pickTextColorFromBgColor(bgColor)
      };
    }
  };

  const colorPickerHandler = (color, event) => {
    setTagColor(color.hex);
  };

  const setTags = (options) => {
    setSelectedOptions(options);
    setPreviousOptions(options);

    if (setSelectedTags) {
      setSelectedTags(options);
    }

    if (creatable && options.length > 0) {
      OnChangeCreatableOptionEvent(options[0]);
    }
  }

  const setAndCheckCreatableDropDown = options => {
    let noTag = noTagOption;
    let newOptions = [...options];

    if (options && options.some(e => e.label === 'No Tag')) {   
      noTag = options.find(e => e.label === 'No Tag');
      setNoTagOption(noTag);

      if (creatable && selectedOptions !== undefined && selectedOptions.length > 0 && selectedOptions[0].value === noTagOption.value) {
        selectedOptions[0] = noTag;
        OnChangeCreatableOptionEvent(selectedOptions[0]);
      }
    }

    if (selectedOptions === undefined || selectedOptions.length == 0) {
      if (creatable) {
        setTags([noTag]);
      } else if (setDropDownChanged !== undefined) {
        if (defaultTag && defaultTag.value) {
          setTags([defaultTag]);
        } 
        else {
          setTags([noTag]);
        }   
      }
    }

    if (!newOptions.some(e => e.value === noTag.value)) {      
      newOptions.unshift(noTag);
    }

    if (creatable) {
      newOptions.push(createTagOption);
      setTagOptions(newOptions);
    } else {
      setTagOptions(newOptions);
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
            value: `${m.JobTagId}-${m.TagColour}`,
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

        const newTag = {
          label: tagName,
          value: `${id}-${tagColor}`,
        };

        let newTagOptionState = {
          loaded: tagOptionsState.loaded, 
          options: [...tagOptionsState.options, newTag]
        };
  
        setTags([newTag]);
        OnChangeCreatableOptionEvent(newTag);
        dispatch(actions.setTagOptions(newTagOptionState));  
      }
    }).then(r => setShowTagCreateForm(false));
  };

  const addData = props => {
    return props.data.value;
  };

  const SingleValue = ({
    children,
    ...props
  }) => (
    <components.SingleValue{...props}>{children}<hidden class='selected-tag' data-id={addData(props)}></hidden></components.SingleValue>
  );
  
  const MultiValue = ({
    children,
    ...props
  }) => (
    <components.MultiValue{...props}>{children}<hidden class='selected-tag' data-id={addData(props)}></hidden></components.MultiValue>
  );

  const OnChangeCreatableOptionEvent = (option) => {
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

  return (
    showElement && (
      <div className="custom-select" data-element="tagSelectBox" style={{ width: controlWidth ? controlWidth : '200px' }}>
        <Select
          components={{ SingleValue, MultiValue }}
          onChange={(option, { action }) => {
            
            if (!option) {
              option = [];
            }

            setTags(option);

            if (creatable) {
              if (action === 'select-option') {
                OnChangeCreatableOptionEvent(option);
              }
            } else {
              let selectedOption = (option
                .filter(x => !previousOptions.includes(x))
                .concat(previousOptions.filter(x => !option.includes(x))))[0];

              if (setDropDownChanged !== undefined) {

                if (action === 'clear' || selectedOption.value === noTagOption.value) {
                  setTags([noTagOption]);
                } else {
                  if (option && option.some(e => e.value === noTagOption.value)) {
                    option = option.filter(i => i.value !== noTagOption.value);
            
                    setTags(option);
                  }
                }

                setDropDownChanged(true);
              } else {
                if (setSelectedTags) {
                  setTags(option);
                }
              }
            }
          }
          }
          ref={dropDownRef}
          value={selectedOptions}
          placeholder={placeholder}
          defaultValue={creatable ? [] : (defaultTag && defaultTag.value ? defaultTag : selectedTags)}
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
              <input type="text" id="tagName" value={tagName} onChange={e => setTagName(e.target.value)} />
              <br />
              <label htmlFor="tagColor">Tag Color:</label>
              <SketchPicker color={tagColor} onChange={colorPickerHandler} />
            </div>
            <div className="fm-container clear">
              <div className="fm-container-child">
                <button className="btn btn-cancel" onClick={() => setShowTagCreateForm(false)}>Cancel</button>
              </div>
              <div className="fm-container-child">
                <button className="btn btn-success" onClick={saveTag}>Save</button>
              </div>
            </div>
          </Swipeable>
        )}
      </div>
    )
  );
});
