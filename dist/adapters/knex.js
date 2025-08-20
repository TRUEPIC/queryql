"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const filter_operator_1 = require("../types/filter_operator");
class KnexAdapter extends base_1.default {
    static get FILTER_OPERATORS() {
        return filter_operator_1.FILTER_OPERATORS;
    }
    static get DEFAULT_FILTER_OPERATOR() {
        return filter_operator_1.DEFAULT_FILTER_OPERATOR;
    }
    defineValidation(schema) {
        return {
            'filter:=': schema
                .alternatives()
                .try(schema.string(), schema.number(), schema.boolean()),
            'filter:!=': schema
                .alternatives()
                .try(schema.string(), schema.number(), schema.boolean()),
            'filter:<>': schema
                .alternatives()
                .try(schema.string(), schema.number(), schema.boolean()),
            'filter:>': schema.alternatives().try(schema.string(), schema.number()),
            'filter:>=': schema.alternatives().try(schema.string(), schema.number()),
            'filter:<': schema.alternatives().try(schema.string(), schema.number()),
            'filter:<=': schema.alternatives().try(schema.string(), schema.number()),
            'filter:is': schema.any().valid(null).empty(['null', '']).default(null),
            'filter:is not': schema
                .any()
                .valid(null)
                .empty(['null', ''])
                .default(null),
            'filter:in': schema.array().items(schema.string(), schema.number()),
            'filter:not in': schema.array().items(schema.string(), schema.number()),
            'filter:like': schema.string(),
            'filter:not like': schema.string(),
            'filter:ilike': schema.string(),
            'filter:not ilike': schema.string(),
            'filter:between': schema
                .array()
                .length(2)
                .items(schema.string(), schema.number()),
            'filter:not between': schema
                .array()
                .length(2)
                .items(schema.string(), schema.number()),
        };
    }
    'filter:*'(builder, filter) {
        const { field, operator, value } = filter;
        return builder.where(field, operator, value);
    }
    sort(builder, sort) {
        const { field, order } = sort;
        return builder.orderBy(field, order);
    }
    page(builder, page) {
        const { size, offset } = page;
        return builder.limit(size).offset(offset);
    }
}
exports.default = KnexAdapter;
