import knexModule from 'knex'
import { vi } from 'vitest'
const knex = knexModule({ client: 'pg' })

import BaseOrchestrator from './base'
import NotImplementedError from '../errors/not_implemented'
import TestQuerier from '../test/queriers/test'
import ValidationError from '../errors/validation'
let buildParser: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  buildParser = vi
    .spyOn(BaseOrchestrator.prototype, 'buildParser')
    .mockReturnValue({ parse: () => {} })
})

afterEach(() => {
  buildParser.mockRestore()
})

describe('constructor', () => {
  test('accepts a querier to set', () => {
    const querier: any = new TestQuerier({}, knex('test'))
    const filterer = new BaseOrchestrator(querier)

    expect(filterer.querier).toBe(querier)
  })

  test('calls `buildParser` and sets the returned value', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    expect(buildParser).toHaveBeenCalled()
    expect(orchestrator.parser).toBeDefined()
  })
})

describe('queryKey', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    expect(() => orchestrator.queryKey).toThrow(NotImplementedError)
  })
})

describe('schema', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    expect(() => orchestrator.schema).toThrow(NotImplementedError)
  })
})

describe('isEnabled', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    expect(() => orchestrator.isEnabled).toThrow(NotImplementedError)
  })
})

describe('buildParser', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    buildParser.mockRestore()

    expect(() => orchestrator.buildParser()).toThrow(NotImplementedError)
  })
})

describe('validate', () => {
  test('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.validate()).toThrow(NotImplementedError)
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
      new TestQuerier({ test: 123 }, knex('test')) as any,
    )

    vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')

    expect(orchestrator.query).toBe(123)
  })
})

describe('parse', () => {
  test('parses/returns the query', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true)

    orchestrator.parser = { parse: () => 123 }

    expect(orchestrator.parse()).toBe(123)
  })

  test('returns the cached parsed query on subsequent calls', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true)

    const parse = vi.fn(() => 123)

    orchestrator.parser = { parse }

    expect(orchestrator.parse()).toBe(123)
    expect(orchestrator.parse()).toBe(123)
    expect(parse).toHaveBeenCalledTimes(1)
  })

  test('returns `null` if disabled, no query', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({}, knex('test')) as any,
    )

    vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')
    vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false)

    expect(orchestrator.parse()).toBeNull()
  })

  test('throws `ValidationError` if disabled, with query', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({ test: 123 }, knex('test')) as any,
    )

    vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')
    vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false)

    expect(() => orchestrator.parse()).toThrow(
      new ValidationError(`${orchestrator.queryKey} is disabled`),
    )
  })
})

describe('apply', () => {
  test('calls/returns method on querier if method defined', () => {
    const querier: any = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = {
      name: 'test',
      field: 'test',
      order: 'asc',
    }

    vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('sort')
    querier['sort:test'] = vi.fn((builder: any) => builder)

    expect(orchestrator.apply(data, 'sort:test')).toBe(querier.builder)
    expect(querier['sort:test']).toHaveBeenCalledWith(querier.builder, data)
  })

  test('calls/returns method on adapter if querier method not defined', () => {
    const querier: any = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = {
      name: 'test',
      field: 'test',
      order: 'asc',
    }

    vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('sort')
    vi.spyOn(querier.adapter, 'sort')

    expect(orchestrator.apply(data, 'test')).toBe(querier.builder)
    expect(querier.adapter.sort).toHaveBeenCalledWith(querier.builder, data)
  })

  test('calls/returns method on adapter if no querier method specified', () => {
    const querier: any = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = {
      size: 20,
      number: 2,
      offset: 20,
    }

    vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('page')
    vi.spyOn(querier.adapter, 'page')

    expect(orchestrator.apply(data)).toBe(querier.builder)
    expect(querier.adapter.page).toHaveBeenCalledWith(querier.builder, data)
  })
})
