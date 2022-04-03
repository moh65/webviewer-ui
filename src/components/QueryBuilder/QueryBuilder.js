import 'components/webcomponents/query-builder'
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Swipeable } from 'react-swipeable';
import { FocusTrap } from '@pdftron/webviewer-react-toolkit';

const queryBuilder = ({ isOpen, onClose }) => {
    useEffect(() => {
        queryBuilderRef.current.addEventListener('execute-query', (e) => {
            alert('execute query');
            onClose();
        });

        queryBuilderRef.current.addEventListener('close-query-builder', (e) => {
            onClose();
        });

        queryBuilderRef.current.setAttribute('tabindex', 0);

        return () => {
            window.removeEventListener('execute-query');
            window.removeEventListener('close-query-builder');
        }
    }, [])

    const closeModal = () => {
    };


    const queryBuilderRef = useRef();

    const modalClass = classNames({
        Modal: true,
        FilterAnnotModal: true,
        open: isOpen,
        closed: !isOpen,
    });

    return (
        <div className={modalClass} data-element="filterModal" onMouseDown={closeModal}>
                <div className="container" onMouseDown={e => e.stopPropagation()}>
                    <query-builder ref={queryBuilderRef} />
                </div>
            </div>
        // <Swipeable onSwipedUp={closeModal} onSwipedDown={closeModal} preventDefaultTouchmoveEvent>
            
        // </Swipeable>

    )
}

export default queryBuilder;