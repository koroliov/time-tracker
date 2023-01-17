'use strict';

const {
  handleDropArea: handleDropAreaModule,
  DROP_AREA_CSS_CLASSES,
} = require('./handle-drop-area.js');
const Base = require('./base.js');

class TimeEntry extends Base {
  constructor(data, timeTracker, parentTimeEntry) {
    data.templateId = 'time-entry';
    super();
    this.initData(data);
    this.initSelfDom(data.templateId);
    this.initDomElementReferences(timeTracker, parentTimeEntry);
    this.initChildEntries(data.childEntries, this, timeTracker, this);
    this.addListeners();
    this.updateTimeText();
  }

  handleWhenActiveItself() {
    this.classList.add('is-active');
    this.querySelector('.start-stop').innerText = 'Stop';
  }

  addListeners() {
    super.addListeners(this);
    this.querySelector('.title')
      .addEventListener('blur', e => this.titleText = e.target.innerText);
    this.querySelector('.comment')
      .addEventListener('blur', e => this.commentText = e.target.innerText);
    this.querySelector('.is-own-time-billable input').addEventListener(
      'click', this.handleIsOwnTimeBillableClick.bind(this));
    this.querySelector('.start-stop')
      .addEventListener('click', this.handleStartStopClick.bind(this));
    this.querySelector('.generate-message')
      .addEventListener('click', this.generateMessageHandler.bind(this));

    this.addEventListener('mousedown', this.mouseDownHander.bind(this));

    this.addEventListener('dragstart', this.dragStartHandler.bind(this));
    this.addEventListener('dragenter', this.dragEnterHandler.bind(this));
    this.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
    this.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.addEventListener('dragend', this.dragEndHandler.bind(this));
    this.addEventListener('drop', this.dropHandler.bind(this));
  }

  mouseDownHander(e) {
    this.mouseDownOnEl = e.target;
    e.stopPropagation();
  }

  dragStartHandler(e) {
    e.stopPropagation();
    if (this.mouseDownOnEl !== this.dragEl || this.activeDescendantOrSelf) {
      e.preventDefault();
      return;
    }
    this.timeTracker.entryBeingDragged = this;
  }

  dragEndHandler(e) {
    e.stopPropagation();
    this.mouseDownOnEl = null;
    this.timeTracker.entryBeingDragged = null;
    this.hideAllDropAreas();
  }

  dragEnterHandler(e) {
    e.stopPropagation();
  }

  dragLeaveHandler(e) {
    e.stopPropagation();
  }

  dragOverHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const dragOverZone = determineDragOverZone(this);
    this.handleDropArea(dragOverZone);

