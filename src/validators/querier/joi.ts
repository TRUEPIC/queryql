import Joi from 'joi'
import ValidationError from '../../errors/validation'
import { BaseValidator } from './base'
import joiValidationErrorConverter from '../../services/joi_validation_error_converter'

type Filter = { value: unknown }
type Sort = { order: unknown }
type PageField = { value: unknown }

export class JoiValidator extends BaseValidator {
  schema: Joi.Schema | undefined

  constructor(
    defineSchema: (
      ...args: unknown[]
    ) => Joi.Schema | Record<string, unknown> | undefined,
  ) {
    super(defineSchema)

    // If defineSchema returns an empty object or undefined, treat as no schema
    if (!this.schema || Object.keys(this.schema).length === 0) {
      this.schema = undefined
    }
  }

  get defineSchemaArgs(): [typeof Joi] {
    return [Joi]
  }

  buildError(error: unknown, key?: string): ValidationError {
    return joiValidationErrorConverter(error, key)
  }

  validateValue(key: string, value: unknown): unknown {
    let keySchema: Joi.Schema | undefined
    try {
      // schema.extract may throw if schema isn't a Joi object schema
      // Use optional chaining and cast where necessary
      keySchema = this.schema?.extract?.(key)
    } catch {
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

  validateFilters(
    filters: Iterable<[string, Filter]>,
  ): Iterable<[string, Filter]> {
    if (!this.schema) {
      return filters
    }
    for (const [key, filter] of filters) {
      filter.value = this.validateValue(key, filter.value)
    }
    return filters
  }

  validateSorts(sorts: Iterable<[string, Sort]>): Iterable<[string, Sort]> {
    if (!this.schema) {
      return sorts
    }
    for (const [key, sort] of sorts) {
      sort.order = this.validateValue(key, sort.order)
    }
    return sorts
  }

  validatePage(
    page: Iterable<[string, PageField]>,
  ): Iterable<[string, PageField]> {
    if (!this.schema) {
      return page
    }
    for (const [key, pageField] of page) {
      pageField.value = this.validateValue(key, pageField.value)
    }
    return page
  }
}
