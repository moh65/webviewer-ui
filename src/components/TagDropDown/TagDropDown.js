import React, { Component, useState, useEffect } from 'react'
import Select from 'react-select'
import { SketchPicker } from 'react-color'
import actions from 'actions';
import selectors from 'selectors';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import './TagDropDown.scss';

// to load options from external URL provided by WebViewer constructor


export default ({ setDropDownChanged, setSelectedTags, selectedTags, creatable, placeholder }) => {
    const [
        defaultTag
    ] = useSelector(
        state => [
            selectors.getDefaultTag(state)
        ]
    );

    const [tagOptions, setTagOptions] = useState([]);
    const [showTagCreateForm, setShowTagCreateForm] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState('');

    const [showNoTagOption, setShowNoTagOption] = useState(creatable ? true : false);
    const dispatch = useDispatch();

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

    const options = [
        { value: '1-#123456', label: 'Tag1' },
        { value: '2-#654321', label: 'Tag2' },
        { value: '3-#abc123', label: 'Tag3' }
    ]

    const noTagOption = { value: 'no-tag', label: 'No tag' }

    const createTagOption = { value: 'create-tag', label: 'create new tag' }

    useEffect(() => {
        if (creatable) {
            options.push(createTagOption);
            options.unshift(noTagOption);
        } 
        setTagOptions(options);
    }, []);

    return (
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
            <div style={{ marginTop: '380px' }}>
                <label htmlFor='tagName'>Tag Name:</label>
                <input type='text' id='tagName' value={tagName} onChange={e => setTagName(e.target.value)} />
                <br />
                <label htmlFor='tagColor'>Tag Color:</label>
                <SketchPicker color={tagColor} onChange={colorPickerHandler} />
                <div className='drop-down-container'>
                    <div className='drop-down-button'>
                        <button className='save-button' onClick={e => true}>save</button>
                    </div>
                    <div className='drop-down-button'>
                        <button className="cancel-button" onClick={e => setShowTagCreateForm(false)}>cancel</button>
                    </div>
                </div>


            </div>
    )
}
