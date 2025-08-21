import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ParserValidator from '../validators/parser'
import Joi from 'joi'
import Schema from '../schema'
import { ParsedQs } from 'qs'

export class BaseParser<D = Record<string, unknown>> {
  queryKey: string
  query: ParsedQs | Record<string, unknown>
  schema: Schema
  _defaults: D
  validator: ParserValidator

  constructor(
    queryKey: string,
    query: ParsedQs | Record<string, unknown>,
    schema: Schema,
    defaults: D = {} as D,
  ) {
    this.queryKey = queryKey
    this.query = query
    this.schema = schema
    this._defaults = {
      ...(this.constructor as typeof BaseParser).DEFAULTS,
      ...defaults,
    }

    this.validator = new ParserValidator(
      this.defineValidation.bind(this),
      queryKey,
      query,
    )

    // Bind and cache validate method
    this.validate = cache(this.validate.bind(this), this)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildKey(parsed?: any): string {
    throw new NotImplementedError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatten(map?: any): any {
    throw new NotImplementedError()
  }

  parse(): any {
    throw new NotImplementedError()
  }

  defineValidation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schema?: Joi.Root,
  ): Joi.Schema | undefined {
    return undefined
  }

  static get DEFAULTS(): Record<string, Joi.Schema> {
    return {}
  }

  set defaults(defaults: D) {
    this._defaults = {
      ...(this.constructor as typeof BaseParser).DEFAULTS,
      ...defaults,
    }
  }

  get defaults(): D {
    return this._defaults
  }

  validate(): Q | undefined {
    this.query = this.validator.validate()
    return this.query
  }
}
