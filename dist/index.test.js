"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const knex = (0, knex_1.default)({ client: 'pg' });
const config_1 = __importDefault(require("./config"));
const empty_1 = __importDefault(require("../test/queriers/empty"));
const not_implemented_1 = __importDefault(require("./errors/not_implemented"));
const _1 = __importDefault(require("."));
const test_1 = __importDefault(require("../test/queriers/test"));
const validation_1 = __importDefault(require("./errors/validation"));
describe('constructor', () => {
    test('accepts a query to set', () => {
        const query = { page: 2 };
        const querier = new test_1.default(query, knex('test'));
        expect(querier.query).toEqual(query);
    });
    test('accepts a builder to set', () => {
        const builder = knex('test');
        const querier = new test_1.default({}, builder);
        expect(querier.builder).toBe(builder);
    });
    test('accepts an optional config to set', () => {
        const config = { test: 123 };
        const querier = new test_1.default({}, knex('test'), config);
        expect(querier.config.get()).toMatchObject(config);
    });
    test('calls `defineSchema` with a schema instance', () => {
        const defineSchema = jest.spyOn(test_1.default.prototype, 'defineSchema');
        const querier = new test_1.default({}, knex('test'));
        expect(defineSchema).toHaveBeenCalledWith(querier.schema);
        defineSchema.mockRestore();
    });
    test('creates an instance of the configured adapter', () => {
        const adapter = jest.fn();
        new test_1.default({}, knex('test'), { adapter });
        expect(adapter.mock.instances).toHaveLength(1);
    });
    test('creates an instance of the configured validator', () => {
        const validator = jest.fn();
        new test_1.default({}, knex('test'), { validator });
        expect(validator.mock.instances).toHaveLength(1);
    });
});
describe('defineSchema', () => {
    test('throws `NotImplementedError` when not extended', () => {
        expect(() => new _1.default({}, knex('test'))).toThrow(not_implemented_1.default);
    });
});
describe('defineValidation', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.defineValidation()).toBeUndefined();
    });
});
describe('defaultFilter', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.defaultFilter).toBeUndefined();
    });
});
describe('defaultSort', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.defaultSort).toBeUndefined();
    });
});
describe('defaultPage', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.defaultPage).toBeUndefined();
    });
});
describe('filterDefaults', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.filterDefaults).toBeUndefined();
    });
});
describe('sortDefaults', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.sortDefaults).toBeUndefined();
    });
});
describe('pageDefaults', () => {
    test('is not defined by default', () => {
        const querier = new empty_1.default({}, knex('test'));
        expect(querier.pageDefaults).toBeUndefined();
    });
});
describe('validate', () => {
    test('returns `true` if valid', () => {
        const querier = new test_1.default({
            filter: { test: 123 },
            sort: 'test',
            page: 2,
        }, knex('test'));
        expect(querier.validate()).toBe(true);
    });
    test('throws `ValidationError` if a filter is invalid', () => {
        const querier = new test_1.default({ filter: { invalid: 123 } }, knex('test'));
        expect(() => querier.validate()).toThrow(new validation_1.default('filter:invalid is not allowed'));
    });
    test('throws `ValidationError` if a sort is invalid', () => {
        const querier = new test_1.default({ sort: { test: 'invalid' } }, knex('test'));
        expect(() => querier.validate()).toThrow(new validation_1.default('sort:test must be one of [asc, desc]'));
    });
    test('throws `ValidationError` if pagination is invalid', () => {
        const querier = new test_1.default({ page: 'invalid' }, knex('test'));
        expect(() => querier.validate()).toThrow(new validation_1.default('page must be one of [number, object]'));
    });
});
describe('run', () => {
    test('returns the builder with filters, sorts, pagination applied', () => {
        const querier = new test_1.default({
            filter: { test: 123 },
            sort: 'test',
            page: 2,
        }, knex('test'));
        expect(querier.run().toString()).toBe('select * ' +
            'from "test" ' +
            'where "test" = 123 ' +
            'order by "test" asc ' +
            'limit 20 offset 20');
    });
    test('throws `ValidationError` if invalid', () => {
        const querier = new test_1.default({ filter: { invalid: 123 } }, knex('test'));
        expect(() => querier.run()).toThrow(new validation_1.default('filter:invalid is not allowed'));
    });
});
describe('exports', () => {
    test('the QueryQL class', () => {
        expect(_1.default.name).toBe('QueryQL');
    });
    test('an object of adapter classes', () => {
        expect(_1.default.adapters).toHaveProperty('BaseAdapter');
    });
    test('the Config class', () => {
        expect(_1.default.Config).toBe(config_1.default);
    });
    test('an object of error classes', () => {
        expect(_1.default.errors).toHaveProperty('BaseError');
    });
    test('an object of validator classes', () => {
        expect(_1.default.validators).toHaveProperty('BaseValidator');
    });
});
