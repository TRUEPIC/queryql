const Joi = require('@hapi/joi')

const BaseValidator = require('./base')

class JoiValidator extends BaseValidator {
  get defineValidationArgs() {
    return [Joi]
  }

  buildError(error) {
    const detail = error.details.reduce((mostSpecific, detail) =>
      mostSpecific.path.length >= detail.path.length ? mostSpecific : detail
    )

    const path = detail.path.reduce(
      (accumulator, value, index) =>
        index === 0 ? value : `${accumulator}[${value}]`,
      ''
    )

    const message = detail.message.replace(/^".*?" /, '')

    return super.buildError(`${path} ${message}`)
  }

  validate() {
    if (!this.schema) {
      return true
    }

    const { error } = this.schema.validate(this.values, { allowUnknown: true })

    if (error) {
      throw this.buildError(error)
    }

    return true
  }
}

module.exports = JoiValidator