    function determineDragOverZone(thisTimeEntry) {
      const borderWrapper =
          thisTimeEntry.querySelector('.border-and-grid-wrapper');
      const childrenEl = thisTimeEntry.querySelector('.children');
      if (!thisTimeEntry.isCollapsed &&
          (borderWrapper.offsetParent !== childrenEl.offsetParent)) {
        const errorMessage = [
          'Sorry, an error has occurred, please report to',
          'd.koroliov@gmail.com with steps to reproduce',
        ].join('\n');
        alert(errorMessage);
        throw new Error(errorMessage);
      } else if (noGuaranteeDragIsNotOverOpenChildren()) {
        return null;
      }
      const boundingRect = borderWrapper.getBoundingClientRect();
      const mouseYInElement = e.clientY - boundingRect.y;
      const borderWrapperHeightWoChildrenSection =
        borderWrapper.offsetHeight - childrenEl.offsetHeight;
      const rel = mouseYInElement / borderWrapperHeightWoChildrenSection;
      if (rel < 0.3) {
        return 'top';
      } else if (rel > 0.7) {
        return 'bottom';
      } else {
        return 'middle';
      }

      function noGuaranteeDragIsNotOverOpenChildren() {
        //since the interface currently looks this way:
        //
        //  (the x below demonstrates the position of the cursor)
        //  (the | below demonstrates the border of an entry element)
        //
        // | entry 0:
        // | | entry 0-1
        // |x| entry 0-2
        // | | entry 0-3
        //
        //then, when the user drags over a child entry, when the cursor is out
        //of the child entry itself and is over its parent (as on the scheme
        //above), we need to prevent a drop on the parent, since its counter
        //intuitive, ugly etc.
        //
        //If the user wants to insert a dragged element as a sibling of the
        //parent on the scheme, he needs to drag either above the children or
        //below the children
        //
        //If the user wants to drop the element as a sibling of the children,
        //then he will have to drag it to the right, over the children block
        return e.clientX < childrenEl.offsetLeft;
      }
    }
  }

  dropHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.timeTracker.entryWithDropAreaCssClasses) {
      this.timeTracker.entryBeingDragged.removeFromParent();
    } else {
      return;
    }
  }

  removeFromParent() {
    const timeChange = {
      totalTimeChange: -this.timeSpentTotal,
      billableTimeChange: -this.timeSpentBillable,
    };
    const target = this.parentTimeEntry || this.timeTracker;
    this.fireUpdateTimeEvent(target, timeChange);
    target.removeChild(this);
  }

  handleDropArea = handleDropAreaModule

  hideAllDropAreas() {
    this.timeTracker.entryWithDropAreaCssClasses?.classList
        .remove(...Object.values(DROP_AREA_CSS_CLASSES));
    this.timeTracker.entryWithDropAreaCssClasses = null;
  }

  generateMessageArr(paddingLevel, useTotalNotOwnTime = false) {
    const pad = '  ';
    const commentLines =
      this.commentText ? this.commentText.split('\n') : [];
    const messageOwn = [
      `${pad.repeat(paddingLevel)}${getTime(this)} ${
          this.titleText.trimEnd()}`,
      ...commentLines.reduce((a, l) => {
        return a.push(`${pad.repeat(paddingLevel + 1)}${l.trimEnd()}`), a;
      }, []),
      `${pad.repeat(paddingLevel)}${'-'.repeat(10)}`,
    ];
    const childMessages = this.childEntries.reduce((a, e) => {
      //recursion is acceptable here, no huge trees are exptected
      return a.push(...e.generateMessageArr(paddingLevel + 1)), a;
    }, []);
    return [
      ...messageOwn,
      ...childMessages,
    ];

    function getTime(that) {
      const ts =
        useTotalNotOwnTime ? that.timeSpentTotal : that.timeSpentOwn;
      const m = Math.ceil(ts / 60000);
      const mRemainder = m % 60;
      const h = (m - mRemainder) / 60;
      return `${h}h ${mRemainder}m`;
    }
  }

  generateMessageHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const messageArr = this.generateMessageArr(0, true);
    removeLastDelimiter();
    const showMessageEvent = new CustomEvent('showmessage', {
      detail: { message: messageArr.join('\n'), },
      bubbles: true,
    });
    this.dispatchEvent(showMessageEvent);

    function removeLastDelimiter() {
      messageArr.pop();
    }
  }

  handleStartStopClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.activeDescendantOrSelf === this) {
      this.disactivate(this);
      const disactivateEvent = new CustomEvent('disactivate', {
        detail: { firedFrom: this, },
        bubbles: true,
      });
      this.dispatchEvent(disactivateEvent);
    } else {
      const entryActiveEvent = new CustomEvent('activate', {
        detail: { isBillable: this.isOwnTimeBillable, },
        bubbles: true,
      });
      this.dispatchEvent(entryActiveEvent);
    }
  }

  handleIsOwnTimeBillableClick(e) {
    e.stopPropagation();
    this.isOwnTimeBillable = !this.isOwnTimeBillable;
    const billableTimeChange = this.isOwnTimeBillable ?
      this.timeSpentOwn : -this.timeSpentOwn;
    const ev = new CustomEvent('is-billable-changed', {
      detail: {
        isBillable: this.isOwnTimeBillable,
        billableTimeChange,
      },
      bubbles: true,
    });
    this.dispatchEvent(ev);
  }

  fireUpdateTimeEvent(target, timeChange) {
    const updateTimeEvent = new CustomEvent('update-time', {
      detail: timeChange,
      bubbles: true,
    });
    target.dispatchEvent(updateTimeEvent);
  }

  updateTimeText() {
    this.querySelector('.total-value').innerText =
        this.convertTimeToText(this.timeSpentTotal);
    this.querySelector('.own-value > div').innerText =
        this.convertTimeToText(this.timeSpentOwn);
    this.querySelector('.billable-value').innerText =
        this.convertTimeToText(this.timeSpentBillable);
    const billablePercent = this.timeSpentTotal ?
        Math.floor(this.timeSpentBillable / this.timeSpentTotal * 100) : 0;
    this.querySelector('.billable-percent').innerText =
        `${billablePercent}%`;
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
    this.classesToPreserve = data?.classesToPreserve || [];
  }

  initDomElementReferences(timeTracker, parentTimeEntry) {
    this.timeTracker = timeTracker;
    this.parentTimeEntry = parentTimeEntry;
    this.dragEl = this.querySelector('.drag-n-drop');
    this.mouseDownOnEl = null;
  }

  initSelfDom(templateId) {
    const templateContent =
      document.querySelector(`#${templateId}`).content;
    const clone = templateContent.cloneNode(true);
    this.classesToPreserve.forEach((c) => this.classList.add(c));
    this.setAttribute('draggable', 'true');
    this.appendChild(clone);
    this.handleChildEntriesVisibility();
    this.querySelector('.title').innerText = this.titleText;
    this.querySelector('.comment').innerText = this.commentText;
    this.querySelector('.is-own-time-billable input').checked =
      this.isOwnTimeBillable;
  }

  addNewTimeEntry(e) {
    super.addNewTimeEntry(e, this, this.timeTracker, this);
  }
}
window.customElements.define('time-entry', TimeEntry);

module.exports = TimeEntry;
