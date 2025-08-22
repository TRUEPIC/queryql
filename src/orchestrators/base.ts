import is from 'is'
import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ValidationError from '../errors/validation'

import type { Knex } from 'knex'
import Schema from '../schema'
import { BaseAdapter } from '../adapters/base'
import { BaseValidator } from '../validators/querier/base'

type AnyObject = Record<string, unknown>

export interface Querier<
  Q = unknown,
  B = Knex.QueryBuilder,
  A = BaseAdapter<Knex.QueryBuilder>,
> {
  query: Q & AnyObject
  builder: B
  adapter: A & AnyObject
  validator?: BaseValidator
  schema?: Schema
  defaultFilter?: unknown
  defaultSort?: unknown
  defaultPage?: unknown
  filterDefaults?: AnyObject
  sortDefaults?: AnyObject
  pageDefaults?: AnyObject
  [key: string]: unknown
}

export interface Parser<T = unknown> {
  parse(): T
  validate?(): void
  flatten?(value: T, flag?: boolean): Record<string, unknown>
  buildKey?(schema: unknown): string
}

export default class BaseOrchestrator<
  Q = unknown,
  SchemaT = unknown,
  ParseT = unknown,
  B = Knex.QueryBuilder,
  A = BaseAdapter<Knex.QueryBuilder>,
> {
  querier: Querier<Q, B, A>
  parser: Parser<ParseT>

  constructor(querier: Querier<Q, B, A>) {
    this.querier = querier
    this.parser = this.buildParser()
    // cache returns a no-arg function; cast to the correct generic-aware types
    this.validate = cache(this.validate.bind(this), this) as () => unknown
    this.parse = cache(
      this.parse.bind(this),
      this,
    ) as unknown as () => ParseT | null
  }

  get queryKey(): string {
    throw new NotImplementedError()
  }

  get schema(): SchemaT {
    throw new NotImplementedError()
  }

  get isEnabled(): boolean {
    throw new NotImplementedError()
  }

  buildParser(): Parser<ParseT> {
    throw new NotImplementedError()
  }

  validate(): unknown {
    throw new NotImplementedError()
  }

  run(): unknown {
    throw new NotImplementedError()
  }

  get query(): Q {
    return (this.querier.query as unknown as Record<string, unknown>)[
      this.queryKey
    ] as unknown as Q
  }

  parse(): ParseT | null {
    if (!this.isEnabled) {
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`)
      }
      return null as unknown as ParseT
    }
    return this.parser.parse()
  }
  apply(values: unknown, querierMethod: string | null = null): B {
    const args: unknown[] = [this.querier.builder, values]
    this.querier.builder =
      querierMethod && is.fn(this.querier[querierMethod])
        ? (this.querier[querierMethod] as (...a: unknown[]) => B)(...args)
        : (this.querier.adapter[this.queryKey] as (...a: unknown[]) => B)(
            ...args,
          )
    return this.querier.builder
  }
}
