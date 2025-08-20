"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = __importDefault(require("./filter"));
const schema_1 = __importDefault(require("../schema"));
const validation_1 = __importDefault(require("../errors/validation"));
describe('DEFAULTS', () => {
    test('returns `null` as the default name', () => {
        expect(filter_1.default.DEFAULTS.name).toBeNull();
    });
    test('returns `null` as the default field', () => {
        expect(filter_1.default.DEFAULTS.field).toBeNull();
    });
    test('returns `null` as the default operator', () => {
        expect(filter_1.default.DEFAULTS.operator).toBeNull();
    });
    test('returns `null` as the default value', () => {
        expect(filter_1.default.DEFAULTS.value).toBeNull();
    });
});
describe('buildKey', () => {
    test('builds/returns a string to use as a key', () => {
        const parser = new filter_1.default('filter', {}, new schema_1.default());
        const key = parser.buildKey({
            name: 'test',
            operator: '=',
        });
        expect(key).toBe('filter:test[=]');
    });
});
describe('validation', () => {
    test('throws if the filter is not whitelisted in the schema', () => {
        const parser = new filter_1.default('filter', { invalid: 123 }, new schema_1.default());
        expect(() => parser.validate()).toThrow(new validation_1.default('filter:invalid is not allowed'));
    });
    test('throws if the operator is not whitelisted in the schema', () => {
        const parser = new filter_1.default('filter', { invalid: { '!=': 123 } }, new schema_1.default().filter('invalid', '='));
        expect(() => parser.validate()).toThrow(new validation_1.default('filter:invalid[!=] is not allowed'));
    });
    test('throws if no operator or default operator is specified', () => {
        const parser = new filter_1.default('filter', { invalid: 123 }, new schema_1.default().filter('invalid', '='));
        expect(() => parser.validate()).toThrow(new validation_1.default('filter:invalid must be of type object'));
    });
    test('permits an array value', () => {
        const parser = new filter_1.default('filter', { valid: { in: [1, 2, 3] } }, new schema_1.default().filter('valid', 'in'));
        expect(() => parser.validate()).not.toThrow();
    });
    test('permits a boolean value', () => {
        const parser = new filter_1.default('filter', { valid: { '=': true } }, new schema_1.default().filter('valid', '='));
        expect(() => parser.validate()).not.toThrow();
    });
    test('permits a number value', () => {
        const parser = new filter_1.default('filter', { valid: { '=': 123 } }, new schema_1.default().filter('valid', '='));
        expect(() => parser.validate()).not.toThrow();
    });
    test('permits an object value if an operator is specified', () => {
        const parser = new filter_1.default('filter', { valid: { '=': { test: 123 } } }, new schema_1.default().filter('valid', '='));
        expect(() => parser.validate()).not.toThrow();
    });
    test('throws for an object value if no operator is specified', () => {
        const parser = new filter_1.default('filter', { invalid: { test: 123 } }, new schema_1.default().filter('invalid', '='));
        expect(() => parser.validate()).toThrow(new validation_1.default('filter:invalid[test] is not allowed'));
    });
    test('permits a string value', () => {
        const parser = new filter_1.default('filter', { valid: { '=': 'string' } }, new schema_1.default().filter('valid', '='));
        expect(() => parser.validate()).not.toThrow();
    });
    test('permits a null value', () => {
        const parser = new filter_1.default('filter', { valid: { '=': null } }, new schema_1.default().filter('valid', '='));
        expect(() => parser.validate()).not.toThrow();
    });
    test('throws for a non-permitted value', () => {
        const parser = new filter_1.default('filter', { invalid: { '=': Date } }, new schema_1.default().filter('invalid', '='));
        expect(() => parser.validate()).toThrow(new validation_1.default('filter:invalid[=] must be one of [object, array, string, number, boolean, null]'));
    });
});
describe('flatten', () => {
    test('flattens/returns parsed map into object with keys => values', () => {
        const parser = new filter_1.default('filter', { test: { '=': 123 } }, new schema_1.default().filter('test', '='));
        expect(parser.flatten(parser.parse())).toEqual({
            'filter:test[=]': 123,
        });
    });
});
describe('parse', () => {
    test('`filter[name]=value` with a default operator', () => {
        const parser = new filter_1.default('filter', { test: 123 }, new schema_1.default().filter('test', '='), { operator: '=' });
        expect(parser.parse().get('filter:test[=]')).toEqual({
            name: 'test',
            field: 'test',
            operator: '=',
            value: 123,
        });
    });
    test('`filter[name]=value` with `field` option', () => {
        const parser = new filter_1.default('filter', { test: 123 }, new schema_1.default().filter('test', '=', { field: 'testing' }), { operator: '=' });
        expect(parser.parse().get('filter:test[=]')).toEqual({
            name: 'test',
            field: 'testing',
            operator: '=',
            value: 123,
        });
    });
    test('`filter[name][operator]=value` with one operator', () => {
        const parser = new filter_1.default('filter', { test: { '!=': 456 } }, new schema_1.default().filter('test', '!='));
        expect(parser.parse().get('filter:test[!=]')).toEqual({
            name: 'test',
            field: 'test',
            operator: '!=',
            value: 456,
        });
    });
    test('`filter[name][operator]=value` with `field` option', () => {
        const parser = new filter_1.default('filter', { test: { '!=': 456 } }, new schema_1.default().filter('test', '!=', { field: 'testing' }));
        expect(parser.parse().get('filter:test[!=]')).toEqual({
            name: 'test',
            field: 'testing',
            operator: '!=',
            value: 456,
        });
    });
    test('`filter[name][operator]=value` with multiple operators', () => {
        const parser = new filter_1.default('filter', {
            test: {
                '=': 123,
                '!=': 456,
            },
        }, new schema_1.default().filter('test', '=').filter('test', '!='));
        expect(parser.parse().get('filter:test[=]')).toEqual({
            name: 'test',
            field: 'test',
            operator: '=',
            value: 123,
        });
        expect(parser.parse().get('filter:test[!=]')).toEqual({
            name: 'test',
            field: 'test',
            operator: '!=',
            value: 456,
        });
    });
    test('`filter[name][operator]=value` with multiple names', () => {
        const parser = new filter_1.default('filter', {
            test1: { '=': 123 },
            test2: { '!=': 456 },
        }, new schema_1.default().filter('test1', '=').filter('test2', '!='));
        expect(parser.parse().get('filter:test1[=]')).toEqual({
            name: 'test1',
            field: 'test1',
            operator: '=',
            value: 123,
        });
        expect(parser.parse().get('filter:test2[!=]')).toEqual({
            name: 'test2',
            field: 'test2',
            operator: '!=',
            value: 456,
        });
    });
    test('returns an empty `Map` if no query', () => {
        const parser = new filter_1.default('filter', undefined, new schema_1.default());
        expect(parser.parse().size).toBe(0);
    });
    test('throws `ValidationError` if invalid', () => {
        const parser = new filter_1.default('filter', { invalid: 123 }, new schema_1.default());
        expect(() => parser.parse()).toThrow(new validation_1.default('filter:invalid is not allowed'));
    });
});
