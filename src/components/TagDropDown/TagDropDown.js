import React, { Component, useState, useEffect } from 'react'
import Select from 'react-select'
import { SketchPicker } from 'react-color'

import ThumbnailsPanel from 'components/ThumbnailsPanel';

// to load options from external URL provided by WebViewer constructor


export default ({ setDropDownChanged, setSelectedTags, selectedTags, creatable }) => {
    const [tagOptions, setTagOptions] = useState([]);
    const [showTagCreateForm, setShowTagCreateForm] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState('');

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

    const createTagOption = { value: 'create-tag', label: 'create new tag' }
    
    useEffect(() => {
        if (creatable) {
            options.push(createTagOption);
        }
        setTagOptions(options);

    }, []);

    return (
        <ThumbnailsPanel />
        // !showTagCreateForm ? <Select
        //     onChange={(o, {option, action}) => {
        //         if (action === 'select-option'){
        //             if (option.value === 'create-tag'){
        //                 setShowTagCreateForm(true);
        //                 return;
        //             }
        //         }
        //         setDropDownChanged(true);
        //         setSelectedTags(option);
        //     }
        //     }
        //     defaultValue={selectedTags}
        //     isSearchable
        //     isClearable
        //     options={tagOptions}
        //     styles={customStyles}
        //     closeMenuOnSelect={false}
        //     isMulti
        //     noOptionsMessage={e => "no tags available"}
            
        // /> : 
        // <div>
        //     <label htmlFor='tagName'>Tag Name</label>
        //     <input type='text' id='tagName' value={tagName} onChange={e => setTagName(e.target.value)}/>
        //     <label htmlFor='tagColor'>Tag Color</label>
        //     <SketchPicker color={ tagColor } onChange={colorPickerHandler}/>
        //     <button onClick={e => true}>save</button>
        //     <button onClick={e => setShowTagCreateForm(false)}>cancel</button>
        // </div>
    )
}
