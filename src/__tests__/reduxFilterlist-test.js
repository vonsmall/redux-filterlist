import _reduxFilterlist from '../reduxFilterlist'
import ReduxFilterlistWrapper from '../ReduxFilterlistWrapper'
import collectListInitialState from '../collectListInitialState'

import {
  registerList,
  destroyList,

  loadList,
  loadListSuccess,
  loadListError,

  setFilterValue,
  applyFilter,
  setAndApplyFilter,
  resetFilter,

  setFiltersValues,
  applyFilters,
  setAndApplyFilters,
  resetFilters,
} from '../actions'

import {mount} from 'enzyme'
import sinon from 'sinon'

import React, {Component} from 'react'
import {Provider} from 'react-redux'
import configureStore from 'redux-mock-store'

const mockStore = configureStore([])

class TestWrapperComponent extends Component {
  render() {
    return <div />
  }
}

class TestChildComponent extends Component {
  render() {
    return <div />
  }
}

const reduxFilterlist = _reduxFilterlist.bind(null, ReduxFilterlistWrapper)

test('should render wrapper and child components without error', () => {
  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: () => {
      return Promise.resolve({
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
      })
    },
  })(TestChildComponent)

  const wrapper = mount(
    <Provider store={ mockStore({
      reduxFilterlist: {},
    }) }>
      <Container />
    </Provider>
  )

  expect(wrapper.find(ReduxFilterlistWrapper).length).toBe(1)
  expect(wrapper.find(TestChildComponent).length).toBe(1)
})

test('should throw an exception if listId is not defined', () => {
  expect(() => {
    const Container = reduxFilterlist({
      loadItems: () => {
        return Promise.resolve({
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
        })
      },
    })(TestChildComponent)

    mount(
      <Provider store={ mockStore({
        reduxFilterlist: {},
      }) }>
        <Container />
      </Provider>
    )
  })
    .toThrowError('listId is required')
})

test('should throw an exception if loadItems is not defined', () => {
  expect(() => {
    const Container = reduxFilterlist({
      listId: 'test',
    })(TestChildComponent)

    mount(
      <Provider store={ mockStore({
        reduxFilterlist: {},
      }) }>
        <Container />
      </Provider>
    )
  })
    .toThrowError('loadItems is required')
})

test('should throw an exception if loadItems is not a function', () => {
  expect(() => {
    const Container = reduxFilterlist({
      listId: 'test',
      loadItems: 123,
    })(TestChildComponent)

    mount(
      <Provider store={ mockStore({
        reduxFilterlist: {},
      }) }>
        <Container />
      </Provider>
    )
  })
    .toThrowError('loadItems should be a function')
})

test('should provide the correct props', () => {
  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: () => {
      return Promise.resolve({
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
      })
    },
  })(TestChildComponent)

  const wrapper = mount(
    <Provider store={ mockStore({
      reduxFilterlist: {},
    }) }>
      <Container />
    </Provider>
  )

  const props = wrapper.find(TestChildComponent).props()

  expect(Object.keys(props).sort())
    .toEqual([
      'applyFilter',
      'applyFilters',
      'listId',
      'listState',
      'loadItems',
      'resetFilter',
      'resetFilters',
      'setAndApplyFilter',
      'setAndApplyFilters',
      'setFilterValue',
      'setFiltersValues',
    ])

  expect(Object.keys(props.listState).sort())
    .toEqual([
      'additional',
      'appliedFilters',
      'error',
      'filters',
      'initialFilters',
      'items',
      'loading',
      'sort',
    ])
})

test('should provide the correct list state', () => {
  const Container = _reduxFilterlist(TestWrapperComponent, {
    listId: 'test',
    loadItems: () => {
      return Promise.resolve({
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
      })
    },
  })(TestChildComponent)

  const wrapper = mount(
    <Provider store={ mockStore({
      reduxFilterlist: {
        'test': {
          sort: {
            param: 'test',
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
      },
    }) }>
      <Container />
    </Provider>
  )

  const listState = wrapper.find(TestWrapperComponent).props().listState

  expect(listState).toEqual({
    sort: {
      param: 'test',
      asc: true,
    },
    initialFilters: {},
    filters: {},
    appliedFilters: {},
    loading: false,
    items: [1, 2, 3],
    additional: null,
    error: null,
  })
})

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
  }

  const Container = _reduxFilterlist(TestWrapperComponent, {
    ...params,
    listId: 'test',
    loadItems: () => {
      return Promise.resolve({
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
      })
    },
  })(TestChildComponent)

  const wrapper = mount(
    <Provider store={ mockStore({
      reduxFilterlist: {
      },
    }) }>
      <Container />
    </Provider>
  )

  const listState = wrapper.find(TestWrapperComponent).props().listState

  expect(listState).toEqual(collectListInitialState(params))
})

