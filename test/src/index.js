const knex = require('knex')({ client: 'pg' })

const Config = require('../../src/config')
const EmptyQuerier = require('../queriers/empty')
const NotImplementedError = require('../../src/errors/not_implemented')
const QueryQL = require('../../src')
const TestQuerier = require('../queriers/test')
const ValidationError = require('../../src/errors/validation')

describe('constructor', () => {
  test('accepts a query to set', () => {
    const query = { page: 2 }
    const querier = new TestQuerier(query, knex('test'))

    expect(querier.query).toEqual(query)
  })

  test('accepts a builder to set', () => {
    const builder = knex('test')
    const querier = new TestQuerier({}, builder)

    expect(querier.builder).toBe(builder)
  })

  test('accepts an optional config to set', () => {
    const config = { test: 123 }
    const querier = new TestQuerier({}, knex('test'), config)

    expect(querier.config.get()).toMatchObject(config)
  })

  test('calls `defineSchema` with a schema instance', () => {
    const defineSchema = jest.spyOn(TestQuerier.prototype, 'defineSchema')

    const querier = new TestQuerier({}, knex('test'))

    expect(defineSchema).toHaveBeenCalledWith(querier.schema)

    defineSchema.mockRestore()
  })

  test('creates an instance of the configured adapter', () => {
    const adapter = jest.fn()

    new TestQuerier({}, knex('test'), { adapter })

    expect(adapter.mock.instances).toHaveLength(1)
  })

  test('creates an instance of the configured validator', () => {
    const validator = jest.fn()

    new TestQuerier({}, knex('test'), { validator })

    expect(validator.mock.instances).toHaveLength(1)
  })
})

describe('defineSchema', () => {
  test('throws `NotImplementedError` when not extended', () => {
    expect(() => new QueryQL({}, knex('test'))).toThrow(NotImplementedError)
  })
})

describe('defineValidation', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.defineValidation()).toBeUndefined()
  })
})

describe('defaultFilter', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.defaultFilter).toBeUndefined()
  })
})

describe('defaultSort', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.defaultSort).toBeUndefined()
  })
})

describe('defaultPage', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.defaultPage).toBeUndefined()
  })
})

describe('filterDefaults', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.filterDefaults).toBeUndefined()
  })
})

describe('sortDefaults', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.sortDefaults).toBeUndefined()
  })
})

describe('pageDefaults', () => {
  test('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.pageDefaults).toBeUndefined()
  })
})

describe('validate', () => {
  test('returns `true` if valid', () => {
    const querier = new TestQuerier(
      {
        filter: { test: 123 },
        sort: 'test',
        page: 2,
      },
      knex('test')
    )

    expect(querier.validate()).toBe(true)
  })

  test('throws `ValidationError` if a filter is invalid', () => {
    const querier = new TestQuerier({ filter: { invalid: 123 } }, knex('test'))

    expect(() => querier.validate()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
  })

  test('throws `ValidationError` if a sort is invalid', () => {
    const querier = new TestQuerier({ sort: { test: 'invalid' } }, knex('test'))

    expect(() => querier.validate()).toThrow(
      new ValidationError('sort:test must be one of [asc, desc]')
    )
  })

  test('throws `ValidationError` if pagination is invalid', () => {
    const querier = new TestQuerier({ page: 'invalid' }, knex('test'))

    expect(() => querier.validate()).toThrow(
      new ValidationError('page must be one of [number, object]')
    )
  })
})

describe('run', () => {
  test('returns the builder with filters, sorts, pagination applied', () => {
    const querier = new TestQuerier(
      {
        filter: { test: 123 },
        sort: 'test',
        page: 2,
      },
      knex('test')
    )

    expect(querier.run().toString()).toBe(
      'select * ' +
        'from "test" ' +
        'where "test" = 123 ' +
        'order by "test" asc ' +
        'limit 20 offset 20'
    )
  })

  test('throws `ValidationError` if invalid', () => {
    const querier = new TestQuerier({ filter: { invalid: 123 } }, knex('test'))

    expect(() => querier.run()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
  })
})

describe('exports', () => {
  test('the QueryQL class', () => {
    expect(QueryQL.name).toBe('QueryQL')
  })

  test('an object of adapter classes', () => {
    expect(QueryQL.adapters).toHaveProperty('BaseAdapter')
  })

  test('the Config class', () => {
    expect(QueryQL.Config).toBe(Config)
  })

  test('an object of error classes', () => {
    expect(QueryQL.errors).toHaveProperty('BaseError')
  })

  test('an object of validator classes', () => {
    expect(QueryQL.validators).toHaveProperty('BaseValidator')
  })
})
