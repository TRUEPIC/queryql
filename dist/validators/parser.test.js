"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const vitest_1 = require("vitest");
const parser_1 = __importDefault(require("./parser"));
const validation_1 = __importDefault(require("../errors/validation"));
describe('constructor', () => {
    test('accepts/calls `defineSchema` and sets the returned value', () => {
        const schema = joi_1.default.number();
        const defineSchema = vitest_1.vi.fn(() => schema);
        const validator = new parser_1.default(defineSchema, 'test', 123);
        expect(defineSchema).toHaveBeenCalledWith(joi_1.default);
        expect(validator.schema).toBe(schema);
    });
    test('accepts a query key to set', () => {
        const queryKey = 'test';
        const validator = new parser_1.default((joi) => undefined, queryKey, 123);
        expect(validator.queryKey).toBe(queryKey);
    });
    test('accepts a query to set', () => {
        const query = 123;
        const validator = new parser_1.default((joi) => undefined, 'test', query);
        expect(validator.query).toBe(query);
    });
});
describe('buildError', () => {
    test('returns a `ValidationError`', () => {
        const validator = new parser_1.default((joi) => undefined, 'test', 'invalid');
        const { error } = joi_1.default.object()
            .keys({
            invalid: joi_1.default.number(),
        })
            .validate({ invalid: 'invalid' });
        if (error) {
            expect(validator.buildError(error)).toEqual(new validation_1.default('test:invalid must be a number'));
        }
        else {
            throw new Error('Expected Joi validation error');
        }
    });
});
describe('validate', () => {
    test('returns the value if no schema is defined', () => {
        const validator = new parser_1.default((joi) => undefined, 'test', 123);
        expect(validator.schema).toBeUndefined();
        expect(validator.validate()).toBe(123);
    });
    test('returns the value if valid', () => {
        const validator = new parser_1.default((schema) => schema.number(), 'test', 123);
        expect(validator.validate()).toBe(123);
    });
    test('throws `ValidationError` if invalid', () => {
        const validator = new parser_1.default((schema) => schema.number(), 'test', 'invalid');
        expect(() => validator.validate()).toThrow(new validation_1.default('test must be a number'));
    });
});
