import tape from 'tape';
const tp = tape;
import { getE2ETestName } from 'utils/get-e2e-test-name';
import * as path from 'path';
import * as config from '../../../../e2e/config';

import * as user from 'utils/test-user';

const testName = getE2ETestName({
  dirName: __dirname,
  sysFileSeparator: path.sep as '/' | '\\',
});

tp('start-position-user-plays-white', async t => {
  await user.opensBrowser({
    url: `${config.mockPageAddr}?test-name=${testName}`,
    windowWidth: 400,
    windowHeight: 600,
  });

  await user.seesActiveText({
    text: 'wp, e2, e4',
    tapeTest: t,
  });
  await user.clicksAt('e', 2);
  await user.clicksAt('e', 4);
  await user.waitsForOpponentPiecePresentAt('e', 5);

  await user.seesActiveText({
    text: 'wp, d2, d4',
    tapeTest: t,
  });
  await user.clicksAt('d', 2);
  await user.clicksAt('d', 4);
  await user.waitsForOpponentPiecePresentAt('d', 5);

  await user.comparesScreenshots({
    pathToActual: `${__dirname}${path.sep}final-${config.browserName}.png`,
    pathToExpected: `${__dirname}${path.sep}final-model.png`,
    pathToDiff: `${__dirname}${path.sep}final-${config.browserName}-error.png`,
    pass: t.pass,
    fail: t.fail,
  });

  await user.closesBrowser();

  t.end();
});
