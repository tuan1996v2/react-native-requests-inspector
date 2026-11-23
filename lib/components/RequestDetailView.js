"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestDetailView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const clipboardHelper_1 = require("../clipboardHelper");
const curlHelper_1 = require("../curlHelper");
const networkStore_1 = require("../networkStore");
const redact_1 = require("../utils/redact");
const responsive_1 = require("../utils/responsive");
const url_1 = require("../utils/url");
const Icons_1 = require("./Icons");
// A single <Text> with hundreds of KB freezes layout (notably on Android). Show a preview only;
// copy actions still use the full content.
const MAX_DISPLAY_CHARS = 50 * 1024;
const safeFormatJson = (data) => {
    if (data === undefined || data === null || data === '') {
        return 'Empty';
    }
    const parsed = (0, redact_1.tryParseJson)(data);
    if (typeof parsed === 'string') {
        return parsed;
    }
    try {
        return JSON.stringify(parsed, null, 2);
    }
    catch {
        return String(parsed);
    }
};
const ClippedText = ({ text, style }) => {
    const isClipped = text.length > MAX_DISPLAY_CHARS;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { selectable: true, style: style, children: isClipped ? text.slice(0, MAX_DISPLAY_CHARS) : text }), isClipped ? ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.clippedNotice, children: `… Preview limited to ${Math.round(MAX_DISPLAY_CHARS / 1024)}KB of ${Math.round(text.length / 1024)}KB. Use Copy to get the full content.` })) : null] }));
};
const RequestDetailView = ({ log, onBack }) => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('RESPONSE');
    const redactKeys = (0, networkStore_1.useNetworkStore)(state => state.redactKeys);
    const responseFormatter = (0, networkStore_1.useNetworkStore)(state => state.responseFormatter);
    const displayLog = (0, react_1.useMemo)(() => (0, redact_1.formatAndRedactLog)(log, redactKeys, responseFormatter), [log, redactKeys, responseFormatter]);
    const curlCommand = (0, react_1.useMemo)(() => (0, curlHelper_1.generateCurlCommand)(displayLog), [displayLog]);
    const authToken = (0, react_1.useMemo)(() => (0, clipboardHelper_1.extractAuthToken)(displayLog.headers) || (0, clipboardHelper_1.extractAuthToken)(displayLog.response?.headers), [displayLog.headers, displayLog.response?.headers]);
    const handleCopyCurl = (0, react_1.useCallback)(async () => {
        const success = await (0, clipboardHelper_1.copyToClipboard)(curlCommand);
        if (success) {
            react_native_1.Alert.alert('Copied', 'cURL command copied to clipboard!');
        }
    }, [curlCommand]);
    const handleCopyToken = (0, react_1.useCallback)(async () => {
        if (!authToken) {
            return;
        }
        const success = await (0, clipboardHelper_1.copyToClipboard)(authToken);
        if (success) {
            react_native_1.Alert.alert('Token Copied', 'Clean Authorization token copied to clipboard!');
        }
    }, [authToken]);
    const handleCopyText = (0, react_1.useCallback)(async (text, label) => {
        const success = await (0, clipboardHelper_1.copyToClipboard)(text);
        if (success) {
            react_native_1.Alert.alert('Copied', `${label} copied to clipboard!`);
        }
    }, []);
    const formattedRequestBody = (0, react_1.useMemo)(() => safeFormatJson(displayLog.body), [displayLog.body]);
    const formattedResponseBody = (0, react_1.useMemo)(() => safeFormatJson(displayLog.response?.body), [displayLog.response?.body]);
    // Global XHR/fetch logs carry params inside the URL; derive them lazily for display only
    const queryParams = (0, react_1.useMemo)(() => displayLog.queryParameters && Object.keys(displayLog.queryParameters).length > 0
        ? displayLog.queryParameters
        : (0, url_1.parseQueryParams)(displayLog.url), [displayLog.queryParameters, displayLog.url]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.header, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 12, bottom: 12, left: 10, right: 10 }, onPress: onBack, style: styles.backButton, children: [(0, jsx_runtime_1.jsx)(Icons_1.ChevronLeftIcon, { color: "#3B82F6", size: (0, responsive_1.s)(16) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.backButtonText, children: "Back" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.headerActions, children: [authToken ? ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 8, bottom: 8, left: 4, right: 4 }, onPress: handleCopyToken, style: styles.tokenButton, children: [(0, jsx_runtime_1.jsx)(Icons_1.KeyIcon, { color: "#FBBF24", size: (0, responsive_1.s)(12) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.tokenButtonText, children: "Token" })] })) : null, (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 8, bottom: 8, left: 4, right: 4 }, onPress: handleCopyCurl, style: styles.headerActionButton, children: [(0, jsx_runtime_1.jsx)(Icons_1.CopyIcon, { color: "#60A5FA", size: (0, responsive_1.s)(12) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.headerActionText, children: "cURL" })] })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.urlBanner, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.urlRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.methodPill, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.methodPillText, children: displayLog.method }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { numberOfLines: 2, style: styles.urlText, children: displayLog.url })] }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tabBar, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.8, onPress: () => setActiveTab('REQUEST'), style: [styles.tabItem, activeTab === 'REQUEST' && styles.tabItemActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabItemText, activeTab === 'REQUEST' && styles.tabItemTextActive], children: "Request" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.8, onPress: () => setActiveTab('RESPONSE'), style: [styles.tabItem, activeTab === 'RESPONSE' && styles.tabItemActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabItemText, activeTab === 'RESPONSE' && styles.tabItemTextActive], children: "Response" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.8, onPress: () => setActiveTab('CURL'), style: [styles.tabItem, activeTab === 'CURL' && styles.tabItemActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabItemText, activeTab === 'CURL' && styles.tabItemTextActive], children: "cURL" }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { contentContainerStyle: styles.scrollContent, style: styles.contentScroll, children: [activeTab === 'REQUEST' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.sectionHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Request Headers" }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: displayLog.headers && Object.keys(displayLog.headers).length > 0 ? (Object.entries(displayLog.headers).map(([k, v]) => ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(`${k}: ${v}`, 'Header'), style: styles.keyValueRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.keyText, children: [k, ":"] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.valText, children: String(v) })] }, k)))) : ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyText, children: "No request headers" })) }), queryParams && Object.keys(queryParams).length > 0 ? ((0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.sectionHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Query Parameters" }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: Object.entries(queryParams).map(([k, v]) => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.keyValueRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.keyText, children: [k, ":"] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.valText, children: String(v) })] }, k))) })] })) : null, (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sectionHeaderWithAction, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Request Body" }), formattedRequestBody !== 'Empty' ? ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(formattedRequestBody, 'Request Body'), style: styles.copySmallButton, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.copySmallButtonText, children: "Copy Body" }) })) : null] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: (0, jsx_runtime_1.jsx)(ClippedText, { style: styles.codeText, text: formattedRequestBody }) })] })), activeTab === 'RESPONSE' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.statusBanner, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.statusBadgeRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.statusLabel, children: "Status:" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.statusVal, children: displayLog.response?.statusCode ??
                                                    (displayLog.status === 'pending' ? 'Pending' : 'Error') })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.statusBadgeRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.statusLabel, children: "Duration:" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.statusVal, children: displayLog.response?.durationMs !== undefined
                                                    ? `${displayLog.response.durationMs} ms`
                                                    : '...' })] })] }), displayLog.response?.error ? ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.errorBanner, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.errorBannerTitle, children: "Error Details" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.errorBannerText, children: displayLog.response.error })] })) : null, (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.sectionHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Response Headers" }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: displayLog.response?.headers &&
                                    Object.keys(displayLog.response.headers).length > 0 ? (Object.entries(displayLog.response.headers).map(([k, v]) => ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(`${k}: ${v}`, 'Response Header'), style: styles.keyValueRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.keyText, children: [k, ":"] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.valText, children: String(v) })] }, k)))) : ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyText, children: "No response headers" })) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.sectionHeaderWithAction, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "Response Body" }), formattedResponseBody !== 'Empty' ? ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(formattedResponseBody, 'Response Body'), style: styles.copySmallButton, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.copySmallButtonText, children: "Copy Body" }) })) : null] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.card, children: (0, jsx_runtime_1.jsx)(ClippedText, { style: styles.codeText, text: formattedResponseBody }) })] })), activeTab === 'CURL' && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.sectionHeader, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.sectionTitle, children: "cURL Command" }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.codeBox, children: (0, jsx_runtime_1.jsx)(ClippedText, { style: styles.curlText, text: curlCommand }) }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.8, onPress: handleCopyCurl, style: styles.copyCurlButton, children: [(0, jsx_runtime_1.jsx)(Icons_1.CopyIcon, { color: "#FFFFFF", size: (0, responsive_1.s)(14) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.copyCurlButtonText, children: "Copy cURL to Clipboard" })] })] }))] })] }));
};
exports.RequestDetailView = RequestDetailView;
const styles = react_native_1.StyleSheet.create({
    backButton: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: (0, responsive_1.s)(8),
        paddingVertical: (0, responsive_1.vs)(6),
    },
    backButtonText: {
        color: '#3B82F6',
        fontSize: (0, responsive_1.fs)(15),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(4),
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderColor: '#2A2A2A',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        marginBottom: (0, responsive_1.vs)(12),
        padding: (0, responsive_1.ms)(12),
    },
    clippedNotice: {
        color: '#FBBF24',
        fontSize: (0, responsive_1.fs)(11),
        fontStyle: 'italic',
        marginTop: (0, responsive_1.vs)(8),
    },
    codeBox: {
        backgroundColor: '#18181B',
        borderColor: '#27272A',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        marginBottom: (0, responsive_1.vs)(16),
        padding: (0, responsive_1.ms)(14),
    },
    codeText: {
        color: '#A1A1AA',
        fontFamily: 'Courier',
        fontSize: (0, responsive_1.fs)(12),
        lineHeight: (0, responsive_1.vs)(18),
    },
    contentScroll: {
        flex: 1,
    },
    copyCurlButton: {
        alignItems: 'center',
        backgroundColor: '#2563EB',
        borderRadius: (0, responsive_1.ms)(8),
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: (0, responsive_1.vs)(12),
    },
    copyCurlButtonText: {
        color: '#FFFFFF',
        fontSize: (0, responsive_1.fs)(14),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(6),
    },
    copySmallButton: {
        backgroundColor: '#374151',
        borderRadius: (0, responsive_1.ms)(4),
        paddingHorizontal: (0, responsive_1.s)(8),
        paddingVertical: (0, responsive_1.vs)(3),
    },
    copySmallButtonText: {
        color: '#D1D5DB',
        fontSize: (0, responsive_1.fs)(11),
        fontWeight: '500',
    },
    curlText: {
        color: '#60A5FA',
        fontFamily: 'Courier',
        fontSize: (0, responsive_1.fs)(12),
        lineHeight: (0, responsive_1.vs)(19),
    },
    container: {
        backgroundColor: '#121212',
        flex: 1,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: (0, responsive_1.fs)(12),
        fontStyle: 'italic',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: '#EF4444',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        marginBottom: (0, responsive_1.vs)(12),
        padding: (0, responsive_1.ms)(10),
    },
    errorBannerText: {
        color: '#FCA5A5',
        fontSize: (0, responsive_1.fs)(12),
    },
    errorBannerTitle: {
        color: '#EF4444',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '700',
        marginBottom: (0, responsive_1.vs)(2),
    },
    header: {
        alignItems: 'center',
        borderBottomColor: '#27272A',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: (0, responsive_1.s)(12),
        paddingVertical: (0, responsive_1.vs)(8),
    },
    headerActionButton: {
        alignItems: 'center',
        backgroundColor: '#27272A',
        borderRadius: (0, responsive_1.ms)(6),
        flexDirection: 'row',
        marginLeft: (0, responsive_1.s)(8),
        paddingHorizontal: (0, responsive_1.s)(10),
        paddingVertical: (0, responsive_1.vs)(5),
    },
    headerActionText: {
        color: '#60A5FA',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(4),
    },
    headerActions: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    keyText: {
        color: '#93C5FD',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginRight: (0, responsive_1.s)(6),
    },
    keyValueRow: {
        borderBottomColor: '#27272A',
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: (0, responsive_1.vs)(6),
    },
    methodPill: {
        backgroundColor: '#2563EB',
        borderRadius: (0, responsive_1.ms)(4),
        marginRight: (0, responsive_1.s)(8),
        paddingHorizontal: (0, responsive_1.s)(6),
        paddingVertical: (0, responsive_1.vs)(2),
    },
    methodPillText: {
        color: '#FFFFFF',
        fontSize: (0, responsive_1.fs)(11),
        fontWeight: '700',
    },
    scrollContent: {
        padding: (0, responsive_1.ms)(12),
        paddingBottom: (0, responsive_1.vs)(40),
    },
    sectionHeader: {
        marginBottom: (0, responsive_1.vs)(6),
    },
    sectionHeaderWithAction: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: (0, responsive_1.vs)(6),
    },
    sectionTitle: {
        color: '#9CA3AF',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusBadgeRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    statusBanner: {
        backgroundColor: '#1E1E1E',
        borderColor: '#2A2A2A',
        borderRadius: (0, responsive_1.ms)(8),
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: (0, responsive_1.vs)(12),
        paddingVertical: (0, responsive_1.vs)(10),
    },
    statusLabel: {
        color: '#9CA3AF',
        fontSize: (0, responsive_1.fs)(12),
        marginRight: (0, responsive_1.s)(6),
    },
    statusVal: {
        color: '#F9FAFB',
        fontSize: (0, responsive_1.fs)(13),
        fontWeight: '700',
    },
    tabBar: {
        backgroundColor: '#18181B',
        borderBottomColor: '#27272A',
        borderBottomWidth: 1,
        flexDirection: 'row',
    },
    tabItem: {
        alignItems: 'center',
        borderBottomColor: 'transparent',
        borderBottomWidth: 2,
        flex: 1,
        justifyContent: 'center',
        paddingVertical: (0, responsive_1.vs)(10),
    },
    tabItemActive: {
        borderBottomColor: '#3B82F6',
    },
    tabItemText: {
        color: '#71717A',
        fontSize: (0, responsive_1.fs)(13),
        fontWeight: '600',
    },
    tabItemTextActive: {
        color: '#3B82F6',
    },
    tokenButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: '#F59E0B',
        borderRadius: (0, responsive_1.ms)(6),
        borderWidth: 1,
        flexDirection: 'row',
        marginLeft: (0, responsive_1.s)(8),
        paddingHorizontal: (0, responsive_1.s)(10),
        paddingVertical: (0, responsive_1.vs)(5),
    },
    tokenButtonText: {
        color: '#FBBF24',
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '600',
        marginLeft: (0, responsive_1.s)(4),
    },
    urlBanner: {
        backgroundColor: '#18181B',
        borderBottomColor: '#27272A',
        borderBottomWidth: 1,
        paddingHorizontal: (0, responsive_1.s)(12),
        paddingVertical: (0, responsive_1.vs)(10),
    },
    urlRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    urlText: {
        color: '#F4F4F5',
        flex: 1,
        fontSize: (0, responsive_1.fs)(12),
        fontWeight: '500',
    },
    valText: {
        color: '#E4E4E7',
        flex: 1,
        fontSize: (0, responsive_1.fs)(12),
    },
});
