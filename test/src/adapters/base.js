const BaseAdapter = require('../../../src/adapters/base')
const NotImplementedError = require('../../../src/errors/not_implemented')

describe('constructor', () => {
  test('creates an instance of the validator, calls `defineValidation`', () => {
    const defineValidation = jest.spyOn(
      BaseAdapter.prototype,
      'defineValidation'
    )

    expect(new BaseAdapter().validator.constructor.name).toBe(
      'AdapterValidator'
    )
    expect(defineValidation).toHaveBeenCalled()

    defineValidation.mockRestore()
  })
})

describe('FILTER_OPERATORS', () => {
  test('defaults to requiring `=` operator support', () => {
    expect(BaseAdapter.FILTER_OPERATORS).toEqual(['='])
  })
})

describe('DEFAULT_FILTER_OPERATOR', () => {
  test('defaults to `=` when no operator is specified', () => {
    expect(BaseAdapter.DEFAULT_FILTER_OPERATOR).toBe('=')
  })
})

describe('filter:*', () => {
  test('throws `NotImplementedError` when not extended', () => {
    expect(() => new BaseAdapter()['filter:*']()).toThrow(NotImplementedError)
  })
})

describe('sort', () => {
  test('throws `NotImplementedError` when not extended', () => {
    expect(() => new BaseAdapter().sort()).toThrow(NotImplementedError)
  })
})

describe('page', () => {
  test('throws `NotImplementedError` when not extended', () => {
    expect(() => new BaseAdapter().page()).toThrow(NotImplementedError)
  })
})

describe('defineValidation', () => {
  test('is not defined by default', () => {
    expect(new BaseAdapter().defineValidation()).toBeUndefined()
  })
})

describe('filter', () => {
  test('calls/returns `filter:{operator}` if defined', () => {
    const adapter = new BaseAdapter()
    const builder = 'builder'
    const filter = { operator: '=' }

    adapter['filter:='] = jest.fn(() => 'test')

    adapter.filter(builder, filter)

    expect(adapter['filter:=']).toHaveBeenCalledWith(builder, filter)
    expect(adapter['filter:=']).toHaveReturnedWith('test')
  })

  test('calls/returns `filter:*` if operator method is not defined', () => {
    const adapter = new BaseAdapter()
    const builder = 'builder'
    const filter = { operator: '=' }

    adapter['filter:*'] = jest.fn(() => 'test')

    adapter.filter(builder, filter)

    expect(adapter['filter:*']).toHaveBeenCalledWith(builder, filter)
    expect(adapter['filter:*']).toHaveReturnedWith('test')
  })

  test('throws `NotImplementedError` if operator is not supported', () => {
    expect(() =>
      new BaseAdapter().filter('builder', { operator: 'test' })
    ).toThrow(NotImplementedError)
  })
})
