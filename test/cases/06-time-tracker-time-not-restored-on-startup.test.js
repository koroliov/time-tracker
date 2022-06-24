'use strict';

const tp = require('tape');
const TestUser = require('../test-user.js');

tp('data exists', async t => {
  const initData = require('./06-time-tracker-time-not-restored-on-startup.js');
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

tp('data exists', async t => {
  const u = new TestUser();
  await u.prepare();
  await u.openApp();

  t.ok(await u.noTimeEntriesPresent());

  const totalTimeOnTimeTracker = await u.timeTrackerTotalTimeGet();
  t.equal(totalTimeOnTimeTracker, '0d 0h 0m 0s');

  const billableTimeOnTimeTracker = await u.timeTrackerBillableTimeGet();
  t.equal(billableTimeOnTimeTracker, '0d 0h 0m 0s');

  const targetTotal = await u.timeTrackerTargetTotalGet();
  t.equal(targetTotal, '5d');

  const targetBillablePercent = await u.timeTrackerTargetBillablePercentGet();
  t.equal(targetBillablePercent, '50%');

  const curBillablePercentOnTimeTracker =
    await u.timeTrackerCurrentBillablePercentGet();
  t.equal(curBillablePercentOnTimeTracker, '0%');

  const billablePercentOnTimeTracker =
    await u.timeTrackerBillbleTargetPercentGet();
  t.equal(billablePercentOnTimeTracker, '0%');

  await u.closeApp();
  t.end();
});