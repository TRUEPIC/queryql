"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const vitest_1 = require("vitest");
const not_implemented_1 = __importDefault(require("../errors/not_implemented"));
describe('constructor', () => {
    test('creates an instance of the validator, calls `defineValidation`', () => {
        const defineValidation = vitest_1.vi.spyOn(base_1.default.prototype, 'defineValidation');
        expect(new base_1.default().validator.constructor.name).toBe('AdapterValidator');
        expect(defineValidation).toHaveBeenCalled();
        defineValidation.mockRestore();
    });
});
describe('FILTER_OPERATORS', () => {
    test('throws `NotImplementedError` when not extended', () => {
        expect(() => base_1.default.FILTER_OPERATORS).toThrow(not_implemented_1.default);
    });
});
describe('DEFAULT_FILTER_OPERATOR', () => {
    test('throws `NotImplementedError` when not extended', () => {
        expect(() => base_1.default.DEFAULT_FILTER_OPERATOR).toThrow(not_implemented_1.default);
    });
});
describe('filter:*', () => {
    test('throws `NotImplementedError` when not extended', () => {
        expect(() => new base_1.default()['filter:*']()).toThrow(not_implemented_1.default);
    });
});
describe('sort', () => {
    test('throws `NotImplementedError` when not extended', () => {
        expect(() => new base_1.default().sort()).toThrow(not_implemented_1.default);
    });
});
describe('page', () => {
    test('throws `NotImplementedError` when not extended', () => {
        expect(() => new base_1.default().page()).toThrow(not_implemented_1.default);
    });
});
describe('defineValidation', () => {
    test('is not defined by default', () => {
        expect(new base_1.default().defineValidation()).toBeUndefined();
    });
});
describe('filter', () => {
    test('calls/returns `filter:{operator}` if defined', () => {
        const adapter = new base_1.default();
        const builder = 'builder';
        const filter = { operator: '=' };
        const FILTER_OPERATORS = vitest_1.vi
            .spyOn(base_1.default, 'FILTER_OPERATORS', 'get')
            .mockReturnValue(['=']);
        adapter['filter:='] = vitest_1.vi.fn(() => 'test');
        adapter.filter(builder, filter);
        expect(adapter['filter:=']).toHaveBeenCalledWith(builder, filter);
        expect(adapter['filter:=']).toHaveReturnedWith('test');
        FILTER_OPERATORS.mockRestore();
    });
    test('calls/returns `filter:*` if operator method is not defined', () => {
        const adapter = new base_1.default();
        const builder = 'builder';
        const filter = { operator: '=' };
        const FILTER_OPERATORS = vitest_1.vi
            .spyOn(base_1.default, 'FILTER_OPERATORS', 'get')
            .mockReturnValue(['=']);
        adapter['filter:*'] = vitest_1.vi.fn(() => 'test');
        adapter.filter(builder, filter);
        expect(adapter['filter:*']).toHaveBeenCalledWith(builder, filter);
        expect(adapter['filter:*']).toHaveReturnedWith('test');
        FILTER_OPERATORS.mockRestore();
    });
    test('throws `NotImplementedError` if operator is not supported', () => {
        const FILTER_OPERATORS = vitest_1.vi
            .spyOn(base_1.default, 'FILTER_OPERATORS', 'get')
            .mockReturnValue(['=']);
        expect(() => new base_1.default().filter('builder', { operator: 'invalid' })).toThrow(not_implemented_1.default);
        FILTER_OPERATORS.mockRestore();
    });
});
