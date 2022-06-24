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
      config.pathToProjectNoTrailingSlash}/build/time-tracker.html`);
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

  async closeApp() {
    await this.browser.deleteSession();
  }

  async noTimeEntriesPresent() {
    const selector = `#time-tracker .children`;
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText() === '';
  }

  async timeEntryTotalTimeGet(address) {
    const nthChildrenSelector = address.reduce((s, a) => {
      return `${s} > time-entry:nth-child(${a}) > .entry`;
    }, '');
    const selector =
      `#time-tracker .children ${nthChildrenSelector} > .total-value`;
    const tt = await this.browser.$('time-tracker');
    const e = await tt.shadow$(selector);
    return await e.getText();
  }

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

  async timeTrackerBillbleTargetPercentGet() {
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
