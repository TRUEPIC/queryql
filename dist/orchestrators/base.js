"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
const cache_function_1 = __importDefault(require("../services/cache_function"));
const not_implemented_1 = __importDefault(require("../errors/not_implemented"));
const validation_1 = __importDefault(require("../errors/validation"));
class BaseOrchestrator {
    constructor(querier) {
        this.querier = querier;
        this.parser = this.buildParser();
        this.validate = (0, cache_function_1.default)(this.validate, this);
        this.parse = (0, cache_function_1.default)(this.parse, this);
    }
    get queryKey() {
        throw new not_implemented_1.default();
    }
    get schema() {
        throw new not_implemented_1.default();
    }
    get isEnabled() {
        throw new not_implemented_1.default();
    }
    buildParser() {
        throw new not_implemented_1.default();
    }
    validate() {
        throw new not_implemented_1.default();
    }
    run() {
        throw new not_implemented_1.default();
    }
    get query() {
        return this.querier.query[this.queryKey];
    }
    parse() {
        if (!this.isEnabled) {
            if (this.query) {
                throw new validation_1.default(`${this.queryKey} is disabled`);
            }
            return null;
        }
        return this.parser.parse();
    }
    apply(values, querierMethod = null) {
        const args = [this.querier.builder, values];
        this.querier.builder =
            querierMethod && is_1.default.fn(this.querier[querierMethod])
                ? this.querier[querierMethod](...args)
                : this.querier.adapter[this.queryKey](...args);
        return this.querier.builder;
    }
}
exports.default = BaseOrchestrator;
