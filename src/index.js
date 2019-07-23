const is = require('is')

const Config = require('./config')
const Filterer = require('./filterer')
const NotImplementedError = require('./errors/not_implemented')
const Pager = require('./pager')
const Schema = require('./schema')
const Sorter = require('./sorter')

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

    this.validator = new (this.config.get('validator'))(this)
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

  apply(type, data, method = null) {
    if (method && is.fn(this[method])) {
      this.builder = this[method](this.builder, data)
    } else {
      this.builder = this.adapter[type](this.builder, data)
    }

    return this.builder
  }

  parse() {
    this.filterer.parse()
    this.sorter.parse()
    this.pager.parse()

    return this
  }

  build() {
    this.parse()

    this.validator.validate()

    this.filterer.build()
    this.sorter.build()
    this.pager.build()

    return this.builder
  }
}

module.exports = QueryQL
