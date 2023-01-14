'use strict';
const dropAreaCssClassesMap = new Map([
  [ 'siblingTopDropAreaCssClass', 'drop-as-sibling-top', ],
  [ 'siblingBottomDropAreaCssClass', 'drop-as-sibling-bottom', ],
  [ 'childDropAreaCssClass', 'drop-as-child', ],
]);

function handleDropAreaCssClasses(dragOverZone) {
  if (this === this.timeTracker.entryBeingDragged) {
    return;
  }
  if (dragOverZone === 'top') {
    this.classList.remove(dropAreaCssClassesMap.get('childDropAreaCssClass'));
    this.classList.add(dropAreaCssClassesMap.get('siblingTopDropAreaCssClass'));
    return;
  }
  if (dragOverZone === 'middle') {
    this.classList
        .remove(dropAreaCssClassesMap.get('siblingTopDropAreaCssClass'));
    this.classList.add(dropAreaCssClassesMap.get('childDropAreaCssClass'));
    this.timeTracker.entryWithDropAreaCssClasses = this;
  }
};

module.exports = {
  handleDropAreaCssClasses,
  dropAreaCssClassesMap,
};
