import JoiValidator from './validators/querier/joi'
import KnexAdapter from './adapters/knex'

export interface ConfigValues {
  adapter?: typeof KnexAdapter
  validator?: typeof JoiValidator
  [key: string]: any
}

export default class Config {
  private _config: ConfigValues = {}
  static _defaults: ConfigValues

  constructor(config: ConfigValues = {}) {
    this.set(config)
  }

  static get DEFAULTS(): ConfigValues {
    return {
      adapter: KnexAdapter,
      validator: JoiValidator,
    }
  }

  static set defaults(defaults: ConfigValues) {
    this._defaults = {
      ...this._defaults,
      ...defaults,
    }
  }

  static get defaults(): ConfigValues {
    return this._defaults
  }

  set(config: ConfigValues = {}): void {
    // Use (this.constructor as typeof Config).defaults for static access
    this._config = {
      ...(this.constructor as typeof Config).defaults,
      ...this._config,
      ...config,
    }
  }

  get(): ConfigValues
  get<K extends keyof ConfigValues>(key: K): ConfigValues[K]
  get(key?: keyof ConfigValues | null): any {
    if (key) {
      return this._config[key]
    } else {
      return this._config
    }
  }
}

Config.defaults = Config.DEFAULTS
