//customization-new-file
import actions from 'actions';

export default store => (sectionUrl, 
    documentUrl, 
    createTagUrl, 
    getTagsUrl, 
    generateThumbnailUrl, 
    pageThumbnailUrl, 
    documentPagesUrl,
    loadDocumentInNewTabUrl) => {

    store.dispatch(actions.setSectionUrl(sectionUrl));

    store.dispatch(actions.setDocumentUrl(documentUrl));

    store.dispatch(actions.setCreateTagUrl(createTagUrl));

    store.dispatch(actions.setGetTagsUrl(getTagsUrl));

    store.dispatch(actions.setGenerateThumbnailUrl(generateThumbnailUrl));

    store.dispatch(actions.setPageThumbnailUrl(pageThumbnailUrl));

    store.dispatch(actions.setDocumentPagesUrl(documentPagesUrl));

    store.dispatch(actions.setLoadDocumentInNewTabUrl(loadDocumentInNewTabUrl));
    
};