test('should dispatch registerList on init', () => {
  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: () => {
      return Promise.resolve({
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
      })
    },

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
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  expect(store.getActions()[0]).toEqual(
    registerList('test', {
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
    })
  )
})

test('should dispatch destroyList on unmount', () => {
  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: () => {
      return Promise.resolve({
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
      })
    },

    appliedFilters: {
      filter: 'value',
    },
    sort: {
      param: 'param',
      asc: false,
    },
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  const wrapper = mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  store.clearActions()

  wrapper.unmount()

  expect(store.getActions()[0]).toEqual(
    destroyList('test')
  )
})

test('should provide correct values to loadItems and call once on render', () => {
  const spy = sinon.spy(() => {
    return Promise.resolve({
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
    })
  })

  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: spy,
  })(TestChildComponent)

  mount(
    <Provider store={ mockStore({
      reduxFilterlist: {
        'test': {
          sort: {
            param: 'test',
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
      },
    }) }>
      <Container
        testProperty='testValue'
      />
    </Provider>
  )

  expect(spy.callCount).toBe(1)
  expect(spy.args).toEqual([
    [{
      sort: {
        param: 'test',
        asc: true,
      },
      initialFilters: {},
      filters: {},
      appliedFilters: {},
      loading: false,
      items: [1, 2, 3],
      additional: null,
      error: null,
    }, {
      testProperty: 'testValue',
    }],
  ])
})

test('should load items on init', () => {
  const spy = sinon.spy(() => {
    return Promise.resolve({
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
    })
  })

  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: spy,
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  return spy.returnValues[0]
    .then(() => {
      const actions = store.getActions()

      return expect(actions.slice(1, actions.length)).toEqual([
        loadList('test'),
        loadListSuccess('test', {
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
        }),
      ])
    }, () => {
      throw new Error('Must resolve')
    })
})

test('should load items from props', () => {
  const spy = sinon.spy(() => {
    return Promise.resolve({
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
    })
  })

  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: spy,
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  const wrapper = mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  return spy.returnValues[0]
    .then(() => {
      store.clearActions()

      return wrapper.find(TestChildComponent).props().loadItems()
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            loadList('test'),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    }, () => {
      throw new Error('Must resolve')
    })
})

test('should set load error on init', () => {
  const spy = sinon.spy(() => {
    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  })

  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: spy,
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  return spy.returnValues[0]
    .then(() => {
      throw new Error('Must reject')
    }, () => {
      const actions = store.getActions()

      expect(actions.slice(1, actions.length)).toEqual([
        loadList('test'),
        loadListError('test', {
          error: 'Error',
          additional: null,
        }),
      ])
    })
})

test('should set load error calling loadItems from props', () => {
  let callsCount = 0
  const spy = sinon.spy(() => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  })

  const Container = reduxFilterlist({
    listId: 'test',
    loadItems: spy,
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  const wrapper = mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  return spy.returnValues[0]
    .then(() => {
      store.clearActions()

      return wrapper.find(TestChildComponent).props().loadItems()
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            loadList('test'),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    }, () => {
      throw new Error('Must resolve')
    })
})

function initTestComponent(listId, loadItems, params) {
  const spy = sinon.spy(loadItems)

  const Container = reduxFilterlist({
    listId,
    loadItems: spy,

    ...params,
  })(TestChildComponent)

  const store = mockStore({
    reduxFilterlist: {},
  })

  const wrapper = mount(
    <Provider store={ store }>
      <Container />
    </Provider>
  )

  return spy.returnValues[0]
    .then(() => {
      store.clearActions()

      return Promise.resolve({
        store,
        child: wrapper.find(TestChildComponent),
      })
    }, () => {
      throw new Error('Must resolve')
    })
}

test('should dispatch setFilterValue from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      child.props().setFilterValue('testFilter', 'testValue')

      expect(store.getActions()[0]).toEqual(
        setFilterValue('test', 'testFilter', 'testValue')
      )
    })
})

