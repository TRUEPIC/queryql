const NotImplementedError = require('../../errors/not_implemented')
const ValidationError = require('../../errors/validation')

class BaseValidator {
  constructor(defineSchema) {
    this.schema = defineSchema(...this.defineSchemaArgs)
  }

  validate(/* values */) {
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
