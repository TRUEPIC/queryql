"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const vitest_1 = require("vitest");
const adapter_1 = __importDefault(require("./adapter"));
const filter_1 = __importDefault(require("../parsers/filter"));
const page_1 = __importDefault(require("../parsers/page"));
const schema_1 = __importDefault(require("../schema"));
const sort_1 = __importDefault(require("../parsers/sort"));
const validation_1 = __importDefault(require("../errors/validation"));
describe('constructor', () => {
    test('accepts/calls `defineSchema` and sets the returned value', () => {
        const schema = { 'filter:=': joi_1.default.string() };
        const defineSchema = vitest_1.vi.fn(() => schema);
        const validator = new adapter_1.default(defineSchema);
        expect(defineSchema).toHaveBeenCalledWith(joi_1.default);
        expect(validator.schema && joi_1.default.isSchema(validator.schema)).toBe(true);
    });
});
describe('buildError', () => {
    test('returns a `ValidationError`', () => {
        const validator = new adapter_1.default(() => undefined);
        const { error } = joi_1.default.object()
            .keys({
            invalid: joi_1.default.number(),
        })
            .validate({ invalid: 'invalid' });
        expect(validator.buildError(error)).toEqual(new validation_1.default('invalid must be a number'));
    });
});
describe('validateValue', () => {
    test('returns the value if no schema is defined', () => {
        const validator = new adapter_1.default(() => undefined);
        expect(validator.schema).toBeUndefined();
        expect(validator.validateValue('filter:=', 'filter:test[=]', 123)).toBe(123);
    });
    test('returns the value if no schema key is defined', () => {
        const validator = new adapter_1.default((schema) => ({
            'filter:=': schema.number(),
        }));
        expect(() => validator.schema && validator.schema.extract('filter:!=')).toThrow();
        expect(validator.validateValue('filter:!=', 'filter:test[!=]', 123)).toBe(123);
    });
    test('returns the value if valid', () => {
        const validator = new adapter_1.default((schema) => ({
            'filter:=': schema.number(),
        }));
        expect(validator.validateValue('filter:=', 'filter:test[=]', 123)).toBe(123);
    });
    test('throws `ValidationError` if invalid', () => {
        const validator = new adapter_1.default((schema) => ({
            'filter:=': schema.number(),
        }));
        expect(() => validator.validateValue('filter:=', 'filter:test[=]', 'invalid')).toThrow(new validation_1.default('filter:test[=] must be a number'));
    });
});
describe('validateFilters', () => {
    test('returns the parsed filters if no schema is defined', () => {
        const parser = new filter_1.default('filter', { test: { '=': 123 } }, new schema_1.default().filter('test', '='));
        const validator = new adapter_1.default(() => undefined);
        // Map Filter.operator from string | null to string
        const parsed = parser.parse();
        const mapped = new Map(Array.from(parsed.entries()).map(([key, filter]) => [
            key,
            { operator: filter.operator ?? '', value: filter.value },
        ]));
        expect(validator.schema).toBeUndefined();
        expect(validator.validateFilters(mapped)).toBeInstanceOf(Map);
    });
    test('returns the parsed filters if all filters are valid', () => {
        const parser = new filter_1.default('filter', {
            test: {
                '=': 123,
                '!=': 456,
            },
        }, new schema_1.default().filter('test', '=').filter('test', '!='));
        const validator = new adapter_1.default((schema) => ({
            'filter:=': schema.number(),
            'filter:!=': schema.number(),
        }));
        const parsed = parser.parse();
        const mapped = new Map(Array.from(parsed.entries()).map(([key, filter]) => [
            key,
            { operator: filter.operator ?? '', value: filter.value },
        ]));
        expect(validator.validateFilters(mapped)).toBeInstanceOf(Map);
    });
    test('throws `ValidationError` if a filter is invalid', () => {
        const parser = new filter_1.default('filter', { test: { '=': 'invalid' } }, new schema_1.default().filter('test', '='));
        const validator = new adapter_1.default((schema) => ({
            'filter:=': schema.number(),
        }));
        const parsed = parser.parse();
        const mapped = new Map(Array.from(parsed.entries()).map(([key, filter]) => [
            key,
            { operator: filter.operator ?? '', value: filter.value },
        ]));
        expect(() => validator.validateFilters(mapped)).toThrow(new validation_1.default('filter:test[=] must be a number'));
    });
});
describe('validateSorts', () => {
    test('returns the parsed sorts if no schema is defined', () => {
        const parser = new sort_1.default('sort', 'test', new schema_1.default().sort('test'));
        const validator = new adapter_1.default(() => undefined);
        expect(validator.schema).toBeUndefined();
        expect(validator.validateSorts(parser.parse())).toBeInstanceOf(Map);
    });
    test('returns the parsed sorts if all sorts are valid', () => {
        const parser = new sort_1.default('sort', ['test1', 'test2'], new schema_1.default().sort('test1').sort('test2'));
        const validator = new adapter_1.default((schema) => ({
            sort: schema.string().valid('asc'),
        }));
        expect(validator.validateSorts(parser.parse())).toBeInstanceOf(Map);
    });
    test('throws `ValidationError` if a sort is invalid', () => {
        const parser = new sort_1.default('sort', 'test', new schema_1.default().sort('test'));
        const validator = new adapter_1.default((schema) => ({
            sort: schema.string().invalid('asc'),
        }));
        expect(() => validator.validateSorts(parser.parse())).toThrow(new validation_1.default('sort:test contains an invalid value'));
    });
});
describe('validatePage', () => {
    test('returns the parsed page if no schema is defined', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const validator = new adapter_1.default(() => undefined);
        expect(validator.schema).toBeUndefined();
        expect(validator.validatePage(parser.parse())).toBeInstanceOf(Map);
    });
    test('returns the parsed page if page is valid', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const validator = new adapter_1.default((schema) => ({
            'page:size': schema.number().valid(20),
            'page:number': schema.number().valid(2),
        }));
        expect(validator.validatePage(parser.parse())).toBeInstanceOf(Map);
    });
    test('throws `ValidationError` if page is invalid', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const validator = new adapter_1.default((schema) => ({
            'page:number': schema.number().invalid(2),
        }));
        expect(() => validator.validatePage(parser.parse())).toThrow(new validation_1.default('page:number contains an invalid value'));
    });
});
