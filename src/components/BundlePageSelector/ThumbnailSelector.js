
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import selectors from 'selectors';
import Gallery from "react-photo-gallery";
import SelectedImage from './SelectedImage';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import actions from 'actions';

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
    documentPagesUrl = documentPagesUrl ? documentPagesUrl : `${defaultBaseUrlAddress}/api/bundle/4/{itemId}/pages`;

    const [thumbnailLoading, setThumbnailLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [error, setError] = useState(false);
    const [pageThumbnailData, setPageThumbnailData] = useState([]);
    const [selectedPage, setSelectedPage] = useState({});
    const dispatch = useDispatch();

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
                        width: 21,
                        height: 29.7,
                        sizes: ["(max-width: 210px) 50vw,(max-width: 210px) 33.3vw,(max-width: 210px) 100vw"],
                        thumbnailHeight: '210px',
                        thumbnailWidth : '297px',
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
        <div className={"image-item" + (selectedPage.num === photo.num ? ' image-item-selected' : '' ) }
            key={key}
            role={"button"}
            tabIndex={0}
            style={{
                width: "210px",
                height: "297px",
                //the important staff
                position: "relative",
                left: "0px",
                top: "0px"
            }}>
            <span className="page-number"><strong>Page {photo.num}</strong></span>
            <SelectedImage
                selectedPhoto={selectedPage}
                key={key}
                width={"210px"}
                height={"297px"}
                margin={"2px"}
                padding= {"10px"}
                index={index}
                photo={photo}
                left={"0px"}
                top={"0px"}
                onSelectHandler={thumbnailClickHandler}
            />
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
                    <div className='gallery-outline'>
                        <Gallery direction='column' renderImage={imageRenderer} columns={3} photos={pageThumbnailData} className="gallery-view" />
                    </div>
                    <div className="button-container">


                        <span className="button-action" style={{float: "left"}}>
                            <Button
                                class='btn4-change'
                                startIcon={<FontAwesomeIcon icon="arrows-rotate" />}
                                onClick={() => { setIsOpen(false); }}
                            >{t('action.changeDocument')}</Button>
                        </span>

                        <span className="button-action" style={{float: "right"}}>
                            <Button
                                class='btn4-primary'
                                startIcon={<FontAwesomeIcon icon="check" />}
                                onClick={() => { 
                                    if (selectedPage.id) {
                                        onSelectThumbnail(selectedPage) }
                                    }
                                }
                            >Select Page</Button>
                        </span>

                        <span className="button-action" style={{float: "right"}}>
                            <Button
                                class='btn4-secondary'
                                startIcon={<FontAwesomeIcon icon="ban" />}
                                onClick={() => { dispatch(actions.closeElement('linkModal')) }}
                            >Cancel</Button>
                        </span>
                    </div>
                </div>

            }
        </div>
    )
}