import is from 'is'
import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ValidationError from '../errors/validation'

type AnyObject = Record<string, any>

interface Querier<Q = any, B = any, A = any> {
  query: Q & AnyObject
  builder: B
  adapter: A & AnyObject
  validator?: AnyObject
  schema?: AnyObject
  defaultFilter?: any
  defaultSort?: any
  defaultPage?: any
  filterDefaults?: AnyObject
  sortDefaults?: AnyObject
  pageDefaults?: AnyObject
  [key: string]: any
}

interface Parser<T = any> {
  parse(): T
  validate?(): void
  flatten?(value: any, flag?: boolean): any
  buildKey?(schema: any): string
}

export default class BaseOrchestrator<Q = any, S = any, B = any, A = any> {
  querier: Querier<Q, B, A>
  parser: Parser<any>

  constructor(querier: Querier<Q, B, A>) {
    this.querier = querier
    this.parser = this.buildParser()
    // cache returns a no-arg function; cast to any to match the instance method
    this.validate = cache(this.validate, this) as any
    this.parse = cache(this.parse, this) as any
  }

  get queryKey(): string {
    throw new NotImplementedError()
  }

  get schema(): S {
    throw new NotImplementedError()
  }

  get isEnabled(): boolean {
    throw new NotImplementedError()
  }

  buildParser(): { parse: () => any } {
    throw new NotImplementedError()
  }

  validate(): any {
    throw new NotImplementedError()
  }

  run(): any {
    throw new NotImplementedError()
  }

  get query(): Q {
    return this.querier.query[this.queryKey]
  }

  parse(): any {
    if (!this.isEnabled) {
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`)
      }
      return null
    }
    return this.parser.parse()
  }

  apply(values: any, querierMethod: string | null = null): B {
    const args = [this.querier.builder, values]
    this.querier.builder =
      querierMethod && is.fn(this.querier[querierMethod])
        ? this.querier[querierMethod](...args)
        : this.querier.adapter[this.queryKey](...args)
    return this.querier.builder
  }
}
