const knex = require('knex')({ client: 'pg' })

const Pager = require('../../src/pager')
const TestQuerier = require('../queriers/test')

describe('constructor', () => {
  test('accepts a querier to set', () => {
    const querier = new TestQuerier({}, knex('test'))
    const pager = new Pager(querier)

    expect(pager.querier).toBe(querier)
  })
})

describe('queryKey', () => {
  test('returns the key for pagination in the query', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    expect(pager.queryKey).toBe('page')
  })
})

describe('query', () => {
  test('returns the pagination from the query', () => {
    const page = 2
    const pager = new Pager(new TestQuerier({ page }, knex('test')))

    expect(pager.query).toBe(page)
  })
})

describe('schema', () => {
  test('returns the schema for pagination', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    expect(pager.schema.isEnabled).toBe(true)
  })
})

describe('isEnabled', () => {
  test('returns whether pagination is enabled (in the schema)', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')))

    expect(pager.isEnabled).toBe(true)
  })
})

describe('page', () => {
  test('returns the parsed pagination', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    )

    expect(pager.page.number).toBe(2)
  })
})

describe('pageFlat', () => {
  test('returns object with pagination keys => values', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    )

    expect(pager.pageFlat()).toEqual({
      'page:size': 20,
      'page:number': 2,
      'page:offset': 20,
    })
  })

  test('returns empty object if pagination is disabled', () => {
    const querier = new TestQuerier({}, knex('true'))
    const pager = new Pager(querier)

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false)

    expect(pager.pageFlat()).toEqual({})
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

    expect(pager.parse().number).toBe(2)
  })

  test('calls/uses `querier.defaultPage` if no query', () => {
    const querier = new TestQuerier({}, knex('test'))
    const pager = new Pager(querier)

    const defaultPage = jest
      .spyOn(querier, 'defaultPage', 'get')
      .mockReturnValue(2)

    const parsed = pager.parse()

    expect(pager.query).toBeFalsy()
    expect(defaultPage).toHaveBeenCalled()
    expect(parsed.number).toBe(2)
  })

  test('returns `false` if pagination is disabled', () => {
    const querier = new TestQuerier({}, knex('test'))
    const pager = new Pager(querier)

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false)

    expect(pager.parse()).toBe(false)
  })
})

describe('build', () => {
  test('calls `querier.apply` if pagination is enabled', () => {
    const querier = new TestQuerier(
      {
        page: 2,
      },
      knex('test')
    )
    const pager = new Pager(querier)

    querier.apply = jest.fn()

    pager.build()

    expect(querier.apply).toHaveBeenCalledWith(pager.queryKey, {
      size: 20,
      number: 2,
      offset: 20,
    })
  })

  test('does not call `querier.apply` if pagination is disabled', () => {
    const querier = new TestQuerier({}, knex('test'))
    const pager = new Pager(querier)

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false)

    querier.apply = jest.fn()

    pager.build()

    expect(querier.apply).not.toHaveBeenCalled()
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const pager = new Pager(querier)

    querier.apply = jest.fn()

    expect(pager.build()).toBe(querier)
  })
})
