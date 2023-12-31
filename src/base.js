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
