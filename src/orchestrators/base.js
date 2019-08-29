const is = require('is')

const NotImplementedError = require('../errors/not_implemented')
const ValidationError = require('../errors/validation')

class BaseOrchestrator {
  constructor(querier) {
    this.querier = querier

    this.parser = this.buildParser()
    this._parse = null

    this._validate = null
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

    if (!this._parse) {
      this._parse = this.parser.parse()
    }

    return this._parse
  }

  apply(data, key = null) {
    const args = [this.querier.builder, data]

    this.querier.builder =
      key && is.fn(this.querier[key])
        ? this.querier[key](...args)
        : this.querier.adapter[this.queryKey](...args)

    return this.querier.builder
  }
}

module.exports = BaseOrchestrator
