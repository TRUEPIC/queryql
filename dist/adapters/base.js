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
    'filter:*'(..._args) {
        throw new not_implemented_1.default();
    }
    sort(..._args) {
        throw new not_implemented_1.default();
    }
    page(..._args) {
        throw new not_implemented_1.default();
    }
    defineValidation(..._args) {
        return undefined;
    }
    filter(builder, filter) {
        const { operator } = filter;
        if (!this.constructor.FILTER_OPERATORS.includes(operator)) {
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
