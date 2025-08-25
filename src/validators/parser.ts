import Joi from 'joi'
import joiValidationErrorConverter from '../services/joi_validation_error_converter'

export type DefineSchemaFn = (joi: typeof Joi) => Joi.Schema | undefined

export default class ParserValidator {
  schema?: Joi.Schema
  queryKey: string
  query: unknown

  constructor(defineSchema: DefineSchemaFn, queryKey: string, query: unknown) {
    this.schema = defineSchema(Joi)
    this.queryKey = queryKey
    this.query = query
  }

  buildError(error: Joi.ValidationError) {
    return joiValidationErrorConverter(error, this.queryKey)
  }

  validate() {
    if (!this.schema) {
      return this.query
    }

    const { value, error } = this.schema.validate(this.query)

    if (error) {
      throw this.buildError(error)
    }

    return value
  }
}
