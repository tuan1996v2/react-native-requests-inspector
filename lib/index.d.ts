import { FC } from 'react';
import { RequestsInspectorConfig, RequestsInspectorProps } from './types';
export declare const RequestsInspector: FC<RequestsInspectorProps>;
export declare const showInspector: () => void;
export declare const hideInspector: () => void;
export declare const clearLogs: () => void;
/** Imperative config (partial merge), e.g. before <RequestsInspector> mounts. */
export declare const configureRequestsInspector: (config: RequestsInspectorConfig) => void;
export { copyToClipboard, extractAuthToken } from './clipboardHelper';
export { generateCurlCommand } from './curlHelper';
export type { AxiosLikeError, AxiosLikeInstance, AxiosLikeRequestConfig, AxiosLikeResponse, } from './interceptor';
export { attachRequestsInspector, disableGlobalNetworkLogging, enableGlobalNetworkLogging, isGlobalNetworkLoggingEnabled, requestsInspectorAxiosInterceptor, requestsInspectorFetch, } from './interceptor';
export { useNetworkStore } from './networkStore';
export * from './types';
export { useSafeDeviceInsets } from './utils/safeArea';
