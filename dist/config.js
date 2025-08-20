"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("./validators/querier/joi"));
const knex_1 = __importDefault(require("./adapters/knex"));
class Config {
    constructor(config = {}) {
        this._config = {};
        this.set(config);
    }
    static get DEFAULTS() {
        return {
            adapter: knex_1.default,
            validator: joi_1.default,
        };
    }
    static set defaults(defaults) {
        this._defaults = {
            ...this._defaults,
            ...defaults,
        };
    }
    static get defaults() {
        return this._defaults;
    }
    set(config = {}) {
        // Use (this.constructor as typeof Config).defaults for static access
        this._config = {
            ...this.constructor.defaults,
            ...this._config,
            ...config,
        };
    }
    get(key) {
        if (key) {
            return this._config[key];
        }
        else {
            return this._config;
        }
    }
}
exports.default = Config;
Config.defaults = Config.DEFAULTS;
