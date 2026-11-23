"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestsInspectorFetch = exports.attachRequestsInspector = exports.requestsInspectorAxiosInterceptor = exports.disableGlobalNetworkLogging = exports.enableGlobalNetworkLogging = exports.isGlobalNetworkLoggingEnabled = exports.safeExtractBody = void 0;
const networkStore_1 = require("./networkStore");
const url_1 = require("./utils/url");
const urlFilter_1 = require("./utils/urlFilter");
const MAX_STORED_BODY_SIZE = 250 * 1024; // 250 KB limit to prevent OOM on huge payloads
const MAX_RESPONSE_READ_BYTES = 5 * 1024 * 1024; // Skip reading fetch bodies larger than 5 MB
const MAX_OBJECT_DEPTH = 20;
const TRUNCATION_NOTICE = '\n\n...[Body truncated: Exceeds 250KB limit]';
const GLOBAL_STATE_KEY = Symbol.for('react-native-requests-inspector.globalState.v2');
const getGlobalState = () => {
    const host = globalThis;
    let state = host[GLOBAL_STATE_KEY];
    if (!state) {
        state = { isEnabled: false, fetchSyncDepth: 0 };
        host[GLOBAL_STATE_KEY] = state;
    }
    return state;
};
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VALID_METHODS = new Set([
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
]);
const normalizeMethod = (method) => {
    const upper = (method || 'GET').toUpperCase();
    return VALID_METHODS.has(upper) ? upper : 'GET';
};
const truncateString = (value) => value.length <= MAX_STORED_BODY_SIZE
    ? value
    : `${value.slice(0, MAX_STORED_BODY_SIZE)}${TRUNCATION_NOTICE}`;
