import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { hexToRgba2 } from 'helpers/color';

import defaultTool from 'constants/defaultTool';
import core from 'core';
import { Tabs, Tab, TabPanel } from 'components/Tabs';
import Button from 'components/Button';
import BundlePageSelector from 'components/BundlePageSelector';
import actions from 'actions';
import selectors from 'selectors';

import { Swipeable } from 'react-swipeable';

import './LinkModal.scss';

import BsButton from 'react-bootstrap/Button';

const LinkModal = () => {
  let [
    isDisabled,
    isDisabledForUrl,
    defaultTag,
    isOpen,
    isOpenForUrl,
    totalPages,
    currentPage,
    tabSelected,
    pageLabels,
    annotationLinkToEdit
  ] = useSelector(state => [
    selectors.isElementDisabled(state, 'linkModal'),

    //customization
    selectors.isElementDisabled(state, 'linkModalUrl'),
    selectors.getDefaultTag(state),
    //customization

    selectors.isElementOpen(state, 'linkModal'),

    //customization
    selectors.isElementOpen(state, 'linkModalUrl'),
    //customization

    selectors.getTotalPages(state),
    selectors.getCurrentPage(state),
    selectors.getSelectedTab(state, 'linkModal'),
    selectors.getPageLabels(state),
    selectors.getAnnotationLinkToEdit(state)
  ]);



  const [t] = useTranslation();
  const dispatch = useDispatch();

  const urlInput = React.createRef();
  const pageLabelInput = React.createRef();
  const urlTab = React.createRef();
  const pageTab = React.createRef();

  const [url, setURL] = useState('');
  const [pageLabel, setPageLabel] = useState("");

  const closeModal = () => {
    //customization
    if (isOpenForUrl) {
      dispatch(actions.closeElement('linkModalUrl'));
    }
    if (isOpen) {
      dispatch(actions.closeElement('linkModal'));
    }
    dispatch(actions.setAnnotationLinkToEdit(null))
    //customization
    setURL('');
    core.setToolMode(defaultTool);
  };

  const newLink = (x, y, width, height, linkPageNumber = currentPage) => {
    const link = new Annotations.Link();
    link.PageNumber = linkPageNumber;
    link.StrokeColor = new Annotations.Color(0, 165, 228);
    link.StrokeStyle = 'underline';
    link.StrokeThickness = 2;
    link.Author = core.getCurrentUser();
    link.Subject = 'Link';
    link.X = x;
    link.Y = y;
    link.Width = width;
    link.Height = height;
    return link;
  };

  const createLink = action => {
    const linksResults = [];


    let quads = core.getSelectedTextQuads();
    const selectedAnnotations = core.getSelectedAnnotations();


    //customization
    if (quads && Object.keys(quads).length === 0) {
      let fakeQuads = {};
      fakeQuads[annotationLinkToEdit.annotation.PageNumber] = [];
      let highlightAnnot = core.getAnnotationManager().getAnnotationById(annotationLinkToEdit.annotation.InReplyTo);

      for (const quad of highlightAnnot.Quads) {
        fakeQuads[annotationLinkToEdit.annotation.PageNumber].push({
          x1: quad.x1,
          x2: quad.x2,
          x3: quad.x3,
          x4: quad.x4,
          y1: quad.y1,
          y2: quad.y2,
          y3: quad.y3,
          y4: quad.y4
        });
      }

      quads = fakeQuads;
    }
    //customization


    if (quads) {
      let selectedText = core.getSelectedText();
      //customization

      if (!selectedText || selectedText === '')
        selectedText = selectedAnnotations[0].Wba;
      //customization

      for (const currPageNumber in quads) {
        const currPageLinks = [];
        quads[currPageNumber].forEach(quad => {
          currPageLinks.push(
            newLink(
              Math.min(quad.x1, quad.x3),
              Math.min(quad.y1, quad.y3),
              Math.abs(quad.x1 - quad.x3),
              Math.abs(quad.y1 - quad.y3),
              parseInt(currPageNumber)
            )
          );
        });

        //customization

        let previousCustomDatas = [];
        if (annotationLinkToEdit && annotationLinkToEdit.annotation) {
          debugger
          let highlightAnnot = core.getAnnotationManager().getAnnotationById(annotationLinkToEdit.annotation.InReplyTo);
          previousCustomDatas.push({ name: 'custom-private', value: highlightAnnot.getCustomData('custom-private') });
          previousCustomDatas.push({ name: 'custom-date', value: highlightAnnot.getCustomData('custom-date') });
          previousCustomDatas.push({ name: 'custom-tag-options', value: highlightAnnot.getCustomData('custom-tag-options') });
          previousCustomDatas.push({ name: 'custom-tag', value: highlightAnnot.getCustomData('custom-tag') });
          core.deleteAnnotations([annotationLinkToEdit.annotation, highlightAnnot])
        }

        //customization
        createHighlightAnnot(
          currPageLinks,
          quads[currPageNumber],
          selectedText,
          action,
          previousCustomDatas
        );
        linksResults.push(...currPageLinks);
      }
    }

    //customization
    // if (selectedAnnotations) {

    //   selectedAnnotations.forEach(annot => {
    //     const annotManager = core.getAnnotationManager();
    //     const groupedAnnots = annotManager.getGroupAnnotations(annot);

    //     // ungroup and delete any previously created links
    //     if (groupedAnnots.length > 1) {
    //       const linksToDelete = groupedAnnots.filter(annot => annot instanceof Annotations.Link);
    //       if (linksToDelete.length > 0) {
    //         annotManager.ungroupAnnotations(groupedAnnots);
    //         core.deleteAnnotations(linksToDelete);
    //       }
    //     }

    //     const link = newLink(annot.X, annot.Y, annot.Width, annot.Height);
    //     link.addAction('U', action);
    //     core.addAnnotations([link]);
    //     linksResults.push(link);
    //     annotManager.groupAnnotations(annot, [link]);
    //   });
    // }
    //customization

    return linksResults;
  };

  const createHighlightAnnot = async (linkAnnotArray, quads, text, action, previousCustomDatas) => {
    const annotManager = core.getAnnotationManager();
    const linkAnnot = linkAnnotArray[0];
    const highlight = new Annotations.TextHighlightAnnotation();
    highlight.PageNumber = linkAnnot.PageNumber;
    highlight.X = linkAnnot.X;
    highlight.Y = linkAnnot.Y;
    highlight.Width = linkAnnot.Width;
    highlight.Height = linkAnnot.Height;

    let c = defaultTag.value ? hexToRgba2(defaultTag.value.split('-')[1]) : '';
    let color = defaultTag.value && c != '' ? new Annotations.Color(c.r, c.g, c.b, c.a) : new Annotations.Color(0, 0, 0, 0);
    highlight.StrokeColor = color;

    highlight.Opacity = 0;
    highlight.Quads = quads;
    highlight.Author = core.getCurrentUser();
    //highlight.setContents(text);
    highlight.setCustomData('trn-annot-preview', text);

    linkAnnotArray.forEach((link, index) => {
      link.addAction('U', action);
      index === 0 ? core.addAnnotations([link, highlight]) : core.addAnnotations([link]);
    });
    annotManager.groupAnnotations(highlight, linkAnnotArray);
    debugger
    //customization
    highlight.setCustomData('custom-link', action.uri);
    highlight.setCustomData('custom-link-type', 'url');
    previousCustomDatas.forEach(e => highlight.setCustomData(e.name, e.value))
    //customization
  };

  const addURLLink = e => {
    e.preventDefault();

    const action = new window.Actions.URI({ uri: url });
    const links = createLink(action);

    let pageNumbersToDraw = links.map(link => link.PageNumber);
    pageNumbersToDraw = [...new Set(pageNumbersToDraw)];
    pageNumbersToDraw.forEach(pageNumberToDraw => {
      core.drawAnnotations(pageNumberToDraw, null, true);
    });

    closeModal();
  };

  const isValidPageLabel = () => {
    return pageLabels?.includes(pageLabel);
  };

  const addPageLink = e => {
    e.preventDefault();

    const Dest = window.Actions.GoTo.Dest;

    const options = { dest: new Dest({ page: pageLabels.indexOf(pageLabel) + 1 }) };
    const action = new window.Actions.GoTo(options);

    const links = createLink(action);



    let pageNumbersToDraw = links.map(link => link.PageNumber);
    pageNumbersToDraw = [...new Set(pageNumbersToDraw)];
    pageNumbersToDraw.forEach(pageNumberToDraw => {
      core.drawAnnotations(pageNumberToDraw, null, true);
    });

    closeModal();
  };

  useEffect(() => {

    //customization
    if (annotationLinkToEdit && !annotationLinkToEdit.isPageLink) {
      setURL(annotationLinkToEdit.element.uri);
    }
    if (isOpen || isOpenForUrl) {
      if (isOpenForUrl) {
        dispatch(actions.setSelectedTab('linkModal', 'URLPanelButton'));
      }
      if (isOpen) {
        dispatch(actions.setSelectedTab('linkModal', 'PageNumberPanelButton'));
        dispatch(actions.loadSectionsInfo(true));
      }

      //  prepopulate URL if URL is selected
      const selectedText = core.getSelectedText();

      if (selectedText) {
        const urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
        const urls = selectedText.match(urlRegex);
        if (urls && urls.length > 0) {
          setURL(urls[0]);
        }
      }

      setPageLabel(pageLabels.length > 0 ? pageLabels[0] : "1");
    }
    //customization
  }, [totalPages, isOpen, isOpenForUrl]);

  useEffect(() => {
    if (tabSelected === 'PageNumberPanelButton' && !isOpenForUrl) {
      pageLabelInput.current.focus();
    } else if (tabSelected === 'URLPanelButton' && isOpenForUrl) {
      urlInput.current.focus();
    }
  }, [tabSelected, isOpen, isOpenForUrl, pageLabelInput, urlInput]);

  useEffect(() => {
    //customization
    if (isOpenForUrl) {
      dispatch(actions.setSelectedTab('linkModal', 'URLPanelButton'));
    }
    if (isOpen) {
      dispatch(actions.setSelectedTab('linkModal', 'PageNumberPanelButton'));
      dispatch(actions.loadSectionsInfo(true));
    }
    //customization

    core.addEventListener('documentUnloaded', closeModal);
    return () => {
      core.removeEventListener('documentUnloaded', closeModal);
    };
  }, []);

  const modalClass = classNames({
    Modal: true,
    LinkModal: true,
    open: isOpen || isOpenForUrl,
    closed: !isOpen && !isOpenForUrl,
  });

  return isDisabled && isDisabledForUrl ? null : (
    <Swipeable
      onSwipedUp={closeModal}
      onSwipedDown={closeModal}
      preventDefaultTouchmoveEvent
    >
      <div
        className={modalClass}
        data-element="linkModal"
        onMouseDown={closeModal}
      >
        <div className="container" onMouseDown={e => e.stopPropagation()}>
          <div className="swipe-indicator" />
          <Tabs id="linkModal">
            <div className="tab-list">
              {
                isOpenForUrl &&
                <Tab dataElement="URLPanelButton">
                  <div className="tab-options-button" ref={urlTab}>{t('link.url')}</div>
                </Tab>
              }

              {
                //customization
                !isOpenForUrl &&
                <Tab dataElement="PageNumberPanelButton">
                  <div className="tab-options-button" ref={pageTab}>{t('link.page')}</div>
                </Tab>
                //customization

              }

            </div>
            {isOpenForUrl &&
              <TabPanel dataElement="URLPanel">
                <form onSubmit={addURLLink}>
                  <div>{t('link.enterurl')}</div>
                  <div className="linkInput">
                    <input
                      className="urlInput"
                      type="url"
                      ref={urlInput}
                      value={url}
                      onChange={e => setURL(e.target.value)}
                    />
                    <Button
                      dataElement="linkSubmitButton"
                      label={t('action.link')}
                      onClick={addURLLink}
                    />
                  </div>
                </form>
              </TabPanel>
            }
            {
              !isOpenForUrl &&
              //customization
              <TabPanel dataElement="PageNumberPanel">
                <div ref={pageLabelInput}>
                  <BundlePageSelector isModalOpen={isOpen} />
                </div>
              </TabPanel>
              //customization
            }
          </Tabs>
        </div>
      </div>
    </Swipeable>
  );
};

export default LinkModal;
