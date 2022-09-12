//customization-new-file
import actions from 'actions';
import { useSelector } from 'react-redux';
import selectors from 'selectors';

export default store => () => {
    let token = selectors.getAuthToken(store.getState());
    let getTagsUrl = selectors.getGetTagsUrl(store.getState());
    let defaultBaseUrlAddress = selectors.getDefaultUrlBaseAddress(store.getState());

    // getTagsUrl = getTagsUrl ? getTagsUrl : `${defaultBaseUrlAddress}/api/bundle/jobtag/1`;
    
    if (getTagsUrl){
        let options = [];
        fetch(getTagsUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
        }).then(res => res.json())
        .then(json => {
            options = json.map(m => ({
            label: m.TagName,
            value: `${m.JobTagId}-${m.TagColour}`,
            }));
    
            store.dispatch(actions.setTagOptions({ loaded: true, options }));
        });
    }
    
};