const safeHeadersToRecord = (headers) => {
    const result = {};
    if (!headers || typeof headers !== 'object') {
        return result;
    }
    try {
        if (typeof Headers !== 'undefined' && headers instanceof Headers) {
            headers.forEach((val, key) => {
                result[key] = val;
            });
            return result;
        }
        if (Array.isArray(headers)) {
            headers.forEach(entry => {
                if (Array.isArray(entry) && entry.length >= 2 && entry[0] !== undefined) {
                    result[String(entry[0])] = String(entry[1] ?? '');
                }
            });
            return result;
        }
        let source = headers;
        if (typeof headers.toJSON === 'function') {
            const json = headers.toJSON();
            if (json && typeof json === 'object') {
                source = json;
            }
        }
        Object.entries(source).forEach(([k, v]) => {
            if (v !== undefined && v !== null && typeof v !== 'function' && typeof v !== 'object') {
                result[k] = String(v);
            }
            else if (Array.isArray(v)) {
                result[k] = v.join(', ');
            }
        });
    }
    catch {
        // Ignore malformed header containers
    }
    return result;
};
const parseRawResponseHeaders = (rawHeaders) => {
    const result = {};
    if (!rawHeaders || typeof rawHeaders !== 'string') {
        return result;
    }
    for (const line of rawHeaders.split(/\r?\n/)) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim();
            if (key) {
                result[key] = result[key] ? `${result[key]}, ${val}` : val;
            }
        }
    }
    return result;
};
const resolveFullUrl = (baseURL, url) => {
    if (!url) {
        return baseURL || '';
    }
    if (!baseURL || /^[a-z][a-z\d+\-.]*:\/\//i.test(url)) {
        return url;
    }
    return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
};
const describeBlob = (size, type) => `[Blob: ${typeof size === 'number' ? size : 0} bytes${typeof type === 'string' && type ? ` (${type})` : ''}]`;
const isReactNativeBlob = (data) => {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    const candidate = data;
    return Boolean(candidate._data && typeof candidate._data === 'object' && 'blobId' in candidate._data);
};
const formatFormDataPart = (val) => {
    if (typeof val === 'object' && val !== null && 'uri' in val) {
        const file = val;
        return `[File: ${file.name || 'unnamed'} (${file.type || 'unknown'})]`;
    }
    if (typeof Blob !== 'undefined' && val instanceof Blob) {
        return describeBlob(val.size, val.type);
    }
    if (isReactNativeBlob(val)) {
        return describeBlob(val._data.size, val._data.type);
    }
    if (typeof val === 'string') {
        return truncateString(val);
    }
    return val;
};
const consume = (budget, amount) => {
    budget.remaining -= amount;
    if (budget.remaining < 0) {
        budget.exceeded = true;
    }
    return !budget.exceeded;
};
/** Copies a value into a JSON-safe structure, stopping once ~250KB has been visited. */
const sanitizeWithBudget = (value, seen, depth, budget) => {
    if (value === null || value === undefined) {
        consume(budget, 4);
        return value ?? null;
    }
    switch (typeof value) {
        case 'string':
            if (!consume(budget, value.length + 2)) {
                return value.slice(0, Math.max(0, value.length + budget.remaining));
            }
            return value;
        case 'number':
        case 'boolean':
            consume(budget, 8);
            return value;
        case 'bigint':
        case 'symbol':
        case 'function': {
            const str = typeof value === 'function' ? '[Function]' : String(value);
            consume(budget, str.length + 2);
            return str;
        }
        default:
            break;
    }
    const obj = value;
    if (obj instanceof Date) {
        const iso = Number.isNaN(obj.getTime()) ? 'Invalid Date' : obj.toISOString();
        consume(budget, iso.length + 2);
        return iso;
    }
    if (obj instanceof RegExp) {
        const str = obj.toString();
        consume(budget, str.length + 2);
        return str;
    }
    if (obj instanceof Error) {
        consume(budget, obj.message.length + obj.name.length + 24);
        return { name: obj.name, message: obj.message };
    }
    if (seen.has(obj)) {
        consume(budget, 12);
        return '[Circular]';
    }
    if (depth >= MAX_OBJECT_DEPTH) {
        consume(budget, 13);
        return '[Max Depth]';
    }
    seen.add(obj);
    if (Array.isArray(obj) || obj instanceof Set) {
        const source = Array.isArray(obj) ? obj : Array.from(obj);
        const arr = [];
        consume(budget, 2);
        for (let i = 0; i < source.length && !budget.exceeded; i += 1) {
            arr.push(sanitizeWithBudget(source[i], seen, depth + 1, budget));
        }
        return arr;
    }
    const entries = obj instanceof Map
        ? Array.from(obj.entries()).map(([k, v]) => [String(k), v])
        : Object.entries(obj);
    const out = {};
    consume(budget, 2);
    for (const [k, v] of entries) {
        if (budget.exceeded || !consume(budget, k.length + 4)) {
            break;
        }
        out[k] = sanitizeWithBudget(v, seen, depth + 1, budget);
    }
    return out;
};
/**
 * Converts any request/response payload into a memory-safe, JSON-serializable value.
 * Strings stay raw (JSON is parsed lazily by the UI), binary data is summarized,
 * objects are copied with circular protection and truncated at ~250KB.
 */
