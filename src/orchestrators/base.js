const is = require('is')

const NotImplementedError = require('../errors/not_implemented')
const ValidationError = require('../errors/validation')

class BaseOrchestrator {
  constructor(querier) {
    this.querier = querier

    this._parse = null
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

  parseFlat() {
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

    if (!this._parse) {
      this._parse = this.buildParser().parse()
    }

    return this._parse
  }

  apply(data, key = null) {
    const querierMethod = key && `${this.queryKey}:${key}`
    const args = [this.querier.builder, data]

    this.querier.builder =
      querierMethod && is.fn(this.querier[querierMethod])
        ? this.querier[querierMethod](...args)
        : this.querier.adapter[this.queryKey](...args)

    return this.querier.builder
  }
}

module.exports = BaseOrchestrator
