"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
const base_1 = __importDefault(require("./base"));
const flatten_map_1 = __importDefault(require("../services/flatten_map"));
class FilterParser extends base_1.default {
    static get DEFAULTS() {
        return {
            name: null,
            field: null,
            operator: null,
            value: null,
        };
    }
    buildKey({ name, operator, }) {
        return `${this.queryKey}:${name}[${operator}]`;
    }
    defineValidation(schema) {
        const defaultOperator = this.defaults.operator;
        const mapNamesToOperators = Object.entries(this.schema.mapFilterNamesToOperators());
        const values = [
            schema.array(),
            schema.string(),
            schema.number(),
            schema.boolean(),
            schema.valid(null),
        ];
        return schema.object().keys(mapNamesToOperators.reduce((accumulator, [field, operators]) => {
            const operatorObject = schema
                .object()
                .pattern(schema.string().valid(...operators), [
                schema.object(),
                ...values,
            ]);
            return {
                ...accumulator,
                [field]: operators.includes(defaultOperator ?? '')
                    ? [...values, operatorObject]
                    : operatorObject,
            };
        }, {}));
    }
    flatten(map) {
        return (0, flatten_map_1.default)({
            map,
            value: (value) => value.value,
        });
    }
    parseObject(name, value) {
        return Object.keys(value).map((operator) => {
            const { options } = this.schema.filters.get(`${name}[${operator}]`);
            return {
                ...this.defaults,
                name,
                field: options.field || name,
                operator,
                value: value[operator],
            };
        });
    }
    parseNonObject(name, value) {
        const { options } = this.schema.filters.get(`${name}[${this.defaults.operator}]`);
        return {
            ...this.defaults,
            name,
            field: options.field || name,
            operator: this.defaults.operator,
            value,
        };
    }
    parse() {
        if (!this.query) {
            return new Map();
        }
        this.validate();
        const entries = Object.entries(this.query);
        const filters = [];
        for (const [name, value] of entries) {
            if (is_1.default.object(value)) {
                filters.push(...this.parseObject(name, value));
            }
            else {
                filters.push(this.parseNonObject(name, value));
            }
        }
        return new Map(filters.map((filter) => [this.buildKey(filter), filter]));
    }
}
exports.default = FilterParser;
