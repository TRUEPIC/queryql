const knex = require('knex')({ client: 'pg' })

const EmptyQuerier = require('../../queriers/empty')
const Filterer = require('../../../src/orchestrators/filterer')
const TestQuerier = require('../../queriers/test')
const ValidationError = require('../../../src/errors/validation')

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

    expect(filterer.parse().has('filter:test[=]')).toBe(true)
  })

  test('calls/uses `querier.defaultFilter` if no query', () => {
    const querier = new TestQuerier({}, knex('test'))

    const defaultFilter = jest
      .spyOn(querier, 'defaultFilter', 'get')
      .mockReturnValue({ test: 123 })

    const filterer = new Filterer(querier)
    const parsed = filterer.parse()

    expect(filterer.query).toBeFalsy()
    expect(defaultFilter).toHaveBeenCalled()
    expect(parsed.has('filter:test[=]')).toBe(true)

    defaultFilter.mockRestore()
  })
})

describe('validate', () => {
  test('returns `true` if valid', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { test: 123 } }, knex('test'))
    )

    expect(filterer.validate()).toBe(true)
  })

  test('returns `true` if disabled', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')))

    jest.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false)

    expect(filterer.validate()).toBe(true)
  })

  test('throws `ValidationError` if invalid', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { invalid: 123 } }, knex('test'))
    )

    expect(() => filterer.validate()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
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
        name: 'test',
        field: 'test',
        operator: '=',
        value: 123,
      },
      'filter:test[=]'
    )

    expect(filterer.apply).toHaveBeenNthCalledWith(
      2,
      {
        name: 'testing',
        field: 'testing',
        operator: '!=',
        value: 456,
      },
      'filter:testing[!=]'
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

  test('throws `ValidationError` if invalid', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { invalid: 123 } }, knex('test'))
    )

    expect(() => filterer.run()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
  })
})
