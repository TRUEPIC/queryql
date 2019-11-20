const Joi = require('@hapi/joi')

const joiValidationErrorConverter = require('../../../src/services/joi_validation_error_converter')
const ValidationError = require('../../../src/errors/validation')

test('prepends optional path prefix to path if path exists', () => {
  const { error } = Joi.object()
    .keys({
      invalid: Joi.number(),
    })
    .validate({ invalid: 'invalid' })

  expect(joiValidationErrorConverter(error, 'test')).toEqual(
    new ValidationError('test:invalid must be a number')
  )
})

test('uses optional path prefix as path if no path exists', () => {
  const { error } = Joi.number().validate({ invalid: 'invalid' })

  expect(joiValidationErrorConverter(error, 'test')).toEqual(
    new ValidationError('test must be a number')
  )
})

test('delineates path segments with []', () => {
  const { error } = Joi.object()
    .keys({
      invalid: Joi.object().keys({
        not_valid: Joi.number(),
      }),
    })
    .validate({ invalid: { not_valid: 'invalid' } })

  expect(joiValidationErrorConverter(error)).toEqual(
    new ValidationError('invalid[not_valid] must be a number')
  )
})
