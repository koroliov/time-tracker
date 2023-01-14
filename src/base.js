'use strict';
class Base extends HTMLElement {
  constructor() {
    super();
  }

  addListeners(timeTrackerShadowRootOrTimeEntry) {
    timeTrackerShadowRootOrTimeEntry.querySelector('.controls .new-entry')
      .addEventListener('click', this.addNewTimeEntry.bind(this));
    timeTrackerShadowRootOrTimeEntry
        .querySelector('.controls .collapse-open').addEventListener('click',
            this.toggleChildEntriesVisible.bind(this));
    timeTrackerShadowRootOrTimeEntry
        .addEventListener('activate', this.handleActivateEvent.bind(this));
    timeTrackerShadowRootOrTimeEntry
        .addEventListener('active-entry-changed',
            this.handleEntryActiveChangedEvent.bind(this));
    timeTrackerShadowRootOrTimeEntry.addEventListener('disactivate',
        this.handleDisactivateEvent.bind(this));
    timeTrackerShadowRootOrTimeEntry.addEventListener('is-billable-changed',
        this.handleIsBillableChanged.bind(this));
  }

  handleIsBillableChanged(e) {
    if (e.target === this.activeChildOrSelf) {
      this.isCountBillable = e.detail.isBillable;
    }
    this.timeSpentBillable += e.detail.billableTimeChange;
    this.updateTimeText();
  }

  handleActivateEvent(e) {
    if (e.target === this) {
      this.handleWhenActiveItself();
    }
    this.isCountBillable = e.detail.isBillable;
    if (this.activeChildOrSelf) {
      if (this.activeChildOrSelf !== this) {
        this.fireDisactivateEventToCurrentlyActiveEntry();
      }
      this.fireActiveEntryChangedEvent(e.target);
      e.stopPropagation();
    }
    this.activeChildOrSelf = e.target;
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
    this.activeChildOrSelf.dispatchEvent(disactivateEvent);
  }

  handleWhenInactiveItself() {
    this.querySelector('.start-stop').innerText = 'Start';
    this.classList.remove('is-active');
  }

  handleEntryActiveChangedEvent(e) {
    if (this.activeChildOrSelf === this) {
      this.handleWhenInactiveItself();
    }
    this.isCountBillable = e.detail.activeEntry.isOwnTimeBillable;
    this.activeChildOrSelf = e.detail.activeEntry;
  }

  disactivate(evTarget) {
    if (evTarget === this) {
      this.handleWhenInactiveItself();
    }
    this.activeChildOrSelf = null;
    this.isCountBillable = false;
    this.stopCount();
  }

  handleDisactivateEvent(e) {
    if (e.detail.firedFrom === this) {
      if (this.activeChildOrSelf) {
        e.stopPropagation();
      }
    } else {
      this.disactivate(e.target);
    }
  }

  toggleChildEntriesVisible(e) {
    e.preventDefault();
    e.stopPropagation();
    this.isCollapsed = !this.isCollapsed;
    this.handleChildEntriesVisibility();
  }

  initChildEntries(childEntries = [], timeTrackerShadowRootOrTimeEntry,
      timeTracker, parentTimeEntry) {
    //This will be a recursive call, but it's acceptable, since no huge data
    //structures are expected
    const TimeEntry = window.customElements.get('time-entry');
    this.childEntries = childEntries.map((c) => {
      const te = new TimeEntry(c, timeTracker, parentTimeEntry);
      timeTrackerShadowRootOrTimeEntry
          .querySelector('.children').appendChild(te);
      return te;
    });
    this.setCollapseOpenLink(timeTrackerShadowRootOrTimeEntry);
  }

  addNewTimeEntry(e, timeTrackerShadowRootOrTimeEntry, timeTracker,
      parentTimeEntry) {
    e.preventDefault();
    e.stopPropagation();
    const TimeEntry = window.customElements.get('time-entry');
    const te =
        new TimeEntry(Object.create(null), timeTracker, parentTimeEntry);
    this.childEntries.push(te);
    this.isCollapsed = false;
    addWhiteBlackClass(this);
    this.handleChildEntriesVisibility();
    this.setCollapseOpenLink(timeTrackerShadowRootOrTimeEntry);
    timeTrackerShadowRootOrTimeEntry
        .querySelector('.children').appendChild(te);

    function addWhiteBlackClass(that) {
      if (isFirstBlackWhite()) {
        addClass('black-white', 'white-black');
      } else {
        addClass('white-black', 'black-white');
      }

      function isFirstBlackWhite() {
        return isTimeTracker() || timeTrackerShadowRootOrTimeEntry
            .classList.contains('black-white');

        function isTimeTracker() {
          return !timeTrackerShadowRootOrTimeEntry.classList;
        }
      }

      function addClass(classEven, classOdd) {
        if (nextChildIsOdd()) {
          te.classList.add(classOdd);
          te.classesToPreserve.push(classOdd);
        } else {
          te.classList.add(classEven);
          te.classesToPreserve.push(classEven);
        }
      }

      function nextChildIsOdd() {
        return that.childEntries.length % 2;
      }
    }
  }

  setCollapseOpenLink(timeTrackerShadowRootOrTimeEntry) {
    const collapseOpenLink = timeTrackerShadowRootOrTimeEntry
        .querySelector('.controls .collapse-open');
    if (this.isCollapsed) {
      collapseOpenLink.innerText = `Open (${this.childEntries.length})`;
    } else {
      collapseOpenLink.innerText = `Collapse (${this.childEntries.length})`;
    }
  }

  handleChildEntriesVisibility(timeTrackerShadowRootOrTimeEntry) {
    const collapseOpenLink = timeTrackerShadowRootOrTimeEntry
        .querySelector('.controls .collapse-open');
    const childEntriesWrapper = timeTrackerShadowRootOrTimeEntry
        .querySelector('.children');
    if (this.isCollapsed) {
      collapseOpenLink.innerText = `Open (${this.childEntries.length})`;
      childEntriesWrapper.style.display = 'none';
    } else {
      collapseOpenLink.innerText = `Collapse (${this.childEntries.length})`;
      childEntriesWrapper.style.display = 'block';
    }
  }

  initData(data) {
    this.countUpdatedAt = data?.countUpdatedAt || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.intervalId = 0;
    this.isCountBillable = data?.isCountBillable || false;

    this.isCollapsed = data?.isCollapsed || false;
    this.childEntries = [];
    this.activeChildOrSelf = null;
  }

  stopCount() {
    clearInterval(this.intervalId);
    this.intervalId = 0;
  }

  startCount() {
    this.countUpdatedAt = Date.now();
    this.intervalId = setInterval(this.updateTime.bind(this), 1000);
  }

  updateTime() {
    const now = Date.now();
    const timeSpentCurrent = now - this.countUpdatedAt;
    this.countUpdatedAt = now;
    if (this.activeChildOrSelf === this) {
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
