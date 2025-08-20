"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const not_implemented_1 = __importDefault(require("../errors/not_implemented"));
const schema_1 = __importDefault(require("../schema"));
const validation_1 = __importDefault(require("../errors/validation"));
const vitest_1 = require("vitest");
describe('constructor', () => {
    test('accepts a query key to set', () => {
        const queryKey = 'test';
        const parser = new base_1.default(queryKey, {}, new schema_1.default());
        expect(parser.queryKey).toBe(queryKey);
    });
    test('accepts a query to set', () => {
        const query = { test: 123 };
        const parser = new base_1.default('test', query, new schema_1.default());
        expect(parser.query).toEqual(query);
    });
    test('accepts a schema to set', () => {
        const schema = new schema_1.default();
        const parser = new base_1.default('test', {}, schema);
        expect(parser.schema).toBe(schema);
    });
    test('accepts an optional defaults object to set', () => {
        const defaults = { operator: '=' };
        const parser = new base_1.default('test', {}, new schema_1.default(), defaults);
        expect(parser.defaults).toMatchObject(defaults);
    });
});
describe('buildKey', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const parser = new base_1.default('test', {}, new schema_1.default());
        expect(() => parser.buildKey()).toThrow(not_implemented_1.default);
    });
});
describe('flatten', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const parser = new base_1.default('test', {}, new schema_1.default());
        expect(() => parser.flatten()).toThrow(not_implemented_1.default);
    });
});
describe('parse', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const parser = new base_1.default('test', {}, new schema_1.default());
        expect(() => parser.parse()).toThrow(not_implemented_1.default);
    });
});
describe('defineValidation', () => {
    test('is not defined by default', () => {
        const parser = new base_1.default('test', {}, new schema_1.default());
        expect(parser.defineValidation()).toBeUndefined();
    });
});
describe('DEFAULTS', () => {
    test('returns an object of values to merge with instance defaults', () => {
        expect(base_1.default.DEFAULTS).toBeInstanceOf(Object);
    });
});
describe('defaults', () => {
    describe('set', () => {
        test('accepts an object with new values', () => {
            const parser = new base_1.default('test', {}, new schema_1.default());
            const defaults = { test: 456 };
            parser.defaults = defaults;
            expect(parser.defaults).toMatchObject(defaults);
        });
    });
    describe('get', () => {
        test('returns an object of all values', () => {
            const parser = new base_1.default('test', {}, new schema_1.default());
            const defaults = { test: 789 };
            parser.defaults = defaults;
            expect(parser.defaults).toMatchObject(defaults);
        });
    });
});
describe('validate', () => {
    test('returns the validated query if valid', () => {
        const defineValidation = vitest_1.vi
            .spyOn(base_1.default.prototype, 'defineValidation')
            .mockImplementation((schema) => schema.object().keys({
            test: schema.number(),
        }));
        const parser = new base_1.default('test', { test: 123 }, new schema_1.default());
        expect(parser.validate()).toEqual({ test: 123 });
        defineValidation.mockRestore();
    });
    test('returns the cached validated query on subsequent calls', () => {
        const defineValidation = vitest_1.vi
            .spyOn(base_1.default.prototype, 'defineValidation')
            .mockImplementation((schema) => schema.object().keys({
            test: schema.number(),
        }));
        const parser = new base_1.default('test', { test: 123 }, new schema_1.default());
        const validate = vitest_1.vi.spyOn(parser.validator, 'validate');
        expect(parser.validate()).toEqual({ test: 123 });
        expect(parser.validate()).toEqual({ test: 123 });
        expect(validate).toHaveBeenCalledTimes(1);
        defineValidation.mockRestore();
    });
    test('throws `ValidationError` if invalid', () => {
        const defineValidation = vitest_1.vi
            .spyOn(base_1.default.prototype, 'defineValidation')
            .mockImplementation((schema) => schema.object().keys({
            invalid: schema.number(),
        }));
        const parser = new base_1.default('test', { invalid: 'invalid' }, new schema_1.default());
        expect(() => parser.validate()).toThrow(new validation_1.default('test:invalid must be a number'));
        defineValidation.mockRestore();
    });
});
