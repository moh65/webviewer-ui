
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import selectors from 'selectors';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ThumbnailSelector from './ThumbnailSelector';
import core from 'core';
import actions from 'actions';
import './BundlePageSelector.scss'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import { hexToRgba2 } from 'helpers/color';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactTooltip from 'react-tooltip';
import { element, number } from 'prop-types';



export default ({ isModalOpen }) => {
    let [
        needToLoadSections,
        sectionUrl,
        documentUrl,
        token,
        currentDocumentInfo,
        defaultTag,
        annotationLinkToEdit,
        defaultBaseUrlAddress
    ] = useSelector(state => [
        selectors.getLoadSectionsInfo(state),
        selectors.getSectionUrl(state),
        selectors.getDocumentUrl(state),
        selectors.getAuthToken(state),
        selectors.getThisDocumentInfo(state),
        selectors.getDefaultTag(state),
        selectors.getAnnotationLinkToEdit(state),
        selectors.getDefaultUrlBaseAddress(state)
    ]);
    const [t] = useTranslation();

    sectionUrl = sectionUrl ? sectionUrl : `${defaultBaseUrlAddress}/api/bundle/686/items/sections`;
    documentUrl = documentUrl ? documentUrl : `${defaultBaseUrlAddress}/api/bundle/sections/686/{sectionId}/documents/list`;
    
    currentDocumentInfo = currentDocumentInfo && currentDocumentInfo.id ? currentDocumentInfo : {
        id: 231423,
        title: 'Annette Wallis Atkins Costs Disclosure Signed'
    };

    const toolTipStyles = {
        display: 'table-cell',
        height: '60px',
        width: '80px',
        textAlign: 'center',
        background: '#f6f6f6',
        verticalAlign: 'middle',
        border: '5px solid white',
      };

    const topElement = useRef(null);
    const botElement = useRef(null);
    const documentElement = useRef(null);

    const elementHeight = 40;
    const sectionSize = 50;

    const setScrollDefaults = (json) => {
        documentScroll.sections.clear();

        for (let i = 0; i < json.length; i++) {
            const index = Math.floor(i / sectionSize);
            if (!documentScroll.sections.has(index)) {
                documentScroll.sections.set(index, []);
            }

            const section = documentScroll.sections.get(index);
            section.push(json[i]);
        }

        const sectionDocs = json.slice(0, sectionSize * 3);
        setDocs(sectionDocs);
        documentScroll.currentIndex = 0;
        setTopHeight(0);
        setBotHeight((json.length - (sectionSize * 3)) * elementHeight);
        documentElement.current.scrollTop = 0;
        documentScroll.lock = false;
    };

    const setScrollIndex = (index) => {
        documentScroll.currentIndex = index;

        if (index < 1) {
            index = 1;
        }

        let startRow = (index - 1) * sectionSize;

        let sectionDocs = [];
        if (documentScroll.sections.has(index - 1)) {
            sectionDocs = sectionDocs.concat(...documentScroll.sections.get(index - 1));
        }
        if (documentScroll.sections.has(index)) {
            sectionDocs = sectionDocs.concat(...documentScroll.sections.get(index));
        }
        
        if (documentScroll.sections.has(index + 1)) {
            sectionDocs = sectionDocs.concat(...documentScroll.sections.get(index + 1));
        }

        setDocs(sectionDocs);
        const topHeight = startRow * elementHeight;
        const botHeight = (allDocs.length - sectionDocs.length - startRow) * elementHeight;
        setTopHeight(topHeight);
        setBotHeight(botHeight);
    };
    
    const setBotHeight = (height) => {
        botElement.current.style.height = height + "px";
    };

    const setTopHeight = (height) => {
        topElement.current.style.height = height + "px";
    };

    const onDocumentScroll = (event) => {
        //documentElement.current.style.scrol
        const scrolledIndex = Math.floor(documentElement.current.scrollTop / elementHeight / sectionSize);
        if (!documentScroll.lock && documentScroll.currentIndex !== scrolledIndex) {
            documentScroll.lock = true;
            console.log('Setting scrolled index: ' + scrolledIndex)
            setScrollIndex(scrolledIndex);
            documentScroll.lock = false;
        }
    }        

    const [docs, setDocs] = useState([]);
    const [data, setData] = useState([]);
    const [documentScroll, setDocumentScroll] = useState({
        currentIndex: 0,
        lock: false,
        sections: new Map(),
    });
    const [allDocs, setAllDocs] = useState([]);
    const [isThumbnailSelectorOpen, setIsThumbnailSelectorOpen] = useState(false);
    const [loadingDocument, setLoadingDocument] = useState(false);
    const [thisDocumentInfo, setThisDocumentInfo] = useState({});
    const [selectedDocumentInfo, setSelectedDocumentInfo] = useState({});
    const dispatch = useDispatch();

    const renderSections = (jsonData) => {
        let children = [];
        if (jsonData.Children && jsonData.Children.length > 0) {
            children = jsonData.Children.map(m => renderSections(m));
        }
        return { text:  jsonData.DocumentNumber + jsonData.Name, id: jsonData.SectionId, children: children }
    }

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

    const getDocumentItem = (data) => {  
        switch (data?.fileExtension) {
            case 'docx':
            case 'doc':
            return 'file-word'
            case 'pdf':
            return 'file-pdf' 
            case 'xls':
            case 'xlsx':
            return 'file-excel' 
            case 'ppt':
            case 'pptx':
            return 'file-powerpoint'
            case 'csv':
            return 'file-csv'
            case 'msg':
            case 'eml':
            return 'envelope'
            case 'png':
            case 'jpg':
            case 'bmp':
            return 'image'
            case 'zip':
            case 'rar':
            return 'archive'
            default:
            return 'file-alt'
        }
    }

    useEffect(() => {
        //get this document info
        if (isModalOpen) {
            setThisDocumentInfo(currentDocumentInfo);
            setSelectedDocumentInfo(currentDocumentInfo);
            setIsThumbnailSelectorOpen(true);
        }
        else {
            setIsThumbnailSelectorOpen(false);
        }
    }, [isModalOpen])

    useEffect(() => {
        if (!needToLoadSections) {
            setData([]);
            return;
        }

        fetch(sectionUrl, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        }).then(res => res.json())
            .then(json => {
                let sectionData = json.map(j => {
                    if (j.ItemType === 'Section') {
                        return renderSections(j)
                    }

                }
                )

                sectionData = sectionData.filter(f => f)
                setData(sectionData);
            });
    }, [needToLoadSections]);

    const renderTree = (nodes) => {
        return (

            <TreeItem key={nodes.id} nodeId={nodes.id.toString()} label={nodes.text}>
                {Array.isArray(nodes.children)
                    ? nodes.children.map((node) => renderTree(node))
                    : null}
            </TreeItem>
        );
    }

    const renderTree1 = (nodes) => {
        return (
            nodes && (
            <TreeItem key={nodes.id} nodeId={nodes.id.toString()} label={
                <div className='float-child-document-tree-item'>
                    <div className='float-child-document-tree-icon'><FontAwesomeIcon icon={getDocumentItem(nodes)} /></div>
                    <div className='float-child-document-tree-label' 
                        data-for={nodes.id.toString()}
                        data-tip={nodes.documentNumber + ' ' + nodes.text}
                        data-iscapture="true"     
                    >
                        <div className='float-child-document-tree-label-name'>
                            {nodes.documentNumber + ' ' + nodes.text}
                        </div> 
                        <ReactTooltip
                            id={nodes.id.toString()}
                            type="light"
                            effect="solid"
                            border={true}
                            borderColor="black"
                            multiline={false}
                        />         
                        <div className='float-child-document-tree-label-page'>{ ' - ' + nodes.pageCount + ' page' + (nodes.pageCount !== 1 ? 's' : '')}</div>
                    </div> 
                </div>
                                    
            }>
            {
                Array.isArray(nodes.children)
                    ? nodes.children.map((node) => renderTree1(node))
                    : null
            }
            </TreeItem>
            )
        );
    }

    const onSelectThumbnailHandler = (img) => {
        setIsThumbnailSelectorOpen(false);
        let pageNumber = img.num;
        if (thisDocumentInfo.id === selectedDocumentInfo.id) {
            //same document page link creation (use the current method in PDFTron)
            addPageLink(null, pageNumber);
            dispatch(actions.closeElement('linkModal'));
        } else {
            //created page link to other document

            addPageLink(selectedDocumentInfo, pageNumber);
            dispatch(actions.closeElement('linkModal'));
        }
    }
    const createHighlightAnnot = async (linkAnnotArray, quads, text, action) => {
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
        highlight.setContents(text);
        highlight.setCustomData('trn-annot-preview', text);

        linkAnnotArray.forEach((link, index) => {
            link.addAction('U', action);
            index === 0 ? core.addAnnotations([link, highlight]) : core.addAnnotations([link]);
        });
        annotManager.groupAnnotations(highlight, linkAnnotArray);

        //customization
        if (action.dest) {
            highlight.setCustomData('custom-link', `page-${action.dest.page}`);
            highlight.setCustomData('custom-link-type', 'page');
        } else if (action.uri) {
            if (action.uri.includes('bundle_custom')) {
                highlight.setCustomData('custom-link', `doc: ${action.doc_title} p-(${action.doc_page})`)
                highlight.setCustomData('custom-link', 'page');
            } else {
                //error it should not come here
            }
        }
        //customization

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

        if (quads) {
            let selectedText = core.getSelectedText();
            if (!selectedText || selectedText === '')
                selectedText = selectedAnnotations[0].Wba;

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
                if (annotationLinkToEdit && annotationLinkToEdit.annotation) {
                    let highlightAnnot = core.getAnnotationManager().getAnnotationById(annotationLinkToEdit.annotation.InReplyTo);
                    core.deleteAnnotations([annotationLinkToEdit.annotation, highlightAnnot])
                }
                createHighlightAnnot(
                    currPageLinks,
                    quads[currPageNumber],
                    selectedText,
                    action
                );
                linksResults.push(...currPageLinks);
            }
        }

        // if (selectedAnnotations) {
        //     selectedAnnotations.forEach(annot => {
        //         const annotManager = core.getAnnotationManager();
        //         const groupedAnnots = annotManager.getGroupAnnotations(annot);

        //         // ungroup and delete any previously created links
        //         if (groupedAnnots.length > 1) {
        //             const linksToDelete = groupedAnnots.filter(annot => annot instanceof Annotations.Link);
        //             if (linksToDelete.length > 0) {
        //                 annotManager.ungroupAnnotations(groupedAnnots);
        //                 core.deleteAnnotations(linksToDelete);
        //             }
        //         }

        //         const link = newLink(annot.X, annot.Y, annot.Width, annot.Height);
        //         link.addAction('U', action);
        //         core.addAnnotations([link]);
        //         linksResults.push(link);
        //         annotManager.groupAnnotations(annot, [link]);
        //     });
        // }

        return linksResults;
    };

    const addPageLink = (bundleDoc, pageNum) => {


        const Dest = window.Actions.GoTo.Dest;

        const options = { dest: new Dest({ page: pageNum }) };
        const action = new window.Actions.GoTo(options);

        let links = null;

        if (bundleDoc) {
            const otherDocumentAction = new window.Actions.URI({ uri: `bundle_custom_${bundleDoc.id}_${pageNum}` });
            otherDocumentAction.doc_page = pageNum;
            otherDocumentAction.doc_title = bundleDoc.title;
            links = createLink(otherDocumentAction);
        } else {
            links = createLink(action);
        }


        let pageNumbersToDraw = links.map(link => link.PageNumber);
        pageNumbersToDraw = [...new Set(pageNumbersToDraw)];
        pageNumbersToDraw.forEach(pageNumberToDraw => {
            core.drawAnnotations(pageNumberToDraw, null, true);
        });


    };

    const findNodeInDocs = (nodes, id) => {
        let foundDoc;
        for (const doc of nodes) {
            if (doc.id.toString() === id) {
                return doc;
            }
            if (doc.children && doc.children.length > 0) {
                foundDoc = findNodeInDocs(doc.children, id);
                if (foundDoc != undefined) {
                    return foundDoc;
                }
            }
        }
        return foundDoc;
    }

    const changeDocument = (isOpen) => {
        if (!isOpen) {

            setDocs([]);
            setIsThumbnailSelectorOpen(false);
        }
    }

    return (
        <div className={'container container-page'} onMouseDown={e => e.stopPropagation()}>
        <div className="bundle-header">
            <h5 className="modal-title">{isThumbnailSelectorOpen ? 'Link to page' : 'Change Document'}</h5>
            <button type="button" aria-label="Close" className="close" onClick={closeModal}>×</button>
        </div>
        <div className="link-modal">
          <div className="swipe-indicator" />    
        <div className='page-table'>
            <div>
                {
                    isThumbnailSelectorOpen &&
                    <ThumbnailSelector logicalItemInfo={selectedDocumentInfo} setIsOpen={changeDocument} isOpen={isThumbnailSelectorOpen} onSelectThumbnail={onSelectThumbnailHandler} />
                }
                {
                    !isThumbnailSelectorOpen && (
                    <div>
                        <div className="float-container">
                            <div className="float-container-row">
                                <div className="float-child-section">
                                    <h5>Sections</h5>
                                    <div className="float-child-section-tree">
                                    <TreeView
                                        aria-label="rich object"
                                        sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                                        defaultCollapseIcon={<ExpandLessIcon />}
                                        defaultExpandIcon={<ExpandMoreIcon />}                                    
                                        onNodeSelect={(e, n) => {
                                            setLoadingDocument(true)
                                            fetch(documentUrl.replace('{sectionId}', n), {
                                                method: "GET",
                                                headers: { "Authorization": `Bearer ${token}` }
                                            }).then(res => res.json())
                                                .then(json => {
                                                    setAllDocs(json);
                                                    setScrollDefaults(json);
                                                    //setTopHeight("'0px';");
                                                    //setBotHeight("'" + ((json.length - 100) * 40) + "px';");
                                                    setLoadingDocument(false)
                                                });
                                        }}
                                    >
                                        {data.map(m => renderTree(m))}
                                    </TreeView>
                                    </div>
                                </div>
                                <div className="float-child-document">
                                    <h5>Documents</h5>
                                    <div className="float-child-document-tree" onScroll={onDocumentScroll} ref={documentElement}>
                                        <div ref={topElement}></div>   
                                        {
                                            loadingDocument && <div style={{ height: '100%' }}><Loading /></div>
                                        }
                              
                                        <TreeView
                                            style={{ width: 'auto', height: 'auto', display:  loadingDocument ? 'hidden' :'block' }}
                                            aria-label="rich object 2"
                                            sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                                            defaultCollapseIcon={<ExpandLessIcon />}
                                            defaultExpandIcon={<ExpandMoreIcon />}
                                            onNodeSelect={(e, n) => {

                                                let selectedDoc = findNodeInDocs(docs, n);
                                                // if (selectedDoc.children && selectedDoc.children.length > 0) {
                                                //     return;
                                                // }

                                                setSelectedDocumentInfo({ id: n, title: selectedDoc.text, documentNumber: selectedDoc.documentNumber, type: selectedDoc.documentType })

                                            }}
                                        >
                                            {docs.map( m => renderTree1(m))}
                                        </TreeView>   
                                        <div ref={botElement}></div>   
                                    </div> 
                                </div>
                            </div>
                        </div>

                        <div className="footer">
                                <span class="button-action">
                                    <Button 
                                        class="btn4-secondary" 
                                        onClick={() => { dispatch(actions.closeElement('linkModal')); }}
                                        startIcon={<FontAwesomeIcon icon="ban" />}>
                                        {t('action.cancel')}
                                    </Button>
                                </span>
                                <span class="button-action">
                                    <Button 
                                        class="btn4-primary"
                                        onClick={() => { setIsThumbnailSelectorOpen(true); }} 
                                        startIcon={<FontAwesomeIcon icon="check" />}>
                                        Select Document
                                    </Button>
                                </span>

                            </div>
                    </div>)
                }


            </div>
        
        </div>
        </div>
    </div>
    );
}