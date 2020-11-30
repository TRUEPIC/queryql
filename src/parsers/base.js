const cache = require('../services/cache_function')
const NotImplementedError = require('../errors/not_implemented')
const ParserValidator = require('../validators/parser')

class BaseParser {
  constructor(queryKey, query, schema, defaults = {}) {
    this.queryKey = queryKey
    this.query = query
    this.schema = schema
    this.defaults = defaults

    this.validator = new ParserValidator(
      this.defineValidation.bind(this),
      queryKey,
      query
    )

    this.validate = cache(this.validate, this)
  }

  buildKey(/* parsed */) {
    throw new NotImplementedError()
  }

  flatten(/* map */) {
    throw new NotImplementedError()
  }

  parse() {
    throw new NotImplementedError()
  }

  defineValidation(/* schema */) {
    return undefined
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

  validate() {
    this.query = this.validator.validate()

    return this.query
  }
}

module.exports = BaseParser
