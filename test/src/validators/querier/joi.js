const Joi = require('@hapi/joi')

const FilterParser = require('../../../../src/parsers/filter')
const JoiValidator = require('../../../../src/validators/querier/joi')
const PageParser = require('../../../../src/parsers/page')
const Schema = require('../../../../src/schema')
const SortParser = require('../../../../src/parsers/sort')
const ValidationError = require('../../../../src/errors/validation')

describe('constructor', () => {
  test('accepts/calls `defineSchema(Joi)` and sets the returned value', () => {
    const defineSchema = jest.fn((schema) => ({
      'filter:test[=]': schema.number(),
    }))
    const validator = new JoiValidator(defineSchema)

    expect(defineSchema).toHaveBeenCalledWith(Joi)
    expect(Joi.isSchema(validator.schema)).toBe(true)
  })
})

describe('defineSchemaArgs', () => {
  test('returns `Joi` argument to call `defineSchema` with', () => {
    const validator = new JoiValidator(() => {})

    expect(validator.defineSchemaArgs).toEqual([Joi])
  })
})

describe('buildError', () => {
  test('returns a `ValidationError`', () => {
    const validator = new JoiValidator(() => {})
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
  test('returns the value if no schema is defined', () => {
    const validator = new JoiValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validateValue('filter:test[=]', 123)).toBe(123)
  })

  test('returns the value if no schema key is defined', () => {
    const validator = new JoiValidator((schema) => ({
      'filter:test[=]': schema.number(),
    }))

    expect(() => validator.schema.extract('filter:text[!=]')).toThrow()
    expect(validator.validateValue('filter:test[!=]', 123)).toBe(123)
  })

  test('returns the value if valid', () => {
    const validator = new JoiValidator((schema) => ({
      'filter:test[=]': schema.number(),
    }))

    expect(validator.validateValue('filter:test[=]', 123)).toBe(123)
  })

  test('throws `ValidationError` if invalid', () => {
    const validator = new JoiValidator((schema) => ({
      'filter:test[=]': schema.number(),
    }))

    expect(() => validator.validateValue('filter:test[=]', 'invalid')).toThrow(
      new ValidationError('filter:test[=] must be a number')
    )
  })
})

describe('validateFilters', () => {
  test('returns the parsed filters if no schema is defined', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 123 } },
      new Schema().filter('test', '=')
    )
    const validator = new JoiValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validateFilters(parser.parse())).toBeInstanceOf(Map)
  })

  test('returns the parsed filters if all filters are valid', () => {
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
    const validator = new JoiValidator((schema) => ({
      'filter:test[=]': schema.number(),
      'filter:test[!=]': schema.number(),
    }))

    expect(validator.validateFilters(parser.parse())).toBeInstanceOf(Map)
  })

  test('throws `ValidationError` if a filter is invalid', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 'invalid' } },
      new Schema().filter('test', '=')
    )
    const validator = new JoiValidator((schema) => ({
      'filter:test[=]': schema.number(),
    }))

    expect(() => validator.validateFilters(parser.parse())).toThrow(
      new ValidationError('filter:test[=] must be a number')
    )
  })
})

describe('validateSorts', () => {
  test('returns the parsed sorts if no schema is defined', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'))
    const validator = new JoiValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validateSorts(parser.parse())).toBeInstanceOf(Map)
  })

  test('returns the parsed sorts if all sorts are valid', () => {
    const parser = new SortParser(
      'sort',
      ['test1', 'test2'],
      new Schema().sort('test1').sort('test2')
    )
    const validator = new JoiValidator((schema) => ({
      'sort:test1': schema.string().valid('asc'),
    }))

    expect(validator.validateSorts(parser.parse())).toBeInstanceOf(Map)
  })

  test('throws `ValidationError` if a sort is invalid', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'))
    const validator = new JoiValidator((schema) => ({
      'sort:test': schema.string().invalid('asc'),
    }))

    expect(() => validator.validateSorts(parser.parse())).toThrow(
      new ValidationError('sort:test contains an invalid value')
    )
  })
})

describe('validatePage', () => {
  test('returns the parsed page if no schema is defined', () => {
    const parser = new PageParser('page', '2', new Schema())
    const validator = new JoiValidator(() => {})

    expect(validator.schema).toBeUndefined()
    expect(validator.validatePage(parser.parse())).toBeInstanceOf(Map)
  })

  test('returns the parsed page if page is valid', () => {
    const parser = new PageParser('page', '2', new Schema())
    const validator = new JoiValidator((schema) => ({
      'page:size': schema.number().valid(20),
      'page:number': schema.number().valid(2),
    }))

    expect(validator.validatePage(parser.parse())).toBeInstanceOf(Map)
  })

  test('throws `ValidationError` if page is invalid', () => {
    const parser = new PageParser('page', '2', new Schema())
    const validator = new JoiValidator((schema) => ({
      'page:number': schema.number().invalid(2),
    }))

    expect(() => validator.validatePage(parser.parse())).toThrow(
      new ValidationError('page:number contains an invalid value')
    )
  })
})
