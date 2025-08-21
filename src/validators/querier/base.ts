import NotImplementedError from '../../errors/not_implemented'
import ValidationError from '../../errors/validation'

type DefineSchemaFn = (...args: unknown[]) => unknown

export class BaseValidator {
  // Schema shape is specific to concrete validators (Joi, etc.)
  schema: unknown

  constructor(defineSchema: DefineSchemaFn) {
    this.schema = defineSchema(...this.defineSchemaArgs)
  }

  validateFilters(): unknown {
    throw new NotImplementedError()
  }

  validateSorts(): unknown {
    throw new NotImplementedError()
  }

  // @ignore-next-line @typescript-eslint/no-unused-vars
  validatePage(page: Iterable<[string, PageField]>): unknown {
    throw new NotImplementedError()
    return page
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
