import i18next from 'i18next';

import LayoutMode from 'constants/layoutMode';
import FitMode from 'constants/fitMode';
import Feature from 'constants/feature';
import Events from 'constants/events';
import ToolbarGroup from 'constants/toolbar';
import { NotesPanelSortStrategy } from 'constants/sortStrategies';
import Theme from 'constants/theme';
import addSearchListener from './addSearchListener';
import addSortStrategy from './addSortStrategy';
import annotationPopup from './annotationPopup';
import closeDocument from './closeDocument';
import closeElements from './closeElements';
import contextMenuPopup from './contextMenuPopup';
import disableAnnotations from './disableAnnotations';
import disableDownload from './disableDownload';
import disableElement from './disableElement';
import disableElements from './disableElements';
import disableFeatures from './disableFeatures';
import disableFilePicker from './disableFilePicker';
import disableHighContrastMode from './disableHighContrastMode';
import disableLocalStorage from './disableLocalStorage';
import disableMeasurement from './disableMeasurement';
import disableNativeScrolling from './disableNativeScrolling';
import disableNotesPanel from './disableNotesPanel';
import disableNoteSubmissionWithEnter from './disableNoteSubmissionWithEnter';
import disablePrint from './disablePrint';
import disableRedaction from './disableRedaction';
import disableTextSelection from './disableTextSelection';
import disableTool from './disableTool';
import disableTools from './disableTools';
import disableTouchScrollLock from './disableTouchScrollLock';
import displayErrorMessage from './displayErrorMessage';
import downloadPdf from './downloadPdf';
import enableAllElements from './enableAllElements';
import enableAnnotations from './enableAnnotations';
import enableDownload from './enableDownload';
import enableElement from './enableElement';
import enableElements from './enableElements';
import enableHighContrastMode from './enableHighContrastMode';
import enableFeatures from './enableFeatures';
import enableFilePicker from './enableFilePicker';
import enableLocalStorage from './enableLocalStorage';
import enableMeasurement from './enableMeasurement';
import enableNativeScrolling from './enableNativeScrolling';
import enableNotesPanel from './enableNotesPanel';
import enablePrint from './enablePrint';
import enableRedaction from './enableRedaction';
import enableTextSelection from './enableTextSelection';
import enableTool from './enableTool';
import enableTools from './enableTools';
import enableTouchScrollLock from './enableTouchScrollLock';
import extractPagesWithAnnotations from './extractPagesWithAnnotations';
import focusNote from './focusNote';
import getAnnotationUser from './getAnnotationUser';
import getBBAnnotManager from './getBBAnnotManager';
import getCurrentPageNumber from './getCurrentPageNumber';
import getFitMode from './getFitMode';
import getLayoutMode from './getLayoutMode';
import getPageCount from './getPageCount';
import getSelectedThumbnailPageNumbers from './getSelectedThumbnailPageNumbers';
import getSelectors from './getSelectors';
import getShowSideWindow from './getShowSideWindow';
import getSideWindowVisibility from './getSideWindowVisibility';
import getToolMode from './getToolMode';
import getZoomLevel from './getZoomLevel';
import getMaxZoomLevel from './getMaxZoomLevel';
import getMinZoomLevel from './getMinZoomLevel';
import getIsHighContrastMode from './getIsHighContrastMode';
import goToFirstPage from './goToFirstPage';
import goToLastPage from './goToLastPage';
import goToNextPage from './goToNextPage';
import goToPrevPage from './goToPrevPage';
import hideOutlineControl from './hideOutlineControl';
import hotkeys from './hotkeys';
import isAdminUser from './isAdminUser';
import isElementDisabled from './isElementDisabled';
import isElementOpen from './isElementOpen';
import isHighContrastModeEnabled from './isHighContrastModeEnabled';
import isMobileDevice from './isMobileDevice';
import isReadOnly from './isReadOnly';
import isToolDisabled from './isToolDisabled';
import isFullscreen from './isFullscreen';
import loadDocument from './loadDocument';
import mentions from './mentions';
import settingsMenuOverlay from './menuOverlay';
import openElement from './openElement';
import openElements from './openElements';
import print from './print';
import printInBackground from './printInBackground';
import cancelPrint from './cancelPrint';
import registerTool from './registerTool';
import removeSearchListener from './removeSearchListener';
import rotateClockwise from './rotateClockwise';
import rotateCounterClockwise from './rotateCounterClockwise';
import saveAnnotations from './saveAnnotations';
import searchText from './searchText';
import searchTextFull from './searchTextFull';
import setActiveHeaderGroup from './setActiveHeaderGroup';
import setActiveLeftPanel from './setActiveLeftPanel';
import setAdminUser from './setAdminUser';
import setAnnotationUser from './setAnnotationUser';
import setActivePalette from './setActivePalette';
import setColorPalette from './setColorPalette';
import setPageReplacementModalFileList from './setPageReplacementModalFileList';
import setHighContrastMode from './setHighContrastMode';
import setCurrentPageNumber from './setCurrentPageNumber';
import setCustomModal from './setCustomModal';
import setCustomNoteFilter from './setCustomNoteFilter';
import setCustomPanel from './setCustomPanel';
import exportBookmarks from './exportBookmarks';
import importBookmarks from './importBookmarks';
import setFitMode from './setFitMode';
import setHeaderItems from './setHeaderItems';
import setIconColor from './setIconColor';
import setLanguage from './setLanguage';
import setTranslations from './setTranslations';
import setLayoutMode from './setLayoutMode';
import setMaxZoomLevel from './setMaxZoomLevel';
import setMinZoomLevel from './setMinZoomLevel';
import setNoteDateFormat from './setNoteDateFormat';
import setPrintedNoteDateFormat from './setPrintedNoteDateFormat';
import setNotesPanelSort from './setNotesPanelSort';
import setPageLabels from './setPageLabels';
import setPrintQuality from './setPrintQuality';
import setDefaultPrintOptions from './setDefaultPrintOptions';
import setSelectedTab from './setSelectedTab';
import setSideWindowVisibility from './setSideWindowVisibility';
import setSortNotesBy from './setSortNotesBy';
import setNotesPanelSortStrategy from './setNotesPanelSortStrategy';
import setSwipeOrientation from './setSwipeOrientation';
import setTheme from './setTheme';
import setToolbarGroup from './setToolbarGroup';
import setToolMode from './setToolMode';
import setZoomLevel from './setZoomLevel';
import setZoomList from './setZoomList';
import showErrorMessage from './showErrorMessage';
import showOutlineControl from './showOutlineControl';
import showWarningMessage from './showWarningMessage';
import syncNamespaces from './syncNamespaces';
import textPopup from './textPopup';
import toggleElement from './toggleElement';
import toggleFullScreen from './toggleFullScreen';
import {
  enableToolDefaultStyleUpdateFromAnnotationPopup,
  disableToolDefaultStyleUpdateFromAnnotationPopup
} from './toolDefaultStyleUpdateFromAnnotationPopup';
import unregisterTool from './unregisterTool';
import updateElement from './updateElement';
import updateOutlines from './updateOutlines';
import updateTool from './updateTool';
import useEmbeddedPrint from './useEmbeddedPrint';
import useNativeScroll from './useNativeScroll';
import setDisplayedSignaturesFilterFunction from './setDisplayedSignaturesFilterFunction';
import setMeasurementUnits from './setMeasurementUnits';
import setMaxSignaturesCount from './setMaxSignaturesCount';
import setSignatureFonts from './setSignatureFonts';
import disableReplyForAnnotations from './disableReplyForAnnotations';
import getCustomData from './getCustomData';
import setCustomMeasurementOverlayInfo from './setCustomMeasurementOverlayInfo';
import setNoteTransformFunction from './setNoteTransformFunction';
import setCustomNoteSelectionFunction from './setCustomNoteSelectionFunction';
import selectThumbnailPages from './selectThumbnailPages';
import unselectThumbnailPages from './unselectThumbnailPages';
import setSearchResults from './setSearchResults';
import setActiveResult from './setActiveResult';
import setAnnotationContentOverlayHandler from './setAnnotationContentOverlayHandler';
import overrideSearchExecution from './overrideSearchExecution';
import reactElements from './reactElements';
import { addTrustedCertificates } from './verificationOptions';
import toggleReaderMode from './toggleReaderMode';
import toggleElementVisibility from './toggleElementVisibility';
import setAnnotationReadState from './setAnnotationReadState';
import getAnnotationReadState from './getAnnotationReadState';
import enableClearSearchOnPanelClose from './enableClearSearchOnPanelClose';
import disableClearSearchOnPanelClose from './disableClearSearchOnPanelClose';
import disableFadePageNavigationComponent from './disableFadePageNavigationComponent';
import enableFadePageNavigationComponent from './enableFadePageNavigationComponent';
import disablePageDeletionConfirmationModal from './disablePageDeletionConfirmationModal';
import enablePageDeletionConfirmationModal from './enablePageDeletionConfirmationModal';
import addEventListener from './addEventListener';
import removeEventListener from './removeEventListener';
import enableDesktopOnlyMode from './enableDesktopOnlyMode';
import disableDesktopOnlyMode from './disableDesktopOnlyMode';
import isInDesktopOnlyMode from './isInDesktopOnlyMode';
import pageManipulationOverlay from './pageManipulationOverlay';
import getWatermarkModalOptions from './getWatermarkModalOptions';
import enableNoteSubmissionWithEnter from './enableNoteSubmissionWithEnter';
import reloadOutline from './reloadOutline';
//customization
import setCustomURLs from './setCustomURLs';
import setThisDocumentInfo from './setThisDocumentInfo';
import updateTags from './updateTags';
import core from "core";

