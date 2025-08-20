"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnexAdapter = exports.BaseAdapter = void 0;
const base_1 = __importDefault(require("./base"));
exports.BaseAdapter = base_1.default;
const knex_1 = __importDefault(require("./knex"));
exports.KnexAdapter = knex_1.default;
