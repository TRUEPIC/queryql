import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ParserValidator from '../validators/parser'
import Joi from 'joi'
import Schema from '../schema'

export type QueryProperties = Record<
  string,
  | Record<string, number | string | boolean | unknown>
  | number
  | string
  | boolean
  | unknown
>

export class BaseParser {
  queryKey: string
  query: QueryProperties
  schema: Schema
  _defaults: Partial<QueryProperties> = {}
  validator: ParserValidator

  constructor(
    queryKey: string,
    query: QueryProperties,
    schema: Schema,
    defaults: Partial<QueryProperties> = {},
  ) {
    this.queryKey = queryKey
    this.query = query
    this.schema = schema
    this.defaults = defaults

    this.validator = new ParserValidator(
      this.defineValidation.bind(this),
      queryKey,
      query,
    )

    // Bind and cache validate method
    this.validate = cache(this.validate.bind(this), this)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildKey(parsed: unknown): string {
    throw new NotImplementedError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatten(map: Map<string, unknown>): Record<string, unknown> {
    throw new NotImplementedError()
  }

  parse(): unknown {
    throw new NotImplementedError()
  }

  defineValidation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schema?: Joi.Root,
  ): Joi.Schema | undefined {
    return undefined
  }

  static get DEFAULTS(): Record<string, unknown> {
    return {}
  }

  set defaults(defaults: Partial<QueryProperties>) {
    this._defaults = {
      ...((this.constructor as typeof BaseParser)
        .DEFAULTS as Partial<QueryProperties>),
      ...defaults,
    }
  }

  get defaults(): Partial<QueryProperties> {
    return this._defaults
  }

  validate(): unknown {
    return this.validator.validate()
  }
}
