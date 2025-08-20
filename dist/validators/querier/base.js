"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const not_implemented_1 = __importDefault(require("../../errors/not_implemented"));
const validation_1 = __importDefault(require("../../errors/validation"));
class BaseValidator {
    constructor(defineSchema) {
        this.schema = defineSchema(...this.defineSchemaArgs);
    }
    validateFilters(filters) {
        throw new not_implemented_1.default();
    }
    validateSorts(sorts) {
        throw new not_implemented_1.default();
    }
    validatePage(page) {
        throw new not_implemented_1.default();
    }
    get defineSchemaArgs() {
        return [];
    }
    buildError(message, key) {
        // If key is provided, concatenate for compatibility with JoiValidator
        if (key) {
            return new validation_1.default(`${key} ${message}`);
        }
        return new validation_1.default(message);
    }
}
exports.default = BaseValidator;
