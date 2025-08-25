import is from 'is'
import { BaseParser } from './base'
import flattenMap from '../services/flatten_map'

import Joi from 'joi'

import type { FilterOperator } from '../types/filter_operator'

export interface Filter {
  name: string | null
  field: string | null
  operator: FilterOperator | null
  value: unknown
  [key: string]: unknown
}

export class FilterParser extends BaseParser {
  static get DEFAULTS(): Filter {
    return {
      name: null,
      field: null,
      operator: null,
      value: null,
    }
  }

  buildKey({
    name,
    operator,
  }: {
    name: string | null
    operator: FilterOperator | null
  }): string {
    return `${this.queryKey}:${name}[${operator}]`
  }

  defineValidation(schema: typeof Joi): Joi.ObjectSchema {
    const defaultOperator = (this.defaults as Partial<Filter>).operator
    const mapNamesToOperators = Object.entries(
      this.schema.mapFilterNamesToOperators(),
    ) as [string, string[]][]

    const values = [
      schema.array(),
      schema.string(),
      schema.number(),
      schema.boolean(),
      schema.valid(null),
    ]

    return schema.object().keys(
      mapNamesToOperators.reduce<Record<string, Joi.Schema>>(
        (accumulator, [field, operators]) => {
          const operatorObject = schema
            .object()
            .pattern(schema.string().valid(...operators), [
              schema.object(),
              ...values,
            ])

          return {
            ...accumulator,
            [field]: operators.includes(defaultOperator ?? '')
              ? schema.alternatives().try(...values, operatorObject)
              : operatorObject,
          }
        },
        {} as Record<string, Joi.Schema>,
      ),
    )
  }

  flatten(map: Map<string, Filter>) {
    return flattenMap({
      map,
      value: (value: Filter) => value.value,
    })
  }

  parseObject(name: string, value: Record<string, unknown>): Filter[] {
    return Object.keys(value).map((operator) => {
      const def = this.schema.filters.get(`${name}[${operator}]`)
      const options = def ? def.options : ({} as Record<string, unknown>)

      return {
        ...this.defaults,
        name,
        field: (options.field as string) || name,
        operator: operator as FilterOperator,
        value: value[operator],
      }
    })
  }

  parseNonObject(name: string, value: string): Filter {
    const def = this.schema.filters.get(
      `${name}[${(this.defaults as Partial<Filter>).operator}]`,
    )
    const options = def ? def.options : ({} as Record<string, unknown>)

    return {
      ...this.defaults,
      name,
      field: (options.field as string) || name,
      operator: (this.defaults as Partial<Filter>).operator ?? null,
      value,
    }
  }

  parse(): Map<string, Filter> {
    if (!this.query) {
      return new Map()
    }

    this.validate()

    const entries = Object.entries(this.query)
    const filters: Filter[] = []

    for (const [name, value] of entries) {
      if (is.object(value)) {
        filters.push(
          ...this.parseObject(name, value as Record<string, unknown>),
        )
      } else {
        filters.push(this.parseNonObject(name, value as string))
      }
    }

    return new Map(filters.map((filter) => [this.buildKey(filter), filter]))
  }
}
