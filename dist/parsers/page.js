"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
const base_1 = __importDefault(require("./base"));
const flatten_map_1 = __importDefault(require("../services/flatten_map"));
class PageParser extends base_1.default {
    static get DEFAULTS() {
        return {
            size: 20,
            number: 1,
        };
    }
    buildKey({ field }, includeQueryKey = true) {
        let key = field;
        if (includeQueryKey) {
            key = `${this.queryKey}:${key}`;
        }
        return key;
    }
    defineValidation(schema) {
        return schema.alternatives().try(schema.number().integer().positive(), schema.object().keys({
            size: schema.number().integer().positive(),
            number: schema.number().integer().positive(),
        }));
    }
    flatten(map, includeQueryKey = true) {
        return (0, flatten_map_1.default)({
            map,
            key: (_key, value) => this.buildKey(value, includeQueryKey),
            value: (value) => value.value,
        });
    }
    parseNumber() {
        return {
            ...this.defaults,
            number: Number(this.query),
        };
    }
    parseObject() {
        const queryObj = { ...this.query };
        if (typeof queryObj.size === 'string') {
            queryObj.size = Number(queryObj.size);
        }
        return {
            ...this.defaults,
            ...queryObj,
        };
    }
    parse() {
        this.validate();
        let page;
        if (!this.query) {
            page = this.defaults;
        }
        else if (is_1.default.number(this.query) || is_1.default.string(this.query)) {
            page = this.parseNumber();
        }
        else {
            page = this.parseObject();
        }
        page.offset = (page.number - 1) * page.size;
        return new Map(Object.entries(page).map(([field, value]) => [
            this.buildKey({ field }),
            { field, value },
        ]));
    }
}
exports.default = PageParser;
