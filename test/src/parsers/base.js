const BaseParser = require('../../../src/parsers/base')
const NotImplementedError = require('../../../src/errors/not_implemented')
const Schema = require('../../../src/schema')
const ValidationError = require('../../../src/errors/validation')

describe('constructor', () => {
  test('accepts a query key to set', () => {
    const queryKey = 'test'
    const parser = new BaseParser(queryKey, {}, new Schema())

    expect(parser.queryKey).toBe(queryKey)
  })

  test('accepts a query to set', () => {
    const query = { test: 123 }
    const parser = new BaseParser('test', query, new Schema())

    expect(parser.query).toEqual(query)
  })

  test('accepts a schema to set', () => {
    const schema = new Schema()
    const parser = new BaseParser('test', {}, schema)

    expect(parser.schema).toBe(schema)
  })

  test('accepts an optional defaults object to set', () => {
    const defaults = { operator: '=' }
    const parser = new BaseParser('test', {}, new Schema(), defaults)

    expect(parser.defaults).toMatchObject(defaults)
  })
})

describe('buildKey', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const parser = new BaseParser('test', {}, new Schema())

    expect(() => parser.buildKey()).toThrow(NotImplementedError)
  })
})

describe('flatten', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const parser = new BaseParser('test', {}, new Schema())

    expect(() => parser.flatten()).toThrow(NotImplementedError)
  })
})

describe('parse', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const parser = new BaseParser('test', {}, new Schema())

    expect(() => parser.parse()).toThrow(NotImplementedError)
  })
})

describe('defineValidation', () => {
  test('is not defined by default', () => {
    const parser = new BaseParser('test', {}, new Schema())

    expect(parser.defineValidation()).toBeUndefined()
  })
})

describe('DEFAULTS', () => {
  test('returns an object of values to merge with instance defaults', () => {
    expect(BaseParser.DEFAULTS).toBeInstanceOf(Object)
  })
})

describe('defaults', () => {
  describe('set', () => {
    test('accepts an object with new values', () => {
      const parser = new BaseParser('test', {}, new Schema())
      const defaults = { test: 456 }

      parser.defaults = defaults

      expect(parser.defaults).toMatchObject(defaults)
    })
  })

  describe('get', () => {
    test('returns an object of all values', () => {
      const parser = new BaseParser('test', {}, new Schema())
      const defaults = { test: 789 }

      parser.defaults = defaults

      expect(parser.defaults).toMatchObject(defaults)
    })
  })
})

describe('validate', () => {
  test('returns the validated query if valid', () => {
    const defineValidation = jest
      .spyOn(BaseParser.prototype, 'defineValidation')
      .mockImplementation((schema) =>
        schema.object().keys({
          test: schema.number(),
        })
      )

    const parser = new BaseParser('test', { test: 123 }, new Schema())

    expect(parser.validate()).toEqual({ test: 123 })

    defineValidation.mockRestore()
  })

  test('returns the cached validated query on subsequent calls', () => {
    const defineValidation = jest
      .spyOn(BaseParser.prototype, 'defineValidation')
      .mockImplementation((schema) =>
        schema.object().keys({
          test: schema.number(),
        })
      )

    const parser = new BaseParser('test', { test: 123 }, new Schema())

    const validate = jest.spyOn(parser.validator, 'validate')

    expect(parser.validate()).toEqual({ test: 123 })
    expect(parser.validate()).toEqual({ test: 123 })
    expect(validate).toHaveBeenCalledTimes(1)

    defineValidation.mockRestore()
  })

  test('throws `ValidationError` if invalid', () => {
    const defineValidation = jest
      .spyOn(BaseParser.prototype, 'defineValidation')
      .mockImplementation((schema) =>
        schema.object().keys({
          invalid: schema.number(),
        })
      )

    const parser = new BaseParser('test', { invalid: 'invalid' }, new Schema())

    expect(() => parser.validate()).toThrow(
      new ValidationError('test:invalid must be a number')
    )

    defineValidation.mockRestore()
  })
})
