"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const vitest_1 = require("vitest");
const not_implemented_1 = __importDefault(require("../../errors/not_implemented"));
const validation_1 = __importDefault(require("../../errors/validation"));
describe('constructor', () => {
    test('accepts/calls `defineSchema` and sets the returned value', () => {
        const defineSchema = vitest_1.vi.fn(() => 'test');
        const validator = new base_1.default(defineSchema);
        expect(defineSchema).toHaveBeenCalled();
        expect(validator.schema).toBe('test');
    });
});
describe('validateFilters', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const validator = new base_1.default(() => { });
        expect(() => validator.validateFilters()).toThrow(not_implemented_1.default);
    });
});
describe('validateSorts', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const validator = new base_1.default(() => { });
        expect(() => validator.validateSorts()).toThrow(not_implemented_1.default);
    });
});
describe('validatePage', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const validator = new base_1.default(() => { });
        expect(() => validator.validatePage()).toThrow(not_implemented_1.default);
    });
});
describe('defineSchemaArgs', () => {
    test('returns no arguments to call `defineSchema` with', () => {
        const validator = new base_1.default(() => { });
        expect(validator.defineSchemaArgs).toEqual([]);
    });
});
describe('buildError', () => {
    test('returns a `ValidationError` with the specified message', () => {
        const validator = new base_1.default(() => { });
        expect(validator.buildError('test')).toEqual(new validation_1.default('test'));
    });
});
