const knex = require('knex')({ client: 'pg' })

const BaseOrchestrator = require('../../../src/orchestrators/base')
const NotImplementedError = require('../../../src/errors/not_implemented')
const TestQuerier = require('../../queriers/test')
const ValidationError = require('../../../src/errors/validation')

describe('constructor', () => {
  test('accepts a querier to set', () => {
    const querier = new TestQuerier({}, knex('test'))
    const filterer = new BaseOrchestrator(querier)

    expect(filterer.querier).toBe(querier)
  })
})

describe('queryKey', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.queryKey).toThrow(NotImplementedError)
  })
})

describe('schema', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.schema).toThrow(NotImplementedError)
  })
})

describe('isEnabled', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.isEnabled).toThrow(NotImplementedError)
  })
})

describe('buildParser', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.buildParser()).toThrow(NotImplementedError)
  })
})

describe('parseFlat', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.parseFlat()).toThrow(NotImplementedError)
  })
})

describe('run', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.run()).toThrow(NotImplementedError)
  })
})

describe('query', () => {
  test('returns the query value specified by the query key', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({ test: 123 }, knex('test'))
    )

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')

    expect(orchestrator.query).toBe(123)
  })
})

describe('parse', () => {
  test('parses/returns the query', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true)

    orchestrator.buildParser = () => ({ parse: () => 123 })

    expect(orchestrator.parse()).toBe(123)
  })

  test('returns the cached parsed query on subsequent calls', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true)

    const parse = jest.fn(() => 123)

    orchestrator.buildParser = () => ({ parse })

    expect(orchestrator.parse()).toBe(123)
    expect(orchestrator.parse()).toBe(123)
    expect(parse).toHaveBeenCalledTimes(1)
  })

  test('returns `null` if disabled, no query', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')
    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false)

    expect(orchestrator.parse()).toBeNull()
  })

  test('throws `ValidationError` if disabled, with query', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({ test: 123 }, knex('test'))
    )

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')
    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false)

    expect(() => orchestrator.parse()).toThrow(
      new ValidationError(`${orchestrator.queryKey} is disabled`)
    )
  })
})

describe('apply', () => {
  test('calls `querier.apply` with a method if specified', () => {
    const querier = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = 123
    const method = 'test'

    querier.apply = jest.fn()

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')

    orchestrator.apply(data, method)

    expect(querier.apply).toHaveBeenCalledWith(
      orchestrator.queryKey,
      data,
      `${orchestrator.queryKey}:${method}`
    )
  })

  test('calls `querier.apply` without a method if not specified', () => {
    const querier = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = 123

    querier.apply = jest.fn()

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')

    orchestrator.apply(data)

    expect(querier.apply).toHaveBeenCalledWith(
      orchestrator.queryKey,
      data,
      null
    )
  })
})
