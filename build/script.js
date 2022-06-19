'use stirct';
class Base extends HTMLElement {
  constructor(data) {
    super();
  }

  addListeners(node) {
    node.querySelector('.controls .new-entry')
      .addEventListener('click', this.addNewTimeEntry.bind(this));
    node.querySelector('.controls .collapse-open')
      .addEventListener('click', this.toggleChildEntriesVisible.bind(this));
  }

  toggleChildEntriesVisible(e) {
    e.preventDefault();
    e.stopPropagation();
    this.isCollapsed = !this.isCollapsed;
    this.handleChildEntriesVisibility();
  }

  initChildEntries(childEntries = [], node) {
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
    this.timeStarted = data?.timeStarted || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.isCollapsed = data?.isCollapsed || false;
    this.activeChildIndex = -1;
    this.childEntries = [];
    this.intervalId = 0;
    this.isActive = false;
  }
}

class TimeTracker extends Base {
  constructor(data) {
    data.templateId = 'time-tracker';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId, data.childEntries);
    this.initChildEntries(data.childEntries, this.shadowRoot);
    this.addListeners();
  }

  addListeners() {
    super.addListeners(this.shadowRoot);
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
}
window.customElements.define('time-tracker', TimeTracker);

class TimeEntry extends Base {
  constructor(data, parentNode) {
    data.templateId = 'time-entry';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId, parentNode);
    this.initChildEntries(data.childEntries, this);
    this.addListeners();
  }

  addListeners() {
    super.addListeners(this);
    this.querySelector('.title')
      .addEventListener('blur', e => this.titleText = e.target.innerText);
    this.querySelector('.comment')
      .addEventListener('blur', e => this.commentText = e.target.innerText);
    this.querySelector('.is-own-time-billable input').addEventListener('change',
      e => this.isOwnTimeBillable = e.target.checked);
  }

  handleChildEntriesVisibility() {
    super.handleChildEntriesVisibility(this);
  }

  initData(data) {
    super.initData(data);
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
    this.titleText = data?.titleText || 'SB-xxxx';
    this.commentText = data?.commentText || '';
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
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
  const data = JSON.parse(localStorage.getItem('time-tracker')) ||
    Object.create(null);
  document.body.appendChild(new TimeTracker(data));

  window.addEventListener('beforeunload', function() {
    const tt = this.document.querySelector('time-tracker');
    const value = JSON.stringify(tt);
    if (value) {
      localStorage.setItem('time-tracker', value);
    } else {
      this.localStorage.clear();
    }
  });
}
