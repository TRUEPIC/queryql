const Joi = require('@hapi/joi')
const knex = require('knex')({ client: 'pg' })

const JoiValidator = require('../../../../src/validators/querier/joi')
const TestQuerier = require('../../../queriers/test')
const ValidationError = require('../../../../src/errors/validation')

describe('constructor', () => {
  test('calls `querier.defineValidation` with `Joi`', () => {
    const querier = new TestQuerier({}, knex('test'))
    const schema = Joi.number()

    querier.defineValidation = jest.fn(() => schema)

    expect(new JoiValidator(querier).schema).toBe(schema)
    expect(querier.defineValidation).toHaveBeenCalledWith(Joi)
  })
})

describe('defineValidationArgs', () => {
  test('returns `Joi` argument to call `querier.defineValidation` with', () => {
    const validator = new JoiValidator(new TestQuerier({}, knex('test')))

    expect(validator.defineValidationArgs).toEqual([Joi])
  })
})

describe('buildError', () => {
  test('returns a `ValidationError`', () => {
    const validator = new JoiValidator(new TestQuerier({}, knex('test')))
    const { error } = Joi.object()
      .keys({
        invalid: Joi.number(),
      })
      .validate({ invalid: 'invalid' })

    expect(validator.buildError(error)).toEqual(
      new ValidationError('invalid must be a number')
    )
  })
})

describe('validate', () => {
  test('returns `true` if valid', () => {
    const querier = new TestQuerier(
      {
        filter: { test: 123 },
      },
      knex('test')
    )

    querier.defineValidation = schema => ({
      'filter:test[=]': schema.number(),
    })

    expect(new JoiValidator(querier).validate()).toBe(true)
  })

  test('returns `true` if no validation is defined', () => {
    const validator = new JoiValidator(
      new TestQuerier(
        {
          filter: { test: 123 },
        },
        knex('test')
      )
    )

    expect(validator.schema).toBeUndefined()
    expect(validator.validate()).toBe(true)
  })

  test('throws `ValidationError` if invalid', () => {
    const querier = new TestQuerier(
      {
        filter: { test: 'invalid' },
      },
      knex('test')
    )

    querier.defineValidation = schema => ({
      'filter:test[=]': schema.number(),
    })

    expect(() => new JoiValidator(querier).validate()).toThrow(
      new ValidationError('filter:test[=] must be a number')
    )
  })
})
