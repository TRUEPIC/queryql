const BaseAdapter = require('./base')

class KnexAdapter extends BaseAdapter {
  static get FILTER_OPERATORS() {
    return ['=', '!=', 'in', 'not in']
  }

  'filter:*'(builder, { field, operator, value }) {
    return builder.where(field, operator, value)
  }

  sort(builder, { field, order }) {
    return builder.orderBy(field, order)
  }

  page(builder, { size, offset }) {
    return builder.limit(size).offset(offset)
  }
}

module.exports = KnexAdapter