const safeExtractBody = (data) => {
    if (data === undefined || data === null) {
        return undefined;
    }
    if (typeof data === 'string') {
        return truncateString(data);
    }
    if (typeof data === 'number' || typeof data === 'boolean') {
        return data;
    }
    if (typeof data === 'bigint' || typeof data === 'symbol' || typeof data === 'function') {
        return String(data);
    }
    if (typeof ArrayBuffer !== 'undefined') {
        if (data instanceof ArrayBuffer) {
            return `[ArrayBuffer: ${data.byteLength} bytes]`;
        }
        if (ArrayBuffer.isView(data)) {
            const name = data.constructor?.name || 'TypedArray';
            return `[${name}: ${data.byteLength} bytes]`;
        }
    }
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
        return describeBlob(data.size, data.type);
    }
    if (isReactNativeBlob(data)) {
        return describeBlob(data._data.size, data._data.type);
    }
    // React Native FormData exposes `_parts`
    const parts = data._parts;
    if (Array.isArray(parts)) {
        const formDataObj = {};
        parts.forEach(part => {
            if (Array.isArray(part)) {
                formDataObj[String(part[0])] = formatFormDataPart(part[1]);
            }
        });
        return formDataObj;
    }
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
        const formDataObj = {};
        try {
            const iterable = data;
            iterable.forEach?.((val, key) => {
                formDataObj[String(key)] = formatFormDataPart(val);
            });
            return formDataObj;
        }
        catch {
            return '[FormData]';
        }
    }
    if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
        return truncateString(data.toString());
    }
    const budget = {
        remaining: MAX_STORED_BODY_SIZE,
        exceeded: false,
    };
    const sanitized = sanitizeWithBudget(data, new WeakSet(), 0, budget);
    if (!budget.exceeded) {
        return sanitized;
    }
    try {
        return `${JSON.stringify(sanitized).slice(0, MAX_STORED_BODY_SIZE)}${TRUNCATION_NOTICE}`;
    }
    catch {
        return '[Object truncated: Exceeds 250KB limit]';
    }
};
exports.safeExtractBody = safeExtractBody;
const isUnreadableContentType = (contentType) => {
    if (!contentType) {
        return false;
    }
    const lower = contentType.toLowerCase();
    return (lower.startsWith('image/') ||
        lower.startsWith('video/') ||
        lower.startsWith('audio/') ||
        lower.startsWith('font/') ||
        lower.includes('text/event-stream') ||
        lower.includes('application/octet-stream') ||
        lower.includes('application/pdf') ||
        lower.includes('application/zip') ||
        lower.includes('protobuf') ||
        lower.includes('grpc'));
};
const errorMessageOf = (err, fallback) => {
    if (err instanceof Error && err.message) {
        return err.message;
    }
    if (typeof err === 'string' && err) {
        return err;
    }
    return fallback;
};
const completeWithError = (id, sentTime, error) => {
    const receivedTime = Date.now();
    networkStore_1.useNetworkStore.getState().updateResponse(id, {
        statusCode: 0,
        headers: {},
        receivedTime,
        durationMs: receivedTime - sentTime,
        error,
    });
};
const describeFetchRequest = (input, init) => {
    const isRequestObj = typeof Request !== 'undefined' && input instanceof Request;
    const requestLike = input;
    const url = typeof input === 'string'
        ? input
        : isRequestObj || typeof requestLike?.url === 'string'
            ? String(requestLike.url)
            : String(input);
    return {
        url,
        method: normalizeMethod(init?.method || (isRequestObj ? requestLike.method : undefined)),
        headers: {
            ...(isRequestObj ? safeHeadersToRecord(requestLike.headers) : {}),
            ...(init?.headers ? safeHeadersToRecord(init.headers) : {}),
        },
        body: init?.body ?? (isRequestObj ? requestLike._bodyInit ?? requestLike._bodyText : undefined),
    };
};
const readFetchBodyInBackground = (id, res, base) => {
    const contentType = res.headers?.get?.('content-type');
    const contentLength = Number(res.headers?.get?.('content-length'));
    const finish = (body) => {
        networkStore_1.useNetworkStore.getState().updateResponse(id, { ...base, body });
    };
    if (isUnreadableContentType(contentType)) {
        finish(`[Binary/stream response not captured (${contentType})]`);
        return;
    }
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_READ_BYTES) {
        finish(`[Large response not captured: ${contentLength} bytes]`);
        return;
    }
    let cloned;
    try {
        cloned = res.clone();
    }
    catch {
        finish('[Unable to read response body]');
        return;
    }
    cloned
        .text()
        .then(text => finish(text ? truncateString(text) : undefined))
        .catch(() => finish('[Unable to read response body]'));
};
const runTrackedFetch = (baseFetch, input, init, shouldTrack) => {
    const globalState = getGlobalState();
    const store = networkStore_1.useNetworkStore.getState();
    let id = '';
    let sentTime = 0;
    if (shouldTrack && store.isEnabled && !store.isPaused) {
        const request = describeFetchRequest(input, init);
        if (!(0, urlFilter_1.isIgnoredUrl)(request.url)) {
            sentTime = Date.now();
            id = store.addRequest({
                url: request.url,
                method: request.method,
                headers: request.headers,
                body: (0, exports.safeExtractBody)(request.body),
                sentTime,
            });
        }
    }
    // Mark XHRs created synchronously by the fetch polyfill (whatwg-fetch) so they aren't logged twice.
    // The counter is decremented synchronously; it never stays raised across an `await`.
    let promise;
    globalState.fetchSyncDepth += 1;
    try {
        promise = baseFetch.call(globalThis, input, init);
    }
    catch (err) {
        if (id) {
            completeWithError(id, sentTime, errorMessageOf(err, 'Fetch Failed'));
        }
        // fetch() must always return a promise
        return Promise.reject(err);
    }
    finally {
        globalState.fetchSyncDepth -= 1;
    }
    if (!id) {
        return promise;
    }
    return promise.then(res => {
        try {
            const receivedTime = Date.now();
            const base = {
                statusCode: res.status,
                headers: safeHeadersToRecord(res.headers),
                receivedTime,
                durationMs: receivedTime - sentTime,
                error: res.ok || res.type === 'opaque' ? undefined : `HTTP Error ${res.status}`,
            };
            networkStore_1.useNetworkStore.getState().updateResponse(id, base);
            // Never delay the app: body is read from a clone after the response is handed back.
            readFetchBodyInBackground(id, res, base);
        }
        catch {
            // Inspector failures must never affect the app's request
        }
        return res;
    }, err => {
        completeWithError(id, sentTime, errorMessageOf(err, 'Fetch Failed'));
        throw err;
    });
};
// ---------------------------------------------------------------------------
// XMLHttpRequest tracking
// ---------------------------------------------------------------------------
const trackXhr = (xhr, id, sentTime) => {
    if (typeof xhr.addEventListener !== 'function') {
        return;
    }
    let settled = false;
    let failureHint;
    const onError = () => {
        failureHint = failureHint || 'Network Request Failed';
    };
    const onTimeout = () => {
        failureHint = 'Request Timeout';
    };
    const onAbort = () => {
        failureHint = 'Request Aborted';
    };
    const finalize = () => {
        if (settled) {
            return;
        }
        settled = true;
        xhr.removeEventListener('error', onError);
        xhr.removeEventListener('timeout', onTimeout);
        xhr.removeEventListener('abort', onAbort);
        xhr.removeEventListener('loadend', finalize);
        xhr.removeEventListener('readystatechange', onReadyStateChange);
        try {
            const receivedTime = Date.now();
            const status = typeof xhr.status === 'number' ? xhr.status : 0;
            let rawResponse;
            try {
                rawResponse = xhr.response;
            }
            catch {
                rawResponse = undefined;
            }
            let error;
            let body;
            if (status === 0) {
                if (xhr._timedOut) {
                    failureHint = 'Request Timeout';
                }
                error = failureHint || 'Network Request Failed';
                // React Native stores the native error message in the response text
                if (error === 'Network Request Failed' &&
                    typeof rawResponse === 'string' &&
                    rawResponse.trim() &&
                    rawResponse.length < 500) {
                    error = rawResponse.trim();
                }
            }
            else {
                body = (0, exports.safeExtractBody)(rawResponse);
                if (status >= 400) {
                    error = `HTTP Error ${status}`;
                }
            }
            networkStore_1.useNetworkStore.getState().updateResponse(id, {
                statusCode: status,
                headers: status === 0
                    ? {}
                    : parseRawResponseHeaders(typeof xhr.getAllResponseHeaders === 'function' ? xhr.getAllResponseHeaders() : ''),
                body,
                receivedTime,
                durationMs: receivedTime - sentTime,
                error,
            });
        }
        catch {
            // Inspector failures must never affect the app's request
        }
    };
    // `loadend` fires after error/timeout/abort/load. The deferred readystatechange
    // fallback covers XHR implementations that don't dispatch `loadend`.
    const onReadyStateChange = () => {
        if (xhr.readyState === 4) {
            setTimeout(finalize, 0);
        }
    };
    xhr.addEventListener('error', onError);
    xhr.addEventListener('timeout', onTimeout);
    xhr.addEventListener('abort', onAbort);
    xhr.addEventListener('loadend', finalize);
    xhr.addEventListener('readystatechange', onReadyStateChange);
};
const installXhrPatch = (state) => {
    const XHR = globalThis.XMLHttpRequest;
    if (typeof XHR !== 'function' || !XHR.prototype) {
        return;
    }
    const proto = XHR.prototype;
    if (state.xhrProto === proto && proto.send === state.patchedXhrSend) {
        return; // Already installed (hot reload / double enable)
    }
    const originalOpen = proto.open;
    const originalSend = proto.send;
    const originalSetRequestHeader = proto.setRequestHeader;
    const patchedOpen = function (method, url, ...rest) {
        const current = getGlobalState();
        // XHRs created synchronously inside fetch() are logged by the fetch patch instead
        this.__riMeta =
            current.isEnabled && current.fetchSyncDepth === 0
                ? { method: String(method || 'GET'), url: String(url), headers: {} }
                : undefined;
        return originalOpen.apply(this, [method, url, ...rest]);
    };
    const patchedSetRequestHeader = function (header, value, ...rest) {
        if (this.__riMeta && header) {
            this.__riMeta.headers[String(header)] = String(value ?? '');
        }
        return originalSetRequestHeader.apply(this, [
            header,
            value,
            ...rest,
        ]);
    };
    const patchedSend = function (...args) {
        const body = args[0];
        const meta = this.__riMeta;
        this.__riMeta = undefined;
        let id = '';
        let sentTime = 0;
        try {
            const store = networkStore_1.useNetworkStore.getState();
            if (meta && getGlobalState().isEnabled && store.isEnabled && !(0, urlFilter_1.isIgnoredUrl)(meta.url)) {
                sentTime = Date.now();
                id = store.addRequest({
                    url: meta.url,
                    method: normalizeMethod(meta.method),
                    headers: meta.headers,
                    body: (0, exports.safeExtractBody)(body),
                    sentTime,
                });
                if (id) {
                    trackXhr(this, id, sentTime);
                }
            }
        }
        catch {
            id = '';
        }
        try {
            return originalSend.apply(this, args);
        }
        catch (err) {
            if (id) {
                completeWithError(id, sentTime, errorMessageOf(err, 'XMLHttpRequest send failed'));
            }
            throw err;
        }
    };
    proto.open = patchedOpen;
    proto.setRequestHeader = patchedSetRequestHeader;
    proto.send = patchedSend;
    state.xhrProto = proto;
    state.originalXhrOpen = originalOpen;
    state.originalXhrSend = originalSend;
    state.originalXhrSetRequestHeader = originalSetRequestHeader;
    state.patchedXhrOpen = patchedOpen;
    state.patchedXhrSend = patchedSend;
    state.patchedXhrSetRequestHeader = patchedSetRequestHeader;
};
const uninstallXhrPatch = (state) => {
    const proto = state.xhrProto;
    if (!proto) {
        return;
    }
    // Only restore if nobody (Reactotron, Flipper, other loggers) wrapped our patch afterwards;
    // otherwise leave it installed — it is a no-op while `isEnabled` is false.
    if (proto.open === state.patchedXhrOpen &&
        proto.send === state.patchedXhrSend &&
        proto.setRequestHeader === state.patchedXhrSetRequestHeader) {
        proto.open = state.originalXhrOpen;
        proto.send = state.originalXhrSend;
        proto.setRequestHeader = state.originalXhrSetRequestHeader;
        state.xhrProto = undefined;
        state.patchedXhrOpen = undefined;
        state.patchedXhrSend = undefined;
        state.patchedXhrSetRequestHeader = undefined;
    }
};
const installFetchPatch = (state) => {
    if (typeof globalThis.fetch !== 'function') {
        return;
    }
    if (state.patchedFetch && globalThis.fetch === state.patchedFetch) {
        return;
    }
    const originalFetch = globalThis.fetch;
    const patchedFetch = function (input, init) {
        return runTrackedFetch(originalFetch, input, init, getGlobalState().isEnabled);
    };
    state.originalFetch = originalFetch;
    state.patchedFetch = patchedFetch;
    globalThis.fetch = patchedFetch;
};
const uninstallFetchPatch = (state) => {
    if (state.patchedFetch && globalThis.fetch === state.patchedFetch && state.originalFetch) {
        globalThis.fetch = state.originalFetch;
        state.patchedFetch = undefined;
        state.originalFetch = undefined;
    }
};
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const isGlobalNetworkLoggingEnabled = () => getGlobalState().isEnabled;
exports.isGlobalNetworkLoggingEnabled = isGlobalNetworkLoggingEnabled;
/**
 * Records every request made through XMLHttpRequest (axios, apisauce, superagent...) and
 * global fetch, regardless of how many axios instances exist or what their interceptors do.
 * Idempotent and safe across Fast Refresh. Uses only public globals (no RN private modules).
 */
