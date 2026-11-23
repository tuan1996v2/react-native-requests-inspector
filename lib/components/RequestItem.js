"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestItem = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const networkStore_1 = require("../networkStore");
const redact_1 = require("../utils/redact");
const responsive_1 = require("../utils/responsive");
const Icons_1 = require("./Icons");
const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    const pad = (n) => (n < 10 ? `0${n}` : String(n));
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
exports.RequestItem = (0, react_1.memo)(({ log, onPress }) => {
    const redactKeys = (0, networkStore_1.useNetworkStore)(state => state.redactKeys);
    const displayUrl = (0, react_1.useMemo)(() => (0, redact_1.redactUrl)(log.url, redactKeys), [log.url, redactKeys]);
    const methodStyle = (0, react_1.useMemo)(() => {
        switch (log.method) {
            case 'GET':
                return styles.methodGet;
            case 'POST':
                return styles.methodPost;
            case 'PUT':
                return styles.methodPut;
            case 'PATCH':
                return styles.methodPatch;
            case 'DELETE':
                return styles.methodDelete;
            default:
                return styles.methodDefault;
        }
    }, [log.method]);
    const statusStyle = (0, react_1.useMemo)(() => {
        if (log.status === 'pending') {
            return styles.statusPending;
        }
        const code = log.response?.statusCode ?? 0;
        if (code >= 200 && code < 300) {
            return styles.status2xx;
        }
        if (code >= 300 && code < 400) {
            return styles.status3xx;
        }
        return styles.statusError;
    }, [log.status, log.response?.statusCode]);
    const statusText = (0, react_1.useMemo)(() => {
        if (log.status === 'pending') {
            return 'PENDING';
        }
        if (log.response?.statusCode) {
            return String(log.response.statusCode);
        }
        return 'ERR';
    }, [log.status, log.response?.statusCode]);
    const durationText = (0, react_1.useMemo)(() => {
        if (log.response?.durationMs !== undefined) {
            return `${log.response.durationMs} ms`;
        }
        return '...';
    }, [log.response?.durationMs]);
    const durationStyle = (0, react_1.useMemo)(() => {
        const msVal = log.response?.durationMs;
        if (msVal === undefined) {
            return styles.durationNeutral;
        }
        if (msVal < 500) {
            return styles.durationFast;
        }
        if (msVal < 1500) {
            return styles.durationMedium;
        }
        return styles.durationSlow;
    }, [log.response?.durationMs]);
    const formattedUrl = (0, react_1.useMemo)(() => {
        try {
            const parsed = new URL(displayUrl);
            return {
                host: parsed.host,
                path: parsed.pathname + parsed.search,
            };
        }
        catch {
            return {
                host: '',
                path: displayUrl,
            };
        }
    }, [displayUrl]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.7, onPress: () => onPress(log), style: styles.cardContainer, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.topRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.badgeGroup, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.methodBadge, methodStyle], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.methodText, children: log.method }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.statusBadge, statusStyle], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.statusText, children: statusText }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.timeGroup, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.durationText, durationStyle], children: durationText }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.timestampText, children: formatTime(log.sentTime) })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.urlContainer, children: [formattedUrl.host ? (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.hostText, children: formattedUrl.host }) : null, (0, jsx_runtime_1.jsx)(react_native_1.Text, { numberOfLines: 2, style: styles.pathText, children: formattedUrl.path })] }), log.response?.error ? ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.errorRow, children: [(0, jsx_runtime_1.jsx)(Icons_1.WarningIcon, { color: "#F87171", size: (0, responsive_1.s)(12) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { numberOfLines: 1, style: styles.errorText, children: log.response.error })] })) : null] }));
});
exports.RequestItem.displayName = 'RequestItem';
const styles = react_native_1.StyleSheet.create({
    badgeGroup: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    cardContainer: {
        backgroundColor: '#1E1E1E',
        borderColor: '#2A2A2A',
        borderRadius: (0, responsive_1.ms)(10),
        borderWidth: 1,
        marginBottom: (0, responsive_1.vs)(8),
        marginHorizontal: (0, responsive_1.s)(12),
        padding: (0, responsive_1.ms)(13),
    },
    durationFast: {
        color: '#34D399',
    },
    durationMedium: {
        color: '#FBBF24',
    },
    durationNeutral: {
        color: '#9CA3AF',
    },
    durationSlow: {
        color: '#F87171',
    },
    durationText: {
        fontSize: (0, responsive_1.fs)(11),
        fontWeight: '600',
        marginRight: (0, responsive_1.s)(8),
    },
    errorRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: (0, responsive_1.vs)(5),
    },
    errorText: {
        color: '#F87171',
        flex: 1,
        fontSize: (0, responsive_1.fs)(11),
        marginLeft: (0, responsive_1.s)(4),
    },
    hostText: {
        color: '#6B7280',
        fontSize: (0, responsive_1.fs)(11),
        marginBottom: (0, responsive_1.vs)(2),
    },
    methodBadge: {
        borderRadius: (0, responsive_1.ms)(4),
        marginRight: (0, responsive_1.s)(6),
        paddingHorizontal: (0, responsive_1.s)(6),
        paddingVertical: (0, responsive_1.vs)(2),
    },
    methodDefault: {
        backgroundColor: '#4B5563',
    },
    methodDelete: {
        backgroundColor: '#DC2626',
    },
    methodGet: {
        backgroundColor: '#2563EB',
    },
    methodPatch: {
        backgroundColor: '#0D9488',
    },
    methodPost: {
        backgroundColor: '#D97706',
    },
    methodPut: {
        backgroundColor: '#9333EA',
    },
    methodText: {
        color: '#FFFFFF',
        fontSize: (0, responsive_1.fs)(10),
        fontWeight: '700',
    },
    pathText: {
        color: '#F3F4F6',
        fontSize: (0, responsive_1.fs)(13),
        fontWeight: '500',
        lineHeight: (0, responsive_1.vs)(18),
    },
    status2xx: {
        backgroundColor: '#059669',
    },
    status3xx: {
        backgroundColor: '#D97706',
    },
    statusBadge: {
        borderRadius: (0, responsive_1.ms)(4),
        paddingHorizontal: (0, responsive_1.s)(6),
        paddingVertical: (0, responsive_1.vs)(2),
    },
    statusError: {
        backgroundColor: '#DC2626',
    },
    statusPending: {
        backgroundColor: '#374151',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: (0, responsive_1.fs)(10),
        fontWeight: '700',
    },
    timeGroup: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    timestampText: {
        color: '#6B7280',
        fontSize: (0, responsive_1.fs)(10),
    },
    topRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: (0, responsive_1.vs)(6),
    },
    urlContainer: {
        marginTop: (0, responsive_1.vs)(2),
    },
});
