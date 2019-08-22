const knex = require('knex')({ client: 'pg' })

const BaseValidator = require('../../../../src/validators/querier/base')
const NotImplementedError = require('../../../../src/errors/not_implemented')
const TestQuerier = require('../../../queriers/test')
const ValidationError = require('../../../../src/errors/validation')

describe('constructor', () => {
  test('accepts a querier to set', () => {
    const querier = new TestQuerier({}, knex('test'))

    expect(new BaseValidator(querier).querier).toBe(querier)
  })

  test('calls `querier.defineValidation` and sets the returned value', () => {
    const querier = new TestQuerier({}, knex('test'))

    querier.defineValidation = jest.fn(() => 'test')

    expect(new BaseValidator(querier).schema).toBe('test')
    expect(querier.defineValidation).toHaveBeenCalled()
  })
})

describe('validate', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const validator = new BaseValidator(new TestQuerier({}, knex('test')))

    expect(() => validator.validate()).toThrow(NotImplementedError)
  })
})

describe('defineValidationArgs', () => {
  test('returns no arguments to call `querier.defineValidation` with', () => {
    const validator = new BaseValidator(new TestQuerier({}, knex('test')))

    expect(validator.defineValidationArgs).toEqual([])
  })
})

describe('values', () => {
  test('returns object with all filter, sort, and page values', () => {
    const validator = new BaseValidator(
      new TestQuerier({
        filter: { test: 123 },
        sort: 'test',
        page: 2,
      })
    )

    expect(validator.values).toEqual({
      'filter:test[=]': 123,
      'sort:test': 'asc',
      'page:size': 20,
      'page:number': 2,
      'page:offset': 20,
    })
  })
})

describe('buildError', () => {
  test('returns `ValidationError` with the specified message', () => {
    const validator = new BaseValidator(new TestQuerier({}, knex('test')))

    expect(validator.buildError('test')).toEqual(new ValidationError('test'))
  })
})
