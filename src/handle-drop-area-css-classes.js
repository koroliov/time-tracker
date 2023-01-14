'use strict';
const DROP_AREA_CSS_CLASSES = {
  SIBLING_TOP: 'drop-as-sibling-top',
  SIBLING_BOTTOM: 'drop-as-sibling-bottom',
  CHILD: 'drop-as-child',
};

function handleDropAreaCssClasses(dragOverZone) {
  if (this.timeTracker.entryBeingDragged.parentTimeEntry === this) {
    return;
  }
  if (this === this.timeTracker.entryBeingDragged) {
    return;
  }
  if (dragOverZone === 'top') {
    if (this.previousElementSibling?.classList
        .contains(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM)) {
      return;
    }
    this.classList.remove(DROP_AREA_CSS_CLASSES.CHILD);
    this.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    return;
  }
  if (dragOverZone === 'bottom') {
    if (this.nextElementSibling?.classList
        .contains(DROP_AREA_CSS_CLASSES.SIBLING_TOP)) {
      return;
    }
    this.classList.remove(DROP_AREA_CSS_CLASSES.CHILD);
    if (this.timeTracker.entryBeingDragged === this.nextElementSibling) {
      this.timeTracker.entryWithDropAreaCssClasses = null;
      return;
    }
    this.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    return;
  }
  if (dragOverZone === 'middle') {
    this.classList.remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP,
      DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    this.nextElementSibling.classList.remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    this.previousElementSibling?.classList
        .remove(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM);
    this.classList.add(DROP_AREA_CSS_CLASSES.CHILD);
    this.timeTracker.entryWithDropAreaCssClasses = this;
  }
};

module.exports = {
  handleDropAreaCssClasses,
  DROP_AREA_CSS_CLASSES,
};
