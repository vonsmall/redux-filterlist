import { mount } from 'enzyme';

import React from 'react';
import { Provider, connect } from 'react-redux';
import { combineReducers } from 'redux';

import { createMappers } from '../reduxFilterlist';
import collectListInitialState from '../collectListInitialState';
import {
  registerList,
  destroyList,

  changeListState,

  loadListSuccess,
  loadListError,

  insertItem,
  deleteItem,
  updateItem,
} from '../actions';

import reducer from '../reducer';
import _mockStore from '../test-utils/mockStore';

const mockStore = _mockStore.bind(null, combineReducers({
  reduxFilterlist: reducer,
}));

const TestWrapperComponent = () => (
  <div />
);

const TestChildComponent = () => (
  <div />
);

function testReduxFilterlist(params) {
  return (WrappedComponent) => {
    const {
      mapStateToProps,
      mapDispatchToProps,
    } = createMappers(WrappedComponent, params);

    return connect(mapStateToProps, mapDispatchToProps)(TestWrapperComponent);
  };
}

class PageObject {
  constructor(decoratorParams, reducerState, props) {
    const Container = testReduxFilterlist({
      listId: 'testId',
      loadItems: jest.fn(),
      ...decoratorParams,
    })(TestChildComponent);

    this.store = mockStore({
      reduxFilterlist: reducerState,
    });

    this.wrapper = mount(
      <Provider store={this.store}>
        <Container {...props} />
      </Provider>,
    );
  }

  getStore() {
    return this.store;
  }

  getWrapperComponent() {
    return this.wrapper.find(TestWrapperComponent);
  }

  getListAction(actionName) {
    return this.getWrapperComponent().prop('listActions')[actionName];
  }
}

function setup(decoratorParams = {}, reducerState = {}, props = {}) {
  return new PageObject(decoratorParams, reducerState, props);
}

test('should render wrapper component without error', () => {
  const page = setup();

  expect(page.getWrapperComponent().length).toBe(1);
});

test('should throw an exception if listId is not defined', () => {
  expect(() => {
    testReduxFilterlist({
      loadItems: jest.fn(),
    })(TestChildComponent);
  })
    .toThrowError('listId is required');
});

test('should throw an exception if loadItems is not defined', () => {
  expect(() => {
    const {
      mapStateToProps,
    } = createMappers(TestChildComponent, {
      listId: 'testId',
    });

    mapStateToProps({
      reduxFilterlist: {},
    }, {});
  })
    .toThrowError('loadItems is required');
});

test('should throw an exception if loadItems is not a function', () => {
  expect(() => {
    const {
      mapStateToProps,
    } = createMappers(TestChildComponent, {
      listId: 'testId',
      loadItems: 123,
    });

    mapStateToProps({
      reduxFilterlist: {},
    }, {});
  })
    .toThrowError('loadItems should be a function');
});

test('should throw an exception if onBeforeRequest defined and not a function', () => {
  expect(() => {
    const {
      mapStateToProps,
    } = createMappers(TestChildComponent, {
      listId: 'testId',
      loadItems: jest.fn(),
      onBeforeRequest: 123,
    });

    mapStateToProps({
      reduxFilterlist: {},
    }, {});
  })
    .toThrowError('onBeforeRequest should be a function');
});

test('should provide the correct props', () => {
  const page = setup();

  const props = page.getWrapperComponent().props();

  expect(Object.keys(props).sort())
    .toEqual([
      'WrappedComponent',
      'componentProps',
      'listActions',
      'listId',
      'listState',
      'loadItems',
      'onBeforeRequest',
      'reduxFilterlistParams',
    ]);

  expect(Object.keys(props.listState).sort())
    .toEqual([
      'additional',
      'alwaysResetFilters',
      'appliedFilters',
      'autoload',
      'error',
      'filters',
      'initialFilters',
      'isDefaultSortAsc',
      'items',
      'loading',
      'requestId',
      'saveFiltersOnResetAll',
      'saveItemsWhileLoad',
      'shouldClean',
      'sort',
    ]);

  expect(Object.keys(props.listActions).sort())
    .toEqual([
      'changeListState',
      'deleteItem',
      'destroyList',
      'insertItem',
      'loadListError',
      'loadListSuccess',
      'registerList',
      'updateItem',
    ]);
});

test('should provide correct componentProps', () => {
  const page = setup({}, {}, {
    testProperty: 'testValue',

    params: {
      testParam: 'testValue',
    },
  });

  const props = page.getWrapperComponent().props();

  expect(props.params).toEqual({
    testParam: 'testValue',
  });
  expect(props.componentProps).toEqual({
    testProperty: 'testValue',

    params: {
      testParam: 'testValue',
    },
  });
});

test('should provide getStateFromProps and shouldRecountState from decorator', () => {
  const getStateFromProps = jest.fn(() => ({}));
  const shouldRecountState = jest.fn(() => ({}));

  const page = setup({
    getStateFromProps,
    shouldRecountState,
  }, {}, {
    params: {
      testParam: 'testValue',
    },
  });

  const props = page.getWrapperComponent().props();

  expect(props.reduxFilterlistParams.getStateFromProps).toBe(getStateFromProps);
  expect(props.reduxFilterlistParams.shouldRecountState).toBe(shouldRecountState);
});

test('should provide getStateFromProps and shouldRecountState from component props', () => {
  const getStateFromPropsWrong = jest.fn(() => ({}));
  const shouldRecountStateWrong = jest.fn(() => ({}));

  const getStateFromProps = jest.fn(() => ({}));
  const shouldRecountState = jest.fn(() => ({}));

  const page = setup({
    getStateFromProps: getStateFromPropsWrong,
    shouldRecountState: shouldRecountStateWrong,
  }, {}, {
    params: {
      testParam: 'testValue',
    },

    getStateFromProps,
    shouldRecountState,
  });

  const props = page.getWrapperComponent().props();

  expect(props.reduxFilterlistParams.getStateFromProps).toBe(getStateFromProps);
  expect(props.reduxFilterlistParams.shouldRecountState).toBe(shouldRecountState);
});

