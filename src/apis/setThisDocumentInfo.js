//customization-new-file
import actions from 'actions';

export default store => (thisDocumentInfo) => {
    store.dispatch(actions.setThisDocumentInfo(thisDocumentInfo));
};
