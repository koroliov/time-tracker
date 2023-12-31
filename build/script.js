(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
class Base extends HTMLElement {
  constructor() {
    super();
  }

  addListeners() {
    const domEl = this.shadowRoot || this;
    domEl.querySelector('.controls .new-entry')
        .addEventListener('click', this.addNewTimeEntry.bind(this));
    domEl.querySelector('.controls .collapse-open').addEventListener('click',
        this.toggleChildEntriesVisible.bind(this));
    domEl.addEventListener('activate', this.handleActivateEvent.bind(this));
    domEl.addEventListener('active-entry-changed',
        this.handleEntryActiveChangedEvent.bind(this));
    domEl.addEventListener('disactivate',
        this.handleDisactivateEvent.bind(this));
    domEl.addEventListener('is-billable-changed',
        this.handleIsBillableChanged.bind(this));
    domEl.addEventListener('update-time',
        this.handleUpdateTimeEvent.bind(this));
  }

  handleIsBillableChanged(e) {
    if (e.target === this.activeDescendantOrSelf) {
      this.isCountBillable = e.detail.isBillable;
    }
    this.timeSpentBillable += e.detail.billableTimeChange;
    this.updateTimeText();
  }

  handleUpdateTimeEvent(e) {
    this.timeSpentTotal += e.detail.totalTimeChange;
    this.timeSpentBillable += e.detail.billableTimeChange;
    this.updateTimeText();
  }

  handleActivateEvent(e) {
    if (e.target === this) {
      this.handleWhenActiveItself();
    }
    this.isCountBillable = e.detail.isBillable;
    if (this.activeDescendantOrSelf) {
      if (this.activeDescendantOrSelf !== this) {
        this.fireDisactivateEventToCurrentlyActiveEntry();
      }
      this.fireActiveEntryChangedEvent(e.target);
      e.stopPropagation();
    }
    this.activeDescendantOrSelf = e.target;
    //Not sure why do we need this stopCount() call. Probably b/c it's possible
    //that an entry or the time tracker itself may receive the activate event
    //even though they are being active already. To prevent having lots of
    //intervals, we need to clear an existing one
    //
    //This can be changed, if we rework the intervals mechanism: instead of
    //each entry having its own interval, we will have just one
    this.stopCount();
    this.startCount();
  }

  fireActiveEntryChangedEvent(newActiveEntry) {
    const entryActiveChangedEvent =
      new CustomEvent('active-entry-changed', {
        detail: { activeEntry: newActiveEntry, },
        bubbles: true,
      });
    this.dispatchEvent(entryActiveChangedEvent);
  }

  fireDisactivateEventToCurrentlyActiveEntry() {
    const disactivateEvent = new CustomEvent('disactivate', {
      detail: { firedFrom: this, },
      bubbles: true,
    });
    this.activeDescendantOrSelf.dispatchEvent(disactivateEvent);
  }

  handleWhenInactiveItself() {
    this.querySelector('.start-stop').innerText = 'Start';
    this.classList.remove('is-active');
  }

  handleEntryActiveChangedEvent(e) {
    if (this.activeDescendantOrSelf === this) {
      this.handleWhenInactiveItself();
    }
    this.isCountBillable = e.detail.activeEntry.isOwnTimeBillable;
    this.activeDescendantOrSelf = e.detail.activeEntry;
  }

  disactivate(evTarget) {
    if (evTarget === this) {
      this.handleWhenInactiveItself();
    }
    this.activeDescendantOrSelf = null;
    this.isCountBillable = false;
    this.stopCount();
  }

  handleDisactivateEvent(e) {
    if (e.detail.firedFrom === this) {
      if (this.activeDescendantOrSelf) {
        e.stopPropagation();
      }
    } else {
      this.disactivate(e.target);
    }
  }

  toggleChildEntriesVisible(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.childEntries.length || hasActiveChild(this)) {
      this.isCollapsed = false;
      return;
    }
    this.isCollapsed = !this.isCollapsed;
    this.handleChildEntriesVisibility();

    function hasActiveChild(thisEntry) {
      return thisEntry.activeDescendantOrSelf &&
          thisEntry.activeDescendantOrSelf !== thisEntry;
    }
  }

  initChildEntries(childEntries = [], timeTracker) {
    //This will be a recursive call, but it's acceptable, since no huge data
    //structures are expected
    const TimeEntry = window.customElements.get('time-entry');
    const parentTimeEntry = this.shadowRoot ? null : this;
    this.childEntries = childEntries.map((c) => {
      const te = new TimeEntry(c, timeTracker, parentTimeEntry);
      this.childrenDomEl.appendChild(te);
      return te;
    });
    this.setCollapseOpenLink();
  }

  addNewTimeEntry(e, timeTracker) {
    e.preventDefault();
    e.stopPropagation();
    const TimeEntry = window.customElements.get('time-entry');
    const parentTimeEntry = this.shadowRoot ? null : this;
    const te = new TimeEntry(Object.create(null), timeTracker, parentTimeEntry);
    this.childEntries.push(te);
    this.isCollapsed = false;
    this.handleChildEntriesVisibility();
    this.setCollapseOpenLink();
    this.childrenDomEl.appendChild(te);
  }

  setCollapseOpenLink() {
    const domEl = this.shadowRoot || this;
    const collapseOpenLink = domEl.querySelector('.controls .collapse-open');
    if (this.isCollapsed) {
      collapseOpenLink.innerText = `Open (${this.childEntries.length})`;
    } else {
      collapseOpenLink.innerText = `Collapse (${this.childEntries.length})`;
    }
  }

  handleChildEntriesVisibility() {
    const domEl = this.shadowRoot || this;
    const childrenDomEl = this.childrenDomEl ||
        domEl.querySelector('.children');
    const collapseOpenLink = domEl.querySelector('.controls .collapse-open');
    if (this.isCollapsed) {
      collapseOpenLink.innerText = `Open (${this.childEntries.length})`;
      childrenDomEl.style.display = 'none';
    } else {
      collapseOpenLink.innerText = `Collapse (${this.childEntries.length})`;
      childrenDomEl.style.display = 'block';
    }
  }

  removeChild(child) {
    this.childEntries.splice(this.childEntries.findIndex(c => c === child), 1);
    this.childrenDomEl.removeChild(child);
    this.setCollapseOpenLink();
  }

  addChild(child, where, sibling) {
    if (where) {
      const siblingI = this.childEntries.findIndex(c => c === sibling);
      if (where === 'before') {
        this.childrenDomEl.insertBefore(child, sibling);
        this.childEntries.splice(siblingI, 0, child);
      } else if (where === 'after') {
        if (siblingI === this.childEntries.length - 1) {
          this.childEntries.push(child);
          this.childrenDomEl.appendChild(child);
        } else {
          const sibling = this.childEntries[siblingI + 1];
          this.childrenDomEl.insertBefore(child, sibling);
          this.childEntries.splice(siblingI + 1, 0, child);
        }
      }
    } else {
      this.childEntries.push(child);
      this.childrenDomEl.appendChild(child);
    }
    const timeChange = {
      totalTimeChange: child.timeSpentTotal,
      billableTimeChange: child.timeSpentBillable,
    };
    if (isTimeEntry(this)) {
      this.fireUpdateTimeEvent(this, timeChange);
      child.parentTimeEntry = this;
    } else {
      this.fireUpdateTimeEvent(this.shadowRoot, timeChange);
      child.parentTimeEntry = null;
    }
    this.setCollapseOpenLink();

    function isTimeEntry(thisObj) {
      return !Boolean(thisObj.shadowRoot);
    }
  }

  fireUpdateTimeEvent(target, timeChange) {
    const updateTimeEvent = new CustomEvent('update-time', {
      detail: timeChange,
      bubbles: true,
    });
    target.dispatchEvent(updateTimeEvent);
  }

  initData(data) {
    this.countUpdatedAt = data?.countUpdatedAt || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.intervalId = 0;
    this.isCountBillable = data?.isCountBillable || false;

    this.isCollapsed = data?.isCollapsed || false;
    this.childEntries = [];
    this.activeDescendantOrSelf = null;
  }

  stopCount() {
    clearInterval(this.intervalId);
    this.intervalId = 0;
  }

  startCount() {
    this.countUpdatedAt = Date.now();
    this.intervalId = setInterval(this.updateTimeOnInterval.bind(this), 1000);
  }

  updateTimeOnInterval() {
    const now = Date.now();
    const timeSpentCurrent = now - this.countUpdatedAt;
    this.countUpdatedAt = now;
    if (this.activeDescendantOrSelf === this) {
      this.timeSpentOwn += timeSpentCurrent;
    }
    if (this.isCountBillable) {
      this.timeSpentBillable += timeSpentCurrent;
    }
    this.timeSpentTotal += timeSpentCurrent;
    this.updateTimeText();
  }

  convertTimeToText(ms) {
    const sec = Math.floor(ms / 1000);
    const secRemainder = sec % 60;
    const min = (sec - secRemainder) / 60;
    const minRemainder = min % 60;
    const hrs = (min - minRemainder) / 60;
    const hrsRemainder = hrs % 8;
    const days = (hrs - hrsRemainder) / 8;
    return `${days}d ${hrsRemainder}h ${minRemainder}m ${secRemainder}s`;
  }
}

