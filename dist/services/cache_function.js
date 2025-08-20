"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cacheFunction;
// Caches the return value of the first call to the function and returns that on
// subsequent calls. Only works with functions without arguments.
function cacheFunction(func, bind = undefined) {
    let cache = undefined;
    return () => {
        if (cache === undefined) {
            cache = func.call(bind);
        }
        return cache;
    };
}
