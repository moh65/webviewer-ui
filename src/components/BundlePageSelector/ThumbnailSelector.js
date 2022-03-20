
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

    token = token ? token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImxyLU93Q3RDVkstcGF0Y3RabzJ2MnciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2NDc3NzY2NDYsImV4cCI6MTY0Nzc4MDI0NiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDA0IiwiYXVkIjoiYnVuZGxlIiwiY2xpZW50X2lkIjoiMEZBNjI2QjQwQkNGNDE4Q0FBQzQ3MkE4MkQ1MUIzQTYiLCJzdWIiOiIyNGRiOTMyZGU4MWM0Y2Q3YTU2MzY0YzRiZDZkYTAwNyIsImF1dGhfdGltZSI6MTY0NTU2NjQyMCwiaWRwIjoibG9jYWwiLCJmaXJtSWQiOiJjYTdmZWFkMTAxZDg0NDk3OTg5ODBiMTQ0YmU1MTFlMiIsInBlcm1pc3Npb25zIjoiTGVnYWxCdW5kbGUiLCJyb2xlIjpbIlN1cHBvcnREZXNrIiwiVXNlciIsIlN1cGVyQWRtaW4iXSwic2NvcGUiOlsicGVybWlzc2lvbnMiLCJyb2xlcyIsInByb2ZpbGUiLCJvcGVuaWQiLCJidW5kbGUiXSwiYW1yIjpbInB3ZCJdfQ.l2b1BR_rFdSXPlZRblLwzefzjNJwAE0yTbI-I3PSLQlUxRogD8t-sUV9sVf7lbRrUuiwDhTAHKQs_z6goLEMtEEQ2Flny_cZdbpAf0MxCIFzJIP4uRVc4qfMikuW-0PsFBa5LJ9tdiHZTwW4uD1NeAunp4qRx9Y1zTBb2iKkMNP2lnyly2Bu27SwgNPrJhZYS_rQWurE7d3wwrMYsXpH5tGm13mPDLFYQ6UCcRrKU6I4lfOyVTFv3XRTCH_-9vqMO-yOLCi6fKLzXnRJPbwtw7TAuPeCbv9sZPcKm1lu37MjzwLDg1gT7mb8d0YirL6yPXDVXoZoOxUops2d6q-anQ';
    generateThumbnailUrl = generateThumbnailUrl ? generateThumbnailUrl : `http://localhost:5600/api/bundleitem/${logicalItemInfo.id}/generate/thumbnails`;
    pageThumbnailUrl = pageThumbnailUrl ? pageThumbnailUrl : 'http://localhost:5600/api/bundleitem/{itemId}/page/{pageId}/thumbnail?w=200&h=250&access_token={token}';
    documentPagesUrl = documentPagesUrl ? documentPagesUrl : 'http://localhost:5600/api/bundle/ca7fead101d8449798980b144be511e2/632/{itemId}/pages';

    const [thumbnailLoading, setThumbnailLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [error, setError] = useState(false);
    const [pageThumbnailData, setPageThumbnailData] = useState([]);
    const [deselectThumbnail, setDeselectThumbnail] = useState('');
    const [selectedPage, setSelectedPage] = useState({});
    const [pageData, setPageData] = useState([]);


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
                        width: 1,
                        height: 1,
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
        <div class="page-container">
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
                    <div>
                        <Gallery direction='row' renderImage={imageRenderer} columns={4} photos={pageThumbnailData} />
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