import NotImplementedError from '../../errors/not_implemented'
import ValidationError from '../../errors/validation'

type DefineSchemaFn = (...args: unknown[]) => unknown

export class BaseValidator {
  // Schema shape is specific to concrete validators (Joi, etc.)
  schema: unknown

  constructor(...args: unknown[]) {
    const defineSchema = args[0] as DefineSchemaFn | undefined
    if (typeof defineSchema === 'function') {
      this.schema = defineSchema(...this.defineSchemaArgs)
    } else {
      this.schema = undefined
    }
  }

  validateFilters(_filters?: unknown): Iterable<[string, { value: unknown }]> {
    void _filters
    throw new NotImplementedError()
  }

  validateSorts(_sorts?: unknown): Iterable<[string, { order: unknown }]> {
    void _sorts
    throw new NotImplementedError()
  }

  // @ignore-next-line @typescript-eslint/no-unused-vars
  validatePage(_page?: unknown): Iterable<[string, { value: unknown }]> {
    void _page
    throw new NotImplementedError()
  }

  get defineSchemaArgs(): unknown[] {
    return []
  }

  buildError(message: string, key?: string): ValidationError {
    // If key is provided, concatenate for compatibility with JoiValidator
    if (key) {
      return new ValidationError(`${key} ${message}`)
    }
    return new ValidationError(message)
  }
}
