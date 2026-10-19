import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _requestsInspectorId?: string;
    _requestsInspectorSentTime?: number;
}
export declare const requestsInspectorAxiosInterceptor: {
    request: (config: ExtendedAxiosRequestConfig) => ExtendedAxiosRequestConfig;
    response: (response: AxiosResponse) => AxiosResponse;
    error: (error: AxiosError) => Promise<never>;
};
export declare const attachRequestsInspector: (axiosInstance: AxiosInstance) => void;
export declare const requestsInspectorFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export {};
