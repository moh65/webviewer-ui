import core from 'core';
import getHashParams from 'helpers/getHashParams';
import fireEvent from 'helpers/fireEvent';
import { getLeftPanelDataElements } from 'helpers/isDataElementPanel';
import actions from 'actions';
import selectors from 'selectors';
import { workerTypes } from 'constants/types';
import { PRIORITY_ONE, PRIORITY_TWO } from 'constants/actionPriority';
import Events from 'constants/events';
import { print } from 'helpers/print';
import outlineUtils from 'helpers/OutlineUtils';

import onLayersUpdated from './onLayersUpdated';
import { ConstructionOutlined } from '@mui/icons-material';

let onFirstLoad = true;

export default store => async () => {
  const { dispatch, getState } = store;

  dispatch(actions.openElement('pageNavOverlay'));
  dispatch(actions.setLoadingProgress(1));

  // set timeout so that progress modal can show progress bar properly
  setTimeout(() => {
    dispatch(actions.closeElement('progressModal'));
    dispatch(actions.resetLoadingProgress());
  }, 300);

  if (onFirstLoad) {
    //customization
    window.documentViewer.getAnnotationManager().enableRedaction();
    //customization
    onFirstLoad = false;
    // redaction button starts hidden. when the user first loads a document, check HashParams the first time
    core.enableRedaction(getHashParams('enableRedaction', false) || core.isCreateRedactionEnabled());
    // if redaction is already enabled for some reason (i.e. calling instance.enableRedaction() before loading a doc), keep it enabled

    if (core.isCreateRedactionEnabled()) {
      dispatch(actions.enableElement('redactionToolGroupButton', PRIORITY_ONE));
    } else {
      dispatch(actions.disableElement('redactionToolGroupButton', PRIORITY_TWO));
    }
  }

  core.setOptions({
    enableAnnotations: getHashParams('a', false),
  });

  core.getOutlines(outlines => {
    dispatch(actions.setOutlines(outlines));
  });

  const doc = core.getDocument();
  doc.addEventListener('bookmarksUpdated', () => core.getOutlines(outlines => dispatch(actions.setOutlines(outlines))));

  outlineUtils.setDoc(core.getDocument());

  if (!doc.isWebViewerServerDocument()) {
    doc.addEventListener('layersUpdated', async () => {
      const newLayers = await doc.getLayersArray();
      const currentLayers = selectors.getLayers(getState());
      onLayersUpdated(newLayers, currentLayers, dispatch);
    });
    doc.getLayersArray().then(layers => {
      if (layers.length === 0) {
        dispatch(actions.disableElement('layersPanel', PRIORITY_ONE));
        dispatch(actions.disableElement('layersPanelButton', PRIORITY_ONE));

        const state = getState();
        const activeLeftPanel = selectors.getActiveLeftPanel(state);
        if (activeLeftPanel === 'layersPanel') {
          // set the active left panel to another one that's not disabled so that users don't see a blank left panel
          const nextActivePanel = getLeftPanelDataElements(state).find(
            dataElement => !selectors.isElementDisabled(state, dataElement),
          );
          dispatch(actions.setActiveLeftPanel(nextActivePanel));
        }
      } else {
        dispatch(actions.enableElement('layersPanel', PRIORITY_ONE));
        dispatch(actions.enableElement('layersPanelButton', PRIORITY_ONE));
        onLayersUpdated(layers, undefined, dispatch);
      }
    });
  }

  const docType = doc.getType();
  if (docType === workerTypes.PDF || (docType  === workerTypes.WEBVIEWER_SERVER && !doc.isWebViewerServerDocument())) {
    dispatch(actions.enableElement('cropToolGroupButton', PRIORITY_ONE));
  } else {
    dispatch(actions.disableElement('cropToolGroupButton', PRIORITY_ONE));
  }

  if (core.isFullPDFEnabled()) {
    const PDFNet = window.Core.PDFNet;
    const docViewer = core.getDocumentViewer();
    const pdfDoc = await docViewer.getDocument().getPDFDoc();

    PDFNet.initialize().then(() => {
      const main = async () => {
        try {
          const pageCount = await pdfDoc.getPageCount();
          const pageLabels = [];

          for (let i = 1; i <= pageCount; i++) {
            const pageLabel = await pdfDoc.getPageLabel(i);
            const label = await pageLabel.getLabelTitle(i);
            pageLabels.push(label.length > 0 ? label : i.toString());
          }

          store.dispatch(actions.setPageLabels(pageLabels));
        } catch (e) {
          console.warn(e);
        }
      };

      PDFNet.runWithCleanup(main);
    });
  }

  window.instance.UI.loadedFromServer = false;
  window.instance.UI.serverFailed = false;

  // window.instance.UI.enableFeatures([window.instance.UI.Feature.FilePicker])

  window.documentViewer
    .getAnnotationManager()
    .getFieldManager()
    .setPrintHandler(() => {
      print(
        store.dispatch,
        selectors.isEmbedPrintSupported(store.getState()),
        selectors.getSortStrategy(store.getState()),
        selectors.getColorMap(store.getState())
      );
    });

  // init zoom level value in redux
  dispatch(actions.setZoom(core.getZoom()));

  fireEvent(Events.DOCUMENT_LOADED);


    //customization
  // const updateToken = ()=> {
  //   let token = localStorage.getItem('bundle_auth_token');
  //   if (token != null && token !== ''){
  //     dispatch(actions.updateAuthToken(token))
  //   }
  // }

  // updateToken();

  // setInterval(()=>{
  //   updateToken();
  // }, 60 * 1000)


  const onTriggered = window.instance.Actions.URI.prototype.onTriggered;
  const onTriggeredGoto = window.instance.Actions.GoTo.prototype.onTriggered;

  Actions.GoTo.prototype.onTriggered = function(target, event) {
    
    if (selectors.isCtrlPressed(getState())){
      return;
    }
    onTriggeredGoto.apply(this, arguments);
  }

  Actions.URI.prototype.onTriggered = function(target, event) {

    if (target instanceof Annotations.Link) {

      if (selectors.isCtrlPressed(getState())){
        return;
      }
      
      if (this.uri.includes('bundle_custom_')){
        let parts = this.uri.replace('bundle_custom_','').split('_');//parts[0] = itemid, parts[1] = page
        let newTabUrl = selectors.getLoadDocumentInNewTabUrl(getState());
        const token = selectors.getAuthToken(getState());
        newTabUrl = newTabUrl.replace('%7BitemId%7D', parts[0]).replace('%7BpageNum%7D', parts[1]);
        newTabUrl = newTabUrl + `?access_token=${token}`
        window.open(newTabUrl);
      } else {
        let url = this.uri;
        if (!url.startsWith('http')){
          url = 'http://' + url;
        }
        window.open(url);
      }

      return;
    }
    onTriggered.apply(this, arguments);
  };

  window.document.addEventListener('keydown', (e)=>{
    if (e.ctrlKey && !selectors.isCtrlPressed(getState()))
    {
      dispatch(actions.setIsCtrlPressed(true))
    }
  });

  window.document.addEventListener('keyup', (e)=>{
    if (e.key === "Control"){
      dispatch(actions.setIsCtrlPressed(false))

    }
  });

  setTimeout(()=>{
    let section = selectors.getSectionUrl(getState());
    let document = selectors.getDocumentUrl(getState());
    let ctag = selectors.getCreateTagUrl(getState());
    let gtag = selectors.getGetTagsUrl(getState());

    console.log('section = ' + section)
    console.log('document = ' + document)
    console.log('ctag = ' + ctag)
    console.log('gtag = ' + gtag)
  }, 5000)
    //customization
};
