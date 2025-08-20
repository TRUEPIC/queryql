import Joi from 'joi'
import BaseAdapter, { Filter, Sort, Page } from './base'
import {
  FILTER_OPERATORS as KNEX_FILTER_OPERATORS,
  DEFAULT_FILTER_OPERATOR as KNEX_DEFAULT_FILTER_OPERATOR,
} from '../types/filter_operator'

export default class KnexAdapter extends BaseAdapter {
  static get FILTER_OPERATORS(): string[] {
    return KNEX_FILTER_OPERATORS as unknown as string[]
  }

  static get DEFAULT_FILTER_OPERATOR(): string {
    return KNEX_DEFAULT_FILTER_OPERATOR as string
  }

  defineValidation(schema: typeof Joi): Record<string, Joi.Schema> {
    return {
      'filter:=': schema
        .alternatives()
        .try(schema.string(), schema.number(), schema.boolean()),
      'filter:!=': schema
        .alternatives()
        .try(schema.string(), schema.number(), schema.boolean()),
      'filter:<>': schema
        .alternatives()
        .try(schema.string(), schema.number(), schema.boolean()),
      'filter:>': schema.alternatives().try(schema.string(), schema.number()),
      'filter:>=': schema.alternatives().try(schema.string(), schema.number()),
      'filter:<': schema.alternatives().try(schema.string(), schema.number()),
      'filter:<=': schema.alternatives().try(schema.string(), schema.number()),
      'filter:is': schema.any().valid(null).empty(['null', '']).default(null),
      'filter:is not': schema
        .any()
        .valid(null)
        .empty(['null', ''])
        .default(null),
      'filter:in': schema.array().items(schema.string(), schema.number()),
      'filter:not in': schema.array().items(schema.string(), schema.number()),
      'filter:like': schema.string(),
      'filter:not like': schema.string(),
      'filter:ilike': schema.string(),
      'filter:not ilike': schema.string(),
      'filter:between': schema
        .array()
        .length(2)
        .items(schema.string(), schema.number()),
      'filter:not between': schema
        .array()
        .length(2)
        .items(schema.string(), schema.number()),
    }
  }

  'filter:*'(builder: any, filter: Filter): any {
    const { field, operator, value } = filter

    return (builder as any).where(field, operator, value)
  }

  sort(builder: any, sort: Sort): any {
    const { field, order } = sort

    return (builder as any).orderBy(field, order)
  }

  page(builder: any, page: Page): any {
    const { size, offset } = page

    return (builder as any).limit(size).offset(offset)
  }
}
