import i18next from 'i18next';
import dayjs from 'dayjs';
import core from 'core';
import React from 'react';
import { rotateRad } from 'helpers/rotate';
import { rgbaToHex } from 'helpers/color';
import { getAnnotationClass, getAnnotationClassForFilterModal } from 'helpers/getAnnotationClass';
import getLatestActivityDate from 'helpers/getLatestActivityDate';

function getDocumentCenter(pageNumber) {
  let result;
  if (pageNumber <= core.getTotalPages()) {
    result = core.getPageInfo(pageNumber);
  } else {
    result = {
      width: 0,
      height: 0,
    };
  }
  return { x: result.width / 2, y: result.height / 2 };
}

function getRotationRad(pageNumber) {
  const orientation = core.getRotation(pageNumber);
  return (4 - orientation) * (Math.PI / 2);
}

const sortStrategies = {
  position: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        if (a.PageNumber === b.PageNumber) {
          const rotation = getRotationRad(a.PageNumber);
          const center = getDocumentCenter(a.PageNumber);

          // Simulated with respect to the document origin
          const rotatedA = [
            rotateRad(center.x, center.y, a.X, a.Y, rotation),
            rotateRad(center.x, center.y, a.X + a.Width, a.Y + a.Height, rotation),
          ];
          const rotatedB = [
            rotateRad(center.x, center.y, b.X, b.Y, rotation),
            rotateRad(center.x, center.y, b.X + b.Width, b.Y + b.Height, rotation),
          ];

          const smallestA = rotatedA.reduce(
            (smallest, current) => (current.y < smallest ? current.y : smallest),
            Number.MAX_SAFE_INTEGER,
          );
          const smallestB = rotatedB.reduce(
            (smallest, current) => (current.y < smallest ? current.y : smallest),
            Number.MAX_SAFE_INTEGER,
          );

          return smallestA - smallestB;
        }
        return a.PageNumber - b.PageNumber;
      }),
    shouldRenderSeparator: (prevNote, currNote) => currNote.PageNumber !== prevNote.PageNumber,
    getSeparatorContent: (prevNote, currNote, { pageLabels }) =>
      `${i18next.t('option.shared.page')} ${pageLabels[currNote.PageNumber - 1]}`,
  },
  //customization
  customDate: {
    getSortedNotes: notes => notes.sort((a, b) => {

      const aNoteDateString = a.getCustomData('custom-date');
      const bNoteDateString = b.getCustomData('custom-date');
      let aNoteDate = null;
      let bNoteDate = null;

      if (aNoteDateString !== '' && aNoteDateString != null) {
        aNoteDate = dayjs(aNoteDateString);
      }
      if (bNoteDateString !== '' && bNoteDateString != null) {
        bNoteDate = dayjs(bNoteDateString);
      }

      return -(aNoteDate || 0) + (bNoteDate || 0)
    })
    ,
    shouldRenderSeparator: (prevNote, currNote) => {
      const prevNoteDate = prevNote.getCustomData('custom-date');
      const currNoteDate = currNote.getCustomData('custom-date');

      if (prevNoteDate === '' && currNoteDate === '') {
        return false;
      }

      if (prevNoteDate !== '' && currNoteDate !== '') {
        if (prevNoteDate === currNoteDate)
          return false
        return true
      }
      return true;
    },
    getSeparatorContent: (prevNote, currNote) => {

      const currNoteDate = currNote.getCustomData('custom-date');
      if (currNoteDate !== '') {
        const dayFormat = 'MMM D, YYYY';
        const today = dayjs(new Date()).format(dayFormat);
        const yesterday = dayjs(new Date(new Date() - 86400000)).format(dayFormat);
        const createdDateString = dayjs(new Date(currNoteDate)).format(dayFormat);

        if (createdDateString === today) {
          return i18next.t('option.notesPanel.separator.today');
        }
        if (createdDateString === yesterday) {
          return i18next.t('option.notesPanel.separator.yesterday');
        }
        return createdDateString;
      } else {
        return i18next.t('option.notesPanel.separator.notset');
      }
    },
  },
  createdDate: {
    getSortedNotes: notes => notes.sort((a, b) => ( a.DateCreated || 0) - (b.DateCreated || 0)),
    shouldRenderSeparator: (prevNote, currNote) => {
      const prevNoteDate = prevNote.DateCreated;
      const currNoteDate = currNote.DateCreated;
      if (prevNoteDate && currNoteDate) {
        const dayFormat = 'MMM D, YYYY';
        return dayjs(prevNoteDate).format(dayFormat) !== dayjs(currNoteDate).format(dayFormat);
      } else if (!prevNoteDate && !currNoteDate) {
        return false;
      } else {
        return true;
      }
    },
    getSeparatorContent: (prevNote, currNote) => {
      const createdDate = currNote.DateCreated;
      if (createdDate) {
        const dayFormat = 'MMM D, YYYY';
        const today = dayjs(new Date()).format(dayFormat);
        const yesterday = dayjs(new Date(new Date() - 86400000)).format(dayFormat);
        const createdDateString = dayjs(new Date(createdDate)).format(dayFormat);

        if (createdDateString === today) {
          return i18next.t('option.notesPanel.separator.today');
        }
        if (createdDateString === yesterday) {
          return i18next.t('option.notesPanel.separator.yesterday');
        }
        return createdDateString;
      } else {
        return i18next.t('option.notesPanel.separator.unknown');
      }
    },
  },
  // modifiedDate: {
  //   getSortedNotes: notes => notes.sort((a, b) => (getLatestActivityDate(b) || 0) - (getLatestActivityDate(a) || 0)),
  //   shouldRenderSeparator: (prevNote, currNote) => {
  //     const prevNoteDate = getLatestActivityDate(prevNote);
  //     const currNoteDate = getLatestActivityDate(currNote);
  //     if (prevNoteDate && currNoteDate) {
  //       const dayFormat = 'MMM D, YYYY';
  //       return dayjs(prevNoteDate).format(dayFormat) !== dayjs(currNoteDate).format(dayFormat);
  //     } else if (!prevNoteDate && !currNoteDate) {
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   },
  //   getSeparatorContent: (prevNote, currNote) => {
  //     const latestActivityDate = getLatestActivityDate(currNote);
  //     if (latestActivityDate) {
  //       const dayFormat = 'MMM D, YYYY';
  //       const today = dayjs(new Date()).format(dayFormat);
  //       const yesterday = dayjs(new Date(new Date() - 86400000)).format(dayFormat);
  //       const latestActivityDay = dayjs(latestActivityDate).format(dayFormat);

  //       if (latestActivityDay === today) {
  //         return i18next.t('option.notesPanel.separator.today');
  //       }
  //       if (latestActivityDay === yesterday) {
  //         return i18next.t('option.notesPanel.separator.yesterday');
  //       }
  //       return latestActivityDay;
  //     } else {
  //       return i18next.t('option.notesPanel.separator.unknown');
  //     }
  //   },
  // },
  //customization

  //customization
  // status: {
  //   getSortedNotes: notes =>
  //     notes.sort((a, b) => {
  //       const statusA =
  //         a.getStatus() === ''
  //           ? i18next.t('option.state.none').toUpperCase()
  //           : i18next.t(`option.state.${a.getStatus().toLowerCase()}`).toUpperCase();
  //       const statusB =
  //         b.getStatus() === ''
  //           ? i18next.t('option.state.none').toUpperCase()
  //           : i18next.t(`option.state.${b.getStatus().toLowerCase()}`).toUpperCase();
  //       return statusA < statusB ? -1 : statusA > statusB ? 1 : 0;
  //     }),
  //   shouldRenderSeparator: (prevNote, currNote) => prevNote.getStatus() !== currNote.getStatus(),
  //   getSeparatorContent: (prevNote, currNote) => {
  //     return currNote.getStatus() === ''
  //       ? i18next.t('option.state.none')
  //       : i18next.t(`option.state.${currNote.getStatus().toLowerCase()}`);
  //   },
  // },
  //customization
  author: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        const authorA = core.getDisplayAuthor(a['Author'])?.toUpperCase();
        const authorB = core.getDisplayAuthor(b['Author'])?.toUpperCase();
        return authorA < authorB ? -1 : authorA > authorB ? 1 : 0;
      }),
    shouldRenderSeparator: (prevNote, currNote) => core.getDisplayAuthor(prevNote['Author']) !== core.getDisplayAuthor(currNote['Author']),
    getSeparatorContent: (prevNote, currNote) => {
      return core.getDisplayAuthor(currNote['Author']);
    },
  },
  type: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        //customization
        // const typeA = getAnnotationClass(a);
        // const typeB = getAnnotationClass(b);
        // return typeA < typeB ? -1 : typeA > typeB ? 1 : 0;

        const typeA = getAnnotationClassForFilterModal(a);
        const typeB = getAnnotationClassForFilterModal(b);
        return typeA < typeB ? -1 : typeA > typeB ? 1 : 0;

        //customization
      }),
    shouldRenderSeparator: (prevNote, currNote) => {
      return getAnnotationClassForFilterModal(prevNote) !== getAnnotationClassForFilterModal(currNote);
    },
    getSeparatorContent: (prevNote, currNote) => {
      return i18next.t(`annotation.${getAnnotationClassForFilterModal(currNote)}`);
    },
  },
  visibility: {
    getSortedNotes: notes =>
      notes.sort((a, b) => {
        //customization
        const isPrivateA = a.getCustomData('custom-private');
        const isPrivateB = b.getCustomData('custom-private');

        if ((isPrivateA === '' && isPrivateB === '') || (isPrivateA === isPrivateB))
          return 0;
        
        return isPrivateA.toLowerCase() === 'true' ? -1 : 1;

        //customization
      }),
    shouldRenderSeparator: (prevNote, currNote) => {
      const isPrivatePrev = prevNote.getCustomData('custom-private');
      const isPrivateCurr = currNote.getCustomData('custom-private');

      if (isPrivateCurr === '' && isPrivatePrev === '')
        return false;

      if (isPrivateCurr === isPrivatePrev)
        return false;

      return true;
    },
    getSeparatorContent: (prevNote, currNote) => {
      const isPrivate = currNote.getCustomData('custom-private');

      return isPrivate === '' || isPrivate.toLowerCase() === 'false' ? i18next.t('annotation.public') : i18next.t('annotation.private');
    },
  },
  //customization
  // color: {
  //   getSortedNotes: notes =>
  //     notes.sort((prevNote, currNote) => {
  //       let colorA = '#485056';
  //       let colorB = '#485056';
  //       if (currNote.Color) {
  //         colorA = rgbaToHex(currNote.Color.R, currNote.Color.G, currNote.Color.B, currNote.Color.A);
  //       }
  //       if (prevNote.Color) {
  //         colorB = rgbaToHex(prevNote.Color.R, prevNote.Color.G, prevNote.Color.B, prevNote.Color.A);
  //       }
  //       return colorA < colorB ? -1 : colorA > colorB ? 1 : 0;
  //     }),
  //   shouldRenderSeparator: (prevNote, currNote) => {
  //     let colorA = '#485056';
  //     let colorB = '#485056';
  //     if (currNote.Color) {
  //       colorA = rgbaToHex(currNote.Color.R, currNote.Color.G, currNote.Color.B, currNote.Color.A);
  //     }
  //     if (prevNote.Color) {
  //       colorB = rgbaToHex(prevNote.Color.R, prevNote.Color.G, prevNote.Color.B, prevNote.Color.A);
  //     }
  //     return colorA !== colorB;
  //   },
  //   getSeparatorContent: (prevNote, currNote) => {
  //     let color = '#485056';
  //     if (currNote.Color) {
  //       color = rgbaToHex(currNote.Color.R, currNote.Color.G, currNote.Color.B, currNote.Color.A);
  //     }
  //     return (
  //       <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
  //         {i18next.t('option.notesOrder.color')}
  //         <div
  //           style={{ background: color, width: '7px', height: '7px', borderRadius: '10000000px', marginLeft: '10px' }}
  //         ></div>
  //       </div>
  //     );
  //   },
  // },
  //customization

};

