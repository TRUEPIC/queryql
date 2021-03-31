const BaseAdapter = require('./base')

class KnexAdapter extends BaseAdapter {
  static get FILTER_OPERATORS() {
    return [
      '=',
      '!=',
      '<>',
      '>',
      '>=',
      '<',
      '<=',
      'is',
      'is not',
      'in',
      'not in',
      'like',
      'not like',
      'ilike',
      'not ilike',
      'between',
      'not between',
    ]
  }

  static get DEFAULT_FILTER_OPERATOR() {
    return '='
  }

  defineValidation(schema) {
    return {
      'filter:=': schema
        .alternatives()
        .try(schema.string(), schema.number(), schema.boolean()),
      'filter:!=': schema
        .alternatives()
        .try(schema.string(), schema.number(), schema.boolean()),
      'filter:<>': schema
        .alternatives()
        .try(schema.string(), schema.number(), schema.boolean()),
      'filter:>': schema.alternatives().try(schema.string(), schema.number()),
      'filter:>=': schema.alternatives().try(schema.string(), schema.number()),
      'filter:<': schema.alternatives().try(schema.string(), schema.number()),
      'filter:<=': schema.alternatives().try(schema.string(), schema.number()),
      'filter:is': schema.any().valid(null).empty(['null', '']).default(null),
      'filter:is not': schema
        .any()
        .valid(null)
        .empty(['null', ''])
        .default(null),
      'filter:in': schema.array().items(schema.string(), schema.number()),
      'filter:not in': schema.array().items(schema.string(), schema.number()),
      'filter:like': schema.string(),
      'filter:not like': schema.string(),
      'filter:ilike': schema.string(),
      'filter:not ilike': schema.string(),
      'filter:between': schema
        .array()
        .length(2)
        .items(schema.string(), schema.number()),
      'filter:not between': schema
        .array()
        .length(2)
        .items(schema.string(), schema.number()),
    }
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
