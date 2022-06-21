'use stirct';
//Base class
class Base extends HTMLElement {
  constructor() {
    super();
  }

  addListeners(node) {
    node.querySelector('.controls .new-entry')
      .addEventListener('click', this.addNewTimeEntry.bind(this));
    node.querySelector('.controls .collapse-open')
      .addEventListener('click', this.toggleChildEntriesVisible.bind(this));
    node.addEventListener('entry-active',
      this.handleEntryActive.bind(this));
    node.addEventListener('entry-inactive',
      this.handleEntryInactive.bind(this));
  }

  handleEntryActive(e) {
    if (e.target === this) {
      this.isActiveItself = true;
      this.classList.add('is-active');
      this.isCountBillable = this.isOwnTimeBillable;
      this.querySelector('.start-stop').innerText = 'Stop';
    } else {
      this.isCountBillable = e.detail.isBillable;
    }
    if (this.activeEntry) {
      const entryInactiveEvent = new CustomEvent('entry-inactive', {
        detail: { firedFrom: this, },
        bubbles: true,
      });
      this.activeEntry.dispatchEvent(entryInactiveEvent);
    }
    this.activeEntry = e.target;
    this.stopCount();
    this.startCount();
  }

  handleEntryInactive(e) {
    if (e.target === this) {
      this.querySelector('.start-stop').innerText = 'Start';
      this.isActiveItself = false;
      this.classList.remove('is-active');
    } else if (e.detail.firedFrom === this) {
      e.stopPropagation();
      return;
    }
    this.activeEntry = null;
    this.isCountBillable = false;
    this.stopCount();
  }

  toggleChildEntriesVisible(e) {
    e.preventDefault();
    e.stopPropagation();
    this.isCollapsed = !this.isCollapsed;
    this.handleChildEntriesVisibility();
  }

  initChildEntries(childEntries = [], node) {
    //This will be a recursive call, but it's acceptable, since no huge data
    //structures are expected
    this.childEntries = childEntries.reduce((a, c) => {
      const te = new TimeEntry(c);
      node.querySelector('.children').appendChild(te);
      return a.push(te), a;
    }, []);
    this.setCollapseOpenLink(node);
  }

  addNewTimeEntry(e, node) {
    e.preventDefault();
    e.stopPropagation();
    const te = new TimeEntry(Object.create(null));
    this.childEntries.push(te);
    this.isCollapsed = false;
    this.handleChildEntriesVisibility();
    this.setCollapseOpenLink(node);
    node.querySelector('.children').appendChild(te);
  }

  setCollapseOpenLink(node) {
    const collapseOpenLink = node.querySelector('.controls .collapse-open');
    if (this.isCollapsed) {
      collapseOpenLink.innerText = `Open (${this.childEntries.length})`;
    } else {
      collapseOpenLink.innerText = `Collapse (${this.childEntries.length})`;
    }
  }

  handleChildEntriesVisibility(node) {
    const collapseOpenLink = node.querySelector('.controls .collapse-open');
    const childEntriesWrapper = node.querySelector('.children');
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
    this.isCountBillable = false;

    this.isCollapsed = data?.isCollapsed || false;
    this.activeChildIndex = -1;
    this.childEntries = [];
    this.isActiveItself = false;
    this.activeEntry = null;
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
    if (this.isActiveItself) {
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

//Time Tracker class
class TimeTracker extends Base {
  constructor(data) {
    data.templateId = 'time-tracker';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId, data.childEntries);
    this.initChildEntries(data.childEntries, this.shadowRoot);
    this.addListeners();
  }

  toString() {
    if (this.activeEntry) {
      const entryInactiveEvent = new CustomEvent('entry-inactive', {
        detail: { firedFrom: this, },
        bubbles: true,
      });
      this.activeEntry.dispatchEvent(entryInactiveEvent);
    }
    return JSON.stringify(this);
  }

  initData(data) {
    super.initData(data);
    this.percentBillableTarget = data?.percentBillableTarget || 50;
    this.timeTotalTarget = data?.timeTotalTarget || 5 * 8 * 3600000;
  }

  addListeners() {
    super.addListeners(this.shadowRoot);
    this.shadowRoot.querySelector('.clear')
      .addEventListener('click', this.removeAllEntries.bind(this));
  }

  removeAllEntries(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure?')) {
      return;
    }
    this.timeSpentTotal = 0;
    this.timeSpentBillable = 0;
    this.childEntries = [];
    this.shadowRoot.querySelector('.children').innerHTML = '';
    this.setCollapseOpenLink(this.shadowRoot);
  }

  handleChildEntriesVisibility() {
    super.handleChildEntriesVisibility(this.shadowRoot);
  }

  addNewTimeEntry(e) {
    super.addNewTimeEntry(e, this.shadowRoot);
  }

  initSelfDom(templateId) {
    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.shadowRoot.appendChild(clone);
    this.handleChildEntriesVisibility();
  }

  updateTimeText() {
    this.shadowRoot.querySelector('.total.value').innerText =
      this.convertTimeToText(this.timeSpentTotal);
    this.shadowRoot.querySelector('.billable.value').innerText =
      this.convertTimeToText(this.timeSpentBillable);
    const percentCurrent =
      Math.floor(this.timeSpentBillable / this.timeSpentTotal * 100);
    this.shadowRoot.querySelector('.billable.percent-current').innerText =
      `${percentCurrent}%`;
    const percentTarget =
      Math.floor(percentCurrent / this.percentBillableTarget);
    this.shadowRoot.querySelector('.billable.percent-target').innerText =
      `${percentTarget}%`;
  }
}
window.customElements.define('time-tracker', TimeTracker);

//Time Entry class
class TimeEntry extends Base {
  constructor(data, parentNode) {
    data.templateId = 'time-entry';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId, parentNode);
    this.initChildEntries(data.childEntries, this);
    this.addListeners();
    this.updateTimeText();
  }

