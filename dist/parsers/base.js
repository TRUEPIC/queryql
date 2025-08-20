"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_function_1 = __importDefault(require("../services/cache_function"));
const not_implemented_1 = __importDefault(require("../errors/not_implemented"));
const parser_1 = __importDefault(require("../validators/parser"));
class BaseParser {
    constructor(queryKey, query, schema, defaults = {}) {
        this.queryKey = queryKey;
        this.query = query;
        this.schema = schema;
        this._defaults = {
            ...this.constructor.DEFAULTS,
            ...defaults,
        };
        this.validator = new parser_1.default(this.defineValidation.bind(this), queryKey, query);
        // Bind and cache validate method
        this.validate = (0, cache_function_1.default)(this.validate.bind(this), this);
    }
    buildKey(parsed) {
        throw new not_implemented_1.default();
    }
    flatten(map) {
        throw new not_implemented_1.default();
    }
    parse() {
        throw new not_implemented_1.default();
    }
    defineValidation(joi) {
        return undefined;
    }
    static get DEFAULTS() {
        return {};
    }
    set defaults(defaults) {
        this._defaults = {
            ...this.constructor.DEFAULTS,
            ...defaults,
        };
    }
    get defaults() {
        return this._defaults;
    }
    validate() {
        this.query = this.validator.validate();
        return this.query;
    }
}
exports.default = BaseParser;
