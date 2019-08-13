const FilterParser = require('./parsers/filter')
const ValidationError = require('./errors/validation')

class Filterer {
  constructor(querier) {
    this.querier = querier

    this._filters = null
  }

  get queryKey() {
    return 'filter'
  }

  get query() {
    return this.querier.query[this.queryKey]
  }

  get schema() {
    return this.querier.schema.filters
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  get filters() {
    if (!this._filters) {
      this.parse()
    }

    return this._filters
  }

  filtersFlat() {
    if (!this.isEnabled) {
      return {}
    }

    const filters = Array.from(this.filters.entries())

    return filters.reduce(
      (accumulator, [key, filter]) => ({
        ...accumulator,
        [`${this.queryKey}:${key}`]: filter.value,
      }),
      {}
    )
  }

  parse() {
    if (!this.isEnabled) {
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`)
      }

      return this._filters
    }

    if (!this._filters) {
      const parser = new FilterParser(
        this.queryKey,
        this.query || this.querier.defaultFilter,
        this.querier.schema,
        {
          operator: this.querier.adapter.constructor.DEFAULT_FILTER_OPERATOR,
          ...this.querier.filterDefaults,
        }
      )

      this._filters = parser.parse()
    }

    return this._filters
  }

  run() {
    const filters = this.parse()

    if (!filters) {
      return this.querier
    }

    const keys = this.schema.keys()
    let filter

    for (const key of keys) {
      filter = filters.get(key)

      if (filter) {
        this.querier.apply(this.queryKey, filter, `${this.queryKey}:${key}`)
      }
    }

    return this.querier
  }
}

module.exports = Filterer
