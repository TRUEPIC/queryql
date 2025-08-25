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

export class SortParser extends BaseParser<unknown> {
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
      return (schema as Joi.Root).any().forbidden()
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
    const def = this.schema.sorts.get(name)
    const options = def ? def.options : ({} as SortOptions)

    return {
      ...this.defaults,
      name,
      field: String(options.field || name),
      order: 'asc',
    }
  }

  parseArray(names: string[]): SortResult[] {
    return names.map((name) => {
      const def = this.schema.sorts.get(name)
      const options = def ? def.options : ({} as SortOptions)
      return {
        ...this.defaults,
        name,
        field: String(options.field || name),
        order: 'asc',
      }
    })
  }

  parseObject(query: Record<string, string>): SortResult[] {
    return Object.entries(query).map(([name, order]) => {
      const def = this.schema.sorts.get(name)
      const options = def ? def.options : ({} as SortOptions)
      return {
        ...this.defaults,
        name,
        field: (options.field as string) || name,
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
      sorts.push(this.parseString(this.query as string))
    } else if (is.array(this.query)) {
      sorts.push(...this.parseArray(this.query as string[]))
    } else {
      sorts.push(...this.parseObject(this.query as Record<string, string>))
    }

    return new Map(sorts.map((sort) => [this.buildKey(sort), sort]))
  }
}
