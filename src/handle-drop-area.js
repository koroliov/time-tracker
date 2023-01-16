'use strict';
const DROP_AREA_CSS_CLASSES = {
  SIBLING_TOP: 'drop-as-sibling-top',
  SIBLING_BOTTOM: 'drop-as-sibling-bottom',
  CHILD: 'drop-as-child',
};
const allDropAreaCssClassesArr = Object.values(DROP_AREA_CSS_CLASSES);

function handleDropArea(dragOverZone) {
  const timeTracker = this.timeTracker;
  const entryOverWhichDragIsBeingPerformed = this;
  const entryBeingDragged = timeTracker.entryBeingDragged;
  const previousSiblingEntry = this.previousElementSibling;
  const nextSiblingEntry = this.nextElementSibling;

  if (entryIsBeingDraggedOverItsParent()) {
    handleDragOverParent();
  } else if (entryIsBeingDraggedOverItselfOrDescendant()) {
    return hideAllDropAreas();
  }
  if (dragOverZone === 'top') {
    handleDragOverTop();
  } else if (dragOverZone === 'bottom') {
    handleDragOverBottom();
  } else if (dragOverZone === 'middle') {
    handleDragOverMiddle();
  }

  function handleDragOverMiddle() {
    removePotentiallyPresentClasses();
    if (entryOverWhichDragIsBeingPerformedIsCollapsedOrHasOpenChildren()) {
      timeTracker.entryWithDropAreaCssClasses = null;
      return;
    }
    showSiblingChildDropAreaOver(entryOverWhichDragIsBeingPerformed);

    function entryOverWhichDragIsBeingPerformedIsCollapsedOrHasOpenChildren() {
      return entryOverWhichDragIsBeingPerformed.isCollapsed ||
          entryOverWhichDragIsBeingPerformed.childEntries.length
    }

    function removePotentiallyPresentClasses() {
      entryOverWhichDragIsBeingPerformed.classList
          .remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP,
              DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
      nextSiblingEntry?.classList.remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
      previousSiblingEntry?.classList
          .remove(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    }
  }

  function handleDragOverBottom() {
    if (equivalentDropAreaAlreadyExists()) {
      return;
    }
    hideAllDropAreas();
    if (noDropAreaAllowed()) {
      return;
    }
    showSiblingBottomDropAreaOver(entryOverWhichDragIsBeingPerformed);

    function noDropAreaAllowed() {
      return noReasonToDropNextSiblingAsNextSibling() ||
          isEntryOverWhichDragIsBeingPerformedHavingVisibleChildren();

      function noReasonToDropNextSiblingAsNextSibling() {
        return timeTracker.entryBeingDragged === nextSiblingEntry;
      }

      function isEntryOverWhichDragIsBeingPerformedHavingVisibleChildren() {
        return !entryOverWhichDragIsBeingPerformed.isCollapsed &&
            entryOverWhichDragIsBeingPerformed.childEntries.length;
      }
    }

    function equivalentDropAreaAlreadyExists() {
      return nextSiblingEntry?.classList
          .contains(DROP_AREA_CSS_CLASSES.SIBLING_TOP)
    }
  }

  function handleDragOverTop() {
    if (nothingToDo()) {
      return;
    }
    timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...allDropAreaCssClassesArr);
    entryOverWhichDragIsBeingPerformed.classList
        .add(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    timeTracker.entryWithDropAreaCssClasses =
        entryOverWhichDragIsBeingPerformed;

    function nothingToDo() {
      return previousSiblingEntry === entryBeingDragged ||
          previousSiblingEntry?.classList
              .contains(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM)
    }
  }

  function entryIsBeingDraggedOverItsParent() {
    return entryBeingDragged.parentTimeEntry ===
        entryOverWhichDragIsBeingPerformed;
  }

  function entryIsBeingDraggedOverItselfOrDescendant() {
    return entryBeingDragged === entryOverWhichDragIsBeingPerformed ||
        isOverDescendant();

    function isOverDescendant() {
      let ancestor = entryOverWhichDragIsBeingPerformed.parentTimeEntry;
      while (ancestor) {
        if (ancestor === entryBeingDragged) {
          return true;
        }
        ancestor = ancestor.parentTimeEntry;
      }
      return false;
    }
  }

  function handleDragOverParent() {
    switch (dragOverZone) {
      case 'top':
        if (previousSiblingHasBottomDropArea(this)) {
          return;
        }
        showSiblingTopDropAreaOver(entryOverWhichDragIsBeingPerformed);
      case 'middle':
      case 'bottom':
        hideAllDropAreas();
    }
    return;

    function previousSiblingHasBottomDropArea() {
      return entryOverWhichDragIsBeingPerformed.previousElementSibling
          ?.classList.contains(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM)
    }
  }

  function hideAllDropAreas() {
    timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...allDropAreaCssClassesArr);
    timeTracker.entryWithDropAreaCssClasses = null;
  }

  function showSiblingTopDropAreaOver(entry) {
    entry.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    timeTracker.entryWithDropAreaCssClasses = entry;
  }

  function showSiblingBottomDropAreaOver(entry) {
    entry.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    timeTracker.entryWithDropAreaCssClasses = entry;
  }

  function showSiblingChildDropAreaOver(entry) {
    entry.classList.add(DROP_AREA_CSS_CLASSES.CHILD);
    timeTracker.entryWithDropAreaCssClasses = entry;
  }
}

module.exports = {
  handleDropArea,
  DROP_AREA_CSS_CLASSES,
};
