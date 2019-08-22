const JoiValidator = require('./validators/querier/joi')
const KnexAdapter = require('./adapters/knex')

class Config {
  constructor(config) {
    this.set(config)
  }

  static get DEFAULTS() {
    return {
      adapter: KnexAdapter,
      validator: JoiValidator,
    }
  }

  static set defaults(defaults) {
    this._defaults = {
      ...this._defaults,
      ...defaults,
    }
  }

  static get defaults() {
    return this._defaults
  }

  set(config) {
    this._config = {
      ...this.constructor.defaults,
      ...this._config,
      ...config,
    }
  }

  get(key = null) {
    if (key) {
      return this._config[key]
    } else {
      return this._config
    }
  }
}

Config.defaults = Config.DEFAULTS

module.exports = Config
