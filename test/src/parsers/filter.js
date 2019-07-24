const FilterParser = require('../../../src/parsers/filter')
const Schema = require('../../../src/schema')
const ValidationError = require('../../../src/errors/validation')

describe('DEFAULTS', () => {
  test('returns `null` as the default field', () => {
    expect(FilterParser.DEFAULTS.field).toBeNull()
  })

  test('returns `null` as the default operator', () => {
    expect(FilterParser.DEFAULTS.operator).toBeNull()
  })

  test('returns `null` as the default value', () => {
    expect(FilterParser.DEFAULTS.value).toBeNull()
  })
})

describe('buildKey', () => {
  test('builds/returns a string to use as a key', () => {
    const key = FilterParser.buildKey({
      field: 'test',
      operator: '=',
      value: 123,
    })

    expect(key).toBe('test[=]')
  })
})

describe('validation', () => {
  test('throws if the field is not whitelisted in the schema', () => {
    const parser = new FilterParser('filter', { invalid: 123 }, new Schema())

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
  })

  test('throws if the operator is not whitelisted in the schema', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: { '!=': 123 } },
      new Schema().filter('invalid', '=')
    )

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid[!=] is not allowed')
    )
  })

  test('throws if no operator or default operator is specified', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: 123 },
      new Schema().filter('invalid', '=')
    )

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid must be an object')
    )
  })

  test('permits an array value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { in: [1, 2, 3] } },
      new Schema().filter('valid', 'in')
    )

    expect(() => parser.validate()).not.toThrow()
  })

  test('permits a boolean value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': true } },
      new Schema().filter('valid', '=')
    )

    expect(() => parser.validate()).not.toThrow()
  })

  test('permits a number value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': 123 } },
      new Schema().filter('valid', '=')
    )

    expect(() => parser.validate()).not.toThrow()
  })

  test('permits a string value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': 'string' } },
      new Schema().filter('valid', '=')
    )

    expect(() => parser.validate()).not.toThrow()
  })

  test('throws for a non-permitted value', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: { '=': null } },
      new Schema().filter('invalid', '=')
    )

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid[=] must be an array')
    )
  })
})

describe('parse', () => {
  test('`filter[field]=value` with a default operator', () => {
    const parser = new FilterParser(
      'filter',
      { test: 123 },
      new Schema().filter('test', '='),
      { operator: '=' }
    )

    expect(parser.parse().get('test[=]')).toEqual({
      field: 'test',
      operator: '=',
      value: 123,
    })
  })

  test('`filter[field][operator]=value` with one operator', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '!=': 456 } },
      new Schema().filter('test', '!=')
    )

    expect(parser.parse().get('test[!=]')).toEqual({
      field: 'test',
      operator: '!=',
      value: 456,
    })
  })

  test('`filter[field][operator]=value` with multiple operators', () => {
    const parser = new FilterParser(
      'filter',
      {
        test: {
          '=': 123,
          '!=': 456,
        },
      },
      new Schema().filter('test', '=').filter('test', '!=')
    )

    expect(parser.parse().get('test[=]')).toEqual({
      field: 'test',
      operator: '=',
      value: 123,
    })

    expect(parser.parse().get('test[!=]')).toEqual({
      field: 'test',
      operator: '!=',
      value: 456,
    })
  })

  test('`filter[field][operator]=value` with multiple fields', () => {
    const parser = new FilterParser(
      'filter',
      {
        test1: { '=': 123 },
        test2: { '!=': 456 },
      },
      new Schema().filter('test1', '=').filter('test2', '!=')
    )

    expect(parser.parse().get('test1[=]')).toEqual({
      field: 'test1',
      operator: '=',
      value: 123,
    })

    expect(parser.parse().get('test2[!=]')).toEqual({
      field: 'test2',
      operator: '!=',
      value: 456,
    })
  })

  test('returns an empty `Map` if no query', () => {
    const parser = new FilterParser('filter', undefined, new Schema())

    expect(parser.parse().size).toBe(0)
  })

  test('throws `ValidationError` if invalid', () => {
    const parser = new FilterParser('filter', { invalid: 123 }, new Schema())

    expect(() => parser.parse()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    )
  })
})
