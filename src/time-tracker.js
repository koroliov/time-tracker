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
    this.initChildEntries(data.childEntries, this);
    this.addListeners();
    this.setFaviconData();
    this.favIconData.favIcon
      .setAttribute('href', this.favIconData.inactiveHref);
  }

  #initFunc

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
    return new Date().toDateString().toLowerCase().replace(/\s+/g, '-');
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
      this.shadowRoot.querySelector('.children').innerHTML = '';
      this.setCollapseOpenLink(this.shadowRoot);
      this.stopCount();
      this.updateTargetText();
      this.updateTimeText();
      this.dateCreated = this.getNewDateCreatedValue();
    });
  }

  handleChildEntriesVisibility() {
    super.handleChildEntriesVisibility(this.shadowRoot);
  }

  addNewTimeEntry(e) {
    super.addNewTimeEntry(e, this.shadowRoot, this, null);
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
