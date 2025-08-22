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

class QueryQL {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defineSchema(schema: Schema): void {
    throw new NotImplementedError()
  }
  defineValidation(): unknown {
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
;(QueryQL.adapters as any).BaseAdapter = (adapters as any).BaseAdapter
;(QueryQL.adapters as any).KnexAdapter = (adapters as any).KnexAdapter
;(QueryQL.validators as any).BaseValidator = (validators as any).BaseValidator
;(QueryQL.validators as any).JoiValidator = (validators as any).JoiValidator

export default QueryQL
export { adapters, Config, errors, validators }

// Backwards-compatible static properties used in tests
// backwards-compatible exports available via static properties on QueryQL
