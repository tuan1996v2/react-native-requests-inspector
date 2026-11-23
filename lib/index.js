"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSafeDeviceInsets = exports.useNetworkStore = exports.requestsInspectorFetch = exports.requestsInspectorAxiosInterceptor = exports.isGlobalNetworkLoggingEnabled = exports.enableGlobalNetworkLogging = exports.disableGlobalNetworkLogging = exports.attachRequestsInspector = exports.generateCurlCommand = exports.extractAuthToken = exports.copyToClipboard = exports.configureRequestsInspector = exports.clearLogs = exports.hideInspector = exports.showInspector = exports.RequestsInspector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const FloatingButton_1 = require("./components/FloatingButton");
const RequestsInspectorModal_1 = require("./components/RequestsInspectorModal");
const interceptor_1 = require("./interceptor");
const networkStore_1 = require("./networkStore");
const RequestsInspector = ({ children, enabled = true, showFloatingButton = true, interceptGlobalNetwork = false, redactKeys, responseFormatter, ignoreUrls, maxLogs, }) => {
    (0, react_1.useEffect)(() => {
        networkStore_1.useNetworkStore.getState().setEnabled(enabled);
    }, [enabled]);
    (0, react_1.useEffect)(() => {
        networkStore_1.useNetworkStore.getState().setShowFloatingButton(showFloatingButton);
    }, [showFloatingButton]);
    // The store compares by content, so inline arrays (`redactKeys={['password']}`) cause no churn
    (0, react_1.useEffect)(() => {
        networkStore_1.useNetworkStore.getState().setConfig({ redactKeys, responseFormatter, ignoreUrls, maxLogs });
    }, [redactKeys, responseFormatter, ignoreUrls, maxLogs]);
    (0, react_1.useEffect)(() => {
        if (!enabled || !interceptGlobalNetwork) {
            return undefined;
        }
        // Don't tear down a global logger the app enabled itself (e.g. in index.js)
        const ownedByApp = (0, interceptor_1.isGlobalNetworkLoggingEnabled)();
        (0, interceptor_1.enableGlobalNetworkLogging)();
        return () => {
            if (!ownedByApp) {
                (0, interceptor_1.disableGlobalNetworkLogging)();
            }
        };
    }, [enabled, interceptGlobalNetwork]);
    // {children} keeps the same position in the tree whatever `enabled` is, so toggling it
    // never remounts the app; the overlay is mounted as a sibling only when enabled.
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [children, enabled ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showFloatingButton ? (0, jsx_runtime_1.jsx)(FloatingButton_1.FloatingButton, {}) : null, (0, jsx_runtime_1.jsx)(RequestsInspectorModal_1.RequestsInspectorModal, {})] })) : null] }));
};
exports.RequestsInspector = RequestsInspector;
const showInspector = () => {
    networkStore_1.useNetworkStore.getState().setModalVisible(true);
};
exports.showInspector = showInspector;
const hideInspector = () => {
    networkStore_1.useNetworkStore.getState().setSelectedLogId(null);
    networkStore_1.useNetworkStore.getState().setModalVisible(false);
};
exports.hideInspector = hideInspector;
const clearLogs = () => {
    networkStore_1.useNetworkStore.getState().clearLogs();
};
exports.clearLogs = clearLogs;
/** Imperative config (partial merge), e.g. before <RequestsInspector> mounts. */
const configureRequestsInspector = (config) => {
    networkStore_1.useNetworkStore.getState().setConfig(config);
};
exports.configureRequestsInspector = configureRequestsInspector;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
});
var clipboardHelper_1 = require("./clipboardHelper");
Object.defineProperty(exports, "copyToClipboard", { enumerable: true, get: function () { return clipboardHelper_1.copyToClipboard; } });
Object.defineProperty(exports, "extractAuthToken", { enumerable: true, get: function () { return clipboardHelper_1.extractAuthToken; } });
var curlHelper_1 = require("./curlHelper");
Object.defineProperty(exports, "generateCurlCommand", { enumerable: true, get: function () { return curlHelper_1.generateCurlCommand; } });
var interceptor_2 = require("./interceptor");
Object.defineProperty(exports, "attachRequestsInspector", { enumerable: true, get: function () { return interceptor_2.attachRequestsInspector; } });
Object.defineProperty(exports, "disableGlobalNetworkLogging", { enumerable: true, get: function () { return interceptor_2.disableGlobalNetworkLogging; } });
Object.defineProperty(exports, "enableGlobalNetworkLogging", { enumerable: true, get: function () { return interceptor_2.enableGlobalNetworkLogging; } });
Object.defineProperty(exports, "isGlobalNetworkLoggingEnabled", { enumerable: true, get: function () { return interceptor_2.isGlobalNetworkLoggingEnabled; } });
Object.defineProperty(exports, "requestsInspectorAxiosInterceptor", { enumerable: true, get: function () { return interceptor_2.requestsInspectorAxiosInterceptor; } });
Object.defineProperty(exports, "requestsInspectorFetch", { enumerable: true, get: function () { return interceptor_2.requestsInspectorFetch; } });
var networkStore_2 = require("./networkStore");
Object.defineProperty(exports, "useNetworkStore", { enumerable: true, get: function () { return networkStore_2.useNetworkStore; } });
__exportStar(require("./types"), exports);
var safeArea_1 = require("./utils/safeArea");
Object.defineProperty(exports, "useSafeDeviceInsets", { enumerable: true, get: function () { return safeArea_1.useSafeDeviceInsets; } });
