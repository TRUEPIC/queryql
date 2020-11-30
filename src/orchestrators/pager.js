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

  validate() {
    if (!this.isEnabled) {
      return true
    }

    this.parser.validate()
    this.querier.adapter.validator.validatePage(this.parse())
    this.querier.validator.validatePage(this.parse())

    return true
  }

  run() {
    this.validate()

    const page = this.parse()

    if (page) {
      this.apply(this.parser.flatten(page, false))
    }

    return this.querier
  }
}

module.exports = Pager
