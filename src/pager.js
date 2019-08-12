const PageParser = require('./parsers/page')

class Pager {
  constructor(querier) {
    this.querier = querier

    this._page = null
  }

  get queryKey() {
    return 'page'
  }

  get query() {
    return this.querier.query[this.queryKey]
  }

  get schema() {
    return this.querier.schema.pageOptions
  }

  get isEnabled() {
    return this.schema.isEnabled
  }

  get page() {
    if (this._page === null) {
      this.parse()
    }

    return this._page
  }

  pageFlat() {
    if (!this.page) {
      return {}
    }

    return Object.entries(this.page).reduce(
      (accumulator, [field, value]) => ({
        ...accumulator,
        [`${this.queryKey}:${field}`]: value,
      }),
      {}
    )
  }

  parse() {
    if (!this.isEnabled) {
      this._page = false
    } else if (this._page === null) {
      const parser = new PageParser(
        this.queryKey,
        this.query || this.querier.defaultPage,
        this.querier.schema,
        this.querier.pageDefaults
      )

      this._page = parser.parse()
    }

    return this._page
  }

  run() {
    this.parse()

    if (this.page) {
      this.querier.apply(this.queryKey, this.page)
    }

    return this.querier
  }
}

module.exports = Pager
