"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
test('extends Error', () => {
    expect(new base_1.default('test')).toBeInstanceOf(Error);
});
describe('constructor', () => {
    test('accepts a message to set', () => {
        expect(new base_1.default('test').message).toBe('test');
    });
    test('captures the stack trace', () => {
        expect(new base_1.default('test').stack).toMatch('BaseError');
    });
    test('sets the `name` property to the class name', () => {
        expect(new base_1.default('test').name).toBe('BaseError');
    });
});
