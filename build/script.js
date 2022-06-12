'use stirct';
class Base extends HTMLElement {
  constructor(data) {
    super();
    const requiredTime = 5 * 8 * 60 * 60000;

    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${data.templateId}`)
      .content;
    const toInsertContents = templateContent.cloneNode(true);
    const childrenWrapper = document.createElement('div');
    childrenWrapper.setAttribute('id', 'children');
    toInsertContents.querySelector('#wrapper').appendChild(childrenWrapper);

    this.activeChildIndex = -1;
    this.childTimeEntries = [];
    this.shadowRoot.addEventListener('child-is-active',
      this.childIsActiveHanlder.bind(this));
    toInsertContents.querySelector('#new-entry')
      .addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const entry = new TimeEntry();
        if (childrenWrapper.children.length % 2) {
          entry.shadowRoot.querySelector('#grid-wrapper').classList.add('even');
        }

        childrenWrapper.appendChild(entry);
        this.childTimeEntries.push(entry);
        this.openChildren(this.shadowRoot.querySelector('#collapse-open'));
      }.bind(this));

    this.shadowRoot.appendChild(toInsertContents);

    this.areChildrenOpen = !!data.areChildrenOpen;
    childrenWrapper.style.display = this.areChildrenOpen ? 'block' : 'none';
    this.shadowRoot.querySelector('#collapse-open')
      .addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.areChildrenOpen ?  this.closeChildren(e.target) :
          this.openChildren(e.target);
      }.bind(this));
  }

  childIsActiveHanlder(e) {
    if (this.activeChildIndex !== -1) {
      const event = new CustomEvent('stop-counting');
      this.childTimeEntries[this.activeChildIndex].dispatchEvent(event);
    }
    this.parentNode.dispatchEvent(new CustomEvent('child-is-active', {
      detail: this,
      bubbles: true,
    }));
    this.activeChildIndex =
      this.childTimeEntries.findIndex(el => el === e.detail);
  }

  openChildren(linkEl) {
    const childrenWrapper = this.shadowRoot.querySelector('#children');
    linkEl.innerHTML = `Collapse ${this.childTimeEntries.length}`;
    childrenWrapper.style.display = 'block';
    this.areChildrenOpen = true;
  }

  closeChildren(linkEl) {
    const childrenWrapper = this.shadowRoot.querySelector('#children');
    linkEl.innerHTML = `Open ${this.childTimeEntries.length}`;
    childrenWrapper.style.display = 'none';
    this.areChildrenOpen = false;
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

    this.handleJobTitleLogic(data.jobTitle);
    this.handleCommentLogic(data.comment);
    this.handleTimeLogic();
  }

  handleTimeLogic(activeChildIndex, isActiveItself) {
    if (isActiveItself) {
      setTimeEntryActive.call(this);
    } else {
      this.isActiveItself = false;
    }
    const runButton = this.shadowRoot.querySelector('#run');
    runButton.addEventListener('click', function(e) {
      const classList = this.shadowRoot.querySelector('#grid-wrapper')
        .classList;
      if (this.isActiveItself) {
        e.target.innerHTML = 'Start';
        setTimeEntryInactiveItself.call(this, classList);
      } else {
        e.target.innerHTML = 'Stop';
        setTimeEntryActiveItself.call(this, classList);
        const notifyEvent = new CustomEvent('child-is-active', {
          detail: this,
          bubbles: true,
        });
        this.parentNode.dispatchEvent(notifyEvent);
      }
    }.bind(this));

    function setTimeEntryInactiveItself(classList) {
      this.isActiveItself = false;
      classList.remove('active');
    }

    function setTimeEntryActiveItself(classList) {
      this.isActiveItself = true;
      classList.add('active');
    }
  }

  handleJobTitleLogic(text) {
    const jobTitleEl = this.shadowRoot.querySelector('#job-title');
    if (text) {
      jobTitleEl.innerHTML = text.trim();
      this.jobTitle = text;
    } else {
      this.jobTitle = jobTitleEl.innerHTML.trim();
    }
    jobTitleEl.addEventListener('blur', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.jobTitle = e.target.innerHTML.trim();
    }.bind(this));
  }

  handleCommentLogic(text) {
    const commentEl = this.shadowRoot.querySelector('#comment');
    if (text) {
      commentEl.innerHTML = text.trim();
      this.comment = text;
    } else {
      this.comment = commentEl.innerHTML.trim();
    }
    commentEl.addEventListener('blur', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.comment = e.target.innerHTML.trim();
    }.bind(this));
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
