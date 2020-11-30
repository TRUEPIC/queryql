const Joi = require('@hapi/joi')

const BaseValidator = require('./base')
const joiValidationErrorConverter = require('../../services/joi_validation_error_converter')

class JoiValidator extends BaseValidator {
  constructor(defineSchema) {
    super(defineSchema)

    if (this.schema) {
      this.schema = Joi.object().keys(this.schema)
    }
  }

  get defineSchemaArgs() {
    return [Joi]
  }

  buildError(error, key) {
    return joiValidationErrorConverter(error, key)
  }

  validateValue(key, value) {
    let keySchema

    try {
      keySchema = this.schema && this.schema.extract(key)
    } catch (error) {
      // Don't throw error if key doesn't exist.
    }

    if (!keySchema) {
      return value
    }

    const { value: valueValidated, error } = keySchema.validate(value)

    if (error) {
      throw this.buildError(error, key)
    }

    return valueValidated
  }

  validateFilters(filters) {
    if (!this.schema) {
      return filters
    }

    for (const [key, filter] of filters) {
      filter.value = this.validateValue(key, filter.value)
    }

    return filters
  }

  validateSorts(sorts) {
    if (!this.schema) {
      return sorts
    }

    for (const [key, sort] of sorts) {
      sort.order = this.validateValue(key, sort.order)
    }

    return sorts
  }

  validatePage(page) {
    if (!this.schema) {
      return page
    }

    for (const [key, pageField] of page) {
      pageField.value = this.validateValue(key, pageField.value)
    }

    return page
  }
}

module.exports = JoiValidator
