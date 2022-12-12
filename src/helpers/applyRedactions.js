import core from 'core';
import i18next from 'i18next';

import actions from 'actions';
import { fireError } from 'helpers/fireEvent';
import downloadPdf from 'helpers/downloadPdf';
import { PRIORITY_THREE, PRIORITY_TWO, PRIORITY_ONE } from 'constants/actionPriority';

function noop() { }

export default (annotations, onRedactionCompleted = noop) => (dispatch) => {
  if (core.isWebViewerServerDocument()) {
    // when are using Webviewer Server, it'll download the redacted document
    return webViewerServerApply(annotations, dispatch);
  }
  return webViewerApply(annotations, onRedactionCompleted, dispatch);
};

const webViewerServerApply = (annotations, dispatch) => core.applyRedactions(annotations).then((results) => {
  if (results && results.url) {
    return downloadPdf(dispatch, {
      filename: 'redacted.pdf',
      includeAnnotations: true,
      externalURL: results.url,
    });
  }
  console.warn('WebViewer Server did not return a valid result');
});

const webViewerApply = (annotations, onRedactionCompleted, dispatch) => {
  const message = i18next.t('warning.redaction.applyMessage');
  const title = i18next.t('warning.redaction.applyTile');
  const confirmBtnText = i18next.t('action.apply');

  const warning = {
    message,
    title,
    confirmBtnText,
    onConfirm: () => {
      core.applyRedactions(annotations)
        .then(() => {
          onRedactionCompleted();
        })
        .catch((err) => fireError(err));
      return Promise.resolve();
    },
  };

  return dispatch(actions.showWarningMessage(warning));
};

const applyRedactionFromCommentBox = (annotation, dispatch, redactionBurninDateUrl, token) => {
  
  const message = 'You are about to apply this redaction. This process is not reversible. Are you sure?';
  const title = i18next.t('warning.redaction.applyTile');
  const confirmBtnText = i18next.t('action.apply');

  const warning = {
    message,
    title,
    confirmBtnText,
    onConfirm: async () => {
      let body = [annotation.Id];//becareful to pass the exact name and case of the property names
      
      try {
        
        let response = await fetch(redactionBurninDateUrl.replace('{token}', encodeURIComponent(token)), {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          
          body: JSON.stringify(body)
        })
        if (response.ok){
          core.applyRedactions([annotation]).then(r => dispatch(actions.disableElement('redactionsLabel', PRIORITY_THREE))).catch(err => fireError(err));
        } else {
          throw new Error('Something went wrong, please try again')
        }
        
        return Promise.resolve();
      }catch(e){
        fireError(e)
      }
      
      //call to 
      
      
    },
  };

  return dispatch(actions.showWarningMessage(warning));
}

export {webViewerApply, webViewerServerApply, applyRedactionFromCommentBox}