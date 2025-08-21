import Joi from 'joi'
import joiValidationErrorConverter from '../services/joi_validation_error_converter'
import type { FilterOperator } from '../types/filter_operator'

type FilterValue = { operator: FilterOperator; value: unknown }
type SortValue = { order: unknown }
type PageValue = { field: string; value: unknown }

export default class AdapterValidator {
  public schema?: Joi.ObjectSchema<unknown>

  constructor(
    defineSchema: (
      schema: typeof Joi,
    ) => Record<string, Joi.Schema> | undefined,
  ) {
    const defined = defineSchema(Joi)
    if (defined) {
      this.schema = Joi.object().keys(defined)
    }
  }

  buildError(error: Joi.ValidationError, key?: string): Error {
    return joiValidationErrorConverter(error, key)
  }

  validateValue(schemaKey: string, key: string, value: unknown): unknown {
    let keySchema: Joi.Schema | undefined
    try {
      keySchema = this.schema && this.schema.extract(schemaKey)
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

  validateFilters(filters: Map<string, FilterValue>): Map<string, FilterValue> {
    if (!this.schema) {
      return filters
    }
    for (const [key, filter] of filters) {
      filter.value = this.validateValue(
        `filter:${filter.operator}`,
        key,
        filter.value,
      )
    }
    return filters
  }

  validateSorts(sorts: Map<string, SortValue>): Map<string, SortValue> {
    if (!this.schema) {
      return sorts
    }
    for (const [key, sort] of sorts) {
      sort.order = this.validateValue('sort', key, sort.order)
    }
    return sorts
  }

  validatePage(page: Map<string, PageValue>): Map<string, PageValue> {
    if (!this.schema) {
      return page
    }
    for (const [key, pageField] of page) {
      pageField.value = this.validateValue(
        `page:${pageField.field}`,
        key,
        pageField.value,
      )
    }
    return page
  }
}
