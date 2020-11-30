const BaseValidator = require('../../../../src/validators/querier/base')
const NotImplementedError = require('../../../../src/errors/not_implemented')
const ValidationError = require('../../../../src/errors/validation')

describe('constructor', () => {
  test('accepts/calls `defineSchema` and sets the returned value', () => {
    const defineSchema = jest.fn(() => 'test')
    const validator = new BaseValidator(defineSchema)

    expect(defineSchema).toHaveBeenCalled()
    expect(validator.schema).toBe('test')
  })
})

describe('validateFilters', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const validator = new BaseValidator(() => {})

    expect(() => validator.validateFilters()).toThrow(NotImplementedError)
  })
})

describe('validateSorts', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const validator = new BaseValidator(() => {})

    expect(() => validator.validateSorts()).toThrow(NotImplementedError)
  })
})

describe('validatePage', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const validator = new BaseValidator(() => {})

    expect(() => validator.validatePage()).toThrow(NotImplementedError)
  })
})

describe('defineSchemaArgs', () => {
  test('returns no arguments to call `defineSchema` with', () => {
    const validator = new BaseValidator(() => {})

    expect(validator.defineSchemaArgs).toEqual([])
  })
})

describe('buildError', () => {
  test('returns a `ValidationError` with the specified message', () => {
    const validator = new BaseValidator(() => {})

    expect(validator.buildError('test')).toEqual(new ValidationError('test'))
  })
})
