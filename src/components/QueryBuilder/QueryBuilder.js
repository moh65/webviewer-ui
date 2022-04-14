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
        allMimeTypesUrl
    ] = useSelector(state => [
        selectors.getAuthToken(state),
        selectors.getMetadataTypeUrl(state),
        selectors.getAllMimeTypesUrl(state)
    ]);
    const [metadataInfo, setMedataInfo] = useState([])
    const [mimeTypeInfo, setMimeTypeInfo] = useState([])
    const [showQueryBuilder, setShowQueryBuilder] = useState(false)
    const [loading, setLoading] = useState(false);

    metadataTypeUrl = metadataTypeUrl ? metadataTypeUrl : 'http://localhost:5600/api/search/allmetadatatypes/664';
    allMimeTypesUrl = allMimeTypesUrl ? allMimeTypesUrl : 'http://localhost:5600/api/search/allmimetypes/664';
    token = token ? token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImxyLU93Q3RDVkstcGF0Y3RabzJ2MnciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2NDk2MzAzMzQsImV4cCI6MTY0OTYzMzkzNCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDA0IiwiYXVkIjoiYnVuZGxlIiwiY2xpZW50X2lkIjoiMEZBNjI2QjQwQkNGNDE4Q0FBQzQ3MkE4MkQ1MUIzQTYiLCJzdWIiOiJlNzYwZGNjMmEyMDI0YmY4YThlOThmZWE0NzJmNzAxNSIsImF1dGhfdGltZSI6MTY0OTM4MzU4MSwiaWRwIjoibG9jYWwiLCJmaXJtSWQiOiJmMzM5NmE3NzY4MTg0ZTliOGUyYmFhNWNhMTg5M2UzNCIsInBlcm1pc3Npb25zIjoiTGVnYWxCdW5kbGUiLCJyb2xlIjpbIlN1cHBvcnREZXNrIiwiU3VwZXJBZG1pbiJdLCJzY29wZSI6WyJwZXJtaXNzaW9ucyIsInJvbGVzIiwicHJvZmlsZSIsIm9wZW5pZCIsImJ1bmRsZSJdLCJhbXIiOlsicHdkIl19.kKSHsPr6mHHVYNdGij_aA-cxx7d-52tKs5gv3_bJtJRjH2t5GfRb8dTSS_ZwRpqoU2ok20YolOo6J-01BdJLi88tGLzAx1v9QZAHWWyV5ZsD5sl_1cSZUYvgXpwjPEqQvjWwP1dT3K59VxnEhUhRVN78Ox5AaIN9Xs5ZQaV5xVtsCZU_FUPowuDnOJdsU1BiTeA0Lss2zjRXBJ-jblddWj7V0CjyLYDeKz3UT94fe4i5htaDIzVLxRL4XJv2EfdzdjXhZR-SFbNV2W2vm9IWwivfn0hmXI898nYssJffiyNMjULIgg87_9Ml2VivIuvfVVsMdYseP9ereT5F6L3rZw';

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