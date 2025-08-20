"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const base_1 = __importDefault(require("./base"));
const joi_validation_error_converter_1 = __importDefault(require("../../services/joi_validation_error_converter"));
class JoiValidator extends base_1.default {
    constructor(defineSchema) {
        super(defineSchema);
        if (this.schema) {
            this.schema = joi_1.default.object().keys(this.schema);
        }
    }
    get defineSchemaArgs() {
        return [joi_1.default];
    }
    buildError(error, key) {
        return (0, joi_validation_error_converter_1.default)(error, key);
    }
    validateValue(key, value) {
        let keySchema;
        try {
            keySchema = this.schema && this.schema.extract(key);
        }
        catch {
            // Don't throw error if key doesn't exist.
        }
        if (!keySchema) {
            return value;
        }
        const { value: valueValidated, error } = keySchema.validate(value);
        if (error) {
            throw this.buildError(error, key);
        }
        return valueValidated;
    }
    validateFilters(filters) {
        if (!this.schema) {
            return filters;
        }
        for (const [key, filter] of filters) {
            filter.value = this.validateValue(key, filter.value);
        }
        return filters;
    }
    validateSorts(sorts) {
        if (!this.schema) {
            return sorts;
        }
        for (const [key, sort] of sorts) {
            sort.order = this.validateValue(key, sort.order);
        }
        return sorts;
    }
    validatePage(page) {
        if (!this.schema) {
            return page;
        }
        for (const [key, pageField] of page) {
            pageField.value = this.validateValue(key, pageField.value);
        }
        return page;
    }
}
exports.default = JoiValidator;
