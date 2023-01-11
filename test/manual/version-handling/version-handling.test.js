//These code snippets are supposed to be run from the browser's console when
//the time tracker page is open

//Open first time
//
//run this, then reload
//EXPECTED: clean empty time-tracker
(async () => {
  window.addEventListener('beforeunload', function() {
    this.localStorage.removeItem('/home/dk/work/github-mine/time-tracker/build/time-tracker.html');
  });
})();

//localStorage data present, versions don't match
//
//add a couple of entries
//run this, then reload
//EXPECTED:
// - nothing is shown, emtpy page, alert with the suggestion to use
// - an appropriate version of time-tracker or
// - manually delete the entry from the dev-tools
(async () => {
  document.querySelector('time-tracker').version = [999, 0, 0];
})();

//JSON file import, versions match
//
//Create a couple of entries
//Import the import-versions-match.json file and see:
//EXPECTED:
// - alert with a warning about a backup etc.
// - the entry with the title: for manual test, versions match
// - no previously added entries

//JSON file import, versions don't match
//
//Create a couple of entries
//Import the import-versions-dont-match.json file and see:
//EXPECTED:
// - alert with a warning about a backup etc.
// - alert with refusing to match message
// - previously added entries unchanged

//JSON file import, broken data (i.e. the file is json, but with wrong data)
//JSON file import, garbage data (i.e. the file is something not json at all)
//
//Create a couple of entries
//Import the import-versions-dont-match.json file and see:
//EXPECTED:
// - alert with a warning about a backup etc.
// - alert with corrupted data
// - previously added entries unchanged
