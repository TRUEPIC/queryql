const FilterParser = require('./parsers/filter')

class Filterer {
  constructor(querier) {
    this.querier = querier

    this._filters = null
  }

  get queryKey() {
    return FilterParser.QUERY_KEY
  }

  get query() {
    return this.querier.query[this.queryKey]
  }

  get schema() {
    return this.querier.schema.filters
  }

  get filters() {
    if (!this._filters) {
      this.parse()
    }

    return this._filters
  }

  filtersFlat() {
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
    if (!this._filters) {
      const parser = new FilterParser(
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

  build() {
    this.parse()

    const keys = this.schema.keys()
    let filter

    for (const key of keys) {
      filter = this.filters.get(key)

      if (filter) {
        this.querier.apply(this.queryKey, filter, `${this.queryKey}:${key}`)
      }
    }

    return this.querier
  }
}

module.exports = Filterer
