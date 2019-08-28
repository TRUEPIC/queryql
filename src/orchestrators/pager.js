const BaseOrchestrator = require('./base')
const PageParser = require('../parsers/page')

class Pager extends BaseOrchestrator {
  get queryKey() {
    return 'page'
  }

  get schema() {
    return this.querier.schema.pageOptions
  }

  get isEnabled() {
    return this.schema.isEnabled
  }

  buildParser() {
    return new PageParser(
      this.queryKey,
      this.query || this.querier.defaultPage,
      this.querier.schema,
      this.querier.pageDefaults
    )
  }

  parseFlat() {
    if (!this.isEnabled) {
      return {}
    }

    return Object.entries(this.parse()).reduce(
      (accumulator, [field, value]) => ({
        ...accumulator,
        [`${this.queryKey}:${field}`]: value,
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
        this.querier.adapter.validator.validatePage(
          this.parse(),
          this.queryKey
        ) &&
        this.querier.validator.validate(this.parseFlat())
    }

    return this._validate
  }

  run() {
    this.validate()

    const page = this.parse()

    if (page) {
      this.apply(page)
    }

    return this.querier
  }
}

module.exports = Pager
