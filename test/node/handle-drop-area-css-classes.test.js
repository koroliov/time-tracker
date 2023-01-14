'use strict';
const tp = require('tape');
const {
    handleDropAreaCssClasses,
    dropAreaCssClassesMap,
  } = require('../../src/handle-drop-area-css-classes.js');
const allowedDropAreaCssClassesSet = new Set(dropAreaCssClassesMap.values());
const spewDiffs = require('../utils/spew-diffs.js');

tp('example', t => {
  const mockTimeTracker = {
    entryWithDropAreaCssClasses: { mockName: '0-1-0', },
    entryBeingDragged: { mockName: '0-1-0', },
    childEntries: [
      {
        mockName: '0',
        isCollapsed: false,
        classList: [],
        childEntries: [
          {
            mockName: '0-0',
            isCollapsed: false,
            classList: [],
            childEntries: [],
          },
          {
            mockName: '0-1',
            isCollapsed: false,
            classList: [],
            childEntries: [
              {
                mockName: '0-1-0',
                isCollapsed: false,
                classList: [],
                childEntries: [],
              },
            ],
          },
          {
            mockName: '0-2',
            isCollapsed: false,
            classList: [],
            childEntries: [],
          },
        ],
      },
    ],
  };
  const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
  const thisEntry = mockTimeTrackerInstance.childEntries[0];

  handleDropAreaCssClasses.call(thisEntry, 'middle');

  const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
  const expectedTimeTracker = {
    entryWithDropAreaCssClasses: { mockName: '0-1-0', },
    entryBeingDragged: { mockName: '0-1-0', },
    childEntries: [
      {
        mockName: '0',
        isCollapsed: false,
        classList: [],
        childEntries: [
          {
            mockName: '0-0',
            isCollapsed: false,
            classList: [],
            childEntries: [],
          },
          {
            mockName: '0-1',
            isCollapsed: false,
            classList: [],
            childEntries: [
              {
                mockName: '0-1-0',
                isCollapsed: false,
                classList: [],
                childEntries: [],
              },
            ],
          },
          {
            mockName: '0-2',
            isCollapsed: false,
            classList: [],
            childEntries: [],
          },
        ],
      },
    ],
  };

  t.deepEqual(
      mockTimeTrackerInstance.childEntries[0].childEntries[1].childEntries[0],
          mockTimeTrackerInstance.entryWithDropAreaCssClasses);
  t.deepEqual(
      mockTimeTrackerInstance.childEntries[0].childEntries[1].childEntries[0],
          mockTimeTrackerInstance.entryBeingDragged);
  t.deepEqual(actualTimeTracker, expectedTimeTracker);
  t.end();
});

function rigMockTimeTracker(mockTimeTracker) {
  const ClassList = getClassListClass();
  const childrenStack = [];
  let childEntries = mockTimeTracker.childEntries;
  for (let i = 0; i < childEntries.length; i++) {
    const child = childEntries[i];
    const prevChild = childEntries[i - 1];
    if (prevChild) {
      child.prevElementSibling = prevChild;
      prevChild.nextElementSibling = child;
    }
    child.classList = new ClassList(child.classList);
    child.timeTracker = mockTimeTracker;
    if (child.childEntries.length) {
      childrenStack.push({
        childEntries,
        i,
      });
      childEntries = child.childEntries;
      i = -1;
      continue;
    }
    if (i === childEntries.length - 1) {
      if (childrenStack.length) {
        const popped = childrenStack.pop();
        childEntries = popped.childEntries;
        i = popped.i;
        continue;
      }
    }
  }
  const linkEntryPropNames = [
    'entryWithDropAreaCssClasses',
    'entryBeingDragged',
  ];
  linkEntryPropNames.forEach((pn) => {
    if (mockTimeTracker[pn]) {
    replaceLinkEntryPropWithActualLinkToEntry(mockTimeTracker, pn);
    }
  });
  return mockTimeTracker;

  function replaceLinkEntryPropWithActualLinkToEntry(mockTimeTracker,
      propName) {
    const address = mockTimeTracker[propName].mockName.split('-');
    mockTimeTracker[propName] = address.reduce((v, i) => {
      return v.childEntries[i];
    }, mockTimeTracker);
  }
}

function getClassListClass() {
  return class ClassList {
    #list
    constructor(array) {
      this.#list = new Set(array);
    }

    deconstruct() {
      return Array.from(this.#list);
    }

    add(...tokens) {
      tokens.forEach((t) => {
        if (!allowedDropAreaCssClassesSet.has(t)) {
          throw new Error(`Unexpected CSS class added ${t}`);
        }
        this.#list.add(t);
      });
    }

    remove(...tokens) {
      tokens.forEach((t) => {
        if (!allowedDropAreaCssClassesSet.has(t)) {
          throw new Error(`Unexpected CSS class removed ${t}`);
        }
        this.#list.delete(t);
      });
    }
  };
}

function unrigMockTimeTracker(mockTimeTrackerInstance) {
  const unrigged = {
    entryWithDropAreaCssClasses: restoreValueFromLink(mockTimeTrackerInstance,
      'entryWithDropAreaCssClasses'),
    entryBeingDragged: restoreValueFromLink(mockTimeTrackerInstance,
      'entryBeingDragged'),
    childEntries: [],
  };
  const childrenStack = [];
  let childEntries = mockTimeTrackerInstance.childEntries;
  let childEntriesUnrigged = unrigged.childEntries;
  for (let i = 0; i < childEntries.length; i++) {
    const child = childEntries[i];
    const childUnrigged = unrigEntryWithEmptyChildren(child);
    childEntriesUnrigged.push(childUnrigged);
    if (child.childEntries.length) {
      childrenStack.push({
        childEntries,
        childEntriesUnrigged,
        i,
      });
      i = -1;
      childEntries = child.childEntries;
      childEntriesUnrigged = childUnrigged.childEntries;
      continue;
    }
    if (i === childEntries.length - 1) {
      if (childrenStack.length) {
        const popped = childrenStack.pop();
        childEntries = popped.childEntries;
        childEntriesUnrigged = popped.childEntriesUnrigged;
        i = popped.i;
        continue;
      }
    }
  }
  return unrigged;

  function restoreValueFromLink(mockTimeTrackerInstance, entryLinkPropName) {
    if (mockTimeTrackerInstance[entryLinkPropName]) {
      return {
        mockName: mockTimeTrackerInstance[entryLinkPropName].mockName,
      };
    }
    return mockTimeTrackerInstance[entryLinkPropName];
  }

  function unrigEntryWithEmptyChildren(entry) {
    return {
      mockName: entry.mockName,
      isCollapsed: entry.isCollapsed,
      classList: entry.classList.deconstruct(),
      childEntries: [],
    };
  }
}
