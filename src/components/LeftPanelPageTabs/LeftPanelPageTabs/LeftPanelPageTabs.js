import React from 'react';

import LeftPanelPageTabsMore from '../LeftPanelPageTabsMore/LeftPanelPageTabsMore';
import LeftPanelPageTabsInsert from '../LeftPanelPageTabsInsert/LeftPanelPageTabsInsert';
import LeftPanelPageTabsRotate from '../LeftPanelPageTabsRotate/LeftPanelPageTabsRotate';
import LeftPanelPageTabsOperations from '../LeftPanelPageTabsOperations/LeftPanelPageTabsOperations';
import CustomLeftPanelOperations from '../CustomLeftPanelOperations/CustomLeftPanelOperations';


function InitialLeftPanelPageTabs({ children, pageNumbers, multiPageManipulationControlsItems }) {
  const childrenArray = React.Children.toArray(children);
  if (!multiPageManipulationControlsItems) {
    return childrenArray;
  }
  return multiPageManipulationControlsItems.map((item, index) => {
    const { dataElement, type } = item;
    let component = childrenArray.find((child) => child.props.dataElement === dataElement);
    const key = dataElement || `${type}-${index}`;

    if (!component) {
      if (type === 'divider') {
        component = <div className="divider" />;
      }

      if (type === 'customPageOperation') {
        component = <CustomLeftPanelOperations key={dataElement} pageNumbers={pageNumbers} {...item} />;
      }
    }
    return component
      ? React.cloneElement(component, {
        key,
      })
      : null;
  });
}


function LeftPanelPageTabs(props) {
  const { pageNumbers, onRotateClockwise, onRotateCounterClockwise, onInsertAbove, onInsertBelow, onReplace, onExtractPages, onDeletePages, multiPageManipulationControlsItems } = props;
  return (
    <div className={'PageControlContainer root'}>
      <InitialLeftPanelPageTabs pageNumbers={pageNumbers} multiPageManipulationControlsItems={multiPageManipulationControlsItems} >
        <LeftPanelPageTabsRotate onRotateClockwise={onRotateClockwise} onRotateCounterClockwise={onRotateCounterClockwise} dataElement="leftPanelPageTabsRotate" />
        <LeftPanelPageTabsInsert onInsertAbove={onInsertAbove} onInsertBelow={onInsertBelow} dataElement="leftPanelPageTabsInsert" />
        <LeftPanelPageTabsOperations onReplace={onReplace} onExtractPages={onExtractPages} onDeletePages={onDeletePages} dataElement="leftPanelPageTabsOperations" />
        <LeftPanelPageTabsMore dataElement="leftPanelPageTabsMore" />
      </InitialLeftPanelPageTabs>
    </div>
  );
}


export default LeftPanelPageTabs;
