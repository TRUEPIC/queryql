import * as adapters from './adapters'
import Config from './config'
import * as errors from './errors'
import Filterer from './orchestrators/filterer'
import NotImplementedError from './errors/not_implemented'
import Pager from './orchestrators/pager'
import Schema from './schema'
import Sorter from './orchestrators/sorter'
import * as validators from './validators/querier'

class QueryQL {
  constructor(query, builder, config = {}) {
    this.query = query
    this.builder = builder

    this.config = new Config(config)

    this.adapter = new (this.config.get('adapter'))()

    this.schema = new Schema()
    this.defineSchema(this.schema)

    this.filterer = new Filterer(this)
    this.sorter = new Sorter(this)
    this.pager = new Pager(this)

    this.validator = new (this.config.get('validator'))(
      this.defineValidation.bind(this),
    )
  }

  defineSchema(/* schema */) {
    throw new NotImplementedError()
  }

  defineValidation(/* ...args */) {
    return undefined
  }

  get defaultFilter() {
    return undefined
  }

  get defaultSort() {
    return undefined
  }

  get defaultPage() {
    return undefined
  }

  get filterDefaults() {
    return undefined
  }

  get sortDefaults() {
    return undefined
  }

  get pageDefaults() {
    return undefined
  }

  validate() {
    return (
      this.filterer.validate() &&
      this.sorter.validate() &&
      this.pager.validate()
    )
  }

  run() {
    this.validate()

    this.filterer.run()
    this.sorter.run()
    this.pager.run()

    return this.builder
  }
}

export default QueryQL
export { adapters, Config, errors, validators }
