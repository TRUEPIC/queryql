const is = require('is')

class BaseAdapter {
  static get FILTER_OPERATORS() {
    return ['=']
  }

  static get DEFAULT_FILTER_OPERATOR() {
    return '='
  }

  'filter:*'(builder, { field, operator, value }) {}

  sort(builder, { field, order }) {}

  page(builder, { size, number, offset }) {}

  filter(builder, filter) {
    const { operator } = filter
    const operatorMethod = `filter:${operator}`

    if (is.fn(this[operatorMethod])) {
      return this[operatorMethod](builder, filter)
    }

    if (this.constructor.FILTER_OPERATORS.includes(operator)) {
      return this['filter:*'](builder, filter)
    }

    throw new Error('Unsupported filter operator')
  }
}

module.exports = BaseAdapter
