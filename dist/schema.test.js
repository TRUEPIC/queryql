"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("./schema"));
describe('constructor', () => {
    test('defaults to no whitelisted filters', () => {
        expect(new schema_1.default().filters.size).toBe(0);
    });
    test('defaults to no whitelisted sorts', () => {
        expect(new schema_1.default().sorts.size).toBe(0);
    });
    test('defaults to pagination disabled', () => {
        expect(new schema_1.default().pageOptions.isEnabled).toBe(false);
    });
});
describe('filter', () => {
    test('whitelists one filter when one operator', () => {
        const schema = new schema_1.default();
        schema.filter('test', '=');
        expect(schema.filters.get('test[=]')).toEqual({
            name: 'test',
            operator: '=',
            options: {},
        });
    });
    test('whitelists multiple filters when an array of operators', () => {
        const schema = new schema_1.default();
        schema.filter('test', ['=', '!=']);
        expect(schema.filters.get('test[=]')).toEqual({
            name: 'test',
            operator: '=',
            options: {},
        });
        expect(schema.filters.get('test[!=]')).toEqual({
            name: 'test',
            operator: '!=',
            options: {},
        });
    });
    test('accepts an optional options object', () => {
        const schema = new schema_1.default();
        const options = { field: 'test.test' };
        schema.filter('test', '=', options);
        expect(schema.filters.get('test[=]').options).toEqual(options);
    });
    test('returns itself for chaining', () => {
        const schema = new schema_1.default();
        expect(schema.filter('test', '=')).toBe(schema);
    });
});
describe('sort', () => {
    test('whitelists a sort', () => {
        const schema = new schema_1.default();
        schema.sort('test');
        expect(schema.sorts.get('test')).toEqual({
            name: 'test',
            options: {},
        });
    });
    test('accepts an optional options object', () => {
        const schema = new schema_1.default();
        const options = { field: 'test.test' };
        schema.sort('test', options);
        expect(schema.sorts.get('test').options).toEqual(options);
    });
    test('returns itself for chaining', () => {
        const schema = new schema_1.default();
        expect(schema.sort('test')).toBe(schema);
    });
});
describe('page', () => {
    test('accepts boolean `true` to enable', () => {
        const schema = new schema_1.default();
        schema.page(true);
        expect(schema.pageOptions).toEqual({ isEnabled: true });
    });
    test('accepts boolean `false` to disable', () => {
        const schema = new schema_1.default();
        schema.page(false);
        expect(schema.pageOptions).toEqual({ isEnabled: false });
    });
    test('defaults to enable when called without arguments', () => {
        const schema = new schema_1.default();
        schema.page();
        expect(schema.pageOptions).toEqual({ isEnabled: true });
    });
    test('accepts object of options', () => {
        const schema = new schema_1.default();
        const options = {
            isEnabled: false,
            test: 123,
        };
        schema.page(options);
        expect(schema.pageOptions).toEqual(options);
    });
    test('defaults to enable when `isEnabled` not specified in options', () => {
        const schema = new schema_1.default();
        const options = { test: 123 };
        schema.page(options);
        expect(schema.pageOptions).toEqual({
            ...options,
            isEnabled: true,
        });
    });
});
describe('mapFilterNamesToOperators', () => {
    test('returns object with filter names (keys) => operators (values)', () => {
        const schema = new schema_1.default();
        schema.filter('test1', '=');
        schema.filter('test1', '!=');
        schema.filter('test2', 'in');
        expect(schema.mapFilterNamesToOperators()).toEqual({
            test1: ['=', '!='],
            test2: ['in'],
        });
    });
});
