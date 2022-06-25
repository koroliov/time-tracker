'use strict';

const config = require('./config.js');
const remote = require('webdriverio').remote;

class TestUser {
  constructor() {
  }

  async prepare() {
    this.browser = await remote(config.wdioConfig);
  }

  async openApp(initData) {
    await this.browser.url(`file://${
      config.pathToProjectNoTraillingSlash}/build/time-tracker.html`);
    let str = 'window.localStorage.clear();';
    if (initData) {
      str += [
        "window.localStorage.setItem('time-tracker', `",
        initData,
        '`);',
      ].join(' ');
    }
    const script = `window.addEventListener('beforeunload', function() {
      ${str};
    })`;
    await this.browser.execute(script);
    await this.browser.refresh();
  }

  async pause(time) {
    await this.browser.pause(time);
  }

  async closeApp() {
    await this.browser.deleteSession();
  }

  //time-tracker time-entry
  async commonTimeEntryAddNew(address) {
    let selector;
    if (address.length) {
      selector =
        this._timeEntryInnerSelectorGet(address, '.controls .new-entry');
    } else {
      selector = `#time-tracker > .grid-wrapper > .controls .new-entry`;
    }
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.click();
  }

  async injectDate(date) {
    const script = `window.Date = {now() {return ${date};}};`;
    await this.browser.execute(script);
  }

  //time-entry
  async noTimeEntriesPresent() {
    const selector = `#time-tracker .children`;
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText() === '';
  }

  _timeEntryInnerSelectorGet(address, selectorLast) {
    const nthChildrenSelector = address.reduce((s, a, i, ar) => {
      return `${s} > time-entry:nth-child(${a}) > .entry ${
        i === ar.length - 1 ? '' :  '> .children'}`;
    }, '');
   return `#time-tracker .children ${nthChildrenSelector} > ${selectorLast}`;
  }

  async _timeEntryInnerValueGet(selector) {
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

  async timeEntryTotalTimeGet(address) {
    const selector = this._timeEntryInnerSelectorGet(address, '.total-value');
    return await this._timeEntryInnerValueGet(selector);
  }

  async timeEntryOwnTimeGet(address) {
    const selector = this._timeEntryInnerSelectorGet(address, '.own-value');
    return await this._timeEntryInnerValueGet(selector);
  }

  async timeEntryBillableTimeGet(address) {
    const selector =
      this._timeEntryInnerSelectorGet(address, '.billable-value');
    return await this._timeEntryInnerValueGet(selector);
  }

  async timeEntryBillableTimePercentGet(address) {
    const selector =
      this._timeEntryInnerSelectorGet(address, '.billable-percent');
    return await this._timeEntryInnerValueGet(selector);
  }

  async timeEntryStart(address) {
    const selector =
      this._timeEntryInnerSelectorGet(address, '.controls .start-stop');
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    const text = await e.getText();
    if (text === 'Start') {
      await e.click();
    } else {
      throw new Error(`Time entry at address ${address.join(',')} is active`);
    }
  }

  async timeEntrySetBillable(address) {
    const selector =
      this._timeEntryInnerSelectorGet(address, '.is-own-time-billable input');
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    const isChecked = await e.isSelected();
    if (isChecked) {
      throw new Error(`Time entry at address ${
        address.join(',')} is already billable`);
    } else {
      await e.click();
    }
  }

  //time-tracker
  async timeTrackerTotalTimeGet() {
    const selector = '#time-tracker > .grid-wrapper > .total.value';
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

  async timeTrackerBillableTimeGet() {
    const selector = '#time-tracker > .grid-wrapper > .billable.value';
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

  async timeTrackerCurrentBillablePercentGet() {
    const selector =
      '#time-tracker > .grid-wrapper > .billable.percent-current';
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

  async timeTrackerBillableCurrentToTargetPercentGet() {
    //not the total billable target by the end of the week
    //but current percent of spent billable time to the target time
    const selector =
      '#time-tracker > .grid-wrapper > .billable.percent-target';
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

  async timeTrackerTargetTotalGet() {
    const selector = '#time-tracker > h1 .abs-value';
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

  async timeTrackerTargetBillablePercentGet() {
    const selector = '#time-tracker > h1 .percent-value';
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }
}

module.exports = TestUser;
