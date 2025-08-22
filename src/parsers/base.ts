import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ParserValidator from '../validators/parser'
import Joi from 'joi'
import Schema from '../schema'

export class BaseParser<TQuery = unknown> {
  queryKey: string
  query: TQuery
  schema: Schema
  _defaults: Partial<Record<string, unknown>> = {}
  validator: ParserValidator

  constructor(
    queryKey: string,
    query: TQuery,
    schema: Schema,
    defaults: Partial<Record<string, unknown>> = {},
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
    schema?: typeof Joi,
  ): Joi.Schema | undefined {
    return undefined
  }

  static get DEFAULTS(): Record<string, unknown> {
    return {}
  }

  set defaults(defaults: Partial<Record<string, unknown>>) {
    this._defaults = {
      ...((this.constructor as typeof BaseParser).DEFAULTS as Partial<
        Record<string, unknown>
      >),
      ...defaults,
    }
  }

  get defaults(): Partial<Record<string, unknown>> {
    return this._defaults
  }

  validate(): unknown {
    return this.validator.validate()
  }
}
