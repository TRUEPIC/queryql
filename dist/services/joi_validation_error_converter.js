"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = joiValidationErrorConverter;
const validation_1 = __importDefault(require("../errors/validation"));
function joiValidationErrorConverter(error, pathPrefix = null) {
    const detail = error.details[0];
    let path = detail.path.reduce((accumulator, value, index) => index === 0 ? `${value}` : `${accumulator}[${value}]`, null);
    if (pathPrefix) {
        path = path ? `${pathPrefix}:${path}` : pathPrefix;
    }
    const message = detail.message.replace(/^".*?" /, '');
    return new validation_1.default(`${path} ${message}`);
}
