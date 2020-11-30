const NotImplementedError = require('../../errors/not_implemented')
const ValidationError = require('../../errors/validation')

class BaseValidator {
  constructor(defineSchema) {
    this.schema = defineSchema(...this.defineSchemaArgs)
  }

  validateFilters(/* filters */) {
    throw new NotImplementedError()
  }

  validateSorts(/* sorts */) {
    throw new NotImplementedError()
  }

  validatePage(/* page */) {
    throw new NotImplementedError()
  }

  get defineSchemaArgs() {
    return []
  }

  buildError(message) {
    return new ValidationError(message)
  }
}

module.exports = BaseValidator
