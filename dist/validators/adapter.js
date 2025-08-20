"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const joi_validation_error_converter_1 = __importDefault(require("../services/joi_validation_error_converter"));
class AdapterValidator {
    constructor(defineSchema) {
        const defined = defineSchema(joi_1.default);
        if (defined) {
            this.schema = joi_1.default.object().keys(defined);
        }
    }
    buildError(error, key) {
        return (0, joi_validation_error_converter_1.default)(error, key);
    }
    validateValue(schemaKey, key, value) {
        let keySchema;
        try {
            keySchema = this.schema && this.schema.extract(schemaKey);
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
            filter.value = this.validateValue(`filter:${filter.operator}`, key, filter.value);
        }
        return filters;
    }
    validateSorts(sorts) {
        if (!this.schema) {
            return sorts;
        }
        for (const [key, sort] of sorts) {
            sort.order = this.validateValue('sort', key, sort.order);
        }
        return sorts;
    }
    validatePage(page) {
        if (!this.schema) {
            return page;
        }
        for (const [key, pageField] of page) {
            pageField.value = this.validateValue(`page:${pageField.field}`, key, pageField.value);
        }
        return page;
    }
}
exports.default = AdapterValidator;
