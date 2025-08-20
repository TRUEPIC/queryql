"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
class Schema {
    constructor() {
        this.filters = new Map();
        this.sorts = new Map();
        this.page(false);
    }
    filter(name, operatorOrOperators, options = {}) {
        const operators = Array.isArray(operatorOrOperators)
            ? operatorOrOperators
            : [operatorOrOperators];
        for (const operator of operators) {
            this.filters.set(`${name}[${operator}]`, {
                name,
                operator,
                options,
            });
        }
        return this;
    }
    sort(name, options = {}) {
        this.sorts.set(name, {
            name,
            options,
        });
        return this;
    }
    page(isEnabledOrOptions = true) {
        if (is_1.default.bool(isEnabledOrOptions)) {
            this.pageOptions = { isEnabled: isEnabledOrOptions };
        }
        else {
            this.pageOptions = {
                ...isEnabledOrOptions,
                isEnabled: isEnabledOrOptions.isEnabled !== undefined
                    ? isEnabledOrOptions.isEnabled
                    : true,
            };
        }
        return this;
    }
    mapFilterNamesToOperators() {
        const filters = Array.from(this.filters.values());
        return filters.reduce((accumulator, filter) => {
            if (!accumulator[filter.name]) {
                accumulator[filter.name] = [];
            }
            accumulator[filter.name].push(filter.operator);
            return accumulator;
        }, {});
    }
}
exports.default = Schema;
