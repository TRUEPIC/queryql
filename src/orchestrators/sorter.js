const BaseOrchestrator = require('./base')
const SortParser = require('../parsers/sort')

class Sorter extends BaseOrchestrator {
  get queryKey() {
    return 'sort'
  }

  get schema() {
    return this.querier.schema.sorts
  }

  get isEnabled() {
    return this.schema.size >= 1
  }

  buildParser() {
    return new SortParser(
      this.queryKey,
      this.query || this.querier.defaultSort,
      this.querier.schema,
      this.querier.sortDefaults
    )
  }

  parseFlat() {
    if (!this.isEnabled) {
      return {}
    }

    const sorts = Array.from(this.parse().entries())

    return sorts.reduce(
      (accumulator, [key, sort]) => ({
        ...accumulator,
        [`${this.queryKey}:${key}`]: sort.order,
      }),
      {}
    )
  }

  run() {
    const sorts = this.parse()

    if (!sorts) {
      return this.querier
    }

    this.querier.adapter.validator.validateSorts(sorts, this.queryKey)

    for (const [key, sort] of sorts) {
      this.apply(sort, key)
    }

    return this.querier
  }
}

module.exports = Sorter
