const Joi = require('@hapi/joi')

const joiValidationErrorConverter = require('../services/joi_validation_error_converter')

class ParserValidator {
  constructor(defineSchema, queryKey, query) {
    this.schema = defineSchema(Joi)
    this.queryKey = queryKey
    this.query = query
  }

  buildError(error) {
    return joiValidationErrorConverter(error, this.queryKey)
  }

  validate() {
    if (!this.schema) {
      return this.query
    }

    const { value, error } = this.schema.validate(this.query)

    if (error) {
      throw this.buildError(error)
    }

    return value
  }
}

module.exports = ParserValidator