module.exports = Base;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';
(function() {
  const TimeTracker = require('./time-tracker');

  let autoSaveInterval = 0;
  let tt = null;
  init();

  function init(jsonArg) {
    const version = [0, 1, 0];
    const versionStr = version.join('.');
    const storageEntryName = getStorageEntryName();
    const {restoreType, json} = getRestoreData();
    if (restoreType === 'fileImport') {
      attemptRestoreFromFileImport();
    } else if (restoreType === 'localStorage') {
      attemptRestoreFromLocalStorage();
    }
    setAutosave();

    function attemptRestoreFromLocalStorage() {
      if (isRunFirstTime()) {
        return createTimeTrackerFromScratch();
      }
      let data;
      try {
        data = JSON.parse(json);
      } catch(e) {
        return Promise.resolve().then(() => {
          const message = [
            `Failed to restore data from localStorage entry`,
            `${storageEntryName}: either it is corrupted or an unknown error`,
            'has occurred. Would you like to delete the entry and start',
            'a new time-tracker?',
          ].join('\n');
          if (window.confirm(message)) {
            window.localStorage.removeItem(storageEntryName);
            createTimeTrackerFromScratch();
          }
        });
      }
      const {isAcceptable, versionToRestore} = checkVersion(data);
      if (isAcceptable) {
        data.version = version;
        tt = new TimeTracker(data, init);
        document.body.appendChild(tt);
      } else {
        const message = [
          `JSON from localStorage was generated in time-tracker.html`,
          `version ${versionToRestore}, but currently you're using`,
          `time-tracker.html version ${versionStr}, which may not work`,
          `correctly with the JSON file, which is being imported`,
          `Refusing to restore, try time-tracker.html`,
          `version ${versionToRestore}`,
          ``,
          `NOTE: Alternatively you can delete the localStorage entry`,
          `${storageEntryName} via the dev-tools <F12>, this will allow you`,
          `to use the current time-tracker.html version from scratch`,
        ].join('\n');;
        alert(message);
        return;
      }

      function createTimeTrackerFromScratch() {
        const data = Object.create(null);
        data.version = version;
        tt = new TimeTracker(data, init);
        document.body.appendChild(tt);
      }

      function isRunFirstTime() {
        return !json;
      }
    }

    function attemptRestoreFromFileImport() {
      let data;
      const brokenDataErrorMessage =
        `Failed to import JSON data, either the file is wrong or corrupted`;
      try {
        data = JSON.parse(json);
      } catch(e) {
        alert(brokenDataErrorMessage);
        return;
      }
      const {isAcceptable, versionToRestore} = checkVersion(data);
      if (isAcceptable) {
        tt.destroy();
        tt = new TimeTracker(data, init);
        document.body.appendChild(tt);
      } else if (versionToRestore === 'unknown') {
        alert(brokenDataErrorMessage);
      } else {
        alert([
          `Imported JSON file was generated in time-tracker.html`,
          `v${versionToRestore}, but currently you're using`,
          `time-tracker.html version ${versionStr}, which may not work`,
          `correctly with the JSON file, which is being imported`,
          `Refusing to import, try time-tracker.html version`,
          `${versionToRestore}`,
        ].join('\n'));
      }
    }

    function getRestoreData() {
      let restoreType = '';
      let json;
      if (jsonArg) {
        restoreType = 'fileImport';
        json = jsonArg;
      } else {
        restoreType = 'localStorage';
        json = localStorage.getItem(storageEntryName);
      }
      return {restoreType, json};
    }

    window.addEventListener('beforeunload', function() {
      if (tt) {
        localStorage.setItem(storageEntryName, tt);
      } else {
        this.localStorage.removeItem(storageEntryName);
      }
    });

    function setAutosave() {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
      autoSaveInterval = setInterval(() => {
        localStorage.setItem(storageEntryName, tt);
      }, 300000);
    }

    function getStorageEntryName() {
      return location.href.replace(/^file:\/\//, '');
    }

    function checkVersion(data) {
      const majorVersionOfDataRestored = data?.version?.[0];
      const versionToRestore = Array.isArray(data?.version) ?
        data.version.join('.') : 'unknown';
      return {
        isAcceptable: version[0] === majorVersionOfDataRestored,
        versionToRestore,
      };
    }
  }
})();

},{"./time-tracker":5}],4:[function(require,module,exports){
'use strict';

const {
  handleDropArea: handleDropAreaModule,
  DROP_AREA_CSS_CLASSES,
} = require('./handle-drop-area.js');
const Base = require('./base.js');

class TimeEntry extends Base {
  constructor(data, timeTracker, parentTimeEntry) {
    data.templateId = 'time-entry';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId);
    this.initDomElementReferences(timeTracker, parentTimeEntry);
    this.initChildEntries(data.childEntries, timeTracker);
    this.addListeners();
    this.updateTimeText();
  }

  handleWhenActiveItself() {
    this.classList.add('is-active');
    this.querySelector('.start-stop').innerText = 'Stop';
  }

  addListeners() {
    super.addListeners(this);
    this.querySelector('.title')
        .addEventListener('blur', e => this.titleText = e.target.innerText);
    this.querySelector('.comment .public')
        .addEventListener('blur', e => this.commentText = e.target.innerText);
    this.querySelector('.comment .internal').addEventListener(
        'blur', e => this.commentInternalText = e.target.innerText);
    this.querySelector('.is-own-time-billable input').addEventListener(
        'click', this.handleIsOwnTimeBillableClick.bind(this));
    this.querySelector('.start-stop')
        .addEventListener('click', this.handleStartStopClick.bind(this));
    this.querySelector('.controls .delete-entry')
        .addEventListener('click', this.handleDeleteEntry.bind(this));
    this.querySelector('.generate-message')
        .addEventListener('click', this.generateMessageHandler.bind(this));

    this.addEventListener('mousedown', this.mouseDownHander.bind(this));

    this.addEventListener('dragstart', this.dragStartHandler.bind(this));
    this.addEventListener('dragenter', this.dragEnterHandler.bind(this));
    this.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
    this.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.addEventListener('dragend', this.dragEndHandler.bind(this));
    this.addEventListener('drop', this.dropHandler.bind(this));
  }

  handleDeleteEntry(e) {
    e.preventDefault();
    e.stopPropagation();
    return Promise.resolve().then(() => {
      if (!window.confirm('Are you sure?')) {
        return;
      }
      if (this.activeDescendantOrSelf === this) {
        this.disactivate(this);
        const disactivateEvent = new CustomEvent('disactivate', {
          detail: { firedFrom: this, },
          bubbles: true,
        });
        this.dispatchEvent(disactivateEvent);
      }
      const timeChange = {
        totalTimeChange: -this.timeSpentTotal,
        billableTimeChange: -this.timeSpentBillable,
      };
      const eventTarget = this.parentTimeEntry || this.timeTracker.shadowRoot;
      this.fireUpdateTimeEvent(eventTarget, timeChange);
      const parent = this.parentTimeEntry || this.timeTracker;
      parent.removeChild(this);
    });
  }

  mouseDownHander(e) {
    this.mouseDownOnEl = e.target;
    e.stopPropagation();
  }

  dragStartHandler(e) {
    e.stopPropagation();
    if (this.mouseDownOnEl !== this.dragEl || this.activeDescendantOrSelf) {
      e.preventDefault();
      return;
    }
    this.timeTracker.entryBeingDragged = this;
  }

  dragEndHandler(e) {
    e.stopPropagation();
    this.mouseDownOnEl = null;
    this.timeTracker.entryBeingDragged = null;
    this.hideAllDropAreas();
  }

  dragEnterHandler(e) {
    e.stopPropagation();
  }

  dragLeaveHandler(e) {
    e.stopPropagation();
  }

  dragOverHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const dragOverZone = determineDragOverZone(this);
    this.handleDropArea(dragOverZone);

    function determineDragOverZone(thisTimeEntry) {
      const borderWrapper =
          thisTimeEntry.querySelector('.border-and-grid-wrapper');
      if (!thisTimeEntry.isCollapsed &&
          (borderWrapper.offsetParent !==
              thisTimeEntry.childrenDomEl.offsetParent)) {
        const errorMessage = [
          'Sorry, an error has occurred, please report to',
          'd.koroliov@gmail.com with steps to reproduce',
        ].join('\n');
        alert(errorMessage);
        throw new Error(errorMessage);
      } else if (noGuaranteeDragIsNotOverOpenChildren()) {
        return null;
      }
      const boundingRect = borderWrapper.getBoundingClientRect();
      const mouseYInElement = e.clientY - boundingRect.y;
      const borderWrapperHeightWoChildrenSection =
        borderWrapper.offsetHeight - thisTimeEntry.childrenDomEl.offsetHeight;
      const rel = mouseYInElement / borderWrapperHeightWoChildrenSection;
      if (rel < 0.3) {
        return 'top';
      } else if (rel > 0.7) {
        return 'bottom';
      } else {
        return 'middle';
      }

      function noGuaranteeDragIsNotOverOpenChildren() {
        //since the interface currently looks this way:
        //
        //  (the x below demonstrates the position of the cursor)
        //  (the | below demonstrates the border of an entry element)
        //
        // | entry 0:
        // | | entry 0-1
        // |x| entry 0-2
        // | | entry 0-3
        //
        //then, when the user drags over a child entry, when the cursor is out
        //of the child entry itself and is over its parent (as on the scheme
        //above), we need to prevent a drop on the parent, since its counter
        //intuitive, ugly etc.
        //
        //If the user wants to insert a dragged element as a sibling of the
        //parent on the scheme, he needs to drag either above the children or
        //below the children
        //
        //If the user wants to drop the element as a sibling of the children,
        //then he will have to drag it to the right, over the children block
        return e.clientX < thisTimeEntry.childrenDomEl.offsetLeft;
      }
    }
  }

  dropHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.timeTracker.entryWithDropAreaCssClasses) {
      const dragged = this.timeTracker.entryBeingDragged;
      dragged.removeFromParent();
      this.timeTracker.entryWithDropAreaCssClasses.handleDroppedEntry(dragged);
    } else {
      return;
    }
  }

  handleDroppedEntry(droppedEntry) {
    if (this.classList.contains(DROP_AREA_CSS_CLASSES.CHILD)) {
      this.addChild(droppedEntry);
    } else {
      const parent = this.parentTimeEntry || this.timeTracker;
      if (this.classList.contains(DROP_AREA_CSS_CLASSES.SIBLING_TOP)) {
        parent.addChild(droppedEntry, 'before', this);
      } else if (this.classList
          .contains(DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM)) {
        parent.addChild(droppedEntry, 'after', this);
      }
    }
  }

  removeFromParent() {
    const timeChange = {
      totalTimeChange: -this.timeSpentTotal,
      billableTimeChange: -this.timeSpentBillable,
    };
    const eventTarget = this.parentTimeEntry || this.timeTracker.shadowRoot;
    this.fireUpdateTimeEvent(eventTarget, timeChange);
    const parent = this.parentTimeEntry || this.timeTracker;
    parent.removeChild(this);
  }

  handleDropArea = handleDropAreaModule

  hideAllDropAreas() {
    this.timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...Object.values(DROP_AREA_CSS_CLASSES));
    this.timeTracker.entryWithDropAreaCssClasses = null;
  }

  generateMessageArr(paddingLevel, useTotalNotOwnTime = false) {
    const pad = '  ';
    const commentLines =
      this.commentText ? this.commentText.split('\n') : [];
    const messageOwn = [
      `${pad.repeat(paddingLevel)}${getTime(this)} ${
          this.titleText.trimEnd()}`,
      ...commentLines.reduce((a, l) => {
        return a.push(`${pad.repeat(paddingLevel + 1)}${l.trimEnd()}`), a;
      }, []),
      `${pad.repeat(paddingLevel)}${'-'.repeat(10)}`,
    ];
    const childMessages = this.childEntries.reduce((a, e) => {
      //recursion is acceptable here, no huge trees are exptected
      return a.push(...e.generateMessageArr(paddingLevel + 1)), a;
    }, []);
    return [
      ...messageOwn,
      ...childMessages,
    ];

    function getTime(that) {
      const ts =
        useTotalNotOwnTime ? that.timeSpentTotal : that.timeSpentOwn;
      const m = Math.ceil(ts / 60000);
      const mRemainder = m % 60;
      const h = (m - mRemainder) / 60;
      return `${h}h ${mRemainder}m`;
    }
  }

  generateMessageHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const messageArr = this.generateMessageArr(0, true);
    removeLastDelimiter();
    const showMessageEvent = new CustomEvent('showmessage', {
      detail: { message: messageArr.join('\n'), },
      bubbles: true,
    });
    this.dispatchEvent(showMessageEvent);

    function removeLastDelimiter() {
      messageArr.pop();
    }
  }

  handleStartStopClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.activeDescendantOrSelf === this) {
      this.disactivate(this);
      const disactivateEvent = new CustomEvent('disactivate', {
        detail: { firedFrom: this, },
        bubbles: true,
      });
      this.dispatchEvent(disactivateEvent);
    } else {
      const entryActiveEvent = new CustomEvent('activate', {
        detail: { isBillable: this.isOwnTimeBillable, },
        bubbles: true,
      });
      this.dispatchEvent(entryActiveEvent);
    }
  }

  handleIsOwnTimeBillableClick(e) {
    e.stopPropagation();
    this.isOwnTimeBillable = !this.isOwnTimeBillable;
    const billableTimeChange = this.isOwnTimeBillable ?
      this.timeSpentOwn : -this.timeSpentOwn;
    const ev = new CustomEvent('is-billable-changed', {
      detail: {
        isBillable: this.isOwnTimeBillable,
        billableTimeChange,
      },
      bubbles: true,
    });
    this.dispatchEvent(ev);
  }

  updateTimeText() {
    this.querySelector('.total-value').innerText =
        this.convertTimeToText(this.timeSpentTotal);
    this.querySelector('.own-value > div').innerText =
        this.convertTimeToText(this.timeSpentOwn);
    this.querySelector('.billable-value').innerText =
        this.convertTimeToText(this.timeSpentBillable);
    const billablePercent = this.timeSpentTotal ?
        Math.floor(this.timeSpentBillable / this.timeSpentTotal * 100) : 0;
    this.querySelector('.billable-percent').innerText =
        `${billablePercent}%`;
  }

  initData(data) {
    super.initData(data);
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
    this.titleText = data?.titleText || 'SB-xxxx';
    this.commentText = data?.commentText || '';
    this.commentInternalText = data?.commentInternalText || '';

    this.timeSpentOwn = data?.timeSpentOwn || 0;
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
  }

  initDomElementReferences(timeTracker, parentTimeEntry) {
    this.timeTracker = timeTracker;
    this.parentTimeEntry = parentTimeEntry;
    this.childrenDomEl = this.querySelector('.children');
    this.dragEl = this.querySelector('.drag-n-drop');
    this.mouseDownOnEl = null;
  }

  initSelfDom(templateId) {
    const templateContent =
      document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.setAttribute('draggable', 'true');
    this.appendChild(clone);
    this.handleChildEntriesVisibility();
    this.querySelector('.title').innerText = this.titleText;
    this.querySelector('.comment .public').innerText = this.commentText;
    this.querySelector('.comment .internal').innerText =
        this.commentInternalText;
    this.querySelector('.is-own-time-billable input').checked =
        this.isOwnTimeBillable;
  }

  addNewTimeEntry(e) {
    super.addNewTimeEntry(e, this.timeTracker);
  }
}
window.customElements.define('time-entry', TimeEntry);

