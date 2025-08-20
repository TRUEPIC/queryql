"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const joi_validation_error_converter_1 = __importDefault(require("./joi_validation_error_converter"));
const validation_1 = __importDefault(require("../errors/validation"));
test('prepends optional path prefix to path if path exists', () => {
    const { error } = joi_1.default.object()
        .keys({
        invalid: joi_1.default.number(),
    })
        .validate({ invalid: 'invalid' });
    expect((0, joi_validation_error_converter_1.default)(error, 'test')).toEqual(new validation_1.default('test:invalid must be a number'));
});
test('uses optional path prefix as path if no path exists', () => {
    const { error } = joi_1.default.number().validate({ invalid: 'invalid' });
    expect((0, joi_validation_error_converter_1.default)(error, 'test')).toEqual(new validation_1.default('test must be a number'));
});
test('delineates path segments with []', () => {
    const { error } = joi_1.default.object()
        .keys({
        invalid: joi_1.default.object().keys({
            not_valid: joi_1.default.number(),
        }),
    })
        .validate({ invalid: { not_valid: 'invalid' } });
    expect((0, joi_validation_error_converter_1.default)(error)).toEqual(new validation_1.default('invalid[not_valid] must be a number'));
});
