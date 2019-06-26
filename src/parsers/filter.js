const is = require('is')

const BaseParser = require('./base')

class FilterParser extends BaseParser {
  static get QUERY_KEY () { return 'filter' }

  static get DEFAULTS () {
    return {
      field: null,
      operator: null,
      value: null
    }
  }

  static buildKey (filter) {
    return `${filter.field}[${filter.operator}]`
  }

  buildValidationSchema (schema) {
    const defaultOperator = this.defaults.operator
    const mapFieldsToOperators = Object.entries(
      this.schema.mapFilterFieldsToOperators()
    )

    const values = [
      schema.array(),
      schema.boolean(),
      schema.number(),
      schema.string()
    ]

    return schema.object().keys(
      mapFieldsToOperators.reduce((accumulator, [field, operators]) => {
        const operatorObject = schema.object().pattern(
          schema.string().valid(operators),
          values
        )

        return {
          ...accumulator,
          [field]: operators.includes(defaultOperator)
            ? [...values, operatorObject]
            : operatorObject
        }
      }, {})
    )
  }

  parseObject (field, value) {
    return Object.keys(value).map(operator => ({
      ...this.defaults,
      field,
      operator,
      value: value[operator]
    }))
  }

  parseNonObject (field, value) {
    return {
      ...this.defaults,
      field,
      value
    }
  }

  parse () {
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

    return new Map(filters.map(filter => [
      this.constructor.buildKey(filter),
      filter
    ]))
  }
}

module.exports = FilterParser
