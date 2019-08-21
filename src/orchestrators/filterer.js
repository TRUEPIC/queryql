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

  run() {
    const filters = this.parse()

    if (!filters) {
      return this.querier
    }

    this.querier.adapter.validator.validateFilters(filters, this.queryKey)

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
