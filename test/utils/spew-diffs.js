'use strict';
const fs = require('fs');

function spewDiffs(dirPath, actual, expected) {
  const actualString = JSON.stringify(actual, null, '  ');
  const expectedString = JSON.stringify(expected, null, '  ');
  fs.writeFileSync(`${dirPath}/actual.json`, actualString);
  fs.writeFileSync(`${dirPath}/expected.json`, expectedString);
}

module.exports = spewDiffs;
