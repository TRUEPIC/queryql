import Joi from 'joi'
import { BaseAdapter, Filter, Sort, Page } from './base'
import {
  FILTER_OPERATORS as KNEX_FILTER_OPERATORS,
  DEFAULT_FILTER_OPERATOR as KNEX_DEFAULT_FILTER_OPERATOR,
} from '../types/filter_operator'
import { Knex } from 'knex'

type ComparisonOperator = '=' | '>' | '>=' | '<' | '<=' | '<>'

export class KnexAdapter extends BaseAdapter<Knex.QueryBuilder> {
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
        // prefer number/boolean before string so Joi will coerce numeric strings
        // to numbers instead of matching the string schema first
        .try(schema.number(), schema.boolean(), schema.string()),
      'filter:!=': schema
        .alternatives()
        .try(schema.number(), schema.boolean(), schema.string()),
      'filter:<>': schema
        .alternatives()
        .try(schema.number(), schema.boolean(), schema.string()),
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
      'filter:in': schema.array().items(schema.number(), schema.string()),
      'filter:not in': schema.array().items(schema.number(), schema.string()),
      'filter:like': schema.string(),
      'filter:not like': schema.string(),
      'filter:ilike': schema.string(),
      'filter:not ilike': schema.string(),
      'filter:between': schema
        .array()
        .length(2)
        .items(schema.number(), schema.string()),
      'filter:not between': schema
        .array()
        .length(2)
        .items(schema.number(), schema.string()),
    }
  }

  'filter:*'(builder: Knex.QueryBuilder, filter: Filter) {
    const { field, operator, value } = filter as {
      field?: string
      operator?: ComparisonOperator | string
      value?: unknown
    }

    return (
      builder as unknown as {
        where: (
          field: string,
          op: ComparisonOperator,
          val: unknown,
        ) => Knex.QueryBuilder
      }
    ).where(field as string, operator as ComparisonOperator, value)
  }

  sort(builder: Knex.QueryBuilder, sort: Sort) {
    const { field, order } = sort as { field?: string; order?: 'asc' | 'desc' }

    return (
      builder as unknown as {
        orderBy: (field: string, order: 'asc' | 'desc') => Knex.QueryBuilder
      }
    ).orderBy(field as string, order as 'asc' | 'desc')
  }

  page(builder: Knex.QueryBuilder, page: Page) {
    const { size, offset } = page as { size?: number; offset?: number }

    return (
      builder as unknown as {
        limit: (n: number) => Knex.QueryBuilder
        offset: (n: number) => Knex.QueryBuilder
      }
    )
      .limit(size as number)
      .offset(offset as number)
  }
}

export default KnexAdapter
