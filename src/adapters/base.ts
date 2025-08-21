import is from 'is'
import Joi from 'joi'
import AdapterValidator from '../validators/adapter'
import NotImplementedError from '../errors/not_implemented'

import type { FilterOperator } from '../types/filter_operator'

export type Filter = {
  field: string
  operator: FilterOperator
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

export type Sort = {
  name?: string
  field: string
  order: 'asc' | 'desc'
}

export type Page = {
  size: number
  number?: number
  offset: number
}

export class BaseAdapter<Builder> {
  public validator: AdapterValidator;
  [key: string]: unknown

  constructor() {
    this.validator = new AdapterValidator(this.defineValidation.bind(this))
  }

  static get FILTER_OPERATORS(): FilterOperator[] {
    throw new NotImplementedError()
  }

  static get DEFAULT_FILTER_OPERATOR(): FilterOperator {
    throw new NotImplementedError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  'filter:*'(builder?: Builder, filter?: Filter): Builder {
    throw new NotImplementedError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sort(builder?: Builder, sort?: Sort): Builder {
    throw new NotImplementedError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page(builder?: Builder, page?: Page): Builder {
    throw new NotImplementedError()
  }

  // defineValidation is expected to accept the Joi module and return
  // an object mapping keys to Joi schemas or undefined.
  defineValidation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schema?: Joi.Schema,
  ): Record<string, Joi.Schema> | undefined {
    return undefined
  }

  filter(builder: Builder, filter: Filter): unknown {
    const { operator } = filter

    const ctor = this.constructor as typeof BaseAdapter

    if (!ctor.FILTER_OPERATORS.includes(operator)) {
      throw new NotImplementedError()
    }

    const operatorMethod = `filter:${operator}`

    if (is.fn(this[operatorMethod])) {
      const fn = this[operatorMethod] as unknown as (
        builder?: Builder,
        filter?: Filter,
      ) => Builder

      return fn(builder, filter)
    }

    return this['filter:*'](builder, filter)
  }
}
