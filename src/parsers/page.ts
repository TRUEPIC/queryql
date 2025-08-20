import is from 'is'

import BaseParser from './base'
import flattenMap from '../services/flatten_map'

type PageObject = {
  size: number
  number: number
  offset?: number
}

type PageQuery = number | string | Partial<PageObject>
type PageMapValue = { field: string; value: number }

export default class PageParser extends BaseParser<PageQuery, any, PageObject> {
  static get DEFAULTS(): PageObject {
    return {
      size: 20,
      number: 1,
    }
  }

  buildKey(
    { field }: { field: string },
    includeQueryKey: boolean = true,
  ): string {
    let key = field
    if (includeQueryKey) {
      key = `${this.queryKey}:${key}`
    }
    return key
  }

  defineValidation(schema: any): any {
    return schema.alternatives().try(
      schema.number().integer().positive(),
      schema.object().keys({
        size: schema.number().integer().positive(),
        number: schema.number().integer().positive(),
      }),
    )
  }

  flatten(
    map: Map<string, PageMapValue>,
    includeQueryKey: boolean = true,
  ): Record<string, any> {
    return flattenMap({
      map,
      key: (_key, value) => this.buildKey(value, includeQueryKey),
      value: (value) => value.value,
    })
  }

  parseNumber(): PageObject {
    return {
      ...this.defaults,
      number: Number(this.query),
    }
  }

  parseObject(): PageObject {
    const queryObj = { ...(this.query as Partial<PageObject>) }
    if (typeof queryObj.size === 'string') {
      queryObj.size = Number(queryObj.size)
    }
    return {
      ...this.defaults,
      ...queryObj,
    }
  }

  parse(): Map<string, PageMapValue> {
    this.validate()
    let page: PageObject
    if (!this.query) {
      page = this.defaults
    } else if (is.number(this.query) || is.string(this.query)) {
      page = this.parseNumber()
    } else {
      page = this.parseObject()
    }
    page.offset = (page.number - 1) * page.size
    return new Map(
      Object.entries(page).map(([field, value]) => [
        this.buildKey({ field }),
        { field, value },
      ]),
    )
  }
}
