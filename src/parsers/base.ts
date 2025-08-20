import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ParserValidator from '../validators/parser'
import Joi from 'joi'

export default class BaseParser<Q = any, S = any, D = Record<string, any>> {
  queryKey: string
  query: Q
  schema: S
  _defaults: D
  validator: ParserValidator

  constructor(queryKey: string, query: Q, schema: S, defaults: D = {} as D) {
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

  buildKey(parsed?: any): string {
    throw new NotImplementedError()
  }

  flatten(map?: any): any {
    throw new NotImplementedError()
  }

  parse(): any {
    throw new NotImplementedError()
  }

  defineValidation(joi?: typeof Joi): Joi.Schema | undefined {
    return undefined
  }

  static get DEFAULTS(): Record<string, any> {
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
