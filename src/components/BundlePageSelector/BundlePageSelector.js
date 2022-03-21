
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
import Loading from './loading';



export default ({ isModalOpen }) => {
    let [
        needToLoadSections,
        sectionUrl,
        documentUrl,
        token,
        currentDocumentInfo
    ] = useSelector(state => [
        selectors.getLoadSectionsInfo(state),
        selectors.getSectionUrl(state),
        selectors.getDocumentUrl(state),
        selectors.getAuthToken(state),
        selectors.getThisDocumentInfo(state)
    ]);
    const [t] = useTranslation();

    if (currentDocumentInfo)
        console.log('currentDocumentInfo = ' + currentDocumentInfo.id + ' ' + currentDocumentInfo.title)
    sectionUrl = sectionUrl ? sectionUrl : 'http://localhost:5600/api/bundle/632/items/sections';
    documentUrl = documentUrl ? documentUrl : 'http://localhost:5600/api/bundle/sections/ca7fead101d8449798980b144be511e2/632/{sectionId}/documents/list';
    token = token ? token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImxyLU93Q3RDVkstcGF0Y3RabzJ2MnciLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2NDc4MzM1OTIsImV4cCI6MTY0NzgzNzE5MiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDA0IiwiYXVkIjoiYnVuZGxlIiwiY2xpZW50X2lkIjoiMEZBNjI2QjQwQkNGNDE4Q0FBQzQ3MkE4MkQ1MUIzQTYiLCJzdWIiOiIyNGRiOTMyZGU4MWM0Y2Q3YTU2MzY0YzRiZDZkYTAwNyIsImF1dGhfdGltZSI6MTY0NTU2NjQyMCwiaWRwIjoibG9jYWwiLCJmaXJtSWQiOiJjYTdmZWFkMTAxZDg0NDk3OTg5ODBiMTQ0YmU1MTFlMiIsInBlcm1pc3Npb25zIjoiTGVnYWxCdW5kbGUiLCJyb2xlIjpbIlN1cHBvcnREZXNrIiwiVXNlciIsIlN1cGVyQWRtaW4iXSwic2NvcGUiOlsicGVybWlzc2lvbnMiLCJyb2xlcyIsInByb2ZpbGUiLCJvcGVuaWQiLCJidW5kbGUiXSwiYW1yIjpbInB3ZCJdfQ.u1Izx-WUUErr7hoTg9uD4oR0sG1sMzhotcEIqky4fUtHmUgnFsl6pPF2V3KYecQeEdW1BbD-6MMXv27LbTyoXf46ThXVhdyooieQhpwhSQ08UodvlTg4PoAs5re1H3MG8P_T6OPOmmZ7AfgoQJxCtNLNQe459R8pgkCFr0hiXNJ0xT980UjuCtstAYNlxwRPjRHTuWq8bXocV_fWmMufxZkJ1q5XoBPT956n6f_PeMHZ31uao5RNcOi7aOXEqBlr0Rclt3DyXtkYKq6WzqTp5n3_7KoGJsFrc8EcxdjNotA41sFyVvGHB0f-j-VQQ9EpwXspByn5FkCPmzOZjEaYpQ';
    currentDocumentInfo = currentDocumentInfo && currentDocumentInfo.id ? currentDocumentInfo : {
        id: 210802,
        title: 'Annette Wallis Atkins Costs Disclosure Signed'
    };

    const [data, setData] = useState([]);
    const [docs, setDocs] = useState([]);

    const [deselectAll, setDeselectAll] = useState([]);
    const [isThumbnailSelectorOpen, setIsThumbnailSelectorOpen] = useState(false);
    const [loadingDocument, setLoadingDocument] = useState(false);
    const [thisDocumentInfo, setThisDocumentInfo] = useState({});
    const [selectedDocumentInfo, setSelectedDocumentInfo] = useState({});
    const dispatch = useDispatch();
    const ref = React.createRef();

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
            addPageLink(selectedDocumentInfo.id, pageNumber);
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
        highlight.StrokeColor = new Annotations.Color(0, 0, 0, 0);
        highlight.Opacity = 0;
        highlight.Quads = quads;
        highlight.Author = core.getCurrentUser();
        highlight.setContents(text);

        linkAnnotArray.forEach((link, index) => {
            link.addAction('U', action);
            index === 0 ? core.addAnnotations([link, highlight]) : core.addAnnotations([link]);
        });
        annotManager.groupAnnotations(highlight, linkAnnotArray);
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

        const quads = core.getSelectedTextQuads();
        const selectedAnnotations = core.getSelectedAnnotations();

        if (quads) {
            const selectedText = core.getSelectedText();
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
                createHighlightAnnot(
                    currPageLinks,
                    quads[currPageNumber],
                    selectedText,
                    action
                );
                linksResults.push(...currPageLinks);
            }
        }

        if (selectedAnnotations) {
            selectedAnnotations.forEach(annot => {
                const annotManager = core.getAnnotationManager();
                const groupedAnnots = annotManager.getGroupAnnotations(annot);

                // ungroup and delete any previously created links
                if (groupedAnnots.length > 1) {
                    const linksToDelete = groupedAnnots.filter(annot => annot instanceof Annotations.Link);
                    if (linksToDelete.length > 0) {
                        annotManager.ungroupAnnotations(groupedAnnots);
                        core.deleteAnnotations(linksToDelete);
                    }
                }

                const link = newLink(annot.X, annot.Y, annot.Width, annot.Height);
                link.addAction('U', action);
                core.addAnnotations([link]);
                linksResults.push(link);
                annotManager.groupAnnotations(annot, [link]);
            });
        }

        return linksResults;
    };

    const addPageLink = (docId, pageNum) => {


        const Dest = window.Actions.GoTo.Dest;

        const options = { dest: new Dest({ page: pageNum }) };
        const action = new window.Actions.GoTo(options);

        const links = createLink(action);

        console.log('add page link to page number ' + pageNum)
        if (docId) {
            const otherDocumentAction = new window.Actions.URI({ uri: `bundle_custom_${docId}_${pageNum}` });
            const links = createLink(otherDocumentAction);
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
            debugger
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
                                            debugger
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
                                        setSelectedDocumentInfo({ id: n })

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