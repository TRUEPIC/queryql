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
