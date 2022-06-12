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
      .addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const entry = new TimeEntry();
        if (childrenWrapper.children.length % 2) {
          entry.shadowRoot.querySelector('#wrapper').classList.add('even');
        }

        childrenWrapper.appendChild(entry);
        this.childTimeEntries.push(entry);
      }.bind(this));
    this.shadowRoot.appendChild(toInsertContents);

    this.areChildrenOpen = data.areChildrenOpen === false ? false : true;
    childrenWrapper.style.display = this.areChildrenOpen ? 'block' : 'none';
    this.shadowRoot.querySelector('#collapse-open')
      .addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const childrenWrapper = this.shadowRoot.querySelector('#children');
        if (this.areChildrenOpen) {
          e.target.innerHTML = 'Open';
          childrenWrapper.style.display = 'none';
        } else {
          e.target.innerHTML = 'Collapse';
          childrenWrapper.style.display = 'block';
        }
        this.areChildrenOpen = !this.areChildrenOpen;
      }.bind(this));
  }
}

class TimeTracker extends Base {
  constructor(data = Object.create(null)) {
    data.templateId = 'time-tracker';
    super(data);
  }
}
window.customElements.define('time-tracker', TimeTracker);

class TimeEntry extends Base {
  constructor(data = Object.create(null)) {
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

