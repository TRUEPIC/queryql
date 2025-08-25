import * as adapters from './adapters'
import Config, { ConfigValues } from './config'
import * as errors from './errors'
import Filterer from './orchestrators/filterer'
import NotImplementedError from './errors/not_implemented'
import Pager from './orchestrators/pager'
import Schema from './schema'
import Sorter from './orchestrators/sorter'
import * as validators from './validators/querier'
import { BaseValidator } from './validators/querier/base'
import { BaseAdapter } from './adapters/base'
import { ParsedQs } from 'qs'
import { Knex } from 'knex'
import Joi from 'joi'

class QueryQL<V = typeof Joi> {
  [key: string]: unknown
  query: ParsedQs | Record<string, unknown>
  builder: Knex.QueryBuilder
  config: Config
  adapter: BaseAdapter<Knex.QueryBuilder>
  schema: Schema
  filterer: Filterer
  sorter: Sorter
  pager: Pager
  validator: BaseValidator
  static adapters: unknown = adapters
  static Config: unknown = Config
  static errors: unknown = errors
  static validators: unknown = validators

  constructor(
    query: ParsedQs | Record<string, unknown> = {},
    builder: Knex.QueryBuilder,
    config?: ConfigValues,
  ) {
    this.query = query
    this.builder = builder

    this.config = new Config(config)

    const AdapterCtor = this.config.get('adapter') as unknown
    if (!AdapterCtor) throw new Error('adapter not configured')
    this.adapter = new (AdapterCtor as unknown as {
      new (): BaseAdapter<Knex.QueryBuilder>
    })()

    this.schema = new Schema()
    this.defineSchema(this.schema)

    this.filterer = new Filterer(this)
    this.sorter = new Sorter(this)
    this.pager = new Pager(this)

    const ValidatorCtor = this.config.get('validator')
    if (!ValidatorCtor) throw new Error('validator not configured')
    this.validator = new ValidatorCtor(this.defineValidation.bind(this))
  }

  defineSchema(schema: Schema): void {
    void schema
    throw new NotImplementedError()
  }
  // Allow defineValidation to accept the validator's schema builder (Joi
  // by default). The generic parameter `V` controls the type of the
  // schema passed to defineValidation; it defaults to the runtime Joi
  // module so consumers get a sensible default without having to add
  // explicit generics.
  defineValidation(schema?: V): unknown {
    void schema
    return undefined
  }

  get defaultFilter(): Record<string, unknown> | undefined {
    return undefined
  }

  get defaultSort(): unknown {
    return undefined
  }

  get defaultPage(): unknown {
    return undefined
  }

  get filterDefaults(): Record<string, unknown> | undefined {
    return undefined
  }

  get sortDefaults(): Record<string, unknown> | undefined {
    return undefined
  }

  get pageDefaults(): Record<string, unknown> | undefined {
    return undefined
  }

  validate(): boolean {
    return (
      this.filterer.validate() &&
      this.sorter.validate() &&
      this.pager.validate()
    )
  }

  run(): Knex.QueryBuilder {
    this.validate()

    this.filterer.run()
    this.sorter.run()
    this.pager.run()

    return this.builder
  }
}

// Attach helpers as static properties to match existing runtime API/tests
// expose helpers for compatibility with the previous runtime API/tests
export const adaptersExport: unknown = adapters
export const ConfigExport: unknown = Config
export const errorsExport: unknown = errors
export const validatorsExport: unknown = validators

// Ensure static objects expose named keys used by tests (BaseAdapter/BaseValidator)
// Use Record<string, unknown> and narrow casts instead of `any`.
;(QueryQL.adapters as unknown as Record<string, unknown>).BaseAdapter = (
  adapters as unknown as Record<string, unknown>
).BaseAdapter
;(QueryQL.adapters as unknown as Record<string, unknown>).KnexAdapter = (
  adapters as unknown as Record<string, unknown>
).KnexAdapter
;(QueryQL.validators as unknown as Record<string, unknown>).BaseValidator = (
  validators as unknown as Record<string, unknown>
).BaseValidator
;(QueryQL.validators as unknown as Record<string, unknown>).JoiValidator = (
  validators as unknown as Record<string, unknown>
).JoiValidator

export default QueryQL
export { adapters, Config, errors, validators }
export type { Schema } from './schema'
// A typed factory that receives the validator's schema builder (Joi, etc.)
// and returns a concrete schema. Consumers can import this and supply the
// validator's root type: `DefineValidation<typeof Joi>`.
export type DefineValidation<T = typeof Joi> = (schema?: T) => unknown

// Backwards-compatible static properties used in tests
// backwards-compatible exports available via static properties on QueryQL
