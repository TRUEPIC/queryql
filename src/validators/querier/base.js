const NotImplementedError = require('../../errors/not_implemented')
const ValidationError = require('../../errors/validation')

class BaseValidator {
  constructor(querier) {
    this.querier = querier

    this.schema = querier.defineValidation(...this.defineValidationArgs)
  }

  validate() {
    throw new NotImplementedError()
  }

  get defineValidationArgs() {
    return []
  }

  get values() {
    return {
      ...this.querier.filterer.parseFlat(),
      ...this.querier.sorter.parseFlat(),
      ...this.querier.pager.parseFlat(),
    }
  }

  buildError(message) {
    return new ValidationError(message)
  }
}

module.exports = BaseValidator
