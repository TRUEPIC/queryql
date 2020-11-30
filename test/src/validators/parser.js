const Joi = require('@hapi/joi')

const ParserValidator = require('../../../src/validators/parser')
const ValidationError = require('../../../src/errors/validation')

describe('constructor', () => {
  test('accepts/calls `defineSchema` and sets the returned value', () => {
    const schema = Joi.number()
    const defineSchema = jest.fn(() => schema)
    const validator = new ParserValidator(defineSchema, 'test', 123)

    expect(defineSchema).toHaveBeenCalledWith(Joi)
    expect(validator.schema).toBe(schema)
  })

  test('accepts a query key to set', () => {
    const queryKey = 'test'
    const validator = new ParserValidator(() => {}, queryKey, 123)

    expect(validator.queryKey).toBe(queryKey)
  })

  test('accepts a query to set', () => {
    const query = 123
    const validator = new ParserValidator(() => {}, 'test', query)

    expect(validator.query).toBe(query)
  })
})

describe('buildError', () => {
  test('returns a `ValidationError`', () => {
    const validator = new ParserValidator(() => {}, 'test', 'invalid')
    const { error } = Joi.object()
      .keys({
        invalid: Joi.number(),
      })
      .validate({ invalid: 'invalid' })

    expect(validator.buildError(error)).toEqual(
      new ValidationError('test:invalid must be a number')
    )
  })
})

describe('validate', () => {
  test('returns the value if no schema is defined', () => {
    const validator = new ParserValidator(() => {}, 'test', 123)

    expect(validator.schema).toBeUndefined()
    expect(validator.validate()).toBe(123)
  })

  test('returns the value if valid', () => {
    const validator = new ParserValidator(
      (schema) => schema.number(),
      'test',
      123
    )

    expect(validator.validate()).toBe(123)
  })

  test('throws `ValidationError` if invalid', () => {
    const validator = new ParserValidator(
      (schema) => schema.number(),
      'test',
      'invalid'
    )

    expect(() => validator.validate()).toThrow(
      new ValidationError('test must be a number')
    )
  })
})
