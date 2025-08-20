"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = flattenMap;
function flattenMap(params) {
    const { map, key, value } = params;
    const entries = Array.from(map.entries());
    return entries.reduce((accumulator, [entryKey, entryValue]) => {
        const rawKey = key ? key(entryKey, entryValue) : entryKey;
        const newKey = String(rawKey);
        const newValue = value
            ? value(entryValue, entryKey)
            : entryValue;
        return {
            ...accumulator,
            [newKey]: newValue,
        };
    }, {});
}
