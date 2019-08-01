const Joi = require('@hapi/joi')

const NotImplementedError = require('../errors/not_implemented')
const ValidationError = require('../errors/validation')

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
    const detail = error.details.reduce((mostSpecific, detail) =>
      mostSpecific.path.length >= detail.path.length ? mostSpecific : detail
    )

    const path = detail.path.reduce(
      (accumulator, value, index) =>
        index === 0 ? `${accumulator}:${value}` : `${accumulator}[${value}]`,
      this.queryKey
    )

    const message = detail.message.replace(/^".*?" /, '')

    return new ValidationError(`${path} ${message}`)
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
