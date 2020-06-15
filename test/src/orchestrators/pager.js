const knex = require('knex')({ client: 'pg' })

const EmptyQuerier = require('../../queriers/empty')
const Pager = require('../../../src/orchestrators/pager')
const TestQuerier = require('../../queriers/test')
const ValidationError = require('../../../src/errors/validation')

describe('queryKey', () => {
  test('returns the key for pagination in the query', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    expect(pager.queryKey).toBe('page')
  })
})

describe('schema', () => {
  test('returns the schema for pagination', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    expect(pager.schema.isEnabled).toBe(true)
  })
})

describe('isEnabled', () => {
  test('returns `true` if pagination is enabled in the schema', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    expect(pager.isEnabled).toBe(true)
  })

  test('returns `false` if pagination is disabled in the schema', () => {
    const pager = new Pager(new EmptyQuerier({}, knex('test')))

    expect(pager.isEnabled).toBe(false)
  })
})

describe('parse', () => {
  test('parses/returns the pagination from the query', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    )

    expect(pager.parse().get('page:number').value).toBe(2)
  })

  test('calls/uses `querier.defaultPage` if no query', () => {
    const querier = new TestQuerier({}, knex('test'))

    const defaultPage = jest
      .spyOn(querier, 'defaultPage', 'get')
      .mockReturnValue(2)

    const pager = new Pager(querier)
    const parsed = pager.parse()

    expect(pager.query).toBeFalsy()
    expect(defaultPage).toHaveBeenCalled()
    expect(parsed.get('page:number').value).toBe(2)

    defaultPage.mockRestore()
  })
})

describe('validate', () => {
  test('returns `true` if valid', () => {
    const pager = new Pager(new TestQuerier({ page: 2 }, knex('test')))

    expect(pager.validate()).toBe(true)
  })

  test('returns `true` if disabled', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false)

    expect(pager.validate()).toBe(true)
  })

  test('throws `ValidationError` if invalid', () => {
    const pager = new Pager(new TestQuerier({ page: 'invalid' }, knex('test')))

    expect(() => pager.validate()).toThrow(
      new ValidationError('page must be one of [number, object]')
    )
  })
})

describe('run', () => {
  test('applies pagination', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    )

    pager.apply = jest.fn()

    pager.run()

    expect(pager.apply).toHaveBeenCalledWith({
      size: 20,
      number: 2,
      offset: 20,
    })
  })

  test('does not apply pagination if disabled', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false)
    pager.apply = jest.fn()

    pager.run()

    expect(pager.apply).not.toHaveBeenCalled()
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const pager = new Pager(querier)

    pager.apply = jest.fn()

    expect(pager.run()).toBe(querier)
  })

  test('throws `ValidationError` if invalid', () => {
    const pager = new Pager(new TestQuerier({ page: 'invalid' }, knex('test')))

    expect(() => pager.run()).toThrow(
      new ValidationError('page must be one of [number, object]')
    )
  })
})
