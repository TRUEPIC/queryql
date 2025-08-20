"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const page_1 = __importDefault(require("./page"));
const schema_1 = __importDefault(require("../schema"));
const validation_1 = __importDefault(require("../errors/validation"));
describe('DEFAULTS', () => {
    test('returns `20` as the default size', () => {
        expect(page_1.default.DEFAULTS.size).toBe(20);
    });
    test('returns `1` as the default number', () => {
        expect(page_1.default.DEFAULTS.number).toBe(1);
    });
});
describe('buildKey', () => {
    test('builds/returns a string to use as a key', () => {
        const parser = new page_1.default('page', {}, new schema_1.default());
        const key = parser.buildKey({
            field: 'size',
        });
        expect(key).toBe('page:size');
    });
    test('builds/returns a key without the query key, if specified', () => {
        const parser = new page_1.default('page', {}, new schema_1.default());
        const key = parser.buildKey({
            field: 'size',
        }, false);
        expect(key).toBe('size');
    });
});
describe('validation', () => {
    describe('`page=number`', () => {
        test('throws if the number is not an integer', () => {
            const parser = new page_1.default('page', '1.1', new schema_1.default());
            expect(() => parser.validate()).toThrow(new validation_1.default('page must be an integer'));
        });
        test('throws if the number is not positive', () => {
            const parser = new page_1.default('page', '-1', new schema_1.default());
            expect(() => parser.validate()).toThrow(new validation_1.default('page must be a positive number'));
        });
    });
    describe('`page[number]=value`', () => {
        test('throws if the number is not an integer', () => {
            const parser = new page_1.default('page', { number: '1.1' }, new schema_1.default());
            expect(() => parser.validate()).toThrow(new validation_1.default('page:number must be an integer'));
        });
        test('throws if the number is not positive', () => {
            const parser = new page_1.default('page', { number: '-1' }, new schema_1.default());
            expect(() => parser.validate()).toThrow(new validation_1.default('page:number must be a positive number'));
        });
    });
    describe('`page[size]=value`', () => {
        test('throws if the number is not an integer', () => {
            const parser = new page_1.default('page', { size: 1.1 }, new schema_1.default());
            expect(() => parser.validate()).toThrow(new validation_1.default('page:size must be an integer'));
        });
        test('throws if the number is not positive', () => {
            const parser = new page_1.default('page', { size: -1 }, new schema_1.default());
            expect(() => parser.validate()).toThrow(new validation_1.default('page:size must be a positive number'));
        });
    });
});
describe('flatten', () => {
    test('flattens/returns parsed map into object with keys => values', () => {
        const parser = new page_1.default('page', 2, new schema_1.default());
        expect(parser.flatten(parser.parse())).toEqual({
            'page:size': 20,
            'page:number': 2,
            'page:offset': 20,
        });
    });
    test('optionally excludes the query key from the key', () => {
        const parser = new page_1.default('page', 2, new schema_1.default());
        expect(parser.flatten(parser.parse(), false)).toEqual({
            size: 20,
            number: 2,
            offset: 20,
        });
    });
});
describe('parse', () => {
    test('`page=number` with a string number', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const parsed = parser.parse();
        expect(parsed.get('page:size')).toEqual({
            field: 'size',
            value: 20,
        });
        expect(parsed.get('page:number')).toEqual({
            field: 'number',
            value: 2,
        });
        expect(parsed.get('page:offset')).toEqual({
            field: 'offset',
            value: 20,
        });
    });
    test('`page=number` with a number number', () => {
        const parser = new page_1.default('page', 2, new schema_1.default());
        const parsed = parser.parse();
        expect(parsed.get('page:size')).toEqual({
            field: 'size',
            value: 20,
        });
        expect(parsed.get('page:number')).toEqual({
            field: 'number',
            value: 2,
        });
        expect(parsed.get('page:offset')).toEqual({
            field: 'offset',
            value: 20,
        });
    });
    test('`page[number]=value`', () => {
        const parser = new page_1.default('page', { number: 2 }, new schema_1.default());
        const parsed = parser.parse();
        expect(parsed.get('page:size')).toEqual({
            field: 'size',
            value: 20,
        });
        expect(parsed.get('page:number')).toEqual({
            field: 'number',
            value: 2,
        });
        expect(parsed.get('page:offset')).toEqual({
            field: 'offset',
            value: 20,
        });
    });
    test('`page[size]=value`', () => {
        const parser = new page_1.default('page', { size: 10 }, new schema_1.default());
        const parsed = parser.parse();
        expect(parsed.get('page:size')).toEqual({
            field: 'size',
            value: 10,
        });
        expect(parsed.get('page:number')).toEqual({
            field: 'number',
            value: 1,
        });
        expect(parsed.get('page:offset')).toEqual({
            field: 'offset',
            value: 0,
        });
    });
    test('`page[number]=value&page[size]=value`', () => {
        const parser = new page_1.default('page', { number: 2, size: 10 }, new schema_1.default().page());
        const parsed = parser.parse();
        expect(parsed.get('page:size')).toEqual({
            field: 'size',
            value: 10,
        });
        expect(parsed.get('page:number')).toEqual({
            field: 'number',
            value: 2,
        });
        expect(parsed.get('page:offset')).toEqual({
            field: 'offset',
            value: 10,
        });
    });
    test('uses the defaults if no query', () => {
        const parser = new page_1.default('page', undefined, new schema_1.default());
        const parsed = parser.parse();
        expect(parsed.get('page:size')).toEqual({
            field: 'size',
            value: page_1.default.DEFAULTS.size,
        });
        expect(parsed.get('page:number')).toEqual({
            field: 'number',
            value: page_1.default.DEFAULTS.number,
        });
        expect(parsed.get('page:offset')).toEqual({
            field: 'offset',
            value: 0,
        });
    });
    test('throws `ValidationError` if invalid', () => {
        const parser = new page_1.default('page', 'invalid', new schema_1.default());
        expect(() => parser.parse()).toThrow(new validation_1.default('page must be one of [number, object]'));
    });
});
