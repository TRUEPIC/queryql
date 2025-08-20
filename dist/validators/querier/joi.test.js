"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const vitest_1 = require("vitest");
const filter_1 = __importDefault(require("../../parsers/filter"));
const joi_2 = __importDefault(require("./joi"));
const page_1 = __importDefault(require("../../parsers/page"));
const schema_1 = __importDefault(require("../../schema"));
const sort_1 = __importDefault(require("../../parsers/sort"));
const validation_1 = __importDefault(require("../../errors/validation"));
describe('constructor', () => {
    test('accepts/calls `defineSchema(Joi)` and sets the returned value', () => {
        const defineSchema = vitest_1.vi.fn((schema) => ({
            'filter:test[=]': schema.number(),
        }));
        const validator = new joi_2.default(defineSchema);
        expect(defineSchema).toHaveBeenCalledWith(joi_1.default);
        expect(joi_1.default.isSchema(validator.schema)).toBe(true);
    });
});
describe('defineSchemaArgs', () => {
    test('returns `Joi` argument to call `defineSchema` with', () => {
        const validator = new joi_2.default(() => ({}));
        expect(validator.defineSchemaArgs).toEqual([joi_1.default]);
    });
});
describe('buildError', () => {
    test('returns a `ValidationError`', () => {
        const validator = new joi_2.default(() => ({}));
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
        const validator = new joi_2.default(() => ({}));
        expect(validator.schema).toBeUndefined();
        expect(validator.validateValue('filter:test[=]', 123)).toBe(123);
    });
    test('returns the value if no schema key is defined', () => {
        const validator = new joi_2.default((schema) => ({
            'filter:test[=]': schema.number(),
        }));
        expect(() => validator.schema.extract('filter:text[!=]')).toThrow();
        expect(validator.validateValue('filter:test[!=]', 123)).toBe(123);
    });
    test('returns the value if valid', () => {
        const validator = new joi_2.default((schema) => ({
            'filter:test[=]': schema.number(),
        }));
        expect(validator.validateValue('filter:test[=]', 123)).toBe(123);
    });
    test('throws `ValidationError` if invalid', () => {
        const validator = new joi_2.default((schema) => ({
            'filter:test[=]': schema.number(),
        }));
        expect(() => validator.validateValue('filter:test[=]', 'invalid')).toThrow(new validation_1.default('filter:test[=] must be a number'));
    });
});
describe('validateFilters', () => {
    test('returns the parsed filters if no schema is defined', () => {
        const parser = new filter_1.default('filter', { test: { '=': 123 } }, new schema_1.default().filter('test', '='));
        const validator = new joi_2.default(() => ({}));
        expect(validator.schema).toBeUndefined();
        expect(validator.validateFilters(parser.parse())).toBeInstanceOf(Map);
    });
    test('returns the parsed filters if all filters are valid', () => {
        const parser = new filter_1.default('filter', {
            test: {
                '=': 123,
                '!=': 456,
            },
        }, new schema_1.default().filter('test', '=').filter('test', '!='));
        const validator = new joi_2.default((schema) => ({
            'filter:test[=]': schema.number(),
            'filter:test[!=]': schema.number(),
        }));
        expect(validator.validateFilters(parser.parse())).toBeInstanceOf(Map);
    });
    test('throws `ValidationError` if a filter is invalid', () => {
        const parser = new filter_1.default('filter', { test: { '=': 'invalid' } }, new schema_1.default().filter('test', '='));
        const validator = new joi_2.default((schema) => ({
            'filter:test[=]': schema.number(),
        }));
        expect(() => validator.validateFilters(parser.parse())).toThrow(new validation_1.default('filter:test[=] must be a number'));
    });
});
describe('validateSorts', () => {
    test('returns the parsed sorts if no schema is defined', () => {
        const parser = new sort_1.default('sort', 'test', new schema_1.default().sort('test'));
        const validator = new joi_2.default(() => ({}));
        expect(validator.schema).toBeUndefined();
        expect(validator.validateSorts(parser.parse())).toBeInstanceOf(Map);
    });
    test('returns the parsed sorts if all sorts are valid', () => {
        const parser = new sort_1.default('sort', ['test1', 'test2'], new schema_1.default().sort('test1').sort('test2'));
        const validator = new joi_2.default((schema) => ({
            'sort:test1': schema.string().valid('asc'),
        }));
        expect(validator.validateSorts(parser.parse())).toBeInstanceOf(Map);
    });
    test('throws `ValidationError` if a sort is invalid', () => {
        const parser = new sort_1.default('sort', 'test', new schema_1.default().sort('test'));
        const validator = new joi_2.default((schema) => ({
            'sort:test': schema.string().invalid('asc'),
        }));
        expect(() => validator.validateSorts(parser.parse())).toThrow(new validation_1.default('sort:test contains an invalid value'));
    });
});
describe('validatePage', () => {
    test('returns the parsed page if no schema is defined', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const validator = new joi_2.default(() => ({}));
        expect(validator.schema).toBeUndefined();
        expect(validator.validatePage(parser.parse())).toBeInstanceOf(Map);
    });
    test('returns the parsed page if page is valid', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const validator = new joi_2.default((schema) => ({
            'page:size': schema.number().valid(20),
            'page:number': schema.number().valid(2),
        }));
        expect(validator.validatePage(parser.parse())).toBeInstanceOf(Map);
    });
    test('throws `ValidationError` if page is invalid', () => {
        const parser = new page_1.default('page', '2', new schema_1.default());
        const validator = new joi_2.default((schema) => ({
            'page:number': schema.number().invalid(2),
        }));
        expect(() => validator.validatePage(parser.parse())).toThrow(new validation_1.default('page:number contains an invalid value'));
    });
});
