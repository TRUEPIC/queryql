const flattenMap = require('../../../src/services/flatten_map')

test('uses the map key/value as the object key/value by default', () => {
  const map = new Map([
    ['test', 123],
    ['testing', 456],
  ])

  expect(flattenMap({ map })).toEqual({
    test: 123,
    testing: 456,
  })
})

test('optionally calls a `key` function to build the key', () => {
  const map = new Map([['test', 123]])
  const key = (key, value) => `${key}:${value}`

  expect(flattenMap({ map, key })).toEqual({
    'test:123': 123,
  })
})

test('optionally calls a `value` function to build the value', () => {
  const map = new Map([['test', 123]])
  const value = (value, key) => `${value}:${key}`

  expect(flattenMap({ map, value })).toEqual({
    test: '123:test',
  })
})

test('returns an empty object if the map is empty', () => {
  const map = new Map()

  expect(flattenMap({ map })).toEqual({})
})
