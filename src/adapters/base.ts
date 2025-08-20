import is from 'is'
import Joi from 'joi'
import AdapterValidator from '../validators/adapter'
import NotImplementedError from '../errors/not_implemented'

type Builder = any

export type Filter = {
  name?: string
  field?: string
  operator: string
  value?: any
}

export type Sort = {
  name?: string
  field: string
  order?: any
}

export type Page = {
  size?: number
  number?: number
  offset?: number
}

export default class BaseAdapter {
  public validator: AdapterValidator

  constructor() {
    this.validator = new AdapterValidator(this.defineValidation.bind(this))
  }

  static get FILTER_OPERATORS(): string[] {
    throw new NotImplementedError()
  }

  static get DEFAULT_FILTER_OPERATOR(): string {
    throw new NotImplementedError()
  }

  'filter:*'(builder: Builder, { name, field, operator, value }: Filter): any {
    throw new NotImplementedError()
  }

  sort(builder?: Builder, sort?: Sort): any {
    throw new NotImplementedError()
  }

  page(builder?: Builder, page?: Page): any {
    throw new NotImplementedError()
  }

  // defineValidation is expected to accept the Joi module and return
  // an object mapping keys to Joi schemas or undefined.
  defineValidation(schema: typeof Joi): Record<string, Joi.Schema> | undefined {
    return undefined
  }

  filter(builder: Builder, filter: Filter): any {
    const { operator } = filter

    const ctor = this.constructor as typeof BaseAdapter

    if (!ctor.FILTER_OPERATORS.includes(operator)) {
      throw new NotImplementedError()
    }

    const operatorMethod = `filter:${operator}`

    if (is.fn((this as any)[operatorMethod])) {
      return (this as any)[operatorMethod](builder, filter)
    }

    return (this as any)['filter:*'](builder, filter)
  }
}
