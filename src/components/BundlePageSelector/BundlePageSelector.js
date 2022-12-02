
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
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import { hexToRgba2 } from 'helpers/color';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactTooltip from 'react-tooltip';
import { element, number } from 'prop-types';
import Split from 'react-split'
import IconButton from '@mui/material/IconButton';


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

    sectionUrl = sectionUrl ? sectionUrl : `${defaultBaseUrlAddress}/api/bundle/4/items/sections`;
    documentUrl = documentUrl ? documentUrl : `${defaultBaseUrlAddress}/api/bundle/sections/4/{sectionId}/documents/list`;
    
    currentDocumentInfo = currentDocumentInfo && currentDocumentInfo.id ? currentDocumentInfo : {
        id: 4043,
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

    const elementHeight = 49.4;
    const sectionSize = 10;

    const setScrollDefaults = (json) => {
        documentScroll.sectionMap.clear();
        
        SetSectionMap(json);

        documentScroll.expanded = 0;
        documentScroll.expandedList = [];
        setExpanded([]);
        documentScroll.json = json;
        let maxIndex = 0;

        const sectionDocs = json.slice(0, sectionSize * 3);
        setDocs(sectionDocs);
        documentScroll.currentIndex = 0;
        documentScroll.maxIndex = maxIndex;

        setTopHeight("0px"); 

        documentElement.current.scrollTop = 0;
        let containerHeight = json.length * elementHeight;
        
        if (containerHeight < 0 ) {
            setBotHeight("100%");
        } else {
            setBotHeight(containerHeight + "px");
        }

        documentScroll.lock = false;
    };
    

    
    const SetSectionMap = (json) => {   
        documentScroll.sections.clear();
        documentScroll.sectionGroupChildOffset.clear();
        documentScroll.sectionGroupChildOffsetCollasped.clear();
        documentScroll.sectionGroupChildOffsetExpanded.clear();
        
        let group = 1;
        let count = 1;
        let row = 1;
        
        let childOffset = 0

        if (!json.length) {
            return;
        }


        for (let i = 0; i < json.length; i++) {
            const item = json[i];

            item['row'] = row++;
            item['count'] = count++;
            item['group'] = group;
        
            if (!documentScroll.sections.has(group)) {
                documentScroll.sections.set(group, [])
            }
        
            const sectionGroup = documentScroll.sections.get(group) || []
            sectionGroup.push(item);
      
            const descendants = SetSectionMapRecursive(item);
            item['descendants'] = descendants;
            item['expanded'] = 0;
            documentScroll.sectionMap.set(item.id.toString(), item) 

            childOffset += item.descendants;
            documentScroll.sectionGroupChildOffset.set(group, row - 1);
            documentScroll.sectionGroupChildOffsetCollasped.set(group, row - 1);
            documentScroll.sectionGroupChildOffsetExpanded.set(group, childOffset);
        
            if ((count - 1) % sectionSize === 0) {
                row = 1;
                group++;
                childOffset = 0;
            }
        }

        const expandable = [];
        let keys = [...documentScroll.sectionMap.keys()]

        for (let key of keys) {
            const item = documentScroll.sectionMap.get(key);

            if (item.children && item.children.length > 0) {
                expandable.push(item.id.toString());
            }
        }

        setExpandableNodes(expandable);
    }

    const SetSectionMapRecursive = (item) => {      
        item['expanded'] = 0;  
        documentScroll.sectionMap.set(item.id.toString(), item)
        if (item.children && item.children.length > 0) {
            let descendants = 0;
            for (let i = 0; i < item.children.length; i++) {
                const child = item.children[i];
            
                child['group'] = item.group;
                child['parentBundleItem'] = item;
            
                descendants += SetSectionMapRecursive(child);
            }
            item['descendants'] = descendants + 1;
        
            return descendants + 1;
        }
        
        item['descendants'] = 1;
        
        return 1;
    }

    const setScrollIndex = (index) => {
        documentScroll.currentIndex = index;
        let addedsec = [];
        let min = index;
        let sectionDocs = [];

        if (documentScroll.sections.has(index - 1)) {
            sectionDocs = sectionDocs.concat(documentScroll.sections.get(index - 1));
            min = index - 1;
            addedsec.push(index - 1);
        }

        if (documentScroll.sections.has(index)) {
            sectionDocs = sectionDocs.concat(documentScroll.sections.get(index));
            addedsec.push(index);
        }
        
        if (documentScroll.sections.has(index + 1)) {
            sectionDocs = sectionDocs.concat(documentScroll.sections.get(index + 1));
            addedsec.push(index + 1);
        }

        setDocs(sectionDocs);
    };

    const collaspeFolder = (event, nodeIds) => {
        setExpandedFolder(nodeIds);
    }

    const collaspe = (event, nodeIds) => {
        setExpanded(nodeIds)

       let difference = documentScroll.expandedList
                 .filter(x => !nodeIds.includes(x))
                 .concat(nodeIds.filter(x => !documentScroll.expandedList.includes(x)));
        documentScroll.expandedList = nodeIds;

        const item = documentScroll.sectionMap.get(difference[0]);
        const element = document.getElementById(item.id);
        const isExpanded = nodeIds.includes(item.id.toString()); 
        let currentOffset = documentScroll.sectionGroupChildOffset.get(item.group);
        
        if (isExpanded) {
            if (item.expanded == 0) {
                item.expanded = item.children.length
            }

            documentScroll.expanded += item.expanded;
            currentOffset += item.expanded;
        } else {
            const collapsed = element.querySelectorAll(".MuiTreeItem-root");
            item.expanded = collapsed.length;
            documentScroll.expanded -= item.expanded;
            currentOffset -= item.expanded;
        }

        documentScroll.sectionGroupChildOffset.set(item.group, currentOffset);

        let containerHeight = (documentScroll.json.length + documentScroll.expanded) * elementHeight;
        
        if (containerHeight < 0 ) {
            setBotHeight("100%");
        } else {
            setBotHeight(containerHeight + "px");
        }
    }

    const expandAllDocument = () => {
        setExpanded(expandableNodes);
        
        documentScroll.expanded = documentScroll.sectionMap.size - documentScroll.json.length;
        documentScroll.expandedList = [];
        documentScroll.sectionGroupChildOffset = new Map(documentScroll.sectionGroupChildOffsetExpanded);

        let containerHeight = (documentScroll.sectionMap.size) * elementHeight;

        if (containerHeight < 0 ) {
            setBotHeight("100%");
        } else {
            setBotHeight(containerHeight + "px");
        }
    };

    const collaspeAllDocument = () => {
        setExpanded([])
        documentScroll.expanded = 0;
        documentScroll.expandedList = [];
        documentScroll.sectionGroupChildOffset = new Map(documentScroll.sectionGroupChildOffsetCollasped);

        let containerHeight = (documentScroll.json.length) * elementHeight;

        if (containerHeight < 0 ) {
            setBotHeight("100%");
        } else {
            setBotHeight(containerHeight + "px");
        }
    };

    const expandAllFolder = () => {
        setExpandedFolder(expandableFolders);
    };

    const collaspeAllFolder = () => {
        setExpandedFolder([]);

        //Reset all sections back to normal.
    };

    const setTopHeight = (height) => {
        topElement.current.style.top = height; 
    };

    const setBotHeight = (height) => {
        botElement.current.style.height = height; 
    };

    const onDocumentScroll = (event) => {
        if (documentScroll.lock) {
            return;
        }
            
        documentScroll.lock = true;
        const scrollPosition = documentElement.current.scrollTop + documentElement.current.clientHeight

        let currentScrollGroupLocation = 1
        let scrollGroupLocationCount = 0
        let prevScrollGroupLocationCount = 0
        let prevPrevScrollGroupLocationCount = 0
        let keys = [...documentScroll.sectionGroupChildOffset.keys()]

        for (let key of keys) {
            prevPrevScrollGroupLocationCount = prevScrollGroupLocationCount;
            prevScrollGroupLocationCount = scrollGroupLocationCount;
            scrollGroupLocationCount += documentScroll.sectionGroupChildOffset.get(key);
            currentScrollGroupLocation = key;

            if (scrollGroupLocationCount && ((scrollGroupLocationCount) * elementHeight) > scrollPosition) {
                break;
            }
        }

        if (currentScrollGroupLocation === null || documentScroll.currentIndex === currentScrollGroupLocation) {
            documentScroll.lock = false;
            return;
        }

        console.log('Updating to section:' + currentScrollGroupLocation + '; from:' + documentScroll.currentIndex + '; scrollPosition:' + scrollPosition);
        documentScroll.currentIndex = currentScrollGroupLocation;

        setScrollIndex(documentScroll.currentIndex);

        let firstSection = documentScroll.currentIndex >= documentScroll.maxIndex ? prevPrevScrollGroupLocationCount : prevPrevScrollGroupLocationCount;
        const topHeight = Math.floor((firstSection == null ? 0 : firstSection) * elementHeight) + 'px'

        setTopHeight(topHeight);
        
        documentScroll.lock = false;
    }        

    const [docs, setDocs] = useState([]);
    const [data, setData] = useState([]);
    const [expandableFolders, setExpandablefolders] = useState([]);
    const [expandableNodes, setExpandableNodes] = useState([]);
    const [documentScroll, setDocumentScroll] = useState({
        currentIndex: 0,
        lock: false,
        maxIndex: 0,
        sections: new Map(),
        sectionGroupChildOffset: new Map(),
        sectionGroupChildOffsetCollasped: new Map(),
        sectionGroupChildOffsetExpanded: new Map(),
        sectionMap: new Map(),
        expanded: 0,
        expandedList: [],
        json: [],
    });
    const [allDocs, setAllDocs] = useState([]);
    const [isThumbnailSelectorOpen, setIsThumbnailSelectorOpen] = useState(false);
    const [loadingDocument, setLoadingDocument] = useState(false);
    const [thisDocumentInfo, setThisDocumentInfo] = useState({});
    const [selectedDocumentInfo, setSelectedDocumentInfo] = useState({});
    const [expanded, setExpanded] = useState([]);
    const [expandedFolder, setExpandedFolder] = useState([]);
    const dispatch = useDispatch();

    const renderSections = (jsonData) => {
        let children = [];
        if (jsonData.Children && jsonData.Children.length > 0) {
            children = jsonData.Children.filter(i => i.ItemType === 'Section').map(m => renderSections(m));
        }
        return { text:  jsonData.DocumentNumber + jsonData.Name, id: jsonData.SectionId, children: children }
    }

    const closeModal = () => {
        //customization
          dispatch(actions.closeElement('linkModal'));
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
                GetSectionInfo(sectionData);
                setData(sectionData);
            });
    }, [needToLoadSections]);

    const GetSectionInfo = (sectionData) => {  
        const expandableFoldersIds = [];

        for (let i = 0; i < sectionData.length; i++) {
            const child = sectionData[i];
            if (child.children && child.children.length > 0) {
                expandableFoldersIds.push(child.id.toString());
                GetSectionInfoRecursive(child, expandableFoldersIds);
            }
        }

        setExpandablefolders(expandableFoldersIds);
    }
    
    const GetSectionInfoRecursive = (item, expandableFoldersIds) => {
        for (let i = 0; i < item.children.length; i++) {
            const child = item.children[i];

            if (child.children && child.children.length > 0) {
                expandableFoldersIds.push(child.id.toString());
                GetSectionInfoRecursive(child, expandableFoldersIds);
            }
        }
    }

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
            <TreeItem id={nodes.id} key={nodes.id} nodeId={nodes.id?.toString()} label={
                <div className='float-child-document-tree-item'>
                    <div className='float-child-document-tree-icon'><FontAwesomeIcon icon={getDocumentItem(nodes)} /></div>
                    <div className='float-child-document-tree-label' 
                        data-for={nodes.id?.toString()}
                        data-tip={nodes.documentNumber + ' ' + nodes.text}
                        data-iscapture="true"     
                    >
                        <div className='float-child-document-tree-label-name'>
                            <b>{nodes.documentNumber}</b>{' ' + nodes.text}
                        </div> 
                        <ReactTooltip
                            id={nodes.id?.toString()}
                            type="light"
                            effect="solid"
                            border={true}
                            borderColor="black"
                            multiline={false}
                        />
                    </div> 
                </div>    
                }
                disabled={(nodes.documentType === 5 ||nodes.documentType === 6 || nodes.documentType === 7)}
            >
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
        //highlight.setContents(text);
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
                highlight.setCustomData('custom-link-type', 'page');
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
        <div className={isThumbnailSelectorOpen ? 'bundle-thumbnail-header' : 'bundle-change-header'}>
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
                                <Split className="split">
                                    <div className="float-child-section">
                                        <div className="float-child-header">
                                            <div className="float-child-header-row">
                                                <h5>Sections</h5>           
                                                <div>
                                                    <IconButton onClick={expandAllFolder}>
                                                        <KeyboardDoubleArrowDownIcon />
                                                    </IconButton>
                                                    <IconButton onClick={collaspeAllFolder}>
                                                        <KeyboardDoubleArrowUpIcon />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="float-child-section-tree">
                                            <TreeView
                                                aria-label="rich object"
                                                expanded={expandedFolder}
                                                sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                                                defaultCollapseIcon={<ExpandLessIcon />}
                                                defaultExpandIcon={<ExpandMoreIcon />}  
                                                onNodeToggle={collaspeFolder}                   
                                                onNodeSelect={(e, n) => {
                                                    setDocs([]);
                                                    setBotHeight('50%')
                                                    setLoadingDocument(true);
                                                    fetch(documentUrl.replace('{sectionId}', n), {
                                                        method: "GET",
                                                        headers: { "Authorization": `Bearer ${token}` }
                                                    }).then(res => res.json())
                                                        .then(json => {
                                                            setAllDocs(json);
                                                            setScrollDefaults(json);
                                                            documentElement.current.scrollTop = 0;
                                                            setLoadingDocument(false)
                                                        });
                                                }}
                                            >
                                                {data.map(m => renderTree(m))}
                                            </TreeView>
                                        </div>
                                    </div>
                                    <div className="float-child-document">                                    
                                        <div className="float-child-header">
                                            <div className="float-child-header-row">
                                                <h5>Documents</h5>           
                                                <div>
                                                    <IconButton onClick={expandAllDocument}>
                                                        <KeyboardDoubleArrowDownIcon />
                                                    </IconButton>
                                                    <IconButton onClick={collaspeAllDocument}>
                                                        <KeyboardDoubleArrowUpIcon />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="float-child-document-tree" onScroll={onDocumentScroll} ref={documentElement}>
                                            <div className="float-child-document-tree-container" ref={botElement}>
                                            {
                                                loadingDocument && <div style={{ height: '100%' }}><Loading /></div>
                                            }
                                                <TreeView
                                                    ref={topElement}
                                                    expanded={expanded}
                                                    style={{ width: '100%', height: 'auto', display:  loadingDocument ? 'hidden' :'block' }}
                                                    aria-label="rich object 2"
                                                    sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                                                    defaultCollapseIcon={<ExpandLessIcon />}
                                                    defaultExpandIcon={<ExpandMoreIcon />}
                                                    onNodeToggle={collaspe}
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
                                            </div> 
                                        </div> 
                                    </div>
                                </Split>
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