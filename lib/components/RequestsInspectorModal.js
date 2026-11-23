"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsInspectorModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const clipboardHelper_1 = require("../clipboardHelper");
const networkStore_1 = require("../networkStore");
const redact_1 = require("../utils/redact");
const responsive_1 = require("../utils/responsive");
const safeArea_1 = require("../utils/safeArea");
const Icons_1 = require("./Icons");
const RequestDetailView_1 = require("./RequestDetailView");
const RequestItem_1 = require("./RequestItem");
const FILTER_ITEMS = [
    { key: 'ALL', label: 'All' },
    { key: 'ERROR', label: 'Errors' },
    { key: 'SUCCESS', label: 'Success' },
    { key: 'POST', label: 'POST' },
    { key: 'GET', label: 'GET' },
    { key: 'PUT', label: 'PUT' },
    { key: 'DELETE', label: 'DELETE' },
];
const ModalContent = () => {
    const logs = (0, networkStore_1.useNetworkStore)(state => state.logs);
    const selectedLogId = (0, networkStore_1.useNetworkStore)(state => state.selectedLogId);
    const setSelectedLogId = (0, networkStore_1.useNetworkStore)(state => state.setSelectedLogId);
    const filter = (0, networkStore_1.useNetworkStore)(state => state.filter);
    const setFilter = (0, networkStore_1.useNetworkStore)(state => state.setFilter);
    const searchQuery = (0, networkStore_1.useNetworkStore)(state => state.searchQuery);
    const setSearchQuery = (0, networkStore_1.useNetworkStore)(state => state.setSearchQuery);
    const clearLogs = (0, networkStore_1.useNetworkStore)(state => state.clearLogs);
    const setVisible = (0, networkStore_1.useNetworkStore)(state => state.setModalVisible);
    const isPaused = (0, networkStore_1.useNetworkStore)(state => state.isPaused);
    const togglePause = (0, networkStore_1.useNetworkStore)(state => state.togglePause);
    const redactKeys = (0, networkStore_1.useNetworkStore)(state => state.redactKeys);
    const responseFormatter = (0, networkStore_1.useNetworkStore)(state => state.responseFormatter);
    const insets = (0, safeArea_1.useSafeDeviceInsets)();
    const safeContainerStyle = (0, react_1.useMemo)(() => ({
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
    }), [insets]);
    const selectedLog = (0, react_1.useMemo)(() => logs.find(item => item.id === selectedLogId), [logs, selectedLogId]);
    const errorCount = (0, react_1.useMemo)(() => logs.filter(item => item.status === 'error').length, [logs]);
    const successCount = (0, react_1.useMemo)(() => logs.filter(item => item.status === 'success').length, [logs]);
    // Smart Search & Multi-criteria filter
    const filteredLogs = (0, react_1.useMemo)(() => {
        let result = logs;
        if (filter === 'ERROR') {
            result = result.filter(item => item.status === 'error');
        }
        else if (filter === 'SUCCESS') {
            result = result.filter(item => item.status === 'success');
        }
        else if (filter === 'GET' || filter === 'POST' || filter === 'PUT' || filter === 'DELETE') {
            result = result.filter(item => item.method === filter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(item => {
                const urlMatch = item.url.toLowerCase().includes(q);
                const methodMatch = item.method.toLowerCase().includes(q);
                const statusMatch = String(item.response?.statusCode ?? '').includes(q);
                const errorMatch = item.response?.error?.toLowerCase().includes(q) ?? false;
                return urlMatch || methodMatch || statusMatch || errorMatch;
            });
        }
        return result;
    }, [logs, filter, searchQuery]);
    const handleCopyLatestToken = (0, react_1.useCallback)(async () => {
        for (const rawLog of logs) {
            const log = (0, redact_1.formatAndRedactLog)(rawLog, redactKeys);
            const token = (0, clipboardHelper_1.extractAuthToken)(log.headers) || (0, clipboardHelper_1.extractAuthToken)(log.response?.headers);
            if (token) {
                const success = await (0, clipboardHelper_1.copyToClipboard)(token);
                if (success) {
                    react_native_1.Alert.alert('Token Copied', 'Latest Authorization token copied to clipboard!');
                    return;
                }
            }
        }
        react_native_1.Alert.alert('No Token Found', 'No authorization header detected in recorded requests.');
    }, [logs, redactKeys]);
    const handleExportLogs = (0, react_1.useCallback)(async () => {
        if (logs.length === 0) {
            react_native_1.Alert.alert('No Logs', 'There are no recorded requests to export.');
            return;
        }
        const exportData = logs.map(rawLog => {
            const log = (0, redact_1.formatAndRedactLog)(rawLog, redactKeys, responseFormatter);
            return {
                id: log.id,
                method: log.method,
                url: log.url,
                status: log.response?.statusCode ?? (log.status === 'pending' ? 'PENDING' : 'ERROR'),
                durationMs: log.response?.durationMs,
                sentTime: new Date(log.sentTime).toISOString(),
                headers: log.headers,
                body: log.body,
                responseHeaders: log.response?.headers,
                responseBody: log.response?.body,
                error: log.response?.error,
            };
        });
        const jsonString = JSON.stringify(exportData, null, 2);
        const success = await (0, clipboardHelper_1.copyToClipboard)(jsonString);
        if (success) {
            react_native_1.Alert.alert('Logs Exported', `Successfully exported ${logs.length} request logs and copied JSON dump to clipboard!`);
        }
    }, [logs, redactKeys, responseFormatter]);
    const handleClose = (0, react_1.useCallback)(() => {
        setSelectedLogId(null);
        setVisible(false);
    }, [setSelectedLogId, setVisible]);
    const renderItem = (0, react_1.useCallback)(({ item }) => ((0, jsx_runtime_1.jsx)(RequestItem_1.RequestItem, { log: item, onPress: log => setSelectedLogId(log.id) })), [setSelectedLogId]);
    const keyExtractor = (0, react_1.useCallback)((item) => item.id, []);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.safeArea, safeContainerStyle], children: [(0, jsx_runtime_1.jsx)(react_native_1.StatusBar, { barStyle: "light-content" }), selectedLog ? ((0, jsx_runtime_1.jsx)(RequestDetailView_1.RequestDetailView, { log: selectedLog, onBack: () => setSelectedLogId(null) })) : ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.topBar, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.titleGroup, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.titleRow, children: [(0, jsx_runtime_1.jsx)(Icons_1.NetworkIcon, { color: "#60A5FA", size: (0, responsive_1.s)(18) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.appTitle, children: "Network Inspector" })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: isPaused ? styles.subTitlePaused : styles.subTitle, children: isPaused
                                            ? `PAUSED • ${logs.length} requests`
                                            : `${logs.length} ${logs.length === 1 ? 'request' : 'requests'}` })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.topControls, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 8, bottom: 8, left: 6, right: 6 }, onPress: togglePause, style: [
                                            styles.pauseControlButton,
                                            isPaused ? styles.pauseActive : styles.pauseInactive,
                                        ], children: [isPaused ? ((0, jsx_runtime_1.jsx)(Icons_1.PlayIcon, { color: "#10B981", size: (0, responsive_1.s)(11) })) : ((0, jsx_runtime_1.jsx)(Icons_1.PauseIcon, { color: "#A1A1AA", size: (0, responsive_1.s)(11) })), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                    styles.pauseControlText,
                                                    isPaused ? styles.pauseTextActive : styles.pauseTextInactive,
                                                ], children: isPaused ? 'Resume' : 'Pause' })] }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }, onPress: handleClose, style: styles.closeButton, children: (0, jsx_runtime_1.jsx)(Icons_1.CloseIcon, { color: "#A1A1AA", size: (0, responsive_1.s)(15) }) })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.actionBar, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 6, bottom: 6, left: 4, right: 4 }, onPress: handleExportLogs, style: styles.actionBtnExport, children: [(0, jsx_runtime_1.jsx)(Icons_1.ShareIcon, { color: "#60A5FA", size: (0, responsive_1.s)(13) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.actionTextExport, children: "Export" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 6, bottom: 6, left: 4, right: 4 }, onPress: handleCopyLatestToken, style: styles.actionBtnToken, children: [(0, jsx_runtime_1.jsx)(Icons_1.KeyIcon, { color: "#FBBF24", size: (0, responsive_1.s)(13) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.actionTextToken, children: "Token" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 6, bottom: 6, left: 4, right: 4 }, onPress: clearLogs, style: styles.actionBtnClear, children: [(0, jsx_runtime_1.jsx)(Icons_1.TrashIcon, { color: "#EF4444", size: (0, responsive_1.s)(13) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.actionTextClear, children: "Clear" })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.searchContainer, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.searchBox, children: [(0, jsx_runtime_1.jsx)(Icons_1.SearchIcon, { color: "#71717A", size: (0, responsive_1.s)(15) }), (0, jsx_runtime_1.jsx)(react_native_1.TextInput, { autoCapitalize: "none", autoCorrect: false, onChangeText: setSearchQuery, placeholder: "Search URL, method, status (e.g. 404, /auth)...", placeholderTextColor: "#71717A", style: styles.searchInput, value: searchQuery }), searchQuery.length > 0 ? ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 12, bottom: 12, left: 12, right: 12 }, onPress: () => setSearchQuery(''), style: styles.searchClearBtn, children: (0, jsx_runtime_1.jsx)(Icons_1.CloseIcon, { color: "#9CA3AF", size: (0, responsive_1.s)(12) }) })) : null] }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.filterWrapper, children: (0, jsx_runtime_1.jsx)(react_native_1.ScrollView, { contentContainerStyle: styles.filterScroll, horizontal: true, keyboardShouldPersistTaps: "handled", showsHorizontalScrollIndicator: false, children: FILTER_ITEMS.map(item => {
                                const isActive = filter === item.key;
                                let badgeText = item.label;
                                if (item.key === 'ALL') {
                                    badgeText = `All (${logs.length})`;
                                }
                                else if (item.key === 'ERROR') {
                                    badgeText = `Errors (${errorCount})`;
                                }
                                else if (item.key === 'SUCCESS') {
                                    badgeText = `Success (${successCount})`;
                                }
                                return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 6, bottom: 6, left: 4, right: 4 }, onPress: () => setFilter(item.key), style: [
                                        styles.filterChip,
                                        isActive && styles.filterChipActive,
                                        item.key === 'ERROR' && isActive && styles.filterChipErrorActive,
                                        item.key === 'SUCCESS' && isActive && styles.filterChipSuccessActive,
                                    ], children: [item.key === 'ERROR' ? ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.filterDot, styles.filterDotError] })) : null, item.key === 'SUCCESS' ? ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.filterDot, styles.filterDotSuccess] })) : null, (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                styles.filterChipText,
                                                isActive && styles.filterChipTextActive,
                                                item.key === 'ERROR' && isActive && styles.filterChipTextErrorActive,
                                                item.key === 'SUCCESS' && isActive && styles.filterChipTextSuccessActive,
                                            ], children: badgeText })] }, item.key));
                            }) }) }), (0, jsx_runtime_1.jsx)(react_native_1.FlatList, { contentContainerStyle: styles.listContent, data: filteredLogs, initialNumToRender: 10, keyExtractor: keyExtractor, keyboardDismissMode: "on-drag", keyboardShouldPersistTaps: "handled", ListEmptyComponent: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.emptyContainer, children: [(0, jsx_runtime_1.jsx)(Icons_1.EmptyBoxIcon, { color: "#3F3F46", size: (0, responsive_1.s)(48) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyTitle, children: "No Requests Recorded" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptySub, children: searchQuery
                                        ? 'No requests match your search criteria.'
                                        : 'Trigger an API call from the app to inspect live network traffic.' })] }), maxToRenderPerBatch: 10, renderItem: renderItem, windowSize: 5 })] }))] }));
};
const RequestsInspectorModal = () => {
    const isVisible = (0, networkStore_1.useNetworkStore)(state => state.isModalVisible);
    const setVisible = (0, networkStore_1.useNetworkStore)(state => state.setModalVisible);
    const selectedLogId = (0, networkStore_1.useNetworkStore)(state => state.selectedLogId);
    const setSelectedLogId = (0, networkStore_1.useNetworkStore)(state => state.setSelectedLogId);
    // Fix Android hardware back button: Detail -> List -> Close Modal
    const handleHardwareBack = (0, react_1.useCallback)(() => {
        if (selectedLogId) {
            setSelectedLogId(null);
        }
        else {
            setVisible(false);
        }
    }, [selectedLogId, setSelectedLogId, setVisible]);
    if (!isVisible) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(react_native_1.Modal, { animationType: "slide", hardwareAccelerated: true, onRequestClose: handleHardwareBack, statusBarTranslucent: true, visible: isVisible, children: (0, jsx_runtime_1.jsx)(ModalContent, {}) }));
};
exports.RequestsInspectorModal = RequestsInspectorModal;
const styles = react_native_1.StyleSheet.create({
    actionBar: {
        flexDirection: 'row',
        marginBottom: (0, responsive_1.vs)(10),
        paddingHorizontal: (0, responsive_1.s)(12),
    },
    actionBtnClear: {
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: '#EF4444',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: (0, responsive_1.s)(4),
        paddingVertical: (0, responsive_1.vs)(7),
    },
    actionBtnExport: {
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderColor: '#3B82F6',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginRight: (0, responsive_1.s)(4),
        paddingVertical: (0, responsive_1.vs)(7),
    },
    actionBtnToken: {
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        borderColor: '#F59E0B',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: (0, responsive_1.s)(4),
        paddingVertical: (0, responsive_1.vs)(7),
    },
    actionTextClear: {
        color: '#EF4444',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(5),
    },
    actionTextExport: {
        color: '#60A5FA',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(5),
    },
    actionTextToken: {
        color: '#FBBF24',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(5),
    },
    appTitle: {
        color: '#F4F4F5',
        fontSize: (0, responsive_1.fs)(15),
        fontWeight: '700',
        marginLeft: (0, responsive_1.s)(6),
    },
    closeButton: {
        alignItems: 'center',
        backgroundColor: '#27272A',
        borderRadius: (0, responsive_1.ms)(8),
        height: (0, responsive_1.s)(32),
        justifyContent: 'center',
        width: (0, responsive_1.s)(32),
    },
    container: {
        backgroundColor: '#121212',
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: (0, responsive_1.vs)(60),
        paddingHorizontal: (0, responsive_1.s)(32),
    },
    emptySub: {
        color: '#71717A',
        fontSize: (0, responsive_1.fs)(13),
        lineHeight: (0, responsive_1.vs)(18),
        textAlign: 'center',
    },
    emptyTitle: {
        color: '#E4E4E7',
        fontSize: (0, responsive_1.fs)(16),
        fontWeight: '600',
        marginBottom: (0, responsive_1.vs)(6),
        marginTop: (0, responsive_1.vs)(12),
    },
    filterChip: {
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderColor: '#2A2A2A',
        borderRadius: (0, responsive_1.ms)(16),
        borderWidth: 1,
        flexDirection: 'row',
        marginRight: (0, responsive_1.s)(8),
        paddingHorizontal: (0, responsive_1.s)(13),
        paddingVertical: (0, responsive_1.vs)(7),
    },
    filterChipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#3B82F6',
    },
    filterChipErrorActive: {
        backgroundColor: '#991B1B',
        borderColor: '#EF4444',
    },
    filterChipSuccessActive: {
        backgroundColor: '#065F46',
        borderColor: '#10B981',
    },
    filterChipText: {
        color: '#A1A1AA',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    filterChipTextErrorActive: {
        color: '#FEE2E2',
    },
    filterChipTextSuccessActive: {
        color: '#D1FAE5',
    },
    filterDot: {
        borderRadius: (0, responsive_1.s)(3.5),
        height: (0, responsive_1.s)(7),
        marginRight: (0, responsive_1.s)(6),
        width: (0, responsive_1.s)(7),
    },
    filterDotError: {
        backgroundColor: '#EF4444',
    },
    filterDotSuccess: {
        backgroundColor: '#10B981',
    },
    filterScroll: {
        paddingHorizontal: (0, responsive_1.s)(12),
    },
    filterWrapper: {
        marginBottom: (0, responsive_1.vs)(10),
    },
    listContent: {
        paddingBottom: (0, responsive_1.vs)(24),
    },
    pauseActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#10B981',
    },
    pauseControlButton: {
        alignItems: 'center',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        flexDirection: 'row',
        marginRight: (0, responsive_1.s)(8),
        paddingHorizontal: (0, responsive_1.s)(9),
        paddingVertical: (0, responsive_1.vs)(6),
    },
    pauseInactive: {
        backgroundColor: '#27272A',
        borderColor: '#3F3F46',
    },
    pauseControlText: {
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(4),
    },
    pauseTextActive: {
        color: '#34D399',
    },
    pauseTextInactive: {
        color: '#D4D4D8',
    },
    safeArea: {
        backgroundColor: '#121212',
        flex: 1,
    },
    searchBox: {
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderColor: '#2A2A2A',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: (0, responsive_1.s)(10),
    },
    searchClearBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: (0, responsive_1.s)(4),
    },
    searchContainer: {
        marginBottom: (0, responsive_1.vs)(10),
        paddingHorizontal: (0, responsive_1.s)(12),
    },
    searchInput: {
        color: '#F4F4F5',
        flex: 1,
        fontSize: (0, responsive_1.fs)(13),
        marginLeft: (0, responsive_1.s)(8),
        paddingVertical: (0, responsive_1.vs)(8),
    },
    subTitle: {
        color: '#71717A',
        fontSize: (0, responsive_1.fs)(11),
        marginTop: (0, responsive_1.vs)(2),
    },
    subTitlePaused: {
        color: '#FBBF24',
        fontSize: (0, responsive_1.fs)(11),
        fontWeight: '600',
        marginTop: (0, responsive_1.vs)(2),
    },
    titleGroup: {
        flex: 1,
    },
    titleRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    topBar: {
        alignItems: 'center',
        borderBottomColor: '#27272A',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: (0, responsive_1.vs)(10),
        paddingHorizontal: (0, responsive_1.s)(12),
        paddingVertical: (0, responsive_1.vs)(10),
    },
    topControls: {
        alignItems: 'center',
        flexDirection: 'row',
    },
});
