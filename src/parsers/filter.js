const is = require('is')

const BaseParser = require('./base')
const flattenMap = require('../services/flatten_map')

class FilterParser extends BaseParser {
  static get DEFAULTS() {
    return {
      field: null,
      operator: null,
      value: null,
    }
  }

  buildKey({ field, operator }) {
    return `${this.queryKey}:${field}[${operator}]`
  }

  defineValidation(schema) {
    const defaultOperator = this.defaults.operator
    const mapFieldsToOperators = Object.entries(
      this.schema.mapFilterFieldsToOperators()
    )

    const values = [
      schema.array(),
      schema.boolean(),
      schema.number(),
      schema.string(),
    ]

    return schema.object().keys(
      mapFieldsToOperators.reduce((accumulator, [field, operators]) => {
        const operatorObject = schema
          .object()
          .pattern(schema.string().valid(operators), values)

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
      value: value => value.value,
    })
  }

  parseObject(field, value) {
    return Object.keys(value).map(operator => ({
      ...this.defaults,
      field,
      operator,
      value: value[operator],
    }))
  }

  parseNonObject(field, value) {
    return {
      ...this.defaults,
      field,
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

    for (const [field, value] of entries) {
      if (is.object(value)) {
        filters.push(...this.parseObject(field, value))
      } else {
        filters.push(this.parseNonObject(field, value))
      }
    }

    return new Map(filters.map(filter => [this.buildKey(filter), filter]))
  }
}

module.exports = FilterParser
