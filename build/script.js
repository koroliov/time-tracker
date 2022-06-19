'use stirct';
class Base extends HTMLElement {
  constructor(data) {
    super();
  }
}

class TimeTracker extends Base {
  constructor(data) {
    data.templateId = 'time-tracker';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId, data.childEntries);
    this.initChildEntries(data.childEntries);
    this.addListeners();
  }

  addListeners() {
    this.shadowRoot.querySelector('.controls')
      .addEventListener('click', this.addNewTimeEntry.bind(this));
  }

  addNewTimeEntry() {
    const te = new TimeEntry(Object.create(null));
    this.childEntries.push(te);
    this.shadowRoot.querySelector('.children').appendChild(te);;
    this.shadowRoot.querySelector('.controls .collapse-open')
      .innerText = `Collapse (${this.childEntries.length})`;
  }

  initData(data) {
    this.timeStarted = data?.timeStarted || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.activeChildIndex = -1;
    this.intervalId = 0;
    this.isActive = false;
  }

  initSelfDom(templateId) {
    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.shadowRoot.appendChild(clone);
  }

  initChildEntries(childEntries = []) {
    this.childEntries = childEntries.reduce((a, c) => {
      const te = new TimeEntry(c);
      this.shadowRoot.querySelector('.children').appendChild(te);
      return a.push(te), a;
    }, []);
  }
}
window.customElements.define('time-tracker', TimeTracker);

class TimeEntry extends Base {
  constructor(data, parentNode) {
    data.templateId = 'time-entry';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId, parentNode);
    this.initChildEntries(data.childEntries);
  }

  initData(data) {
    this.timeStarted = data?.timeStarted || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
    this.activeChildIndex = -1;
    this.intervalId = 0;
    this.isActive = false;
  }

  initSelfDom(templateId) {
    const templateContent = document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.appendChild(clone);
  }

  initChildEntries(childEntries = []) {
    this.childEntries = childEntries.reduce((a, c) => {
      const te = new TimeEntry(c);
      this.shadowRoot.querySelector('.children').appendChild(te);
      return a.push(te), a;
    }, []);
  }
}
window.customElements.define('time-entry', TimeEntry);

init();

function init() {
  const data = JSON.parse(localStorage.getItem('time-tracker')) ||
    Object.create(null);
  document.body.appendChild(new TimeTracker(data));

  window.addEventListener('beforeunload', function() {
    const tt = this.document.querySelector('time-tracker');
    const value = JSON.stringify(tt);
    this.localStorage.clear();
    //if (value) {
    //  localStorage.setItem('time-tracker', value);
    //} else {
    //  this.localStorage.clear();
    //}
  });
}
