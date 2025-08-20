import NotImplementedError from '../../errors/not_implemented'
import ValidationError from '../../errors/validation'

type DefineSchemaFn = (...args: any[]) => any

class BaseValidator {
  schema: any

  constructor(defineSchema: DefineSchemaFn) {
    this.schema = defineSchema(...this.defineSchemaArgs)
  }

  validateFilters(filters?: any): void {
    throw new NotImplementedError()
  }

  validateSorts(sorts?: any): void {
    throw new NotImplementedError()
  }

  validatePage(page?: any): void {
    throw new NotImplementedError()
  }

  get defineSchemaArgs(): any[] {
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

export default BaseValidator
