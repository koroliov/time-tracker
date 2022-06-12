'use stirct';
class Base extends HTMLElement {
  constructor(data) {
    super();
    const requiredTime = 5 * 8 * 60 * 60000;
    this.childTimeEntries = [];

    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${data.templateId}`)
      .content;
    const toInsertContents = templateContent.cloneNode(true);
    const childrenWrapper = document.createElement('div');
    childrenWrapper.setAttribute('id', 'children');
    toInsertContents.querySelector('#wrapper').appendChild(childrenWrapper);

    toInsertContents.querySelector('#new-entry')
      .addEventListener('click', function() {
        const entry = new TimeEntry();
        if (childrenWrapper.children.length % 2) {
          entry.shadowRoot.querySelector('#wrapper').classList.add('even');
        }

        childrenWrapper.appendChild(entry);
        this.childTimeEntries.push(entry);
      }.bind(this));
    this.shadowRoot.appendChild(toInsertContents);
  }
}

class TimeTracker extends Base {
  constructor(data = {}) {
    data.templateId = 'time-tracker';
    super(data);
  }
}
window.customElements.define('time-tracker', TimeTracker);

class TimeEntry extends Base {
  constructor(data = {}) {
    data.templateId = 'time-entry';
    super(data);
  }
}
window.customElements.define('time-entry', TimeEntry);

init();

function init() {
  const entriesStr = localStorage.getItem('entries');
  if (entriesStr) {
  } else {
    const tt = new TimeTracker();
    document.body.appendChild(tt);
  }
}

