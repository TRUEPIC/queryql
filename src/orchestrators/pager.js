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

  parseFlat(includeQueryKey = true) {
    if (!this.isEnabled) {
      return {}
    }

    const page = Array.from(this.parse().values())

    return page.reduce(
      (accumulator, pageField) => ({
        ...accumulator,
        [this.parser.buildKey(pageField, includeQueryKey)]: pageField.value,
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
        this.querier.adapter.validator.validatePage(this.parse()) &&
        this.querier.validator.validate(this.parseFlat())
    }

    return this._validate
  }

  run() {
    this.validate()

    const page = this.parse()

    if (page) {
      this.apply(this.parseFlat(false))
    }

    return this.querier
  }
}

module.exports = Pager
