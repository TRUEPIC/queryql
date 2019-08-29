const is = require('is')

const BaseParser = require('./base')

class SortParser extends BaseParser {
  static get DEFAULTS() {
    return {
      field: null,
      order: 'asc',
    }
  }

  buildKey({ field }) {
    return `${this.queryKey}:${field}`
  }

  defineValidation(schema) {
    const keys = Array.from(this.schema.sorts.keys())

    return schema.alternatives().try([
      schema.string().valid(keys),
      schema
        .array()
        .items(schema.string().valid(keys))
        .unique(),
      schema.object().pattern(
        schema.string().valid(keys),
        schema
          .string()
          .valid('asc', 'desc')
          .insensitive()
      ),
    ])
  }

  parseString(field) {
    return {
      ...this.defaults,
      field,
    }
  }

  parseArray(fields) {
    return fields.map(field => ({
      ...this.defaults,
      field,
    }))
  }

  parseObject(query) {
    return Object.entries(query).map(([field, order]) => ({
      ...this.defaults,
      field,
      order,
    }))
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

    return new Map(sorts.map(sort => [this.buildKey(sort), sort]))
  }
}

module.exports = SortParser
