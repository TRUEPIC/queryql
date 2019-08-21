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

describe('apply', () => {
  test('calls/returns method on querier if method defined', () => {
    const querier = new TestQuerier({ sort: 'test' }, knex('test'))
    const data = {
      field: 'test',
      order: 'asc',
    }

    querier['sort:test'] = jest.fn((builder, { field, order }) =>
      builder.orderBy(field, order)
    )

    expect(querier.apply('sort', data, 'sort:test')).toBe(querier.builder)
    expect(querier['sort:test']).toHaveBeenCalledWith(querier.builder, data)
  })

  test('calls/returns method on adapter if querier method not defined', () => {
    const querier = new TestQuerier({ sort: 'test' }, knex('test'))
    const data = {
      field: 'test',
      order: 'asc',
    }

    jest.spyOn(querier.adapter, 'sort')

    expect(querier.apply('sort', data, 'sort:test')).toBe(querier.builder)
    expect(querier.adapter.sort).toHaveBeenCalledWith(querier.builder, data)
  })

  test('calls/returns method on adapter if no querier method specified', () => {
    const querier = new TestQuerier({ page: 2 }, knex('test'))
    const data = {
      size: 20,
      number: 2,
      offset: 20,
    }

    jest.spyOn(querier.adapter, 'page')

    expect(querier.apply('page', data)).toBe(querier.builder)
    expect(querier.adapter.page).toHaveBeenCalledWith(querier.builder, data)
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

  test('throws `ValidationError` if query schema invalid', () => {
    const querier = new TestQuerier({ filter: { invalid: 123 } }, knex('test'))

    expect(() => querier.run()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
  })

  test('throws `ValidationError` if querier-defined schema invalid', () => {
    const defineValidation = jest
      .spyOn(TestQuerier.prototype, 'defineValidation')
      .mockImplementation(schema =>
        schema.object().keys({
          'filter:test[=]': schema.string(),
        })
      )

    const querier = new TestQuerier({ filter: { test: 123 } }, knex('test'))

    expect(() => querier.run()).toThrow(
      new ValidationError('filter:test[=] must be a string')
    )

    defineValidation.mockRestore()
  })

  test('throws `ValidationError` if adapter-defined schema invalid', () => {
    const querier = new TestQuerier(
      {
        filter: {
          test: { '=': null },
        },
      },
      knex('test')
    )

    expect(() => querier.run()).toThrow(
      new ValidationError('filter:test[=] must be an array')
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
