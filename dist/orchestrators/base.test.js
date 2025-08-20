"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const vitest_1 = require("vitest");
const knex = (0, knex_1.default)({ client: 'pg' });
const base_1 = __importDefault(require("./base"));
const not_implemented_1 = __importDefault(require("../errors/not_implemented"));
const test_1 = __importDefault(require("../test/queriers/test"));
const validation_1 = __importDefault(require("../errors/validation"));
let buildParser;
beforeEach(() => {
    buildParser = vitest_1.vi
        .spyOn(base_1.default.prototype, 'buildParser')
        .mockReturnValue({ parse: () => { } });
});
afterEach(() => {
    buildParser.mockRestore();
});
describe('constructor', () => {
    test('accepts a querier to set', () => {
        const querier = new test_1.default({}, knex('test'));
        const filterer = new base_1.default(querier);
        expect(filterer.querier).toBe(querier);
    });
    test('calls `buildParser` and sets the returned value', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        expect(buildParser).toHaveBeenCalled();
        expect(orchestrator.parser).toBeDefined();
    });
});
describe('queryKey', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        expect(() => orchestrator.queryKey).toThrow(not_implemented_1.default);
    });
});
describe('schema', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        expect(() => orchestrator.schema).toThrow(not_implemented_1.default);
    });
});
describe('isEnabled', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        expect(() => orchestrator.isEnabled).toThrow(not_implemented_1.default);
    });
});
describe('buildParser', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        buildParser.mockRestore();
        expect(() => orchestrator.buildParser()).toThrow(not_implemented_1.default);
    });
});
describe('validate', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        expect(() => orchestrator.validate()).toThrow(not_implemented_1.default);
    });
});
describe('run', () => {
    test('throws `NotImplementedError` when not extended', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        expect(() => orchestrator.run()).toThrow(not_implemented_1.default);
    });
});
describe('query', () => {
    test('returns the query value specified by the query key', () => {
        const orchestrator = new base_1.default(new test_1.default({ test: 123 }, knex('test')));
        vitest_1.vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test');
        expect(orchestrator.query).toBe(123);
    });
});
describe('parse', () => {
    test('parses/returns the query', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true);
        orchestrator.parser = { parse: () => 123 };
        expect(orchestrator.parse()).toBe(123);
    });
    test('returns the cached parsed query on subsequent calls', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true);
        const parse = vitest_1.vi.fn(() => 123);
        orchestrator.parser = { parse };
        expect(orchestrator.parse()).toBe(123);
        expect(orchestrator.parse()).toBe(123);
        expect(parse).toHaveBeenCalledTimes(1);
    });
    test('returns `null` if disabled, no query', () => {
        const orchestrator = new base_1.default(new test_1.default({}, knex('test')));
        vitest_1.vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test');
        vitest_1.vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false);
        expect(orchestrator.parse()).toBeNull();
    });
    test('throws `ValidationError` if disabled, with query', () => {
        const orchestrator = new base_1.default(new test_1.default({ test: 123 }, knex('test')));
        vitest_1.vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test');
        vitest_1.vi.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false);
        expect(() => orchestrator.parse()).toThrow(new validation_1.default(`${orchestrator.queryKey} is disabled`));
    });
});
describe('apply', () => {
    test('calls/returns method on querier if method defined', () => {
        const querier = new test_1.default({}, knex('test'));
        const orchestrator = new base_1.default(querier);
        const data = {
            name: 'test',
            field: 'test',
            order: 'asc',
        };
        vitest_1.vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('sort');
        querier['sort:test'] = vitest_1.vi.fn((builder) => builder);
        expect(orchestrator.apply(data, 'sort:test')).toBe(querier.builder);
        expect(querier['sort:test']).toHaveBeenCalledWith(querier.builder, data);
    });
    test('calls/returns method on adapter if querier method not defined', () => {
        const querier = new test_1.default({}, knex('test'));
        const orchestrator = new base_1.default(querier);
        const data = {
            name: 'test',
            field: 'test',
            order: 'asc',
        };
        vitest_1.vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('sort');
        vitest_1.vi.spyOn(querier.adapter, 'sort');
        expect(orchestrator.apply(data, 'test')).toBe(querier.builder);
        expect(querier.adapter.sort).toHaveBeenCalledWith(querier.builder, data);
    });
    test('calls/returns method on adapter if no querier method specified', () => {
        const querier = new test_1.default({}, knex('test'));
        const orchestrator = new base_1.default(querier);
        const data = {
            size: 20,
            number: 2,
            offset: 20,
        };
        vitest_1.vi.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('page');
        vitest_1.vi.spyOn(querier.adapter, 'page');
        expect(orchestrator.apply(data)).toBe(querier.builder);
        expect(querier.adapter.page).toHaveBeenCalledWith(querier.builder, data);
    });
});
