"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeQueryParams = exports.parseQueryParams = void 0;
const safeDecode = (value) => {
    try {
        return decodeURIComponent(value.replace(/\+/g, ' '));
    }
    catch {
        return value;
    }
};
/** Extracts query parameters from a URL without relying on the `URL` polyfill. */
const parseQueryParams = (url) => {
    if (typeof url !== 'string') {
        return undefined;
    }
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) {
        return undefined;
    }
    const hashIndex = url.indexOf('#', queryIndex);
    const query = hashIndex === -1 ? url.slice(queryIndex + 1) : url.slice(queryIndex + 1, hashIndex);
    if (!query) {
        return undefined;
    }
    const result = {};
    for (const pair of query.split('&')) {
        if (!pair) {
            continue;
        }
        const eqIndex = pair.indexOf('=');
        const key = safeDecode(eqIndex === -1 ? pair : pair.slice(0, eqIndex));
        const value = eqIndex === -1 ? '' : safeDecode(pair.slice(eqIndex + 1));
        result[key] = key in result ? `${result[key]}, ${value}` : value;
    }
    return Object.keys(result).length > 0 ? result : undefined;
};
exports.parseQueryParams = parseQueryParams;
/** Converts axios `params` (numbers, arrays, nested objects) into a flat string record. */
const normalizeQueryParams = (params) => {
    if (!params || typeof params !== 'object') {
        return undefined;
    }
    const result = {};
    const entries = typeof URLSearchParams !== 'undefined' && params instanceof URLSearchParams
        ? Array.from(params.entries())
        : Object.entries(params);
    for (const [key, value] of entries) {
        if (value === undefined) {
            continue;
        }
        if (value === null || typeof value !== 'object') {
            result[key] = String(value);
        }
        else {
            try {
                result[key] = JSON.stringify(value);
            }
            catch {
                result[key] = String(value);
            }
        }
    }
    return Object.keys(result).length > 0 ? result : undefined;
};
exports.normalizeQueryParams = normalizeQueryParams;
