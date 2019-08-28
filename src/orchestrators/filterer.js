const BaseOrchestrator = require('./base')
const FilterParser = require('../parsers/filter')

class Filterer extends BaseOrchestrator {
  get queryKey() {
    return 'filter'
  }

  get schema() {
    return this.querier.schema.filters
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  buildParser() {
    return new FilterParser(
      this.queryKey,
      this.query || this.querier.defaultFilter,
      this.querier.schema,
      {
        operator: this.querier.adapter.constructor.DEFAULT_FILTER_OPERATOR,
        ...this.querier.filterDefaults,
      }
    )
  }

  parseFlat() {
    if (!this.isEnabled) {
      return {}
    }

    const filters = Array.from(this.parse().entries())

    return filters.reduce(
      (accumulator, [key, filter]) => ({
        ...accumulator,
        [`${this.queryKey}:${key}`]: filter.value,
      }),
      {}
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true
    }

    if (!this._validate) {
      this._validate =
        this.parser.validate() &&
        this.querier.adapter.validator.validateFilters(
          this.parse(),
          this.queryKey
        ) &&
        this.querier.validator.validate(this.parseFlat())
    }

    return this._validate
  }

  run() {
    this.validate()

    const filters = this.parse()

    if (!filters) {
      return this.querier
    }

    const keys = this.schema.keys()
    let filter

    for (const key of keys) {
      filter = filters.get(key)

      if (filter) {
        this.apply(filter, key)
      }
    }

    return this.querier
  }
}

module.exports = Filterer
