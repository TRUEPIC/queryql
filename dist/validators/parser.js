"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const joi_validation_error_converter_1 = __importDefault(require("../services/joi_validation_error_converter"));
class ParserValidator {
    constructor(defineSchema, queryKey, query) {
        this.schema = defineSchema(joi_1.default);
        this.queryKey = queryKey;
        this.query = query;
    }
    buildError(error) {
        return (0, joi_validation_error_converter_1.default)(error, this.queryKey);
    }
    validate() {
        if (!this.schema) {
            return this.query;
        }
        const { value, error } = this.schema.validate(this.query);
        if (error) {
            throw this.buildError(error);
        }
        return value;
    }
}
exports.default = ParserValidator;
