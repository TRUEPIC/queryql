const PageParser = require('./parsers/page')
const ValidationError = require('./errors/validation')

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
    if (!this._page) {
      this.parse()
    }

    return this._page
  }

  pageFlat() {
    if (!this.isEnabled) {
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
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`)
      }

      return this._page
    }

    if (!this._page) {
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
    const page = this.parse()

    if (page) {
      this.querier.apply(this.queryKey, page)
    }

    return this.querier
  }
}

module.exports = Pager
