'use strict';
const DROP_AREA_CSS_CLASSES = {
  SIBLING_TOP: 'drop-as-sibling-top',
  SIBLING_BOTTOM: 'drop-as-sibling-bottom',
  CHILD: 'drop-as-child',
};

function handleDropAreaCssClasses(dragOverZone) {
  if (this === this.timeTracker.entryBeingDragged) {
    return;
  }
  if (dragOverZone === 'top') {
    this.classList.remove(DROP_AREA_CSS_CLASSES.CHILD);
    this.classList.add(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    return;
  }
  if (dragOverZone === 'middle') {
    this.classList
        .remove(DROP_AREA_CSS_CLASSES.SIBLING_TOP);
    this.classList.add(DROP_AREA_CSS_CLASSES.CHILD);
    this.timeTracker.entryWithDropAreaCssClasses = this;
  }
};

module.exports = {
  handleDropAreaCssClasses,
  DROP_AREA_CSS_CLASSES,
};
