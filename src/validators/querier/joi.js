const Joi = require('@hapi/joi')

const BaseValidator = require('./base')
const joiValidationErrorConverter = require('../../services/joi_validation_error_converter')

class JoiValidator extends BaseValidator {
  get defineValidationArgs() {
    return [Joi]
  }

  buildError(error) {
    return joiValidationErrorConverter(error)
  }

  validate() {
    if (!this.schema) {
      return true
    }

    const { error } = Joi.object()
      .keys(this.schema)
      .validate(this.values, { allowUnknown: true })

    if (error) {
      throw this.buildError(error)
    }

    return true
  }
}

module.exports = JoiValidator
