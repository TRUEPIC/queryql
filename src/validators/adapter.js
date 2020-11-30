const Joi = require('@hapi/joi')

const joiValidationErrorConverter = require('../services/joi_validation_error_converter')

class AdapterValidator {
  constructor(defineSchema) {
    this.schema = defineSchema(Joi)

    if (this.schema) {
      this.schema = Joi.object().keys(this.schema)
    }
  }

  buildError(error, key) {
    return joiValidationErrorConverter(error, key)
  }

  validateValue(schemaKey, key, value) {
    let keySchema

    try {
      keySchema = this.schema && this.schema.extract(schemaKey)
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
      filter.value = this.validateValue(
        `filter:${filter.operator}`,
        key,
        filter.value
      )
    }

    return filters
  }

  validateSorts(sorts) {
    if (!this.schema) {
      return sorts
    }

    for (const [key, sort] of sorts) {
      sort.order = this.validateValue('sort', key, sort.order)
    }

    return sorts
  }

  validatePage(page) {
    if (!this.schema) {
      return page
    }

    for (const [key, pageField] of page) {
      pageField.value = this.validateValue(
        `page:${pageField.field}`,
        key,
        pageField.value
      )
    }

    return page
  }
}

module.exports = AdapterValidator
