"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const knex = (0, knex_1.default)({ client: 'pg' });
const empty_1 = __importDefault(require("../test/queriers/empty"));
const filterer_1 = __importDefault(require("./filterer"));
const vitest_1 = require("vitest");
const test_1 = __importDefault(require("../test/queriers/test"));
const validation_1 = __importDefault(require("../errors/validation"));
describe('queryKey', () => {
    test('returns the key for filters in the query', () => {
        const filterer = new filterer_1.default(new test_1.default({}, knex('test')));
        expect(filterer.queryKey).toBe('filter');
    });
});
describe('schema', () => {
    test('returns the schema for filters', () => {
        const filterer = new filterer_1.default(new test_1.default({}, knex('test')));
        expect(filterer.schema.has('test[=]')).toBe(true);
    });
});
describe('isEnabled', () => {
    test('returns `true` if >= 1 filter is whitelisted in the schema', () => {
        const filterer = new filterer_1.default(new test_1.default({}, knex('test')));
        expect(filterer.isEnabled).toBe(true);
    });
    test('returns `false` if no filter is whitelisted in the schema', () => {
        const filterer = new filterer_1.default(new empty_1.default({}, knex('test')));
        expect(filterer.isEnabled).toBe(false);
    });
});
describe('parse', () => {
    test('parses/returns the filters from the query', () => {
        const filterer = new filterer_1.default(new test_1.default({
            filter: { test: 123 },
        }, knex('test')));
        expect(filterer.parse().has('filter:test[=]')).toBe(true);
    });
    test('calls/uses `querier.defaultFilter` if no query', () => {
        const querier = new test_1.default({}, knex('test'));
        const defaultFilter = vitest_1.vi
            .spyOn(querier, 'defaultFilter', 'get')
            .mockReturnValue({ test: 123 });
        const filterer = new filterer_1.default(querier);
        const parsed = filterer.parse();
        expect(filterer.query).toBeFalsy();
        expect(defaultFilter).toHaveBeenCalled();
        expect(parsed.has('filter:test[=]')).toBe(true);
        defaultFilter.mockRestore();
    });
});
describe('validate', () => {
    test('returns `true` if valid', () => {
        const filterer = new filterer_1.default(new test_1.default({ filter: { test: 123 } }, knex('test')));
        expect(filterer.validate()).toBe(true);
    });
    test('returns `true` if disabled', () => {
        const filterer = new filterer_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false);
        expect(filterer.validate()).toBe(true);
    });
    test('throws `ValidationError` if invalid', () => {
        const filterer = new filterer_1.default(new test_1.default({ filter: { invalid: 123 } }, knex('test')));
        expect(() => filterer.validate()).toThrow(new validation_1.default('filter:invalid is not allowed'));
    });
});
describe('run', () => {
    test('applies each filter in order of schema', () => {
        const filterer = new filterer_1.default(new test_1.default({
            filter: {
                testing: { '!=': 456 },
                test: 123,
            },
        }, knex('test')));
        filterer.apply = vitest_1.vi.fn();
        filterer.run();
        expect(filterer.apply).toHaveBeenNthCalledWith(1, {
            name: 'test',
            field: 'test',
            operator: '=',
            value: 123,
        }, 'filter:test[=]');
        expect(filterer.apply).toHaveBeenNthCalledWith(2, {
            name: 'testing',
            field: 'testing',
            operator: '!=',
            value: 456,
        }, 'filter:testing[!=]');
    });
    test('does not apply filtering if disabled', () => {
        const filterer = new filterer_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false);
        filterer.apply = vitest_1.vi.fn();
        filterer.run();
        expect(filterer.apply).not.toHaveBeenCalled();
    });
    test('returns the querier', () => {
        const querier = new test_1.default({}, knex('test'));
        const filterer = new filterer_1.default(querier);
        expect(filterer.run()).toBe(querier);
    });
    test('throws `ValidationError` if invalid', () => {
        const filterer = new filterer_1.default(new test_1.default({ filter: { invalid: 123 } }, knex('test')));
        expect(() => filterer.run()).toThrow(new validation_1.default('filter:invalid is not allowed'));
    });
});
