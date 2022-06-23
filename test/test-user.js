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
    const str = [
      'window.localStorage.clear();',
      "window.localStorage.setItem('time-tracker', `",
      initData,
      '`);',
    ].join(' ');
    const script = `window.addEventListener('beforeunload', function() {
      ${str};
    })`;
    await this.browser.execute(script);
    await this.browser.refresh();
  }

  async closeApp() {
    await this.browser.deleteSession();
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
}

module.exports = TestUser;