export const getSortStrategies = () => sortStrategies;

export const addSortStrategy = newStrategy => {
  const { name, getSortedNotes, shouldRenderSeparator, getSeparatorContent } = newStrategy;

  sortStrategies[name] = {
    getSortedNotes,
    shouldRenderSeparator,
    getSeparatorContent,
  };
};

/**
 * Contains string enums for all the possible sorting algorithms available in NotesPanel.
 * @name UI.NotesPanelSortStrategy
 * @property {string} POSITION Sort notes by position.
 * @property {string} CREATED_DATE Sort notes by creation date.
 * @property {string} MODIFIED_DATE Sort notes by last modification date.
 * @property {string} STATUS Sort notes by status.
 * @property {string} AUTHOR Sort notes by the author.
 * @property {string} TYPE Sort notes by type.
 * @property {string} COLOR Sort notes by color.
 *
 * @example
WebViewer(...)
  .then(function(instance) {
    const sortStrategy = instance.UI.NotesPanelSortStrategy;
    instance.UI.setNotesPanelSortStrategy(sortStrategy.AUTHOR);
  });
 */
export const NotesPanelSortStrategy = {
  POSITION: 'position',
  CREATED_DATE: 'createdDate',
  MODIFIED_DATE: 'modifiedDate',
  STATUS: 'status',
  AUTHOR: 'author',
  TYPE: 'type',
  COLOR: 'color',
  CUSTOM_DATE: 'customDate',
};