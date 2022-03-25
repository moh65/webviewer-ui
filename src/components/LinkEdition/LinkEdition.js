import React, { Component, useState, useEffect } from 'react'
import actions from 'actions';
import selectors from 'selectors';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import LinkModal from 'components/LinkModal';

export default ({ annotation }) => {
    const dispatch = useDispatch();

    const showEditUrl = (e) => {
        e.preventDefault();
        let urlElement = annotation.actions.U.find(f => f.elementName === 'URI');
        let pageElement = annotation.actions.U.find(f => f.elementName === 'GoTo');

        if (pageElement || (urlElement && urlElement.uri.includes('bundle_custom_'))) {            
            dispatch(actions.setAnnotationLinkToEdit({annotation, element: pageElement, isPageLink: true}));
            dispatch(actions.openElement('linkModal'))
        } else if (urlElement) {
            dispatch(actions.setAnnotationLinkToEdit({annotation, element: urlElement, isPageLink: false}));
            dispatch(actions.openElement('linkModalUrl'))
        }
    }

    return (
        <div>
            <button onClick={showEditUrl}>Edit Link</button>
        </div>
    )
}