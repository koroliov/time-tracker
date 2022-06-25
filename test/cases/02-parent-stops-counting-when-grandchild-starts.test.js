'use strict';

const tp = require('tape');
const TestUser = require('../test-user.js');

tp('', async t => {
  const u = new TestUser();
  await u.prepare();
  await u.openApp();

  await u.commonTimeEntryAddNew([]);
  await u.commonTimeEntryAddNew([1,]);

  let date = 1234;
  await u.injectDate(date);

  await u.timeEntrySetBillable([1, 1,]);
  await u.timeEntryStart([1, 1,]);

  date += 60000;
  await u.injectDate(date);
  await u.pause(1500);

  await u.commonTimeEntryAddNew([1, 1,]);
  await u.timeEntryStart([1, 1, 1,]);

  date += 60000;
  await u.injectDate(date);
  await u.pause(1500);

  let totalTime, ownTime, billableTime, billablePercent,
    ttBillableCurrent, ttBillableToTargetPercent;

  totalTime = await u.timeEntryTotalTimeGet([1, 1, 1,]);
  t.equal(totalTime, '0d 0h 1m 0s');
  ownTime = await u.timeEntryOwnTimeGet([1, 1, 1,]);
  t.equal(ownTime, '0d 0h 1m 0s');
  billableTime = await u.timeEntryBillableTimeGet([1, 1, 1,]);
  t.equal(billableTime, '0d 0h 0m 0s');
  billablePercent = await u.timeEntryBillableTimePercentGet([1, 1, 1,]);
  t.equal(billablePercent, '0%');

  totalTime = await u.timeEntryTotalTimeGet([1, 1,]);
  t.equal(totalTime, '0d 0h 2m 0s');
  ownTime = await u.timeEntryOwnTimeGet([1, 1,]);
  t.equal(ownTime, '0d 0h 1m 0s');
  billableTime = await u.timeEntryBillableTimeGet([1, 1,]);
  t.equal(billableTime, '0d 0h 1m 0s');
  billablePercent = await u.timeEntryBillableTimePercentGet([1, 1,]);
  t.equal(billablePercent, '50%');

  totalTime = await u.timeEntryTotalTimeGet([1,]);
  t.equal(totalTime, '0d 0h 2m 0s');
  ownTime = await u.timeEntryOwnTimeGet([1,]);
  t.equal(ownTime, '0d 0h 0m 0s');
  billableTime = await u.timeEntryBillableTimeGet([1,]);
  t.equal(billableTime, '0d 0h 1m 0s');
  billablePercent = await u.timeEntryBillableTimePercentGet([1,]);
  t.equal(billablePercent, '50%');

  totalTime = await u.timeTrackerTotalTimeGet();
  t.equal(totalTime, '0d 0h 2m 0s');
  billableTime = await u.timeTrackerBillableTimeGet();
  t.equal(billableTime, '0d 0h 1m 0s');
  ttBillableCurrent = await u.timeTrackerCurrentBillablePercentGet();
  t.equal(ttBillableCurrent, '50%');
  ttBillableToTargetPercent =
    await u.timeTrackerBillableCurrentToTargetPercentGet();
  t.equal(ttBillableToTargetPercent, '0%');

  await u.closeApp();
  t.end();
});