test('should provide the correct list state', () => {
  const page = setup({}, {
    testId: {
      sort: {
        param: 'testParam',
        asc: true,
      },
      initialFilters: {},
      filters: {},
      appliedFilters: {},
      loading: false,
      items: [1, 2, 3],
      additional: null,
      error: null,
    },
  });

  const listState = page.getWrapperComponent().prop('listState');

  expect(listState).toEqual({
    sort: {
      param: 'testParam',
      asc: true,
    },
    initialFilters: {},
    filters: {},
    appliedFilters: {},
    loading: false,
    items: [1, 2, 3],
    additional: null,
    error: null,
  });
});

test('should provide the correct list state at init', () => {
  const params = {
    initialFilters: {
      filter: '',
    },
    sort: {
      param: 'param',
      asc: false,
    },
    appliedFilters: {
      filter: 'value',
    },
    alwaysResetFilters: {
      page: 1,
    },
  };

  const page = setup(params);

  const listState = page.getWrapperComponent().prop('listState');

  expect(listState).toEqual(collectListInitialState(params));
});

test('should provide redefine decorator params by component props', () => {
  const decoratorParams = {
    initialFilters: {
      filter: '',
    },
    sort: {
      param: 'param',
      asc: false,
    },
    appliedFilters: {
      filter: 'value',
    },
    alwaysResetFilters: {
      page: 1,
    },
    additional: {
      count: 0,
    },
  };

  const componentProps = {
    initialFilters: {
      filter2: '',
    },
    appliedFilters: {
      filter2: 'value2',
    },
    additional: {
      count: 10,
    },
  };

  const resultParams = {
    ...decoratorParams,
    ...componentProps,
  };

  const page = setup(decoratorParams, {}, componentProps);

  const listState = page.getWrapperComponent().prop('listState');

  expect(listState).toEqual(collectListInitialState(resultParams));
});

test('should provide loadItems', () => {
  const loadItems = jest.fn();

  const page = setup({
    loadItems,
  });

  expect(page.getWrapperComponent().prop('loadItems')).toBe(loadItems);
});

test('should provide onBeforeRequest', () => {
  const onBeforeRequest = jest.fn();

  const page = setup({
    onBeforeRequest,
  });

  expect(page.getWrapperComponent().prop('onBeforeRequest')).toBe(onBeforeRequest);
});

test('should dispatch registerList', () => {
  const page = setup();

  page.getListAction('registerList')('testId', {
    initialFilters: {
      filter: '',
    },
    appliedFilters: {
      filter: 'value',
    },
    sort: {
      param: 'param',
      asc: false,
    },
  }, {
    testProp: 'testValue',
  });

  expect(page.getStore().getActions()[0]).toEqual(
    registerList('testId', {
      initialFilters: {
        filter: '',
      },
      appliedFilters: {
        filter: 'value',
      },
      sort: {
        param: 'param',
        asc: false,
      },
    }, {
      testProp: 'testValue',
    }),
  );
});

test('should dispatch destroyList', () => {
  const page = setup();

  page.getListAction('destroyList')('testId');

  expect(page.getStore().getActions()[0]).toEqual(
    destroyList('testId'),
  );
});

test('should dispatch changeListState', () => {
  const page = setup();

  const newListState = Symbol('new list state');

  page.getListAction('changeListState')('testId', newListState, 'testAction');

  expect(page.getStore().getActions()[0]).toEqual(
    changeListState('testId', newListState, 'testAction'),
  );
});

test('should dispatch loadListSuccess', () => {
  const page = setup();

  page.getListAction('loadListSuccess')('testId', {
    items: [{
      id: 1,
    }, {
      id: 2,
    }, {
      id: 3,
    }],
    additional: {
      count: 3,
    },
  }, 4);

  expect(page.getStore().getActions()[0]).toEqual(
    loadListSuccess('testId', {
      items: [{
        id: 1,
      }, {
        id: 2,
      }, {
        id: 3,
      }],
      additional: {
        count: 3,
      },
    }, 4),
  );
});

test('should dispatch loadListError', () => {
  const page = setup();

  page.getListAction('loadListError')('testId', {
    error: 'Error',
    additional: null,
  }, 5);

  expect(page.getStore().getActions()[0]).toEqual(
    loadListError('testId', {
      error: 'Error',
      additional: null,
    }, 5),
  );
});

test('should dispatch insertItem', () => {
  const page = setup();

  page.getListAction('insertItem')('testId', 1, {
    id: 4,
  }, {
    additional: 4,
  });

  expect(page.getStore().getActions()[0]).toEqual(
    insertItem('testId', 1, {
      id: 4,
    }, {
      additional: 4,
    }),
  );
});

test('should dispatch deleteItem', () => {
  const page = setup();

  page.getListAction('deleteItem')('testId', 1, {
    additional: 4,
  });

  expect(page.getStore().getActions()[0]).toEqual(
    deleteItem('testId', 1, {
      additional: 4,
    }),
  );
});

test('should dispatch insertItem', () => {
  const page = setup();

  page.getListAction('updateItem')('testId', 1, {
    id: 4,
  }, {
    additional: 4,
  });

  expect(page.getStore().getActions()[0]).toEqual(
    updateItem('testId', 1, {
      id: 4,
    }, {
      additional: 4,
    }),
  );
});
