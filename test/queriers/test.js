"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importDefault(require("../../src"));
class TestQuerier extends src_1.default {
    defineSchema(schema) {
        schema.filter('test', '=');
        schema.filter('testing', '!=');
        schema.sort('test');
        schema.sort('testing');
        schema.page();
    }
}
exports.default = TestQuerier;
