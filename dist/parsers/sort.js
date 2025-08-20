"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
const base_1 = __importDefault(require("./base"));
const flatten_map_1 = __importDefault(require("../services/flatten_map"));
class SortParser extends base_1.default {
    static get DEFAULTS() {
        return {
            name: null,
            field: null,
            order: 'asc',
        };
    }
    buildKey({ name }) {
        return `${this.queryKey}:${name}`;
    }
    defineValidation(schema) {
        const keys = Array.from(this.schema.sorts.keys());
        if (!keys.length) {
            return schema.any().forbidden();
        }
        return schema.alternatives().try(schema.string().valid(...keys), schema
            .array()
            .items(schema.string().valid(...keys))
            .unique(), schema
            .object()
            .pattern(schema.string().valid(...keys), schema.string().valid('asc', 'desc').insensitive()));
    }
    flatten(map) {
        return (0, flatten_map_1.default)({
            map,
            value: (value) => value.order,
        });
    }
    parseString(name) {
        const { options } = this.schema.sorts.get(name);
        return {
            ...this.defaults,
            name,
            field: options.field || name,
            order: 'asc',
        };
    }
    parseArray(names) {
        return names.map((name) => {
            const { options } = this.schema.sorts.get(name);
            return {
                ...this.defaults,
                name,
                field: options.field || name,
                order: 'asc',
            };
        });
    }
    parseObject(query) {
        return Object.entries(query).map(([name, order]) => {
            const { options } = this.schema.sorts.get(name);
            return {
                ...this.defaults,
                name,
                field: options.field || name,
                order: order,
            };
        });
    }
    parse() {
        if (!this.query) {
            return new Map();
        }
        this.validate();
        const sorts = [];
        if (is_1.default.string(this.query)) {
            sorts.push(this.parseString(this.query));
        }
        else if (is_1.default.array(this.query)) {
            sorts.push(...this.parseArray(this.query));
        }
        else {
            sorts.push(...this.parseObject(this.query));
        }
        return new Map(sorts.map((sort) => [this.buildKey(sort), sort]));
    }
}
exports.default = SortParser;