const enableGlobalNetworkLogging = () => {
    const state = getGlobalState();
    state.isEnabled = true;
    try {
        installXhrPatch(state);
    }
    catch {
        // Environment without a patchable XMLHttpRequest
    }
    try {
        installFetchPatch(state);
    }
    catch {
        // Environment with a read-only fetch
    }
};
exports.enableGlobalNetworkLogging = enableGlobalNetworkLogging;
const disableGlobalNetworkLogging = () => {
    const state = getGlobalState();
    state.isEnabled = false;
    try {
        uninstallXhrPatch(state);
        uninstallFetchPatch(state);
    }
    catch {
        // Ignore restore failures; patches are inert while disabled
    }
};
exports.disableGlobalNetworkLogging = disableGlobalNetworkLogging;
exports.requestsInspectorAxiosInterceptor = {
    request: (config) => {
        try {
            const store = networkStore_1.useNetworkStore.getState();
            // When global logging is on, the XHR/fetch layer records the request exactly once.
            if (!store.isEnabled || getGlobalState().isEnabled || !config) {
                return config;
            }
            const fullUrl = resolveFullUrl(config.baseURL, config.url);
            if ((0, urlFilter_1.isIgnoredUrl)(fullUrl)) {
                return config;
            }
            const sentTime = Date.now();
            const id = store.addRequest({
                url: fullUrl,
                method: normalizeMethod(config.method),
                headers: safeHeadersToRecord(config.headers),
                body: (0, exports.safeExtractBody)(config.data),
                queryParameters: (0, url_1.normalizeQueryParams)(config.params),
                sentTime,
            });
            if (id) {
                config._requestsInspectorId = id;
                config._requestsInspectorSentTime = sentTime;
            }
        }
        catch {
            // Inspector failures must never affect the app's request
        }
        return config;
    },
    response: (response) => {
        try {
            const config = response?.config;
            const id = config?._requestsInspectorId;
            if (id && networkStore_1.useNetworkStore.getState().isEnabled) {
                const sentTime = config?._requestsInspectorSentTime || Date.now();
                const receivedTime = Date.now();
                networkStore_1.useNetworkStore.getState().updateResponse(id, {
                    statusCode: response.status,
                    headers: safeHeadersToRecord(response.headers),
                    body: (0, exports.safeExtractBody)(response.data),
                    receivedTime,
                    durationMs: receivedTime - sentTime,
                    error: response.status >= 400 ? `HTTP Error ${response.status}` : undefined,
                });
            }
        }
        catch {
            // Ignore
        }
        return response;
    },
    error: (error) => {
        try {
            const config = error?.config;
            const id = config?._requestsInspectorId;
            if (id && networkStore_1.useNetworkStore.getState().isEnabled) {
                const sentTime = config?._requestsInspectorSentTime || Date.now();
                const receivedTime = Date.now();
                networkStore_1.useNetworkStore.getState().updateResponse(id, {
                    statusCode: error.response?.status || 0,
                    headers: safeHeadersToRecord(error.response?.headers),
                    body: (0, exports.safeExtractBody)(error.response?.data),
                    receivedTime,
                    durationMs: receivedTime - sentTime,
                    error: error.message || 'Network Request Failed',
                });
            }
        }
        catch {
            // Ignore
        }
        return Promise.reject(error);
    },
};
const attachRequestsInspector = (axiosInstance) => {
    const customAxios = axiosInstance;
    if (!customAxios || customAxios.__requestsInspectorAttached) {
        return;
    }
    customAxios.__requestsInspectorAttached = true;
    axiosInstance.interceptors.request.use(exports.requestsInspectorAxiosInterceptor.request);
    axiosInstance.interceptors.response.use(exports.requestsInspectorAxiosInterceptor.response, exports.requestsInspectorAxiosInterceptor.error);
};
exports.attachRequestsInspector = attachRequestsInspector;
const requestsInspectorFetch = async (input, init) => {
    // When global logging is on, the patched global fetch records the request exactly once.
    if (getGlobalState().isEnabled) {
        return globalThis.fetch(input, init);
    }
    return runTrackedFetch(globalThis.fetch, input, init, true);
};
exports.requestsInspectorFetch = requestsInspectorFetch;
