"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const filter_1 = __importDefault(require("../parsers/filter"));
class Filterer extends base_1.default {
    get queryKey() {
        return 'filter';
    }
    get schema() {
        return this.querier.schema.filters;
    }
    get isEnabled() {
        return this.schema.size >= 1;
    }
    buildParser() {
        return new filter_1.default(this.queryKey, this.query || this.querier.defaultFilter, this.querier.schema, {
            operator: this.querier.adapter.constructor.DEFAULT_FILTER_OPERATOR,
            ...this.querier.filterDefaults,
        });
    }
    validate() {
        if (!this.isEnabled) {
            return true;
        }
        this.parser.validate();
        this.querier.adapter.validator.validateFilters(this.parse());
        this.querier.validator.validateFilters(this.parse());
        return true;
    }
    run() {
        this.validate();
        const filters = this.parse();
        if (!filters) {
            return this.querier;
        }
        let key;
        let filter;
        for (const filterSchema of this.schema.values()) {
            key = this.parser.buildKey(filterSchema);
            filter = filters.get(key);
            if (filter) {
                this.apply(filter, key);
            }
        }
        return this.querier;
    }
}
exports.default = Filterer;
