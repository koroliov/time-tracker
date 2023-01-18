'use strict';
(function() {
  const TimeTracker = require('./time-tracker');

  let autoSaveInterval = 0;
  let tt = null;
  init();

  function init(jsonArg) {
    const version = [0, 1, 0];
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
        tt = new TimeTracker(data, init);
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
        tt = new TimeTracker(data, init);
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
        tt = new TimeTracker(data, init);
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
})();