  addListeners() {
    super.addListeners(this);
    this.querySelector('.title')
      .addEventListener('blur', e => this.titleText = e.target.innerText);
    this.querySelector('.comment')
      .addEventListener('blur', e => this.commentText = e.target.innerText);
    this.querySelector('.is-own-time-billable input').addEventListener('change',
      this.handleIsOwnTimeBillableChange.bind(this));
    this.querySelector('.is-own-time-billable input').addEventListener('click',
      this.handleIsOwnTimeBillableClick.bind(this));
    this.querySelector('.start-stop')
      .addEventListener('click', this.handleStartStopClick.bind(this));
  }

  handleStartStopClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.isActiveItself) {
      const entryInactiveEvent = new CustomEvent('entry-inactive', {
        detail: { firedFrom: this, },
        bubbles: true,
      });
      this.dispatchEvent(entryInactiveEvent);
    } else {
      const entryActiveEvent = new CustomEvent('entry-active', {
        detail: {isBillable: this.isOwnTimeBillable},
        bubbles: true,
      });
      this.dispatchEvent(entryActiveEvent);
    }
  }

  handleIsOwnTimeBillableClick(e) {
    if (window.confirm('Are you sure?') && window.confirm('Repeat')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }

  handleIsOwnTimeBillableChange(e) {
    this.isOwnTimeBillable = e.target.checked;
    if (this.isOwnTimeBillable) {
      this.timeSpentBillable += this.timeSpentOwn;
    } else {
      this.timeSpentBillable -= this.timeSpentOwn;
    }
    if (this.isActiveItself) {
      this.isCountBillable = this.isOwnTimeBillable;
    }
    this.updateTimeText();
  }

  updateTimeText() {
    this.querySelector('.total-value').innerText =
      this.convertTimeToText(this.timeSpentTotal);
    this.querySelector('.own-value > div').innerText =
      this.convertTimeToText(this.timeSpentOwn);
    this.querySelector('.billable-value').innerText =
      this.convertTimeToText(this.timeSpentBillable);
    const billablePercent = this.timeSpentTotal ?
      Math.floor(this.timeSpentBillable / this.timeSpentTotal * 100) :
      0;
    this.querySelector('.billable-percent').innerText = `${billablePercent}%`;
  }

  handleChildEntriesVisibility() {
    super.handleChildEntriesVisibility(this);
  }

  initData(data) {
    super.initData(data);
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
    this.titleText = data?.titleText || 'SB-xxxx';
    this.commentText = data?.commentText || '';

    this.timeSpentOwn = data?.timeSpentOwn || 0;
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
    this.isActiveItself = false;
  }

  initSelfDom(templateId) {
    const templateContent = document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.appendChild(clone);
    this.handleChildEntriesVisibility();
    this.querySelector('.title').innerText = this.titleText;
    this.querySelector('.comment').innerText = this.commentText;
    this.querySelector('.is-own-time-billable input').checked =
      this.isOwnTimeBillable;
  }

  addNewTimeEntry(e) {
    super.addNewTimeEntry(e, this);
  }
}
window.customElements.define('time-entry', TimeEntry);

init();

function init() {
  let data = Object.create(null);
  try {
    data = JSON.parse(localStorage.getItem('time-tracker')) || data;
  } catch(e) {}
  document.body.appendChild(new TimeTracker(data));

  window.addEventListener('beforeunload', function() {
    const tt = this.document.querySelector('time-tracker');
    if (tt) {
      localStorage.setItem('time-tracker', tt);
    } else {
      this.localStorage.clear();
    }
  });
}
