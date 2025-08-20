"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const sort_1 = __importDefault(require("../parsers/sort"));
class Sorter extends base_1.default {
    get queryKey() {
        return 'sort';
    }
    get schema() {
        return this.querier.schema.sorts;
    }
    get isEnabled() {
        return this.schema.size >= 1;
    }
    buildParser() {
        return new sort_1.default(this.queryKey, this.query || this.querier.defaultSort, this.querier.schema, this.querier.sortDefaults);
    }
    validate() {
        if (!this.isEnabled) {
            return true;
        }
        this.parser.validate();
        this.querier.adapter.validator?.validateSorts(this.parse());
        this.querier.validator?.validateSorts(this.parse());
        return true;
    }
    run() {
        this.validate();
        const sorts = this.parse();
        if (!sorts) {
            return this.querier;
        }
        for (const [key, sort] of sorts) {
            this.apply(sort, key);
        }
        return this.querier;
    }
}
exports.default = Sorter;
