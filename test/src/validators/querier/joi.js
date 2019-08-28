const Joi = require('@hapi/joi')

const JoiValidator = require('../../../../src/validators/querier/joi')
const ValidationError = require('../../../../src/errors/validation')

describe('constructor', () => {
  test('accepts/calls `defineSchema(Joi)` and sets the returned value', () => {
    const defineSchema = jest.fn(schema => ({
      'filter:test[=]': schema.number(),
    }))
    const validator = new JoiValidator(defineSchema)

    expect(defineSchema).toHaveBeenCalledWith(Joi)
    expect(validator.schema.isJoi).toBe(true)
  })
})

describe('defineSchemaArgs', () => {
  test('returns `Joi` argument to call `defineSchema` with', () => {
    const validator = new JoiValidator(() => {})

    expect(validator.defineSchemaArgs).toEqual([Joi])
  })
})

describe('buildError', () => {
  test('returns a `ValidationError`', () => {
    const validator = new JoiValidator(() => {})
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
  test('returns `true` if no schema is defined', () => {
    const validator = new JoiValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validate({ 'filter:test[=]': 123 })).toBe(true)
  })

  test('returns `true` if valid', () => {
    const validator = new JoiValidator(schema => ({
      'filter:test[=]': schema.number(),
    }))

    expect(validator.validate({ 'filter:test[=]': 123 })).toBe(true)
  })

  test('throws `ValidationError` if invalid', () => {
    const validator = new JoiValidator(schema => ({
      'filter:test[=]': schema.number(),
    }))

    expect(() => validator.validate({ 'filter:test[=]': 'invalid' })).toThrow(
      new ValidationError('filter:test[=] must be a number')
    )
  })
})
