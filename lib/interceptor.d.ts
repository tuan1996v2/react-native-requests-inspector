export interface AxiosLikeRequestConfig {
    baseURL?: string;
    url?: string;
    method?: string;
    headers?: unknown;
    data?: unknown;
    params?: unknown;
    _requestsInspectorId?: string;
    _requestsInspectorSentTime?: number;
}
export interface AxiosLikeResponse {
    config?: AxiosLikeRequestConfig;
    status: number;
    headers?: unknown;
    data?: unknown;
}
export interface AxiosLikeError {
    config?: AxiosLikeRequestConfig;
    response?: AxiosLikeResponse;
    message?: string;
}
export interface AxiosLikeInterceptorManager<T> {
    use(onFulfilled?: ((value: T) => T | Promise<T>) | null, onRejected?: ((error: AxiosLikeError) => unknown) | null): number;
}
export interface AxiosLikeInstance {
    interceptors: {
        request: AxiosLikeInterceptorManager<AxiosLikeRequestConfig>;
        response: AxiosLikeInterceptorManager<AxiosLikeResponse>;
    };
}
/**
 * Converts any request/response payload into a memory-safe, JSON-serializable value.
 * Strings stay raw (JSON is parsed lazily by the UI), binary data is summarized,
 * objects are copied with circular protection and truncated at ~250KB.
 */
export declare const safeExtractBody: (data: unknown) => unknown;
export declare const isGlobalNetworkLoggingEnabled: () => boolean;
/**
 * Records every request made through XMLHttpRequest (axios, apisauce, superagent...) and
 * global fetch, regardless of how many axios instances exist or what their interceptors do.
 * Idempotent and safe across Fast Refresh. Uses only public globals (no RN private modules).
 */
export declare const enableGlobalNetworkLogging: () => void;
export declare const disableGlobalNetworkLogging: () => void;
export declare const requestsInspectorAxiosInterceptor: {
    request: <T extends AxiosLikeRequestConfig>(config: T) => T;
    response: <T extends AxiosLikeResponse>(response: T) => T;
    error: (error: AxiosLikeError) => Promise<never>;
};
export declare const attachRequestsInspector: (axiosInstance: AxiosLikeInstance) => void;
export declare const requestsInspectorFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
