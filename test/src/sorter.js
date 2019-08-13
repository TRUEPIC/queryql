const knex = require('knex')({ client: 'pg' })

const Sorter = require('../../src/sorter')
const TestQuerier = require('../queriers/test')
const ValidationError = require('../../src/errors/validation')

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

describe('isEnabled', () => {
  test('returns whether sorting is enabled (in the schema)', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    expect(sorter.isEnabled).toBe(true)
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

  test('returns empty object if sorting is disabled', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('true')))

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false)

    expect(sorter.sortsFlat()).toEqual({})
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

  test('returns `null` if sorting is disabled, no query', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')))

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false)

    expect(sorter.parse()).toBeNull()
  })

  test('throws `ValidationError` if sorting is disabled, with query', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: 'test',
        },
        knex('test')
      )
    )

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false)

    expect(() => sorter.parse()).toThrow(
      new ValidationError('sort is disabled')
    )
  })
})

describe('run', () => {
  test('calls `querier.apply` for each sort in order of query', () => {
    const querier = new TestQuerier(
      {
        sort: ['testing', 'test'],
      },
      knex('test')
    )
    const sorter = new Sorter(querier)

    querier.apply = jest.fn()

    sorter.run()

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

  test('does not call `querier.apply` if sorting is disabled', () => {
    const querier = new TestQuerier({}, knex('test'))
    const sorter = new Sorter(querier)

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false)

    querier.apply = jest.fn()

    sorter.run()

    expect(querier.apply).not.toHaveBeenCalled()
  })

  test('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'))
    const sorter = new Sorter(querier)

    expect(sorter.run()).toBe(querier)
  })
})
