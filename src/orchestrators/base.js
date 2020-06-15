const is = require('is')

const cache = require('../services/cache_function')
const NotImplementedError = require('../errors/not_implemented')
const ValidationError = require('../errors/validation')

class BaseOrchestrator {
  constructor(querier) {
    this.querier = querier

    this.parser = this.buildParser()

    this.validate = cache(this.validate, this)
    this.parse = cache(this.parse, this)
  }

  get queryKey() {
    throw new NotImplementedError()
  }

  get schema() {
    throw new NotImplementedError()
  }

  get isEnabled() {
    throw new NotImplementedError()
  }

  buildParser() {
    throw new NotImplementedError()
  }

  validate() {
    throw new NotImplementedError()
  }

  run() {
    throw new NotImplementedError()
  }

  get query() {
    return this.querier.query[this.queryKey]
  }

  parse() {
    if (!this.isEnabled) {
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`)
      }

      return null
    }

    return this.parser.parse()
  }

  apply(values, querierMethod = null) {
    const args = [this.querier.builder, values]

    this.querier.builder =
      querierMethod && is.fn(this.querier[querierMethod])
        ? this.querier[querierMethod](...args)
        : this.querier.adapter[this.queryKey](...args)

    return this.querier.builder
  }
}

module.exports = BaseOrchestrator
