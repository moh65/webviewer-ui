import 'components/webcomponents/query-builder'
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import selectors from 'selectors';
import Loading from 'components/loading';



const queryBuilder = ({ isOpen, onClose }) => {
    let [
        token,
        metadataTypeUrl,
        allMimeTypesUrl,
        defaultBaseUrlAddress
    ] = useSelector(state => [
        selectors.getAuthToken(state),
        selectors.getMetadataTypeUrl(state),
        selectors.getAllMimeTypesUrl(state),
        selectors.getDefaultUrlBaseAddress(state)
    ]);
    const [metadataInfo, setMedataInfo] = useState([])
    const [mimeTypeInfo, setMimeTypeInfo] = useState([])
    const [showQueryBuilder, setShowQueryBuilder] = useState(false)
    const [loading, setLoading] = useState(false);

    metadataTypeUrl = metadataTypeUrl ? metadataTypeUrl : `${defaultBaseUrlAddress}/api/search/allmetadatatypes/664`;
    allMimeTypesUrl = allMimeTypesUrl ? allMimeTypesUrl : `${defaultBaseUrlAddress}/api/search/allmimetypes/664`;

    // useEffect(() => {
    //     return () => {
    //         if (queryBuilderRef && queryBuilderRef.current) {
    //             queryBuilderRef.current.removeEventListener('execute-query');
    //             queryBuilderRef.current.removeEventListener('close-query-builder');
    //         }
    //     }
    // });

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            if (metadataInfo.length === 0 || mimeTypeInfo.length === 0) {
                if (metadataInfo.length === 0) {
                    fetch(metadataTypeUrl, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(json => {
                            debugger
                            setMedataInfo(json);
                        });
                }

                if (mimeTypeInfo.length === 0) {
                    fetch(allMimeTypesUrl, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(json => {
                            debugger
                            setMimeTypeInfo(json);
                        });
                }
            } else {
                setLoading(false);
            }
        }
    }, [isOpen])

    useEffect(() => {
        if (metadataInfo && metadataInfo.length > 0 && mimeTypeInfo && mimeTypeInfo.length) {
            setShowQueryBuilder(true);
            setLoading(false);
            const checkerHandler = setInterval(()=>{
                if (queryBuilderRef && queryBuilderRef.current) {
                    queryBuilderRef.current.addEventListener('execute-query', (e) => {
                        alert('execute query');
                        onClose();
                    });
    
                    queryBuilderRef.current.addEventListener('close-query-builder', (e) => {
                        onClose();
                    });
    
                    queryBuilderRef.current.searchStateData = { allMetadataTypes: metadataInfo, allMimeTypes : mimeTypeInfo  };
    
                    queryBuilderRef.current.setAttribute('tabindex', 0);
                    
                    clearInterval(checkerHandler);
                }
            }, 500);
        } else {
            setShowQueryBuilder(false);
        }
    }, [metadataInfo, mimeTypeInfo])

    const queryBuilderRef = useRef();

    const modalClass = classNames({
        Modal: true,
        FilterAnnotModal: true,
        open: isOpen,
        closed: !isOpen,
    });

    return (
        <>
            {
                loading && <div style={{ height: '100%' }}><Loading /></div>
            }
            {
                showQueryBuilder && <div className={modalClass} data-element="filterModal">
                    <div className="container" onMouseDown={e => e.stopPropagation()}>
                        <query-builder ref={queryBuilderRef} />
                    </div>
                </div>
            }
        </>
    )
}

export default queryBuilder;