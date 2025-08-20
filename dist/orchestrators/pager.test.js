"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const knex = (0, knex_1.default)({ client: 'pg' });
const test_1 = __importDefault(require("../test/queriers/test"));
const empty_1 = __importDefault(require("../test/queriers/empty"));
const pager_1 = __importDefault(require("./pager"));
const validation_1 = __importDefault(require("../errors/validation"));
const vitest_1 = require("vitest");
describe('queryKey', () => {
    test('returns the key for pagination in the query', () => {
        const pager = new pager_1.default(new test_1.default({}, knex('test')));
        expect(pager.queryKey).toBe('page');
    });
});
describe('schema', () => {
    test('returns the schema for pagination', () => {
        const pager = new pager_1.default(new test_1.default({}, knex('test')));
        expect(pager.schema.isEnabled).toBe(true);
    });
});
describe('isEnabled', () => {
    test('returns `true` if pagination is enabled in the schema', () => {
        const pager = new pager_1.default(new test_1.default({}, knex('test')));
        expect(pager.isEnabled).toBe(true);
    });
    test('returns `false` if pagination is disabled in the schema', () => {
        const pager = new pager_1.default(new empty_1.default({}, knex('test')));
        expect(pager.isEnabled).toBe(false);
    });
});
describe('parse', () => {
    test('parses/returns the pagination from the query', () => {
        const pager = new pager_1.default(new test_1.default({
            page: 2,
        }, knex('test')));
        expect(pager.parse().get('page:number').value).toBe(2);
    });
    test('calls/uses `querier.defaultPage` if no query', () => {
        const querier = new test_1.default({}, knex('test'));
        const defaultPage = vitest_1.vi
            .spyOn(querier, 'defaultPage', 'get')
            .mockReturnValue(2);
        const pager = new pager_1.default(querier);
        const parsed = pager.parse();
        expect(pager.query).toBeFalsy();
        expect(defaultPage).toHaveBeenCalled();
        expect(parsed.get('page:number').value).toBe(2);
        defaultPage.mockRestore();
    });
});
describe('validate', () => {
    test('returns `true` if valid', () => {
        const pager = new pager_1.default(new test_1.default({ page: 2 }, knex('test')));
        expect(pager.validate()).toBe(true);
    });
    test('returns `true` if disabled', () => {
        const pager = new pager_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false);
        expect(pager.validate()).toBe(true);
    });
    test('throws `ValidationError` if invalid', () => {
        const pager = new pager_1.default(new test_1.default({ page: 'invalid' }, knex('test')));
        expect(() => pager.validate()).toThrow(new validation_1.default('page must be one of [number, object]'));
    });
});
describe('run', () => {
    test('applies pagination', () => {
        const pager = new pager_1.default(new test_1.default({
            page: 2,
        }, knex('test')));
        pager.apply = vitest_1.vi.fn();
        pager.run();
        expect(pager.apply).toHaveBeenCalledWith({
            size: 20,
            number: 2,
            offset: 20,
        });
    });
    test('does not apply pagination if disabled', () => {
        const pager = new pager_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false);
        pager.apply = vitest_1.vi.fn();
        pager.run();
        expect(pager.apply).not.toHaveBeenCalled();
    });
    test('returns the querier', () => {
        const querier = new test_1.default({}, knex('test'));
        const pager = new pager_1.default(querier);
        pager.apply = vitest_1.vi.fn();
        expect(pager.run()).toBe(querier);
    });
    test('throws `ValidationError` if invalid', () => {
        const pager = new pager_1.default(new test_1.default({ page: 'invalid' }, knex('test')));
        expect(() => pager.run()).toThrow(new validation_1.default('page must be one of [number, object]'));
    });
});
