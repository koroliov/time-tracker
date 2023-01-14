'use strict';
const {
  handleDropAreaCssClasses: handleDropAreaCssClassesModule,
  DROP_AREA_CSS_CLASSES,
} = require('./handle-drop-area-css-classes.js');

(function() {
  const { TimeTracker, } = defineClasses();
  let autoSaveInterval = 0;
  let tt = null;
  init();

  function init(jsonArg) {
    const version = [0, 0, 0];
    const versionStr = version.join('.');
    const storageEntryName = getStorageEntryName();
    const {restoreType, json} = getRestoreData();
    if (restoreType === 'fileImport') {
      attemptRestoreFromFileImport();
    } else if (restoreType === 'localStorage') {
      attemptRestoreFromLocalStorage();
    }
    setAutosave();

    function attemptRestoreFromLocalStorage() {
      if (isRunFirstTime()) {
        return createTimeTrackerFromScratch();
      }
      let data;
      try {
        data = JSON.parse(json);
      } catch(e) {
        return Promise.resolve().then(() => {
          const message = [
            `Failed to restore data from localStorage entry`,
            `${storageEntryName}: either it is corrupted or an unknown error`,
            'has occurred. Would you like to delete the entry and start',
            'a new time-tracker?',
          ].join('\n');
          if (window.confirm(message)) {
            window.localStorage.removeItem(storageEntryName);
            createTimeTrackerFromScratch();
          }
        });
      }
      const {isAcceptable, versionToRestore} = checkVersion(data);
      if (isAcceptable) {
        data.version = version;
        tt = new TimeTracker(data);
        document.body.appendChild(tt);
      } else {
        const message = [
          `JSON from localStorage was generated in time-tracker.html`,
          `version ${versionToRestore}, but currently you're using`,
          `time-tracker.html version ${versionStr}, which may not work`,
          `correctly with the JSON file, which is being imported`,
          `Refusing to restore, try time-tracker.html`,
          `version ${versionToRestore}`,
          ``,
          `NOTE: Alternatively you can delete the localStorage entry`,
          `${storageEntryName} via the dev-tools <F12>, this will allow you`,
          `to use the current time-tracker.html version from scratch`,
        ].join('\n');;
        alert(message);
        return;
      }

      function createTimeTrackerFromScratch() {
        const data = Object.create(null);
        data.version = version;
        tt = new TimeTracker(data);
        document.body.appendChild(tt);
      }

      function isRunFirstTime() {
        return !json;
      }
    }

    function attemptRestoreFromFileImport() {
      let data;
      const brokenDataErrorMessage =
        `Failed to import JSON data, either the file is wrong or corrupted`;
      try {
        data = JSON.parse(json);
      } catch(e) {
        alert(brokenDataErrorMessage);
        return;
      }
      const {isAcceptable, versionToRestore} = checkVersion(data);
      if (isAcceptable) {
        tt.destroy();
        tt = new TimeTracker(data);
        document.body.appendChild(tt);
      } else if (versionToRestore === 'unknown') {
        alert(brokenDataErrorMessage);
      } else {
        alert([
          `Imported JSON file was generated in time-tracker.html`,
          `v${versionToRestore}, but currently you're using`,
          `time-tracker.html version ${versionStr}, which may not work`,
          `correctly with the JSON file, which is being imported`,
          `Refusing to import, try time-tracker.html version`,
          `${versionToRestore}`,
        ].join('\n'));
      }
    }

    function getRestoreData() {
      let restoreType = '';
      let json;
      if (jsonArg) {
        restoreType = 'fileImport';
        json = jsonArg;
      } else {
        restoreType = 'localStorage';
        json = localStorage.getItem(storageEntryName);
      }
      return {restoreType, json};
    }

    window.addEventListener('beforeunload', function() {
      if (tt) {
        localStorage.setItem(storageEntryName, tt);
      } else {
        this.localStorage.removeItem(storageEntryName);
      }
    });

    function setAutosave() {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
      autoSaveInterval = setInterval(() => {
        localStorage.setItem(storageEntryName, tt);
      }, 300000);
    }

    function getStorageEntryName() {
      return location.href.replace(/^file:\/\//, '');
    }

    function checkVersion(data) {
      const majorVersionOfDataRestored = data?.version?.[0];
      const versionToRestore = Array.isArray(data?.version) ?
        data.version.join('.') : 'unknown';
      return {
        isAcceptable: version[0] === majorVersionOfDataRestored,
        versionToRestore,
      };
    }
  }

  function defineClasses() {
    //Base class
    class Base extends HTMLElement {
      constructor() {
        super();
      }

      addListeners(timeTrackerShadowRootOrTimeEntry) {
        timeTrackerShadowRootOrTimeEntry.querySelector('.controls .new-entry')
          .addEventListener('click', this.addNewTimeEntry.bind(this));
        timeTrackerShadowRootOrTimeEntry
            .querySelector('.controls .collapse-open').addEventListener('click',
                this.toggleChildEntriesVisible.bind(this));
        timeTrackerShadowRootOrTimeEntry
            .addEventListener('activate', this.handleActivateEvent.bind(this));
        timeTrackerShadowRootOrTimeEntry
            .addEventListener('active-entry-changed',
                this.handleEntryActiveChangedEvent.bind(this));
        timeTrackerShadowRootOrTimeEntry.addEventListener('disactivate',
            this.handleDisactivateEvent.bind(this));
        timeTrackerShadowRootOrTimeEntry.addEventListener('is-billable-changed',
            this.handleIsBillableChanged.bind(this));
      }

      handleIsBillableChanged(e) {
        if (e.target === this.activeChildOrSelf) {
          this.isCountBillable = e.detail.isBillable;
        }
        this.timeSpentBillable += e.detail.billableTimeChange;
        this.updateTimeText();
      }

      handleActivateEvent(e) {
        if (e.target === this) {
          this.handleWhenActiveItself();
        }
        this.isCountBillable = e.detail.isBillable;
        if (this.activeChildOrSelf) {
          if (this.activeChildOrSelf !== this) {
            this.fireDisactivateEventToCurrentlyActiveEntry();
          }
          this.fireActiveEntryChangedEvent(e.target);
          e.stopPropagation();
        }
        this.activeChildOrSelf = e.target;
        this.stopCount();
        this.startCount();
      }

      fireActiveEntryChangedEvent(newActiveEntry) {
        const entryActiveChangedEvent =
          new CustomEvent('active-entry-changed', {
            detail: { activeEntry: newActiveEntry, },
            bubbles: true,
          });
        this.dispatchEvent(entryActiveChangedEvent);
      }

      fireDisactivateEventToCurrentlyActiveEntry() {
        const disactivateEvent = new CustomEvent('disactivate', {
          detail: { firedFrom: this, },
          bubbles: true,
        });
        this.activeChildOrSelf.dispatchEvent(disactivateEvent);
      }

      handleWhenInactiveItself() {
        this.querySelector('.start-stop').innerText = 'Start';
        this.classList.remove('is-active');
      }

      handleEntryActiveChangedEvent(e) {
        if (this.activeChildOrSelf === this) {
          this.handleWhenInactiveItself();
        }
        this.isCountBillable = e.detail.activeEntry.isOwnTimeBillable;
        this.activeChildOrSelf = e.detail.activeEntry;
      }

      disactivate(evTarget) {
        if (evTarget === this) {
          this.handleWhenInactiveItself();
        }
        this.activeChildOrSelf = null;
        this.isCountBillable = false;
        this.stopCount();
      }

      handleDisactivateEvent(e) {
        if (e.detail.firedFrom === this) {
          if (this.activeChildOrSelf) {
            e.stopPropagation();
          }
        } else {
          this.disactivate(e.target);
        }
      }

      toggleChildEntriesVisible(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isCollapsed = !this.isCollapsed;
        this.handleChildEntriesVisibility();
      }

      initChildEntries(childEntries = [], timeTrackerShadowRootOrTimeEntry,
          timeTracker, parentTimeEntry) {
        //This will be a recursive call, but it's acceptable, since no huge data
        //structures are expected
        this.childEntries = childEntries.map((c) => {
          const te = new TimeEntry(c, timeTracker, parentTimeEntry);
          timeTrackerShadowRootOrTimeEntry
              .querySelector('.children').appendChild(te);
          return te;
        });
        this.setCollapseOpenLink(timeTrackerShadowRootOrTimeEntry);
      }

      addNewTimeEntry(e, timeTrackerShadowRootOrTimeEntry, timeTracker,
          parentTimeEntry) {
        e.preventDefault();
        e.stopPropagation();
        const te =
            new TimeEntry(Object.create(null), timeTracker, parentTimeEntry);
        this.childEntries.push(te);
        this.isCollapsed = false;
        addWhiteBlackClass(this);
        this.handleChildEntriesVisibility();
        this.setCollapseOpenLink(timeTrackerShadowRootOrTimeEntry);
        timeTrackerShadowRootOrTimeEntry
            .querySelector('.children').appendChild(te);

        function addWhiteBlackClass(that) {
          if (isFirstBlackWhite()) {
            addClass('black-white', 'white-black');
          } else {
            addClass('white-black', 'black-white');
          }

          function isFirstBlackWhite() {
            return isTimeTracker() || timeTrackerShadowRootOrTimeEntry
                .classList.contains('black-white');

            function isTimeTracker() {
              return !timeTrackerShadowRootOrTimeEntry.classList;
            }
          }

          function addClass(classEven, classOdd) {
            if (nextChildIsOdd()) {
              te.classList.add(classOdd);
              te.classesToPreserve.push(classOdd);
            } else {
              te.classList.add(classEven);
              te.classesToPreserve.push(classEven);
            }
          }

          function nextChildIsOdd() {
            return that.childEntries.length % 2;
          }
        }
      }

      setCollapseOpenLink(timeTrackerShadowRootOrTimeEntry) {
        const collapseOpenLink = timeTrackerShadowRootOrTimeEntry
            .querySelector('.controls .collapse-open');
        if (this.isCollapsed) {
          collapseOpenLink.innerText = `Open (${this.childEntries.length})`;
        } else {
          collapseOpenLink.innerText = `Collapse (${this.childEntries.length})`;
        }
      }

      handleChildEntriesVisibility(timeTrackerShadowRootOrTimeEntry) {
        const collapseOpenLink = timeTrackerShadowRootOrTimeEntry
            .querySelector('.controls .collapse-open');
        const childEntriesWrapper = timeTrackerShadowRootOrTimeEntry
            .querySelector('.children');
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
        this.isCountBillable = data?.isCountBillable || false;

        this.isCollapsed = data?.isCollapsed || false;
        this.childEntries = [];
        this.activeChildOrSelf = null;
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
        if (this.activeChildOrSelf === this) {
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
        this.initAuxProperties();
        this.initSelfDom(data.templateId);
        this.initChildEntries(data.childEntries, this.shadowRoot, this, null);
        this.addListeners();
        this.setFaviconData();
        this.favIconData.favIcon
          .setAttribute('href', this.favIconData.inactiveHref);
      }

      initAuxProperties() {
        this.entryBeingDragged = null;
        this.entryWithDropAreaCssClasses = null;
      }

      destroy() {
        if (this.activeChildOrSelf) {
          const disactivateEvent = new CustomEvent('disactivate', {
            detail: { firedFrom: this, },
            bubbles: true,
          });
          this.activeChildOrSelf.dispatchEvent(disactivateEvent);
        }
        this.remove();
      }

      handleIsBillableChanged(e) {
        super.handleIsBillableChanged(e);
        if (this.activeChildOrSelf) {
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

      toString() {
        const propertiesNotToIncludeInJson = new Set([
          'activeChildOrSelf',
          'timeTracker',
          'parentTimeEntry',
          'entryBeingDragged',
          'favIconData',
          'percentBillableTargetDefault',
          'timeTotalTargetDefault',
          'mouseDownOnEl',
          'entryWithDropAreaCssClasses',
        ]);
        return JSON.stringify(this, (key, val) => {
          if (propertiesNotToIncludeInJson.has(key)) {
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
        init(json);
      }

      initiateImport(e) {
        e.preventDefault();
        e.stopPropagation();
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

    //Time Entry class
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
        if (this.mouseDownOnEl !== this.dragEl) {
          e.preventDefault();
          return;
        }
        this.timeTracker.entryBeingDragged = this;
      }

      dragEndHandler(e) {
        e.stopPropagation();
        this.mouseDownOnEl = null;
        this.timeTracker.entryBeingDragged = null;
        this.timeTracker.entryWithDropAreaCssClasses
            ?.removeDropAreaCssClasses();
        this.timeTracker.entryWithDropAreaCssClasses = null;
      }

      dragEnterHandler(e) {
        e.stopPropagation();
      }

      dragLeaveHandler(e) {
        e.stopPropagation();
        //if (e.target instanceof TimeEntry) {
        //  if (entryIsBeingDraggedBackOnItselfDownwards()) {
        //    e.target.classList.remove('padding-bottom');
        //  }
        //  if (entryIsBeingDraggedBackOnItselUpwards()) {
        //    e.target.classList.remove('padding-top');
        //  }
        //  e.target.childEntries[0]?.classList.remove('padding-top');
        //}

        //function entryIsBeingDraggedBackOnItselfDownwards() {
        //  return e.target?.nextElementSibling ===
        //      e.target.timeTracker.entryBeingDragged;
        //}

        //function entryIsBeingDraggedBackOnItselUpwards() {
        //  return e.target?.prevElementSibling ===
        //      e.target.timeTracker.entryBeingDragged;
        //}
      }

      dragOverHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        const dragOverZone = determineDragOverZone(this, e);
        this.handleDropAreaCssClasses(dragOverZone);
        //if (dragOverZone === 'top') {
        //  this.showSiblingTopDropArea();
        //} else if (dragOverZone === 'bottom') {
        //  if (this.isCollapsed || !this.childEntries.length) {
        //    this.showSiblingBottomDropArea();
        //  }
        //} else {
        //  this.hideSiblingDropArea(e.target);
        //  //if (this.isCollapsed || !this.childEntries.length) {
        //  //  this.showDropAsChildArea();
        //  //}
        //}

        function determineDragOverZone(thisTimeEntry, event) {
          const borderWrapper =
              thisTimeEntry.querySelector('.border-and-grid-wrapper');
          const childrenEl = thisTimeEntry.querySelector('.children');
          if (borderWrapper.offsetParent !== childrenEl.offsetParent) {
            throw new Error([
              'Sorry, an error has occurred, please report to',
              'd.koroliov@gmail.com with steps to reproduce',
            ].join('\n'));
          }
          if (e.clientX < childrenEl.offsetLeft) {
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
        }
      }

      dropHandler(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      handleDropAreaCssClasses = handleDropAreaCssClassesModule

      removeDropAreaCssClasses() {
        this.classList.remove(...Object.values(DROP_AREA_CSS_CLASSES));
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
        if (this.activeChildOrSelf === this) {
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

    return { TimeTracker, };
  }
})();
