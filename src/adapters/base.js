const is = require('is')

const AdapterValidator = require('../validators/adapter')
const NotImplementedError = require('../errors/not_implemented')

class BaseAdapter {
  constructor() {
    this.validator = new AdapterValidator(this.defineValidation.bind(this))
  }

  static get FILTER_OPERATORS() {
    throw new NotImplementedError()
  }

  static get DEFAULT_FILTER_OPERATOR() {
    throw new NotImplementedError()
  }

  'filter:*'(/* builder, { name, field, operator, value } */) {
    throw new NotImplementedError()
  }

  sort(/* builder, { name, field, order } */) {
    throw new NotImplementedError()
  }

  page(/* builder, { size, number, offset } */) {
    throw new NotImplementedError()
  }

  defineValidation(/* schema */) {
    return undefined
  }

  filter(builder, filter) {
    const { operator } = filter

    if (!this.constructor.FILTER_OPERATORS.includes(operator)) {
      throw new NotImplementedError()
    }

    const operatorMethod = `filter:${operator}`

    if (is.fn(this[operatorMethod])) {
      return this[operatorMethod](builder, filter)
    }

    return this['filter:*'](builder, filter)
  }
}

module.exports = BaseAdapter
