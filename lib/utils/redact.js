"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAndRedactLog = exports.redactUrl = exports.tryParseJson = exports.REDACTED_PLACEHOLDER = void 0;
exports.REDACTED_PLACEHOLDER = '[REDACTED]';
const MAX_REDACT_STRING_LENGTH = 300 * 1024;
const FORM_URLENCODED_RE = /^[^\s=&{}[\]"]+=[^&\s]*(?:&[^\s=&{}[\]"]+=[^&\s]*)*$/;
const buildRedactSet = (redactKeys) => {
    if (!redactKeys || redactKeys.length === 0) {
        return null;
    }
    const set = new Set();
    for (const key of redactKeys) {
        if (typeof key === 'string') {
            const normalized = key.trim().toLowerCase();
            if (normalized) {
                set.add(normalized);
            }
        }
    }
    return set.size > 0 ? set : null;
};
const safeDecode = (value) => {
    try {
        return decodeURIComponent(value.replace(/\+/g, ' '));
    }
    catch {
        return value;
    }
};
/** Redacts `key=value&key2=value2` pairs (query strings and form-urlencoded bodies). */
const redactPairs = (query, redactSet) => query
    .split('&')
    .map(pair => {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) {
        return pair;
    }
    const rawKey = pair.slice(0, eqIndex);
    return redactSet.has(safeDecode(rawKey).toLowerCase())
        ? `${rawKey}=${exports.REDACTED_PLACEHOLDER}`
        : pair;
})
    .join('&');
const redactUrlWithSet = (rawUrl, redactSet) => {
    if (typeof rawUrl !== 'string') {
        return rawUrl;
    }
    const queryIndex = rawUrl.indexOf('?');
    if (queryIndex === -1) {
        return rawUrl;
    }
    const hashIndex = rawUrl.indexOf('#', queryIndex);
    const queryPart = hashIndex === -1 ? rawUrl.slice(queryIndex + 1) : rawUrl.slice(queryIndex + 1, hashIndex);
    const hashPart = hashIndex === -1 ? '' : rawUrl.slice(hashIndex);
    if (!queryPart) {
        return rawUrl;
    }
    return `${rawUrl.slice(0, queryIndex)}?${redactPairs(queryPart, redactSet)}${hashPart}`;
};
const looksLikeJson = (value) => {
    const trimmed = value.trim();
    return ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']')));
};
/** Parses JSON strings lazily (UI time only); returns the input unchanged otherwise. */
const tryParseJson = (value) => {
    if (typeof value !== 'string' || !looksLikeJson(value)) {
        return value;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};
exports.tryParseJson = tryParseJson;
const redactValue = (value, redactSet, seen) => {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'string') {
        if (value.length > MAX_REDACT_STRING_LENGTH) {
            return value;
        }
        if (looksLikeJson(value)) {
            const parsed = (0, exports.tryParseJson)(value);
            return parsed === value ? value : redactValue(parsed, redactSet, seen);
        }
        if (FORM_URLENCODED_RE.test(value)) {
            return redactPairs(value, redactSet);
        }
        return value;
    }
    if (typeof value !== 'object') {
        return value;
    }
    if (seen.has(value)) {
        return '[Circular]';
    }
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map(item => redactValue(item, redactSet, seen));
    }
    const output = {};
    for (const [key, val] of Object.entries(value)) {
        output[key] = redactSet.has(key.toLowerCase())
            ? exports.REDACTED_PLACEHOLDER
            : redactValue(val, redactSet, seen);
    }
    return output;
};
const redactRecord = (record, redactSet) => {
    if (!record || typeof record !== 'object') {
        return record;
    }
    const result = {};
    for (const [key, value] of Object.entries(record)) {
        result[key] = redactSet.has(key.toLowerCase())
            ? exports.REDACTED_PLACEHOLDER
            : redactValue(value, redactSet, new WeakSet());
    }
    return result;
};
/** Redacts sensitive query parameters in a URL (cheap; used by list items). */
const redactUrl = (url, redactKeys) => {
    const redactSet = buildRedactSet(redactKeys);
    return redactSet ? redactUrlWithSet(url, redactSet) : url;
};
exports.redactUrl = redactUrl;
/**
 * Applies optional responseFormatter and redactKeys before displaying, copying, or exporting logs.
 * Runs only at UI time, never on the network hot path.
 */
const formatAndRedactLog = (log, redactKeys, responseFormatter) => {
    let formattedResponse = log.response;
    if (log.response && log.response.body !== undefined && typeof responseFormatter === 'function') {
        try {
            formattedResponse = {
                ...log.response,
                body: responseFormatter((0, exports.tryParseJson)(log.response.body), log),
            };
        }
        catch {
            // Preserve original body if the user formatter throws
        }
    }
    const redactSet = buildRedactSet(redactKeys);
    if (!redactSet) {
        return formattedResponse === log.response ? log : { ...log, response: formattedResponse };
    }
    return {
        ...log,
        url: redactUrlWithSet(log.url, redactSet),
        headers: redactRecord(log.headers, redactSet) ?? {},
        queryParameters: redactRecord(log.queryParameters, redactSet),
        body: redactValue(log.body, redactSet, new WeakSet()),
        response: formattedResponse
            ? {
                ...formattedResponse,
                headers: redactRecord(formattedResponse.headers, redactSet) ?? {},
                body: redactValue(formattedResponse.body, redactSet, new WeakSet()),
            }
            : undefined,
    };
};
exports.formatAndRedactLog = formatAndRedactLog;