module.exports = TimeEntry;

},{"./base.js":1,"./handle-drop-area.js":2}],5:[function(require,module,exports){
'use strict';
const Base = require('./base.js');
//Need to require TimeEntry first, just in order for it to register the custom
//element time-entry, so that Base could get it, when methods on its prototype
//call it
const TimeEntry = require('./time-entry.js');

class TimeTracker extends Base {
  constructor(data, initFunc) {
    data.templateId = 'time-tracker';
    super();
    this.#initFunc = initFunc;
    this.initData(data);
    this.initAuxProperties();
    this.initSelfDom(data.templateId);
    this.initDomElementReferences();
    this.initChildEntries(data.childEntries, this);
    this.addListeners();
    this.setFaviconData();
    this.favIconData.favIcon
      .setAttribute('href', this.favIconData.inactiveHref);
  }

  #initFunc

  initDomElementReferences() {
    this.childrenDomEl = this.shadowRoot.querySelector('.children');
  }

  initAuxProperties() {
    this.entryBeingDragged = null;
    this.entryWithDropAreaCssClasses = null;
  }

  destroy() {
    if (this.activeDescendantOrSelf) {
      const disactivateEvent = new CustomEvent('disactivate', {
        detail: { firedFrom: this, },
        bubbles: true,
      });
      this.activeDescendantOrSelf.dispatchEvent(disactivateEvent);
    }
    this.remove();
  }

  handleIsBillableChanged(e) {
    super.handleIsBillableChanged(e);
    if (this.activeDescendantOrSelf) {
      this.setBillableFavicon();
    }
  }

  setBillableFavicon() {
    const fi = this.isCountBillable ? this.favIconData.activeBillableHref :
      this.favIconData.activeNotBillableHref;
    this.favIconData.favIcon
      .setAttribute('href', fi);
  }

  handleEntryActiveChangedEvent(e) {
    super.handleEntryActiveChangedEvent(e);
    this.setBillableFavicon();
  }

  #propertiesNotToIncludeInJson = new Set([
    'activeDescendantOrSelf',
    'timeTracker',
    'parentTimeEntry',
    'entryBeingDragged',
    'favIconData',
    'percentBillableTargetDefault',
    'timeTotalTargetDefault',
    'mouseDownOnEl',
    'entryWithDropAreaCssClasses',
    'intervalId',
    'dragEl',
    'countUpdatedAt',
    'childrenDomEl',
  ])

  toString() {
    return JSON.stringify(this, (key, val) => {
      if (this.#propertiesNotToIncludeInJson.has(key)) {
        return;
      } else {
        return val;
      }
    });
  }

  initData(data) {
    super.initData(data);
    this.version = data.version;
    this.percentBillableTargetDefault = 100;
    this.percentBillableTarget = data?.percentBillableTarget ||
      this.percentBillableTargetDefault;
    this.timeTotalTargetDefault =  5 * 8 * 3600000;
    this.timeTotalTarget = data?.timeTotalTarget ||
      this.timeTotalTargetDefault;
    this.dateCreated = data?.dateCreated || this.getNewDateCreatedValue();
  }

  getNewDateCreatedValue() {
    const days = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', ];
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getDate(),
      days[d.getDay()],
    ].join('-');
  }

  addListeners() {
    super.addListeners(this.shadowRoot);
    this.shadowRoot.querySelector('.clear')
        .addEventListener('click', this.clear.bind(this));
    this.shadowRoot.querySelector('.percent-target')
        .addEventListener('blur', this.handleTargetPercentChange.bind(this));
    this.shadowRoot.querySelector('.abs-target')
        .addEventListener('blur', this.handleTargetValueChange.bind(this));
    this.shadowRoot.querySelector('.import')
        .addEventListener('click', this.initiateImport.bind(this));
    this.shadowRoot.querySelector('.import-input')
        .addEventListener('input', this.handleImport.bind(this));
    this.shadowRoot.querySelector('.export')
        .addEventListener('click', this.handleExport.bind(this));
    this.shadowRoot.querySelector('#time-tracker')
        .addEventListener('showmessage', this.showMessageHander.bind(this));
    this.shadowRoot.querySelector('#message')
        .addEventListener('blur', this.hideMessageHander.bind(this));
  }

  async hideMessageHander(e) {
    e.stopPropagation();
    e.target.style.display = 'none';
    e.target.value = '';
  }

  async showMessageHander(e) {
    e.stopPropagation();
    const textArea = this.shadowRoot.querySelector('#message');
    textArea.value = e.detail.message;
    textArea.style.display = 'block';
    textArea.focus();
    textArea.select();
  }

  async handleExport(e) {
    e.preventDefault();
    e.stopPropagation();
    const json = this.toString();
    const l = this.shadowRoot.querySelector('.export-link');
    l.download = `time-tracker-${this.dateCreated}.json`;
    const blob = new Blob([json], {type: 'text/json',});
    l.href = window.URL.createObjectURL(blob);
    l.click();
  }

  async handleImport(e) {
    e.preventDefault();
    e.stopPropagation();
    const json = await e.target.files[0].text();
    e.target.value = '';
    this.#initFunc.call(undefined, json);
  }

  initiateImport(e) {
    e.preventDefault();
    e.stopPropagation();
    return Promise.resolve().then(() => {
      const message = [
        'You are about to import a previously exported JSON file',
        'Have you exported a backup copy?',
        'In case of success, your current data will get overwritten and',
        'lost. In case of an error, your current data may get lost',
      ].join('\n');
      if (!window.confirm(message)) {
        return;
      }
      this.shadowRoot.querySelector('.import-input').click();
    });
  }

  handleTargetValueChange(e) {
    const r = /^(\d{1,}d)\s(\d{1}h)\s(\d{1,2}m)\s(\d{1,2}s)$/;
    const match = e.target.innerText.match(r);
    let isValid = true;
    if (!match) {
      alert('Invalid value, format must be Nd (0-7)h (0-59)m (0-59)s');
    } else {
      const d = parseInt(match[1]);
      const h = parseInt(match[2]);
      if (h > 7) {
        alert('Invalid value, hours must be in range [0-7]');
        isValid = false;
      }
      const m = parseInt(match[3]);
      if (m > 59) {
        alert('Invalid value, minutes must be in range [0-59]');
        isValid = false;
      }
      const s = parseInt(match[4]);
      if (s > 59) {
        alert('Invalid value, seconds must be in range [0-59]');
        isValid = false;
      }
      if (isValid) {
        const value = (((d * 8 + h) * 60 + m) * 60 + s) * 1000;
        this.timeTotalTarget = value;
      }
    }
    this.updateTargetText();
    this.updateTimeText();
  }

  handleTargetPercentChange(e) {
    const match = e.target.innerText.match(/^(1?\d{1,2})\s*%$/);
    if (!match) {
      alert('Invalid value, format must be 0-100%');
    } else {
      const percent = Number(match[1]);
      if (percent >= 0 && percent <= 100) {
        this.percentBillableTarget = percent;
      } else {
        alert('Invalid value, format must be 0-100%');
      }
    }
    this.updateTargetText();
    this.updateTimeText();
  }

  clear(e) {
    e.preventDefault();
    e.stopPropagation();
    return Promise.resolve().then(() => {
      if (!window.confirm('Are you sure?')) {
        return;
      }
      this.timeSpentTotal = 0;
      this.timeSpentBillable = 0;
      this.timeTotalTarget = this.timeTotalTargetDefault;
      this.percentBillableTarget = this.percentBillableTargetDefault;
      this.childEntries = [];
      this.childrenDomEl.innerHTML = '';
      this.setCollapseOpenLink(this.shadowRoot);
      this.stopCount();
      this.updateTargetText();
      this.updateTimeText();
      this.dateCreated = this.getNewDateCreatedValue();
    });
  }

  addNewTimeEntry(e) {
    super.addNewTimeEntry(e, this);
  }

  initSelfDom(templateId) {
    this.attachShadow({mode: 'open',});
    const templateContent =
      document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.shadowRoot.appendChild(clone);
    this.handleChildEntriesVisibility();
    this.updateTargetText();
    this.updateTimeText();
    showVersionNumer(this);

    function showVersionNumer(that) {
      const el = that.shadowRoot.querySelector('h1 .version');
      el.innerText = `v. ${that.version.join('.')}`;
    }
  }

  updateTargetText() {
    this.shadowRoot.querySelector('.abs-target').innerText =
      this.convertTimeToText(this.timeTotalTarget);
    this.shadowRoot.querySelector('.percent-target').innerText =
      this.percentBillableTarget + '%';
  }

  updateTimeText() {
    this.shadowRoot.querySelector('.total.value').innerText =
      this.convertTimeToText(this.timeSpentTotal);
    this.shadowRoot.querySelector('.billable.value').innerText =
      this.convertTimeToText(this.timeSpentBillable);
    const percentCurrent = this.timeSpentTotal ?
      Math.floor(this.timeSpentBillable / this.timeSpentTotal * 100) : 0;
    this.shadowRoot.querySelector('.billable.percent-current').innerText =
      `${percentCurrent}%`;
    const percentTarget =
      calculatePercentTotalBillableSpentToTotalBillableTarget(this);
    this.shadowRoot.querySelector('.billable.percent-target').innerText =
      `${percentTarget}%`;

    function calculatePercentTotalBillableSpentToTotalBillableTarget(that) {
      if (!that.percentBillableTarget || !that.timeTotalTarget) {
        return 0;
      }
      return Math.floor((that.timeSpentBillable /
        (that.percentBillableTarget / 100 * that.timeTotalTarget)) * 100
      );
    }
  }

  handleActivateEvent(e) {
    super.handleActivateEvent(e);
    if (this.isCountBillable) {
      this.favIconData.favIcon
        .setAttribute('href', this.favIconData.activeBillableHref);
    } else {
      this.favIconData.favIcon
        .setAttribute('href', this.favIconData.activeNotBillableHref);
    }
  }

  handleDisactivateEvent(e) {
    super.handleDisactivateEvent(e);
    this.favIconData.favIcon
      .setAttribute('href', this.favIconData.inactiveHref);
  }

  setFaviconData() {
    const o = Object.create(null);
    o.activeBillableHref =
      document.querySelector('#green-circle').innerHTML;
    o.activeNotBillableHref =
      document.querySelector('#red-circle').innerHTML;
    o.inactiveHref = document.querySelector('#grey-circle').innerHTML;
    o.favIcon = document.querySelector('#favicon');
    this.favIconData = o;
  }
}
window.customElements.define('time-tracker', TimeTracker);

module.exports = TimeTracker;

},{"./base.js":1,"./time-entry.js":4}]},{},[3]);
