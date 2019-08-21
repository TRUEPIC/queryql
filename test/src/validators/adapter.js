const Joi = require('@hapi/joi')

const AdapterValidator = require('../../../src/validators/adapter')
const FilterParser = require('../../../src/parsers/filter')
const PageParser = require('../../../src/parsers/page')
const Schema = require('../../../src/schema')
const SortParser = require('../../../src/parsers/sort')
const ValidationError = require('../../../src/errors/validation')

describe('constructor', () => {
  test('accepts/calls `defineSchema` and sets the returned value', () => {
    const schema = { 'filter:=': Joi.string() }
    const defineSchema = jest.fn(() => schema)

    const validator = new AdapterValidator(defineSchema)

    expect(defineSchema).toHaveBeenCalledWith(Joi)
    expect(validator.schema).toEqual(schema)
  })
})

describe('buildError', () => {
  test('returns a `ValidationError`', () => {
    const validator = new AdapterValidator(() => {})
    const { error } = Joi.object()
      .keys({
        invalid: Joi.number(),
      })
      .validate({ invalid: 'invalid' })

    expect(validator.buildError(error)).toEqual(
      new ValidationError('invalid must be a number')
    )
  })
})

describe('validateValue', () => {
  test('returns `true` if no schema is defined', () => {
    const validator = new AdapterValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validateValue('filter:=', 'filter:test[=]', 123)).toBe(
      true
    )
  })

  test('returns `true` if no schema key is defined', () => {
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }))

    expect(validator.schema['filter:!=']).toBeUndefined()
    expect(validator.validateValue('filter:!=', 'filter:test[!=]', 123)).toBe(
      true
    )
  })

  test('returns `true` if valid', () => {
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }))

    expect(validator.validateValue('filter:=', 'filter:test[=]', 123)).toBe(
      true
    )
  })

  test('throws `ValidationError` if invalid', () => {
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }))

    expect(() =>
      validator.validateValue('filter:=', 'filter:test[=]', 'invalid')
    ).toThrow(new ValidationError('filter:test[=] must be a number'))
  })
})

describe('validateFilters', () => {
  test('returns `true` if no schema is defined', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 123 } },
      new Schema().filter('test', '=')
    )
    const validator = new AdapterValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validateFilters(parser.parse(), 'filter')).toBe(true)
  })

  test('returns `true` if all filters are valid', () => {
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
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
      'filter:!=': schema.number(),
    }))

    expect(validator.validateFilters(parser.parse(), 'filter')).toBe(true)
  })

  test('throws `ValidationError` if a filter is invalid', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 'invalid' } },
      new Schema().filter('test', '=')
    )
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }))

    expect(() => validator.validateFilters(parser.parse(), 'filter')).toThrow(
      new ValidationError('filter:test[=] must be a number')
    )
  })
})

describe('validateSorts', () => {
  test('returns `true` if no schema is defined', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'))
    const validator = new AdapterValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validateSorts(parser.parse(), 'sort')).toBe(true)
  })

  test('returns `true` if no schema key is defined', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'))
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }))

    expect(validator.schema['sort']).toBeUndefined()
    expect(validator.validateSorts(parser.parse(), 'sort')).toBe(true)
  })

  test('returns `true` if all sorts are valid', () => {
    const parser = new SortParser(
      'sort',
      ['test1', 'test2'],
      new Schema().sort('test1').sort('test2')
    )
    const validator = new AdapterValidator(schema => ({
      sort: schema.string().valid('asc'),
    }))

    expect(validator.validateSorts(parser.parse(), 'sort')).toBe(true)
  })

  test('throws `ValidationError` if a sort is invalid', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'))
    const validator = new AdapterValidator(schema => ({
      sort: schema.string().invalid('asc'),
    }))

    expect(() => validator.validateSorts(parser.parse(), 'sort')).toThrow(
      new ValidationError('sort:test contains an invalid value')
    )
  })
})

describe('validatePage', () => {
  test('returns `true` if no schema is defined', () => {
    const parser = new PageParser('page', '2', new Schema())
    const validator = new AdapterValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validatePage(parser.parse(), 'page')).toBe(true)
  })

  test('returns `true` if page is valid', () => {
    const parser = new PageParser('page', '2', new Schema())
    const validator = new AdapterValidator(schema => ({
      'page:size': schema.number().valid(20),
      'page:number': schema.number().valid(2),
    }))

    expect(validator.validatePage(parser.parse(), 'page')).toBe(true)
  })

  test('throws `ValidationError` if page is invalid', () => {
    const parser = new PageParser('page', '2', new Schema())
    const validator = new AdapterValidator(schema => ({
      'page:number': schema.number().invalid(2),
    }))

    expect(() => validator.validatePage(parser.parse(), 'page')).toThrow(
      new ValidationError('page:number contains an invalid value')
    )
  })
})
