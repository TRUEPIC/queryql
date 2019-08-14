const knex = require('knex')({ client: 'pg' })

const EmptyQuerier = require('../../queriers/empty')
const Pager = require('../../../src/orchestrators/pager')
const TestQuerier = require('../../queriers/test')

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

describe('parseFlat', () => {
  test('returns object with pagination keys => values', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    )

    expect(pager.parseFlat()).toEqual({
      'page:size': 20,
      'page:number': 2,
      'page:offset': 20,
    })
  })

  test('returns empty object if pagination is disabled', () => {
    const pager = new Pager(new TestQuerier({}, knex('true')))

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false)

    expect(pager.parseFlat()).toEqual({})
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
})
