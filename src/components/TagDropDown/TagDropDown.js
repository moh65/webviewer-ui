//customization-new-file
import React, { Component, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import Select from 'react-select'
import { SketchPicker } from 'react-color'
import actions from 'actions';
import selectors from 'selectors';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Swipeable } from 'react-swipeable';
import { FocusTrap } from '@pdftron/webviewer-react-toolkit';

// to load options from external URL provided by WebViewer constructor

export default forwardRef(({ setDropDownChanged, setSelectedTags, selectedTags, creatable, placeholder }, ref) => {
    let [
        token,
        defaultTag,
        createTagUrl,
        getTagsUrl,
        tagOptionsState,
        openElements
    ] = useSelector(
        state => [
            selectors.getAuthToken(state),
            selectors.getDefaultTag(state),
            selectors.getCreateTagUrl(state),
            selectors.getGetTagsUrl(state),
            selectors.getTagOptions(state),
            selectors.getOpenElements(state)
        ]
    );

    createTagUrl = createTagUrl ? createTagUrl : 'http://localhost:5600/api/bundle/jobtag/664';
    getTagsUrl = getTagsUrl ? getTagsUrl : 'http://localhost:5600/api/bundle/jobtag/664';
    token = token ? token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImxyLU93Q3RDVkstcGF0Y3RabzJ2MnciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2NDkzODM2MDEsImV4cCI6MTY0OTM4NzIwMSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDA0IiwiYXVkIjoiYnVuZGxlIiwiY2xpZW50X2lkIjoiMEZBNjI2QjQwQkNGNDE4Q0FBQzQ3MkE4MkQ1MUIzQTYiLCJzdWIiOiJlNzYwZGNjMmEyMDI0YmY4YThlOThmZWE0NzJmNzAxNSIsImF1dGhfdGltZSI6MTY0OTM4MzU4MSwiaWRwIjoibG9jYWwiLCJmaXJtSWQiOiJmMzM5NmE3NzY4MTg0ZTliOGUyYmFhNWNhMTg5M2UzNCIsInBlcm1pc3Npb25zIjoiTGVnYWxCdW5kbGUiLCJyb2xlIjpbIlN1cHBvcnREZXNrIiwiU3VwZXJBZG1pbiJdLCJzY29wZSI6WyJwZXJtaXNzaW9ucyIsInJvbGVzIiwicHJvZmlsZSIsIm9wZW5pZCIsImJ1bmRsZSJdLCJhbXIiOlsicHdkIl19.fWRAfjLxVlnMnNAk2wc1hWao-laRBgegXkXfb_c2pqlnSUI5xy6dMtm7lOk2FqP7HbuJcgtQB1FTG7SqeS5urKGaN9QabfHxP4EKsdwd_6AZ_s8TkjSHsUWMYtAlwzK8rPhPnEbppjjCh0bekntznFb1YO1LtbkYhER5uuNBcIa95Cgw6TZrUePa8O5FtpAMnIyPnBlGU1YXcat0XmiupJrKisjYMdWLbJrNitMD90MUPDtgbcMNmMSjDj9EN2WdFdLA5nsexfF7ZBOdcDthVkWbnnOu6jFOwkK6S7s2ODyxWKqwv0wuDBDcTyQj79N7wrza4nHzhOTNIUVmIdiZ1A';

    const noTagOption = { value: 'no-tag', label: 'No tag' }
    const createTagOption = { value: 'create-tag', label: 'create new tag' }

    const dropDownRef = useRef();

    const [tagOptions, setTagOptions] = useState([]);
    const [showTagCreateForm, setShowTagCreateForm] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState('');
    const [showElement, setShowElement] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {

        const disableElement = openElements['tag-drop-down'];
        if (disableElement === false) {
            setShowElement(false);
        } else if (disableElement == undefined) {
            setShowElement(true);
            dispatch(actions.openElement('tag-drop-down'));
        } else {
            setShowElement(true);
        }

    }, [openElements]);

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
            })
        },
        multiValue: (provided, state) => {
            return { ...provided, backgroundColor: state.data.value.split('-')[1] };
        },
        multiValueLabel: (provided, state) => {
            return { ...provided, backgroundColor: state.data.value.split('-')[1] };
        },
        singleValue: (provided, state) => {
            if (state.data.value === 'no-tag')
                return { ...provided };
            return { ...provided, backgroundColor: state.data.value.split('-')[1] };
        },
        singleValueLabel: (provided, state) => {
            if (state.data.value === 'no-tag')
                return { ...provided };
            return { ...provided, backgroundColor: state.data.value.split('-')[1] };
        }
    }

    const colorPickerHandler = (color, event) => {
        setTagColor(color.hex);
    };

    const setAndCheckCreatableDropDown = (options) => {
        let newOptions = [];
        if (creatable) {
            newOptions = [noTagOption, ...options, createTagOption];
            setTagOptions(newOptions);
        } else
            setTagOptions(options);
    }

    useEffect(() => {
        let options = [];
        if (!tagOptionsState.loaded) {
            fetch(getTagsUrl, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            }).then(res => res.json())
                .then(json => {
                    debugger
                    options = json.map(m => ({
                        label: m.TagName,
                        value: `${m.JobTagId}-${m.TagColour}`
                    }));
                    dispatch(actions.setTagOptions({ loaded: true, options: options }));
                });
        }
    }, [])

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
    }

    return (
        showElement && (
            <div style={{ width: '200px' }}>
                {
                    !showTagCreateForm ? <Select
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
                                    dispatch(actions.setDefaultTag(option));
                                }
                            } else {
                                if (setDropDownChanged)
                                    setDropDownChanged(true);
                                if (setSelectedTags)
                                    setSelectedTags(option);
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
                        noOptionsMessage={e => "no tags available"}
                    /> :
                        <Swipeable onSwipedUp={e => setShowTagCreateForm(false)} onSwipedDown={e => setShowTagCreateForm(false)} preventDefaultTouchmoveEvent>
                            <div style={{ marginTop: '380px' }}>

                                <label htmlFor='tagName'>Tag Name:</label>
                                <input type='text' id='tagName' value={tagName} onChange={e => setTagName(e.target.value)} />
                                <br />
                                <label htmlFor='tagColor'>Tag Color:</label>
                                <SketchPicker color={tagColor} onChange={colorPickerHandler} />
                                <div className='fm-container'>
                                    <div className='fm-container-child'>
                                        <button className='fm-save-button' onClick={saveTag}>save</button>
                                    </div>
                                    <div className='fm-container-child'>
                                        <button className="fm-cancel-button" onClick={e => setShowTagCreateForm(false)}>cancel</button>
                                    </div>
                                </div>

                            </div>
                        </Swipeable>
                }
            </div>
        )
    )
})
