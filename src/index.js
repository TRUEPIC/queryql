const adapters = require('./adapters')
const Config = require('./config')
const errors = require('./errors')
const Filterer = require('./orchestrators/filterer')
const NotImplementedError = require('./errors/not_implemented')
const Pager = require('./orchestrators/pager')
const Schema = require('./schema')
const Sorter = require('./orchestrators/sorter')
const validators = require('./validators/querier')

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
      this.defineValidation.bind(this)
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

module.exports = QueryQL
module.exports.adapters = adapters
module.exports.Config = Config
module.exports.errors = errors
module.exports.validators = validators
