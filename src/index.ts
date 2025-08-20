import * as adapters from './adapters'
import Config, { ConfigValues } from './config'
import * as errors from './errors'
import Filterer from './orchestrators/filterer'
import NotImplementedError from './errors/not_implemented'
import Pager from './orchestrators/pager'
import Schema from './schema'
import Sorter from './orchestrators/sorter'
import * as validators from './validators/querier'

type QueryObj = Record<string, any>

class QueryQL<Q extends QueryObj = QueryObj, B = any> {
  query: Q
  builder: B
  config: ConfigValues & Config
  adapter: any
  schema: Schema
  filterer: Filterer
  sorter: Sorter
  pager: Pager
  validator: any

  constructor(query: Q, builder: B, config: any = {}) {
    this.query = query
    this.builder = builder

    this.config = new Config(config)

    const AdapterCtor = this.config.get('adapter') as new () => any
    this.adapter = new AdapterCtor()

    this.schema = new Schema()
    this.defineSchema(this.schema)

    this.filterer = new Filterer(this as any)
    this.sorter = new Sorter(this as any)
    this.pager = new Pager(this as any)

    const ValidatorCtor = this.config.get('validator') as new (
      ...args: any[]
    ) => any
    this.validator = new ValidatorCtor(this.defineValidation.bind(this))
  }

  defineSchema(schema: Schema): void {
    throw new NotImplementedError()
  }

  defineValidation(...args: any[]): any {
    return undefined
  }

  get defaultFilter(): any {
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

  run(): B {
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
