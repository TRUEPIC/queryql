const FilterParser = require('../../../src/parsers/filter')
const Schema = require('../../../src/schema')
const ValidationError = require('../../../src/errors/validation')

describe('DEFAULTS', () => {
  test('returns `null` as the default name', () => {
    expect(FilterParser.DEFAULTS.name).toBeNull()
  })

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
    const parser = new FilterParser('filter', {}, new Schema())
    const key = parser.buildKey({
      name: 'test',
      operator: '=',
    })

    expect(key).toBe('filter:test[=]')
  })
})

describe('validation', () => {
  test('throws if the filter is not whitelisted in the schema', () => {
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
      new ValidationError('filter:invalid must be of type object')
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

  test('permits an object value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': { test: 123 } } },
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

  test('permits a null value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': null } },
      new Schema().filter('valid', '=')
    )

    expect(() => parser.validate()).not.toThrow()
  })

  test('throws for a non-permitted value', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: { '=': Date } },
      new Schema().filter('invalid', '=')
    )

    expect(() => parser.validate()).toThrow(
      new ValidationError(
        'filter:invalid[=] must be one of [array, boolean, number, object, string, null]'
      )
    )
  })
})

describe('flatten', () => {
  test('flattens/returns parsed map into object with keys => values', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 123 } },
      new Schema().filter('test', '=')
    )

    expect(parser.flatten(parser.parse())).toEqual({
      'filter:test[=]': 123,
    })
  })
})

describe('parse', () => {
  test('`filter[name]=value` with a default operator', () => {
    const parser = new FilterParser(
      'filter',
      { test: 123 },
      new Schema().filter('test', '='),
      { operator: '=' }
    )

    expect(parser.parse().get('filter:test[=]')).toEqual({
      name: 'test',
      field: 'test',
      operator: '=',
      value: 123,
    })
  })

  test('`filter[name]=value` with `field` option', () => {
    const parser = new FilterParser(
      'filter',
      { test: 123 },
      new Schema().filter('test', '=', { field: 'testing' }),
      { operator: '=' }
    )

    expect(parser.parse().get('filter:test[=]')).toEqual({
      name: 'test',
      field: 'testing',
      operator: '=',
      value: 123,
    })
  })

  test('`filter[name][operator]=value` with one operator', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '!=': 456 } },
      new Schema().filter('test', '!=')
    )

    expect(parser.parse().get('filter:test[!=]')).toEqual({
      name: 'test',
      field: 'test',
      operator: '!=',
      value: 456,
    })
  })

  test('`filter[name][operator]=value` with `field` option', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '!=': 456 } },
      new Schema().filter('test', '!=', { field: 'testing' })
    )

    expect(parser.parse().get('filter:test[!=]')).toEqual({
      name: 'test',
      field: 'testing',
      operator: '!=',
      value: 456,
    })
  })

  test('`filter[name][operator]=value` with multiple operators', () => {
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

    expect(parser.parse().get('filter:test[=]')).toEqual({
      name: 'test',
      field: 'test',
      operator: '=',
      value: 123,
    })

    expect(parser.parse().get('filter:test[!=]')).toEqual({
      name: 'test',
      field: 'test',
      operator: '!=',
      value: 456,
    })
  })

  test('`filter[name][operator]=value` with multiple names', () => {
    const parser = new FilterParser(
      'filter',
      {
        test1: { '=': 123 },
        test2: { '!=': 456 },
      },
      new Schema().filter('test1', '=').filter('test2', '!=')
    )

    expect(parser.parse().get('filter:test1[=]')).toEqual({
      name: 'test1',
      field: 'test1',
      operator: '=',
      value: 123,
    })

    expect(parser.parse().get('filter:test2[!=]')).toEqual({
      name: 'test2',
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
