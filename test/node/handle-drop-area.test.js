'use strict';
const tp = require('tape');
const {
    handleDropArea,
    DROP_AREA_CSS_CLASSES,
  } = require('../../src/handle-drop-area.js');
const allowedDropAreaCssClassesSet =
    new Set(Object.values(DROP_AREA_CSS_CLASSES));
const spewDiffs = require('../utils/spew-diffs.js');

//TODO: Consider refactor these tests with sort of a data provider approach:
//move the mock, expected etc. data to a separate module and here just call the
//tape funciton. But now I don't have time for this, let it be this way
TREE_$0_$1_$2: {
  tp('2 over 2 middle from middle, just started drag',
      { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[2];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 1 top from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 1 top from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 1 middle from top (entered 1 top, then returned to middle)',
      { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 1 middle from top (entered 1 from 0)',
      { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('2 over 1 middle from bottom', { objectPrintDepth: 1, },
      t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 1 bottom from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 1 bottom from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 0 top from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 0 middle from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 0 middle from bottom (entered 0 bottom from top,' +
      'then returned to middle)', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 0 bottom from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('entry 2 over 0 bottom from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '2', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '2',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });
}

TREE_$0_$0_0: {
  tp('0-0 over 0 bottom from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0 over 0-0 top from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0', },
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
          ],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0].childEntries[0];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0', },
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
          ],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0 over 0-0 middle from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0', },
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
          ],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0].childEntries[0];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0', },
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
          ],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });
}

TREE_$0_$0_0_$1: {
  tp('0-0 over 1 middle from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.CHILD, ],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0-0 over 1 tom from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0-0 over 0 top from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '0-0', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [
            {
              mockName: '0-0',
              isCollapsed: false,
              classList: [],
              childEntries: [],
            },
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0-0 over 0 middle from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0', },
      entryBeingDragged: { mockName: '0-0', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [
            {
              mockName: '0-0',
              isCollapsed: false,
              classList: [],
              childEntries: [],
            },
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0-0 over 0-0 bottom from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0].childEntries[0];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });
}

TREE_$0_$0_0_$0_1_$1: {
  tp('0-0 over 1 top from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0-1', },
      entryBeingDragged: { mockName: '0-0', },
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
              classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
              childEntries: [],
            },
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
              childEntries: [],
            },
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0-0 over 0-1 bottom from bottom', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
              childEntries: [],
            },
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[0].childEntries[1];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '0-1', },
      entryBeingDragged: { mockName: '0-0', },
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
              classList: [ DROP_AREA_CSS_CLASSES.SIBLING_BOTTOM, ],
              childEntries: [],
            },
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });
}

TREE_$0_$1: {
  tp('0 over 1 top from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'top');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0', },
      childEntries: [
        {
          mockName: '0',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });
}

TREE_$0_$0_0_$1_$1_0: {
  tp('0-0 over 1 middle from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: { mockName: '1', },
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [ DROP_AREA_CSS_CLASSES.SIBLING_TOP, ],
          childEntries: [
            {
              mockName: '1-0',
              isCollapsed: false,
              classList: [],
              childEntries: [],
            },
          ],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'middle');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [
            {
              mockName: '1-0',
              isCollapsed: false,
              classList: [],
              childEntries: [],
            },
          ],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });

  tp('0-0 over 1 bottom from top', { objectPrintDepth: 1, }, t => {
    const mockTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [
            {
              mockName: '1-0',
              isCollapsed: false,
              classList: [],
              childEntries: [],
            },
          ],
        },
      ],
    };
    const mockTimeTrackerInstance = rigMockTimeTracker(mockTimeTracker);
    const thisEntry = mockTimeTrackerInstance.childEntries[1];
    handleDropArea.call(thisEntry, 'bottom');

    const actualTimeTracker = unrigMockTimeTracker(mockTimeTrackerInstance);
    const expectedTimeTracker = {
      entryWithDropAreaCssClasses: null,
      entryBeingDragged: { mockName: '0-0', },
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
          ],
        },
        {
          mockName: '1',
          isCollapsed: false,
          classList: [],
          childEntries: [
            {
              mockName: '1-0',
              isCollapsed: false,
              classList: [],
              childEntries: [],
            },
          ],
        },
      ],
    };

    t.deepEqual(actualTimeTracker, expectedTimeTracker);
    t.end();
  });
}

//TODO: function determineDragOverZone() also may return null, so potentially
//we may need to have tests here for this situation. But since I've not spotted
//yet any problems with it being null, no tests for now

function rigMockTimeTracker(mockTimeTracker) {
  const ClassList = getClassListClass();
  const childrenStack = [];
  let childEntries = mockTimeTracker.childEntries;
  for (let i = 0; i < childEntries.length; i++) {
    const child = childEntries[i];
    const prevChild = childEntries[i - 1];
    if (prevChild) {
      child.previousElementSibling = prevChild;
      prevChild.nextElementSibling = child;
    }
    child.classList = new ClassList(child.classList);
    child.timeTracker = mockTimeTracker;
    child.parentTimeEntry =
        childrenStack[childrenStack.length - 1]?.child || null;
    if (child.childEntries.length) {
      childrenStack.push({
        childEntries,
        i,
        child,
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

    contains(token) {
      return this.#list.has(token);
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
