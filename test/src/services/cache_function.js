const cacheFunction = require('../../../src/services/cache_function')

test('accepts/calls `func` and returns the value', () => {
  const value = 'test123'
  const func = jest.fn(() => value)

  expect(cacheFunction(func)()).toEqual(value)
  expect(func).toHaveBeenCalled()
})

test('accepts optional `bind` to set `this` for `func`', () => {
  const value = {
    value: 'test123',
    test() {
      return this.value
    },
  }

  expect(cacheFunction(value.test, value)()).toEqual(value.value)
})

test('sets `this` to `undefined` for `func` if `bind` not set', () => {
  const value = {
    value: 'test123',
    test() {
      return this.value
    },
  }

  expect(cacheFunction(value.test)()).toBeUndefined()
})

test('returns the cached value on subsequent calls', () => {
  const value = 'test123'
  const func = jest.fn(() => value)
  const cachedFunc = cacheFunction(func)

  expect(cachedFunc()).toEqual(value)
  expect(cachedFunc()).toEqual(value)
  expect(func).toHaveBeenCalledTimes(1)
})

test('does not cache the value if `undefined`', () => {
  const value = undefined
  const func = jest.fn(() => value)
  const cachedFunc = cacheFunction(func)

  expect(cachedFunc()).toEqual(value)
  expect(cachedFunc()).toEqual(value)
  expect(func).toHaveBeenCalledTimes(2)
})

test('does not cache the value if an error is thrown', () => {
  const error = new Error('test123')
  const func = jest.fn(() => {
    throw error
  })
  const cachedFunc = cacheFunction(func)

  expect(() => cachedFunc()).toThrow(error)
  expect(() => cachedFunc()).toThrow(error)
  expect(func).toHaveBeenCalledTimes(2)
})
