const BaseError = require('../../../src/errors/base')

test('extends Error', () => {
  expect(new BaseError('test')).toBeInstanceOf(Error)
})

describe('constructor', () => {
  test('accepts a message to set', () => {
    expect(new BaseError('test').message).toBe('test')
  })

  test('captures the stack trace', () => {
    expect(new BaseError('test').stack).toMatch('BaseError')
  })

  test('sets the `name` property to the class name', () => {
    expect(new BaseError('test').name).toBe('BaseError')
  })
})
