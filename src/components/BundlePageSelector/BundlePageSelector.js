
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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import { hexToRgba2 } from 'helpers/color';



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

    sectionUrl = sectionUrl ? sectionUrl : `${defaultBaseUrlAddress}/api/bundle/664/items/sections`;
    documentUrl = documentUrl ? documentUrl : `${defaultBaseUrlAddress}/api/bundle/sections/664/{sectionId}/documents/list`;
    
    currentDocumentInfo = currentDocumentInfo && currentDocumentInfo.id ? currentDocumentInfo : {
        id: 231423,
        title: 'Annette Wallis Atkins Costs Disclosure Signed'
    };

    const [data, setData] = useState([]);
    const [docs, setDocs] = useState([]);

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
        return { text: jsonData.Name, id: jsonData.SectionId, children: children }
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
                    if (j.ItemType === 'Section')
                        return renderSections(j)
                }
                )

                sectionData = sectionData.filter(f => f)

                setData(sectionData);
            });
    }, [needToLoadSections]);

    const renderTree = (nodes) => {
        return (

            <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.text}>
                {Array.isArray(nodes.children)
                    ? nodes.children.map((node) => renderTree(node))
                    : null}
            </TreeItem>
        );
    }

    const renderTree1 = (nodes) => {
        return (

            <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.text}>
                {Array.isArray(nodes.children)
                    ? nodes.children.map((node) => renderTree(node))
                    : null}
            </TreeItem>
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
            if (doc.id === id) {
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
        <div>
            {
                isThumbnailSelectorOpen &&
                <ThumbnailSelector logicalItemInfo={selectedDocumentInfo} setIsOpen={changeDocument} isOpen={isThumbnailSelectorOpen} onSelectThumbnail={onSelectThumbnailHandler} />
            }
            {
                !isThumbnailSelectorOpen &&
                <div class="float-container">
                    <div>
                        <div class="float-child-section">
                            <h2>Sections</h2>
                            <TreeView
                                aria-label="rich object"
                                sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                                defaultCollapseIcon={<ExpandMoreIcon />}
                                defaultExpandIcon={<ChevronRightIcon />}
                                onNodeSelect={(e, n) => {
                                    setLoadingDocument(true)
                                    fetch(documentUrl.replace('{sectionId}', n), {
                                        method: "GET",
                                        headers: { "Authorization": `Bearer ${token}` }
                                    }).then(res => res.json())
                                        .then(json => {

                                            setDocs(json)
                                            setLoadingDocument(false)
                                        });
                                }}
                            >
                                {data.map(m => renderTree(m))}
                            </TreeView>
                        </div>
                        <div class="float-child-document">
                            <h2>Documents</h2>
                            {
                                loadingDocument && <div style={{ height: '100%' }}><Loading /></div>
                            }
                            {
                                !loadingDocument &&
                                <TreeView
                                    style={{ width: '300px', height: '350px', display: 'block' }}
                                    aria-label="rich object 2"
                                    sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                                    defaultCollapseIcon={<ExpandMoreIcon />}
                                    defaultExpandIcon={<ChevronRightIcon />}
                                    onNodeSelect={(e, n) => {

                                        let selectedDoc = findNodeInDocs(docs, n);
                                        // if (selectedDoc.children && selectedDoc.children.length > 0) {
                                        //     return;
                                        // }

                                        setSelectedDocumentInfo({ id: n, title: selectedDoc.text })

                                    }}
                                >
                                    {docs.map(m => renderTree1(m))}
                                </TreeView>
                            }
                        </div>
                    </div>
                    <div class="button-container">
                        <span class="button-action">
                            <Button
                                dataElement="linkSubmitButton"
                                label={t('action.cancel')}
                                onClick={() => { dispatch(actions.closeElement('linkModal')); }}
                            />
                        </span>
                        <span class="button-action">
                            <Button
                                dataElement="linkSubmitButton"
                                label={t('action.showPages')}
                                onClick={() => { setIsThumbnailSelectorOpen(true); }}
                            />
                        </span>

                    </div>
                </div>
            }


        </div>
    );
}