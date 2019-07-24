const knex = require('knex')({ client: 'pg' })

const Filterer = require('../../src/filterer')
const TestQuerier = require('../queriers/test')

describe('constructor', () => {
  test('accepts a querier to set', () => {
    const querier = new TestQuerier({}, knex('test'))
    const filterer = new Filterer(querier)

    expect(filterer.querier).toBe(querier)
  })
})

describe('queryKey', () => {
  test('returns the key for filters in the query', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    expect(filterer.queryKey).toBe('filter')
  })
})

describe('query', () => {
  test('returns the filters from the query', () => {
    const filter = { test: 123 }
    const filterer = new Filterer(new TestQuerier({ filter }, knex('test')))

    expect(filterer.query).toEqual(filter)
  })
})

describe('schema', () => {
  test('returns the schema for filters', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    expect(filterer.schema.has('test[=]')).toBe(true)
  })
})

describe('filters', () => {
  test('returns the parsed filters', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: { test: 123 },
        },
        knex('test')
      )
    )

    expect(filterer.filters.has('test[=]')).toBe(true)
  })
})

describe('filtersFlat', () => {
  test('returns object with filter keys => values', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: { test: 123 },
        },
        knex('test')
      )
    )

    expect(filterer.filtersFlat()).toEqual({
      'filter:test[=]': 123,
    })
  })
})

describe('parse', () => {
  test('parses/returns the filters from the query', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: { test: 123 },
        },
        knex('test')
      )
    )

    expect(filterer.parse().has('test[=]')).toBe(true)
  })

  test('calls/uses `querier.defaultFilter` if no query', () => {
    const querier = new TestQuerier({}, knex('test'))
    const filterer = new Filterer(querier)

    const defaultFilter = jest
      .spyOn(querier, 'defaultFilter', 'get')
      .mockReturnValue({ test: 123 })

    const parsed = filterer.parse()

    expect(filterer.query).toBeFalsy()
    expect(defaultFilter).toHaveBeenCalled()
    expect(parsed.has('test[=]')).toBe(true)
  })
})

describe('build', () => {
  test('calls `querier.apply` for each filter in order of schema', () => {
    const querier = new TestQuerier(
      {
        filter: {
          testing: { '!=': 456 },
          test: 123,
        },
      },
      knex('test')
    )
    const filterer = new Filterer(querier)

    querier.apply = jest.fn()

    filterer.build()

    expect(querier.apply).toHaveBeenNthCalledWith(
      1,
      filterer.queryKey,
      {
        field: 'test',
        operator: '=',
        value: 123,
      },
      `${filterer.queryKey}:test[=]`
    )

    expect(querier.apply).toHaveBeenNthCalledWith(
      2,
      filterer.queryKey,
      {
        field: 'testing',
        operator: '!=',
        value: 456,
      },
      `${filterer.queryKey}:testing[!=]`
    )
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const filterer = new Filterer(querier)

    expect(filterer.build()).toBe(querier)
  })
})
