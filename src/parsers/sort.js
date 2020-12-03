const is = require('is')

const BaseParser = require('./base')
const flattenMap = require('../services/flatten_map')

class SortParser extends BaseParser {
  static get DEFAULTS() {
    return {
      name: null,
      field: null,
      order: 'asc',
    }
  }

  buildKey({ name }) {
    return `${this.queryKey}:${name}`
  }

  defineValidation(schema) {
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
          schema.string().valid('asc', 'desc').insensitive()
        )
    )
  }

  flatten(map) {
    return flattenMap({
      map,
      value: (value) => value.order,
    })
  }

  parseString(name) {
    const { options } = this.schema.sorts.get(name)

    return {
      ...this.defaults,
      name,
      field: options.field || name,
    }
  }

  parseArray(names) {
    return names.map((name) => {
      const { options } = this.schema.sorts.get(name)

      return {
        ...this.defaults,
        name,
        field: options.field || name,
      }
    })
  }

  parseObject(query) {
    return Object.entries(query).map(([name, order]) => {
      const { options } = this.schema.sorts.get(name)

      return {
        ...this.defaults,
        name,
        field: options.field || name,
        order,
      }
    })
  }

  parse() {
    if (!this.query) {
      return new Map()
    }

    this.validate()

    const sorts = []

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

module.exports = SortParser