//customization


export default store => {
  const CORE_NAMESPACE = 'Core';
  const UI_NAMESPACE = 'UI';
  const objForWebViewerCore = {
    Tools: window.Core.Tools,
    Annotations: window.Annotations,
    // keep CoreControls for backwards compabililty
    // remove this in 9.0
    CoreControls: window.Core,
    PartRetrievers: window.Core.PartRetrievers,
    Actions: window.Actions,
    PDFNet: window.PDFNet,
  };
  const objForWebViewerUI = {
    FitMode,
    LayoutMode,
    Feature,
    Events,
    ToolbarGroup,
    NotesPanelSortStrategy,
    Theme,
    addSearchListener,
    addSortStrategy: addSortStrategy(store),
    annotationPopup: annotationPopup(store),
    closeDocument: closeDocument(store),
    closeElements: closeElements(store),
    contextMenuPopup: contextMenuPopup(store),
    disableElements: disableElements(store),
    disableFeatures: disableFeatures(store),
    disableTools: disableTools(store),
    disableReplyForAnnotations: disableReplyForAnnotations(store),
    displayErrorMessage: displayErrorMessage(store),
    disableHighContrastMode: disableHighContrastMode(store),
    downloadPdf: downloadPdf(store),
    enableElements: enableElements(store),
    enableFeatures: enableFeatures(store),
    enableTools: enableTools(store),
    focusNote: focusNote(store),
    getFitMode: getFitMode(store),
    getLayoutMode: getLayoutMode(store),
    getToolMode,
    getZoomLevel,
    getMaxZoomLevel,
    getMinZoomLevel,
    hotkeys,
    hideOutlineControl: hideOutlineControl(store),
    isElementDisabled: isElementDisabled(store),
    isElementOpen: isElementOpen(store),
    isToolDisabled: isToolDisabled(store),
    isHighContrastModeEnabled: isHighContrastModeEnabled(store),
    isFullscreen,
    loadDocument: loadDocument(store),
    settingsMenuOverlay: settingsMenuOverlay(store),
    pageManipulationOverlay: pageManipulationOverlay(store),
    openElements: openElements(store),
    print: print(store),
    printInBackground: printInBackground(store),
    cancelPrint,
    registerTool: registerTool(store),
    removeSearchListener,
    searchText: searchText(store.dispatch),
    searchTextFull: searchTextFull(store.dispatch),
    overrideSearchExecution,
    setActiveHeaderGroup: setActiveHeaderGroup(store),
    setActiveLeftPanel: setActiveLeftPanel(store),
    setCustomModal: setCustomModal(store),
    showOutlineControl: showOutlineControl(store),
    setCustomNoteFilter: setCustomNoteFilter(store),
    setCustomPanel: setCustomPanel(store),
    //customization
    setCustomURLs: setCustomURLs(store),
    setThisDocumentInfo: setThisDocumentInfo(store),
    updateTags: updateTags(store),
    //customization
    exportBookmarks: exportBookmarks(store),
    extractPagesWithAnnotations,
    importBookmarks: importBookmarks(store),
    setFitMode,
    setHeaderItems: setHeaderItems(store),
    setIconColor: setIconColor(store),
    setLanguage: setLanguage(store),
    setTranslations,
    setLayoutMode,
    setMaxZoomLevel: setMaxZoomLevel(store),
    setMinZoomLevel: setMinZoomLevel(store),
    setNoteDateFormat: setNoteDateFormat(store),
    setPrintedNoteDateFormat: setPrintedNoteDateFormat(store),
    setMeasurementUnits: setMeasurementUnits(store),
    setPageLabels: setPageLabels(store),
    setPrintQuality: setPrintQuality(store),
    setDefaultPrintOptions: setDefaultPrintOptions(store),
    setNotesPanelSortStrategy: setNotesPanelSortStrategy(store),
    setSwipeOrientation,
    setTheme: setTheme(store),
    setToolbarGroup: setToolbarGroup(store),
    dangerouslySetNoteTransformFunction: setNoteTransformFunction(store),
    setCustomNoteSelectionFunction: setCustomNoteSelectionFunction(store),
    setToolMode,
    setZoomLevel,
    setZoomList: setZoomList(store),
    setSearchResults,
    setActiveResult,
    textPopup: textPopup(store),
    toggleElementVisibility: toggleElementVisibility(store),
    toggleFullScreen,
    unregisterTool: unregisterTool(store),
    updateTool: updateTool(store),
    updateElement: updateElement(store),
    useEmbeddedPrint: useEmbeddedPrint(store),
    setMaxSignaturesCount: setMaxSignaturesCount(store),
    mentions: mentions(store),
    setCustomMeasurementOverlayInfo: setCustomMeasurementOverlayInfo(store),
    setSignatureFonts: setSignatureFonts(store),
    setSelectedTab: setSelectedTab(store),
    getSelectedThumbnailPageNumbers: getSelectedThumbnailPageNumbers(store),
    setDisplayedSignaturesFilter: setDisplayedSignaturesFilterFunction(store),
    selectThumbnailPages: selectThumbnailPages(store),
    unselectThumbnailPages: unselectThumbnailPages(store),
    setAnnotationContentOverlayHandler: setAnnotationContentOverlayHandler(store),
    VerificationOptions: {
      addTrustedCertificates: addTrustedCertificates(store),
    },
    getWatermarkModalOptions: getWatermarkModalOptions(store),
    // undocumented and deprecated, to be removed in 7.0
    disableAnnotations: disableAnnotations(store),
    disableDownload: disableDownload(store),
    disableElement: disableElement(store),
    disableFilePicker: disableFilePicker(store),
    disableLocalStorage,
    disableMeasurement: disableMeasurement(store),
    disableNotesPanel: disableNotesPanel(store),
    disableNoteSubmissionWithEnter: disableNoteSubmissionWithEnter(store),
    disablePrint: disablePrint(store),
    disableRedaction: disableRedaction(store),
    disableTextSelection: disableTextSelection(store),
    disableTouchScrollLock,
    enableAnnotations: enableAnnotations(store),
    enableDownload: enableDownload(store),
    enableElement: enableElement(store),
    enableFilePicker: enableFilePicker(store),
    enableHighContrastMode: enableHighContrastMode(store),
    enableLocalStorage,
    enableMeasurement: enableMeasurement(store),
    enableNotesPanel: enableNotesPanel(store),
    enableNoteSubmissionWithEnter: enableNoteSubmissionWithEnter(store),
    enablePrint: enablePrint(store),
    enableRedaction: enableRedaction(store),
    enableTextSelection: enableTextSelection(store),
    enableTool: enableTool(store),
    enableTouchScrollLock,
    enableNativeScrolling,
    getAnnotationUser,
    getCurrentPageNumber: getCurrentPageNumber(store),
    getPageCount: getPageCount(store),
    getShowSideWindow: getShowSideWindow(store),
    getSideWindowVisibility: getSideWindowVisibility(store),
    setNotesPanelSort: setNotesPanelSort(store),
    setActivePalette: setActivePalette(store),
    setColorPalette: setColorPalette(store),
    setPageReplacementModalFileList: setPageReplacementModalFileList(store),
    disableTool: disableTool(store),
    enableAllElements: enableAllElements(store),
    goToFirstPage,
    goToLastPage: goToLastPage(store),
    goToNextPage: goToNextPage(store),
    goToPrevPage: goToPrevPage(store),
    isAdminUser,
    isMobileDevice,
    isReadOnly,
    openElement: openElement(store),
    rotateClockwise,
    rotateCounterClockwise,
    saveAnnotations: saveAnnotations(store),
    setAdminUser,
    setAnnotationUser,
    setCurrentPageNumber,
    setSortNotesBy: setSortNotesBy(store),
    getCustomData,
    toggleReaderMode: toggleReaderMode(store),
    enableToolDefaultStyleUpdateFromAnnotationPopup,
    disableToolDefaultStyleUpdateFromAnnotationPopup,
    addEventListener,
    removeEventListener,
    syncNamespaces,
    reloadOutline: reloadOutline(store),

    //deprecated, to be removed in 8.0
    useNativeScroll,
    showErrorMessage: showErrorMessage(store),
    toggleElement: toggleElement(store),
    setSideWindowVisibility: setSideWindowVisibility(store),
    setHighContrastMode: setHighContrastMode(store),
    getIsHighContrastMode: getIsHighContrastMode(store),

    //deprecated, to be removed in 9.0
    updateOutlines: updateOutlines(store),

    // undocumented
    loadedFromServer: false,
    serverFailed: false,
    i18n: i18next,
    showWarningMessage: showWarningMessage(store),
    getBBAnnotManager,
    selectors: getSelectors(store),
    reactElements,
    enableClearSearchOnPanelClose: enableClearSearchOnPanelClose(store),
    disableClearSearchOnPanelClose: disableClearSearchOnPanelClose(store),
    disableNativeScrolling,
    setAnnotationReadState: setAnnotationReadState(store),
    getAnnotationReadState: getAnnotationReadState(store),
    disableFadePageNavigationComponent: disableFadePageNavigationComponent(store),
    enableFadePageNavigationComponent: enableFadePageNavigationComponent(store),
    enableDesktopOnlyMode: enableDesktopOnlyMode(store),
    disableDesktopOnlyMode: disableDesktopOnlyMode(store),
    isInDesktopOnlyMode: isInDesktopOnlyMode(store),
    disablePageDeletionConfirmationModal: disablePageDeletionConfirmationModal(store),
    enablePageDeletionConfirmationModal: enablePageDeletionConfirmationModal(store),
  };

  // objForWebViewerUI.overrideSearchExecution((value, options) => {

  //   fetch('http://localhost:5600/api/search/build/f3396a7768184e9b8e2baa5ca1893e34/19/55237/logicalItemPageId/0/10', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', "Authorization": `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImxyLU93Q3RDVkstcGF0Y3RabzJ2MnciLCJ0eXAiOiJhdCtqd3QiLCJjdHkiOiJKV1QifQ.eyJuYmYiOjE2NTQ2NDUyMjEsImV4cCI6MTY1NDY0ODgyMSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDA0IiwiYXVkIjoiYnVuZGxlIiwiY2xpZW50X2lkIjoiMEZBNjI2QjQwQkNGNDE4Q0FBQzQ3MkE4MkQ1MUIzQTYiLCJzdWIiOiJlNzYwZGNjMmEyMDI0YmY4YThlOThmZWE0NzJmNzAxNSIsImF1dGhfdGltZSI6MTY1NDM5NTI1OSwiaWRwIjoibG9jYWwiLCJmaXJtSWQiOiJmMzM5NmE3NzY4MTg0ZTliOGUyYmFhNWNhMTg5M2UzNCIsInBlcm1pc3Npb25zIjoiTGVnYWxCdW5kbGUiLCJyb2xlIjpbIlN1cHBvcnREZXNrIiwiU3VwZXJBZG1pbiJdLCJzY29wZSI6WyJwZXJtaXNzaW9ucyIsInJvbGVzIiwicHJvZmlsZSIsIm9wZW5pZCIsImJ1bmRsZSJdLCJhbXIiOlsicHdkIl19.D0Um9V3bdUFLBOQL4EPXynNV75amTL6czDZR2l7ZsC8irUNTaLjIn1FpW-W0odP78snLXbinJowqzjQrzPvESsvzlOSq1_h_wEG7uEAQACD8odWfBuSZuNfspt0unf5pcDPUcE_KkvXJkpTBVS4aIBmk5irHJCUpkJ9IF2IREVuIXlgjSUle5ZI-A22y9-k7gaTE1E7Bn1U7aeEIxLwsNUsouxzoJblS03iGbzizBUN4WYqUhqF208uCV9Q1NrI7LRL_fek8lRHPkTsBOG5GKsjU2dWgU0o6p6vqqGlUggNkDWdyWtJzM3OZtsqkpevXBYrda0-jsphi3IaE-x828g` },
  //     body: JSON.stringify(value)
  //   }).then(async response => {
  //     if (response.ok) {

  //       let r = await response.json();

  //       showSearchResult(r, 0)

  //     } else {

  //     }
  //   }).catch(e => {

  //   });
  // })

  // const showSearchResult = (searchResultData, pageNum, instance) => {
  //   const finishedPages = [];

  //   let SearchMode = core.getSearchMode();
  //   let documentViewer = window.documentViewer;

  //   //this.openedFromSearch = true      
  //   let results = []

  //   documentViewer.clearSearchResults()

  //   objForWebViewerUI.closeElements(['notesPanel'])
  //   objForWebViewerUI.openElements(['searchPanel'])

  //   function doSearch(pn, word) {
  //     const mode = SearchMode.WHOLE_WORD | SearchMode.HIGHLIGHT

  //     const options = {
  //       fullSearch: true,
  //       onResult: (result) => {
  //         if (result.resultCode === 2 && !finishedPages.includes(result.pageNum)) {
  //           //documentViewer.displayAdditionalSearchResult(result)
  //           results.push(result)
  //         }
  //       },
  //       onPageEnd: arg => {
  //         if (!finishedPages.includes(pn)) {
  //           documentViewer.displayAdditionalSearchResults(results)
  //           //   documentViewer.setActiveSearchResult(results[0])
  //           finishedPages.push(pn)
  //           //   results = []
  //         }
  //         showResult()
  //       },
  //       onDocumentEnd: arg => {
  //         //if (pageNum != 0) { documentViewer.setCurrentPage(pageNum) }
  //       },
  //       startPage: pn,
  //       endPage: pn
  //     }

  //     documentViewer.textSearchInit(word, mode, options)
  //   }

  //   let textToBeHighlighted = []
  //   let reg = /<span(.*?)>(.*?)<\/span>/g

  //   let highlightCounter = 0
  //   let searchResultIndex = 0
  //   let matches = null

  //   setTimeout(() => {
  //     showResult()
  //   }, 50)

  //   function showResult() {
  //     if (searchResultData && searchResultData.BundlePageSearchResults && searchResultIndex < searchResultData.BundlePageSearchResults.length) {
  //       let searchResult = searchResultData.BundlePageSearchResults[searchResultIndex]
  //       let highlightedResults = !searchResult.HighlightedText ? searchResult.highlightedText : searchResult.HighlightedText
  //       let pageNum = !searchResult.PageNumber ? searchResult.pageNumber : searchResult.PageNumber

  //       if (highlightCounter < highlightedResults.length) {
  //         matches = matches == null ? highlightedResults[highlightCounter].matchAll(reg) : matches
  //         let word = ''
  //         try {
  //           do {
  //             word = matches.next().value[2]
  //           } while (textToBeHighlighted.includes(word.trim().toLowerCase()))

  //           textToBeHighlighted.push(word.trim().toLowerCase())
  //           doSearch(parseInt(pageNum), word)
  //         } catch (e) {
  //           highlightCounter++
  //           matches = null
  //           showResult()
  //         }
  //       } else {
  //         highlightCounter = 0
  //         matches = null
  //         ++searchResultIndex
  //         textToBeHighlighted = []
  //         showResult()
  //       }
  //     } else {
  //       //highlight finished

  //       // let rows = window.document.querySelectorAll('[data-element=searchPanel] .results [role=row]');
  //       // let prevPage = { height: 0, isFirst: false };
  //       // let needToChangeTop = false;
  //       // let changeTop = 27;
        
  //       // for (const row of rows) {
  //       //   let pageSplitter = row.querySelector('div[role=cell]')
  //       //   if (pageSplitter) {
  //       //     let firstPageHeight = parseInt(row.style.height.replace('px', ''));
  //       //     prevPage = { height: firstPageHeight, isFirst: true };
  //       //     if (needToChangeTop) {
  //       //       debugger
  //       //       let top = parseInt(row.style.top.replace('px', ''));
  //       //       row.style.top = `${(top + changeTop)}px`;
  //       //       changeTop += 27;
  //       //     }
  //       //   } else if (needToChangeTop) {
  //       //     debugger
  //       //     let top = parseInt(row.style.top.replace('px', ''));
  //       //     row.style.top = `${(top + changeTop)}px`;
  //       //   } else {
  //       //     debugger
  //       //     let pageHeight = parseInt(row.style.height.replace('px', ''));
  //       //     if (prevPage && prevPage.isFirst) {
  //       //       if (prevPage.height === pageHeight) {
  //       //         needToChangeTop = true;
  //       //         let top = parseInt(row.style.top.replace('px', ''));
  //       //         row.style.top = `${(top + changeTop)}px`;
  //       //       }
  //       //     }
  //       //   }

  //       // }
  //     }
  //   }
  // }



  window.instance = {
    // keys needed for webviewer.js
    CORE_NAMESPACE_KEY: CORE_NAMESPACE,
    UI_NAMESPACE_KEY: UI_NAMESPACE,
    [CORE_NAMESPACE]: {
      ...objForWebViewerCore,
      ...window.Core,
      documentViewer: window.documentViewer,
      annotationManager: window.documentViewer.getAnnotationManager(),
    },
    [UI_NAMESPACE]: objForWebViewerUI,

    // keep them here for backwards compatibililty. should remove them in 9.0
    ...objForWebViewerCore,
    ...objForWebViewerUI,
    docViewer: window.documentViewer,
    annotManager: window.documentViewer.getAnnotationManager(),
  };
};
