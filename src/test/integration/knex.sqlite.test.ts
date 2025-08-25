import knexModule from 'knex'
import QueryQL from '../..'
import type { Schema } from '../../schema'
import qs from 'qs'

interface User {
  id?: number
  name: string
  age: number
}

describe('sqlite integration (knex)', () => {
  const knex = knexModule({
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
  })

  beforeAll(async () => {
    await knex.schema.createTable('users', (t) => {
      t.increments('id')
      t.string('name')
      t.integer('age')
    })

    await knex('users').insert([
      { name: 'alice', age: 30 },
      { name: 'bob', age: 20 },
      { name: 'carol', age: 25 },
      { name: 'dave', age: 35 },
      { name: 'erin', age: 40 },
    ])
  })

  afterAll(async () => {
    await knex.destroy()
  })

  class UsersQuerier extends QueryQL {
    defineSchema(schema: Schema): void {
      schema.filter('age', '=')
      schema.filter('name', '=')
      schema.sort('age')
      schema.page()
    }
  }

  test('filter by equality returns correct rows', async () => {
    const query = qs.parse('filter[age]=30')
    const querier = new UsersQuerier(query, knex('users'))

    const rows = await querier.run()

    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('alice')
  })

  test('QueryQL applies sort ascending (sort=age)', async () => {
    const query = qs.parse('sort=age')
    const querier = new UsersQuerier(query, knex('users'))

    const qRows = await querier.run()
    const expected = await knex('users').orderBy('age', 'asc')

    expect(qRows.map((r: User) => r.age)).toEqual(
      expected.map((r: User) => r.age),
    )
  })

  test('QueryQL applies sort descending (sort[age]=desc)', async () => {
    const query = qs.parse('sort[age]=desc')
    const querier = new UsersQuerier(query, knex('users'))

    const qRows = await querier.run()
    const expected = await knex('users').orderBy('age', 'desc')

    expect(qRows.map((r: User) => r.age)).toEqual(
      expected.map((r: User) => r.age),
    )
  })

  test('QueryQL applies pagination with sort (page[size], page[number])', async () => {
    // ask for page 2 of size 2, with explicit sort by age to make ordering deterministic
    const query = qs.parse('sort=age&page[size]=2&page[number]=2')
    const querier = new UsersQuerier(query, knex('users'))

    const qRows = await querier.run()

    // expected: same as knex ordering then limit/offset
    const pageParam = query.page as
      | { size?: string; number?: string }
      | undefined
    const size = Number(pageParam?.size ?? 10) // default to 10 if not provided
    const number = Number(pageParam?.number ?? 1) // default to 1 if not provided
    const expected = await knex('users')
      .orderBy('age', 'asc')
      .limit(size)
      .offset((number - 1) * size)

    expect(qRows.map((r: User) => r.age)).toEqual(
      expected.map((r: User) => r.age),
    )
  })

  test('QueryQL applies combined filter, sort, and pagination', async () => {
    // filter by name=carol, sort desc by age (trivial here), page size 1 page 1
    const query = qs.parse(
      'filter[name]=carol&sort[age]=desc&page[size]=1&page[number]=1',
    )
    const querier = new UsersQuerier(query, knex('users'))

    const qRows = await querier.run()

    // Expected via knex: where name = 'carol', orderBy age desc, limit 1 offset 0
    const expected = await knex('users')
      .where('name', '=', 'carol')
      .orderBy('age', 'desc')
      .limit(1)
      .offset(0)

    expect(qRows).toHaveLength(expected.length)
    expect(qRows.map((r: User) => r.name)).toEqual(
      expected.map((r: User) => r.name),
    )
  })
})
