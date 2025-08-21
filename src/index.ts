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
  query: ParsedQs | Record<string, unknown>
  builder: Knex.QueryBuilder
  config: Config
  adapter: BaseAdapter<Knex.QueryBuilder>
  schema: Schema
  filterer: Filterer
  sorter: Sorter
  pager: Pager
  validator: BaseValidator

  constructor(
    query: ParsedQs | Record<string, unknown> = {},
    builder: Knex.QueryBuilder,
    config?: ConfigValues,
  ) {
    this.query = query
    this.builder = builder

    this.config = new Config(config)

    const AdapterCtor = this.config.get('adapter')
    if (!AdapterCtor) throw new Error('adapter not configured')
    this.adapter = new AdapterCtor()

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

  defineValidation(...args: any[]): any {
    return undefined
  }

  get defaultFilter(): Filter | undefined {
    return undefined
  }

  get defaultSort(): any {
    return undefined
  }

  get defaultPage(): any {
    return undefined
  }

  get filterDefaults(): Record<string, any> | undefined {
    return undefined
  }

  get sortDefaults(): Record<string, any> | undefined {
    return undefined
  }

  get pageDefaults(): Record<string, any> | undefined {
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
namespace QueryQL {
  export let adapters: any
  export let Config: any
  export let errors: any
  export let validators: any
}

QueryQL.adapters = adapters
QueryQL.Config = Config
QueryQL.errors = errors
QueryQL.validators = validators

export default QueryQL
export { adapters, Config, errors, validators }
