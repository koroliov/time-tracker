'use strict';
const tp = require('tape');
const handleDropAreaCssClasses =
    require('../../src/handle-drop-area-css-classes.js');

const siblingTopDropAreaCssClass = 'drop-as-siblint-top';
const siblingBottomDropAreaCssClass = 'drop-as-sibling-bottom';
const childDropAreaCssClass = 'drop-as-child';
const allowedDropAreaCssClasses = new Set([
  siblingTopDropAreaCssClass,
  siblingBottomDropAreaCssClass,
  childDropAreaCssClass
]);

tp('dragOverZone = middle', t => {
  const mockTimeTracker = {
    entryWithDropAreaCssClasses: { mockName: '0-1-0', },
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

  const actualTimeTracker = deconstructMockInstance(mockTimeTrackerInstance);
  const expectedTimeTracker = {
    entryWithDropAreaCssClasses: null,
    childEntries: [
      {
        mockName: '1',
        isCollapsed: false,
        childEntries: [],
        classList: [],
      },
    ],
  };

  t.deepEqual(
      mockTimeTrackerInstance.childEntries[0].childEntries[1].childEntries[0],
          mockTimeTrackerInstance.entryWithDropAreaCssClasses);
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
    if (child.childEntries.length) {
      childrenStack.push({
        childEntries,
        i: i,
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
  if (mockTimeTracker.entryWithDropAreaCssClasses) {
    const address =
        mockTimeTracker.entryWithDropAreaCssClasses.mockName.split('-');
    mockTimeTracker.entryWithDropAreaCssClasses = address.reduce((v, i) => {
      return v.childEntries[i];
    }, mockTimeTracker);
  }
  return mockTimeTracker;
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
        if (!allowedDropAreaCssClasses.has(t)) {
          throw new Error(`Unexpected CSS class added ${t}`);
        }
        this.#list.add(t);
      });
    }

    remove(...tokens) {
      tokens.forEach((t) => {
        if (!allowedDropAreaCssClasses.has(t)) {
          throw new Error(`Unexpected CSS class removed ${t}`);
        }
        this.#list.delete(t);
      });
    }
  };
}

function deconstructMockInstance(mockTimeTrackerInstance) {
}
