const Joi = require('@hapi/joi')

const joiValidationErrorConverter = require('../services/joi_validation_error_converter')
const NotImplementedError = require('../errors/not_implemented')

class BaseParser {
  constructor(queryKey, query, schema, defaults = {}) {
    this.queryKey = queryKey
    this.query = query
    this.schema = schema
    this.defaults = defaults
  }

  buildValidationSchema(/* schema */) {
    throw new NotImplementedError()
  }

  parse() {
    throw new NotImplementedError()
  }

  static get DEFAULTS() {
    return {}
  }

  set defaults(defaults) {
    this._defaults = {
      ...this.constructor.DEFAULTS,
      ...defaults,
    }
  }

  get defaults() {
    return this._defaults
  }

  buildValidationError(error) {
    return joiValidationErrorConverter(error, this.queryKey)
  }

  validate() {
    const schema = this.buildValidationSchema(Joi)

    const { error, value } = schema.validate(this.query)

    if (error) {
      throw this.buildValidationError(error)
    }

    return value
  }
}

module.exports = BaseParser
