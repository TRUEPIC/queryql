const Config = require('../../src/config')

describe('constructor', () => {
  test('accepts an object of values to set', () => {
    const values = { test: 123 }

    expect(new Config(values).get()).toMatchObject(values)
  })
})

describe('DEFAULTS', () => {
  test('returns `KnexAdapter` as the default adapter', () => {
    expect(Config.DEFAULTS.adapter.name).toBe('KnexAdapter')
  })

  test('returns `JoiValidator` as the default validator', () => {
    expect(Config.DEFAULTS.validator.name).toBe('JoiValidator')
  })
})

describe('defaults', () => {
  afterEach(() => {
    Config._defaults = Config.DEFAULTS
  })

  describe('set', () => {
    test('accepts an object with new values', () => {
      const defaults = { test: 456 }

      Config.defaults = defaults

      expect(Config.defaults).toMatchObject(defaults)
    })

    test('merges the new values with existing values', () => {
      const existingValues = Config.defaults
      const newValues = { test: 789 }

      Config.defaults = newValues

      expect(Config.defaults).toEqual({
        ...existingValues,
        ...newValues,
      })
    })
  })

  describe('get', () => {
    test('returns an object of all values', () => {
      expect(Config.defaults).toEqual(Config.DEFAULTS)
    })
  })
})

describe('set', () => {
  test('accepts an object with new values', () => {
    const config = new Config({})
    const values = { test: 'testing' }

    config.set(values)

    expect(config.get()).toMatchObject(values)
  })

  test('merges the new values with default values', () => {
    const config = new Config({})

    config.set({ test: 'testing' })

    expect(config.get()).toMatchObject(Config.defaults)
  })

  test('merges the new values with existing values', () => {
    const config = new Config({})

    config.set({ before: 123 })

    const existingValues = config.get()
    const newValues = { after: 456 }

    config.set(newValues)

    expect(config.get()).toEqual({
      ...existingValues,
      ...newValues,
    })
  })
})

describe('get', () => {
  test('returns an object of all values when no key argument is passed', () => {
    expect(new Config({}).get()).toEqual(Config.DEFAULTS)
  })

  test('returns a specific value when a key argument is passed', () => {
    expect(new Config({}).get('adapter')).toBe(Config.DEFAULTS.adapter)
  })
})
