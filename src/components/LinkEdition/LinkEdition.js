//customization-new-file

import React, { Component, useState, useEffect } from 'react'
import actions from 'actions';
import selectors from 'selectors';
import core from 'core';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faExternalLinkSquare } from '@fortawesome/free-solid-svg-icons';

import './LinkEdition.scss';

export default ({ annotation }) => {
    const dispatch = useDispatch();
    const [urlElement, setUrlElement] = useState({});
    const [pageElement, setPageElement] = useState({});
    const [url, setUrl] = useState('');

    useEffect(() => {
        let urlElement = annotation.actions.U.find(f => f.elementName === 'URI');
        setUrlElement(urlElement)
        let pageElement = annotation.actions.U.find(f => f.elementName === 'GoTo');
        setPageElement(pageElement)
        
        let highlightAnnot = core.getAnnotationById(annotation.InReplyTo);
        if (highlightAnnot){
            setUrl(highlightAnnot.getCustomData('custom-link'));
        }
    })

    const showEditUrl = (e) => {
        e.preventDefault();

        if (pageElement || (urlElement && urlElement.uri.includes('bundle_custom_'))) {
            dispatch(actions.setAnnotationLinkToEdit({ annotation, element: pageElement, isPageLink: true }));
            dispatch(actions.openElement('linkModal'))

        } else if (urlElement) {
            dispatch(actions.setAnnotationLinkToEdit({ annotation, element: urlElement, isPageLink: false }));
            dispatch(actions.openElement('linkModalUrl'))

        }
    }

    const goToUrl= (e) => {
        e.preventDefault();
        debugger
        annotation.actions.U[0].onTriggered(annotation, {rc: true}, annotation.fE);
    }

    return (
        <div className='note-content'>
            <div className='note-link'>
            {
                url.includes('page-') && (
                <div>
                        <strong><a href="#" onClick={goToUrl}><FontAwesomeIcon icon={faLink} />{url}</a></strong>
                </div>
            )}
            {
                !url.includes('page-') && (
                <div>
                        <strong><a href="#" onClick={goToUrl}><FontAwesomeIcon icon={faExternalLinkSquare} />{url.replace('&amp;', '&')}</a></strong>
                </div>
            )}      
            </div>
            <div className='note-edit'>
                <button className='cancel-button' onClick={showEditUrl}>Edit</button>
            </div>
        </div>
    )
}