'use stirct';
class Base extends HTMLElement {
  constructor(data) {
    super();
    this.attachShadow({mode: 'open',});
    const templateContent = document.querySelector(`#${data.templateId}`)
      .content;
    const toInsertContents = templateContent.cloneNode(true);
    const childrenWrapper = document.createElement('div');
    childrenWrapper.setAttribute('id', 'children');
    toInsertContents.querySelector('#wrapper').appendChild(childrenWrapper);

    this.counterInterval = 0;
    this.isOwnTimeBillable = data.isOwnTimeBillable || false;
    this.timeOwn = data.timeOwn || 0;
    //Includes timeOwn if it's billable
    this.timeBillable = data.timeBillable || 0;
    //Includes timeBillable
    this.timeTotal = data.timeTotal || 0;

    this.activeChildIndex = -1;
    this.childTimeEntries = [];
    this.shadowRoot.addEventListener('child-is-active',
      this.childIsActiveHanlder.bind(this));
    this.shadowRoot.addEventListener('child-is-inactive',
      this.childIsInactiveHanlder.bind(this));
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

  convertTimeMsToDaysHoursMinSec(ms) {
    const sec = ms / 1000;
    const secRemainder = sec % 60;
    const min = (sec - secRemainder) / 60;
    const minRemainder = (min % 60);
    const hrs = (min - minRemainder) / 60;
    const hrsRemainder = hrs % 8;
    const days = (hrs - hrsRemainder) / 8;
    return `${days}d ${hrsRemainder}h ${minRemainder}m ${secRemainder}s`;
  }

  dispatchChildIsInactiveEvent() {
    const notifyEvent = new CustomEvent('child-is-inactive', {
      bubbles: true,
    });
    this.parentNode.dispatchEvent(notifyEvent);
  }

  dispatchChildIsActiveEvent(isBillable) {
    const notifyEvent = new CustomEvent('child-is-active', {
      detail: {
        timeEntryEl: this,
        isBillable,
      },
      bubbles: true,
    });
    this.parentNode.dispatchEvent(notifyEvent);
  }

  childIsActiveHanlder(e) {
    const newActiveChildIndex =
      this.childTimeEntries.findIndex(el => el === e.detail.timeEntryEl);
    if (this.activeChildIndex !== -1) {
      if (this.activeChildIndex !== newActiveChildIndex) {
        const event = new CustomEvent('stop-counting');
        this.childTimeEntries[this.activeChildIndex].dispatchEvent(event);
      }
      clearInterval(this.counterInterval);
    }
    if (this.isActiveItself) {
      this.isActiveItself = false;
      this.shadowRoot.querySelector('#run').innerHTML = 'Start';
      this.shadowRoot.querySelector('#grid-wrapper').classList.remove('active');
      clearInterval(this.counterInterval);
    }
    this.dispatchChildIsActiveEvent(e.detail.isBillable);
    this.activeChildIndex = newActiveChildIndex;
    this.setIntervals(e.detail.isBillable);
  }

  childIsInactiveHanlder() {
    this.activeChildIndex = -1;
    clearInterval(this.counterInterval);
    this.dispatchChildIsInactiveEvent();
  }

  setIntervals(isOriginTimeEntryBillble) {
    if (isOriginTimeEntryBillble) {
      this.counterInterval = setInterval(() => {
        this.timeTotal += 1000;
        this.timeBillable += 1000;
        this.updateTimeToUser();
      }, 1000);
    } else {
      this.counterInterval = setInterval(() => {
        this.timeTotal += 1000;
        this.updateTimeToUser();
      }, 1000);
    }
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

    this.isOwnTimeBillable = false;
    this.timeOwn = 0;
    this.timeBillable = data.timeBillable || 0;
    //Includes timeBillable
    this.timeTotal = data.timeTotal || 0;
    this.updateTimeToUser();
  }

  updateTimeToUser() {
    const totalStr = this.convertTimeMsToDaysHoursMinSec(this.timeTotal);
    this.shadowRoot.querySelector('.total.value').innerText = totalStr;
    const billableStr = this.convertTimeMsToDaysHoursMinSec(this.timeBillable);
    this.shadowRoot.querySelector('.billable.value').innerText = billableStr;
    const billablePercentCurrent = Math.floor(
      this.timeBillable / this.timeTotal * 100) || 0;
    this.shadowRoot.querySelector('.billable.percent-current').innerText =
      `${billablePercentCurrent}%`;
    const billablePercentTarget = Math.floor(
      this.timeBillable / (5 * 8 * 60 * 60 * 1000) * 100) || 0;
    this.shadowRoot.querySelector('.billable.percent-target').innerText =
      `${billablePercentTarget}%`;
  }
}
window.customElements.define('time-tracker', TimeTracker);

class TimeEntry extends Base {
  constructor(data = Object.create(null)) {
    data.templateId = 'time-entry';
    super(data);

    this.isOwnTimeBillable = data.isOwnTimeBillable || false;

    this.handleJobTitleLogic(data.jobTitle);
    this.handleCommentLogic(data.comment);
    this.handleTimeLogic(data.isActiveItself);
    this.updateTimeToUser();

    this.addEventListener('stop-counting',
      this.stopCountingHandler.bind(this));

    this.shadowRoot.querySelector('#is-own-time-billable > input')
      .addEventListener('change',
        this.isOwnTimeBillableChangeHandler.bind(this));
  }