test('should apply filter from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      child.props().setFilterValue('testFilter', 'testValue')

      return child.props().applyFilter('testFilter')
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            setFilterValue('test', 'testFilter', 'testValue'),
            applyFilter('test', 'testFilter'),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    })
})

test('should set load error calling applyFilter from props', () => {
  let callsCount = 0
  return initTestComponent('test', () => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  }, {})
    .then(({child, store}) => {
      child.props().setFilterValue('testFilter', 'testValue')

      return child.props().applyFilter('testFilter')
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            setFilterValue('test', 'testFilter', 'testValue'),
            applyFilter('test', 'testFilter'),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    })
})

test('should set and apply filter from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      return child.props().setAndApplyFilter('testFilter', 'testValue')
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            setAndApplyFilter('test', 'testFilter', 'testValue'),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    })
})

test('should set load error calling setAndApplyFilter from props', () => {
  let callsCount = 0
  return initTestComponent('test', () => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  }, {})
    .then(({child, store}) => {
      return child.props().setAndApplyFilter('testFilter', 'testValue')
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            setAndApplyFilter('test', 'testFilter', 'testValue'),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    })
})

test('should reset filter from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      return child.props().resetFilter('testFilter')
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            resetFilter('test', 'testFilter'),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    })
})

test('should set load error calling resetFilter from props', () => {
  let callsCount = 0
  return initTestComponent('test', () => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  }, {})
    .then(({child, store}) => {
      return child.props().resetFilter('testFilter')
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            resetFilter('test', 'testFilter'),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    })
})

test('should set multiple filters from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      child.props().setFiltersValues({
        filter1: 'value1',
        filter2: 'value2',
      })

      const actions = store.getActions()

      expect(actions).toEqual([
        setFiltersValues('test', {
          filter1: 'value1',
          filter2: 'value2',
        }),
      ])
    })
})

test('should apply multiple filters from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      return child.props().applyFilters(['filter1', 'filter2'])
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            applyFilters('test', ['filter1', 'filter2']),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    })
})

test('should set load error calling applyFilters from props', () => {
  let callsCount = 0
  return initTestComponent('test', () => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  }, {})
    .then(({child, store}) => {
      return child.props().applyFilters(['filter1', 'filter2'])
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            applyFilters('test', ['filter1', 'filter2']),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    })
})

test('should set and apply multiple filters from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      return child.props().setAndApplyFilters({
        filter1: 'value1',
        filter2: 'value2',
      })
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            setAndApplyFilters('test', {
              filter1: 'value1',
              filter2: 'value2',
            }),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    })
})

test('should set load error calling setAndApplyFilters from props', () => {
  let callsCount = 0
  return initTestComponent('test', () => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  }, {})
    .then(({child, store}) => {
      return child.props().setAndApplyFilters({
        filter1: 'value1',
        filter2: 'value2',
      })
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            setAndApplyFilters('test', {
              filter1: 'value1',
              filter2: 'value2',
            }),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    })
})

test('should reset multiple filters from props', () => {
  return initTestComponent('test', () => {
    return Promise.resolve({
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
    })
  }, {})
    .then(({child, store}) => {
      return child.props().resetFilters(['filter1', 'filter2'])
        .then(() => {
          const actions = store.getActions()

          expect(actions).toEqual([
            resetFilters('test', ['filter1', 'filter2']),
            loadListSuccess('test', {
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
            }),
          ])
        }, () => {
          throw new Error('Must resolve')
        })
    })
})

test('should set load error calling resetFilters from props', () => {
  let callsCount = 0
  return initTestComponent('test', () => {
    if (callsCount === 0) {
      ++callsCount

      return Promise.resolve({
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
      })
    }

    return Promise.reject({
      error: 'Error',
      additional: null,
    })
  }, {})
    .then(({child, store}) => {
      return child.props().resetFilters(['filter1', 'filter2'])
        .then(() => {
          throw new Error('Must reject')
        }, () => {
          const actions = store.getActions()

          expect(actions).toEqual([
            resetFilters('test', ['filter1', 'filter2']),
            loadListError('test', {
              error: 'Error',
              additional: null,
            }),
          ])
        })
    })
})