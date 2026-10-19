import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { copyToClipboard, extractAuthToken } from '../clipboardHelper';
import { generateCurlCommand } from '../curlHelper';
import { fs, ms, s, vs } from '../utils/responsive';
import { ChevronLeftIcon, CopyIcon, KeyIcon } from './Icons';
const safeFormatJson = (data) => {
    if (data === undefined || data === null) {
        return 'Empty';
    }
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return JSON.stringify(parsed, null, 2);
        }
        catch {
            return data;
        }
    }
    try {
        return JSON.stringify(data, null, 2);
    }
    catch {
        return String(data);
    }
};
export const RequestDetailView = ({ log, onBack }) => {
    const [activeTab, setActiveTab] = useState('RESPONSE');
    const curlCommand = useMemo(() => generateCurlCommand(log), [log]);
    const authToken = useMemo(() => extractAuthToken(log.headers) || extractAuthToken(log.response?.headers), [log.headers, log.response?.headers]);
    const handleCopyCurl = useCallback(async () => {
        const success = await copyToClipboard(curlCommand);
        if (success) {
            Alert.alert('Copied', 'cURL command copied to clipboard!');
        }
    }, [curlCommand]);
    const handleCopyToken = useCallback(async () => {
        if (!authToken) {
            return;
        }
        const success = await copyToClipboard(authToken);
        if (success) {
            Alert.alert('Token Copied', 'Clean Authorization token copied to clipboard!');
        }
    }, [authToken]);
    const handleCopyText = useCallback(async (text, label) => {
        const success = await copyToClipboard(text);
        if (success) {
            Alert.alert('Copied', `${label} copied to clipboard!`);
        }
    }, []);
    const formattedRequestBody = useMemo(() => safeFormatJson(log.body), [log.body]);
    const formattedResponseBody = useMemo(() => safeFormatJson(log.response?.body), [log.response?.body]);
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsxs(TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 12, bottom: 12, left: 10, right: 10 }, onPress: onBack, style: styles.backButton, children: [_jsx(ChevronLeftIcon, { color: "#3B82F6", size: s(16) }), _jsx(Text, { style: styles.backButtonText, children: "Back" })] }), _jsxs(View, { style: styles.headerActions, children: [authToken ? (_jsxs(TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 8, bottom: 8, left: 4, right: 4 }, onPress: handleCopyToken, style: styles.tokenButton, children: [_jsx(KeyIcon, { color: "#FBBF24", size: s(12) }), _jsx(Text, { style: styles.tokenButtonText, children: "Token" })] })) : null, _jsxs(TouchableOpacity, { activeOpacity: 0.7, hitSlop: { top: 8, bottom: 8, left: 4, right: 4 }, onPress: handleCopyCurl, style: styles.headerActionButton, children: [_jsx(CopyIcon, { color: "#60A5FA", size: s(12) }), _jsx(Text, { style: styles.headerActionText, children: "cURL" })] })] })] }), _jsx(View, { style: styles.urlBanner, children: _jsxs(View, { style: styles.urlRow, children: [_jsx(View, { style: styles.methodPill, children: _jsx(Text, { style: styles.methodPillText, children: log.method }) }), _jsx(Text, { numberOfLines: 2, style: styles.urlText, children: log.url })] }) }), _jsxs(View, { style: styles.tabBar, children: [_jsx(TouchableOpacity, { activeOpacity: 0.8, onPress: () => setActiveTab('REQUEST'), style: [styles.tabItem, activeTab === 'REQUEST' && styles.tabItemActive], children: _jsx(Text, { style: [styles.tabItemText, activeTab === 'REQUEST' && styles.tabItemTextActive], children: "Request" }) }), _jsx(TouchableOpacity, { activeOpacity: 0.8, onPress: () => setActiveTab('RESPONSE'), style: [styles.tabItem, activeTab === 'RESPONSE' && styles.tabItemActive], children: _jsx(Text, { style: [styles.tabItemText, activeTab === 'RESPONSE' && styles.tabItemTextActive], children: "Response" }) }), _jsx(TouchableOpacity, { activeOpacity: 0.8, onPress: () => setActiveTab('CURL'), style: [styles.tabItem, activeTab === 'CURL' && styles.tabItemActive], children: _jsx(Text, { style: [styles.tabItemText, activeTab === 'CURL' && styles.tabItemTextActive], children: "cURL" }) })] }), _jsxs(ScrollView, { contentContainerStyle: styles.scrollContent, style: styles.contentScroll, children: [activeTab === 'REQUEST' && (_jsxs(View, { children: [_jsx(View, { style: styles.sectionHeader, children: _jsx(Text, { style: styles.sectionTitle, children: "Request Headers" }) }), _jsx(View, { style: styles.card, children: log.headers && Object.keys(log.headers).length > 0 ? (Object.entries(log.headers).map(([k, v]) => (_jsxs(TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(`${k}: ${v}`, 'Header'), style: styles.keyValueRow, children: [_jsxs(Text, { style: styles.keyText, children: [k, ":"] }), _jsx(Text, { style: styles.valText, children: String(v) })] }, k)))) : (_jsx(Text, { style: styles.emptyText, children: "No request headers" })) }), log.queryParameters && Object.keys(log.queryParameters).length > 0 ? (_jsxs(View, { children: [_jsx(View, { style: styles.sectionHeader, children: _jsx(Text, { style: styles.sectionTitle, children: "Query Parameters" }) }), _jsx(View, { style: styles.card, children: Object.entries(log.queryParameters).map(([k, v]) => (_jsxs(View, { style: styles.keyValueRow, children: [_jsxs(Text, { style: styles.keyText, children: [k, ":"] }), _jsx(Text, { style: styles.valText, children: String(v) })] }, k))) })] })) : null, _jsxs(View, { style: styles.sectionHeaderWithAction, children: [_jsx(Text, { style: styles.sectionTitle, children: "Request Body" }), formattedRequestBody !== 'Empty' ? (_jsx(TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(formattedRequestBody, 'Request Body'), style: styles.copySmallButton, children: _jsx(Text, { style: styles.copySmallButtonText, children: "Copy Body" }) })) : null] }), _jsx(View, { style: styles.card, children: _jsx(Text, { selectable: true, style: styles.codeText, children: formattedRequestBody }) })] })), activeTab === 'RESPONSE' && (_jsxs(View, { children: [_jsxs(View, { style: styles.statusBanner, children: [_jsxs(View, { style: styles.statusBadgeRow, children: [_jsx(Text, { style: styles.statusLabel, children: "Status:" }), _jsx(Text, { style: styles.statusVal, children: log.response?.statusCode ?? (log.status === 'pending' ? 'Pending' : 'Error') })] }), _jsxs(View, { style: styles.statusBadgeRow, children: [_jsx(Text, { style: styles.statusLabel, children: "Duration:" }), _jsx(Text, { style: styles.statusVal, children: log.response?.durationMs !== undefined ? `${log.response.durationMs} ms` : '...' })] })] }), log.response?.error ? (_jsxs(View, { style: styles.errorBanner, children: [_jsx(Text, { style: styles.errorBannerTitle, children: "Error Details" }), _jsx(Text, { style: styles.errorBannerText, children: log.response.error })] })) : null, _jsx(View, { style: styles.sectionHeader, children: _jsx(Text, { style: styles.sectionTitle, children: "Response Headers" }) }), _jsx(View, { style: styles.card, children: log.response?.headers && Object.keys(log.response.headers).length > 0 ? (Object.entries(log.response.headers).map(([k, v]) => (_jsxs(TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(`${k}: ${v}`, 'Response Header'), style: styles.keyValueRow, children: [_jsxs(Text, { style: styles.keyText, children: [k, ":"] }), _jsx(Text, { style: styles.valText, children: String(v) })] }, k)))) : (_jsx(Text, { style: styles.emptyText, children: "No response headers" })) }), _jsxs(View, { style: styles.sectionHeaderWithAction, children: [_jsx(Text, { style: styles.sectionTitle, children: "Response Body" }), formattedResponseBody !== 'Empty' ? (_jsx(TouchableOpacity, { activeOpacity: 0.7, onPress: () => handleCopyText(formattedResponseBody, 'Response Body'), style: styles.copySmallButton, children: _jsx(Text, { style: styles.copySmallButtonText, children: "Copy Body" }) })) : null] }), _jsx(View, { style: styles.card, children: _jsx(Text, { selectable: true, style: styles.codeText, children: formattedResponseBody }) })] })), activeTab === 'CURL' && (_jsxs(View, { children: [_jsx(View, { style: styles.sectionHeader, children: _jsx(Text, { style: styles.sectionTitle, children: "cURL Command" }) }), _jsx(View, { style: styles.codeBox, children: _jsx(Text, { selectable: true, style: styles.curlText, children: curlCommand }) }), _jsxs(TouchableOpacity, { activeOpacity: 0.8, onPress: handleCopyCurl, style: styles.copyCurlButton, children: [_jsx(CopyIcon, { color: "#FFFFFF", size: s(14) }), _jsx(Text, { style: styles.copyCurlButtonText, children: "Copy cURL to Clipboard" })] })] }))] })] }));
};
const styles = StyleSheet.create({
    backButton: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: s(8),
        paddingVertical: vs(6),
    },
    backButtonText: {
        color: '#3B82F6',
        fontSize: fs(15),
        fontWeight: '600',
        marginLeft: s(4),
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderColor: '#2A2A2A',
        borderRadius: ms(8),
        borderWidth: 1,
        marginBottom: vs(12),
        padding: ms(12),
    },
    codeBox: {
        backgroundColor: '#18181B',
        borderColor: '#27272A',
        borderRadius: ms(8),
        borderWidth: 1,
        marginBottom: vs(16),
        padding: ms(14),
    },
    codeText: {
        color: '#A1A1AA',
        fontFamily: 'Courier',
        fontSize: fs(12),
        lineHeight: vs(18),
    },
    contentScroll: {
        flex: 1,
    },
    copyCurlButton: {
        alignItems: 'center',
        backgroundColor: '#2563EB',
        borderRadius: ms(8),
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: vs(12),
    },
    copyCurlButtonText: {
        color: '#FFFFFF',
        fontSize: fs(14),
        fontWeight: '600',
        marginLeft: s(6),
    },
    copySmallButton: {
        backgroundColor: '#374151',
        borderRadius: ms(4),
        paddingHorizontal: s(8),
        paddingVertical: vs(3),
    },
    copySmallButtonText: {
        color: '#D1D5DB',
        fontSize: fs(11),
        fontWeight: '500',
    },
    curlText: {
        color: '#60A5FA',
        fontFamily: 'Courier',
        fontSize: fs(12),
        lineHeight: vs(19),
    },
    container: {
        backgroundColor: '#121212',
        flex: 1,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: fs(12),
        fontStyle: 'italic',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: '#EF4444',
        borderRadius: ms(8),
        borderWidth: 1,
        marginBottom: vs(12),
        padding: ms(10),
    },
    errorBannerText: {
        color: '#FCA5A5',
        fontSize: fs(12),
    },
    errorBannerTitle: {
        color: '#EF4444',
        fontSize: fs(12),
        fontWeight: '700',
        marginBottom: vs(2),
    },
    header: {
        alignItems: 'center',
        borderBottomColor: '#27272A',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: s(12),
        paddingVertical: vs(8),
    },
    headerActionButton: {
        alignItems: 'center',
        backgroundColor: '#27272A',
        borderRadius: ms(6),
        flexDirection: 'row',
        marginLeft: s(8),
        paddingHorizontal: s(10),
        paddingVertical: vs(5),
    },
    headerActionText: {
        color: '#60A5FA',
        fontSize: fs(12),
        fontWeight: '600',
        marginLeft: s(4),
    },
    headerActions: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    keyText: {
        color: '#93C5FD',
        fontSize: fs(12),
        fontWeight: '600',
        marginRight: s(6),
    },
    keyValueRow: {
        borderBottomColor: '#27272A',
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: vs(6),
    },
    methodPill: {
        backgroundColor: '#2563EB',
        borderRadius: ms(4),
        marginRight: s(8),
        paddingHorizontal: s(6),
        paddingVertical: vs(2),
    },
    methodPillText: {
        color: '#FFFFFF',
        fontSize: fs(11),
        fontWeight: '700',
    },
    scrollContent: {
        padding: ms(12),
        paddingBottom: vs(40),
    },
    sectionHeader: {
        marginBottom: vs(6),
    },
    sectionHeaderWithAction: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: vs(6),
    },
    sectionTitle: {
        color: '#9CA3AF',
        fontSize: fs(12),
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
        borderRadius: ms(8),
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: vs(12),
        paddingVertical: vs(10),
    },
    statusLabel: {
        color: '#9CA3AF',
        fontSize: fs(12),
        marginRight: s(6),
    },
    statusVal: {
        color: '#F9FAFB',
        fontSize: fs(13),
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
        paddingVertical: vs(10),
    },
    tabItemActive: {
        borderBottomColor: '#3B82F6',
    },
    tabItemText: {
        color: '#71717A',
        fontSize: fs(13),
        fontWeight: '600',
    },
    tabItemTextActive: {
        color: '#3B82F6',
    },
    tokenButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: '#F59E0B',
        borderRadius: ms(6),
        borderWidth: 1,
        flexDirection: 'row',
        marginLeft: s(8),
        paddingHorizontal: s(10),
        paddingVertical: vs(5),
    },
    tokenButtonText: {
        color: '#FBBF24',
        fontSize: fs(12),
        fontWeight: '600',
        marginLeft: s(4),
    },
    urlBanner: {
        backgroundColor: '#18181B',
        borderBottomColor: '#27272A',
        borderBottomWidth: 1,
        paddingHorizontal: s(12),
        paddingVertical: vs(10),
    },
    urlRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    urlText: {
        color: '#F4F4F5',
        flex: 1,
        fontSize: fs(12),
        fontWeight: '500',
    },
    valText: {
        color: '#E4E4E7',
        flex: 1,
        fontSize: fs(12),
    },
});
