const BaseOrchestrator = require('./base')
const SortParser = require('../parsers/sort')

class Sorter extends BaseOrchestrator {
  get queryKey() {
    return 'sort'
  }

  get schema() {
    return this.querier.schema.sorts
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  buildParser() {
    return new SortParser(
      this.queryKey,
      this.query || this.querier.defaultSort,
      this.querier.schema,
      this.querier.sortDefaults
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true
    }

    if (!this._validate) {
      this._validate =
        this.parser.validate() &&
        this.querier.adapter.validator.validateSorts(this.parse()) &&
        this.querier.validator.validate(this.parser.flatten(this.parse()))
    }

    return this._validate
  }

  run() {
    this.validate()

    const sorts = this.parse()

    if (!sorts) {
      return this.querier
    }

    for (const [key, sort] of sorts) {
      this.apply(sort, key)
    }

    return this.querier
  }
}

module.exports = Sorter
