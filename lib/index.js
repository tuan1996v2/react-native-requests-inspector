import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingButton } from './components/FloatingButton';
import { RequestsInspectorModal } from './components/RequestsInspectorModal';
import { useNetworkStore } from './networkStore';
export const RequestsInspector = ({ children, enabled = true }) => {
    const setEnabled = useNetworkStore(state => state.setEnabled);
    useEffect(() => {
        setEnabled(enabled);
    }, [enabled, setEnabled]);
    if (!enabled) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(SafeAreaProvider, { children: _jsxs(View, { style: styles.container, children: [children, _jsx(FloatingButton, {}), _jsx(RequestsInspectorModal, {})] }) }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
export { copyToClipboard, extractAuthToken } from './clipboardHelper';
export { generateCurlCommand } from './curlHelper';
export { attachRequestsInspector, requestsInspectorAxiosInterceptor, requestsInspectorFetch, } from './interceptor';
export { useNetworkStore } from './networkStore';
export * from './types';
export { useSafeDeviceInsets } from './utils/safeArea';
