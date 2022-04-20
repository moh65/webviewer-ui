
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import selectors from 'selectors';
import Gallery from "react-photo-gallery";
import SelectedImage from './SelectedImage';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button';
import Loading from 'components/loading';

export default ({ logicalItemInfo, isOpen, setIsOpen, onSelectThumbnail }) => {
    let [
        token,
        generateThumbnailUrl,
        documentPagesUrl,
        pageThumbnailUrl,
        defaultBaseUrlAddress
    ] = useSelector(state => [
        selectors.getAuthToken(state),
        selectors.getGenerateThumbnailUrl(state),
        selectors.getDocumentPagesUrl(state),
        selectors.getPageThumbnailUrl(state),
        selectors.getDefaultUrlBaseAddress(state)
    ]);
    const [t] = useTranslation();

    generateThumbnailUrl = generateThumbnailUrl ? generateThumbnailUrl : `${defaultBaseUrlAddress}/api/bundleitem/${logicalItemInfo.id}/generate/thumbnails`;
    pageThumbnailUrl = pageThumbnailUrl ? pageThumbnailUrl : `${defaultBaseUrlAddress}/api/bundleitem/{itemId}/page/{pageId}/thumbnail?w=200&h=250&access_token={token}`;
    documentPagesUrl = documentPagesUrl ? documentPagesUrl : `${defaultBaseUrlAddress}/api/bundle/664/{itemId}/pages`;

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