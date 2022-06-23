'use strict';

const tp = require('tape');
const TestUser = require('../test-user.js');
const initData = require('./06-time-tracker-time-not-restored-on-startup.js');

tp('', async t => {
  const u = new TestUser();
  await u.prepare();
  await u.openApp(initData);

  const totalTimeOnEntry = await u.timeEntryTotalTimeGet([1,]);
  t.equal(totalTimeOnEntry, '0d 0h 0m 10s');

  const totalTimeOnTimeTracker = await u.timeTrackerTotalTimeGet();
  t.equal(totalTimeOnTimeTracker, '0d 0h 0m 10s');

  await u.closeApp();
  t.end();
});
