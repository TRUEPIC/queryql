"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const page_1 = __importDefault(require("../parsers/page"));
class Pager extends base_1.default {
    get queryKey() {
        return 'page';
    }
    get schema() {
        return this.querier.schema.pageOptions;
    }
    get isEnabled() {
        return this.schema.isEnabled;
    }
    buildParser() {
        return new page_1.default(this.queryKey, this.query || this.querier.defaultPage, this.querier.schema, this.querier.pageDefaults);
    }
    validate() {
        if (!this.isEnabled) {
            return true;
        }
        this.parser.validate();
        this.querier.adapter.validator.validatePage(this.parse());
        this.querier.validator.validatePage(this.parse());
        return true;
    }
    run() {
        this.validate();
        const page = this.parse();
        if (page) {
            this.apply(this.parser.flatten(page, false));
        }
        return this.querier;
    }
}
exports.default = Pager;
