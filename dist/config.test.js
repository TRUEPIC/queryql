"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
describe('constructor', () => {
    test('accepts an object of values to set', () => {
        const values = { test: 123 };
        expect(new config_1.default(values).get()).toMatchObject(values);
    });
});
describe('DEFAULTS', () => {
    test('returns `KnexAdapter` as the default adapter', () => {
        expect(config_1.default.DEFAULTS.adapter?.name).toBe('KnexAdapter');
    });
    test('returns `JoiValidator` as the default validator', () => {
        expect(config_1.default.DEFAULTS.validator?.name).toBe('JoiValidator');
    });
});
describe('defaults', () => {
    afterEach(() => {
        config_1.default._defaults = config_1.default.DEFAULTS;
    });
    describe('set', () => {
        test('accepts an object with new values', () => {
            const defaults = { test: 456 };
            config_1.default.defaults = defaults;
            expect(config_1.default.defaults).toMatchObject(defaults);
        });
        test('merges the new values with existing values', () => {
            const existingValues = config_1.default.defaults;
            const newValues = { test: 789 };
            config_1.default.defaults = newValues;
            expect(config_1.default.defaults).toEqual({
                ...existingValues,
                ...newValues,
            });
        });
    });
    describe('get', () => {
        test('returns an object of all values', () => {
            expect(config_1.default.defaults).toEqual(config_1.default.DEFAULTS);
        });
    });
});
describe('set', () => {
    test('accepts an object with new values', () => {
        const config = new config_1.default({});
        const values = { test: 'testing' };
        config.set(values);
        expect(config.get()).toMatchObject(values);
    });
    test('merges the new values with default values', () => {
        const config = new config_1.default({});
        config.set({ test: 'testing' });
        expect(config.get()).toMatchObject(config_1.default.defaults);
    });
    test('merges the new values with existing values', () => {
        const config = new config_1.default({});
        config.set({ before: 123 });
        const existingValues = config.get();
        const newValues = { after: 456 };
        config.set(newValues);
        expect(config.get()).toEqual({
            ...existingValues,
            ...newValues,
        });
    });
});
describe('get', () => {
    test('returns an object of all values when no key argument is passed', () => {
        expect(new config_1.default({}).get()).toEqual(config_1.default.DEFAULTS);
    });
    test('returns a specific value when a key argument is passed', () => {
        expect(new config_1.default({}).get('adapter')).toBe(config_1.default.DEFAULTS.adapter);
    });
});
