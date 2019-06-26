const Joi = require('@hapi/joi')

const ValidationError = require('../errors/validation')

class BaseParser {
  constructor (query, schema, defaults = {}) {
    this.query = query
    this.schema = schema
    this.defaults = defaults
  }

  static get QUERY_KEY () {}

  buildValidationSchema (schema) {}

  parse () {}

  static get DEFAULTS () {
    return {}
  }

  set defaults (defaults) {
    this._defaults = {
      ...this.constructor.DEFAULTS,
      ...defaults
    }
  }

  get defaults () {
    return this._defaults
  }

  buildValidationError (error) {
    const detail = error.details.reduce((mostSpecific, detail) => {
      if (mostSpecific && mostSpecific.path.length >= detail.path.length) {
        return mostSpecific
      }

      return detail
    })

    const path = detail.path.reduce((accumulator, value, index) =>
      index === 0
        ? `${accumulator}:${value}`
        : `${accumulator}[${value}]`
    , this.constructor.QUERY_KEY)

    const message = detail.message.replace(/^".*?" /, '')

    return new ValidationError(`${path} ${message}`)
  }

  validate () {
    const schema = this.buildValidationSchema(Joi)

    const { error, value } = schema.validate(this.query)

    if (error) {
      throw this.buildValidationError(error)
    }

    return value
  }
}

module.exports = BaseParser
