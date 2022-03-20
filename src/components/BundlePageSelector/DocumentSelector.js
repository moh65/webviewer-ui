
// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import selectors from 'selectors';
// import TreeView from '@mui/lab/TreeView';
// import TreeItem from '@mui/lab/TreeItem';

// export default ({docs}) => {

//     const ref = React.createRef();

//     const renderSections = (jsonData) => {
//         let children = [];
//         if (jsonData.Children && jsonData.Children.length > 0) {
//             children = jsonData.Children.map(m => renderSections(m));
//         }
//         return { text: jsonData.Name, id: jsonData.SectionId, children: children }
//     }

//     useEffect(() => {
//         if (!needToLoadSections) {
//             setData([]);
//             return;
//         }

//         fetch(sectionUrl, {
//             method: "GET",
//             headers: { "Authorization": `Bearer ${token}` }
//         }).then(res => res.json())
//             .then(json => {

//                 let sectionData = json.map(j =>
//                     renderSections(j)
//                 )
//                 setData(sectionData);
//             });
//     }, [needToLoadSections]);

//     const onSelectSectionHandler = (item) => {
//         ref.current.api.loadData(item)
//     }


//     const renderTree = (nodes) => {
//         return (

//             <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.text}>
//                 {Array.isArray(nodes.children)
//                     ? nodes.children.map((node) => renderTree(node))
//                     : null}
//             </TreeItem>
//         );
//     }

//     return (
//         <TreeView
//             aria-label="rich object"
//             sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
//         >
//             {data.map(m => renderTree(m))}
//         </TreeView>
//     );
// }