  isOwnTimeBillableChangeHandler(e) {
    if (confirm('Are you sure?')) {
      this.isOwnTimeBillable = e.target.checked;
    }
  }

  stopCountingHandler() {
    clearInterval(this.counterInterval);
    if (this.isActiveItself) {
      this.isActiveItself = false;
      this.shadowRoot.querySelector('#run').innerHTML = 'Start';
      this.shadowRoot.querySelector('#grid-wrapper').classList.remove('active');
    } else if (this.activeChildIndex !== -1) {
      const event = new CustomEvent('stop-counting');
      this.childTimeEntries[this.activeChildIndex].dispatchEvent(event);
      this.activeChildIndex = -1;
    }
  }

  updateTimeToUser() {
    const totalStr = this.convertTimeMsToDaysHoursMinSec(this.timeTotal);
    this.shadowRoot.querySelector('#total-value').innerText = totalStr;
    const ownStr = this.convertTimeMsToDaysHoursMinSec(this.timeOwn);
    this.shadowRoot.querySelector('#own-value').innerText = ownStr;
    const billableStr = this.convertTimeMsToDaysHoursMinSec(this.timeBillable);
    this.shadowRoot.querySelector('#billable-value').innerText = billableStr;
    const billablePercent = Math.floor(
      this.timeBillable / this.timeTotal * 100) || 0;
    this.shadowRoot.querySelector('#billable-percent').innerText =
      `${billablePercent}%`;
  }

  handleTimeLogic(isActiveItself) {
    if (isActiveItself) {
      setTimeEntryActiveItself.call(this);
    } else {
      this.isActiveItself = false;
    }
    const runButton = this.shadowRoot.querySelector('#run');
    runButton.addEventListener('click', function(e) {
      const classList = this.shadowRoot.querySelector('#grid-wrapper')
        .classList;
      if (this.isActiveItself) {
        this.isActiveItself = false;
        classList.remove('active');
        e.target.innerHTML = 'Start';
        clearInterval(this.counterInterval);
        this.dispatchChildIsInactiveEvent();
      } else {
        if (this.activeChildIndex !== -1) {
          const event = new CustomEvent('stop-counting');
          this.childTimeEntries[this.activeChildIndex].dispatchEvent(event);
          clearInterval(this.counterInterval);
        }
        this.isActiveItself = true;
        classList.add('active');
        e.target.innerHTML = 'Stop';
        this.setIntervals(this.isOwnTimeBillable);
        this.dispatchChildIsActiveEvent(this.isOwnTimeBillable);
      }
    }.bind(this));
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
