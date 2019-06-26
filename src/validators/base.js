const ValidationError = require('../errors/validation')

class BaseValidator {
  constructor (querier) {
    this.querier = querier

    this.schema = querier.defineValidation(...this.defineValidationArgs)
  }

  get defineValidationArgs () {}

  validate () {}

  get values () {
    return {
      ...this.querier.filterer.filtersFlat(),
      ...this.querier.sorter.sortsFlat(),
      ...this.querier.pager.pageFlat()
    }
  }

  buildError (message) {
    return new ValidationError(message)
  }
}

module.exports = BaseValidator
