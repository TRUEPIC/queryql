const Joi = require('@hapi/joi')

const joiValidationErrorConverter = require('../services/joi_validation_error_converter')

class AdapterValidator {
  constructor(defineSchema) {
    this.schema = defineSchema(Joi)
  }

  buildError(error, key) {
    return joiValidationErrorConverter(error, key)
  }

  validateValue(schemaKey, key, value) {
    if (!this.schema || !this.schema[schemaKey]) {
      return true
    }

    const { error } = this.schema[schemaKey].validate(value)

    if (error) {
      throw this.buildError(error, key)
    }

    return true
  }

  validateFilters(filters) {
    if (!this.schema) {
      return true
    }

    for (const [key, filter] of filters) {
      this.validateValue(`filter:${filter.operator}`, key, filter.value)
    }

    return true
  }

  validateSorts(sorts) {
    const schemaKey = 'sort'

    if (!this.schema || !this.schema[schemaKey]) {
      return true
    }

    for (const [key, sort] of sorts) {
      this.validateValue(schemaKey, key, sort.order)
    }

    return true
  }

  validatePage(page) {
    if (!this.schema) {
      return true
    }

    for (const [key, pageField] of page) {
      this.validateValue(`page:${pageField.field}`, key, pageField.value)
    }

    return true
  }
}

module.exports = AdapterValidator
