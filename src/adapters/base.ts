import is from 'is'
import Joi from 'joi'
import AdapterValidator from '../validators/adapter'
import NotImplementedError from '../errors/not_implemented'

import type { FilterOperator } from '../types/filter_operator'

export type Filter = Record<string, unknown>

export type Sort = Record<string, unknown>

export type Page = Record<string, unknown>

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

  'filter:*'(_builder?: Builder, _filter?: Filter): Builder {
    void _filter
    void _builder
    throw new NotImplementedError()
  }

  sort(_builder?: Builder, _sort?: Sort): Builder {
    void _sort
    void _builder
    throw new NotImplementedError()
  }

  page(_builder?: Builder, _page?: Page): Builder {
    void _page
    void _builder
    throw new NotImplementedError()
  }

  // defineValidation is expected to accept the Joi module and return
  // an object mapping keys to Joi schemas or undefined.
  defineValidation(
    schema?: typeof Joi,
  ): Record<string, Joi.Schema> | undefined {
    void schema
    return undefined
  }

  filter(builder: Builder, filter: Filter): Builder {
    const { operator } = filter as { operator?: unknown }

    const ctor = this.constructor as typeof BaseAdapter

    const operatorStr = String(operator)

    if (!ctor.FILTER_OPERATORS.includes(operatorStr)) {
      throw new NotImplementedError()
    }

    const operatorMethod = `filter:${operatorStr}`

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

export default BaseAdapter
