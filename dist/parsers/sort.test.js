"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sort_1 = __importDefault(require("./sort"));
const schema_1 = __importDefault(require("../schema"));
const validation_1 = __importDefault(require("../errors/validation"));
describe('DEFAULTS', () => {
    test('returns `null` as the default name', () => {
        expect(sort_1.default.DEFAULTS.name).toBeNull();
    });
    test('returns `null` as the default field', () => {
        expect(sort_1.default.DEFAULTS.field).toBeNull();
    });
    test('returns `asc` as the default order', () => {
        expect(sort_1.default.DEFAULTS.order).toBe('asc');
    });
});
describe('buildKey', () => {
    test('builds/returns a string to use as a key', () => {
        const parser = new sort_1.default('sort', {}, new schema_1.default());
        const key = parser.buildKey({ name: 'test' });
        expect(key).toBe('sort:test');
    });
});
describe('validation', () => {
    test('throws if no sorts are whitelisted in the schema', () => {
        const parser = new sort_1.default('sort', 'invalid', new schema_1.default());
        expect(() => parser.validate()).toThrow(new validation_1.default('sort is not allowed'));
    });
    describe('`sort=name`', () => {
        test('throws if the sort is not whitelisted in the schema', () => {
            const parser = new sort_1.default('sort', 'invalid', new schema_1.default().sort('valid'));
            expect(() => parser.validate()).toThrow(new validation_1.default('sort must be one of [valid, array, object]'));
        });
    });
    describe('`sort[]=name`', () => {
        test('throws if the sort is not whitelisted in the schema', () => {
            const parser = new sort_1.default('sort', ['invalid'], new schema_1.default().sort('valid'));
            expect(() => parser.validate()).toThrow(new validation_1.default('sort:0 must be [valid]'));
        });
        test('throws if the sort appears more than once', () => {
            const parser = new sort_1.default('sort', ['invalid', 'invalid'], new schema_1.default().sort('invalid'));
            expect(() => parser.validate()).toThrow(new validation_1.default('sort:1 contains a duplicate value'));
        });
    });
    describe('`sort[name]=order`', () => {
        test('throws if the sort is not whitelisted in the schema', () => {
            const parser = new sort_1.default('sort', { invalid: 'asc' }, new schema_1.default().sort('valid'));
            expect(() => parser.validate()).toThrow(new validation_1.default('sort:invalid is not allowed'));
        });
        test('throws if the order is not `asc` or `desc`', () => {
            const parser = new sort_1.default('sort', { invalid: 'test' }, new schema_1.default().sort('invalid'));
            expect(() => parser.validate()).toThrow(new validation_1.default('sort:invalid must be one of [asc, desc]'));
        });
        test('permits case-insensitive `asc` or `desc` order', () => {
            const parser = new sort_1.default('sort', { valid: 'ASC' }, new schema_1.default().sort('valid'));
            expect(() => parser.validate()).not.toThrow();
        });
    });
});
describe('flatten', () => {
    test('flattens/returns parsed map into object with keys => values', () => {
        const parser = new sort_1.default('sort', { test: 'asc' }, new schema_1.default().sort('test'));
        expect(parser.flatten(parser.parse())).toEqual({
            'sort:test': 'asc',
        });
    });
});
describe('parse', () => {
    test('`sort=name`', () => {
        const parser = new sort_1.default('sort', 'test', new schema_1.default().sort('test'));
        expect(parser.parse().get('sort:test')).toEqual({
            name: 'test',
            field: 'test',
            order: 'asc',
        });
    });
    test('`sort=name` with `field` option', () => {
        const parser = new sort_1.default('sort', 'test', new schema_1.default().sort('test', { field: 'testing' }));
        expect(parser.parse().get('sort:test')).toEqual({
            name: 'test',
            field: 'testing',
            order: 'asc',
        });
    });
    test('`sort[]=name` with one name', () => {
        const parser = new sort_1.default('sort', ['test'], new schema_1.default().sort('test'));
        expect(parser.parse().get('sort:test')).toEqual({
            name: 'test',
            field: 'test',
            order: 'asc',
        });
    });
    test('`sort[]=name` with `field` option', () => {
        const parser = new sort_1.default('sort', ['test'], new schema_1.default().sort('test', { field: 'testing' }));
        expect(parser.parse().get('sort:test')).toEqual({
            name: 'test',
            field: 'testing',
            order: 'asc',
        });
    });
    test('`sort[]=name` with multiple names', () => {
        const parser = new sort_1.default('sort', ['test1', 'test2'], new schema_1.default().sort('test1').sort('test2'));
        const parsed = parser.parse();
        expect(parsed.get('sort:test1')).toEqual({
            name: 'test1',
            field: 'test1',
            order: 'asc',
        });
        expect(parsed.get('sort:test2')).toEqual({
            name: 'test2',
            field: 'test2',
            order: 'asc',
        });
    });
    test('`sort[name]=order` with one name', () => {
        const parser = new sort_1.default('sort', { test: 'desc' }, new schema_1.default().sort('test'));
        expect(parser.parse().get('sort:test')).toEqual({
            name: 'test',
            field: 'test',
            order: 'desc',
        });
    });
    test('`sort[name]=order` with `field` option', () => {
        const parser = new sort_1.default('sort', { test: 'desc' }, new schema_1.default().sort('test', { field: 'testing' }));
        expect(parser.parse().get('sort:test')).toEqual({
            name: 'test',
            field: 'testing',
            order: 'desc',
        });
    });
    test('`sort[name]=order` with multiple names', () => {
        const parser = new sort_1.default('sort', {
            test1: 'desc',
            test2: 'asc',
        }, new schema_1.default().sort('test1').sort('test2'));
        const parsed = parser.parse();
        expect(parsed.get('sort:test1')).toEqual({
            name: 'test1',
            field: 'test1',
            order: 'desc',
        });
        expect(parsed.get('sort:test2')).toEqual({
            name: 'test2',
            field: 'test2',
            order: 'asc',
        });
    });
    test('returns an empty `Map` if no query', () => {
        const parser = new sort_1.default('sort', undefined, new schema_1.default());
        expect(parser.parse().size).toBe(0);
    });
    test('throws `ValidationError` if invalid', () => {
        const parser = new sort_1.default('sort', 'invalid', new schema_1.default().sort('valid'));
        expect(() => parser.parse()).toThrow(new validation_1.default('sort must be one of [valid, array, object]'));
    });
});
