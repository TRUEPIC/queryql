const knex = require('knex')({ client: 'pg' })

const EmptyQuerier = require('../../queriers/empty')
const Filterer = require('../../../src/orchestrators/filterer')
const TestQuerier = require('../../queriers/test')

describe('queryKey', () => {
  test('returns the key for filters in the query', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    expect(filterer.queryKey).toBe('filter')
  })
})

describe('schema', () => {
  test('returns the schema for filters', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    expect(filterer.schema.has('test[=]')).toBe(true)
  })
})

describe('isEnabled', () => {
  test('returns `true` if >= 1 filter is whitelisted in the schema', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    expect(filterer.isEnabled).toBe(true)
  })

  test('returns `false` if no filter is whitelisted in the schema', () => {
    const filterer = new Filterer(new EmptyQuerier({}, knex('test')))

    expect(filterer.isEnabled).toBe(false)
  })
})

describe('parseFlat', () => {
  test('returns object with filter keys => values', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: { test: 123 },
        },
        knex('test')
      )
    )

    expect(filterer.parseFlat()).toEqual({
      'filter:test[=]': 123,
    })
  })

  test('returns empty object if filtering is disabled', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('true')))

    jest.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false)

    expect(filterer.parseFlat()).toEqual({})
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

describe('run', () => {
  test('applies each filter in order of schema', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: {
            testing: { '!=': 456 },
            test: 123,
          },
        },
        knex('test')
      )
    )

    filterer.apply = jest.fn()

    filterer.run()

    expect(filterer.apply).toHaveBeenNthCalledWith(
      1,
      {
        field: 'test',
        operator: '=',
        value: 123,
      },
      'test[=]'
    )

    expect(filterer.apply).toHaveBeenNthCalledWith(
      2,
      {
        field: 'testing',
        operator: '!=',
        value: 456,
      },
      'testing[!=]'
    )
  })

  test('does not apply filtering if disabled', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    jest.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false)
    filterer.apply = jest.fn()

    filterer.run()

    expect(filterer.apply).not.toHaveBeenCalled()
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const filterer = new Filterer(querier)

    expect(filterer.run()).toBe(querier)
  })
})
