const knex = require('knex')({ client: 'pg' })

const EmptyQuerier = require('../../queriers/empty')
const Sorter = require('../../../src/orchestrators/sorter')
const TestQuerier = require('../../queriers/test')

describe('queryKey', () => {
  test('returns the key for filters in the query', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    expect(sorter.queryKey).toBe('sort')
  })
})

describe('schema', () => {
  test('returns the schema for sorts', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    expect(sorter.schema.has('test')).toBe(true)
  })
})

describe('isEnabled', () => {
  test('returns `true` if >= 1 sort is whitelisted in the schema', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    expect(sorter.isEnabled).toBe(true)
  })

  test('returns `false` if no sort is whitelisted in the schema', () => {
    const sorter = new Sorter(new EmptyQuerier({}, knex('test')))

    expect(sorter.isEnabled).toBe(false)
  })
})

describe('parseFlat', () => {
  test('returns object with sort keys => orders', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: 'test',
        },
        knex('test')
      )
    )

    expect(sorter.parseFlat()).toEqual({
      'sort:test': 'asc',
    })
  })

  test('returns empty object if sorting is disabled', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('true')))

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false)

    expect(sorter.parseFlat()).toEqual({})
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

describe('run', () => {
  test('applies each sort in order of query', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: ['testing', 'test'],
        },
        knex('test')
      )
    )

    sorter.apply = jest.fn()

    sorter.run()

    expect(sorter.apply).toHaveBeenNthCalledWith(
      1,
      {
        field: 'testing',
        order: 'asc',
      },
      'testing'
    )

    expect(sorter.apply).toHaveBeenNthCalledWith(
      2,
      {
        field: 'test',
        order: 'asc',
      },
      'test'
    )
  })

  test('does not apply sorting if disabled', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false)
    sorter.apply = jest.fn()

    sorter.run()

    expect(sorter.apply).not.toHaveBeenCalled()
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const sorter = new Sorter(querier)

    expect(sorter.run()).toBe(querier)
  })
})
