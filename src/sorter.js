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
        [`${this.queryKey}:${key}`]: sort.value,
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

  build() {
    this.parse()

    const keys = this.schema.keys()
    let sort

    for (const key of keys) {
      sort = this.sorts.get(key)

      if (sort) {
        this.querier.apply(this.queryKey, sort, `${this.queryKey}:${key}`)
      }
    }

    return this.querier
  }
}

module.exports = Sorter
