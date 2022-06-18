'use stirct';
class Base extends HTMLElement {
  constructor(data) {
    super();
  }
}

class TimeTracker extends Base {
  constructor(data = Object.create(null)) {
    data.templateId = 'time-tracker';
    super();
    this.initData(data);
    this.initDom(data.templateId);
  }

  initData(data) {
    this.timeStarted = data?.timeStarted || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.intervalId = 0;
    this.isActive = false;
  }

  initDom(templateId) {
    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.shadowRoot.appendChild(clone);
  }
}
window.customElements.define('time-tracker', TimeTracker);

class TimeEntry extends Base {
  constructor(data = Object.create(null)) {
    data.templateId = 'time-entry';
    super();
    this.initData(data);
    this.initDom(data.templateId);
  }

  initData(data) {
    this.timeStarted = data?.timeStarted || 0;
    this.timeSpentTotal = data?.timeSpentTotal || 0;
    this.timeSpentBillable = data?.timeSpentBillable || 0;
    this.intervalId = 0;
    this.isActive = false;
    this.isOwnTimeBillable = data?.isOwnTimeBillable || false;
  }

  initDom(templateId, parentNode) {
    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    parentNode.appendChild(clone);
  }
}
window.customElements.define('time-entry', TimeEntry);

init();

function init() {
  document.body.appendChild(
    new TimeTracker(JSON.parse(localStorage.getItem('time-tracker'))));

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
