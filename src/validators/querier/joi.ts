import Joi from 'joi'
import ValidationError from '../../errors/validation'
import { BaseValidator } from './base'
import joiValidationErrorConverter from '../../services/joi_validation_error_converter'

type Filter = { value: unknown }
type Sort = { order: unknown }
type PageField = { value: unknown }

export class JoiValidator extends BaseValidator {
  // Keep the concrete `schema` typed, but expose a test-friendly accessor
  // that returns `any` because Joi's dynamic API (extract) is hard to type
  // precisely in this project. Tests rely on calling `.extract` directly.
  schema: Joi.Schema | Record<string, unknown> | undefined

  // Test-friendly accessor used by existing tests to exercise `.extract`.
  // This is intentionally `any` to avoid adding brittle, broad typings for Joi internals.
  get schemaAny(): any {
    return this.schema as any
  }

  // Accept a typed defineSchema as the first argument so callers like
  // `new JoiValidator((schema) => ({ ... }))` can infer the `schema` param.
  constructor(
    defineSchema?: (
      schema: typeof Joi,
    ) => Joi.Schema | Record<string, unknown> | undefined,
  )
  // Overload: accept arbitrary constructor args for compatibility with
  // `new (...args: unknown[]) => BaseValidator` used in `Config`.
  constructor(...args: unknown[])
  // Implementation: accept arbitrary args and cast the first argument to the
  // typed defineSchema when present.
  constructor(...args: unknown[]) {
    const defineSchema = args[0] as
      | ((
          schema: typeof Joi,
        ) => Joi.Schema | Record<string, unknown> | undefined)
      | undefined

    // Call BaseValidator constructor which will execute defineSchema(...)
    super(defineSchema as unknown as (...a: unknown[]) => unknown)

    // Normalize the value BaseValidator set on `this.schema`. If it's a
    // plain object map of Joi schemas, convert to a Joi.object().keys(...)
    // so Joi.isSchema and `.extract` behave as tests expect. If it's an
    // empty map, treat as undefined.
    const current = this.schema
    if (current && !Joi.isSchema(current) && typeof current === 'object') {
      const keys = Object.keys(current as Record<string, unknown>)
      if (keys.length > 0) {
        this.schema = Joi.object().keys(
          current as Record<string, Joi.Schema>,
        ) as Joi.Schema
      } else {
        this.schema = undefined
      }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keySchema = (this.schema as any)?.extract?.(key)
    } catch {
      // Don't throw error if key doesn't exist.
    }
    if (!keySchema) {
      return value
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { value: valueValidated, error } = (keySchema as any).validate(value)
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
