"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const flatten_map_1 = __importDefault(require("./flatten_map"));
test('uses the map key/value as the object key/value by default', () => {
    const map = new Map([
        ['test', 123],
        ['testing', 456],
    ]);
    expect((0, flatten_map_1.default)({ map })).toEqual({
        test: 123,
        testing: 456,
    });
});
test('optionally calls a `key` function to build the key', () => {
    const map = new Map([['test', 123]]);
    const key = (key, value) => `${key}:${value}`;
    expect((0, flatten_map_1.default)({ map, key })).toEqual({
        'test:123': 123,
    });
});
test('optionally calls a `value` function to build the value', () => {
    const map = new Map([['test', 123]]);
    const value = (value, key) => `${value}:${key}`;
    expect((0, flatten_map_1.default)({ map, value })).toEqual({
        test: '123:test',
    });
});
test('returns an empty object if the map is empty', () => {
    const map = new Map();
    expect((0, flatten_map_1.default)({ map })).toEqual({});
});
