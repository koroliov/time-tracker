'use strict';
const DROP_AREA_CSS_CLASSES = {
  SIBLING_TOP: 'drop-as-sibling-top',
  SIBLING_BOTTOM: 'drop-as-sibling-bottom',
  CHILD: 'drop-as-child',
};

function handleDropArea(dragOverZone) {
  if (this.timeTracker.entryBeingDragged.parentTimeEntry === this) {
    if (dragOverZone === 'top') {
      if (this.previousElementSibling?.classList
          .contains(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM)) {
        return;
      }
      this.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
      this.timeTracker.entryWithDropAreaCssClasses = this;
      return;
    }
    if (dragOverZone === 'middle') {
      this.classList.remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
      this.timeTracker.entryWithDropAreaCssClasses = null;
      return;
    }
    return;
  }
  if (this === this.timeTracker.entryBeingDragged) {
    this.timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...Object.values(DROP_AREA_CSS_CLASSES));
    this.timeTracker.entryWithDropAreaCssClasses = null;
    return;
  }
  if (isEntryOneAnscestorOfEntryTwo(this.timeTracker.entryBeingDragged,
      this)) {
    this.timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...Object.values(DROP_AREA_CSS_CLASSES));
    this.timeTracker.entryWithDropAreaCssClasses = null;
    return;
  }
  if (dragOverZone === 'top') {
    if (this.previousElementSibling?.classList
        .contains(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM)) {
      return;
    }
    if (this.previousElementSibling === this.timeTracker.entryBeingDragged) {
      return;
    }
    this.timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...Object.values(DROP_AREA_CSS_CLASSES));
    this.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    this.timeTracker.entryWithDropAreaCssClasses = this;
    return;
  }
  if (dragOverZone === 'bottom') {
    if (this.nextElementSibling?.classList
        .contains(DROP_AREA_CSS_CLASSES.SIBLING_TOP)) {
      return;
    }
    this.timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...Object.values(DROP_AREA_CSS_CLASSES));
    this.timeTracker.entryWithDropAreaCssClasses = null;
    this.classList.remove(DROP_AREA_CSS_CLASSES.CHILD);
    if (this.timeTracker.entryBeingDragged === this.nextElementSibling) {
      this.timeTracker.entryWithDropAreaCssClasses = null;
      return;
    }
    this.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    this.timeTracker.entryWithDropAreaCssClasses = this;
    return;
  }
  if (dragOverZone === 'middle') {
    this.classList.remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP,
      DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    this.nextElementSibling?.classList
        .remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    this.previousElementSibling?.classList
        .remove(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    this.classList.add(DROP_AREA_CSS_CLASSES.CHILD);
    this.timeTracker.entryWithDropAreaCssClasses = this;
  }

  function isEntryOneAnscestorOfEntryTwo(entryOne, entryTwo) {
    let ancestor = entryTwo.parentTimeEntry;
    while (ancestor) {
      if (ancestor === entryOne) {
        return true;
      }
      ancestor = ancestor.parentTimeEntry;
    }
    return false;
  }
};

module.exports = {
  handleDropArea,
  DROP_AREA_CSS_CLASSES,
};
