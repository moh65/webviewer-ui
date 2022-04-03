
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import selectors from 'selectors';
import Gallery from "react-photo-gallery";
import SelectedImage from './SelectedImage';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button';
import Loading from './loading';

export default ({ logicalItemInfo, isOpen, setIsOpen, onSelectThumbnail }) => {
    let [
        token,
        generateThumbnailUrl,
        documentPagesUrl,
        pageThumbnailUrl
    ] = useSelector(state => [
        selectors.getAuthToken(state),
        selectors.getGenerateThumbnailUrl(state),
        selectors.getDocumentPagesUrl(state),
        selectors.getPageThumbnailUrl(state)
    ]);
    const [t] = useTranslation();

    token = token ? token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImxyLU93Q3RDVkstcGF0Y3RabzJ2MnciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2NDgxODc0NjAsImV4cCI6MTY0ODE5MTA2MCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDA0IiwiYXVkIjoiYnVuZGxlIiwiY2xpZW50X2lkIjoiMEZBNjI2QjQwQkNGNDE4Q0FBQzQ3MkE4MkQ1MUIzQTYiLCJzdWIiOiJlNzYwZGNjMmEyMDI0YmY4YThlOThmZWE0NzJmNzAxNSIsImF1dGhfdGltZSI6MTY0ODE3Njk2MiwiaWRwIjoibG9jYWwiLCJmaXJtSWQiOiJmMzM5NmE3NzY4MTg0ZTliOGUyYmFhNWNhMTg5M2UzNCIsInBlcm1pc3Npb25zIjoiTGVnYWxCdW5kbGUiLCJyb2xlIjpbIlN1cHBvcnREZXNrIiwiU3VwZXJBZG1pbiJdLCJzY29wZSI6WyJwZXJtaXNzaW9ucyIsInJvbGVzIiwicHJvZmlsZSIsIm9wZW5pZCIsImJ1bmRsZSJdLCJhbXIiOlsicHdkIl19.TEVVxvt9SUfIVIczpDWldjqWM3A3Ejyef6xfDL7TUmvfwqoXX1BkxeZaAMHyXV2FHs9sMTDamzw5aKto6NKMvShf7pJm_wCypd-DxarsqwhcaqDmp8YF_3kVbe4xT-XudWTfvaZJ3aY0EpwcwDtuy5D63wl8LijN1EMR5H6S_MO50ImSQAS8egNDvvDYeekHegoM03kW0r8H2L-ugXNOBtaOUBrcAZFeQhqvBu38rrJqK1VOtmWryrTR7OCMZJ_HQJNYs5Uah_msWtpKsta5wFJXn3DqN77cBFPZMCbF9At8DedQAeH3942RnkWy0eZ1xMcuql_ZgaT4q46F5Ujc3Q';
    generateThumbnailUrl = generateThumbnailUrl ? generateThumbnailUrl : `http://localhost:5600/api/bundleitem/${logicalItemInfo.id}/generate/thumbnails`;
    pageThumbnailUrl = pageThumbnailUrl ? pageThumbnailUrl : 'http://localhost:5600/api/bundleitem/{itemId}/page/{pageId}/thumbnail?w=200&h=250&access_token={token}';
    documentPagesUrl = documentPagesUrl ? documentPagesUrl : 'http://localhost:5600/api/bundle/664/{itemId}/pages';

    const [thumbnailLoading, setThumbnailLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [error, setError] = useState(false);
    const [pageThumbnailData, setPageThumbnailData] = useState([]);
    const [selectedPage, setSelectedPage] = useState({});

    const thumbnailClickHandler = (img) => {
        setSelectedPage(img);
    }

    useEffect(() => {
        setThumbnailLoading(true);
        fetch(generateThumbnailUrl.replace('{itemId}', logicalItemInfo.id), {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        }
        ).then(response => {
            if (!response.ok) {
                setError(true);
                setShowGallery(false);
            } else {
                setError(false);
                fetch(documentPagesUrl.replace('{itemId}', logicalItemInfo.id), {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                }
                ).then(response => {
                    if (!response.ok) {
                        setError(true);
                        setShowGallery(false);
                    } else {
                        setError(false);
                    }
                    setThumbnailLoading(false);
                    return response.json()
                }).then(data => {
                    data = data.map(m => ({
                        id: m.s.pageId,
                        width: 10,
                        height: 10,
                        num: m.pageNum,
                        src: pageThumbnailUrl.replace('{pageId}', m.s.pageId).replace('{itemId}', logicalItemInfo.id).replace('{token}', encodeURIComponent(token))
                    }))

                    setPageThumbnailData(data)

                    setShowGallery(true);
                });
            }
            setThumbnailLoading(false);
        });


    }, [isOpen]);

    const imageRenderer = ({ index, left, top, key, photo }) => (
        <div className={"image-item"}
            key={key}
            role={"button"}
            tabIndex={0}
            style={{
                width: photo.width,
                height: photo.height,
                //the important staff
                position: "absolute",
                left,
                top
            }}>
            <SelectedImage
                selectedPhoto={selectedPage}
                key={key}
                margin={"2px"}
                index={index}
                photo={photo}
                left={left}
                top={top}
                onSelectHandler={thumbnailClickHandler}
            />
            <span class="page-number"><strong>{photo.num}</strong></span>
        </div>
    )

    return (
        <div>
            {
                error &&
                <div>
                    there is error fetching data
                </div>
            }
            {
                thumbnailLoading &&
                <Loading />
            }
            {
                showGallery &&
                <div>
                    <div>
                        Document Title: {
                            (
                                <strong>
                                    {logicalItemInfo.title}
                                </strong>
                            )
                        }
                    </div>
                    <div style={{overflowY:'scroll', maxHeight: '300px', width:'500px'}}>
                        <Gallery direction='column' renderImage={imageRenderer} columns={3} photos={pageThumbnailData} />
                    </div>
                    <div class="button-container">
                        <span class="button-action">
                            <Button
                                dataElement="linkSubmitButton"
                                label={t('action.select')}
                                onClick={() => { onSelectThumbnail(selectedPage) }}
                            />
                        </span>

                        <span class="button-action">
                            <Button
                                dataElement="linkSubmitButton"
                                label={t('action.changeDocument')}
                                onClick={() => { setIsOpen(false); }}
                            />
                        </span>
                    </div>
                </div>

            }
        </div>
    )
}