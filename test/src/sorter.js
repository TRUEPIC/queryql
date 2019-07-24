const knex = require('knex')({ client: 'pg' })

const Sorter = require('../../src/sorter')
const TestQuerier = require('../queriers/test')

describe('constructor', () => {
  test('accepts a querier to set', () => {
    const querier = new TestQuerier({}, knex('test'))
    const sorter = new Sorter(querier)

    expect(sorter.querier).toBe(querier)
  })
})

describe('queryKey', () => {
  test('returns the key for filters in the query', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    expect(sorter.queryKey).toBe('sort')
  })
})

describe('query', () => {
  test('returns the sorts from the query', () => {
    const sort = 'test'
    const sorter = new Sorter(new TestQuerier({ sort }, knex('test')))

    expect(sorter.query).toBe(sort)
  })
})

describe('schema', () => {
  test('returns the schema for sorts', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    expect(sorter.schema.has('test')).toBe(true)
  })
})

describe('sorts', () => {
  test('returns the parsed sorts', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: 'test',
        },
        knex('test')
      )
    )

    expect(sorter.sorts.has('test')).toBe(true)
  })
})

describe('sortsFlat', () => {
  test('returns object with sort keys => orders', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: 'test',
        },
        knex('test')
      )
    )

    expect(sorter.sortsFlat()).toEqual({
      'sort:test': 'asc',
    })
  })
})

describe('parse', () => {
  test('parses/returns the sorts from the query', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: 'test',
        },
        knex('test')
      )
    )

    expect(sorter.parse().has('test')).toBe(true)
  })

  test('calls/uses `querier.defaultSort` if no query', () => {
    const querier = new TestQuerier({}, knex('test'))
    const sorter = new Sorter(querier)

    const defaultSort = jest
      .spyOn(querier, 'defaultSort', 'get')
      .mockReturnValue('test')

    const parsed = sorter.parse()

    expect(sorter.query).toBeFalsy()
    expect(defaultSort).toHaveBeenCalled()
    expect(parsed.has('test')).toBe(true)
  })
})

describe('build', () => {
  test('calls `querier.apply` for each sort in order of query', () => {
    const querier = new TestQuerier(
      {
        sort: ['testing', 'test'],
      },
      knex('test')
    )
    const sorter = new Sorter(querier)

    querier.apply = jest.fn()

    sorter.build()

    expect(querier.apply).toHaveBeenNthCalledWith(
      1,
      sorter.queryKey,
      {
        field: 'testing',
        order: 'asc',
      },
      `${sorter.queryKey}:testing`
    )

    expect(querier.apply).toHaveBeenNthCalledWith(
      2,
      sorter.queryKey,
      {
        field: 'test',
        order: 'asc',
      },
      `${sorter.queryKey}:test`
    )
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const sorter = new Sorter(querier)

    expect(sorter.build()).toBe(querier)
  })
})
