const is = require('is')

const BaseParser = require('./base')
const flattenMap = require('../services/flatten_map')

class FilterParser extends BaseParser {
  static get DEFAULTS() {
    return {
      name: null,
      field: null,
      operator: null,
      value: null,
    }
  }

  buildKey({ name, operator }) {
    return `${this.queryKey}:${name}[${operator}]`
  }

  defineValidation(schema) {
    const defaultOperator = this.defaults.operator
    const mapNamesToOperators = Object.entries(
      this.schema.mapFilterNamesToOperators()
    )

    const values = [
      schema.array(),
      schema.boolean(),
      schema.number(),
      schema.object(),
      schema.string(),
      schema.valid(null),
    ]

    return schema.object().keys(
      mapNamesToOperators.reduce((accumulator, [field, operators]) => {
        const operatorObject = schema
          .object()
          .pattern(schema.string().valid(...operators), values)

        return {
          ...accumulator,
          [field]: operators.includes(defaultOperator)
            ? [...values, operatorObject]
            : operatorObject,
        }
      }, {})
    )
  }

  flatten(map) {
    return flattenMap({
      map,
      value: (value) => value.value,
    })
  }

  parseObject(name, value) {
    return Object.keys(value).map((operator) => {
      const { options } = this.schema.filters.get(`${name}[${operator}]`)

      return {
        ...this.defaults,
        name,
        field: options.field || name,
        operator,
        value: value[operator],
      }
    })
  }

  parseNonObject(name, value) {
    const { options } = this.schema.filters.get(
      `${name}[${this.defaults.operator}]`
    )

    return {
      ...this.defaults,
      name,
      field: options.field || name,
      value,
    }
  }

  parse() {
    if (!this.query) {
      return new Map()
    }

    this.validate()

    const entries = Object.entries(this.query)
    const filters = []

    for (const [name, value] of entries) {
      if (is.object(value)) {
        filters.push(...this.parseObject(name, value))
      } else {
        filters.push(this.parseNonObject(name, value))
      }
    }

    return new Map(filters.map((filter) => [this.buildKey(filter), filter]))
  }
}

module.exports = FilterParser
