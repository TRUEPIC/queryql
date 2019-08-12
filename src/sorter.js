const SortParser = require('./parsers/sort')

class Sorter {
  constructor(querier) {
    this.querier = querier

    this._sorts = null
  }

  get queryKey() {
    return 'sort'
  }

  get query() {
    return this.querier.query[this.queryKey]
  }

  get schema() {
    return this.querier.schema.sorts
  }

  get sorts() {
    if (!this._sorts) {
      this.parse()
    }

    return this._sorts
  }

  sortsFlat() {
    const sorts = Array.from(this.sorts.entries())

    return sorts.reduce(
      (accumulator, [key, sort]) => ({
        ...accumulator,
        [`${this.queryKey}:${key}`]: sort.order,
      }),
      {}
    )
  }

  parse() {
    if (!this._sorts) {
      const parser = new SortParser(
        this.queryKey,
        this.query || this.querier.defaultSort,
        this.querier.schema,
        this.querier.sortDefaults
      )

      this._sorts = parser.parse()
    }

    return this._sorts
  }

  run() {
    this.parse()

    for (const [key, sort] of this.sorts) {
      this.querier.apply(this.queryKey, sort, `${this.queryKey}:${key}`)
    }

    return this.querier
  }
}

module.exports = Sorter
