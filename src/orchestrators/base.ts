import is from 'is'
import cache from '../services/cache_function'
import NotImplementedError from '../errors/not_implemented'
import ValidationError from '../errors/validation'

export default class BaseOrchestrator<Q = any, S = any, B = any, A = any> {
  querier: Querier<Q, B, A>
  parser: { parse: () => any }

  constructor(querier: Querier<Q, B, A>) {
    this.querier = querier
    this.parser = this.buildParser()
    this.validate = cache(this.validate, this)
    this.parse = cache(this.parse, this)
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
