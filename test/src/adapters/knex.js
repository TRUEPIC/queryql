const knex = require('knex')({ client: 'pg' })

const KnexAdapter = require('../../../src/adapters/knex')

describe('filter', () => {
  test('supports the `=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '=', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" = 123')
  })

  test('supports the `!=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '!=', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" != 123')
  })

  test('supports the `<>` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '<>', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" <> 123')
  })

  test('supports the `>` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '>', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" > 123')
  })

  test('supports the `>=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '>=', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" >= 123')
  })

  test('supports the `<` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '<', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" < 123')
  })

  test('supports the `<=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '<=', value: 123 })
      .toString()

    expect(query).toBe('select * from "test" where "test" <= 123')
  })

  test('supports the `is` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: 'is', value: null })
      .toString()

    expect(query).toBe('select * from "test" where "test" is null')
  })

  test('supports the `is not` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: 'is not', value: null })
      .toString()

    expect(query).toBe('select * from "test" where "test" is not null')
  })

  test('supports the `in` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'in',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" in (123, 456)')
  })

  test('supports the `not in` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not in',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" not in (123, 456)')
  })

  test('supports the `like` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: 'like', value: '%123%' })
      .toString()

    expect(query).toBe('select * from "test" where "test" like \'%123%\'')
  })

  test('supports the `not like` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not like',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" not like \'%123%\'')
  })

  test('supports the `ilike` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'ilike',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" ilike \'%123%\'')
  })

  test('supports the `not ilike` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not ilike',
        value: '%123%',
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" not ilike \'%123%\'')
  })

  test('supports the `between` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'between',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe('select * from "test" where "test" between 123 and 456')
  })

  test('supports the `not between` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not between',
        value: [123, 456],
      })
      .toString()

    expect(query).toBe(
      'select * from "test" where "test" not between 123 and 456'
    )
  })
})

describe('sort', () => {
  test('adds an `order by` clause', () => {
    const query = new KnexAdapter()
      .sort(knex('test'), { field: 'test', order: 'desc' })
      .toString()

    expect(query).toBe('select * from "test" order by "test" desc')
  })
})

describe('page', () => {
  test('adds a `limit` clause', () => {
    const query = new KnexAdapter()
      .page(knex('test'), { size: 10, offset: 20 })
      .toString()

    expect(query).toBe('select * from "test" limit 10 offset 20')
  })
})
