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

  validateFilters(filters, queryKey) {
    if (!this.schema) {
      return true
    }

    for (const [key, filter] of filters) {
      this.validateValue(
        `filter:${filter.operator}`,
        `${queryKey}:${key}`,
        filter.value
      )
    }

    return true
  }

  validateSorts(sorts, queryKey) {
    const schemaKey = 'sort'

    if (!this.schema || !this.schema[schemaKey]) {
      return true
    }

    for (const [key, sort] of sorts) {
      this.validateValue(schemaKey, `${queryKey}:${key}`, sort.order)
    }

    return true
  }

  validatePage(page, queryKey) {
    if (!this.schema) {
      return true
    }

    const entries = Object.entries(page)

    for (const [field, value] of entries) {
      this.validateValue(`page:${field}`, `${queryKey}:${field}`, value)
    }

    return true
  }
}

module.exports = AdapterValidator
