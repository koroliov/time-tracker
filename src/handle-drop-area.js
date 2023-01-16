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
  }
  if (dragOverZone === 'middle') {
    this.classList.remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP,
      DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    this.nextElementSibling?.classList
        .remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    if (this.isCollapsed) {
      this.timeTracker.entryWithDropAreaCssClasses = null;
      return;
    }
    previousSiblingEntry?.classList
        .remove(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    if (!this.isCollapsed && this.childEntries.length) {
      this.timeTracker.entryWithDropAreaCssClasses = null;
      return;
    }
    this.classList.add(DROP_AREA_CSS_CLASSES.CHILD);
    this.timeTracker.entryWithDropAreaCssClasses = this;
  }

  function handleDragOverBottom() {
    if (equivalentDropAreaAlreadyExists()) {
      return;
    }
    hideAllDropAreas();
    if (noReasonToDropNextSiblingAsNextSibling()) {
      return;
    }

    if (!entryOverWhichDragIsBeingPerformed.isCollapsed &&
        entryOverWhichDragIsBeingPerformed.childEntries.length) {
      return;
    }
    entryOverWhichDragIsBeingPerformed.classList
      .add(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    timeTracker.entryWithDropAreaCssClasses = entryOverWhichDragIsBeingPerformed;

    function noReasonToDropNextSiblingAsNextSibling() {
      return timeTracker.entryBeingDragged === nextSiblingEntry;
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
}

module.exports = {
  handleDropArea,
  DROP_AREA_CSS_CLASSES,
};
