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

  apply(data, method = null) {
    return this.querier.apply(
      this.queryKey,
      data,
      method && `${this.queryKey}:${method}`
    )
  }
}

module.exports = BaseOrchestrator
