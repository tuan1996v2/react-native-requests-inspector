import { useNetworkStore } from './networkStore';
const MAX_STORED_BODY_SIZE = 250 * 1024; // 250 KB limit to prevent OOM on huge payloads
const safeHeadersToRecord = (headers) => {
    if (!headers || typeof headers !== 'object') {
        return {};
    }
    const result = {};
    if ('toJSON' in headers && typeof headers.toJSON === 'function') {
        const json = headers.toJSON();
        Object.entries(json).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                result[k] = String(v);
            }
        });
        return result;
    }
    Object.entries(headers).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
            result[k] = String(v);
        }
    });
    return result;
};
const resolveFullUrl = (baseURL, url) => {
    if (!url) {
        return baseURL || '';
    }
    if (!baseURL || /^https?:\/\//i.test(url)) {
        return url;
    }
    return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
};
const safeExtractBody = (data) => {
    if (data === undefined || data === null) {
        return undefined;
    }
    // Handle FormData in React Native
    if (typeof data === 'object' &&
        data !== null &&
        '_parts' in data &&
        Array.isArray(data._parts)) {
        const parts = data._parts;
        const formDataObj = {};
        parts.forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null && 'uri' in val) {
                const file = val;
                formDataObj[key] = `[File: ${file.name || 'unnamed'} (${file.type || 'unknown'})]`;
            }
            else {
                formDataObj[key] = val;
            }
        });
        return formDataObj;
    }
    if (typeof data === 'string' && data.length > MAX_STORED_BODY_SIZE) {
        return `${data.slice(0, MAX_STORED_BODY_SIZE)}\n\n...[Body truncated: Exceeds 250KB limit]`;
    }
    return data;
};
export const requestsInspectorAxiosInterceptor = {
    request: (config) => {
        const isEnabled = useNetworkStore.getState().isEnabled;
        if (!isEnabled) {
            return config;
        }
        const fullUrl = resolveFullUrl(config.baseURL, config.url);
        const method = (config.method?.toUpperCase() || 'GET');
        const sentTime = Date.now();
        const id = useNetworkStore.getState().addRequest({
            url: fullUrl,
            method,
            headers: safeHeadersToRecord(config.headers),
            body: safeExtractBody(config.data),
            queryParameters: config.params,
            sentTime,
        });
        config._requestsInspectorId = id;
        config._requestsInspectorSentTime = sentTime;
        return config;
    },
    response: (response) => {
        const isEnabled = useNetworkStore.getState().isEnabled;
        const config = response.config;
        const id = config?._requestsInspectorId;
        if (!isEnabled || !id) {
            return response;
        }
        const sentTime = config._requestsInspectorSentTime || Date.now();
        const receivedTime = Date.now();
        const responseDetails = {
            statusCode: response.status,
            headers: safeHeadersToRecord(response.headers),
            body: safeExtractBody(response.data),
            receivedTime,
            durationMs: receivedTime - sentTime,
        };
        useNetworkStore.getState().updateResponse(id, responseDetails);
        return response;
    },
    error: (error) => {
        const isEnabled = useNetworkStore.getState().isEnabled;
        const config = error.config;
        const id = config?._requestsInspectorId;
        if (isEnabled && id) {
            const sentTime = config?._requestsInspectorSentTime || Date.now();
            const receivedTime = Date.now();
            const responseDetails = {
                statusCode: error.response?.status || 0,
                headers: safeHeadersToRecord(error.response?.headers),
                body: safeExtractBody(error.response?.data),
                receivedTime,
                durationMs: receivedTime - sentTime,
                error: error.message || 'Network Request Failed',
            };
            useNetworkStore.getState().updateResponse(id, responseDetails);
        }
        return Promise.reject(error);
    },
};
export const attachRequestsInspector = (axiosInstance) => {
    const customAxios = axiosInstance;
    if (customAxios.__requestsInspectorAttached) {
        return;
    }
    customAxios.__requestsInspectorAttached = true;
    axiosInstance.interceptors.request.use(requestsInspectorAxiosInterceptor.request);
    axiosInstance.interceptors.response.use(requestsInspectorAxiosInterceptor.response, requestsInspectorAxiosInterceptor.error);
};
export const requestsInspectorFetch = async (input, init) => {
    const isEnabled = useNetworkStore.getState().isEnabled;
    if (!isEnabled) {
        return fetch(input, init);
    }
    const url = typeof input === 'string' ? input : input.toString();
    const method = (init?.method?.toUpperCase() || 'GET');
    const sentTime = Date.now();
    const headersRecord = {};
    if (init?.headers) {
        if (init.headers instanceof Headers) {
            init.headers.forEach((val, key) => {
                headersRecord[key] = val;
            });
        }
        else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, val]) => {
                headersRecord[key] = val;
            });
        }
        else {
            Object.entries(init.headers).forEach(([k, v]) => {
                if (v !== undefined) {
                    headersRecord[k] = String(v);
                }
            });
        }
    }
    const id = useNetworkStore.getState().addRequest({
        url,
        method,
        headers: headersRecord,
        body: safeExtractBody(init?.body),
        sentTime,
    });
    try {
        const res = await fetch(input, init);
        const receivedTime = Date.now();
        const responseHeaders = {};
        res.headers.forEach((val, key) => {
            responseHeaders[key] = val;
        });
        let bodyData;
        try {
            const cloned = res.clone();
            const text = await cloned.text();
            try {
                bodyData = JSON.parse(text);
            }
            catch {
                bodyData = text;
            }
        }
        catch {
            bodyData = '[Unable to parse response body]';
        }
        useNetworkStore.getState().updateResponse(id, {
            statusCode: res.status,
            headers: responseHeaders,
            body: safeExtractBody(bodyData),
            receivedTime,
            durationMs: receivedTime - sentTime,
            error: res.ok ? undefined : `HTTP Error ${res.status}`,
        });
        return res;
    }
    catch (err) {
        const receivedTime = Date.now();
        const errorMsg = err instanceof Error ? err.message : 'Fetch Failed';
        useNetworkStore.getState().updateResponse(id, {
            statusCode: 0,
            headers: {},
            receivedTime,
            durationMs: receivedTime - sentTime,
            error: errorMsg,
        });
        throw err;
    }
};
