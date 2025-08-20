"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const joi_1 = __importDefault(require("./joi"));
module.exports = {
    BaseValidator: base_1.default,
    JoiValidator: joi_1.default,
};
