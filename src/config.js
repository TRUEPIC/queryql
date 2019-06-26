const JoiValidator = require('./validators/joi')
const KnexAdapter = require('./adapters/knex')

class Config {
  constructor (config) {
    this.constructor.defaults = this.constructor.DEFAULTS

    this.set(config)
  }

  static get DEFAULTS () {
    return {
      adapter: KnexAdapter,
      validator: JoiValidator
    }
  }

  static set defaults (defaults) {
    this._defaults = {
      ...this.DEFAULTS,
      ...this._defaults,
      ...defaults
    }
  }

  static get defaults () {
    return this._defaults
  }

  set (config) {
    this._config = {
      ...this.constructor.defaults,
      ...this._config,
      ...config
    }
  }

  get (key = null) {
    if (key) {
      return this._config[key]
    } else {
      return this._config
    }
  }
}

module.exports = Config
