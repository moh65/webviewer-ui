import React from 'react';
import core from 'core';
import NotePopup from './NotePopup';
import Tooltip from 'components/Tooltip';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import selectors from 'selectors';



function NotePopupContainer(props) {
  const { annotation, setIsEditing, noteIndex, customImported } = props; // eslint-disable-line react/prop-types

  let [currentDocumentInfo] = useSelector(state => [
    selectors.getThisDocumentInfo(state),
  ]);

  currentDocumentInfo = currentDocumentInfo && currentDocumentInfo.id ? currentDocumentInfo : {

  };

  const [canModify, setCanModify] = React.useState(core.canModify(annotation));
  const [canModifyContents, setCanModifyContents] = React.useState(core.canModifyContents(annotation));
  const [isOpen, setIsOpen] = React.useState(false);
  const [t] = useTranslation();

  React.useEffect(() => {
    function onUpdateAnnotationPermission() {
      setCanModify(core.canModify(annotation));
      setCanModifyContents(core.canModifyContents(annotation));
    }
    core.addEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
    return () =>
      core.removeEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
  }, [annotation]);

  const handleEdit = React.useCallback(function handleEdit() {
    const isFreeText = annotation instanceof window.Annotations.FreeTextAnnotation;
    if (isFreeText && core.getAnnotationManager().isFreeTextEditingEnabled()) {
      core.getAnnotationManager().trigger('annotationDoubleClicked', annotation);
    } else {
      setIsEditing(true, noteIndex);
    }
  }, [annotation, setIsEditing, noteIndex]);

  const handleDelete = React.useCallback(function handleDelete() {
    if (customImported && customImported !== "false") {
      annotation.Author = core.getCurrentUser();
    }
    
    core.deleteAnnotations([annotation, ...annotation.getGroupedChildren()]);
  }, [annotation]);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  const isEditable = canModifyContents;
  const isDeletable = (canModify && !annotation?.NoDelete) || (customImported && customImported !== "false" && currentDocumentInfo.isGeneratedBundle !== undefined && currentDocumentInfo.isGeneratedBundle === false);

  const passProps = {
    handleEdit,
    handleDelete,
    isEditable,
    isDeletable,
    isOpen,
    closePopup,
    openPopup,
  };

  // We wrap the element in a div so the tooltip works properly
  return (
    <Tooltip content={t('formField.formFieldPopup.options')}>
      <div>
        <NotePopup {...props} {...passProps} />
      </div>
    </Tooltip>
  );
}

export default NotePopupContainer;

