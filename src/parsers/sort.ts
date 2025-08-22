import is from 'is'
import { BaseParser } from './base'
import flattenMap from '../services/flatten_map'
import Joi from 'joi'

interface SortOptions {
  field?: string
}

type SortOrder = 'asc' | 'desc'

export interface SortResult {
  name: string
  field: string
  order: SortOrder
}

export class SortParser extends BaseParser {
  static get DEFAULTS(): { name: null; field: null; order: 'asc' } {
    return {
      name: null,
      field: null,
      order: 'asc',
    }
  }

  buildKey({ name }: { name: string }): string {
    return `${this.queryKey}:${name}`
  }

  defineValidation(schema: Joi.Root) {
    const keys = Array.from(this.schema.sorts.keys())

    if (!keys.length) {
      return schema.any().forbidden()
    }

    return schema.alternatives().try(
      schema.string().valid(...keys),
      schema
        .array()
        .items(schema.string().valid(...keys))
        .unique(),
      schema
        .object()
        .pattern(
          schema.string().valid(...keys),
          schema.string().valid('asc', 'desc').insensitive(),
        ),
    )
  }

  flatten(map: Map<string, SortResult>): Record<string, SortOrder> {
    return flattenMap({
      map,
      value: (value: SortResult) => value.order,
    })
  }

  parseString(name: string): SortResult {
    const { options }: { options: SortOptions } = this.schema.sorts.get(name)

    return {
      ...this.defaults,
      name,
      field: options.field || name,
      order: 'asc',
    }
  }

  parseArray(names: string[]): SortResult[] {
    return names.map((name) => {
      const { options }: { options: SortOptions } = this.schema.sorts.get(name)
      return {
        ...this.defaults,
        name,
        field: options.field || name,
        order: 'asc',
      }
    })
  }

  parseObject(query: Record<string, string>): SortResult[] {
    return Object.entries(query).map(([name, order]) => {
      const { options }: { options: SortOptions } = this.schema.sorts.get(name)
      return {
        ...this.defaults,
        name,
        field: options.field || name,
        order: order as 'asc' | 'desc',
      }
    })
  }

  parse(): Map<string, SortResult> {
    if (!this.query) {
      return new Map()
    }

    this.validate()

    const sorts: SortResult[] = []

    if (is.string(this.query)) {
      sorts.push(this.parseString(this.query))
    } else if (is.array(this.query)) {
      sorts.push(...this.parseArray(this.query))
    } else {
      sorts.push(...this.parseObject(this.query))
    }

    return new Map(sorts.map((sort) => [this.buildKey(sort), sort]))
  }
}
