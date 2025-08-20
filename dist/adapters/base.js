"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
const adapter_1 = __importDefault(require("../validators/adapter"));
const not_implemented_1 = __importDefault(require("../errors/not_implemented"));
class BaseAdapter {
    constructor() {
        this.validator = new adapter_1.default(this.defineValidation.bind(this));
    }
    static get FILTER_OPERATORS() {
        throw new not_implemented_1.default();
    }
    static get DEFAULT_FILTER_OPERATOR() {
        throw new not_implemented_1.default();
    }
    'filter:*'(builder, filter) {
        throw new not_implemented_1.default();
    }
    sort(builder, sort) {
        throw new not_implemented_1.default();
    }
    page(builder, page) {
        throw new not_implemented_1.default();
    }
    // defineValidation is expected to accept the Joi module and return
    // an object mapping keys to Joi schemas or undefined.
    defineValidation(schema) {
        return undefined;
    }
    filter(builder, filter) {
        const { operator } = filter;
        const ctor = this.constructor;
        if (!ctor.FILTER_OPERATORS.includes(operator)) {
            throw new not_implemented_1.default();
        }
        const operatorMethod = `filter:${operator}`;
        if (is_1.default.fn(this[operatorMethod])) {
            return this[operatorMethod](builder, filter);
        }
        return this['filter:*'](builder, filter);
    }
}
exports.default = BaseAdapter;
