export const FILTER_OPERATORS = [
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

export type FilterOperator = (typeof FILTER_OPERATORS)[number]

export const DEFAULT_FILTER_OPERATOR: FilterOperator = '='
